import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

const MAX_IMAGES_IN_GROUP = 10;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_CAPTION_LENGTH = 1024;

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
  const fullPath = path.resolve(process.cwd(), imagePath);
  try {
    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) return null;
    const buffer = await fs.readFile(fullPath);
    return { buffer, filename: path.basename(fullPath), fullPath };
  } catch {
    return null;
  }
}

async function sendSinglePhoto(caption, imagePath) {
  const imageData = await readImageBuffer(imagePath);
  if (!imageData) {
    throw new Error(`Image file not found or unreadable: ${imagePath}`);
  }

  const form = new FormData();
  form.append('chat_id', CHANNEL_ID);
  form.append('photo', imageData.buffer, {
    filename: imageData.filename,
    contentType: 'image/webp',
  });
  form.append('caption', caption);
  form.append('parse_mode', 'Markdown');

  const { data } = await axios.post(`${TELEGRAM_API}/sendPhoto`, form, {
    headers: form.getHeaders(),
    timeout: REQUEST_TIMEOUT_MS,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  if (!data || !data.ok) {
    throw new Error(data?.description || 'Telegram sendPhoto returned non-ok');
  }

  return data.result;
}

async function sendMediaGroup(caption, imagePaths) {
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
  form.append('chat_id', CHANNEL_ID);
  form.append('parse_mode', 'Markdown');

  if (images.length === 1) {
    form.append('media', JSON.stringify({
      type: 'photo',
      media: 'attach://photo0',
      caption,
      parse_mode: 'Markdown',
    }));
    form.append('photo0', images[0].buffer, {
      filename: images[0].filename,
      contentType: 'image/webp',
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
      form.append(`photo${i}`, images[i].buffer, {
        filename: images[i].filename,
        contentType: 'image/webp',
      });
    }
  }

  const { data } = await axios.post(`${TELEGRAM_API}/sendMediaGroup`, form, {
    headers: form.getHeaders(),
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
  static validateConfig() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
    }
    if (!CHANNEL_ID) {
      throw new Error('TELEGRAM_CHANNEL_ID environment variable is not set');
    }
  }

  static async sendListingToChannel(listingData) {
    this.validateConfig();

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
      result = await sendSinglePhoto(caption, images[0]);
    } else {
      result = await sendMediaGroup(caption, images);
    }

    console.log(
      `[TelegramBot] Sent listing "${listing.title}" (${listing.id}) — ` +
      `message_id: ${result?.message_id}, images: ${images.length}`,
    );

    return {
      platform: 'TELEGRAM',
      channelInfo: CHANNEL_ID,
      messageId: result?.message_id,
      imagesSent: images.length,
      captionLength: fullCaption.length,
    };
  }
}
