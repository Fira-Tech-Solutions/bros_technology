# Security

## Overview

The platform implements multiple security layers to protect user data and prevent common vulnerabilities.

## Authentication Security

### Password Hashing

**Implementation:** bcrypt with 12 salt rounds

```javascript
// backend/src/modules/users/user.controller.js
const hashedPassword = await bcrypt.hash(password, 12);
```

**Why bcrypt:**
- Slow by design (prevents brute force)
- Salted (prevents rainbow tables)
- 12 rounds = ~250ms per hash (adjustable)

### JWT Tokens

**Configuration:**
- Algorithm: HS256 (default)
- Expiry: 7 days (configurable via `JWT_EXPIRES_IN`)
- Payload: `{ sub: userId, email, role }`

**Best Practices:**
- Token in Authorization header (not URL)
- Short expiry (7 days)
- No sensitive data in payload

### Generic Error Messages

```javascript
// Prevents user enumeration
return res.status(401).json({
  success: false,
  error: 'Invalid email or password',  // Generic message
});
```

---

## Password Reset Security

### Token Generation

- 6-digit numeric code
- 15-minute expiry
- Stored hashed in database

### Email Enumeration Prevention

```javascript
// Always returns success, even if email not found
return res.status(200).json({
  success: true,
  message: 'If the email exists, a reset code has been sent',
});
```

---

## HTTP Security

### Helmet

**File:** `backend/src/app.js:25`

```javascript
app.use(helmet());
```

**Protection:**
- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security
- And more...

### CORS

**File:** `backend/src/app.js:37-49`

```javascript
app.use(cors({
  origin(origin, callback) {
    // Validate origin against allowed list
    // Regex patterns for local network
    // All origins allowed in development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## Input Validation

### Dynamic Attribute Validation

**File:** `backend/src/modules/properties/dynamic.validation.js:49-96`

```javascript
export function validateDynamicAttributes(attributes, schemaRules) {
  // Type coercion and validation
  // Returns sanitized attributes
  // Throws DynamicValidationError with field-level details
}
```

**Supported Types:**
- `number` - Numeric validation
- `string` - String trimming and validation
- `boolean` - Truthy/falsy conversion
- `date` - Date parsing and validation

### Request Validation

```javascript
// Required field validation
if (!title || !description || !price || !city || !neighborhood || !categoryId || !agentId) {
  return res.status(400).json({
    success: false,
    error: 'Missing required fields',
  });
}
```

---

## File Upload Security

### File Type Validation

```javascript
// backend/src/utils/imageProcessor.js:24-30
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/tiff',
]);
```

### File Size Limits

```javascript
// 10MB max per file
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 10 files max per request
const MAX_FILES = 10;
```

### Filename Sanitization

```javascript
// Remove special characters, limit length
const base = path.basename(originalname, path.extname(originalname))
  .replace(/[^a-zA-Z0-9_-]/g, '_')
  .slice(0, 64);
```

---

## Role-Based Access Control (RBAC)

### Roles

| Role | Permissions |
|------|------------|
| `SUPER_ADMIN` | Full access - categories, commissions, syndication, all listings |
| `AGENT` | Own listings only, own syndication logs |

### Implementation

```javascript
// Protected route
router.post('/config', authenticate(), authorize('SUPER_ADMIN'), handler);

// Agent ownership check
if (req.user.role === 'AGENT' && log.listing.agentId !== req.user.id) {
  return res.status(403).json({ error: 'Not authorized' });
}
```

---

## Data Protection

### Password Exclusion

```javascript
// Never return password in API responses
select: { id: true, email: true, name: true, phone: true, role: true }
```

### Sensitive Data in Environment

```env
# backend/.env
JWT_SECRET="..."           # Keep secret
CLOUDINARY_API_SECRET="..." # Keep secret
BREVO_API_KEY="..."        # Keep secret
```

### Environment Variable Validation

```javascript
// backend/src/modules/users/auth.middleware.js:7-9
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
```

---

## Network Security

### HTTPS (Production)

Use HTTPS in production:
- Let's Encrypt for free certificates
- Redirect HTTP to HTTPS
- Set secure cookies

### Rate Limiting

Consider adding rate limiting for:
- Login attempts
- Password reset requests
- API endpoints

---

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Known Vulnerabilities

The `.env` file contains secrets that should not be committed to version control.

**⚠️ Warning:** The current `.env` file contains:
- JWT secret
- Cloudinary credentials
- Brevo API key

These should be rotated and added to `.gitignore`.

---

## Security Checklist

- [x] Password hashing with bcrypt (12 rounds)
- [x] JWT authentication with expiry
- [x] Generic error messages (no user enumeration)
- [x] Helmet HTTP headers
- [x] CORS origin validation
- [x] Input validation and sanitization
- [x] File type and size limits
- [x] Role-based access control
- [x] Password exclusion from responses
- [ ] Rate limiting (recommended)
- [ ] HTTPS enforcement (production)
- [ ] Environment variables in .gitignore (needs fix)
