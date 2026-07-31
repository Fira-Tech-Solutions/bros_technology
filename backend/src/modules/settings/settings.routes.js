import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller.js';
import { authenticate, authorize } from '../users/auth.middleware.js';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate(), authorize('SUPER_ADMIN'), updateSettings);

export default router;
