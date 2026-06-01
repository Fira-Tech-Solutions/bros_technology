import listingEmitter from '../../../core/listingEmitter.js';
import prisma from '../../../config/prisma.js';
import TelegramBotService from '../services/telegramBot.service.js';

async function handleSyndication(listingId, eventType) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        category: true,
        agent: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    if (!listing) {
      console.error(`[Syndication] Listing ${listingId} not found, skipping.`);
      return;
    }

    const logEntry = await prisma.syndicationLog.create({
      data: {
        listingId: listing.id,
        platform: 'TELEGRAM',
        status: 'PENDING',
        channelInfo: process.env.TELEGRAM_CHANNEL_ID || 'unknown',
      },
    });

    try {
      await TelegramBotService.sendListingToChannel(listing);

      await prisma.syndicationLog.update({
        where: { id: logEntry.id },
        data: { status: 'SUCCESS' },
      });

      console.log(
        `[Syndication] ${eventType} — Telegram broadcast succeeded for listing "${listing.title}" (${listing.id})`,
      );
    } catch (err) {
      const errorMessage = err.response?.data?.description || err.message || String(err);

      await prisma.syndicationLog.update({
        where: { id: logEntry.id },
        data: {
          status: 'FAILED',
          errorMessage,
        },
      });

      console.error(
        `[Syndication] ${eventType} — Telegram broadcast FAILED for listing "${listing.title}" (${listing.id}):`,
        errorMessage,
      );
    }
  } catch (err) {
    console.error(
      `[Syndication] Fatal error during ${eventType} syndication for listing ${listingId}:`,
      err.message,
    );
  }
}

export function initializeListingListeners() {
  listingEmitter.on('listing:created', (listingId) => {
    console.log(`[Listener] Received listing:created for listing ${listingId}`);
    handleSyndication(listingId, 'listing:created');
  });

  listingEmitter.on('listing:updated', (listingId) => {
    console.log(`[Listener] Received listing:updated for listing ${listingId}`);
    handleSyndication(listingId, 'listing:updated');
  });

  console.log('[Listener] Listing syndication listeners initialized');
}
