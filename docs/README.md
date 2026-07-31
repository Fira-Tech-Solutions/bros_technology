# BROS Technology

Electronics device marketplace for selling iPhones, Samsungs, iPads, MacBooks, Laptops, AirPods, and Smartwatches in Ethiopia. Inquiry-based ordering via Telegram/WhatsApp/Call, with admin management and public storefront.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js + Express.js v5 |
| **ORM** | Prisma v6 |
| **Database** | PostgreSQL 15 (Supabase) |
| **Public Website** | TanStack Start (SSR) + React 19 |
| **Admin App** | React Native (Expo SDK 56) |
| **Image Processing** | Sharp v0.33 |
| **Cloud Storage** | Cloudinary |
| **Email** | Brevo (Sendinblue) |
| **Styling** | Tailwind CSS v4 + NativeWind |
| **Telegram** | Bot API + Mini App integration |

## Quick Start

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env  # Configure Supabase, Cloudinary, Brevo credentials
npm run prisma:migrate
npm run dev
```

Categories are auto-seeded on server startup.

### 2. Setup Public Website

```bash
cd public-website
npm install
cp .env.example .env  # Set VITE_API_URL
npm run dev
```

### 3. Setup Admin App

```bash
cd admin-app
npm install
cp .env.example .env  # Set EXPO_PUBLIC_API_URL
npm start
```

## Project Structure

```
bros_technology/
├── backend/                     # Express.js API server
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.js              # Seed data
│   │   └── migrations/
│   ├── src/
│   │   ├── app.js               # Express app setup
│   │   ├── server.js            # Server bootstrap (auto-seeds categories)
│   │   ├── config/              # Prisma client
│   │   ├── core/                # Event emitter
│   │   ├── modules/
│   │   │   ├── users/           # Auth + user management
│   │   │   ├── properties/      # Categories + listings + public routes
│   │   │   ├── syndication/     # Telegram bot + channel integration
│   │   │   ├── notifications/   # In-app notifications
│   │   │   ├── commissions/     # Finance + asset tracking
│   │   │   └── settings/        # Store settings (contact, social, location)
│   │   └── utils/               # Image processing, Cloudinary, Brevo
│   └── api/                     # Vercel serverless entry
├── public-website/              # TanStack Start SSR website
│   └── src/
│       ├── routes/              # File-based routing
│       ├── components/          # Nav, ContactSection, Hero, etc.
│       ├── hooks/               # useSettings, useTelegramBot, useTelegramWebApp
│       ├── lib/                 # API client, i18n, Telegram helpers
│       └── providers/           # Theme + locale providers
├── admin-app/                   # React Native (Expo) mobile app
│   └── src/
│       ├── api/                 # API client modules
│       ├── config/              # Ethiopian market product options
│       ├── screens/             # 14 screens
│       ├── components/          # Reusable UI components
│       ├── context/             # Auth, Theme, Language contexts
│       └── navigation/          # React Navigation setup
└── docs/                        # Documentation
```

## Key Features

### Product Management
- **5 Default Categories** with dynamic schema rules: iPhones & Samsung, iPads/MacBooks, Laptops, AirPods, Smartwatches
- **Ethiopian Market Product Options** — Pre-populated brands, models, storage, GPU with VRAM sizes, etc.
- **Smart Dropdowns** — Select from predefined options or type custom values
- **Dynamic Category Fields** — Each category defines its own attribute schema

### Telegram Integration
- **Channel Posts** — Auto-post products with category-aware captions (brand, model, storage, specs)
- **Inline Keyboard** — 📍 Location, 🛍 Explore, 📩 Order Now buttons
- **Order via Telegram** — "Order Now" opens `t.me/admin` with image URL pre-filled
- **Mini App** — Bot menu button and deep links for in-app browsing

### Finance & Asset Tracking
- **Asset Stats** — Total assets, total value, available/sold/pending/archived counts
- **Category Breakdown** — Per-category asset counts, status distribution, progress bars
- **Commission Management** — Set commission percentages per listing

### Admin App
- **3-Step Listing Wizard** — Basic Info → Category Details → Media
- **Contact Settings** — Phone, WhatsApp, Telegram, email, Google Maps location
- **Syndication Control** — Bot token, channel ID, webhook setup

### Public Website
- **Google Maps Integration** — Shop location in navbar and contact section
- **Brand Marquee** — Animated product brand logos
- **Multi-Language** — English, Amharic, Afaan Oromoo
- **Dark/Light Theme** — System-aware with manual toggle
- **Telegram Mini App** — Responsive in Telegram WebApp environment

## Default Users

| Email | Password | Role |
|-------|----------|------|
| admin@brostechnology.com | Admin@12345 | SUPER_ADMIN |

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://tstdnxkoqrfwfmlpbcma.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=...
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Public Website (`.env`)
```
VITE_API_URL=http://localhost:5000
VITE_TELEGRAM_BOT_USERNAME=brostechnology
```

### Admin App (`.env`)
```
EXPO_PUBLIC_API_URL=http://localhost:5000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Public store settings |
| GET | `/api/categories` | List categories with schema rules |
| GET | `/api/listings` | List products (filterable) |
| GET | `/api/listings/:id` | Product detail |
| GET | `/api/public/telegram-bot` | Bot username |
| POST | `/api/commissions/asset-stats` | Asset stats by category (admin) |
| GET | `/api/commissions/summary` | Commission summary (admin) |

## Telegram Setup

1. Create bot via [@BotFather](https://t.me/BotFather)
2. Save bot token in admin app → Syndication → Settings
3. Set channel ID in admin app → Syndication → Settings
4. Set admin Telegram username in admin app → Contact Settings
5. Set shop Google Maps URL in admin app → Contact Settings
6. Deploy backend to public HTTPS URL
7. Setup webhook: `POST /api/syndication/telegram/setup-webhook`

## Documentation

- [Architecture](./architecture.md)
- [API Reference](./api-reference.md)
- [Database Schema](./database-schema.md)
- [Authentication](./authentication.md)
- [Deployment](./deployment.md)
- [Telegram Syndication](./telegram-syndication.md)
- [Security](./security.md)
