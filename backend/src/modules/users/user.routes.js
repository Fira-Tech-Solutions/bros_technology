import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { register, login, getMe, updateMe, forgotPassword, resetPassword } from './user.controller.js';
import { authenticate } from './auth.middleware.js';

const router = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve('../../uploads');
const IS_SERVERLESS = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Use memory storage in serverless environments, disk storage otherwise
const storage = IS_SERVERLESS
  ? multer.memoryStorage()
  : multer.diskStorage({
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

// Forgot/Reset password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;