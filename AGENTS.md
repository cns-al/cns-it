# CNS IT — Agent Instructions

## Project at a glance

Self-hosted platform for code snippets, diagrams (draw.io), and 52 client-side developer tools. Monorepo with Express backend + React/Vite SPA + SQLite.

| Layer | Tech | Port (dev) | Port (prod) |
|-------|------|------------|-------------|
| Client | React 18, TypeScript, Vite, Tailwind | 3000 | — |
| Server | Express, Node.js (ESM), better-sqlite3 | 5000 | 5000 |
| Diagrams | jgraph/draw.io Docker container | — | 8080 (internal) |
| DB | SQLite (WAL mode) at `data/snippets.db` | — | — |

## Commands

```bash
# Full setup (run from repo root)
npm install && cd server && npm install && cd .. && cd client && npm install && cd ../..

# Dev (both server + client concurrently)
npm run dev              # server on :5000, client on :3000 (proxies /api to :5000)

# Individual dev servers
npm run dev:server       # cd server && node --watch src/app.js
npm run dev:client       # cd client && vite (port 3000)

# Build (client only, server is pure JS)
npm run build            # cd client && tsc && vite build -> client/build/

# Docker (production)
docker compose up -d --build
```

- **No test suite, linter, or formatter** exists. TypeScript (`tsc`) is the only type check, invoked during `client/build`.
- **No CI/CD** pipelines are configured.

## Monorepo structure

```
package.json          # root: concurrently, dev/build scripts
server/               # Express API (pure JS, ESM)
  src/
    app.js            # entrypoint: routes, static serving, draw.io proxy
    config/database.js  # SQLite init, schema, migrations
    middleware/        # auth, adminAuth, apiKeyAuth, rateLimit
    routes/           # auth, snippets, diagrams, shares, admin, public, apiKeys
    repositories/     # userRepository, snippetRepository, shareRepository, apiKeyRepository
client/               # React SPA (TypeScript)
  src/
    main.tsx          # entry: BrowserRouter > ThemeProvider > AuthProvider > App
    App.tsx           # routes: login, register, share, public, protected/*
    api/client.ts     # fetch wrapper, JWT header, 401/429 handling
    contexts/         # AuthContext, ThemeContext
    pages/            # Dashboard, Snippets, Diagram, Tools, Admin, etc.
    components/       # Layout, LoginPage, RegisterPage
data/                 # SQLite database (gitignored except directory)
```

## Critical gotchas

### Rate limiter is in-memory only (`server/src/middleware/rateLimit.js`)

Uses a `Map` — doesn't work across processes (PM2 cluster, multiple containers). Fine for single-container Docker deploys.

### `/auth/change-password` was missing `authenticateToken` middleware (FIXED)

The route used `req.user` but had no auth middleware. Now protected with `authenticateToken`.

### README discrepancies (FIXED)

- **`sortBy` values**: README now matches code (`alpha`, `reverseAlpha`)
- **`Retry-After` header**: Now implemented in rate limiter
- **Tool count**: README now says "52 Developer Tools"
- **Vite dev port**: README now says `:3000` (matches `vite.config.ts`)

## Auth flow

- Auth header: `cnsitauth: Bearer <jwt-token>` (not `Authorization`)
- Token also read from `cnsit_token` cookie as fallback
- Token stored in `localStorage` under key `cnsit_token`
- First registered user becomes admin automatically
- Subsequent registrations require admin approval (`is_approved` flag)
- API keys: stored as SHA-256 hash, sent via `x-api-key` header
- Auth middleware chain on snippet routes: `authenticateApiKey` then `authenticateToken` — if API key succeeds, JWT is skipped
- Client verifies token on load via protected `GET /api/auth/me` (not public `/auth/status`)

## Environment variables

Required: `JWT_SECRET`. All others have defaults.

| Variable | Default | Notes |
|----------|---------|-------|
| `JWT_SECRET` | *(required)* | Also supports `JWT_SECRET_FILE` |
| `TOKEN_EXPIRY` | `24h` | JWT expiry |
| `ALLOW_NEW_ACCOUNTS` | `true` | Block registrations |
| `DISABLE_ACCOUNTS` | `false` | Anonymous mode (creates ephemeral user) |
| `DISABLE_INTERNAL_ACCOUNTS` | `false` | Block username/password auth |
| `DATA_DIR` | `./data` | SQLite directory |
| `DRAWIO_HOST` | `cns-drawio` | draw.io container hostname |
| `DRAWIO_PORT` | `8080` | draw.io container port |
| `BASE_PATH` | `''` | Subdirectory deployment prefix |
| `DEBUG` | `false` | Enables info/debug log output |
| `PORT` | `5000` | Server listen port |
| `TRUST_PROXY` | `false` | Set `true` behind reverse proxy for correct `req.ip` |
| `CORS_ORIGIN` | `*` | Comma-separated allowed CORS origins |

## Database

- SQLite with WAL mode and foreign keys enabled
- Schema auto-created on startup in `server/src/config/database.js`
- Inline migration pattern: `ALTER TABLE ... ADD COLUMN` wrapped in try/catch
- Tables: `users`, `snippets`, `fragments`, `steps`, `categories`, `snippet_categories`, `api_keys`, `shares`, `diagrams`
- Soft delete uses `expiry_date` column on `snippets` (not an `is_deleted` flag)

## Build / Docker notes

- Client build output: `client/build/` (not default `dist/`)
- Dockerfile is multi-stage: builds client in stage 1, copies `server/` and `client/build/` to production stage
- Production container runs as root (needed for `/data` volume mount ownership)
- `docker-entrypoint.sh` validates `JWT_SECRET` and creates `/data` before starting Node
- Docker build may fail with `ECONNREFUSED` on restricted networks — use `--network=host`

## draw.io proxy

The Express server reverse-proxies draw.io at `/drawio/*`, `/js/*`, `/images/*`, `/mxgraph.php`. HTML responses are rewritten to inject branding CSS and remove draw.io references. The client's `DiagramPage.tsx` loads draw.io via iframe to `/drawio`.

## Tools

52 client-side tools defined in `client/src/pages/ToolsPage.tsx` (category metadata) and `client/src/pages/ToolViewPage.tsx` (component registry). All tools run entirely in the browser — no server involvement.
