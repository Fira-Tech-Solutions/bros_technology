# API Reference

Base URL: `http://localhost:5000`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [...]  // For validation errors
}
```

---

## Health Check

### `GET /health`

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-29T10:00:00.000Z"
}
```

---

## Auth Endpoints

### `POST /api/auth/register`

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "min8characters",
  "name": "John Doe",
  "phone": "+251911234567",
  "role": "AGENT"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "AGENT",
    "token": "jwt_token"
  }
}
```

### `POST /api/auth/login`

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "AGENT",
    "token": "jwt_token"
  }
}
```

### `GET /api/auth/me` 🔒

Get current user profile.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+251911234567",
    "role": "AGENT",
    "profileImage": "url",
    "facebook": "url",
    "twitter": "url",
    "instagram": "url",
    "linkedin": "url",
    "telegram": "url",
    "whatsapp": "url",
    "tiktok": "url",
    "youtube": "url",
    "website": "url",
    "customSocials": []
  }
}
```

### `PUT /api/auth/me` 🔒

Update current user profile. Supports multipart form data for profile image.

**Request (multipart):**
- `name` - User name
- `phone` - Phone number
- `facebook`, `twitter`, `instagram`, `linkedin`, `telegram`, `whatsapp`, `tiktok`, `youtube`, `website` - Social links
- `customSocials` - JSON string of custom social links
- `profileImage` - Image file

### `POST /api/auth/forgot-password`

Request password reset code.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "If the email exists, a reset code has been sent"
}
```

### `POST /api/auth/reset-password`

Reset password with code.

**Request:**
```json
{
  "email": "user@example.com",
  "token": "123456",
  "newPassword": "newpassword123"
}
```

---

## Category Endpoints

### `GET /api/categories`

List all categories with listing counts.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "REAL_ESTATE",
      "displayName": "Houses & Apartments",
      "icon": "home",
      "schemaRules": [
        { "field": "beds", "type": "number", "required": true },
        { "field": "baths", "type": "number", "required": true },
        { "field": "sqft", "type": "number", "required": false }
      ],
      "_count": { "listings": 42 }
    }
  ]
}
```

### `GET /api/categories/:id`

Get single category.

### `POST /api/categories` 🔒

Create a new category.

**Request:**
```json
{
  "name": "VEHICLES",
  "displayName": "Vehicles & Cars",
  "icon": "car",
  "schemaRules": [
    { "field": "make", "type": "string", "required": true },
    { "field": "model", "type": "string", "required": true },
    { "field": "year", "type": "number", "required": true },
    { "field": "mileage", "type": "number", "required": false },
    { "field": "fuelType", "type": "string", "required": false }
  ]
}
```

### `PATCH /api/categories/:id` 🔒

Update a category.

### `DELETE /api/categories/:id` 🔒

Delete a category. Fails if listings exist.

---

## Listing Endpoints (Admin)

### `GET /api/listings`

List and filter listings with pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `status` | string | - | Filter by status |
| `categoryId` | string | - | Filter by category |
| `city` | string | - | Filter by city (case-insensitive) |
| `neighborhood` | string | - | Filter by neighborhood |
| `minPrice` | number | - | Minimum price |
| `maxPrice` | number | - | Maximum price |
| `search` | string | - | Search in title/description |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Modern Apartment in Bole",
      "description": "Spacious 3-bedroom apartment...",
      "price": 1500000,
      "status": "AVAILABLE",
      "city": "Addis Ababa",
      "neighborhood": "Bole",
      "images": ["uploads/image1.webp"],
      "attributes": { "beds": 3, "baths": 2, "sqft": 150 },
      "viewsCount": 42,
      "category": { "id": "uuid", "name": "REAL_ESTATE", "displayName": "Houses & Apartments" },
      "agent": { "id": "uuid", "name": "John Doe", "phone": "+251911234567" },
      "createdAt": "2026-07-29T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

### `GET /api/listings/:id`

Get listing detail. Increments view count.

### `POST /api/listings` 🔒

Create a new listing. Multipart form data.

**Request (multipart):**
- `title` - Listing title (required)
- `description` - Description (required)
- `price` - Price (required)
- `city` - City (required)
- `neighborhood` - Neighborhood (required)
- `categoryId` - Category ID (required)
- `agentId` - Agent ID (required)
- `attributes` - JSON string of dynamic attributes
- `customTelegramCaption` - Custom Telegram caption
- `status` - Listing status
- `images` - Image files (max 10)

### `PATCH /api/listings/:id` 🔒

Update a listing. Supports image replacement.

### `DELETE /api/listings/:id` 🔒

Delete a listing and cleanup images.

---

## Public Endpoints

### `GET /api/public/listings`

Public listings with filtering (no auth required).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Category name |
| `search` | string | Search term |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `beds` | number | Minimum bedrooms |
| `baths` | number | Minimum bathrooms |
| `amenities` | string | Comma-separated amenities |

### `GET /api/public/listings/:id`

Public property detail with agent social links.

---

## Syndication Endpoints

### `GET /api/syndication/config` 🔒

List all syndication configurations.

### `GET /api/syndication/config/:platform` 🔒

Get platform-specific config.

### `POST /api/syndication/config` 🔒 (Admin)

Create or update syndication config.

**Request:**
```json
{
  "platform": "TELEGRAM",
  "botToken": "123456:ABC-DEF...",
  "channelId": "@your_channel",
  "isActive": true
}
```

### `DELETE /api/syndication/config/:platform` 🔒 (Admin)

Delete syndication config.

### `GET /api/syndication/telegram/info` 🔒

Get bot and channel information.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "bot": {
      "id": 123456789,
      "first_name": "Marketplace Bot",
      "username": "marketplace_bot",
      "photoUrl": "https://..."
    },
    "channel": {
      "id": -1001234567890,
      "title": "Marketplace Channel",
      "username": "@marketplace",
      "memberCount": 1500,
      "photoUrl": "https://..."
    }
  }
}
```

### `POST /api/syndication/delete-message/:messageId` 🔒 (Admin)

Delete a Telegram message.

### `POST /api/syndication/edit-message/:messageId` 🔒 (Admin)

Edit a Telegram message caption.

**Request:**
```json
{
  "caption": "New caption text"
}
```

### `GET /api/syndication/logs` 🔒

List syndication logs with pagination and filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `status` | string | Filter by status |
| `action` | string | Filter by action |
| `listingId` | string | Filter by listing |

### `POST /api/syndication/retry/:id` 🔒

Retry a failed syndication.

---

## Notification Endpoints

### `GET /api/notifications` 🔒

List notifications with pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `unreadOnly` | boolean | Filter unread only |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "New Listing Created",
      "body": "\"Modern Apartment\" has been created",
      "type": "LISTING_CREATED",
      "data": { "listingId": "uuid" },
      "isRead": false,
      "createdAt": "2026-07-29T10:00:00.000Z"
    }
  ],
  "unreadCount": 5,
  "pagination": { "page": 1, "limit": 20, "total": 10 }
}
```

### `PUT /api/notifications/read-all` 🔒

Mark all notifications as read.

### `PUT /api/notifications/:id/read` 🔒

Mark a single notification as read.

---

## Commission Endpoints (Admin Only)

### `GET /api/commissions/summary` 🔒

Commission summary with totals.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalListings": 100,
    "totalCommissionPercent": 5.5,
    "totalEstimatedRevenue": 8250000
  }
}
```

### `GET /api/commissions/listings` 🔒

Listings with commission data (paginated).

### `PATCH /api/commissions/listing/:id` 🔒

Set commission percentage for a listing.

**Request:**
```json
{
  "commissionPercent": 2.5
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `P2002` | 409 | Unique constraint violation |
| `P2025` | 404 | Record not found |
| `MulterError` | 400 | File upload error |
| `DynamicValidationError` | 422 | Attribute validation failed |

---

## 🔒 Authentication Required

Endpoints marked with 🔒 require a valid JWT token in the Authorization header.

**Admin-only endpoints** require `role: "SUPER_ADMIN"`.
