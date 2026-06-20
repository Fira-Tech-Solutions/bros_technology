import { Router } from 'express';
import { listNotifications, markRead, markAllRead } from './notification.controller.js';
import { authenticate } from '../users/auth.middleware.js';

const router = Router();

router.get('/', authenticate(), listNotifications);
router.put('/read-all', authenticate(), markAllRead);
router.put('/:id/read', authenticate(), markRead);

export default router;
