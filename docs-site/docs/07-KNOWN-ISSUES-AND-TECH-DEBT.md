# 07 — Known Issues & Tech Debt

## TODO/FIXME Comments in Code

No explicit `TODO` or `FIXME` comments were found in the codebase during analysis. However, several implicit issues exist (see below).

## Known Issues

### 1. EventEmitter Doesn't Work on Vercel

**File**: `backend/src/core/listingEmitter.js`, `backend/src/modules/syndication/listeners/telegramListener.js`

The `listingEmitter` (Node.js EventEmitter) is used to trigger Telegram syndication when listings are created/updated/deleted. On Vercel's serverless runtime, each request may run in a separate function instance, so EventEmitter events fired in one request won't be received by another.

**Current workaround**: Syndication is triggered manually via `POST /api/syndication/trigger/:listingId` from the admin portal/app. The auto-syndication on create/update/delete does NOT work on Vercel.

**NEEDS CONFIRMATION FROM DEVELOPER**: Was the EventEmitter approach intentionally kept for local development, or should auto-syndication be migrated to a different pattern (e.g., direct `TelegramBotService.sendListingToChannel()` calls in the controller)?

### 2. Categories Endpoints Have No Auth Middleware

**File**: `backend/src/modules/properties/category.routes.js`

All category endpoints (GET, POST, PATCH, DELETE) have no `authenticate()` or `authorize()` middleware. Any unauthenticated client can create, modify, or delete categories.

**Impact**: In production, anyone could tamper with the category structure. This was likely left open during development for convenience.

**NEEDS CONFIRMATION FROM DEVELOPER**: Should category CRUD be restricted to admin-only?

### 3. API URL Hardcoded in Multiple Places

**Files**:
- `admin-app/src/api/client.js` line 4
- `admin-app/src/screens/ListingDetailScreen.js` line 46
- `admin-app/src/screens/SyndicationConfigScreen.js` line 53
- `admin-app/app.config.js` line 53 (set but unused)
- `admin-portal/src/lib/api.ts` line 2

The backend API URL `https://bros-technology-api.vercel.app` is hardcoded in 4+ places across the admin app and 1 place in the admin portal. The `EXPO_PUBLIC_API_URL` env var is set in `app.config.js` but never imported by the code.

**Impact**: Changing the API URL requires editing multiple files. The env var approach was started but never completed.

### 4. Duplicate Product Options Files

**Files**:
- `admin-app/src/config/productOptions.js`
- `admin-portal/src/config/productOptions.ts`

These two files contain essentially the same 300+ product attribute option catalogs, maintained independently. One is JavaScript, the other TypeScript. Any updates to product options must be made in both files.

**Impact**: Risk of drift between mobile app and web portal product options.

### 5. Old Schema Copy in Backend

**File**: `backend/src/config/schema.prisma`

This is an outdated copy of the Prisma schema (missing many fields that the main `prisma/schema.prisma` has). It's not imported or used anywhere.

**Impact**: Confusion for developers who find it. Should be deleted.

### 6. Missing Error Handling in Admin App API Calls

**Files**: Various screens in `admin-app/src/screens/`

Many API calls in the admin app use try/catch with generic error messages. The `api/client.js` response interceptor handles 401, but other errors (403, 404, 500) are caught generically in each screen.

**Impact**: Users may see vague "Failed to load" messages without understanding what went wrong.

## Code Smells

### 1. Very Large Files

| File | Lines | Concern |
|------|-------|---------|
| `admin-app/src/screens/AddListingScreen.js` | 1061 | Single file handles 3-step wizard, image picker, drag-to-reorder, dynamic fields |
| `admin-app/src/screens/ListingDetailScreen.js` | 675 | Complex form with image management, dynamic fields, status changes |
| `admin-app/src/screens/SyndicationConfigScreen.js` | 1179 | Two-tab screen with config modal, log list, detail modal, caption editor |
| `admin-portal/src/pages/Login.tsx` | 488 | Split layout with brand showcase, form, dark mode toggle |
| `admin-portal/src/pages/Syndication.tsx` | 588 | Settings tab, posts tab, config modal, detail modal |
| `admin-portal/src/pages/AddListing.tsx` | 544 | 3-step wizard with custom dropdowns |
| `admin-portal/src/pages/ListingDetail.tsx` | 487 | Two-column layout with dynamic fields |

These files could benefit from decomposition into smaller components.

### 2. Duplicated Logic

- **Brand-dependent model selection**: The logic for filtering models based on selected brand is implemented separately in `AddListingScreen.js`, `ListingDetailScreen.js` (admin-app), `AddListing.tsx`, and `ListingDetail.tsx` (admin-portal). Same pattern, 4 implementations.

- **Dynamic schema field rendering**: The logic for rendering form fields based on `schemaRules` (boolean toggles, select dropdowns, text inputs) is duplicated between admin-app and admin-portal.

- **Image upload/preview**: Image selection, preview, and removal logic is duplicated across Add Listing and Listing Detail in both admin-app and admin-portal.

### 3. Mixed Styling Approaches

- **Admin Portal**: Primarily inline `React.CSSProperties` using CSS custom properties. Tailwind CSS v4 is available but rarely used.
- **ContactSettings.tsx**: Uses Tailwind utility classes exclusively — inconsistent with the rest of the admin-portal.
- **Public Website**: Tailwind CSS v4 with shadcn/ui components.
- **Admin App**: React Native StyleSheet with theme tokens from `theme.js`.

### 4. Missing TypeScript in Admin App

The entire admin app is written in plain JavaScript (no TypeScript). This means:
- No type checking on API responses
- No autocomplete for component props
- Runtime errors that could be caught at compile time

### 5. Inconsistent API Response Handling

The backend returns `{ success, data, pagination }` but the frontend sometimes accesses `res.data.data` (axios wraps response in `res.data`), sometimes `res.data`, depending on the page. The admin-portal standardized on `res.data?.data || res.data` via TanStack Query hooks, but the admin-app still has inconsistent patterns.

## Out of Scope (Per Client Agreement)

The following features are **NOT part of the current build** and should NOT be added without explicit client approval:

1. **Payment gateway / Checkout** — The system is inquiry-based only. No online payments.
2. **Cart / Shopping cart** — No cart functionality. Customers contact the shop directly.
3. **User registration via website** — Public website is read-only. Registration happens through the admin app with agent codes.
4. **Product reviews / ratings** — Not implemented.
5. **Wishlist / favorites** — Not implemented.
6. **Multi-language product descriptions** — Products have a single description field. i18n is only for the UI.
7. **Inventory management alerts** — Stock quantity exists but there are no automated low-stock alerts.
8. **Analytics / reporting beyond finance** — No Google Analytics, no conversion tracking, no A/B testing.
9. **Multi-vendor / marketplace** — This is a single-shop system, not a marketplace.
10. **Mobile app push notifications for customers** — Push notifications are only in the admin app for agents/admins.
