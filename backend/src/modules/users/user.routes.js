import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { register, login, getMe, updateMe } from './user.controller.js';
import { authenticate } from './auth.middleware.js';
import TelegramNotificationService from './telegramNotification.service.js';

const router = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve('../../uploads');

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const fs = await import('fs/promises');
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webp';
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    cb(null, `temp-${timestamp}-${random}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate(), getMe);
router.put('/me', authenticate(), upload.single('profileImage'), updateMe);

// Telegram connection endpoints
router.post('/telegram/connect', authenticate(), async (req, res, next) => {
  try {
    const { code, expiresAt } = await TelegramNotificationService.generateConnectionCode(req.user.id);
    res.status(200).json({
      success: true,
      data: { code, expiresAt, instructions: 'Message our bot with this code to connect' },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/telegram/verify', async (req, res, next) => {
  try {
    const { code, chatId } = req.body;
    if (!code || !chatId) {
      return res.status(400).json({ success: false, error: 'Code and chatId required' });
    }
    const result = await TelegramNotificationService.verifyConnectionCode(code, chatId);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.status(200).json({ success: true, message: 'Telegram connected successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/telegram/disconnect', authenticate(), async (req, res, next) => {
  try {
    await TelegramNotificationService.disconnect(req.user.id);
    res.status(200).json({ success: true, message: 'Telegram disconnected' });
  } catch (error) {
    next(error);
  }
});

router.get('/telegram/status', authenticate(), async (req, res, next) => {
  try {
    const status = await TelegramNotificationService.getConnectionStatus(req.user.id);
    res.status(200).json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
});

// Webhook for Telegram bot updates
router.post('/telegram/webhook', async (req, res, next) => {
  try {
    await TelegramNotificationService.handleBotUpdate(req.body);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[TelegramWebhook] Error:', error);
    res.status(200).json({ ok: true });
  }
});

// Configure bot commands
router.post('/telegram/configure', authenticate(), async (req, res, next) => {
  try {
    const result = await TelegramNotificationService.configureBotCommands();
    res.status(200).json({ success: result });
  } catch (error) {
    next(error);
  }
});

// Setup webhook URL with Telegram
router.post('/telegram/setup-webhook', authenticate(), async (req, res, next) => {
  try {
    const { webhookUrl } = req.body;
    if (!webhookUrl) {
      return res.status(400).json({ success: false, error: 'webhookUrl required' });
    }
    const result = await TelegramNotificationService.setWebhook(webhookUrl);
    res.status(200).json({ success: result });
  } catch (error) {
    next(error);
  }
});

// Get webhook info
router.get('/telegram/webhook-info', authenticate(), async (req, res, next) => {
  try {
    const info = await TelegramNotificationService.getWebhookInfo();
    res.status(200).json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
});

export default router;
