# 01 — Getting Started

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20+ (LTS recommended) | Runtime for all three codebases |
| **npm** | 10+ | Package management (admin-app uses npm, public-website has bun.lock) |
| **Expo CLI** | Latest (`npx expo`) | Admin app development and builds |
| **EAS CLI** | 3.0+ (`npm i -g eas-cli`) | Admin app builds on EAS |
| **Git** | Any recent version | Version control |

### Accounts Required

| Service | Purpose | How to Get |
|---------|---------|------------|
| **Supabase** | PostgreSQL database | Create project at supabase.com. Ask Samuel Girma / Fira Tech Solutions for current credentials. |
| **Cloudinary** | Image storage and CDN | Create account at cloudinary.com. Ask for current API keys. |
| **Brevo** | Transactional email (password reset) | Create account at brevo.com. Ask for current API key. |
| **Vercel** | Backend + website hosting | Deploy via vercel.com. Ask for team access. |
| **Expo / EAS** | Mobile app builds | Create account at expo.dev. Ask for `codearchitect001` account access. |
| **Telegram** | Bot for channel syndication | Create bot via @BotFather. Ask for bot token. |

## Clone and Run

### 1. Backend

```bash
cd backend
npm install
```

Create `.env` file (see [Environment Variables](#environment-variables) below), then:

```bash
npm run prisma:migrate    # Run database migrations
npm run prisma:generate   # Generate Prisma Client
npm run db:seed           # Seed default users (admin, agent, agent2)
npm run dev               # Start dev server on http://localhost:5000
```

Categories are auto-seeded on server startup (`src/server.js` calls `seedCategories()`).

### 2. Public Website

```bash
cd public-website
npm install
```

Create `.env` file, then:

```bash
npm run dev    # Start dev server on http://0.0.0.0:3000
```

### 3. Admin Web Portal

```bash
cd admin-portal
npm install
```

No `.env` file needed — the API URL is hardcoded in `src/lib/api.ts`.

```bash
npm run dev    # Start dev server on http://0.0.0.0:3001
```

### 4. Admin Mobile App

```bash
cd admin-app
npm install
```

No `.env` file needed — the API URL is hardcoded in `src/api/client.js`.

```bash
npx expo start    # Start Expo dev server
```

## Environment Variables

### Backend (`.env` in `backend/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (use Supabase **pooled** URL with `?pgbouncer=true`) |
| `DIRECT_URL` | Yes | PostgreSQL direct connection string (for Prisma migrations — use Supabase **direct** URL) |
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | `development` or `production` (default: `development`) |
| `JWT_SECRET` | Yes | Secret key for JWT signing (minimum 32 characters) |
| `JWT_EXPIRES_IN` | No | JWT token expiry (default: `7d`) |
| `ALLOWED_ORIGINS` | No | Comma-separated additional CORS origins |
| `STORAGE_PROVIDER` | No | `cloudinary` or `local` (default: `local`; set to `cloudinary` on Vercel) |
| `UPLOAD_DIR` | No | Upload directory path (default: `./uploads`) |
| `CLOUDINARY_CLOUD_NAME` | Yes (if cloudinary) | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes (if cloudinary) | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes (if cloudinary) | Cloudinary API secret |
| `CLOUDINARY_FOLDER` | No | Cloudinary upload folder (default: `brostechnology/listings`) |
| `BREVO_API_KEY` | No | Brevo API key (warns if missing, email functions simulated) |
| `BREVO_FROM_EMAIL` | No | Brevo sender email (default: `noreply@brostechnology.com`) |
| `API_BASE_URL` | No | Base URL for image paths in responses (default: `http://localhost:5000`) |
| `TELEGRAM_MINI_APP_URL` | No | Telegram Mini App URL for bot menu button |
| `TELEGRAM_CHANNEL_ID` | No | Fallback Telegram channel ID |

> **Important**: Use the **pooled** connection string for `DATABASE_URL` (port 6543) and the **direct** connection string for `DIRECT_URL` (port 5432). Prisma requires the direct URL for migrations.

### Public Website (`.env` in `public-website/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API base URL (e.g., `http://localhost:5000` for dev, `https://bros-technology-api.vercel.app` for prod) |
| `VITE_SITE_URL` | No | Public site origin for canonical URLs and OG images (default: `https://bros-technology.vercel.app`) |
| `VITE_TELEGRAM_BOT_USERNAME` | No | Fallback Telegram bot username (default: `brostechnology`) |

### Admin Web Portal

No environment variables needed. The API URL is hardcoded in `src/lib/api.ts` as `https://bros-technology-api.vercel.app`.

### Admin Mobile App

No environment variables needed. The API URL is hardcoded in `src/api/client.js` as `https://bros-technology-api.vercel.app`. The `EXPO_PUBLIC_API_URL` in `app.config.js` is set but not actually used by the code.

## Getting Current Credentials

> **Do not commit real secrets to the repository.**

Ask **Samuel Girma / Fira Tech Solutions** for current values of:
- Supabase `DATABASE_URL` and `DIRECT_URL`
- Cloudinary cloud name, API key, and API secret
- Brevo API key
- JWT_SECRET
- Telegram bot token
- Vercel project access

The `.env` file in `backend/` contains real credentials — never commit it. It is listed in `.gitignore`.
