import listingEmitter from '../../../core/listingEmitter.js';
import prisma from '../../../config/prisma.js';
import TelegramBotService from '../services/telegramBot.service.js';

let listenersInitialized = false;

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

    // On update: try to edit existing Telegram post in-place
    if (eventType === 'listing:updated') {
      const existingLog = await prisma.syndicationLog.findFirst({
        where: {
          listingId: listing.id,
          platform: 'TELEGRAM',
          status: 'SUCCESS',
          messageId: { not: null },
        },
        orderBy: { runAt: 'desc' },
      });

      if (existingLog?.messageId) {
        const logEntry = await prisma.syndicationLog.create({
          data: {
            listingId: listing.id,
            platform: 'TELEGRAM',
            status: 'PENDING',
            action: 'EDITED',
            channelInfo: existingLog.channelInfo,
            messageId: existingLog.messageId,
          },
        });

        try {
          const caption = TelegramBotService.buildCaption(listing);
          await TelegramBotService.editMessageCaption(existingLog.messageId, caption);

          await prisma.syndicationLog.update({
            where: { id: logEntry.id },
            data: { status: 'SUCCESS' },
          });

          console.log(
            `[Syndication] ${eventType} — Telegram EDITED in-place for listing "${listing.title}" (${listing.id}) — message_id: ${existingLog.messageId}`,
          );
          return;
        } catch (err) {
          const errorMessage = err.response?.data?.description || err.message || String(err);

          // If edit fails (message deleted, etc.), fall through to create new post
          console.warn(
            `[Syndication] Edit failed for listing "${listing.title}", falling back to new post:`,
            errorMessage,
          );

          await prisma.syndicationLog.update({
            where: { id: logEntry.id },
            data: { status: 'FAILED', errorMessage: `Edit failed, fallback to new post: ${errorMessage}` },
          });
          // Continue to create new post below
        }
      }
    }

    // Create new post (listing:created, or listing:updated with no existing message)
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
        data: {
          status: 'SUCCESS',
          messageId: result.messageId || null,
        },
      });

      console.log(
        `[Syndication] ${eventType} — Telegram NEW_POST succeeded for listing "${listing.title}" (${listing.id}) — message_id: ${result.messageId}`,
      );
    } catch (err) {
      const errorMessage = err.response?.data?.description || err.message || String(err);

      await prisma.syndicationLog.update({
        where: { id: logEntry.id },
        data: { status: 'FAILED', errorMessage },
      });

      console.error(
        `[Syndication] ${eventType} — Telegram NEW_POST FAILED for listing "${listing.title}" (${listing.id}):`,
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
  if (listenersInitialized) {
    console.log('[Listener] Listing syndication listeners already initialized, skipping');
    return;
  }

  listingEmitter.on('listing:created', (listingId) => {
    console.log(`[Listener] Received listing:created for listing ${listingId}`);
    handleSyndication(listingId, 'listing:created');
  });

  listingEmitter.on('listing:updated', (listingId) => {
    console.log(`[Listener] Received listing:updated for listing ${listingId}`);
    handleSyndication(listingId, 'listing:updated');
  });

  listenersInitialized = true;
  console.log('[Listener] Listing syndication listeners initialized');
}
