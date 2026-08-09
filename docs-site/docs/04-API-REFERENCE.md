# 04 — API Reference

Base URL: `https://bros-technology-api.vercel.app`

All endpoints return JSON. Successful responses follow `{ success: true, data: ... }`. Error responses follow `{ success: false, error: "..." }`.

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | No | Register new user (requires agent code) |
| `POST` | `/api/auth/login` | No | Login, returns JWT + user |
| `GET` | `/api/auth/me` | Yes | Get current user profile |
| `PUT` | `/api/auth/me` | Yes | Update profile (supports `profileImage` file upload) |
| `POST` | `/api/auth/forgot-password` | No | Send 6-digit reset code to email |
| `POST` | `/api/auth/reset-password` | No | Reset password with code |

### POST `/api/auth/register`

**Request body:**
```json
{
  "email": "agent@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "+251911234567",
  "agentCode": "123456"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "AGENT" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### POST `/api/auth/login`

**Request body:**
```json
{ "email": "admin@brostechnology.com", "password": "Admin@12345" }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "SUPER_ADMIN" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### PUT `/api/auth/me`

**Request:** `multipart/form-data`
- `name` (string)
- `email` (string)
- `phone` (string)
- `profileImage` (file, optional, max 5MB)

**Response (200):**
```json
{ "success": true, "data": { "id": "...", "name": "...", "email": "...", "profileImage": "..." } }
```

## Agent Codes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/agent-codes` | Admin | Generate agent registration code |
| `GET` | `/api/auth/agent-codes` | Admin | List all agent codes |
| `DELETE` | `/api/auth/agent-codes/:id` | Admin | Revoke agent code |
| `POST` | `/api/auth/verify-agent-code` | No | Verify code during signup |
| `GET` | `/api/auth/agents` | Admin | List all registered agents |
| `DELETE` | `/api/auth/agents/:id` | Admin | Remove agent |

### POST `/api/auth/agent-codes`

**Request body:**
```json
{ "name": "Agent Name", "role": "AGENT", "maxUses": 1 }
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "...", "code": "123456", "agentName": "Agent Name", "expiresAt": "..." }
}
```

### POST `/api/auth/verify-agent-code`

**Request body:**
```json
{ "code": "123456" }
```

**Response (200):**
```json
{
  "success": true,
  "data": { "valid": true, "agentName": "...", "agentPhone": "..." }
}
```

## Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/categories` | No | List all categories with `listingCount` |
| `GET` | `/api/categories/:id` | No | Get category by ID |
| `POST` | `/api/categories` | No | Create category |
| `PATCH` | `/api/categories/:id` | No | Update category |
| `DELETE` | `/api/categories/:id` | No | Delete category |

> **Note**: Categories endpoints have no auth middleware. Any client can create/edit/delete categories. NEEDS CONFIRMATION FROM DEVELOPER — this may be intentional for development convenience but is a security concern in production.

### GET `/api/categories`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "IPHONES_SAMSUNG",
      "displayName": "iPhones & Samsung",
      "icon": "smartphone",
      "schemaRules": [
        { "field": "brand", "type": "string", "required": true },
        { "field": "model", "type": "select", "required": true, "options": ["iPhone 15", "..."] },
        { "field": "storage", "type": "select", "required": true, "options": ["64GB", "128GB", "..."] }
      ],
      "listingCount": 200
    }
  ]
}
```

### POST `/api/categories`

**Request body:**
```json
{
  "name": "PHONES",
  "displayName": "Phones",
  "icon": "smartphone",
  "schemaRules": [
    { "field": "brand", "type": "string", "required": true },
    { "field": "storage", "type": "select", "required": true, "options": ["64GB", "128GB", "256GB"] }
  ]
}
```

## Listings

| Method | Path | Auth | Upload | Description |
|--------|------|------|--------|-------------|
| `GET` | `/api/listings` | Yes | No | List/filter/paginate (agents see own only) |
| `GET` | `/api/listings/:id` | Yes | No | Get listing (increments viewsCount) |
| `POST` | `/api/listings` | Yes | Yes | Create listing with images |
| `PATCH` | `/api/listings/:id` | Yes | Yes | Update listing with images |
| `DELETE` | `/api/listings/:id` | Yes | No | Delete listing |

### GET `/api/listings`

**Query parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `status` | string | — | Filter by status |
| `categoryId` | string | — | Filter by category |
| `minPrice` | number | — | Minimum price |
| `maxPrice` | number | — | Maximum price |
| `search` | string | — | Search in title and description |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "iPhone 15 Pro Max",
      "description": "...",
      "price": 85000.00,
      "status": "AVAILABLE",
      "images": ["https://...", "https://..."],
      "attributes": { "brand": "Apple", "model": "iPhone 15 Pro Max", "storage": "256GB" },
      "categoryId": "...",
      "category": { "id": "...", "name": "IPHONES_SAMSUNG", "displayName": "iPhones & Samsung", "icon": "smartphone" },
      "agentId": "...",
      "agent": { "id": "...", "name": "Agent Name", "phone": "+251..." },
      "stockQuantity": 5,
      "viewsCount": 42,
      "createdAt": "2026-06-01T00:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 500, "totalPages": 25 }
}
```

### POST `/api/listings`

**Request:** `multipart/form-data`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Product title |
| `description` | string | No | Product description |
| `price` | number | Yes | Price in ETB |
| `categoryId` | string | Yes | Category ID |
| `agentId` | string | Yes | Agent user ID |
| `status` | string | No | Default: `AVAILABLE` |
| `attributes` | JSON string | No | Dynamic attributes as JSON string |
| `stockQuantity` | number | No | Default: `1` |
| `images` | file[] | No | Up to 10 images |

**Response (201):** Returns created listing object.

### PATCH `/api/listings/:id`

**Request:** `multipart/form-data` (same fields as POST, all optional)

**Important**: `categoryId` must be included in the body for validation middleware to work.

**Response (200):** Returns updated listing object.

### DELETE `/api/listings/:id`

**Response (200):**
```json
{ "success": true, "data": { "id": "..." } }
```

## Public Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/public/listings` | No | Public storefront listings |
| `GET` | `/api/public/listings/:id` | No | Public listing detail |
| `POST` | `/api/public/listings/:id/inquiry` | No | Track inquiry click |
| `GET` | `/api/public/filter-options` | No | Get filter options for category |
| `GET` | `/api/public/telegram-bot` | No | Get Telegram bot info (cached) |

### GET `/api/public/listings`

**Query parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Category display name (e.g., "iPhones & Samsung") |
| `q` | string | Search query |
| `priceMin` | number | Minimum price |
| `priceMax` | number | Maximum price |
| `brand` | string | Filter by brand |
| `condition` | string | Filter by condition |
| `storage` | string | Filter by storage |
| `ram` | string | Filter by RAM |
| `color` | string | Filter by color |
| `processor` | string | Filter by processor |
| `screenSize` | string | Filter by screen size |
| `os` | string | Filter by OS |
| `model` | string | Filter by model |
| `connectivity` | string | Filter by connectivity |
| `caseSize` | string | Filter by case size |
| `limit` | number | Max results (default 50, max 100) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "iPhone 15 Pro Max",
      "price": 85000,
      "inStock": true,
      "stockQuantity": 5,
      "brand": "Apple",
      "category": "iPhones & Samsung",
      "categoryId": "...",
      "attributes": { "brand": "Apple", "model": "iPhone 15 Pro Max", "storage": "256GB" },
      "tags": ["storage: 256GB", "color: Black Titanium", "condition: Brand New"],
      "hero": "https://...",
      "gallery": ["https://...", "https://..."],
      "description": "...",
      "features": ["Storage: 256GB", "Color: Black Titanium", "Condition: Brand New"]
    }
  ]
}
```

### POST `/api/public/listings/:id/inquiry`

**Request body:**
```json
{ "method": "telegram" }  // or "whatsapp" or "call"
```

**Response (200):**
```json
{ "success": true }
```

## Telegram Syndication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/syndication/config` | Yes | List syndication configs |
| `GET` | `/api/syndication/config/:platform` | Yes | Get config for platform |
| `POST` | `/api/syndication/config` | Admin | Create/update syndication config |
| `DELETE` | `/api/syndication/config/:platform` | Admin | Delete syndication config |
| `GET` | `/api/syndication/telegram/info` | Yes | Get bot + channel info |
| `POST` | `/api/syndication/telegram/setup-webhook` | Admin | Set webhook URL |
| `GET` | `/api/syndication/telegram/webhook-info` | Admin | Get webhook info |
| `POST` | `/api/syndication/telegram/webhook` | No | Webhook endpoint (stub, returns 200) |
| `POST` | `/api/syndication/delete-message/:messageId` | Admin | Delete Telegram message |
| `POST` | `/api/syndication/edit-message/:messageId` | Admin | Edit message caption |
| `GET` | `/api/syndication/logs` | Yes | List syndication logs (paginated) |
| `POST` | `/api/syndication/trigger/:listingId` | Yes | Manual trigger syndication |
| `POST` | `/api/syndication/retry/:id` | Yes | Retry failed syndication |

### POST `/api/syndication/config`

**Request body:**
```json
{
  "platform": "TELEGRAM",
  "botToken": "123456:ABC-DEF...",
  "channelId": "-1001234567890",
  "isActive": true
}
```

### POST `/api/syndication/trigger/:listingId`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listingId": "...",
    "messageId": 123,
    "message": "Posted to Telegram successfully"
  }
}
```

## Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/notifications` | Yes | List user notifications |
| `PUT` | `/api/notifications/read-all` | Yes | Mark all as read |
| `PUT` | `/api/notifications/:id/read` | Yes | Mark single as read |

## Commissions (Admin Only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/commissions/asset-stats` | Admin | Asset statistics dashboard |
| `GET` | `/api/commissions/summary` | Admin | Commission summary |
| `GET` | `/api/commissions/listings` | Admin | Commission-filtered listings |
| `PATCH` | `/api/commissions/listing/:id` | Admin | Update listing commission % |

### GET `/api/commissions/asset-stats`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalAssets": 500,
    "totalValue": 42500000.00,
    "totalStock": 2200,
    "AVAILABLE": 350,
    "SOLD": 100,
    "PENDING": 30,
    "ARCHIVED": 20,
    "byCategory": [
      {
        "categoryId": "...",
        "categoryName": "IPHONES_SAMSUNG",
        "categoryDisplayName": "iPhones & Samsung",
        "icon": "smartphone",
        "count": 200,
        "totalValue": 17000000.00,
        "totalStock": 880,
        "statusCounts": { "AVAILABLE": 140, "SOLD": 40, "PENDING": 12, "ARCHIVED": 8 }
      }
    ]
  }
}
```

## Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/settings` | No | Get store settings |
| `PUT` | `/api/settings` | Admin | Update store settings |

### GET `/api/settings`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "siteName": "BROS Technology",
    "whatsappNumber": "+251911234567",
    "callNumber1": "+251911234567",
    "callNumber2": "+251911234568",
    "telegramHandle": "@brostechnology",
    "contactEmail": "info@brostechnology.com",
    "facebookUrl": "https://facebook.com/brostechnology",
    "instagramUrl": "https://instagram.com/brostechnology",
    "location": "Addis Ababa, Ethiopia",
    "businessHours": "Mon-Sat: 9AM-6PM",
    "shopGoogleMapUrl": "https://maps.google.com/...",
    "shopMapAddress": "Bole Road, Addis Ababa"
  }
}
```

## Seed Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/admin/seed-categories` | Admin | Seed/refresh default categories |

Creates missing default categories (iPhones/Samsung, iPads/MacBooks, Laptops, AirPods, Smartwatches). Safe to call multiple times (upserts).

## Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check |

**Response (200):**
```json
{ "status": "ok", "timestamp": "2026-08-09T12:00:00.000Z" }
```

## Error Responses

### Validation Error (400)
```json
{ "success": false, "error": "Missing required fields: title, price, categoryId, agentId" }
```

### Authentication Error (401)
```json
{ "success": false, "error": "Token has expired" }
```

### Authorization Error (403)
```json
{ "success": false, "error": "Role \"AGENT\" is not authorized for this resource" }
```

### Not Found (404)
```json
{ "success": false, "error": "Listing with id \"...\" not found" }
```

### Conflict (409)
```json
{ "success": false, "error": "A record with that value already exists" }
```

### Dynamic Validation Error (422)
```json
{
  "success": false,
  "error": "Listing attributes validation failed",
  "details": [
    { "field": "storage", "message": "Expected string, received number", "received": 128 }
  ]
}
```

### Server Error (500)
```json
{ "success": false, "error": "Internal server error" }
```
