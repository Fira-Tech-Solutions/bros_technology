import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './modules/users/user.routes.js';
import agentCodeRoutes from './modules/users/agentCode.routes.js';
import categoryRoutes from './modules/properties/category.routes.js';
import listingRoutes from './modules/properties/listing.routes.js';
import publicRoutes from './modules/properties/public.routes.js';
import syndicationRoutes from './modules/syndication/syndication.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import commissionRoutes from './modules/commissions/commission.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import seedCategoriesRoutes from './modules/properties/seedCategories.routes.js';
import { DynamicValidationError } from './modules/properties/dynamic.validation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Disable ETag generation — 304 responses strip CORS headers on Vercel's edge,
// causing "CORS header does not match" errors when multiple origins hit the
// same endpoint. Always return 200 with full CORS headers instead.
app.set('etag', false);

// Prevent any caching of API responses (CORS headers must be fresh per-request).
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Parse allowed origins from environment variable
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

const productionOrigins = [
  'https://api.broslaptop.com',
  'https://www.broslaptop.com',
  'https://broslaptop.com',
  'https://admin.broslaptop.com',
  'https://bros-technology-api-henna.vercel.app'
];

const devOrigins = [
  'http://localhost:3000',
  'http://localhost:3001'
];

// Production origins are always allowed; env var and dev origins are merged in
const allowedOrigins = [...new Set([...productionOrigins, ...allowedOriginsEnv, ...devOrigins])];

// CORS — MUST be registered before helmet()
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = allowedOrigins.includes(origin) ||
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) ||
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin) ||
    (!origin && process.env.NODE_ENV !== 'production');

  if (allowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowed && !origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(helmet());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', userRoutes);
app.use('/api/auth', agentCodeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/syndication', syndicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/seed-categories', seedCategoriesRoutes);

if (process.env.STORAGE_PROVIDER !== 'cloudinary') {
  app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
}

app.use((err, _req, res, _next) => {
  if (err instanceof DynamicValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.errors,
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'A record with that value already exists',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found',
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }

  console.error('[Server] Unhandled error:', err);
  return res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
});

export default app;
