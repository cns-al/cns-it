import express from 'express';
import cookieParser from 'cookie-parser';
import { initializeDatabase, shutdownDatabase } from './config/database.js';
import snippetRoutes from './routes/snippetRoutes.js';
import authRoutes from './routes/authRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { authenticateToken } from './middleware/auth.js';
import { authenticateApiKey } from './middleware/apiKeyAuth.js';
import { requireAdmin } from './middleware/adminAuth.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import Logger from './logger.js';

const app = express();
const PORT = 5000;

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.set('trust proxy', true);

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
app.use(`${basePath}/api/share`, shareRoutes);
app.use(`${basePath}/api/public/snippets`, publicRoutes);
app.use(`${basePath}/api/admin`, authenticateToken, requireAdmin, adminRoutes);

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
