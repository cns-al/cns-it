# CNS IT — Code Snippets & Developer Tools

Modern code snippet manager and developer toolkit by [CNS Solutions](https://cns.al).

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D20-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## Features

- **Code Snippets** — Create, organize, and manage code snippets with multi-file support
- **55+ Developer Tools** — Base64, JSON, Hash, Regex, Color, Encryption, and more
- **Categories & Tags** — Organize snippets with custom categories
- **Search & Filter** — Full-text search with category and language filtering
- **Share Snippets** — Generate shareable links with expiration
- **Recycle Bin** — Soft delete with restore capability
- **Admin Panel** — User management with registration approval workflow
- **Responsive UI** — Works on desktop, tablet, and mobile
- **Dark Mode** — Light, dark, and system theme support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express, SQLite (better-sqlite3) |
| Auth | JWT, bcryptjs |
| Deployment | Docker, docker-compose |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

### Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/cns-al/cns-it.git
cd cns-it

# Configure environment (optional)
cp .env.example .env

# Build and start
docker compose up -d --build

# Access at http://localhost:5000
# First registration becomes the super admin
```

### Local Development

```bash
# Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Start development servers
npm run dev

# Access at http://localhost:5173 (frontend)
# API at http://localhost:5000/api
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `JWT_SECRET` | `cns-it-secret-key` | Secret key for JWT signing |
| `TOKEN_EXPIRY` | `24h` | JWT token expiration |
| `ALLOW_NEW_ACCOUNTS` | `true` | Allow new user registrations |
| `ALLOW_PASSWORD_CHANGES` | `true` | Allow password changes |
| `DISABLE_ACCOUNTS` | `false` | Disable account system (anonymous mode) |
| `DATA_DIR` | `./data` | SQLite database directory |

## Admin Panel

The first registered user becomes the super admin automatically. Admin capabilities:

- **User Approval** — Approve or reject pending registrations
- **User Management** — Activate/deactivate users, promote/demote admins
- **View All Users** — Monitor user activity and status

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/status` | Get auth status |
| POST | `/api/auth/change-password` | Change password |

### Snippets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/snippets` | List user snippets |
| POST | `/api/snippets` | Create snippet |
| GET | `/api/snippets/:id` | Get snippet detail |
| PUT | `/api/snippets/:id` | Update snippet |
| DELETE | `/api/snippets/:id` | Soft delete snippet |
| GET | `/api/snippets/categories` | List categories |
| GET | `/api/snippets/recycle` | List recycle bin |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/pending` | List pending registrations |
| PUT | `/api/admin/users/:id/approve` | Approve user |
| PUT | `/api/admin/users/:id/reject` | Reject and delete user |
| PUT | `/api/admin/users/:id/activate` | Activate user |
| PUT | `/api/admin/users/:id/deactivate` | Deactivate user |

## Developer Tools (55+)

- **Encoding/Decoding** — Base64, URL, HTML Entities, Binary, Hex, Unicode
- **Conversion** — Case, JSON/YAML, JSON/XML, JSON/CSV, Number Base, Color, Date, Temperature
- **Generators** — UUID, Password, Lorem Ipsum, Hash, JWT, QR Code, Slug, Token
- **Formatters** — JSON, XML, SQL, YAML, TOML, Markdown, Regex, Diff
- **Network** — IP Converter, Subnet Calculator, HTTP Status, User Agent, URL Parser, MAC
- **Security** — Bcrypt, HMAC, Basic Auth, RSA, Password Strength, Encryption
- **Developer** — Crontab, Chmod, Docker Compose, Git, ETA, Percentage, Math
- **Text** — Statistics, NATO Alphabet, Obfuscator, List Converter, Roman, Emoji

## Security

- Rate limiting on authentication endpoints
- Password hashing with bcrypt (10 rounds)
- JWT-based authentication
- Input validation and sanitization
- Snippet size limits (100KB per fragment)
- Admin approval workflow for new registrations

## License

MIT © [CNS Solutions](https://cns.al)
