# BROS Technology — Documentation

> **Client**: Start with [Overview](./00-OVERVIEW.md) and [Features](./03-FEATURES.md).
> **Developers**: Start with [Getting Started](./01-GETTING-STARTED.md) and [Architecture](./02-ARCHITECTURE.md).

## Documentation Index

| # | Document | Audience | Description |
|---|----------|----------|-------------|
| 00 | [Overview](./00-OVERVIEW.md) | Everyone | What the system does, system diagram, deployed URLs, tech stack |
| 01 | [Getting Started](./01-GETTING-STARTED.md) | Developers | Prerequisites, clone/install/run steps, environment variables |
| 02 | [Architecture](./02-ARCHITECTURE.md) | Developers | Folder structure, data flow, database schema, auth flow, deployment |
| 03 | [Features](./03-FEATURES.md) | Everyone | Every screen and page, what it does, which files implement it |
| 04 | [API Reference](./04-API-REFERENCE.md) | Developers | Every backend endpoint with request/response shapes |
| 05 | [Deployment](./05-DEPLOYMENT.md) | Developers | How to deploy each part, migrations, rollback procedures |
| 06 | [Brand & Design System](./06-BRAND-AND-DESIGN-SYSTEM.md) | Designers/Devs | Color palette, typography, spacing, brand assets, component patterns |
| 07 | [Known Issues & Tech Debt](./07-KNOWN-ISSUES-AND-TECH-DEBT.md) | Everyone | Known bugs, code smells, out-of-scope features |
| 08 | [For Future Developers](./08-FOR-FUTURE-DEVELOPERS.md) | Developers | Where to start, key files, coding conventions, common gotchas |

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js + Express.js v5 (ES modules) |
| **ORM** | Prisma v6.9 |
| **Database** | PostgreSQL 15 (Supabase, EU-West-3) |
| **Public Website** | React 19 + TanStack Start (SSR) + Tailwind CSS v4 |
| **Admin Web Portal** | React 19 + Vite 8 + TanStack Query v5 + Tailwind CSS v4 |
| **Admin Mobile App** | React Native 0.85 + Expo SDK 56 |
| **Image Processing** | Sharp v0.33 |
| **Cloud Storage** | Cloudinary |
| **Email** | Brevo (Sendinblue) |
| **Styling** | Tailwind CSS v4 + CSS Custom Properties (admin), shadcn/ui (public) |
| **Telegram** | Bot API + Mini App integration |

## Deployed Surfaces

| Surface | URL |
|---------|-----|
| Backend API | `https://bros-technology-api.vercel.app` |
| Public Website | `https://bros-technology.vercel.app` |
| Admin Web Portal | `https://bros-technology-admin.vercel.app` |
| Admin Mobile App | `com.brostechnology.admin` (APK / iOS) |

## Default Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@brostechnology.com` | `Admin@12345` | SUPER_ADMIN |

> **Warning**: Change this password immediately after first deployment.

## Quick Start

```bash
# Backend
cd backend && npm install && npm run prisma:migrate && npm run dev

# Public Website
cd public-website && npm install && npm run dev

# Admin Portal
cd admin-portal && npm install && npm run dev

# Admin App
cd admin-app && npm install && npx expo start
```

See [Getting Started](./01-GETTING-STARTED.md) for full details including environment variables.

## Additional Documentation (Pre-existing)

These documents contain deeper dives on specific topics:

- [API Reference (detailed)](./api-reference.md)
- [Architecture (detailed)](./architecture.md)
- [Authentication](./authentication.md)
- [Database Schema](./database-schema.md)
- [Deployment](./deployment.md)
- [Image Processing](./image-processing.md)
- [Internationalization](./internationalization.md)
- [Security](./security.md)
- [Telegram Syndication](./telegram-syndication.md)
- [Vercel Serverless Migration](./vercel-serverless-migration.md)
