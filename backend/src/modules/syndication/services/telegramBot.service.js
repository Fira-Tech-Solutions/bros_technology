import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import prisma from '../../../config/prisma.js';

const MAX_IMAGES_IN_GROUP = 10;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_CAPTION_LENGTH = 1024;

async function getTelegramConfig() {
  const config = await prisma.syndicationConfig.findUnique({
    where: { platform: 'TELEGRAM' },
  });
  return config;
}

async function resolveFileUrl(fileId, botToken) {
  try {
    const { data } = await axios.get(
      `https://api.telegram.org/bot${botToken}/getFile`,
      { params: { file_id: fileId }, timeout: 10000 }
    );
    if (data.ok && data.result.file_path) {
      return `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
    }
  } catch {}
  return null;
}

function formatPrice(price) {
  if (!price) return 'Price on request';
  const num = Number(price);
  if (Number.isNaN(num)) return 'Price on request';
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAttributes(attributes, schemaRules) {
  if (!attributes || typeof attributes !== 'object') return [];
  if (!Array.isArray(schemaRules) || schemaRules.length === 0) return [];

  const lines = [];
  for (const rule of schemaRules) {
    const value = attributes[rule.field];
    if (value === undefined || value === null || value === '') continue;
    const label = rule.field
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase());
    lines.push(`  ${label}: ${value}`);
  }
  return lines;
}

function buildCaption(listing) {
  if (listing.customTelegramCaption && listing.customTelegramCaption.trim()) {
    return listing.customTelegramCaption.trim();
  }

  const title = listing.title || 'Untitled Listing';
  const price = formatPrice(listing.price);
  const city = listing.city || '';
  const neighborhood = listing.neighborhood || '';
  const location = [neighborhood, city].filter(Boolean).join(', ') || 'Location not specified';
  const phone = listing.agent?.phone || 'N/A';
  const agentName = listing.agent?.name || 'N/A';
  const category = listing.category?.displayName || listing.category?.name || '';
  const status = listing.status || 'AVAILABLE';

  const attrLines = formatAttributes(listing.attributes, listing.category?.schemaRules);
  const description = listing.description
    ? listing.description.length > 200
      ? `${listing.description.slice(0, 200)}...`
      : listing.description
    : '';

  const sections = [
    `*${title}*`,
    '',
    `💰 *Price:* ${price}`,
    `📍 *Location:* ${location}`,
    `🏷 *Category:* ${category}`,
    `📋 *Status:* ${status}`,
  ];

  if (attrLines.length > 0) {
    sections.push('', '*Details:*');
    sections.push(...attrLines);
  }

  if (description) {
    sections.push('', description);
  }

  sections.push(
    '',
    '─────────────────',
    `👤 *Agent:* ${agentName}`,
    `📞 *Phone:* ${phone}`,
    '',
    'Listed on _RetailMeNot Marketplace_',
  );

  return sections.join('\n');
}

function buildMediaCaption(listing) {
  const full = buildCaption(listing);
  if (full.length <= MAX_CAPTION_LENGTH) return full;
  const title = listing.title || 'Untitled Listing';
  const price = formatPrice(listing.price);
  const city = listing.city || '';
  const neighborhood = listing.neighborhood || '';
  const location = [neighborhood, city].filter(Boolean).join(', ');
  const phone = listing.agent?.phone || 'N/A';
  return [
    `*${title}*`,
    `💰 ${price}`,
    `📍 ${location}`,
    `📞 ${phone}`,
    '',
    '_Full details in the listing post_',
  ].join('\n');
}

async function readImageBuffer(imagePath) {
  if (imagePath.startsWith('http')) {
    try {
      const response = await axios.get(imagePath, { responseType: 'arraybuffer', timeout: 15000 });
      const ext = imagePath.split('.').pop()?.split('?')[0] || 'webp';
      const contentType = response.headers['content-type'] || `image/${ext}`;
      const blob = new Blob([response.data], { type: contentType });
      return {
        blob,
        buffer: Buffer.from(response.data),
        filename: `image.${ext}`,
        contentType,
        fullPath: imagePath,
      };
    } catch {
      return null;
    }
  }

  const fullPath = path.resolve(process.cwd(), imagePath);
  try {
    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) return null;
    const buffer = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).slice(1) || 'webp';
    const contentType = `image/${ext}`;
    const blob = new Blob([buffer], { type: contentType });
    return { blob, buffer, filename: path.basename(fullPath), contentType, fullPath };
  } catch {
    return null;
  }
}

async function sendSinglePhoto(caption, imagePath, telegramApi, channelId) {
  const imageData = await readImageBuffer(imagePath);
  if (!imageData) {
    throw new Error(`Image file not found or unreadable: ${imagePath}`);
  }

  const form = new FormData();
  form.append('chat_id', channelId);
  form.append('photo', imageData.blob, {
    filename: imageData.filename,
    contentType: imageData.contentType,
  });
  form.append('caption', caption);
  form.append('parse_mode', 'Markdown');

  const { data } = await axios.post(`${telegramApi}/sendPhoto`, form, {
    timeout: REQUEST_TIMEOUT_MS,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  if (!data || !data.ok) {
    throw new Error(data?.description || 'Telegram sendPhoto returned non-ok');
  }

  return data.result;
}

async function sendMediaGroup(caption, imagePaths, telegramApi, channelId) {
  const validPaths = imagePaths.slice(0, MAX_IMAGES_IN_GROUP);

  const readResults = await Promise.allSettled(
    validPaths.map((p) => readImageBuffer(p)),
  );

  const images = readResults
    .map((r, i) => (r.status === 'fulfilled' ? { ...r.value, originalPath: validPaths[i] } : null))
    .filter(Boolean);

  if (images.length === 0) {
    throw new Error('No readable images found for media group');
  }

  const form = new FormData();
  form.append('chat_id', channelId);
  form.append('parse_mode', 'Markdown');

  if (images.length === 1) {
    form.append('media', JSON.stringify({
      type: 'photo',
      media: 'attach://photo0',
      caption,
      parse_mode: 'Markdown',
    }));
    form.append('photo0', images[0].blob, {
      filename: images[0].filename,
      contentType: images[0].contentType,
    });
  } else {
    const mediaItems = images.map((img, idx) => {
      const item = { type: 'photo', media: `attach://photo${idx}` };
      if (idx === 0) {
        item.caption = caption;
        item.parse_mode = 'Markdown';
      }
      return item;
    });

    form.append('media', JSON.stringify(mediaItems));

    for (let i = 0; i < images.length; i++) {
      form.append(`photo${i}`, images[i].blob, {
        filename: images[i].filename,
        contentType: images[i].contentType,
      });
    }
  }

  const { data } = await axios.post(`${telegramApi}/sendMediaGroup`, form, {
    timeout: REQUEST_TIMEOUT_MS,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  if (!data || !data.ok) {
    throw new Error(data?.description || 'Telegram sendMediaGroup returned non-ok');
  }

  return data.result;
}

export default class TelegramBotService {
  static buildCaption(listingData) {
    return buildCaption(listingData);
  }

  static async validateConfig() {
    const config = await getTelegramConfig();
    if (!config || !config.botToken) {
      throw new Error('Telegram bot token not configured. Set it in Syndication Settings.');
    }
    if (!config.channelId) {
      throw new Error('Telegram channel ID not configured. Set it in Syndication Settings.');
    }
    if (!config.isActive) {
      throw new Error('Telegram syndication is disabled. Enable it in Syndication Settings.');
    }
    return config;
  }

  static async getBotInfo() {
    const config = await getTelegramConfig();
    if (!config || !config.botToken) return null;
    try {
      const { data } = await axios.get(
        `https://api.telegram.org/bot${config.botToken}/getMe`,
        { timeout: 10000 }
      );
      if (!data.ok) return null;

      const bot = data.result;

      // Fetch bot's profile photo and resolve to URL
      try {
        const { data: photoData } = await axios.get(
          `https://api.telegram.org/bot${config.botToken}/getUserProfilePhotos`,
          { params: { user_id: bot.id, limit: 1 }, timeout: 10000 }
        );
        if (photoData.ok && photoData.result.photos.length > 0) {
          const fileId = photoData.result.photos[0][0].file_id;
          const photoUrl = await resolveFileUrl(fileId, config.botToken);
          if (photoUrl) bot.photoUrl = photoUrl;
        }
      } catch {}

      return bot;
    } catch {
      return null;
    }
  }

  static async getChannelInfo() {
    const config = await getTelegramConfig();
    if (!config || !config.botToken || !config.channelId) return null;
    try {
      const { data } = await axios.get(
        `https://api.telegram.org/bot${config.botToken}/getChat`,
        { params: { chat_id: config.channelId }, timeout: 10000 }
      );
      if (!data.ok) return null;
      const chat = data.result;

      // Resolve channel profile photo to URL
      if (chat.photo?.big_file_id) {
        const photoUrl = await resolveFileUrl(chat.photo.big_file_id, config.botToken);
        if (photoUrl) chat.photoUrl = photoUrl;
      }

      let memberCount = 0;
      try {
        const { data: countData } = await axios.get(
          `https://api.telegram.org/bot${config.botToken}/getChatMemberCount`,
          { params: { chat_id: config.channelId }, timeout: 10000 }
        );
        if (countData.ok) memberCount = countData.result;
      } catch {}
      return { ...chat, memberCount };
    } catch {
      return null;
    }
  }

  static async deleteMessage(messageId) {
    const config = await getTelegramConfig();
    if (!config || !config.botToken) throw new Error('Telegram not configured');
    const { data } = await axios.post(
      `https://api.telegram.org/bot${config.botToken}/deleteMessage`,
      { chat_id: config.channelId, message_id: messageId },
      { timeout: 10000 }
    );
    if (!data.ok) throw new Error(data.description || 'Failed to delete message');
    return true;
  }

  static async editMessageCaption(messageId, newCaption) {
    const config = await getTelegramConfig();
    if (!config || !config.botToken) throw new Error('Telegram not configured');
    const { data } = await axios.post(
      `https://api.telegram.org/bot${config.botToken}/editMessageCaption`,
      {
        chat_id: config.channelId,
        message_id: messageId,
        caption: newCaption,
        parse_mode: 'Markdown',
      },
      { timeout: 10000 }
    );
    if (!data.ok) throw new Error(data.description || 'Failed to edit message');
    return data.result;
  }

  static async sendListingToChannel(listingData) {
    const config = await this.validateConfig();

    const telegramApi = `https://api.telegram.org/bot${config.botToken}`;
    const channelId = config.channelId;

    const { images = [], category, agent, ...listing } = listingData;
    const listingObj = { ...listing, category, agent, images };

    const caption = images.length > 1
      ? buildMediaCaption(listingObj)
      : buildCaption(listingObj);

    const fullCaption = images.length > 1 ? buildCaption(listingObj) : caption;

    let result;
    if (images.length === 0) {
      throw new Error('Listing must have at least one image to send to Telegram channel');
    } else if (images.length === 1) {
      result = await sendSinglePhoto(caption, images[0], telegramApi, channelId);
    } else {
      result = await sendMediaGroup(caption, images, telegramApi, channelId);
    }

    console.log(
      `[TelegramBot] Sent listing "${listing.title}" (${listing.id}) — ` +
      `message_id: ${result?.message_id}, images: ${images.length}`,
    );

    return {
      platform: 'TELEGRAM',
      channelInfo: channelId,
      messageId: result?.message_id,
      imagesSent: images.length,
      captionLength: fullCaption.length,
    };
  }
}
