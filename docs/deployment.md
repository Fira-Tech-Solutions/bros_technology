# Deployment

## Docker Compose

### Database Setup

**File:** `DataBase/docker-compose.yml`

```yaml
services:
  postgres-db:
    image: postgres:15-alpine
    container_name: marketplace_postgres
    restart: always
    environment:
      POSTGRES_USER: dev_admin
      POSTGRES_PASSWORD: dev_secure_password123
      POSTGRES_DB: marketplace_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  postgres-test-db:
    image: postgres:15-alpine
    container_name: marketplace_test_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: test_admin
      POSTGRES_PASSWORD: test_secure_password123
      POSTGRES_DB: marketplace_test_db
    ports:
      - "5433:5432"
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_admin -d marketplace_test_db"]
      interval: 5s
      timeout: 3s
      retries: 10
```

**Start databases:**

```bash
cd DataBase
docker compose up -d
```

**Stop databases:**

```bash
docker compose down
```

**Stop and remove volumes:**

```bash
docker compose down -v
```

---

## Environment Variables

### Backend (.env)

**File:** `backend/.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://dev_admin:dev_secure_password123@localhost:5432/marketplace_db` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT signing secret | **Required** |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `STORAGE_PROVIDER` | Image storage backend | `local` |
| `UPLOAD_DIR` | Local upload directory | `./uploads` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Optional |
| `CLOUDINARY_FOLDER` | Cloudinary folder path | Optional |
| `BREVO_API_KEY` | Brevo email API key | Optional |
| `BREVO_FROM_EMAIL` | Brevo sender email | Optional |

### Admin App (.env)

**File:** `admin-app/.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | Backend API URL | `http://10.84.83.221:5000` |

---

## NPM Scripts

### Backend

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `nodemon src/server.js` | Development with hot reload |
| `npm run start` | `node src/server.js` | Production server |
| `npm run prisma:generate` | `prisma generate` | Generate Prisma client |
| `npm run prisma:migrate` | `prisma migrate dev` | Run migrations |
| `npm run prisma:studio` | `prisma studio` | Open Prisma Studio |
| `npm run db:push` | `prisma db push` | Push schema to test DB |
| `npm run db:push:dev` | `prisma db push` | Push schema to dev DB |
| `npm run db:seed` | `node prisma/seed.js` | Seed default users |

### Testing

| Script | Command | Description |
|--------|---------|-------------|
| `npm run test` | `jest --runInBand` | Run tests |
| `npm run test:watch` | `jest --watch` | Watch mode |
| `npm run test:coverage` | `jest --coverage` | With coverage report |
| `npm run test:unit` | `jest --testPathPattern='unit'` | Unit tests only |
| `npm run test:integration` | `jest --testPathPattern='integration'` | Integration tests |
| `npm run test:ci` | `jest --coverage --ci` | CI mode |
| `npm run test:setup` | `docker compose up -d postgres-test-db` | Start test DB |
| `npm run test:teardown` | `docker compose down -v --filter name=marketplace_test_postgres` | Stop test DB |

---

## CORS Configuration

**File:** `backend/src/app.js:27-49`

Allowed origins:
- `http://localhost:5000` - Backend
- `http://localhost:19006` - Expo DevTools
- `http://localhost:3000` - Public website
- `http://localhost:5173` - Vite dev server
- `http://10.0.2.2:5000` - Android emulator
- `http://10.0.2.2:19006` - Android emulator Expo
- `http://127.0.0.1:5000` - Localhost
- `http://192.168.*.*:*` - Local network (regex)
- `http://10.*.*.*:*` - Local network (regex)

In development mode (`NODE_ENV=development`), all origins are allowed.

---

## Storage Configuration

### Local Storage

```env
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads
```

Files stored in `backend/uploads/` and served as static files.

### Cloudinary

```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLOUDINARY_FOLDER=listings
```

Images uploaded directly to Cloudinary, no local storage.

---

## Production Deployment

### Backend

```bash
# 1. Install dependencies
npm install --production

# 2. Generate Prisma client
npx prisma generate

# 3. Run migrations
npx prisma migrate deploy

# 4. Start server
node src/server.js
```

### Public Website

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Start production server
npm run start
```

### Admin App (Expo)

```bash
# 1. Install dependencies
npm install

# 2. Build for Android
npx expo build:android

# 3. Build for iOS
npx expo build:ios
```

---

## Health Check

The backend exposes a health check endpoint:

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-29T10:00:00.000Z"
}
```

---

## Default Users (Seeded)

| Email | Password | Role |
|-------|----------|------|
| admin@brostechnology.com | admin123 | SUPER_ADMIN |
| agent1@brostechnology.com | agent123 | AGENT |
| agent2@brostechnology.com | agent123 | AGENT |

**Seed command:**

```bash
npm run db:seed
```
