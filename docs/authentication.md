# Authentication

## Overview

The backend uses JWT (JSON Web Tokens) for authentication with two roles: `SUPER_ADMIN` and `AGENT`.

## Implementation

### Token Generation

**File:** `backend/src/modules/users/auth.middleware.js:11-17`

```javascript
export function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}
```

**JWT Payload:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "AGENT",
  "iat": 1722240000,
  "exp": 1722844800
}
```

**Configuration:**
- `JWT_SECRET` - Signing secret (from env)
- `JWT_EXPIRES_IN` - Token expiry (default: 7 days)

### Middleware

#### authenticate()

**File:** `backend/src/modules/users/auth.middleware.js:23-68`

Extracts and verifies JWT from Authorization header:

1. Checks for `Bearer <token>` format
2. Verifies token signature and expiry
3. Fetches user from database
4. Attaches `req.user` with: `id`, `email`, `name`, `phone`, `role`

**Error Responses:**
| Condition | Status | Message |
|-----------|--------|---------|
| Missing header | 401 | "Missing or malformed Authorization header" |
| Empty token | 401 | "Token is empty" |
| Expired token | 401 | "Token has expired" |
| Invalid token | 401 | "Invalid token" |
| User deleted | 401 | "User no longer exists" |

#### authorize(...allowedRoles)

**File:** `backend/src/modules/users/auth.middleware.js:71-86`

Checks user role against allowed roles:

```javascript
router.get('/admin-only', authenticate(), authorize('SUPER_ADMIN'), handler);
```

**Error Response:**
```json
{
  "success": false,
  "error": "Role \"AGENT\" is not authorized for this resource"
}
```

---

## Authentication Flow

### Registration

**Endpoint:** `POST /api/auth/register`

```
Client → Email + Password + Name + Phone + Role
    │
    ▼
Validate input (email format, password min 8 chars)
    │
    ▼
Check email uniqueness
    │
    ▼
Hash password with bcrypt (12 rounds)
    │
    ▼
Create user in database
    │
    ▼
Generate JWT token
    │
    ▼
Return user object + token
```

### Login

**Endpoint:** `POST /api/auth/login`

```
Client → Email + Password
    │
    ▼
Find user by email
    │
    ▼
Compare password with bcrypt
    │
    ├── Mismatch → "Invalid email or password" (generic message)
    │
    ▼
Generate JWT token
    │
    ▼
Return user object + token
```

### Password Reset

**Step 1: Request Reset**

**Endpoint:** `POST /api/auth/forgot-password`

```
Client → Email
    │
    ▼
Generate 6-digit numeric code
    │
    ▼
Store in passwordResetToken + passwordResetExpires (15 min)
    │
    ▼
Send via Brevo email service
    │
    ▼
Return success (always, even if email not found)
```

**Step 2: Reset Password**

**Endpoint:** `POST /api/auth/reset-password`

```
Client → Email + Code + New Password
    │
    ▼
Find user by email + reset token
    │
    ▼
Check token expiry (15 minutes)
    │
    ├── Expired → "Invalid or expired reset code"
    │
    ▼
Hash new password with bcrypt
    │
    ▼
Update password + clear reset fields
    │
    ▼
Return success
```

---

## Roles and Permissions

### SUPER_ADMIN

Full system access:
- Create/edit/delete categories
- Manage all listings
- Configure syndication (Telegram bot/channel)
- Delete/edit Telegram messages
- View all syndication logs
- Manage commissions
- View all users' listings

### AGENT

Limited access:
- Manage own listings only
- View own syndication logs
- Retry own failed syndications
- Update own profile
- View own notifications

**Implementation:**

```javascript
// Agent can only see own listings
if (req.user.role === 'AGENT') {
  where.listing = { agentId: req.user.id };
}

// Agent can only retry own syndications
if (req.user.role === 'AGENT' && log.listing.agentId !== req.user.id) {
  return res.status(403).json({ error: 'Not authorized' });
}
```

---

## Client-Side Token Management

### Admin App (React Native)

**File:** `admin-app/src/context/AuthContext.js`

```javascript
// Token stored in Expo SecureStore
await SecureStore.setItemAsync('auth_token', token);

// Auto-attached to all requests via Axios interceptor
api.interceptors.request.use((config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-clear on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

### Public Website

**File:** `public-website/src/lib/api.ts`

Token stored in memory or localStorage for SSR/hydration.

---

## Security Considerations

1. **Generic Error Messages** - "Invalid email or password" prevents user enumeration
2. **Password Reset Always Returns Success** - Prevents email enumeration
3. **Token Expiry** - 7-day default, configurable via `JWT_EXPIRES_IN`
4. **bcrypt Rounds** - 12 salt rounds for password hashing
5. **No Password in Responses** - Safe select patterns exclude password field
6. **Reset Token Expiry** - 15-minute window for password reset codes
