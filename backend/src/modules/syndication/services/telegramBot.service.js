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

async function getCallNumbers() {
  try {
    const [num1, num2] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'callNumber1' } }),
      prisma.setting.findUnique({ where: { key: 'callNumber2' } }),
    ]);
    return [num1?.value, num2?.value].filter(Boolean);
  } catch {}
  return [];
}

async function getChannelUsername(botToken, channelId) {
  try {
    const { data } = await axios.get(
      `https://api.telegram.org/bot${botToken}/getChat`,
      { params: { chat_id: channelId }, timeout: 10000 }
    );
    if (data.ok && data.result.username) return data.result.username;
  } catch {}
  return '';
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

function debugCaptionBytes(caption) {
  const buf = Buffer.from(caption, 'utf8');
  console.log(`[TelegramBot] Caption stats: charLen=${caption.length}, byteLen=${buf.length}`);

  const specialChars = [];
  for (let i = 0; i < caption.length; i++) {
    const ch = caption[i];
    if ('*_`[]()~>\\'.includes(ch)) {
      const byteOffset = Buffer.byteLength(caption.slice(0, i), 'utf8');
      specialChars.push({ char: ch, charIndex: i, byteOffset });
    }
  }
  if (specialChars.length > 0) {
    console.log('[TelegramBot] Special chars in caption:', JSON.stringify(specialChars));
  }

  const starIndices = [];
  for (let i = 0; i < caption.length; i++) {
    if (caption[i] === '*') starIndices.push(i);
  }
  console.log(`[TelegramBot] Star (*) count: ${starIndices.length}, indices: [${starIndices}]`);

  const underscoreIndices = [];
  for (let i = 0; i < caption.length; i++) {
    if (caption[i] === '_') underscoreIndices.push(i);
  }
  console.log(`[TelegramBot] Underscore (_) count: ${underscoreIndices.length}, indices: [${underscoreIndices}]`);

  const tildeIndices = [];
  for (let i = 0; i < caption.length; i++) {
    if (caption[i] === '~') tildeIndices.push(i);
  }
  console.log(`[TelegramBot] Tilde (~) count: ${tildeIndices.length}, indices: [${tildeIndices}]`);

  return buf;
}

function escapeMarkdownV1(text) {
  if (!text) return '';
  return String(text).replace(/([_*`[\]~>!\\])/g, '\\$1');
}

const FIELD_LABELS = {
  brand: '📱 Brand',
  model: '📦 Model',
  storage: '💾 Storage',
  ram: '🧠 RAM',
  color: '🎨 Color',
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
  generation: '🔢 Generation',
};

const CATEGORY_CAPTIONS = {
  IPHONES_SAMSUNG: ['brand', 'model', 'storage', 'ram', 'color', 'batteryHealth', 'carrier', 'hasWarranty'],
  IPADS_MACBOOKS: ['brand', 'model', 'storage', 'ram', 'color', 'screenSize', 'processor', 'connectivity', 'hasWarranty'],
  LAPTOPS: ['brand', 'model', 'processor', 'ram', 'storage', 'gpu', 'screenSize', 'color', 'generation', 'os', 'hasWarranty'],
  AIRPODS: ['brand', 'model', 'color', 'hasAppleCare', 'hasWarranty'],
  SMARTWATCHES: ['brand', 'model', 'caseSize', 'storage', 'color', 'connectivity', 'hasWarranty'],
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

function buildContactSection(callNumbers, telegramHandle, channelUsername) {
  const lines = [];
  for (const num of callNumbers) {
    lines.push(`📞 Call us: ${num}`);
  }
  if (telegramHandle) {
    lines.push(`💬 Message us: @${telegramHandle.replace(/_/g, '\\_')}`);
  }
  if (channelUsername) {
    lines.push(`📢 Join channel: @${channelUsername.replace(/_/g, '\\_')}`);
  }
  if (lines.length === 0) return [];
  return ['', '─────────────────', ...lines];
}

function buildCaption(listing, context = {}) {
  if (listing.customTelegramCaption && listing.customTelegramCaption.trim()) {
    return listing.customTelegramCaption.trim();
  }

  const title = escapeMarkdownV1(listing.title) || 'Untitled Listing';
  const price = formatPrice(listing.price);
  const categoryName = listing.category?.name || '';
  const fields = CATEGORY_CAPTIONS[categoryName];
  const attributes = listing.attributes && typeof listing.attributes === 'object'
    ? listing.attributes
    : {};

  const sections = [
    `*${title}*`,
  ];

  if (fields && fields.length > 0) {
    const attrLines = [];
    for (const field of fields) {
      const value = attributes[field];
      if (value === undefined || value === null || value === '') continue;
      const label = FIELD_LABELS[field] || field;
      const displayValue = typeof value === 'boolean'
        ? (value ? 'Yes' : 'No')
        : escapeMarkdownV1(value);
      attrLines.push(`${label}: ${displayValue}`);
    }
    if (attrLines.length > 0) {
      sections.push('', ...attrLines);
    }
  }

  const description = listing.description
    ? escapeMarkdownV1(
        listing.description.length > 200
          ? `${listing.description.slice(0, 200)}...`
          : listing.description
      )
    : '';

  if (description) {
    sections.push('', description);
  }

  sections.push('', `💰 *Price:* ${price}`);

  const { callNumbers = [], telegramHandle = '', channelUsername = '' } = context;
  sections.push(...buildContactSection(callNumbers, telegramHandle, channelUsername));

  sections.push('', 'Listed on [broslaptop.com](https://broslaptop.com)');

  return sections.join('\n');
}

function buildMediaCaption(listing, context = {}) {
  const full = buildCaption(listing, context);
  if (full.length <= MAX_CAPTION_LENGTH) return full;

  const title = escapeMarkdownV1(listing.title) || 'Untitled Listing';
  const price = formatPrice(listing.price);
  const categoryName = listing.category?.name || '';
  const fields = CATEGORY_CAPTIONS[categoryName];
  const attributes = listing.attributes && typeof listing.attributes === 'object'
    ? listing.attributes
    : {};

  const short = [`*${title}*`];

  if (fields && fields.length > 0) {
    const shown = fields.filter((f) => {
      const v = attributes[f];
      return v !== undefined && v !== null && v !== '';
    }).slice(0, 3);
    for (const field of shown) {
      const label = FIELD_LABELS[field] || field;
      const displayValue = typeof attributes[field] === 'boolean'
        ? (attributes[field] ? 'Yes' : 'No')
        : escapeMarkdownV1(attributes[field]);
      short.push(`${label}: ${displayValue}`);
    }
  }

  short.push('', `💰 *Price:* ${price}`);
  short.push('', '_Full details in the listing post_');
  return short.join('\n');
}

async function readImageBuffer(imagePath) {
  if (imagePath.startsWith('http')) {
    try {
      const response = await axios.get(imagePath, {
        responseType: 'arraybuffer',
        timeout: 30000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BOSTechnologyBot/1.0)',
        },
      });
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
    } catch (err) {
      console.error(`[TelegramBot] Failed to fetch image: ${imagePath}`, {
        message: err.message,
        code: err.code,
        responseStatus: err.response?.status,
        responseType: err.response?.headers?.['content-type'],
      });
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
  } catch (err) {
    console.error(`[TelegramBot] Failed to read local image: ${fullPath}`, {
      message: err.message,
      code: err.code,
    });
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

  console.log('[TelegramBot] sendSinglePhoto caption length:', caption.length, 'byteSize:', Buffer.byteLength(caption, 'utf8'));

  try {
    const { data } = await axios.post(`${telegramApi}/sendPhoto`, form, {
      timeout: REQUEST_TIMEOUT_MS,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (!data || !data.ok) {
      throw new Error(data?.description || 'Telegram sendPhoto returned non-ok');
    }

    return data.result;
  } catch (err) {
    const TelegramError = err?.response?.data || {};
    console.error('[TelegramBot] sendSinglePhoto FAILED:', {
      error_code: TelegramError.error_code,
      description: TelegramError.description,
      parameters: TelegramError.parameters,
      captionLength: caption.length,
      captionByteSize: Buffer.byteLength(caption, 'utf8'),
    });
    throw err;
  }
}

async function sendMediaGroup(caption, imagePaths, telegramApi, channelId) {
  const validPaths = imagePaths.slice(0, MAX_IMAGES_IN_GROUP);

  const readResults = await Promise.allSettled(
    validPaths.map((p) => readImageBuffer(p)),
  );

  const images = readResults
    .map((r, i) => (r.status === 'fulfilled' && r.value ? { ...r.value, originalPath: validPaths[i] } : null))
    .filter(Boolean);

  const failedCount = readResults.length - images.length;
  if (failedCount > 0) {
    const failedPaths = readResults
      .map((r, i) => (r.status !== 'fulfilled' || !r.value ? validPaths[i] : null))
      .filter(Boolean);
    console.warn(`[TelegramBot] ${failedCount} image(s) failed to load:`, failedPaths);
  }

  if (images.length === 0) {
    throw new Error('No readable images found for media group');
  }

  const form = new FormData();
  form.append('chat_id', channelId);

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

  const mediaJson = form.get('media');
  console.log('[TelegramBot] sendMediaGroup media JSON length:', mediaJson?.length);
  console.log('[TelegramBot] sendMediaGroup first 500 chars of media:', mediaJson?.substring(0, 500));

  try {
    const { data } = await axios.post(`${telegramApi}/sendMediaGroup`, form, {
      timeout: REQUEST_TIMEOUT_MS,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (!data || !data.ok) {
      throw new Error(data?.description || 'Telegram sendMediaGroup returned non-ok');
    }

    return data.result;
  } catch (err) {
    const TelegramError = err?.response?.data || {};
    console.error('[TelegramBot] sendMediaGroup FAILED:', {
      error_code: TelegramError.error_code,
      description: TelegramError.description,
      parameters: TelegramError.parameters,
      captionLength: caption.length,
      captionByteSize: Buffer.byteLength(caption, 'utf8'),
      parse_mode: 'Markdown',
      imageCount: images.length,
    });
    throw err;
  }
}

export default class TelegramBotService {
  static buildCaption(listingData, context) {
    return buildCaption(listingData, context);
  }

  static async getContext() {
    const config = await getTelegramConfig();
    if (!config || !config.botToken) return {};
    const [callNumbers, adminTelegram, channelUsername] = await Promise.all([
      getCallNumbers(),
      getAdminTelegram(),
      getChannelUsername(config.botToken, config.channelId),
    ]);
    return { callNumbers, telegramHandle: adminTelegram, channelUsername };
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

    console.log('[TelegramBot] Step 1: Fetching settings...');
    const [miniAppUrl, adminTelegram, shopGoogleMapUrl, callNumbers, channelUsername] =
      await Promise.all([
        getMiniAppUrl(),
        getAdminTelegram(),
        getShopGoogleMapUrl(),
        getCallNumbers(),
        getChannelUsername(config.botToken, channelId),
      ]);
    console.log('[TelegramBot] Step 1 done. callNumbers:', callNumbers, 'channelUsername:', channelUsername);

    const context = { callNumbers, telegramHandle: adminTelegram, channelUsername };

    console.log('[TelegramBot] Step 2: Building caption...');
    const caption = images.length > 1
      ? buildMediaCaption(listingObj, context)
      : buildCaption(listingObj, context);

    const fullCaption = images.length > 1 ? buildCaption(listingObj, context) : caption;
    console.log('[TelegramBot] Step 2 done. caption length:', caption.length, 'fullCaption length:', fullCaption.length);
    console.log('[TelegramBot] Caption content:\n' + caption);
    debugCaptionBytes(caption);

    console.log('[TelegramBot] Step 3: Sending to channel. images:', images.length);
    let result;
    if (images.length === 0) {
      throw new Error('Listing must have at least one image to send to Telegram channel');
    } else if (images.length === 1) {
      result = await sendSinglePhoto(caption, images[0], telegramApi, channelId);
    } else {
      result = await sendMediaGroup(caption, images, telegramApi, channelId);
    }

    console.log(
      `[TelegramBot] Step 4: Done. Sent listing "${listing.title}" (${listing.id}) — ` +
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
