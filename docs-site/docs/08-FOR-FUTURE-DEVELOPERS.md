# 08 — For Future Developers

## Where to Start

If you're picking this codebase up cold, read the docs in this order:

1. **[00-OVERVIEW.md](./00-OVERVIEW.md)** — What the system does, who it's for, how the pieces connect
2. **[01-GETTING-STARTED.md](./01-GETTING-STARTED.md)** — How to clone, install, and run locally
3. **[02-ARCHITECTURE.md](./02-ARCHITECTURE.md)** — Folder structure, data flow, database schema, auth flow
4. **[04-API-REFERENCE.md](./04-API-REFERENCE.md)** — Every endpoint, request/response shape

Then read the 3-5 most important files in each codebase (listed below).

## Key Files to Read First

### Backend

| File | Why |
|------|-----|
| `src/app.js` | Express app setup: middleware stack, route mounts, error handler. This is the entry point for understanding how requests flow. |
| `prisma/schema.prisma` | The single source of truth for all data models. Read this to understand what data exists and how it relates. |
| `src/modules/users/auth.middleware.js` | JWT authentication and role authorization. Every protected endpoint depends on this. |
| `src/modules/properties/listing.controller.js` | The most complex controller: CRUD, image processing, stock management, dynamic validation. |
| `src/modules/syndication/syndication.routes.js` | Telegram integration: config, posting, retry, message editing. |

### Admin Portal

| File | Why |
|------|-----|
| `src/App.tsx` | Router setup: all routes, protected/public route wrappers, provider hierarchy. |
| `src/index.css` | Design tokens (CSS custom properties), dark mode, responsive utilities. This IS the design system. |
| `src/lib/api.ts` | Axios instance with auth interceptor. Every API call goes through here. |
| `src/hooks/useListings.ts` | TanStack Query hook pattern. All other hooks follow this same structure. |
| `src/pages/Dashboard.tsx` | Shows how hooks, components, and design tokens come together in a page. |

### Admin App

| File | Why |
|------|-----|
| `App.js` | Root component: splash → auth → navigation. The app's entry point. |
| `src/api/client.js` | Axios instance with auth interceptor (same pattern as admin-portal). |
| `src/context/AuthContext.js` | Authentication state management: login, logout, token storage, user hydration. |
| `src/config/theme.js` | All color tokens, spacing, typography for light/dark mode. |
| `src/screens/AddListingScreen.js` | Most complex screen: 3-step wizard, image picker, dynamic fields. Shows the full pattern. |

### Public Website

| File | Why |
|------|-----|
| `src/routes/__root.tsx` | Root layout: providers, SEO, fonts, JSON-LD. The app shell. |
| `src/routes/catalog.tsx` | Catalog page: search, filters, grid. Most feature-rich page. |
| `src/lib/api/properties.ts` | TypeScript types and API functions. The data layer. |
| `src/styles.css` | Tailwind v4 config, OKLCH color tokens, custom utilities. |
| `src/hooks/use-properties.ts` | Data fetching pattern with TanStack Query. |

## Coding Conventions

### General

- **No comments in code** unless explicitly requested
- **TypeScript** in admin-portal and public-website; **JavaScript** in admin-app and backend
- **ES modules** (`import/export`) in backend and admin-portal; **CommonJS** (`require`) in admin-app (Expo default)

### Backend

- **Route files** export a `Router` instance. Controllers are separate files.
- **Middleware chain**: `authenticate()` → `authorize('SUPER_ADMIN')` → controller
- **Response format**: Always `{ success: true/false, data: ..., pagination: ... }`
- **Error handling**: Route-level try/catch → `next(error)` → global error handler in `app.js`
- **Prisma queries**: Use `include` or `select` to return related data. Never return raw Prisma objects to the client.

### Admin Portal

- **Styling**: Inline `React.CSSProperties` using CSS custom properties (`var(--color-primary)`, etc.)
- **State management**: TanStack Query for server state, React Context for auth/theme/language
- **Components**: Functional components with hooks. No class components.
- **Naming**: PascalCase for components (`AddListing.tsx`), camelCase for hooks (`useListings.ts`)
- **File structure**: One component per file, named to match the export

### Admin App

- **Styling**: `StyleSheet.create()` with theme tokens from `src/config/theme.js`
- **State management**: React Context only (no Redux)
- **Navigation**: React Navigation v7 with bottom tabs + stack navigators
- **API calls**: Via `src/api/*.js` modules, not directly in screens
- **Caching**: Two layers — API response cache (`utils/cache.js`) and disk image cache (`utils/mediaCache.js`)

### Public Website

- **Framework**: TanStack Start (SSR) with file-based routing
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Data fetching**: TanStack Query hooks + server-side loaders for SEO-critical pages
- **Components**: shadcn/ui for primitives, custom components for business logic

## Common Gotchas

### 1. Supabase Connection Strings

Use the **pooled** connection string (port 6543, `?pgbouncer=true`) for `DATABASE_URL` and the **direct** connection string (port 5432) for `DIRECT_URL`. Prisma requires the direct URL for `migrate deploy` but the pooled URL for runtime queries. Using the wrong one causes connection failures.

### 2. CORS Must Be Before Helmet

In `src/app.js`, `cors()` MUST be registered before `helmet()`. Helmet strips/overwrites CORS headers if registered first. This was a production bug that caused the admin portal to fail on Vercel.

### 3. PUT vs PATCH for Settings

The Settings page uses `PUT /api/settings` (not PATCH). The CORS config explicitly allows PUT method. If you add a new endpoint that uses PUT, make sure it's in the `methods` array in the CORS config.

### 4. FormData for Listing Updates

When updating a listing via `PATCH /api/listings/:id`, the body must be `multipart/form-data` (not JSON) because the endpoint supports image uploads. The `categoryId` field MUST be included even if unchanged, because the validation middleware requires it.

### 5. Listing Images Are Merged, Not Replaced

When updating a listing with new images, the new images are **appended** to the existing array, not replaced. Old images are cleaned up (deleted from Cloudinary) only when new images are provided AND the listing already had images.

### 6. Agent View Filtering

When a user with `role: AGENT` calls `GET /api/listings`, they only see their own listings (filtered by `agentId`). The admin-portal's `useListings` hook fetches ALL listings by auto-paginating, but this only works for `SUPER_ADMIN` users.

### 7. Stock Auto-Decrement

When a listing's status changes to `SOLD`, the `stockQuantity` is automatically decremented by 1. When stock reaches 0, the status is automatically changed to `ARCHIVED`. This happens in `updateListing` controller.

### 8. Dark Mode Class Naming

- **Admin Portal & Admin App**: Dark mode is activated by adding `.dark` class to `<html>` (or `<html>` in React Native)
- **Public Website**: Dark mode is the DEFAULT. Light mode is activated by adding `.light` class. This is inverted from the other codebases.

### 9. Product Options Must Be Updated in Two Places

If you add new brands, models, or options to the product catalog, you must update BOTH:
- `admin-app/src/config/productOptions.js`
- `admin-portal/src/config/productOptions.ts`

These files are independent and must be kept in sync manually.

### 10. Category Schema Rules Drive the UI

The form fields in Add Listing and Listing Detail are dynamically generated from the category's `schemaRules` JSON field. If a category has no `schemaRules`, no detail fields are shown. If you need to add a new field to a category's listings, update the category's `schemaRules` via the Categories admin page — don't modify the form code.
