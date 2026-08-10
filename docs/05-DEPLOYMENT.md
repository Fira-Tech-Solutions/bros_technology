# 05 — Deployment

## Backend (Vercel)

### Automatic Deployment

The backend is deployed to Vercel via the `backend/` directory. Vercel detects the `vercel.json` and builds accordingly:

```json
{
  "version": 2,
  "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.js" }]
}
```

**Build command** (defined in `package.json`):
```json
"vercel-build": "npx prisma generate"
```

### Deployment Steps

1. Push to the `master` branch of the Git repository
2. Vercel automatically triggers a build
3. `prisma generate` runs during build to create the Prisma Client
4. The Express app is deployed as a Vercel serverless function

### Post-Deploy Manual Steps

1. **Run database migrations** (if schema changed):
   ```bash
   # Via Vercel CLI
   vercel env pull .env.local
   npx prisma migrate deploy
   
   # Or via Supabase SQL Editor
   # Paste the migration SQL and execute
   ```

2. **Seed categories** (if new default categories added):
   ```
   GET https://bros-technology-api.vercel.app/api/admin/seed-categories
   ```
   (Requires admin authentication)

3. **Verify health**:
   ```
   GET https://bros-technology-api.vercel.app/health
   ```

### Environment Variables in Vercel Dashboard

Set these in the Vercel project settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase pooled connection string |
| `DIRECT_URL` | Supabase direct connection string |
| `JWT_SECRET` | Strong random string (32+ chars) |
| `STORAGE_PROVIDER` | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `CLOUDINARY_FOLDER` | `Home/listings` |
| `BREVO_API_KEY` | Your Brevo API key |
| `BREVO_FROM_EMAIL` | `girmasamuel200@gmail.com` |
| `NODE_ENV` | `production` |

> **Important**: The `ALLOWED_ORIGINS` env var in Vercel should include the public website URL if it's not already hardcoded in `app.js`. The production origins are hardcoded in `app.js`:
> - `https://bros-technology-admin.vercel.app`
> - `https://bros-technology.vercel.app`

## Public Website (Vercel)

### Deployment Steps

1. Push to the `master` branch
2. Vercel detects the project and runs:
   ```bash
   vite build
   ```
3. Output is deployed as a Vercel Edge/Serverless function (Nitro preset)

### Environment Variables in Vercel Dashboard

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://bros-technology-api.vercel.app` |
| `VITE_SITE_URL` | `https://bros-technology.vercel.app` |
| `VITE_TELEGRAM_BOT_USERNAME` | `brostechnology` |

## Admin Web Portal (Vercel)

### Deployment Steps

1. Push to the `master` branch
2. Vercel runs:
   ```bash
   tsc -b && vite build
   ```
3. Output is a static SPA deployed to Vercel

### Vercel Configuration

```json
{
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }],
  "redirects": [{ "source": "/favicon.ico", "destination": "/favicon-96x96.png", "permanent": false }]
}
```

The SPA rewrite ensures client-side routing works (all paths serve `index.html`).

### Environment Variables

None required. The API URL is hardcoded in `src/lib/api.ts`.

## Admin Mobile App (EAS Build)

### Building APK (Android)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK (preview profile produces APK, not AAB)
eas build --platform android --profile preview

# Or for production
eas build --platform android --profile production
```

### Build Profiles (`eas.json`)

| Profile | Output | Distribution |
|---------|--------|-------------|
| `development` | Dev client | Internal |
| `preview` | APK | Internal |
| `production` | APK (Android), auto-increment (iOS) | Store |

### App Configuration (`app.config.js`)

| Field | Value |
|-------|-------|
| Name | BROS Technology |
| Slug | `admin-app` |
| Version | 1.1.0 |
| Bundle ID | `com.brostechnology.admin` |
| EAS Project ID | `d706b125-4daf-4c2c-860a-537b89af730a` |
| Owner | `codearchitect001` |

### Submitting to Stores

```bash
# Android (Google Play)
eas submit --platform android

# iOS (App Store)
eas submit --platform ios
```

## Database Migrations

### How Migrations Are Handled

The project uses **Prisma Migrate** (not `prisma db push` for production).

```bash
# Create a new migration (development)
npm run prisma:migrate

# Apply migrations in production
npx prisma migrate deploy
```

### Migration History

There are 14 migrations in `prisma/migrations/`:

1. `20260601175413_init` — Initial schema
2. `20260611210715_add_syndication_config` — SyndicationConfig table
3. `20260612061032_add_syndication_action_messageid` — SyndicationAction enum + columns
4. `20260613040002_add_profile_image_to_user` — User profileImage
5. `20260613043309_add_social_media_fields` — 9 social media columns
6. `20260613061124_add_telegram_chat_id` — Telegram chat fields (later removed from schema)
7. `20260613070737_add_telegram_user_info` — Telegram user fields (later removed from schema)
8. `20260617000001_add_custom_socials` — User customSocials JSON
9. `20260617000002_add_notifications` — Notifications table
10. `20260619054358_add_password_reset_fields` — Password reset token/expires
11. `20260619120000_add_commission_percent` — Listing commissionPercent
12. `20260808000001_make_agentid_nullable` — agentId nullable + SetNull
13. `20260809000001_add_stock_quantity` — Listing stockQuantity
14. `20260809000002_remove_city_neighborhood` — Drop city/neighborhood columns

### Applying Migrations on Supabase

Option 1: Via Vercel CLI
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

Option 2: Via Supabase SQL Editor
- Open Supabase dashboard → SQL Editor
- Paste the migration SQL from `prisma/migrations/YYYYMMDDHHMMSS_name/migration.sql`
- Execute

Option 3: Via Prisma (local)
```bash
npx prisma migrate deploy
```

## Rollback Procedure

### If a Backend Deploy Breaks Something

1. **Vercel rollback**: Go to Vercel dashboard → Deployments → find the last working deployment → "Promote to Production"

2. **Database rollback**: If a migration was applied that broke things:
   ```bash
   # Create a reversal migration
   npx prisma migrate dev --create-only --name rollback_description
   
   # Edit the generated SQL to reverse the changes
   # Apply it
   npx prisma migrate deploy
   ```

3. **Emergency**: Revert the Git commit and push:
   ```bash
   git revert HEAD
   git push
   ```

### If a Website Deploy Breaks Something

1. **Vercel rollback**: Same as backend — promote last working deployment

### If the Mobile App Has a Critical Bug

1. **Fix and rebuild**: Push a fix, rebuild APK, distribute via internal testing
2. **Users on old version**: The app calls the backend API, so as long as the API is compatible, old versions continue to work. Breaking API changes require app updates.
