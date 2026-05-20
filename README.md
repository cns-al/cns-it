# CNS IT — Code Snippets, Diagrams & Developer Tools

> **By [CNS Solutions](https://cns.al)** — A modern, self-hosted platform for managing code snippets, creating diagrams, and accessing 55+ developer tools.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D20-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Production Deployment](#production-deployment)
- [API Reference](#api-reference)
- [Developer Tools](#developer-tools)
- [Security](#security)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Code Snippets
- **Multi-file snippets** — Store multiple code files per snippet with syntax highlighting
- **Multi-step snippets** — Sequential step-by-step instructions
- **300+ languages** — Comprehensive language selection with custom language support
- **Categories** — Organize snippets with custom categories and filtering
- **Pin & Favorite** — Quick access to important snippets
- **Public/Private** — Toggle snippet visibility
- **Share Links** — Generate expirable shareable URLs
- **Recycle Bin** — Soft delete with restore and permanent delete
- **Full-text search** — Instant search across titles, descriptions, and code
- **Zoomable grid** — Adjustable card grid from 60% to 200%

### Diagram Editor
- **Self-hosted draw.io** — Fully integrated diagram editor with CNS IT branding
- **Save to CNS IT** — Persist diagrams in the database
- **Import/Export** — Import from XML/SVG, export to PC
- **Custom shapes** — Upload custom shape libraries
- **Saved diagrams sidebar** — Browse, search, and load previous diagrams
- **Fullscreen mode** — Distraction-free editing

### 55+ Developer Tools
All tools run client-side — no server overhead, instant results:

| Category | Tools |
|----------|-------|
| **Encoding/Decoding** | Base64, URL, HTML Entities, Binary, Hex, Unicode |
| **Conversion** | Case, JSON↔YAML, JSON↔XML, JSON↔CSV, Number Base, Color, Date/Time, Temperature |
| **Generators** | UUID, Password, Lorem Ipsum, Hash (MD5/SHA), JWT Parser, QR Code, Slug, Token |
| **Formatters** | JSON, XML, SQL, YAML, TOML, Markdown→HTML, Regex Tester, Text Diff |
| **Network** | IP Converter, Subnet Calculator, HTTP Status Codes, User Agent Parser, URL Parser, MAC Generator |
| **Security** | Bcrypt Hash, HMAC, Basic Auth, RSA Keys, Password Strength, Text Encryption |
| **Developer** | Crontab Generator, Chmod Calculator, Docker→Compose, Git Cheat Sheet, ETA, Percentage, Math |
| **Text** | Statistics, NATO Alphabet, Obfuscator, List Converter, Roman Numerals, Emoji Picker |

### Admin Panel
- **Super admin** — First registered user becomes admin automatically
- **Registration approval** — Pending user queue with approve/reject workflow
- **User management** — Activate, deactivate, delete users
- **Activity monitoring** — Track join dates and last login

### UI/UX
- **Dark mode** — Light, dark, and system theme support
- **Responsive** — Desktop, tablet, and mobile layouts
- **Modal-based** — Snippet detail and tools open in overlays, no page navigation
- **Keyboard shortcuts** — `⌘K` / `Ctrl+K` for instant search
- **Dashboard** — Stats overview with recent snippets and diagrams

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser (SPA)                    │
│  React 18 · TypeScript · Vite · Tailwind CSS        │
└──────────┬──────────────────────────────┬────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────┐    ┌──────────────────────────┐
│  Express Server     │    │  draw.io (jgraph/drawio) │
│  Port 5000          │    │  Port 8080 (internal)    │
│                     │    │                          │
│  · Auth (JWT)       │    │  · Self-hosted editor    │
│  · Snippet API      │    │  · CNS IT branded        │
│  · Diagram API      │    │  · Full feature set      │
│  · Admin API        │    └──────────────────────────┘
│  · Static file srv  │
│  · draw.io proxy    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  SQLite Database    │
│  better-sqlite3     │
│  /data/snippets.db  │
└─────────────────────┘
```

### Docker Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `cns-it` | Custom (Node 20) | 5000 | Main application (API + SPA) |
| `cns-drawio` | `jgraph/drawio` | 8080 (internal) | Diagram editor (proxied) |

---

## Quick Start

### Prerequisites

- **Docker** 24+ and **Docker Compose** v2
- **2GB RAM** minimum (for both containers)

### Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/cns-al/cns-it.git
cd cns-it

# Configure environment
cp .env.example .env
# Edit .env and change JWT_SECRET to a random string

# Build and start
docker compose up -d --build

# Check status
docker compose ps

# Access the application
# http://localhost:5000
```

### First User Setup

1. Open `http://localhost:5000`
2. Click **Register** and create your account
3. The first registered user becomes the **super admin** automatically
4. Login and access the Admin Panel from the sidebar

### Local Development

```bash
# Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Start development servers
npm run dev

# Frontend: http://localhost:5173
# API: http://localhost:5000/api
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | *(required)* | Secret key for JWT signing. **Must be changed in production.** |
| `TOKEN_EXPIRY` | `24h` | JWT token expiration (e.g., `24h`, `7d`, `30d`) |
| `ALLOW_NEW_ACCOUNTS` | `true` | Allow new user registrations |
| `ALLOW_PASSWORD_CHANGES` | `true` | Allow users to change their password |
| `DISABLE_ACCOUNTS` | `false` | Disable account system (anonymous mode) |
| `DISABLE_INTERNAL_ACCOUNTS` | `false` | Disable internal account creation |
| `DATA_DIR` | `./data` | SQLite database directory |
| `DRAWIO_HOST` | `cns-drawio` | Draw.io container hostname |
| `DRAWIO_PORT` | `8080` | Draw.io container port |
| `BASE_PATH` | *(empty)* | Subdirectory deployment path (e.g., `/cns-it`) |

### Generating a Secure JWT Secret

```bash
# Option 1: OpenSSL
openssl rand -hex 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## Production Deployment

### Step 1: Server Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| CPU | 1 core | 2 cores |
| RAM | 2 GB | 4 GB |
| Disk | 10 GB | 20 GB |
| Docker | 24+ | Latest stable |

### Step 2: Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### Step 3: Deploy the Application

```bash
# Clone the repository
sudo apt install -y git
git clone https://github.com/cns-al/cns-it.git
cd cns-it

# Configure environment
cp .env.example .env
nano .env
# Change JWT_SECRET, set ALLOW_NEW_ACCOUNTS as needed

# Build and start
docker compose up -d --build

# Verify
docker compose ps
docker compose logs --tail=20 cns-it
```

### Step 4: Set Up Reverse Proxy (Recommended)

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name it.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name it.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/it.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/it.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}
```

#### Let's Encrypt SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d it.yourdomain.com
```

### Step 5: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS only
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Verify
sudo ufw status
```

### Step 6: Auto-Updates & Monitoring

```bash
# Check container health
docker compose ps

# View logs
docker compose logs -f cns-it

# Restart after updates
cd /path/to/cns-it
git pull
docker compose up -d --build

# Backup database
cp data/snippets.db ~/backups/snippets-$(date +%Y%m%d).db
```

### Step 7: Backup Strategy

```bash
#!/bin/bash
# backup.sh — Run daily via cron
BACKUP_DIR="/backups/cns-it"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec cns-it cp /data/snippets.db /tmp/snippets.db
docker cp cns-it:/tmp/snippets.db "$BACKUP_DIR/snippets-$DATE.db"

# Keep last 30 days
find "$BACKUP_DIR" -name "snippets-*.db" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/snippets-$DATE.db"
```

```bash
# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /path/to/backup.sh >> /var/log/cns-it-backup.log 2>&1
```

---

## API Reference

### Authentication

All authenticated endpoints require the `cnsitauth` header:

```
cnsitauth: Bearer <jwt-token>
```

#### POST `/api/auth/register`

Register a new user account.

```json
// Request
{
  "username": "developer",
  "password": "securePassword123"
}

// Response (201) — First user (auto-admin)
{
  "token": "eyJhbG...",
  "user": { "id": 1, "username": "developer", "isAdmin": true },
  "message": "Registration successful. You are the first admin."
}

// Response (202) — Subsequent users (pending approval)
{
  "message": "Registration successful. Your account is pending admin approval.",
  "pending": true
}
```

**Validation:**
- Username: 3-30 characters, alphanumeric, underscores, hyphens
- Password: Minimum 8 characters

#### POST `/api/auth/login`

Authenticate and receive a JWT token.

```json
// Request
{
  "username": "admin",
  "password": "admin123456"
}

// Response (200)
{
  "token": "eyJhbG...",
  "user": { "id": 1, "username": "admin", "isAdmin": true }
}
```

**Rate Limit:** 5 attempts per 15 minutes

#### POST `/api/auth/change-password`

Change the authenticated user's password.

```json
{
  "currentPassword": "oldPass123",
  "newPassword": "newPass456"
}
```

**Rate Limit:** 5 attempts per 15 minutes

#### GET `/api/auth/status`

Get authentication system status (public endpoint).

```json
{
  "accountsDisabled": false,
  "internalAccountsDisabled": false,
  "allowNewAccounts": true,
  "allowPasswordChanges": true,
  "hasUsers": true,
  "version": "1.0.0"
}
```

### Snippets

#### GET `/api/snippets`

List user's snippets.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Full-text search |
| `category` | string | — | Filter by category |
| `sortBy` | string | `newest` | `newest`, `oldest`, `az`, `za` |
| `limit` | int | `20` | Max results |

```json
// Response (200)
{
  "data": [
    {
      "id": 1,
      "title": "My Snippet",
      "description": "Description here",
      "is_pinned": 0,
      "is_favorite": 0,
      "is_public": 0,
      "updated_at": "2026-05-20 20:00:00",
      "expiry_date": null,
      "fragment_count": 2,
      "step_count": 0,
      "categories": "web,api",
      "username": "admin"
    }
  ],
  "total": 1
}
```

#### POST `/api/snippets`

Create a new snippet.

```json
{
  "title": "API Endpoint",
  "description": "REST endpoint example",
  "fragments": [
    {
      "name": "server.js",
      "code": "app.get('/api', (req, res) => {})",
      "language": "javascript"
    }
  ],
  "steps": [
    { "title": "Step 1", "code": "npm install", "language": "bash" }
  ],
  "categories": ["api", "node"]
}
```

**Limits:** Title ≤ 200 chars, Description ≤ 5000 chars, Code ≤ 100KB per fragment

#### PUT `/api/snippets/:id`

Update snippet properties.

```json
{
  "title": "Updated Title",
  "isPinned": true,
  "isFavorite": true,
  "isPublic": false
}
```

#### DELETE `/api/snippets/:id`

Soft delete a snippet (moves to recycle bin).

#### GET `/api/snippets/categories`

List all categories for the authenticated user.

#### GET `/api/snippets/recycle`

List soft-deleted snippets.

### Share Links

#### POST `/api/share/:snippetId`

Create a shareable link.

```json
{
  "expiresIn": "24h"
}

// Response (201)
{
  "token": "abc123def456",
  "expiresAt": "2026-05-21T20:00:00.000Z"
}
```

**Expiration options:** `1h`, `24h`, `7d`, `30d`, or omit for never expires

#### GET `/api/share/:snippetId`

List existing share links for a snippet.

#### DELETE `/api/share/:snippetId/:shareId`

Revoke a share link.

### Diagrams

#### GET `/api/diagrams`

List user's saved diagrams.

#### POST `/api/diagrams`

Create or update a diagram.

```json
{
  "title": "Architecture Diagram",
  "xml_data": "<mxGraphModel><root>...</root></mxGraphModel>"
}
```

**Limit:** XML data ≤ 5MB

#### GET `/api/diagrams/:id`

Get a single diagram with its XML data.

#### PUT `/api/diagrams/:id`

Update a diagram's title and/or XML data.

#### DELETE `/api/diagrams/:id`

Permanently delete a diagram.

### Admin

All admin endpoints require `isAdmin: true` in the JWT token.

#### GET `/api/admin/users`

List all registered users.

#### GET `/api/admin/users/pending`

List users awaiting approval.

#### PUT `/api/admin/users/:id/approve`

Approve a pending user account.

#### PUT `/api/admin/users/:id/reject`

Reject and delete a pending user account.

#### PUT `/api/admin/users/:id/activate`

Reactivate a deactivated user.

#### PUT `/api/admin/users/:id/deactivate`

Deactivate a user (they can no longer log in).

#### DELETE `/api/admin/users/:id`

Permanently delete a user.

**Safeguards:**
- Cannot delete yourself
- Cannot delete the last admin

---

## Developer Tools

All 55+ tools are accessible at `/tools` and open in modal overlays. Each tool runs entirely in the browser — no data is sent to the server.

### Quick Reference

| Tool | Category | Description |
|------|----------|-------------|
| Base64 Encode/Decode | Encoding | Encode/decode Base64 strings |
| URL Encode/Decode | Encoding | Percent-encode URLs |
| HTML Entities | Encoding | Encode/decode HTML entities |
| Binary Converter | Encoding | Text ↔ binary conversion |
| Hex Converter | Encoding | Text ↔ hexadecimal conversion |
| Unicode Converter | Encoding | Text ↔ unicode escape sequences |
| Case Converter | Conversion | upper, lower, camel, snake, kebab, etc. |
| JSON / YAML | Conversion | Convert between JSON and YAML |
| JSON / XML | Conversion | Convert between JSON and XML |
| JSON / CSV | Conversion | Convert between JSON and CSV |
| Number Base | Conversion | Binary, octal, decimal, hex |
| Color Converter | Conversion | HEX, RGB, HSL, HSV |
| Date/Time | Conversion | Format conversion and timezone |
| Temperature | Conversion | Celsius, Fahrenheit, Kelvin |
| UUID Generator | Generators | UUID v4 generation |
| Password Generator | Generators | Configurable secure passwords |
| Lorem Ipsum | Generators | Placeholder text |
| Hash Generator | Generators | MD5, SHA-1, SHA-256, SHA-512 |
| JWT Parser | Generators | Decode and inspect JWT tokens |
| QR Code | Generators | Generate QR codes |
| Slug Generator | Generators | URL-friendly slugs |
| Token Generator | Generators | Random hex/base64 tokens |
| JSON Formatter | Formatters | Prettify and validate JSON |
| XML Formatter | Formatters | Prettify and validate XML |
| SQL Formatter | Formatters | Beautify SQL queries |
| YAML Viewer | Formatters | View and format YAML |
| TOML Converter | Formatters | TOML ↔ JSON conversion |
| Markdown to HTML | Formatters | Render Markdown as HTML |
| Regex Tester | Formatters | Test regular expressions |
| Text Diff | Formatters | Compare two texts |
| IP Converter | Network | IP address ↔ number |
| Subnet Calculator | Network | IPv4 subnet calculations |
| HTTP Status Codes | Network | Reference for status codes |
| User Agent Parser | Network | Parse UA strings |
| URL Parser | Network | Parse URL components |
| MAC Generator | Network | Random MAC addresses |
| Bcrypt Hash | Security | Hash passwords with bcrypt |
| HMAC Generator | Security | HMAC-SHA signatures |
| Basic Auth | Security | Generate Auth headers |
| RSA Key Generator | Security | Generate RSA key pairs |
| Password Strength | Security | Analyze password strength |
| Text Encryption | Security | AES, DES, etc. encryption |
| Crontab Generator | Developer | Generate cron expressions |
| Chmod Calculator | Developer | File permission calculator |
| Docker to Compose | Developer | docker run → docker-compose |
| Git Cheat Sheet | Developer | Common git commands |
| ETA Calculator | Developer | Time estimation |
| Percentage Calculator | Developer | Percentage calculations |
| Math Evaluator | Developer | Evaluate expressions |
| Text Statistics | Text | Word, character, line counts |
| NATO Alphabet | Text | Phonetic alphabet conversion |
| Text Obfuscator | Text | Character insertion obfuscation |
| List Converter | Text | Format list conversions |
| Roman Numerals | Text | Arabic ↔ Roman conversion |
| Emoji Picker | Text | Browse and copy emojis |

---

## Security

### Implemented Measures

| Feature | Implementation |
|---------|---------------|
| **Authentication** | JWT tokens with configurable expiry |
| **Password Hashing** | bcrypt with 10 rounds |
| **Rate Limiting** | Login: 5/15min, Register: 3/15min, API: 20-30/60s |
| **IDOR Protection** | All endpoints enforce user ownership |
| **XSS Prevention** | Input sanitization, HTML entity escaping |
| **Helmet Headers** | X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy |
| **Snippet Limits** | Title ≤ 200, Description ≤ 5000, Code ≤ 100KB |
| **Diagram Limits** | XML ≤ 5MB |
| **Admin Safeguards** | Cannot self-delete, cannot delete last admin |
| **Non-root Container** | Runs as `cnsit:1001` |
| **Network Isolation** | Dedicated Docker bridge network |
| **Resource Limits** | 512M/1.0 CPU (app), 256M/0.5 CPU (drawio) |

### Security Headers

The application sets the following response headers via Helmet:

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: no-referrer
X-Permitted-Cross-Domain-Policies: none
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-XSS-Protection: 0
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

---

## Database Schema

SQLite database at `/data/snippets.db`:

### Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts, auth, approval status |
| `snippets` | Snippet metadata, visibility, timestamps |
| `fragments` | Code files within snippets |
| `steps` | Sequential steps within snippets |
| `categories` | User-defined snippet categories |
| `shares` | Shareable link tokens |
| `diagrams` | Saved diagram XML data |
| `api_keys` | API key authentication |

### Key Indexes

- `snippets(user_id, expiry_date)` — Fast user snippet listing
- `snippets(is_public, expiry_date)` — Public snippet queries
- `fragments(snippet_id, language)` — Fragment lookups
- `categories(name, user_id)` — Category filtering
- `api_keys(user_id)` — API key validation
- `shares(snippet_id)` — Share link lookups

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs cns-it

# Common issue: JWT_SECRET not set
# Fix: Ensure .env has JWT_SECRET set
grep JWT_SECRET .env
```

### Login Redirect Loop

Clear browser cookies and localStorage for the domain:

```javascript
// In browser console
localStorage.clear();
document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
location.reload();
```

### Database Locked

```bash
# Restart container to release locks
docker compose restart cns-it

# Check file permissions
ls -la data/
```

### Diagram Editor Not Loading

```bash
# Check draw.io container
docker compose ps cns-drawio

# Check proxy logs
docker compose logs cns-it | grep -i drawio

# Restart both containers
docker compose restart
```

### Blank Page After Login

1. Check browser console for errors
2. Verify JWT token in `localStorage.getItem('cnsit_token')`
3. Check server health: `curl http://localhost:5000/api/auth/status`

### Rate Limit Exceeded

Wait for the window to expire (15 minutes for auth, 60 seconds for API). Check `Retry-After` header.

### Reset Database

```bash
# Stop containers
docker compose down

# Remove database
rm data/snippets.db

# Restart (fresh database)
docker compose up -d
```

---

## License

MIT © [CNS Solutions](https://cns.al)
