# Retailment Marketplace — API Documentation

Base URL: `http://localhost:5000`

All responses use the envelope format:

```json
{
  "success": true | false,
  "data": { ... },
  "error": "...",
  "details": [...]
}
```

---

## Table of Contents

- [Authentication](#authentication)
- [Health Check](#health-check)
- [Auth Endpoints](#auth-endpoints)
- [Category Endpoints](#category-endpoints)
- [Listing Endpoints](#listing-endpoints)
- [Image Upload](#image-upload)
- [Dynamic Attribute Validation](#dynamic-attribute-validation)
- [Event System & Telegram Syndication](#event-system--telegram-syndication)
- [Error Handling](#error-handling)
- [Data Models](#data-models)

---

## Authentication

Protected endpoints require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

**JWT payload:**

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "AGENT"
}
```

- **Signing secret:** `JWT_SECRET` env var
- **Default expiry:** 7 days (`JWT_EXPIRES_IN` env var)

**Auth middleware error responses:**

| Status | Condition |
|--------|-----------|
| 401 | Missing or malformed `Authorization` header |
| 401 | Empty token after `Bearer ` |
| 401 | Expired token |
| 401 | Invalid token (wrong signature, malformed) |
| 401 | User no longer exists in database |
| 401 | Not authenticated (missing `req.user`) |
| 403 | Role not in allowed roles (`authorize()` middleware) |

---

## Health Check

### `GET /health`

No authentication required.

**Response 200:**

```json
{
  "status": "ok",
  "timestamp": "2026-06-01T12:00:00.000Z"
}
```

---

## Auth Endpoints

### `POST /api/auth/register`

Register a new user account.

**Request body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | yes | Valid email format; lowercased and trimmed |
| `password` | string | yes | Minimum 8 characters; bcrypt-hashed (12 rounds) |
| `name` | string | yes | Trimmed |
| `phone` | string | yes | Trimmed |
| `role` | string | no | `"AGENT"` (default) or `"SUPER_ADMIN"` |

**Response 201:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "agent@example.com",
      "name": "John Doe",
      "phone": "+251911000000",
      "role": "AGENT",
      "createdAt": "2026-06-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `Missing required fields: email, password, name, phone` |
| 400 | `Password must be at least 8 characters` |
| 400 | `Invalid email format` |
| 409 | `An account with this email already exists` |

**Notes:**
- Password is never returned in responses.
- The returned user object uses a safe select: `{ id, email, name, phone, role, createdAt }`.

---

### `POST /api/auth/login`

Authenticate and receive a JWT.

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | yes |
| `password` | string | yes |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "agent@example.com",
      "name": "John Doe",
      "phone": "+251911000000",
      "role": "AGENT",
      "createdAt": "2026-06-01T12:00:00.000Z",
      "updatedAt": "2026-06-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `Email and password are required` |
| 401 | `Invalid email or password` |

**Notes:**
- Uses the same generic error for both wrong email and wrong password (security best practice).
- The user object may include `listings` and `updatedAt` (uses raw Prisma result with password destructured out).

---

### `GET /api/auth/me`

Get the currently authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "agent@example.com",
    "name": "John Doe",
    "phone": "+251911000000",
    "role": "AGENT",
    "createdAt": "2026-06-01T12:00:00.000Z"
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 401 | `Missing or malformed Authorization header` |
| 401 | `Token is empty` |
| 401 | `Token has expired` |
| 401 | `Invalid token` |
| 401 | `User no longer exists` |
| 404 | `User not found` |

---

## Category Endpoints

All category endpoints are public (no authentication required).

### `GET /api/categories`

List all categories with listing counts.

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "REAL_ESTATE",
      "displayName": "Real Estate",
      "icon": "home",
      "schemaRules": [
        { "field": "bedrooms", "type": "number", "required": true },
        { "field": "bathrooms", "type": "number", "required": true },
        { "field": "area", "type": "number", "required": false }
      ],
      "listingCount": 42,
      "createdAt": "2026-06-01T12:00:00.000Z",
      "updatedAt": "2026-06-01T12:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/categories/:id`

Get a single category by ID.

**Path params:** `id` — Category UUID

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "CARS",
    "displayName": "Vehicles & Cars",
    "icon": "car",
    "schemaRules": [
      { "field": "mileage", "type": "number", "required": true },
      { "field": "year", "type": "number", "required": true },
      { "field": "fuelType", "type": "string", "required": false }
    ],
    "listingCount": 15,
    "createdAt": "2026-06-01T12:00:00.000Z",
    "updatedAt": "2026-06-01T12:00:00.000Z"
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Category with id "<id>" not found` |

---

### `POST /api/categories`

Create a new category.

**Request body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | yes | Stored uppercased; must be unique |
| `displayName` | string | yes | Human-readable label |
| `icon` | string | no | Frontend icon identifier; defaults to `"tag"` |
| `schemaRules` | array | no | Validation rules for listing attributes |

**schemaRules format:**

```json
[
  { "field": "mileage", "type": "number", "required": true },
  { "field": "year", "type": "number", "required": true },
  { "field": "fuelType", "type": "string", "required": false },
  { "field": "hasAC", "type": "boolean", "required": false }
]
```

Supported types: `"number"`, `"string"`, `"boolean"`, `"date"`.

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "ELECTRONICS",
    "displayName": "Electronics & Gadgets",
    "icon": "laptop",
    "schemaRules": [...],
    "createdAt": "2026-06-01T12:00:00.000Z",
    "updatedAt": "2026-06-01T12:00:00.000Z"
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `Fields "name" and "displayName" are required` |
| 400 | `"schemaRules" must be an array of field rule objects` |
| 400 | `Each schema rule must contain "field" and "type". Received: {...}` |
| 409 | `Category "<name>" already exists` |

---

### `PATCH /api/categories/:id`

Update an existing category.

**Path params:** `id` — Category UUID

**Request body:** All fields optional.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Stored uppercased |
| `displayName` | string | |
| `icon` | string | |
| `schemaRules` | array | Replaced entirely if provided |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "CARS",
    "displayName": "Vehicles & Cars",
    "icon": "car",
    "schemaRules": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Category with id "<id>" not found` |
| 400 | `"schemaRules" must be an array of field rule objects` |
| 409 | `Category "<name>" already exists` |

---

## Listing Endpoints

### `GET /api/listings`

List listings with filtering, search, and pagination.

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | `1` | Page number (min 1) |
| `limit` | integer | `20` | Results per page (1–100) |
| `status` | string | — | Filter by `ListingStatus` enum |
| `categoryId` | string | — | Filter by category UUID |
| `city` | string | — | Case-insensitive contains match |
| `neighborhood` | string | — | Case-insensitive contains match |
| `minPrice` | number | — | Price >= value |
| `maxPrice` | number | — | Price <= value |
| `search` | string | — | Case-insensitive match on `title` OR `description` |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "2020 Toyota Camry",
      "description": "Low mileage, single owner...",
      "price": 25000.00,
      "status": "AVAILABLE",
      "city": "Addis Ababa",
      "neighborhood": "Bole",
      "images": ["uploads/1717238400000-a1b2c3d4-camry.webp"],
      "attributes": { "mileage": 50000, "year": 2020, "fuelType": "petrol" },
      "customTelegramCaption": null,
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "name": "CARS",
        "displayName": "Vehicles & Cars",
        "icon": "car"
      },
      "agentId": "uuid",
      "agent": {
        "id": "uuid",
        "name": "John Doe",
        "phone": "+251911000000"
      },
      "viewsCount": 42,
      "createdAt": "2026-06-01T12:00:00.000Z",
      "updatedAt": "2026-06-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Notes:**
- List view includes category `{ id, name, displayName, icon }` and agent `{ id, name, phone }` (no email).
- Ordered by `createdAt` descending.

---

### `GET /api/listings/:id`

Get a single listing. Increments `viewsCount` by 1 on each call.

**Path params:** `id` — Listing UUID

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "2020 Toyota Camry",
    "description": "Low mileage, single owner...",
    "price": 25000.00,
    "status": "AVAILABLE",
    "city": "Addis Ababa",
    "neighborhood": "Bole",
    "images": ["uploads/1717238400000-a1b2c3d4-camry.webp"],
    "attributes": { "mileage": 50000, "year": 2020 },
    "customTelegramCaption": null,
    "categoryId": "uuid",
    "category": {
      "id": "uuid",
      "name": "CARS",
      "displayName": "Vehicles & Cars",
      "icon": "car",
      "schemaRules": [...]
    },
    "agentId": "uuid",
    "agent": {
      "id": "uuid",
      "name": "John Doe",
      "phone": "+251911000000",
      "email": "john@example.com"
    },
    "viewsCount": 43,
    "createdAt": "2026-06-01T12:00:00.000Z",
    "updatedAt": "2026-06-01T12:00:00.000Z"
  }
}
```

**Notes:**
- Detail view includes the full category object and agent with `email` (unlike list view).

**Errors:**

| Status | Message |
|--------|---------|
| 404 | `Listing with id "<id>" not found` |

---

### `POST /api/listings`

Create a new listing with optional images.

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Trimmed |
| `description` | string | yes | Trimmed |
| `price` | number | yes | Parsed to float |
| `city` | string | yes | Trimmed |
| `neighborhood` | string | yes | Trimmed |
| `categoryId` | string | yes | Must exist in categories table |
| `agentId` | string | yes | Must exist in users table |
| `attributes` | object | no | JSON object validated against category `schemaRules` |
| `customTelegramCaption` | string | no | Custom caption for Telegram syndication |
| `status` | string | no | Defaults to `"AVAILABLE"` |
| `images` | file[] | no | Up to 10 files (see [Image Upload](#image-upload)) |

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "2020 Toyota Camry",
    "description": "Low mileage...",
    "price": 25000.00,
    "status": "AVAILABLE",
    "city": "Addis Ababa",
    "neighborhood": "Bole",
    "images": ["uploads/1717238400000-a1b2c3d4-camry.webp"],
    "attributes": { "mileage": 50000 },
    "customTelegramCaption": null,
    "categoryId": "uuid",
    "category": { ... },
    "agentId": "uuid",
    "agent": { "id": "...", "name": "...", "phone": "...", "email": "..." },
    "viewsCount": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Side effects:**
- Emits `listing:created` event (triggers Telegram syndication).

**Errors:**

| Status | Source | Message |
|--------|--------|---------|
| 400 | controller | `Missing required fields: title, description, price, city, neighborhood, categoryId, agentId` |
| 400 | dynamic validation | `categoryId is required` |
| 400 | multer | `Upload error: <message>` (file too large, too many files, etc.) |
| 400 | multer fileFilter | `File type "<mimetype>" is not allowed. Accepted: ...` |
| 404 | controller | `Agent with id "<agentId>" not found` |
| 404 | dynamic validation | `Category with id "<categoryId>" not found` |
| 422 | dynamic validation | `Dynamic attribute validation failed` (see [Dynamic Attribute Validation](#dynamic-attribute-validation)) |

---

### `PATCH /api/listings/:id`

Update an existing listing. Supports partial updates and image replacement.

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Path params:** `id` — Listing UUID

**Form fields:** All optional.

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Trimmed |
| `description` | string | Trimmed |
| `price` | number | Parsed to float |
| `city` | string | Trimmed |
| `neighborhood` | string | Trimmed |
| `categoryId` | string | Validated against category |
| `agentId` | string | |
| `attributes` | object | Replaced entirely (including empty `{}`) |
| `customTelegramCaption` | string | Set to `null` if falsy |
| `status` | string | |
| `images` | file[] | If new images uploaded, old images are deleted from disk |

**Response 200:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Side effects:**
- Emits `listing:updated` event.
- If new images are uploaded and the listing already has images, old images are asynchronously deleted from disk.

**Errors:**

| Status | Source | Message |
|--------|--------|---------|
| 400 | dynamic validation | `categoryId is required` |
| 400 | multer | `Upload error: <message>` |
| 404 | controller | `Listing with id "<id>" not found` |
| 404 | dynamic validation | `Category with id "<categoryId>" not found` |
| 422 | dynamic validation | `Dynamic attribute validation failed` |

---

## Image Upload

**Configuration:**

| Setting | Value |
|---------|-------|
| Upload directory | `./uploads/` (configurable via `UPLOAD_DIR` env) |
| Max file size | 10 MB |
| Max files per request | 10 |
| Field name | `images` |
| Accepted MIME types | `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/tiff` |
| Output format | WebP (quality 80) |
| Max output width | 1200px (without enlargement, fit inside) |

**Processing pipeline:**
1. Files are temporarily stored with name `temp-<timestamp>-<randomHex>.<ext>`
2. Each file is validated against allowed MIME types
3. Sharp resizes to max 1200px width (without enlargement) and converts to WebP
4. Output saved as `<timestamp>-<randomHex>-<sanitized_original_name>.webp`
5. Temp file is deleted after processing
6. On error, both temp and output files are cleaned up

**Stored paths:** Relative to project root, e.g. `uploads/1717238400000-a1b2c3d4-camry.webp`

**Example multipart request:**

```bash
curl -X POST http://localhost:5000/api/listings \
  -H "Authorization: Bearer <token>" \
  -F "title=2020 Toyota Camry" \
  -F "description=Low mileage vehicle" \
  -F "price=25000" \
  -F "city=Addis Ababa" \
  -F "neighborhood=Bole" \
  -F "categoryId=uuid" \
  -F "agentId=uuid" \
  -F 'attributes={"mileage":50000,"year":2020}' \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg"
```

---

## Dynamic Attribute Validation

Categories define `schemaRules` — an array of validation rules applied to listing `attributes` at create/update time.

**Rule format:**

```json
{
  "field": "fieldName",
  "type": "number|string|boolean|date",
  "required": true|false
}
```

**Type coercion rules:**

| Type | Accepted inputs | Coercion logic |
|------|-----------------|----------------|
| `number` | numbers, numeric strings | Parsed with `Number()`; rejects `NaN` |
| `string` | any non-null value | Converted to trimmed string |
| `boolean` | booleans, `"true"/"false"/"1"/"0"/"yes"/"no"`, numbers (0 = false) | Coerced to boolean |
| `date` | Date objects, ISO strings, timestamps | Converted to Date; rejects invalid dates |
| *(unknown)* | any | Passed through as-is (no validation) |

**Error response (422):**

```json
{
  "success": false,
  "error": "Dynamic attribute validation failed",
  "details": [
    { "field": "bedrooms", "message": "Field \"bedrooms\" is required", "type": "REQUIRED" },
    { "field": "mileage", "message": "Field \"mileage\" must be a valid number", "type": "INVALID_TYPE" }
  ]
}
```

**Example — Real Estate category:**

```json
{
  "schemaRules": [
    { "field": "bedrooms", "type": "number", "required": true },
    { "field": "bathrooms", "type": "number", "required": true },
    { "field": "area", "type": "number", "required": false },
    { "field": "furnished", "type": "boolean", "required": false }
  ]
}
```

**Listing attributes payload:**

```json
{
  "bedrooms": 4,
  "bathrooms": 3,
  "area": 350,
  "furnished": true
}
```

Type coercion example: `{ "bedrooms": "3", "furnished": "true" }` is coerced to `{ "bedrooms": 3, "furnished": true }`.

---

## Event System & Telegram Syndication

**Event emitter:** `listingEmitter` (Node.js `EventEmitter` singleton, maxListeners: 20)

| Event | Trigger | Payload |
|-------|---------|---------|
| `listing:created` | `POST /api/listings` success | Full listing object (with category + agent) |
| `listing:updated` | `PATCH /api/listings/:id` success | Full updated listing object |

**Telegram listener flow:**

1. Event fires → `handleSyndication(listingId, eventType)`
2. Fetches full listing from DB (with category + agent)
3. Creates `SyndicationLog` record: `platform: "TELEGRAM"`, `status: "PENDING"`
4. Calls `TelegramBotService.sendListingToChannel(listing)`
5. On success: log updated to `status: "SUCCESS"`
6. On failure: log updated to `status: "FAILED"` with `errorMessage`

**Telegram message format:**

```
*2020 Toyota Camry*

💰 *Price:* $25,000.00
📍 *Location:* Bole, Addis Ababa
🏷 *Category:* Vehicles & Cars
📋 *Status:* AVAILABLE

*Details:*
  Mileage: 50000
  Year: 2020

Low mileage, single owner...

─────────────────
👤 *Agent:* John Doe
📞 *Phone:* +251911000000

Listed on _RetailMeNot Marketplace_
```

- Single image: sent as `sendPhoto`
- Multiple images (2–10): sent as `sendMediaGroup`
- Custom caption: if `customTelegramCaption` is set, it replaces the auto-generated caption
- Timeout: 30 seconds per Telegram API call

---

## Error Handling

Global error handler in `app.js` maps errors to status codes:

| Error Type | Status | Response |
|------------|--------|----------|
| `DynamicValidationError` | 422 | `{ success: false, error: "...", details: [...] }` |
| Prisma `P2002` (unique constraint) | 409 | `{ success: false, error: "A record with that value already exists" }` |
| Prisma `P2025` (record not found) | 404 | `{ success: false, error: "Record not found" }` |
| `MulterError` | 400 | `{ success: false, error: "Upload error: <message>" }` |
| All other errors | 500 | `{ success: false, error: "Internal server error" }` |

In development (`NODE_ENV !== "production"`), 500 errors include the original error message.

---

## Data Models

### User

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `email` | string | Unique |
| `password` | string | bcrypt hash (12 rounds) |
| `name` | string | |
| `phone` | string | |
| `role` | enum | `AGENT` (default), `SUPER_ADMIN` |
| `createdAt` | datetime | Auto |
| `updatedAt` | datetime | Auto |

### Category

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | string | Unique, uppercased |
| `displayName` | string | |
| `icon` | string | Frontend icon identifier |
| `schemaRules` | JSON | Array of validation rule objects |
| `createdAt` | datetime | Auto |
| `updatedAt` | datetime | Auto |

### Listing

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | string | |
| `description` | text | |
| `price` | decimal(12,2) | |
| `status` | enum | `AVAILABLE` (default), `PENDING`, `SOLD`, `ARCHIVED` |
| `city` | string | Indexed |
| `neighborhood` | string | Compound index with `city` |
| `images` | string[] | WebP file paths; index 0 = cover photo |
| `attributes` | JSON | Flexible key/value matching category schema |
| `customTelegramCaption` | text | Optional |
| `categoryId` | string | FK → Category (onDelete: Restrict) |
| `agentId` | string | FK → User (onDelete: Cascade) |
| `viewsCount` | int | Default 0 |
| `createdAt` | datetime | Auto |
| `updatedAt` | datetime | Auto |

**Indexes:** `[status]`, `[categoryId]`, `[city, neighborhood]`

### SyndicationLog

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `listingId` | string | FK → Listing (onDelete: Cascade) |
| `platform` | string | `"TELEGRAM"`, `"FACEBOOK"`, `"INSTAGRAM"` |
| `status` | enum | `PENDING` (default), `SUCCESS`, `FAILED` |
| `channelInfo` | string | Target channel/group ID |
| `errorMessage` | text | Optional, raw API failure string |
| `runAt` | datetime | Auto |

---

## Endpoint Summary

| Method | Path | Auth | Upload | Description |
|--------|------|------|--------|-------------|
| `GET` | `/health` | No | No | Health check |
| `POST` | `/api/auth/register` | No | No | Register new user |
| `POST` | `/api/auth/login` | No | No | Login, get JWT |
| `GET` | `/api/auth/me` | Yes | No | Get current user profile |
| `GET` | `/api/categories` | No | No | List all categories |
| `GET` | `/api/categories/:id` | No | No | Get category by ID |
| `POST` | `/api/categories` | No | No | Create category |
| `PATCH` | `/api/categories/:id` | No | No | Update category |
| `GET` | `/api/listings` | No | No | List/filter/paginate listings |
| `GET` | `/api/listings/:id` | No | No | Get listing detail (+1 view) |
| `POST` | `/api/listings` | Yes | Yes | Create listing with images |
| `PATCH` | `/api/listings/:id` | Yes | Yes | Update listing with images |
