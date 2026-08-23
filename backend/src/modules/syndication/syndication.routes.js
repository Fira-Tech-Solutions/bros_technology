import { Router } from 'express';
import axios from 'axios';
import prisma from '../../config/prisma.js';
import { authenticate, authorize } from '../users/auth.middleware.js';
import TelegramBotService from './services/telegramBot.service.js';

const router = Router();

router.post('/telegram/webhook', async (req, res) => {
  return res.sendStatus(200);
});

router.post('/telegram/setup-webhook', authenticate(), authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { webhookUrl } = req.body;
    if (!webhookUrl) {
      return res.status(400).json({ success: false, error: 'webhookUrl is required' });
    }

    const config = await prisma.syndicationConfig.findUnique({
      where: { platform: 'TELEGRAM' },
    });

    if (!config || !config.botToken) {
      return res.status(400).json({ success: false, error: 'Telegram bot not configured' });
    }

    const { data } = await axios.post(
      `https://api.telegram.org/bot${config.botToken}/setWebhook`,
      { url: webhookUrl, allowed_updates: ['callback_query'] },
      { timeout: 10000 },
    );

    if (!data.ok) {
      return res.status(502).json({ success: false, error: data.description || 'Failed to set webhook' });
    }

    return res.json({ success: true, data: { url: webhookUrl } });
  } catch (err) {
    next(err);
  }
});

router.get('/telegram/webhook-info', authenticate(), authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const config = await prisma.syndicationConfig.findUnique({
      where: { platform: 'TELEGRAM' },
    });

    if (!config || !config.botToken) {
      return res.status(400).json({ success: false, error: 'Telegram bot not configured' });
    }

    const { data } = await axios.get(
      `https://api.telegram.org/bot${config.botToken}/getWebhookInfo`,
      { timeout: 10000 },
    );

    if (!data.ok) {
      return res.status(502).json({ success: false, error: data.description || 'Failed to get webhook info' });
    }

    return res.json({ success: true, data: data.result });
  } catch (err) {
    next(err);
  }
});

router.get('/config', authenticate(), async (req, res, next) => {
  try {
    const configs = await prisma.syndicationConfig.findMany({
      orderBy: { platform: 'asc' },
    });
    return res.status(200).json({ success: true, data: configs });
  } catch (error) {
    next(error);
  }
});

router.get('/config/:platform', authenticate(), async (req, res, next) => {
  try {
    const { platform } = req.params;
    const config = await prisma.syndicationConfig.findUnique({
      where: { platform: platform.toUpperCase() },
    });
    if (!config) {
      return res.status(404).json({ success: false, error: 'Config not found' });
    }
    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
});

router.post('/config', authenticate(), authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { platform, botToken, channelId, apiKey, apiSecret, isActive, extraConfig } = req.body;
    if (!platform) {
      return res.status(400).json({ success: false, error: 'Platform is required' });
    }
    const config = await prisma.syndicationConfig.upsert({
      where: { platform: platform.toUpperCase() },
      update: {
        ...(botToken !== undefined && { botToken }),
        ...(channelId !== undefined && { channelId }),
        ...(apiKey !== undefined && { apiKey }),
        ...(apiSecret !== undefined && { apiSecret }),
        ...(isActive !== undefined && { isActive }),
        ...(extraConfig !== undefined && { extraConfig }),
      },
      create: {
        platform: platform.toUpperCase(),
        botToken: botToken || null,
        channelId: channelId || null,
        apiKey: apiKey || null,
        apiSecret: apiSecret || null,
        isActive: isActive !== false,
        extraConfig: extraConfig || null,
      },
    });
    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
});

router.delete('/config/:platform', authenticate(), authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { platform } = req.params;
    await prisma.syndicationConfig.delete({
      where: { platform: platform.toUpperCase() },
    });
    return res.status(200).json({ success: true, data: { platform: platform.toUpperCase() } });
  } catch (error) {
    next(error);
  }
});

router.get('/telegram/info', authenticate(), async (req, res, next) => {
  try {
    const [botInfo, channelInfo] = await Promise.all([
      TelegramBotService.getBotInfo(),
      TelegramBotService.getChannelInfo(),
    ]);
    return res.status(200).json({
      success: true,
      data: { bot: botInfo, channel: channelInfo },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/delete-message/:messageId', authenticate(), authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { logId } = req.body;

    await TelegramBotService.deleteMessage(parseInt(messageId, 10));

    if (logId) {
      await prisma.syndicationLog.update({
        where: { id: logId },
        data: { status: 'SUCCESS', action: 'DELETED' },
      });
    }

    return res.status(200).json({ success: true, data: { deleted: true } });
  } catch (error) {
    next(error);
  }
});

router.post('/edit-message/:messageId', authenticate(), authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { caption } = req.body;
    if (!caption) {
      return res.status(400).json({ success: false, error: 'Caption is required' });
    }
    const result = await TelegramBotService.editMessageCaption(parseInt(messageId, 10), caption);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/logs', authenticate(), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, action, listingId } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};
    if (status) where.status = status;
    if (action) where.action = action;
    if (listingId) where.listingId = listingId;

    if (req.user.role === 'AGENT') {
      where.listing = { agentId: req.user.id };
    }

    const [logs, total] = await Promise.all([
      prisma.syndicationLog.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { runAt: 'desc' },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
              category: true,
            },
          },
        },
      }),
      prisma.syndicationLog.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/trigger/:listingId', authenticate(), async (req, res, next) => {
  try {
    const { listingId } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        category: true,
        agent: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (req.user.role === 'AGENT' && listing.agentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to syndicate this listing' });
    }

    // Directly post to Telegram (works in serverless unlike EventEmitter)
    const logEntry = await prisma.syndicationLog.create({
      data: {
        listingId: listing.id,
        platform: 'TELEGRAM',
        status: 'PENDING',
        action: 'NEW_POST',
        channelInfo: process.env.TELEGRAM_CHANNEL_ID || 'unknown',
      },
    });

    try {
      const result = await TelegramBotService.sendListingToChannel(listing);
      await prisma.syndicationLog.update({
        where: { id: logEntry.id },
        data: { status: 'SUCCESS', messageId: result.messageId || null },
      });
      return res.status(200).json({
        success: true,
        data: { listingId: listing.id, messageId: result.messageId, message: 'Posted to Telegram successfully' },
      });
    } catch (err) {
      const errorMessage = err.response?.data?.description || err.message || String(err);
      console.error('[Syndication] Trigger inner error:', errorMessage);
      try {
        await prisma.syndicationLog.update({
          where: { id: logEntry.id },
          data: { status: 'FAILED', errorMessage },
        });
      } catch (logErr) {
        console.error('[Syndication] Failed to update log:', logErr.message);
      }
      return res.status(500).json({ success: false, error: `Failed to post to Telegram: ${errorMessage}` });
    }
  } catch (error) {
    console.error('[Syndication] Trigger outer error:', error.message, error.stack);
    next(error);
  }
});

router.post('/retry/:id', authenticate(), async (req, res, next) => {
  try {
    const { id } = req.params;

    const log = await prisma.syndicationLog.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            category: true,
            agent: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
      },
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: `Syndication log with id "${id}" not found`,
      });
    }

    if (req.user.role === 'AGENT' && log.listing.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to retry this syndication',
      });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: log.listingId },
      include: {
        category: true,
        agent: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'The associated listing no longer exists',
      });
    }

    // Directly post to Telegram (works in serverless)
    await prisma.syndicationLog.update({
      where: { id },
      data: { status: 'PENDING', errorMessage: null },
    });

    try {
      const result = await TelegramBotService.sendListingToChannel(listing);
      await prisma.syndicationLog.update({
        where: { id },
        data: { status: 'SUCCESS', messageId: result.messageId || null },
      });
    } catch (err) {
      const errorMessage = err.response?.data?.description || err.message || String(err);
      await prisma.syndicationLog.update({
        where: { id },
        data: { status: 'FAILED', errorMessage },
      });
      return res.status(500).json({ success: false, error: `Retry failed: ${errorMessage}` });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: log.id,
        listingId: log.listingId,
        status: 'SUCCESS',
        message: 'Re-syndication completed successfully',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
