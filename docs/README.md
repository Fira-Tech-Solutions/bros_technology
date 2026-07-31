# Retailment Marketplace

A multi-component marketplace platform for listing and discovering products (real estate, vehicles, electronics, etc.) in Ethiopian cities, with automatic syndication to Telegram channels.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js + Express.js v5 |
| **ORM** | Prisma v6 |
| **Database** | PostgreSQL 15 (Docker) |
| **Public Website** | TanStack Start (SSR) + React 19 |
| **Admin App** | React Native (Expo SDK 56) |
| **Image Processing** | Sharp v0.33 |
| **Cloud Storage** | Cloudinary (optional) |
| **Email** | Brevo (Sendinblue) |
| **Styling** | Tailwind CSS v4 + NativeWind |

## Quick Start

### 1. Start Database

```bash
cd DataBase
docker compose up -d
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run prisma:migrate
npm run db:seed
npm run dev
```

### 3. Setup Public Website

```bash
cd public-website
npm install
npm run dev
```

### 4. Setup Admin App

```bash
cd admin-app
npm install
npm start
```

## Project Structure

```
laptop_market/
├── DataBase/                    # Docker Compose for PostgreSQL
│   └── docker-compose.yml
├── backend/                     # Express.js API server
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.js              # Seed data
│   │   └── migrations/
│   ├── src/
│   │   ├── app.js               # Express app setup
│   │   ├── server.js            # Server bootstrap
│   │   ├── config/              # Prisma client
│   │   ├── core/                # Event emitter
│   │   ├── modules/
│   │   │   ├── users/           # Auth + user management
│   │   │   ├── properties/      # Categories + listings
│   │   │   ├── syndication/     # Telegram integration
│   │   │   ├── notifications/   # In-app notifications
│   │   │   └── commissions/     # Admin revenue tracking
│   │   └── utils/               # Image processing, Cloudinary, Brevo
│   └── tests/
├── public-website/              # TanStack Start SSR website
│   └── src/
│       ├── routes/              # File-based routing
│       ├── components/          # React components
│       ├── hooks/               # Custom React hooks
│       ├── lib/                 # API client, i18n
│       └── providers/           # Theme + locale providers
├── admin-app/                   # React Native (Expo) mobile app
│   └── src/
│       ├── api/                 # API client modules
│       ├── screens/             # 14 screens
│       ├── components/          # Reusable UI components
│       ├── context/             # Auth, Theme, Language contexts
│       └── navigation/          # React Navigation setup
└── docs/                        # This documentation
```

## Key Features

- **Dynamic Category Validation** - Categories define `schemaRules` (JSON) for flexible listing attributes
- **Event-Driven Syndication** - Listing events automatically trigger Telegram channel posts
- **Image Processing Pipeline** - Sharp-based resize + WebP conversion with Cloudinary support
- **Multi-Language Support** - English, Afaan Oromoo, and Amharic
- **Role-Based Access Control** - SUPER_ADMIN and AGENT roles with granular permissions
- **In-App Notifications** - Real-time notifications for listing events
- **Commission Tracking** - Admin revenue management per listing

## Default Users (Seeded)

| Email | Password | Role |
|-------|----------|------|
| admin@brostechnology.com | admin123 | SUPER_ADMIN |
| agent1@brostechnology.com | agent123 | AGENT |
| agent2@brostechnology.com | agent123 | AGENT |

## API Base URL

```
http://localhost:5000
```

## Documentation

- [Architecture](./architecture.md) - System design and data flow
- [API Reference](./api-reference.md) - Complete REST API documentation
- [Database Schema](./database-schema.md) - Prisma models and relationships
- [Authentication](./authentication.md) - JWT auth flow and roles
- [Deployment](./deployment.md) - Docker, environment config, scripts
- [Telegram Syndication](./telegram-syndication.md) - Event-driven integration
- [Image Processing](./image-processing.md) - Sharp pipeline and Cloudinary
- [Internationalization](./internationalization.md) - i18n setup
- [Security](./security.md) - Security measures
