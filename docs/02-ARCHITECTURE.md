# 02 — Architecture

## Folder Structure

### Backend (`backend/`)

```
backend/
├── api/
│   └── index.js                  # Vercel serverless entry — re-exports Express app
├── prisma/
│   ├── schema.prisma             # Database schema (single source of truth)
│   ├── seed.js                   # Seeds 3 users (admin, agent, agent2)
│   ├── seedCategories.js         # Seeds 5 default categories
│   ├── seedListings.js           # Seeds ~500 product listings with Pexels images
│   └── migrations/               # 14 migration files (sequential)
├── src/
│   ├── app.js                    # Express app: CORS, helmet, routes, error handler
│   ├── server.js                 # Dev server: connect DB, seed categories, start listening
│   ├── config/
│   │   └── prisma.js             # PrismaClient singleton (global caching for dev)
│   ├── core/
│   │   └── listingEmitter.js     # EventEmitter for listing lifecycle events
│   ├── modules/
│   │   ├── users/                # Auth, user CRUD, agent code management
│   │   ├── properties/           # Categories, listings, public storefront endpoints
│   │   ├── syndication/          # Telegram bot service, channel posting, logs
│   │   ├── notifications/        # In-app notification CRUD
│   │   ├── commissions/          # Asset stats, commission tracking
│   │   └── settings/             # Store settings (contact, social, location)
│   └── utils/
│       ├── imageProcessor.js     # Multer + Sharp pipeline (resize, WebP, Cloudinary)
│       ├── cloudinary.js         # Cloudinary upload/delete helpers
│       └── brevo.js              # Brevo email sender (password reset)
└── tests/                        # Jest tests (unit + integration)
```

### Public Website (`public-website/`)

```
public-website/
├── src/
│   ├── routes/                   # File-based routing (TanStack Router)
│   │   ├── __root.tsx            # Root layout: providers, SEO, fonts, JSON-LD
│   │   ├── index.tsx             # Homepage: hero, categories, featured, stats
│   │   ├── catalog.tsx           # Catalog: search, filters, grid/list
│   │   ├── property.$id.tsx      # Product detail: gallery, specs, inquiry
│   │   └── sitemap[.]xml.tsx     # Dynamic XML sitemap
│   ├── components/
│   │   ├── Nav.tsx               # Desktop top nav + mobile bottom dock
│   │   ├── HeroBackground.tsx    # Parallax hero with AVIF/WebP responsive images
│   │   ├── PropertyCard.tsx      # Product card component
│   │   ├── FilterPanel.tsx       # Desktop sidebar filter
│   │   ├── ContactSection.tsx    # Contact info, social links, map
│   │   ├── JsonLd.tsx            # Structured data components
│   │   ├── three/HeroCanvas.tsx  # Three.js 3D hero canvas
│   │   └── ui/                   # 40+ shadcn/ui components
│   ├── hooks/                    # useProperties, useSettings, useTelegramBot, etc.
│   ├── lib/
│   │   ├── api/properties.ts     # API client + TypeScript types
│   │   ├── i18n/translations.ts  # 3 languages (EN, AM, OR)
│   │   ├── telegram.ts           # Telegram WebApp type definitions
│   │   └── utils.ts              # cn(), formatPrice(), etc.
│   ├── providers/                # ThemeProvider, LocaleProvider
│   └── styles.css                # Tailwind v4 + OKLCH color tokens
└── public/
    └── images/                   # Hero images, brand logos, favicons
```

### Admin Web Portal (`admin-portal/`)

```
admin-portal/
├── src/
│   ├── main.tsx                  # Entry: QueryClientProvider + App
│   ├── App.tsx                   # Router: public/protected routes + Layout
│   ├── index.css                 # Design tokens (CSS custom properties), dark mode, animations
│   ├── components/
│   │   ├── Layout.tsx            # Sidebar + topbar shell
│   │   └── ui/                   # Button, DataTable, Form, Modal, StatCard, StatusBadge, Misc
│   ├── pages/                    # 15 page components
│   ├── hooks/                    # TanStack Query hooks (useListings, useCategories, etc.)
│   ├── lib/
│   │   ├── api.ts                # Axios instance + helpers
│   │   ├── queryClient.ts        # Query config (10s stale, 30s polling)
│   │   └── utils.ts              # cn(), formatPrice(), timeAgo()
│   ├── contexts/                 # Auth, Theme, Language
│   └── config/productOptions.ts  # 300+ predefined product attribute options
└── vercel.json                   # SPA rewrite + favicon redirect
```

### Admin Mobile App (`admin-app/`)

```
admin-app/
├── App.js                        # Root: Splash -> Auth -> Main navigation
├── src/
│   ├── api/                      # API modules (auth, listings, agents, etc.)
│   │   ├── client.js             # Axios instance with auth interceptor
│   │   ├── auth.js               # Login, register, profile, password reset
│   │   ├── listings.js           # CRUD with in-memory cache
│   │   ├── agents.js             # Agent code management
│   │   ├── commissions.js        # Asset stats, commission tracking
│   │   ├── syndication.js        # Telegram config, logs, retry
│   │   ├── categories.js         # Category CRUD with cache
│   │   ├── notifications.js      # Notification list, mark read
│   │   └── settings.js           # Store settings
│   ├── screens/                  # 17 screens
│   ├── components/               # Reusable UI components
│   ├── config/
│   │   ├── theme.js              # Light/dark color tokens, spacing, typography
│   │   └── productOptions.js     # Same product options as admin-portal
│   ├── context/                  # Auth, Theme, Language contexts
│   ├── navigation/               # Auth + Main tab navigators
│   ├── hooks/                    # useNotifications (30s polling), useSuspenseCache
│   ├── i18n/translations.js      # 3 languages
│   └── utils/
│       ├── storage.js            # Cross-platform storage (SecureStore/localStorage)
│       ├── cache.js              # API response cache with group versioning
│       └── mediaCache.js         # Disk-based image cache (LRU, 200 files max)
└── app.config.js                 # Expo config (SDK 56, bundle ID, EAS project)
```

## Data Flow

### Typical Request Lifecycle

```
1. Admin App / Admin Portal / Public Website
   ↓ HTTP request (JSON or FormData)
2. Express.js (app.js)
   ↓ CORS check → helmet → morgan → body parser
3. Route Handler (e.g., listing.routes.js)
   ↓ authenticate() middleware → JWT verify → DB lookup
4. Controller (e.g., listing.controller.js)
   ↓ Prisma query
5. Prisma ORM
   ↓ SQL query via connection pool
6. Supabase PostgreSQL
   ↓ Result
7. Controller formats response
   ↓ { success: true, data: [...], pagination: {...} }
8. Express sends JSON response
```

### Image Upload Flow

```
1. Client sends FormData with image files
   ↓
2. Multer middleware (memory storage on Vercel, disk otherwise)
   ↓
3. Sharp processing: resize to 1200px width → convert to WebP (quality 80)
   ↓
4. If Cloudinary: upload to Cloudinary, get URL
   If local: write to /uploads/ directory
   ↓
5. URLs stored in Listing.images array (String[])
```

### Telegram Syndication Flow

```
1. Admin triggers syndication (manual) or listing is created/updated
   ↓
2. Syndication route handler
   ↓
3. Creates SyndicationLog entry (status: PENDING)
   ↓
4. TelegramBotService.sendListingToChannel()
   ↓ Formats caption from category schema rules
   ↓ Adds inline keyboard (Location, Explore, Order)
5. Telegram Bot API call
   ↓
6. Update SyndicationLog (status: SUCCESS or FAILED, messageId)
```

## Database Schema

### Tables and Relationships

```mermaid
erDiagram
    users ||--o{ listings : "creates (agentId)"
    users ||--o{ notifications : "receives"
    categories ||--o{ listings : "contains"
    listings ||--o{ syndication_logs : "syndicated as"
    users ||--o{ agent_codes : "generates"

    users {
        uuid id PK
        string email UK
        string password
        string name
        string phone
        enum role "SUPER_ADMIN | AGENT"
        string profileImage
        string facebook, twitter, instagram, linkedin, telegram, whatsapp, tiktok, youtube, website
        json customSocials
        string passwordResetToken
        datetime passwordResetExpires
        datetime createdAt
        datetime updatedAt
    }

    categories {
        uuid id PK
        string name UK
        string displayName
        string icon
        json schemaRules
        datetime createdAt
        datetime updatedAt
    }

    listings {
        uuid id PK
        string title
        text description
        decimal price "Decimal(12,2)"
        enum status "AVAILABLE | PENDING | SOLD | ARCHIVED"
        string[] images
        json attributes
        text customTelegramCaption
        uuid categoryId FK
        uuid agentId FK "nullable, SetNull"
        int viewsCount
        int inquiryClicks
        int stockQuantity
        decimal commissionPercent "Decimal(5,2)"
        datetime createdAt
        datetime updatedAt
    }

    syndication_logs {
        uuid id PK
        uuid listingId FK "Cascade"
        string platform
        enum status "PENDING | SUCCESS | FAILED"
        enum action "NEW_POST | EDITED | DELETED"
        string channelInfo
        int messageId
        text errorMessage
        datetime runAt
    }

    syndication_configs {
        uuid id PK
        string platform UK
        string botToken
        string channelId
        string apiKey
        string apiSecret
        boolean isActive
        json extraConfig
        datetime createdAt
        datetime updatedAt
    }

    notifications {
        uuid id PK
        uuid userId FK "Cascade"
        string title
        string body
        string type
        json data
        boolean isRead
        datetime createdAt
    }

    settings {
        string key PK
        json value
        datetime updatedAt
    }

    agent_codes {
        uuid id PK
        string code UK
        uuid createdById
        string agentName
        string agentPhone
        boolean isUsed
        uuid usedById
        datetime expiresAt
        datetime createdAt
    }
```

### Key Schema Decisions

- **`agentId` is nullable** with `onDelete: SetNull` — protects listings when agents are deleted.
- **`categoryId` uses `onDelete: Restrict`** — prevents deleting categories that have listings.
- **`listingId` in SyndicationLog uses `onDelete: Cascade`** — deleting a listing removes its syndication logs.
- **`attributes` is a JSON field** — stores flexible key-value pairs defined by the category's `schemaRules`.
- **`stockQuantity` defaults to 0** — auto-decrements when status changes to SOLD, auto-archives when stock reaches 0.
- **`commissionPercent` is optional** — admin can set per-listing commission rates.

## Authentication Flow

### Login

```
1. Client sends POST /api/auth/login { email, password }
2. Server finds user by email, compares password with bcryptjs
3. Server generates JWT with { sub: user.id, email, role } and 7-day expiry
4. Server returns { success, data: { user, token } }
5. Client stores token in:
   - Admin App: expo-secure-store (native) or localStorage (web)
   - Admin Portal: localStorage
6. Client stores user object alongside token
```

### Request Authentication

```
1. Client attaches Authorization: Bearer <token> header to every request
2. authenticate() middleware extracts token from header
3. jwt.verify() validates token and decodes payload
4. Middleware fetches user from DB by decoded.sub (user.id)
5. If user not found → 401 "User no longer exists"
6. req.user = { id, email, name, phone, role }
7. authorize('SUPER_ADMIN') middleware checks req.user.role
```

### Token Storage

| Client | Storage Mechanism | Key |
|--------|------------------|-----|
| Admin App (native) | `expo-secure-store` | `auth_token` |
| Admin App (web) | `localStorage` | `auth_token` |
| Admin Portal | `localStorage` | `token` |

### Agent Registration Flow

```
1. Admin generates agent code: POST /api/auth/agent-codes { name, role, maxUses }
2. Server creates AgentCode with 6-digit code and expiry
3. Agent opens admin app → Signup → enters 6-digit code
4. Client calls POST /api/auth/verify-agent-code { code }
5. Server validates code (exists, not expired, not fully used), returns pre-filled name/phone
6. Agent completes signup: POST /api/auth/register { email, password, name, phone, agentCode }
7. Server creates User with role=AGENT, marks code as used
```

## Deployment Architecture

### Vercel Projects

| Project | Source Folder | Build Command | Output |
|---------|--------------|---------------|--------|
| **Backend** | `backend/` | `npx prisma generate` (vercel-build) | `api/index.js` → `@vercel/node` |
| **Public Website** | `public-website/` | `vite build` | Nitro preset (Vercel) |
| **Admin Portal** | `admin-portal/` | `tsc -b && vite build` | Static SPA |

### Backend Vercel Configuration

```json
{
  "version": 2,
  "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.js" }]
}
```

All routes are caught by the catch-all and handled by the Express app. The `api/index.js` file simply re-exports the Express app:

```js
import app from "../src/app.js";
export default app;
```

### Admin Portal Vercel Configuration

```json
{
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }],
  "redirects": [{ "source": "/favicon.ico", "destination": "/favicon-96x96.png", "permanent": false }]
}
```

SPA fallback for client-side routing.

### Database

- **Provider**: Supabase (managed PostgreSQL 15)
- **Region**: EU-West-3 (Paris)
- **Connection**: Pooled (port 6543) for queries, Direct (port 5432) for migrations
- **Migrations**: Run via `prisma migrate deploy` on Vercel build or manually

### Mobile App

- **Build**: EAS Build (Expo Application Services)
- **Output**: APK (Android), IPA (iOS)
- **Bundle ID**: `com.brostechnology.admin`
- **EAS Project ID**: `d706b125-4daf-4c2c-860a-537b89af730a`
