import { Router } from 'express';
import axios from 'axios';
import prisma from '../../config/prisma.js';
import { getPublicListings, getPublicProperty, trackInquiryClick } from './public.controller.js';

const router = Router();

let botInfoCache = null;
let botInfoCacheTime = 0;
const BOT_INFO_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

router.get('/listings', getPublicListings);
router.get('/listings/:id', getPublicProperty);
router.post('/listings/:id/inquiry', trackInquiryClick);

router.get('/telegram-bot', async (_req, res) => {
  try {
    const now = Date.now();
    if (botInfoCache && now - botInfoCacheTime < BOT_INFO_CACHE_TTL) {
      return res.json({ success: true, data: botInfoCache });
    }

    const config = await prisma.syndicationConfig.findUnique({
      where: { platform: 'TELEGRAM' },
    });

    if (!config || !config.botToken) {
      return res.status(404).json({ success: false, error: 'Telegram bot not configured' });
    }

    const { data } = await axios.get(
      `https://api.telegram.org/bot${config.botToken}/getMe`,
      { timeout: 10000 },
    );

    if (!data.ok) {
      return res.status(502).json({ success: false, error: 'Failed to fetch bot info' });
    }

    const botInfo = {
      username: data.result.username,
      firstName: data.result.first_name,
      id: data.result.id,
    };

    botInfoCache = botInfo;
    botInfoCacheTime = now;

    return res.json({ success: true, data: botInfo });
  } catch (err) {
    console.error('[Public] Telegram bot info error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch bot info' });
  }
});

export default router;
