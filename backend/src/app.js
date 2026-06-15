import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './modules/users/user.routes.js';
import categoryRoutes from './modules/properties/category.routes.js';
import listingRoutes from './modules/properties/listing.routes.js';
import publicRoutes from './modules/properties/public.routes.js';
import syndicationRoutes from './modules/syndication/syndication.routes.js';
import { DynamicValidationError } from './modules/properties/dynamic.validation.js';
import TelegramNotificationService from './modules/users/telegramNotification.service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());

const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:19006',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://10.0.2.2:5000',
  'http://10.0.2.2:19006',
  'http://127.0.0.1:5000',
];

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin)) return callback(null, true);
    if (/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin)) return callback(null, true);
    if (process.env.NODE_ENV === 'development') return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/syndication', syndicationRoutes);

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

// Configure bot commands on startup
TelegramNotificationService.configureBotCommands().catch(() => {});
