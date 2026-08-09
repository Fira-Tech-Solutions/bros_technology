# Architecture

## System Overview

Retailment Marketplace is a multi-component platform consisting of three main services:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Public Website    │     │    Backend API      │     │    Admin App        │
│   (TanStack Start)  │────▶│    (Express.js)     │◀────│    (React Native)   │
│   Port: 3000        │     │    Port: 5000       │     │    Port: 19006      │
└─────────────────────┘     └──────────┬──────────┘     └─────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────────┐
                              │    PostgreSQL 15     │
                              │    (Docker)          │
                              │    Port: 5432        │
                              └─────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────────┐
                              │    Telegram API      │
                              │    (Syndication)     │
                              └─────────────────────┘
```

## Backend Architecture

The backend follows a **modular monolith** pattern with domain-based organization:

```
src/
├── app.js                    # Express app setup, middleware, routes
├── server.js                 # Server bootstrap, DB connection
├── config/
│   └── prisma.js             # Prisma client singleton
├── core/
│   └── listingEmitter.js     # Central event bus (EventEmitter)
├── modules/
│   ├── users/                # Auth, registration, profile
│   ├── properties/           # Categories, listings, public API
│   ├── syndication/          # Telegram integration
│   ├── notifications/        # In-app notifications
│   └── commissions/          # Admin revenue tracking
└── utils/
    ├── imageProcessor.js     # Sharp-based image pipeline
    ├── cloudinary.js         # Cloud storage abstraction
    └── brevo.js              # Email service
```

### Key Architectural Patterns

#### 1. Event-Driven Syndication

Listing events trigger automatic Telegram posting via a centralized event emitter:

```javascript
// backend/src/core/listingEmitter.js:1-7
import { EventEmitter } from 'events';
const listingEmitter = new EventEmitter();
listingEmitter.setMaxListeners(20);
export default listingEmitter;
```

Events emitted:
- `listing:created` - New listing created
- `listing:updated` - Listing modified
- `listing:deleted` - Listing removed

#### 2. Dynamic Validation

Categories define `schemaRules` (JSON) that are validated against listing attributes at runtime:

```javascript
// backend/src/modules/properties/dynamic.validation.js:49-96
export function validateDynamicAttributes(attributes, schemaRules) {
  // Validates and sanitizes attributes based on category rules
  // Supports: number, string, boolean, date types
}
```

#### 3. Middleware Pipeline

Listing creation/update follows a strict middleware pipeline:

```javascript
// backend/src/modules/properties/listing.routes.js:18-23
const protectedWriteMiddleware = [
  authenticate(),           // JWT verification
  processImages,            // Multer file upload
  optimizeImages,           // Sharp resize + WebP conversion
  validateListingAttributes(), // Dynamic schema validation
];
```

#### 4. Dual Storage Backend

Images can be stored locally or on Cloudinary, configurable via environment:

```javascript
// backend/src/utils/imageProcessor.js:148-153
async function processSingleImage(file) {
  if (STORAGE_PROVIDER === 'cloudinary') {
    return processSingleImageCloudinary(file);
  }
  return processSingleImageLocal(file);
}
```

## Data Flow

### Listing Creation Flow

```
Client Request (multipart/form-data)
    │
    ▼
┌─────────────────┐
│ authenticate()  │ ── JWT verification ──▶ req.user
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ processImages   │ ── Multer upload to temp files
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ optimizeImages  │ ── Sharp resize (1200px) + WebP conversion
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ validateListingAttributes│ ── Dynamic schema validation
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│ createListing   │ ── Prisma create + emit event
└────────┬────────┘
         │
         ├──▶ Database (PostgreSQL)
         │
         └──▶ listingEmitter.emit('listing:created')
                  │
                  ▼
         ┌─────────────────────┐
         │ telegramListener    │ ── Async Telegram syndication
         └─────────────────────┘
```

### Telegram Syndication Flow

```
listing:created / listing:updated event
    │
    ▼
┌─────────────────────┐
│ handleSyndication() │
│ (telegramListener)  │
└────────┬────────────┘
         │
         ├── On update: Check for existing message
         │   ├── Found? → Try editMessageCaption()
         │   │   ├── Success → Log SUCCESS
         │   │   └── Failed → Fall through to new post
         │   └── Not found → Create new post
         │
         └── Create new post
              │
              ▼
         ┌─────────────────────┐
         │ sendListingToChannel│
         │ (telegramBot.service)│
         └────────┬────────────┘
                  │
                  ├── 1 image → sendPhoto()
                  └── 2+ images → sendMediaGroup()
                       │
                       ▼
                  Telegram API
```

## Frontend Architecture

### Public Website (TanStack Start)

```
src/
├── routes/
│   ├── __root.tsx           # Root layout with providers
│   ├── index.tsx            # Homepage (hero, categories, featured)
│   ├── catalog.tsx          # Search/filter page
│   └── property.$id.tsx     # Property detail page
├── components/
│   ├── Nav.tsx              # Desktop + mobile navigation
│   ├── PropertyCard.tsx     # Listing card with skeleton
│   ├── FilterPanel.tsx      # Search filters
│   └── ui/                  # 46 Radix-based UI primitives
├── hooks/                   # Custom React hooks
├── lib/
│   ├── api.ts               # API client (fetch wrapper)
│   └── i18n.ts              # Internationalization
└── providers/
    ├── theme.tsx             # Dark/light mode
    └── locale.tsx            # Language context (EN/OM/AM)
```

**Provider Hierarchy:**
```
QueryClientProvider (TanStack React Query)
  └── ThemeProvider (dark/light mode)
      └── LocaleProvider (language context)
          └── <Outlet /> (route content)
```

### Admin App (React Native)

```
src/
├── navigation/
│   └── MainNavigator.js     # Bottom tabs + stack navigators
├── screens/                 # 14 screens
│   ├── LoginScreen.js
│   ├── DashboardScreen.js
│   ├── PropertiesScreen.js
│   ├── AddListingScreen.js
│   └── ...
├── components/              # Reusable UI components
├── context/
│   ├── AuthContext.js        # JWT token management
│   ├── ThemeContext.js        # Dark/light mode
│   └── LanguageContext.js     # i18n
├── api/
│   ├── client.js             # Axios instance with interceptors
│   ├── auth.js               # Auth API calls
│   ├── listings.js           # Listing CRUD
│   └── ...
└── i18n/                     # Translation files
```

**Navigation Structure:**
```
BottomTabNavigator
├── DashboardTab (stack)
├── PropertiesTab (stack)
├── SyndicationTab (stack)
├── CommissionsTab (stack, ADMIN only)
└── SettingsTab (stack)
```

## Database Schema

See [Database Schema](./database-schema.md) for detailed model definitions.

### Entity Relationship

```
User ──1:N──▶ Listing ──1:N──▶ SyndicationLog
  │              │
  │              └──N:1──▶ Category
  │
  └──1:N──▶ Notification

SyndicationConfig (standalone)
```

## Error Handling

The backend implements a centralized error handler in `app.js:71-108`:

- **DynamicValidationError** → 422 with field-level details
- **Prisma P2002** (unique constraint) → 409 Conflict
- **Prisma P2025** (record not found) → 404 Not Found
- **MulterError** → 400 Bad Request
- **Generic errors** → 500 (message hidden in production)
