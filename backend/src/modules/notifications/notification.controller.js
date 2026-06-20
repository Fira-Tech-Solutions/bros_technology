import prisma from '../../config/prisma.js';
import crypto from 'crypto';

export async function listNotifications(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Math.min(100, parseInt(limit, 10) || 50),
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);

    return res.status(200).json({
      success: true,
      data: { notifications, total, unreadCount, page: parseInt(page, 10) },
    });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req, res, next) {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

// Helper to create a notification (used by other modules)
export async function createNotification(userId, title, body, type, data = null) {
  try {
    return await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        title,
        body,
        type,
        data: data || undefined,
      },
    });
  } catch (err) {
    console.error('[Notifications] Failed to create notification:', err.message);
    return null;
  }
}
