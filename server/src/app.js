import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { initializeDatabase, shutdownDatabase } from './config/database.js';
import snippetRoutes from './routes/snippetRoutes.js';
import authRoutes from './routes/authRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import diagramRoutes from './routes/diagramRoutes.js';
import { authenticateToken } from './middleware/auth.js';
import { authenticateApiKey } from './middleware/apiKeyAuth.js';
import { requireAdmin } from './middleware/adminAuth.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import Logger from './logger.js';

// draw.io proxy configuration
const DRAWIO_HOST = process.env.DRAWIO_HOST || 'cns-drawio';
const DRAWIO_PORT = process.env.DRAWIO_PORT || 8080;

// CDN proxy for draw.io shape libraries (network, cisco, aws, azure, etc.)
// draw.io loads library XML from jgraph.github.io — we proxy it locally
const DRAWIO_LIBS_HOST = 'jgraph.github.io';
const DRAWIO_LIBS_PATH = '/drawio-libs';

function proxyDrawioLibs(req, res) {
  const basePath = process.env.BASE_PATH || '';
  const originalUrl = req.originalUrl.replace(new RegExp(`^${basePath}/drawio-libs`), '');
  const options = {
    hostname: DRAWIO_LIBS_HOST,
    port: 443,
    path: originalUrl || '/',
    method: req.method,
    headers: {
      ...req.headers,
      host: DRAWIO_LIBS_HOST
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const headers = { ...proxyRes.headers };
    // Allow caching for library files
    headers['cache-control'] = 'public, max-age=86400';
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    Logger.error('draw.io libs proxy error:', err);
    res.status(502).json({ error: 'Shape libraries unavailable' });
  });

  req.pipe(proxyReq);
}

// CSS to rebrand draw.io (injected into HTML responses, may be removed by draw.io JS)
// Actual branding is handled by DiagramPage.tsx injecting CSS into the iframe
const CNS_DRAWIO_CSS = `
 <style>
   .geLogo, .geLogoLink, .geLogoImg, .geLogoSvg,
   img[src*="logo"], img[src*="drawio"],
   .geFooter, .geFooterLink,
   .geSplash, .geSplashLogo,
   .geSplash h1, .geSplash p,
   h1.geTitle, .geTitle,
   #geInfo h1, #geInfo p:first-of-type,
   a[href*="drawio.com"], a[href*="diagrams.net"],
   a[href*="github.com/jgraph"],
   .geFooter a, [class*="Footer"] a,
   .geAbout, .geAboutDialog,
   .geTopToolbar > div:first-child,
   /* Hide Help menu and its dropdown */
   .geMenubar > div:last-child,
   .geMenubar > span:last-child,
   [id^="geHelp"],
   .geHelpMenu { display: none !important; }
   .geToolbar, .geTopToolbar { background: #ffffff !important; border-bottom: 1px solid #e5e7eb !important; }
   .geBtn, .gePrimaryBtn { background: #2563eb !important; border-color: #2563eb !important; }
 </style>
 `;

// Simple HTTP proxy for draw.io with HTML rebranding
function proxyDrawio(req, res) {
  const basePath = process.env.BASE_PATH || '';
  const originalUrl = req.originalUrl.replace(new RegExp(`^${basePath}/drawio`), '');
  const options = {
    hostname: DRAWIO_HOST,
    port: DRAWIO_PORT,
    path: originalUrl || '/',
    method: req.method,
    headers: {
      ...req.headers,
      host: `${DRAWIO_HOST}:${DRAWIO_PORT}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const headers = { ...proxyRes.headers };
    delete headers['x-frame-options'];
    delete headers['content-security-policy'];
    delete headers['x-xss-protection'];
    delete headers['x-content-type-options'];

    const contentType = headers['content-type'] || '';
    const isHtml = contentType.includes('text/html');

    if (isHtml) {
      const chunks = [];
      proxyRes.on('data', (chunk) => chunks.push(chunk));
      proxyRes.on('end', () => {
        let html = Buffer.concat(chunks).toString('utf-8');
        // Remove draw.io meta descriptions and name
        html = html.replace(/<meta[^>]*name=["']Description["'][^>]*>/gi, '');
        html = html.replace(/<meta[^>]*itemprop=[""]name[""][^>]*>/gi, '');
        html = html.replace(/<meta[^>]*itemprop=[""]description[""][^>]*>/gi, '');
        // Rewrite CDN/library URLs to local proxy BEFORE text replacement
        html = html.replace(/https:\/\/jgraph\.github\.io\/drawio-libs/g, '/drawio-libs');
        html = html.replace(/https:\/\/cdn\.draw\.io/g, '/draw');
        html = html.replace(/https:\/\/app\.diagrams\.net/g, '/draw');
        html = html.replace(/https:\/\/www\.draw\.io/g, '/draw');
        // Override DRAWIO_BASE_URL for local proxy
        html = html.replace(/window\.DRAWIO_BASE_URL\s*=\s*['"][^'"]*['"]/g, "window.DRAWIO_BASE_URL = ''");
        // Replace remaining draw.io text references
        html = html.replace(/draw\.io/gi, 'CNS IT');
        // Inject CSS and stencil path before main.js loads
        const stencilFix = '<script>Editor=(Editor||{});Editor.stencilPath="/draw/stencils/";</script>';
        html = html.replace('<script src="js/main.js">', stencilFix + '<script src="js/main.js">');
        if (html.includes('</head>')) {
          html = html.replace('</head>', CNS_DRAWIO_CSS + '</head>');
        } else if (html.includes('<head>')) {
          html = html.replace('<head>', '<head>' + CNS_DRAWIO_CSS);
        }
        const body = Buffer.from(html, 'utf-8');
        headers['content-length'] = body.length;
        res.writeHead(proxyRes.statusCode, headers);
        res.end(body);
      });
    } else {
      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res);
    }
  });

  proxyReq.on('error', (err) => {
    Logger.error('draw.io proxy error:', err);
    res.status(502).json({ error: 'Diagram editor unavailable' });
  });

  req.pipe(proxyReq);
}

// Simple proxy for draw.io static assets (no HTML rewriting)
function proxyDrawioAsset(req, res) {
  const basePath = process.env.BASE_PATH || '';
  let originalUrl = req.originalUrl.replace(new RegExp(`^${basePath}`), '');
  // Map /stencils/* to /draw/stencils/* on the draw.io container
  if (originalUrl.startsWith('/stencils')) {
    originalUrl = '/draw' + originalUrl;
  }
  const options = {
    hostname: DRAWIO_HOST,
    port: DRAWIO_PORT,
    path: originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${DRAWIO_HOST}:${DRAWIO_PORT}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const headers = { ...proxyRes.headers };
    delete headers['x-frame-options'];
    delete headers['content-security-policy'];
    // Inject stencil path fix into PreConfig.js
    if (originalUrl.includes('/PreConfig.js')) {
      const chunks = [];
      proxyRes.on('data', (chunk) => chunks.push(chunk));
      proxyRes.on('end', () => {
        let js = Buffer.concat(chunks).toString('utf-8');
        js += '\nEditor.stencilPath = \'/draw/stencils/\';\n';
        const body = Buffer.from(js, 'utf-8');
        headers['content-length'] = body.length;
        res.writeHead(proxyRes.statusCode, headers);
        res.end(body);
      });
      return;
    }
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    Logger.error('draw.io asset proxy error:', err);
    res.status(502).json({ error: 'Asset unavailable' });
  });

  req.pipe(proxyReq);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', true);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const basePath = process.env.BASE_PATH || '';
const buildPath = join(__dirname, '../../client/build');
const assetsPath = join(buildPath, 'assets');

app.use(`${basePath}/api/auth`, authRoutes);
app.use(`${basePath}/api/keys`, authenticateToken, apiKeyRoutes);
app.use(
  `${basePath}/api/snippets`,
  authenticateApiKey,
  authenticateToken,
  snippetRoutes
);
app.use(`${basePath}/api/share`, authenticateToken, shareRoutes);
app.use(`${basePath}/api/public/snippets`, publicRoutes);
app.use(`${basePath}/api/admin`, authenticateToken, requireAdmin, adminRoutes);
app.use(`${basePath}/api/diagrams`, authenticateToken, diagramRoutes);

// Proxy draw.io requests
app.all(`${basePath}/drawio/*`, proxyDrawio);
app.all(`${basePath}/drawio`, proxyDrawio);
// Proxy draw.io static assets (JS, images, etc.)
app.all(`${basePath}/js/*`, proxyDrawioAsset);
app.all(`${basePath}/images/*`, proxyDrawioAsset);
app.all(`${basePath}/mxgraph.php`, proxyDrawioAsset);
// Proxy draw.io internal paths (stencils, libs, draw/* — used by draw.io JS)
app.all(`${basePath}/draw/*`, proxyDrawioAsset);
app.all(`${basePath}/draw`, proxyDrawioAsset);
app.all(`${basePath}/stencils/*`, proxyDrawioAsset);
app.all(`${basePath}/stencils`, proxyDrawioAsset);
app.all(`${basePath}/libs/*`, proxyDrawioAsset);
// Proxy draw.io CDN libraries (jgraph.github.io/drawio-libs)
app.all(`${basePath}/drawio-libs/*`, proxyDrawioLibs);

app.get('/', (req, res, next) => {
  if (basePath) {
    return res.redirect(basePath);
  }
  next();
});

app.use(`${basePath}/assets`, express.static(assetsPath));
app.use(`${basePath}/monacoeditorwork`, express.static(join(buildPath, 'monacoeditorwork')));
app.use(basePath, express.static(buildPath, { index: false }));

app.get(`${basePath}/*`, (req, res, next) => {
  if (req.url.startsWith(`${basePath}/api`)) {
    return next();
  }

  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });

  fs.readFile(join(buildPath, 'index.html'), 'utf8', (err, data) => {
    if (err) {
      Logger.error('Failed to read index.html:', err);
      return res.status(500).send('Error loading CNS IT');
    }

    const modifiedHtml = data
      .replace(/(src|href)="\/assets\//g, `$1="${basePath}/assets/`)
      .replace(/\/monacoeditorwork\//g, `${basePath}/monacoeditorwork/`)
      .replace(/(href)="\/manifest\.json"/g, `$1="${basePath}/manifest.json"`)
      .replace(/(href)="\/favicon\.ico"/g, `$1="${basePath}/favicon.ico"`);

    const scriptInjection = `<script>window.__BASE_PATH__ = "${basePath}";</script>`;
    const injectedHtml = modifiedHtml.replace('</head>', `${scriptInjection}</head>`);

    res.send(injectedHtml);
  });
});

function handleShutdown() {
  Logger.info('Received shutdown signal, starting graceful shutdown...');
  shutdownDatabase();
  process.exit(0);
}

(async () => {
  await initializeDatabase();

  return new Promise((resolve) => {
    app.listen(PORT, () => {
      Logger.info(`CNS IT Server running on port ${PORT}`);
      resolve();
    });
  });
})();

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
