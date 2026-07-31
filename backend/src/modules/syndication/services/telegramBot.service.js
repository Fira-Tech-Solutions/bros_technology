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

async function getMiniAppUrl() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'miniAppUrl' } });
    if (setting?.value) return setting.value;
  } catch {}
  return process.env.TELEGRAM_MINI_APP_URL || '';
}

async function getAdminTelegram() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'adminTelegramUsername' } });
    if (setting?.value) return setting.value;
  } catch {}
  return '';
}

async function getShopGoogleMapUrl() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'shopGoogleMapUrl' } });
    if (setting?.value) return setting.value;
  } catch {}
  return '';
}

function buildInlineKeyboard(listingId, listingTitle, firstImage, miniAppUrl, adminTelegram, shopGoogleMapUrl) {
  const buttons = [];

  if (shopGoogleMapUrl) {
    buttons.push([{ text: '📍 Location', url: shopGoogleMapUrl }]);
  }

  if (miniAppUrl) {
    buttons.push([{ text: '🛍 Explore', url: `${miniAppUrl}/property/${listingId}` }]);
  }

  if (adminTelegram) {
    const message = encodeURIComponent(firstImage || '');
    buttons.push([{ text: '📩 Order Now', url: `https://t.me/${adminTelegram}?text=${message}` }]);
  }

  if (buttons.length === 0) return null;
  return { inline_keyboard: buttons };
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
  return `${num.toLocaleString('en-US')} ETB`;
}

const FIELD_LABELS = {
  brand: '📱 Brand',
  model: '📦 Model',
  storage: '💾 Storage',
  ram: '🧠 RAM',
  color: '🎨 Color',
  condition: '✅ Condition',
  processor: '⚡ Processor',
  gpu: '🎮 GPU',
  screenSize: '🖥 Screen',
  os: '💻 OS',
  batteryHealth: '🔋 Battery',
  carrier: '📡 Carrier',
  caseSize: '⌚ Size',
  connectivity: '📶 Connectivity',
  hasWarranty: '🛡 Warranty',
  hasAppleCare: '🍎 AppleCare',
  year: '📅 Year',
  storageType: '💿 Storage Type',
};

const CATEGORY_CAPTIONS = {
  IPHONES_SAMSUNG: ['brand', 'model', 'storage', 'ram', 'color', 'condition', 'batteryHealth', 'carrier', 'hasWarranty'],
  IPADS_MACBOOKS: ['brand', 'model', 'storage', 'ram', 'color', 'condition', 'screenSize', 'processor', 'connectivity', 'hasWarranty'],
  LAPTOPS: ['brand', 'model', 'processor', 'ram', 'storage', 'gpu', 'screenSize', 'color', 'condition', 'os', 'hasWarranty'],
  AIRPODS: ['brand', 'model', 'color', 'condition', 'hasAppleCare', 'hasWarranty'],
  SMARTWATCHES: ['brand', 'model', 'caseSize', 'storage', 'color', 'connectivity', 'condition', 'hasWarranty'],
};

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
  const categoryName = listing.category?.name || '';
  const fields = CATEGORY_CAPTIONS[categoryName];
  const attributes = listing.attributes && typeof listing.attributes === 'object'
    ? listing.attributes
    : {};

  const sections = [
    `*${title}*`,
    '',
    `💰 *Price:* ${price}`,
  ];

  if (fields && fields.length > 0) {
    for (const field of fields) {
      const value = attributes[field];
      if (value === undefined || value === null || value === '') continue;
      const label = FIELD_LABELS[field] || field;
      const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
      sections.push(`${label}: ${displayValue}`);
    }
  }

  const description = listing.description
    ? listing.description.length > 200
      ? `${listing.description.slice(0, 200)}...`
      : listing.description
    : '';

  if (description) {
    sections.push('', description);
  }

  sections.push('', '─────────────────', 'Listed on _BROS Technology_');

  return sections.join('\n');
}

function buildMediaCaption(listing) {
  const full = buildCaption(listing);
  if (full.length <= MAX_CAPTION_LENGTH) return full;

  const title = listing.title || 'Untitled Listing';
  const price = formatPrice(listing.price);
  const categoryName = listing.category?.name || '';
  const fields = CATEGORY_CAPTIONS[categoryName];
  const attributes = listing.attributes && typeof listing.attributes === 'object'
    ? listing.attributes
    : {};

  const short = [`*${title}*`, `💰 ${price}`];

  if (fields && fields.length > 0) {
    const shown = fields.filter((f) => {
      const v = attributes[f];
      return v !== undefined && v !== null && v !== '';
    }).slice(0, 3);
    for (const field of shown) {
      const label = FIELD_LABELS[field] || field;
      const displayValue = typeof attributes[field] === 'boolean'
        ? (attributes[field] ? 'Yes' : 'No')
        : attributes[field];
      short.push(`${label}: ${displayValue}`);
    }
  }

  short.push('', '_Full details in the listing post_');
  return short.join('\n');
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

async function sendSinglePhoto(caption, imagePath, telegramApi, channelId, replyMarkup) {
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

  if (replyMarkup) {
    form.append('reply_markup', JSON.stringify(replyMarkup));
  }

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

    const miniAppUrl = await getMiniAppUrl();
    const adminTelegram = await getAdminTelegram();
    const shopGoogleMapUrl = await getShopGoogleMapUrl();
    const keyboard = buildInlineKeyboard(
      listingData.id,
      listingData.title,
      images[0] || null,
      miniAppUrl,
      adminTelegram,
      shopGoogleMapUrl,
    );

    let result;
    if (images.length === 0) {
      throw new Error('Listing must have at least one image to send to Telegram channel');
    } else if (images.length === 1) {
      result = await sendSinglePhoto(caption, images[0], telegramApi, channelId, keyboard);
    } else {
      result = await sendMediaGroup(caption, images, telegramApi, channelId);

      if (keyboard) {
        await axios.post(`${telegramApi}/sendMessage`, {
          chat_id: channelId,
          text: '─────────────────\n🛍 *Explore* this product or *Order Now*',
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        }, { timeout: REQUEST_TIMEOUT_MS });
      }
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
