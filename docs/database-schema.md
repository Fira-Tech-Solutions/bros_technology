# Database Schema

**File:** `backend/prisma/schema.prisma`

## Overview

The database uses PostgreSQL 15 with Prisma ORM. The schema defines 6 models with 4 enums.

## Enums

### Role
```prisma
enum Role {
  SUPER_ADMIN  // Full access - manage categories, commissions, syndication
  AGENT        // Manage own listings only
}
```

### ListingStatus
```prisma
enum ListingStatus {
  AVAILABLE
  PENDING
  SOLD
  ARCHIVED
}
```

### SyndicationStatus
```prisma
enum SyndicationStatus {
  PENDING
  SUCCESS
  FAILED
}
```

### SyndicationAction
```prisma
enum SyndicationAction {
  NEW_POST
  EDITED
  DELETED
}
```

---

## Models

### User

Maps to `users` table. Stores agent/admin accounts with social media links.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, UUID | Unique identifier |
| `email` | String | Unique | Login email |
| `password` | String | | Bcrypt hashed password |
| `name` | String | | Full name |
| `phone` | String | | Contact phone |
| `role` | Role | Default: AGENT | User role |
| `profileImage` | String? | | Profile picture URL |
| `facebook` | String? | | Facebook profile URL |
| `twitter` | String? | | Twitter profile URL |
| `instagram` | String? | | Instagram profile URL |
| `linkedin` | String? | | LinkedIn profile URL |
| `telegram` | String? | | Telegram profile URL |
| `whatsapp` | String? | | WhatsApp contact URL |
| `tiktok` | String? | | TikTok profile URL |
| `youtube` | String? | | YouTube channel URL |
| `website` | String? | | Personal website URL |
| `customSocials` | Json | Default: "[]" | Custom social links array |
| `passwordResetToken` | String? | | Password reset code |
| `passwordResetExpires` | DateTime? | | Reset token expiry |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | @updatedAt | Last update timestamp |

**Relations:**
- `listings` → Listing[] (one-to-many)
- `notifications` → Notification[] (one-to-many)

**Table mapping:** `@@map("users")`

---

### Category

Maps to `categories` table. Defines listing types with dynamic validation rules.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, UUID | Unique identifier |
| `name` | String | Unique | Category code (e.g., "REAL_ESTATE") |
| `displayName` | String | | Display name (e.g., "Houses & Apartments") |
| `icon` | String | | Icon identifier for frontend |
| `schemaRules` | Json | | Dynamic validation rules |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | @updatedAt | Last update timestamp |

**Relations:**
- `listings` → Listing[] (one-to-many)

**Table mapping:** `@@map("categories")`

**Schema Rules Example:**
```json
[
  { "field": "beds", "type": "number", "required": true },
  { "field": "baths", "type": "number", "required": true },
  { "field": "sqft", "type": "number", "required": false },
  { "field": "amenities", "type": "string", "required": false }
]
```

---

### Listing

Maps to `listings` table. Core marketplace listing with flexible attributes.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, UUID | Unique identifier |
| `title` | String | | Listing title |
| `description` | String | @db.Text | Full description |
| `price` | Decimal | @db.Decimal(12,2) | Price in local currency |
| `status` | ListingStatus | Default: AVAILABLE | Listing status |
| `city` | String | | City name |
| `neighborhood` | String | | Neighborhood/district |
| `images` | String[] | | Array of WebP image paths |
| `attributes` | Json | | Dynamic attributes matching schemaRules |
| `customTelegramCaption` | String? | @db.Text | Custom Telegram caption |
| `categoryId` | String | FK → Category | Category reference |
| `agentId` | String | FK → User | Agent reference |
| `viewsCount` | Int | Default: 0 | View counter |
| `commissionPercent` | Decimal? | @db.Decimal(5,2) | Commission percentage |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | @updatedAt | Last update timestamp |

**Relations:**
- `category` → Category (many-to-one)
- `agent` → User (many-to-one)
- `syndications` → SyndicationLog[] (one-to-many)

**Indexes:**
- `@@index([status])` - Filter by status
- `@@index([categoryId])` - Filter by category
- `@@index([city, neighborhood])` - Compound index for regional search

**Table mapping:** `@@map("listings")`

---

### SyndicationLog

Maps to `syndication_logs` table. Tracks all social media posting attempts.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, UUID | Unique identifier |
| `listingId` | String | FK → Listing | Related listing |
| `platform` | String | | Platform name (e.g., "TELEGRAM") |
| `status` | SyndicationStatus | Default: PENDING | Post status |
| `action` | SyndicationAction | Default: NEW_POST | Action type |
| `channelInfo` | String | | Target channel/group info |
| `messageId` | Int? | | Telegram message_id for edits |
| `errorMessage` | String? | @db.Text | Error details if failed |
| `runAt` | DateTime | Default: now() | Execution timestamp |

**Relations:**
- `listing` → Listing (many-to-one)

**Indexes:**
- `@@index([listingId])` - Filter by listing

**Table mapping:** `@@map("syndication_logs")`

---

### SyndicationConfig

Maps to `syndication_configs` table. Stores platform API credentials.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, UUID | Unique identifier |
| `platform` | String | Unique | Platform name (e.g., "TELEGRAM") |
| `botToken` | String? | | Bot API token |
| `channelId` | String? | | Channel/group ID |
| `apiKey` | String? | | Additional API key |
| `apiSecret` | String? | | Additional API secret |
| `isActive` | Boolean | Default: true | Enable/disable syndication |
| `extraConfig` | Json? | | Platform-specific settings |
| `createdAt` | DateTime | Default: now() | Creation timestamp |
| `updatedAt` | DateTime | @updatedAt | Last update timestamp |

**Table mapping:** `@@map("syndication_configs")`

---

### Notification

Maps to `notifications` table. In-app notification system.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, UUID | Unique identifier |
| `userId` | String | FK → User | Target user |
| `title` | String | | Notification title |
| `body` | String? | | Notification body |
| `type` | String | | Event type (e.g., "LISTING_CREATED") |
| `data` | Json? | | Extra payload (e.g., listingId) |
| `isRead` | Boolean | Default: false | Read status |
| `createdAt` | DateTime | Default: now() | Creation timestamp |

**Relations:**
- `user` → User (many-to-one)

**Indexes:**
- `@@index([userId, isRead])` - Efficient unread queries

**Table mapping:** `@@map("notifications")`

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │       │   Category   │       │Syndication   │
│──────────────│       │──────────────│       │    Config    │
│ id (PK)      │       │ id (PK)      │       │──────────────│
│ email (UQ)   │       │ name (UQ)    │       │ id (PK)      │
│ password     │       │ displayName  │       │ platform (UQ)│
│ name         │       │ icon         │       │ botToken     │
│ phone        │       │ schemaRules  │       │ channelId    │
│ role         │       │ createdAt    │       │ isActive     │
│ profileImage │       │ updatedAt    │       │ extraConfig  │
│ socials...   │       └──────┬───────┘       └──────────────┘
│ customSocials│              │
│ resetToken   │              │ 1:N
│ resetExpires │              │
│ createdAt    │              ▼
│ updatedAt    │       ┌──────────────┐
└──────┬───────┘       │   Listing    │
       │               │──────────────│
       │ 1:N           │ id (PK)      │
       │               │ title        │
       ▼               │ description  │
┌──────────────┐       │ price        │
│ Notification │       │ status       │
│──────────────│       │ city         │
│ id (PK)      │       │ neighborhood │
│ userId (FK)  │       │ images[]     │
│ title        │       │ attributes   │
│ body         │       │ categoryId(FK│
│ type         │       │ agentId (FK) │
│ data         │       │ viewsCount   │
│ isRead       │       │ commission%  │
│ createdAt    │       │ createdAt    │
└──────────────┘       │ updatedAt    │
                       └──────┬───────┘
                              │ 1:N
                              ▼
                       ┌──────────────┐
                       │Syndication   │
                       │    Log       │
                       │──────────────│
                       │ id (PK)      │
                       │ listingId(FK)│
                       │ platform     │
                       │ status       │
                       │ action       │
                       │ channelInfo  │
                       │ messageId    │
                       │ errorMessage │
                       │ runAt        │
                       └──────────────┘
```

## Migrations

Run migrations with:

```bash
npm run prisma:migrate
```

View database in browser:

```bash
npm run prisma:studio
```

## Seeding

Default users are seeded via:

```bash
npm run db:seed
```

**File:** `backend/prisma/seed.js`
