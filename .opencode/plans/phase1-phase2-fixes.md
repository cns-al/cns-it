# CNS IT — Phase 1 + Phase 2 Security & Reliability Fixes

## Overview
This plan fixes all CRITICAL security vulnerabilities (Phase 1) and HIGH/MEDIUM reliability issues (Phase 2) identified in the production audit. Apply in order.

---

## Phase 1 — CRITICAL Security Fixes

### Fix 1: IDOR in `snippetRepository.js` — `findById` ignores `userId`

**File:** `server/src/repositories/snippetRepository.js`
**Lines:** 42-49

**OLD:**
```javascript
  async findById(id, userId) {
    const db = getDb();
    const snippet = db.prepare(`
      SELECT s.*, u.username
      FROM snippets s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(id);
```

**NEW:**
```javascript
  async findById(id, userId) {
    const db = getDb();
    const snippet = db.prepare(`
      SELECT s.*, u.username
      FROM snippets s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND (s.user_id = ? OR s.is_public = 1)
    `).get(id, userId);
```

**Rationale:** Without ownership check, any authenticated user can read any snippet by guessing the ID. The fix adds `s.user_id = ? OR s.is_public = 1` and passes `userId` as the second parameter.

---

### Fix 2: Missing ownership checks in `shareRepository.js`

**File:** `server/src/repositories/shareRepository.js`
**Lines:** 14-24

**OLD:**
```javascript
  async getBySnippetId(snippetId, userId) {
    const db = getDb();
    return db.prepare(
      'SELECT * FROM shares WHERE snippet_id = ? ORDER BY created_at DESC'
    ).all(snippetId);
  },

  async delete(shareId, snippetId, userId) {
    const db = getDb();
    return db.prepare('DELETE FROM shares WHERE id = ? AND snippet_id = ?').run(shareId, snippetId);
  }
```

**NEW:**
```javascript
  async getBySnippetId(snippetId, userId) {
    const db = getDb();
    return db.prepare(
      'SELECT sh.* FROM shares sh JOIN snippets s ON sh.snippet_id = s.id WHERE sh.snippet_id = ? AND s.user_id = ? ORDER BY sh.created_at DESC'
    ).all(snippetId, userId);
  },

  async delete(shareId, snippetId, userId) {
    const db = getDb();
    return db.prepare('DELETE FROM shares WHERE id = ? AND snippet_id = ? AND snippet_id IN (SELECT id FROM snippets WHERE user_id = ?)').run(shareId, snippetId, userId);
  }
```

**Rationale:** Both methods accept `userId` but never use it. Any user can list/delete shares for any snippet.

---

### Fix 3: Hardcoded JWT secret fallback in `auth.js`

**File:** `server/src/middleware/auth.js`
**Line:** 16

**OLD:**
```javascript
  return process.env.JWT_SECRET || 'cns-it-secret-key';
```

**NEW:**
```javascript
  if (!process.env.JWT_SECRET) { Logger.error('JWT_SECRET is not set; refusing to start'); process.exit(1); } return process.env.JWT_SECRET;
```

**Rationale:** A hardcoded fallback secret allows anyone with access to the source code to forge valid JWT tokens. The server must refuse to start without a configured secret.

---

### Fix 4: Operator precedence bug in `authRoutes.js`

**File:** `server/src/routes/authRoutes.js`
**Line:** 60

**OLD:**
```javascript
    if (!ALLOW_NEW_ACCOUNTS && !(await userRepository.count()) === 0) {
```

**NEW:**
```javascript
    if (!ALLOW_NEW_ACCOUNTS && (await userRepository.count()) > 0) {
```

**Rationale:** `!(await userRepository.count())` converts a number to boolean (0→true, anything else→false), then `!true===0` is always `false`. The registration-disabled check never triggers. Corrected to `> 0`.

---

### Fix 5: XSS via `dangerouslySetInnerHTML` in `ToolViewPage.tsx`

**File:** `client/src/pages/ToolViewPage.tsx`
**Lines:** 1114-1123

**OLD:**
```javascript
  try {
    html = input
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/`(.*)`/g, '<code class="px-1.5 py-0.5 rounded bg-dark-100 dark:bg-dark-800">$1</code>')
      .replace(/\n/g, '<br/>');
```

**NEW:**
```javascript
  try {
    const escaped = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    html = escaped
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/`(.*)`/g, '<code class="px-1.5 py-0.5 rounded bg-dark-100 dark:bg-dark-800">$1</code>')
      .replace(/\n/g, '<br/>');
```

**Rationale:** Raw user input passes through regex replacements without escaping, then renders as HTML. An input like `<img src=x onerror=alert(1)>` executes as JavaScript. Escaping `&<>"` before transformations prevents injection.

---

## Phase 2 — Reliability Fixes

### Fix 6: Rate limiting + XML size validation in `diagramRoutes.js`

**File:** `server/src/routes/diagramRoutes.js`

**6a — Add import + limiter (lines 1-5):**

**OLD:**
```javascript
import express from 'express';
import { getDb } from '../config/database.js';
import Logger from '../logger.js';

const router = express.Router();
```

**NEW:**
```javascript
import express from 'express';
import { getDb } from '../config/database.js';
import Logger from '../logger.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();
const diagramLimiter = rateLimit({ max: 30, windowMs: 60_000 });
```

**6b — Add limiter to all 5 route handlers:**

| Line | OLD | NEW |
|------|-----|-----|
| 8 | `router.get('/', async (req, res) => {` | `router.get('/', diagramLimiter, async (req, res) => {` |
| 26 | `router.post('/', async (req, res) => {` | `router.post('/', diagramLimiter, async (req, res) => {` |
| 46 | `router.get('/:id', async (req, res) => {` | `router.get('/:id', diagramLimiter, async (req, res) => {` |
| 63 | `router.put('/:id', async (req, res) => {` | `router.put('/:id', diagramLimiter, async (req, res) => {` |
| 92 | `router.delete('/:id', async (req, res) => {` | `router.delete('/:id', diagramLimiter, async (req, res) => {` |

**6c — Add XML size validation to POST (after line 31):**

**OLD:**
```javascript
    const { title, xml_data } = req.body;
    if (!xml_data) {
      return res.status(400).json({ error: 'Diagram data required' });
    }
```

**NEW:**
```javascript
    const { title, xml_data } = req.body;
    if (!xml_data) {
      return res.status(400).json({ error: 'Diagram data required' });
    }
    if (typeof xml_data === 'string' && xml_data.length > 5_000_000) {
      return res.status(413).json({ error: 'Diagram XML too large (max 5MB)' });
    }
```

**6d — Add XML size validation to PUT (after line 66):**

**OLD:**
```javascript
    const { title, xml_data } = req.body;
    const existing = db.prepare(
```

**NEW:**
```javascript
    const { title, xml_data } = req.body;
    if (xml_data !== undefined && typeof xml_data === 'string' && xml_data.length > 5_000_000) {
      return res.status(413).json({ error: 'Diagram XML too large (max 5MB)' });
    }
    const existing = db.prepare(
```

---

### Fix 7: Rate limiting in `snippetRoutes.js`

**File:** `server/src/routes/snippetRoutes.js`

**7a — Add import + limiter (lines 1-5):**

**OLD:**
```javascript
import express from 'express';
import snippetRepository from '../repositories/snippetRepository.js';
import Logger from '../logger.js';

const router = express.Router();
```

**NEW:**
```javascript
import express from 'express';
import snippetRepository from '../repositories/snippetRepository.js';
import Logger from '../logger.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();
const snippetWriteLimiter = rateLimit({ max: 20, windowMs: 60_000 });
```

**7b — Add limiter to write routes:**

| Line | OLD | NEW |
|------|-----|-----|
| 80 | `router.post('/', async (req, res) => {` | `router.post('/', snippetWriteLimiter, async (req, res) => {` |
| 125 | `router.put('/:id', async (req, res) => {` | `router.put('/:id', snippetWriteLimiter, async (req, res) => {` |
| 140 | `router.delete('/:id', async (req, res) => {` | `router.delete('/:id', snippetWriteLimiter, async (req, res) => {` |

---

### Fix 8: Rate limiting in `adminRoutes.js`

**File:** `server/src/routes/adminRoutes.js`

**8a — Add import + limiter (lines 1-5):**

**OLD:**
```javascript
import express from 'express';
import userRepository from '../repositories/userRepository.js';
import snippetRepository from '../repositories/snippetRepository.js';

const router = express.Router();
```

**NEW:**
```javascript
import express from 'express';
import userRepository from '../repositories/userRepository.js';
import snippetRepository from '../repositories/snippetRepository.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();
const adminLimiter = rateLimit({ max: 30, windowMs: 60_000 });
```

**8b — Add `adminLimiter` to all 9 route handlers:**

| Line | OLD | NEW |
|------|-----|-----|
| 7 | `router.get('/users', async (req, res) => {` | `router.get('/users', adminLimiter, async (req, res) => {` |
| 16 | `router.get('/users/pending', async (req, res) => {` | `router.get('/users/pending', adminLimiter, async (req, res) => {` |
| 25 | `router.put('/users/:id/approve', async (req, res) => {` | `router.put('/users/:id/approve', adminLimiter, async (req, res) => {` |
| 34 | `router.put('/users/:id/reject', async (req, res) => {` | `router.put('/users/:id/reject', adminLimiter, async (req, res) => {` |
| 46 | `router.put('/users/:id/activate', async (req, res) => {` | `router.put('/users/:id/activate', adminLimiter, async (req, res) => {` |
| 55 | `router.put('/users/:id/deactivate', async (req, res) => {` | `router.put('/users/:id/deactivate', adminLimiter, async (req, res) => {` |
| 64 | `router.put('/users/:id/make-admin', async (req, res) => {` | `router.put('/users/:id/make-admin', adminLimiter, async (req, res) => {` |
| 73 | `router.put('/users/:id/demote', async (req, res) => {` | `router.put('/users/:id/demote', adminLimiter, async (req, res) => {` |
| 82 | `router.get('/snippets', async (req, res) => {` | `router.get('/snippets', adminLimiter, async (req, res) => {` |

---

### Fix 9: Rate limiting on change-password in `authRoutes.js`

**File:** `server/src/routes/authRoutes.js`

**9a — Add limiter constant (after line 13):**

**OLD:**
```javascript
const loginLimiter = rateLimit({ max: 5, windowMs: 15 * 60 * 1000, message: 'Too many login attempts, please try again later' });
const registerLimiter = rateLimit({ max: 3, windowMs: 15 * 60 * 1000, message: 'Too many registration attempts, please try again later' });
```

**NEW:**
```javascript
const loginLimiter = rateLimit({ max: 5, windowMs: 15 * 60 * 1000, message: 'Too many login attempts, please try again later' });
const registerLimiter = rateLimit({ max: 3, windowMs: 15 * 60 * 1000, message: 'Too many registration attempts, please try again later' });
const changePasswordLimiter = rateLimit({ max: 5, windowMs: 15 * 60 * 1000, message: 'Too many password change attempts, please try again later' });
```

**9b — Add limiter to route handler (line 124):**

**OLD:**
```javascript
router.post('/change-password', async (req, res) => {
```

**NEW:**
```javascript
router.post('/change-password', changePasswordLimiter, async (req, res) => {
```

---

### Fix 10: Missing database indexes in `database.js`

**File:** `server/src/config/database.js`
**Lines:** 120-127

**OLD:**
```javascript
    CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id);
    CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON diagrams(user_id);
    CREATE INDEX IF NOT EXISTS idx_snippets_is_public ON snippets(is_public);
    CREATE INDEX IF NOT EXISTS idx_fragments_snippet_id ON fragments(snippet_id);
    CREATE INDEX IF NOT EXISTS idx_steps_snippet_id ON steps(snippet_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
    CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(token);
```

**NEW:**
```javascript
    CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id);
    CREATE INDEX IF NOT EXISTS idx_snippets_user_expiry ON snippets(user_id, expiry_date);
    CREATE INDEX IF NOT EXISTS idx_snippets_is_public ON snippets(is_public);
    CREATE INDEX IF NOT EXISTS idx_snippets_public_expiry ON snippets(is_public, expiry_date);
    CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON diagrams(user_id);
    CREATE INDEX IF NOT EXISTS idx_fragments_snippet_id ON fragments(snippet_id);
    CREATE INDEX IF NOT EXISTS idx_fragments_snippet_language ON fragments(snippet_id, language);
    CREATE INDEX IF NOT EXISTS idx_steps_snippet_id ON steps(snippet_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_name_user ON categories(name, user_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
    CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
    CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(token);
    CREATE INDEX IF NOT EXISTS idx_shares_snippet ON shares(snippet_id);
```

**Rationale:** Adds compound indexes for recycle bin queries, public snippet filtering, language filtering, category lookups, API key lookups by user, and share lookups by snippet.

---

### Fix 11: Security headers via helmet in `app.js`

**File:** `server/src/app.js`

**11a — Add helmet import (line 2):**

**OLD:**
```javascript
import express from 'express';
import cookieParser from 'cookie-parser';
```

**NEW:**
```javascript
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
```

**11b — Add helmet middleware (before line 145):**

**OLD:**
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.set('trust proxy', true);
```

**NEW:**
```javascript
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.set('trust proxy', true);
```

**Rationale:** Helmet sets X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, etc. CSP and COEP disabled because draw.io iframe proxy and Monaco editor would be blocked.

**NOTE:** Requires `npm install helmet` in the server directory.

---

### Fix 12: `USER cnsit` in Dockerfile

**File:** `Dockerfile`
**Lines:** 39-42

**OLD:**
```dockerfile
EXPOSE 5000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server/src/app.js"]
```

**NEW:**
```dockerfile
EXPOSE 5000

USER cnsit

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server/src/app.js"]
```

**Rationale:** The `cnsit` user is created but never switched to. Without `USER cnsit`, the container runs as root.

---

### Fix 13: Docker Compose hardening

**File:** `docker-compose.yaml`

**OLD (entire file):**
```yaml
services:
  cns-it:
    build: .
    container_name: cns-it
    restart: unless-stopped
    ports:
      - "5000:5000"
    volumes:
      - ./data:/data
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - DATA_DIR=/data

  drawio:
    image: jgraph/drawio:latest
    container_name: cns-drawio
    restart: unless-stopped
    ports:
      - "8080:8080"
```

**NEW (entire file):**
```yaml
services:
  cns-it:
    build: .
    container_name: cns-it
    restart: unless-stopped
    ports:
      - "5000:5000"
    volumes:
      - ./data:/data
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - DATA_DIR=/data
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5000/api/auth/status"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
    networks:
      - cns-it-net
    depends_on:
      drawio:
        condition: service_healthy

  drawio:
    image: jgraph/drawio:latest
    container_name: cns-drawio
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'
    networks:
      - cns-it-net

networks:
  cns-it-net:
    driver: bridge
    internal: false
```

**Changes:**
- Removed `ports: - "8080:8080"` from drawio (only accessed via internal proxy)
- Added healthchecks for both services
- Added resource limits (memory + CPU)
- Added dedicated bridge network for isolation
- Added `depends_on` with health condition

---

### Fix 14: Harden `docker-entrypoint.sh`

**File:** `docker-entrypoint.sh`

**OLD:**
```bash
#!/bin/sh
# Fix /data directory permissions if needed
if [ -d /data ]; then
  chown -R cnsit:nodejs /data 2>/dev/null || true
  chmod -R 755 /data 2>/dev/null || true
fi
exec "$@"
```

**NEW:**
```bash
#!/bin/sh
set -e

# Validate required environment variables
if [ -z "$JWT_SECRET" ]; then
  echo "ERROR: JWT_SECRET environment variable is not set" >&2
  exit 1
fi

# Fix /data directory permissions if needed
if [ -d /data ]; then
  chown -R cnsit:nodejs /data 2>/dev/null || true
  chmod -R 755 /data 2>/dev/null || true
fi

exec "$@"
```

**Rationale:** `set -e` for fail-fast behavior; validates `JWT_SECRET` is set before starting.

---

### Fix 15: Update `.env.example`

**File:** `.env.example`

**OLD (last lines):**
```
# Data directory for SQLite database
DATA_DIR=./data

# Debug mode
DEBUG=false
```

**NEW (last lines):**
```
# Data directory for SQLite database
DATA_DIR=./data

# Debug mode
DEBUG=false

# draw.io proxy configuration
DRAWIO_HOST=cns-drawio
DRAWIO_PORT=8080

# Base path for subdirectory deployment (e.g., /cns-it)
BASE_PATH=
```

---

## Post-Fix Steps

### 1. Install helmet dependency
```bash
cd server && npm install helmet
```

### 2. Verify `.env` has a strong JWT_SECRET
The current `.env` has `JWT_SECRET=cns-it-production-secret-change-me` which should be replaced with a cryptographically random value:
```bash
openssl rand -base64 32
```

### 3. Rebuild and redeploy
```bash
docker compose down
docker compose up -d --build
```

### 4. Verify fixes
- Test login/register flow
- Test snippet CRUD operations
- Test diagram save/load
- Test admin panel
- Verify helmet headers in response: `curl -I http://localhost:5000/api/auth/status`
- Verify rate limiting: send 6+ rapid login requests

---

## Summary of Changes

| # | File | Phase | Issue | Severity |
|---|------|-------|-------|----------|
| 1 | `snippetRepository.js` | 1 | IDOR — `findById` ignores userId | CRITICAL |
| 2 | `shareRepository.js` | 1 | Missing ownership checks | CRITICAL |
| 3 | `auth.js` | 1 | Hardcoded JWT secret fallback | CRITICAL |
| 4 | `authRoutes.js` | 1 | Operator precedence bug | CRITICAL |
| 5 | `ToolViewPage.tsx` | 1 | XSS via `dangerouslySetInnerHTML` | CRITICAL |
| 6 | `diagramRoutes.js` | 1+2 | Missing rate limiting + XML size validation | HIGH |
| 7 | `snippetRoutes.js` | 2 | Missing rate limiting | MEDIUM |
| 8 | `adminRoutes.js` | 2 | Missing rate limiting | MEDIUM |
| 9 | `authRoutes.js` | 2 | Missing rate limiting on change-password | MEDIUM |
| 10 | `database.js` | 2 | Missing performance indexes | MEDIUM |
| 11 | `app.js` | 2 | Missing security headers (helmet) | MEDIUM |
| 12 | `Dockerfile` | 2 | Container runs as root | MEDIUM |
| 13 | `docker-compose.yaml` | 2 | Missing healthchecks, limits, network | MEDIUM |
| 14 | `docker-entrypoint.sh` | 2 | Missing `set -e` + env validation | LOW |
| 15 | `.env.example` | 2 | Missing env var documentation | LOW |
