import * as cheerio from 'cheerio';
import path from 'path';

const KNOWN_BRANDS = [
  'HP', 'Dell', 'DELL', 'Lenovo', 'Apple', 'Samsung', 'ASUS', 'Asus',
  'MacBook', 'Macbook', 'iPhone', 'Microsoft', 'Toshiba', 'Acer',
  'Huawei', 'Xiaomi', 'Google', 'Sony', 'Honor', 'OnePlus', 'OPPO',
  'Nothing', 'Realme', 'ZTE', 'Infinix', 'Tecno', 'itel',
];

const BRAND_MAP = {
  'hp': 'HP',
  'dell': 'DELL',
  'lenovo': 'Lenovo',
  'apple': 'Apple',
  'samsung': 'Samsung',
  'asus': 'ASUS',
  'macbook': 'Apple',
  'macbook air': 'Apple',
  'macbook pro': 'Apple',
  'iphone': 'Apple',
  'microsoft': 'Microsoft',
  'toshiba': 'Toshiba',
  'acer': 'Acer',
  'huawei': 'Huawei',
  'xiaomi': 'Xiaomi',
  'elitebook': 'HP',
  'probook': 'HP',
  'pavilion': 'HP',
  'envy': 'HP',
  'zbook': 'HP',
  'spectre': 'HP',
  'omen': 'HP',
  'latitude': 'DELL',
  'inspiron': 'DELL',
  'xps': 'DELL',
  'vostro': 'DELL',
  'thinkpad': 'Lenovo',
  'ideapad': 'Lenovo',
  'yoga': 'Lenovo',
  'legion': 'Lenovo',
  'surface': 'Microsoft',
  'msi': 'MSI',
  'fujitsu': 'Fujitsu',
  'razer': 'Razer',
  'gateway': 'Gateway',
  'chromebook': 'Acer',
};

const LAPTOP_KEYWORDS = [
  'elitebook', 'probook', 'pavilion', 'envy', 'zbook', 'spectre',
  'latitude', 'inspiron', 'xps', 'vostro', 'precision',
  'thinkpad', 'ideapad', 'yoga', 'legion', 'loq',
  'macbook', 'surface', 'zenbook', 'vivobook', 'rog',
  'chromebook', 'toshiba',
  'laptop', 'notebook', 'x360', 'touch screen', 'touchscreen',
  'core i3', 'core i5', 'core i7', 'core i9', 'ryzen', 'pentium', 'celeron',
  'ssd', 'hdd', 'ram',
];

const PHONE_KEYWORDS = [
  'iphone', 'galaxy', 'samsung', 'pixel', 'oneplus', 'redmi', 'poco',
  'realme', 'tecno', 'infinix', 'honor', 'huawei', 'nothing',
  'dual sim', 'facial', 'face id', 'battery',
];

const TABLET_KEYWORDS = [
  'ipad', 'tablet', 'galaxy tab', 'surface pro', 'surface go',
  'tab s', 'tab a', 'lenovo tab',
];

const WATCH_KEYWORDS = [
  'apple watch', 'galaxy watch', 'smartwatch', 'watch se', 'watch series',
  'watch ultra', 'watch sport',
];

const AIRPODS_KEYWORDS = [
  'airpods', 'airpod', 'earbuds', 'earphones', 'buds',
];

function cleanHtml(html) {
  if (!html) return '';
  let text = html;
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&laquo;/g, '«');
  text = text.replace(/&raquo;/g, '»');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

function extractPrice(text) {
  const patterns = [
    /(?:price|💰|💵|💰)\s*[:：]?\s*(?:<[^>]+>)*\s*(?:<[^>]+>)*\s*([\d,]+)\s*(?:Birr|birr|ETB|etb|Br)?/i,
    /([\d,]+)\s*(?:Birr|birr|ETB|etb|Br)\b/i,
    /(?:price|💰|💵)\s*[:：]?\s*([\d,]+)/i,
    /(?:^|\n)\s*([\d]{2,3},[\d]{3})\s*(?:Birr|birr|ETB|etb)?\s*$/mi,
    /\.\.\.\.\.*\s*([\d,]+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseInt(numStr, 10);
      if (num >= 1000 && num <= 10000000) return num;
    }
  }
  return null;
}

function detectBrand(text) {
  const lower = text.toLowerCase();

  for (const [key, brand] of Object.entries(BRAND_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(lower)) return brand;
  }

  for (const brand of KNOWN_BRANDS) {
    const regex = new RegExp(`\\b${brand}\\b`, 'i');
    if (regex.test(text)) return brand;
  }

  return null;
}

function detectCategory(text, brand) {
  const lower = text.toLowerCase();

  if (brand === 'Apple' && /iphone/i.test(text)) return 'IPHONES_SAMSUNG';
  if (/galaxy\s*(s|a|z|note|m|\d)/i.test(text)) return 'IPHONES_SAMSUNG';
  if (/samsung.*phone/i.test(text)) return 'IPHONES_SAMSUNG';

  if (AIRPODS_KEYWORDS.some(k => lower.includes(k))) return 'AIRPODS';
  if (WATCH_KEYWORDS.some(k => lower.includes(k))) return 'SMARTWATCHES';
  if (TABLET_KEYWORDS.some(k => lower.includes(k))) return 'IPADS_MACBOOKS';

  if (/macbook/i.test(text)) return 'IPADS_MACBOOKS';
  if (/ipad/i.test(text)) return 'IPADS_MACBOOKS';

  if (LAPTOP_KEYWORDS.some(k => lower.includes(k))) return 'LAPTOPS';

  if (PHONE_KEYWORDS.some(k => lower.includes(k))) return 'IPHONES_SAMSUNG';

  return 'LAPTOPS';
}

function extractStorage(text) {
  const patterns = [
    /(\d+)\s*(GB|TB)\s*(SSD|HDD|NVMe|eMMC|solid)/i,
    /(\d+)\s*(SSD|HDD)/i,
    /(\d+)\s*(GB|TB)\s*(?:storage|disk)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const size = match[1];
      const unit = match[2]?.toUpperCase();
      const type = match[3]?.toUpperCase() || '';
      if (unit === 'TB') return `${size}TB ${type}`.trim();
      return `${size}GB ${type}`.trim();
    }
  }

  const simple = text.match(/(\d+)\s*(GB|TB)\b/i);
  if (simple) {
    return `${simple[1]}${simple[2].toUpperCase()}`;
  }

  return null;
}

function extractRam(text) {
  const patterns = [
    /(\d+)\s*GB\s*RAM/i,
    /RAM\s*[:：]?\s*(\d+)\s*GB/i,
    /(\d+)\s*GB\s*DDR\d?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return `${match[1]}GB`;
  }

  const simple = text.match(/(\d+)gb\s*ram/i);
  if (simple) return `${simple[1]}GB`;

  return null;
}

function extractProcessor(text) {
  const patterns = [
    /(?:core\s*)?(i[3579])\s*[-–]?\s*(\d+)(?:th|st|nd|rd)?\s*(?:generation|gen)/i,
    /(?:core\s*)?(i[3579])\s*[-–]?\s*(\d+)(?:th|st|nd|rd)?\b/i,
    /(ryzen\s*\d+\s*(?:pro)?\s*\d*\s*(?:series)?)\b/i,
    /(ryzen\s*\d+)\b/i,
    /(M[1-5])\s*(?:chip)?\b/i,
    /(core\s*i[3579])\b/i,
    /(pentium|celeron)\b/i,
    /(athlon)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let proc = match[1] || match[0];
      if (match[2]) proc += ` ${match[2]}th`;
      return proc.trim();
    }
  }

  return null;
}

function extractScreenSize(text) {
  const match = text.match(/(\d+[\.,]?\d*)\s*(?:inch|"|'|”|”)/i);
  if (match) return `${match[1]}"`;
  return null;
}

function extractColor(text) {
  const colors = ['black', 'white', 'silver', 'gray', 'grey', 'blue', 'red', 'green',
    'gold', 'rose gold', 'space gray', 'midnight', 'starlight', 'pink', 'purple',
    'yellow', 'orange', 'brown', 'navy', 'teal', 'bronze', 'titanium'];
  const lower = text.toLowerCase();
  for (const color of colors) {
    if (lower.includes(color)) return color.charAt(0).toUpperCase() + color.slice(1);
  }
  return null;
}

function extractCondition(text) {
  const lower = text.toLowerCase();
  if (/brand\s*new|new.*condition|factory|sealed/i.test(lower)) return 'Brand New';
  if (/used.*like\s*new|like\s*new/i.test(lower)) return 'Used - Like New';
  if (/used.*good|good\s*condition/i.test(lower)) return 'Used - Good';
  if (/used.*fair|fair\s*condition/i.test(lower)) return 'Used - Fair';
  if (/\bnew\b/i.test(lower)) return 'Brand New';
  if (/\bused\b/i.test(lower)) return 'Used - Good';
  return null;
}

function extractDescription(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const skipPatterns = [
    /^(price|💰|💵|📱|📦|💾|🧠|🎨|✅|⚡|🖥|🎮|📡|🔋|⌚|📶|🛡|🍎|📅|💿| locations?|call|inbox|t\.me|http|📍|☎️|📞|🤙|free bag|free window|free software|exchange|discount|buy one)/i,
    /^\d+[,.]?\s*\w/,  // numbered list items
    /^[✅☑️⚙️🔘💡🔒🎧🎓👔💼✈️🧹🎉🔔📞📱]/,
  ];

  const descLines = [];
  for (const line of lines) {
    if (skipPatterns.some(p => p.test(line))) continue;
    if (line.length < 5) continue;
    if (/^\d+[,.]?\s*$/.test(line)) continue;
    descLines.push(line);
  }

  const desc = descLines.join(' ').trim();
  return desc.length > 200 ? desc.slice(0, 200) + '...' : desc || null;
}

function extractPhones(text) {
  const phones = [];
  const patterns = [
    /\+?251[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}/g,
    /\b0\d{9}\b/g,
    /\d{2}[\s-]?\d{3}[\s-]?\d{4}/g,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      let phone = match[0].replace(/\s/g, '');
      if (phone.startsWith('0')) phone = '+251' + phone.slice(1);
      if (!phone.startsWith('+')) phone = '+' + phone;
      if (phone.length >= 12 && phone.length <= 15) {
        phones.push(phone);
      }
    }
  }

  return [...new Set(phones)];
}

function extractPhotosFromMessage(msgHtml) {
  const photos = [];
  const $ = cheerio.load(msgHtml);
  $('a.photo_wrap').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('photos/')) {
      photos.push(href);
    }
  });
  return photos;
}

function parseSingleProduct(text, date, photos, messageId) {
  if (!text || text.length < 5) return null;

  const lower = text.toLowerCase();
  if (/^(bros technology|original phones|welcome|channel|pinned|thank|congrat|happy|new year|merry|holiday|sale|clearance|announcement|sold out|merry christmas|big discount|play station|ps5|features|locations?|contact|about us|follow us|visit|address|open|close|hours|for better info|bole oromia|laptop resellers)/i.test(lower.trim())) return null;
  if (/^\d{2}\/\d{2}\/\d{4}/.test(lower.trim())) return null;
  if (/^\d+[kK]\s+\d+[kK]/.test(lower.trim())) return null;

  const price = extractPrice(text);
  const brand = detectBrand(text);
  const category = detectCategory(text, brand);

  const title = extractTitle(text, brand);
  const storage = extractStorage(text);
  const ram = extractRam(text);
  const processor = extractProcessor(text);
  const screenSize = extractScreenSize(text);
  const color = extractColor(text);
  const condition = extractCondition(text);
  const description = extractDescription(text);
  const contactPhones = extractPhones(text);

  return {
    telegramMessageId: messageId,
    date,
    title,
    price,
    brand,
    categoryGuess: category,
    processor,
    storage,
    ram,
    screenSize,
    color,
    condition,
    description,
    contactPhones,
    photos,
    rawText: text,
  };
}

function stripEmojis(str) {
  return str
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u2600-\u27BF]/gu, '')
    .replace(/[\u200B-\u200F]/g, '')
    .replace(/[\uFE00-\uFE0F]/g, '')
    .replace(/[\u20E3]/g, '')
    .replace(/[\u{E0020}-\u{E007F}]/gu, '')
    .replace(/[\u0300-\u036F]/gu, '')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(text, brand) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const clean = stripEmojis(line);
    if (clean.length < 3 || clean.length > 100) continue;

    if (/^(free bag|free window|free software|exchange|discount|buy one|price|location|call|inbox|t\.me|http|original|warranty|full warranty|best for|key features|battery|display|audio|keyboard|security| creatives| students| professionals| business| travelers)/i.test(clean)) continue;
    if (/^\d+[,.]/.test(clean) && !/[a-zA-Z]{3,}/.test(clean)) continue;
    if (/^[\d\s]+$/.test(clean)) continue;
    if (clean.length < 5 && !/[a-zA-Z]{3,}/.test(clean)) continue;

    const stripped = clean.replace(/[^\w\s]/g, '').trim();
    if (stripped.length < 3) continue;

    return clean;
  }

  return stripEmojis(lines[0] || '').slice(0, 80) || 'Untitled';
}

function isBulkCatalog(text) {
  const numberedItems = text.match(/(?:^|\n)\s*(?:\d+[,.]|\d+[️⃣])/gm);
  return numberedItems && numberedItems.length >= 5;
}

function splitBulkCatalog(text, date, photos, messageId) {
  const products = [];

  const chunks = text.split(/(?:\n|^)\s*(?:\d+[,.]|\d+[️⃣])/gm).filter(Boolean);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i].trim();
    if (chunk.length < 10) continue;

    const hasBrand = detectBrand(chunk);
    const hasPrice = extractPrice(chunk);
    const hasSpecs = /ssd|hdd|ram|core|ryzen|inch|gb|tb/i.test(chunk);

    if (!hasBrand && !hasSpecs) continue;
    if (!hasPrice) continue;

    const product = parseSingleProduct(chunk, date, photos, `${messageId}_${i}`);
    if (product && product.price && product.brand) {
      products.push(product);
    }
  }

  return products;
}

export function parseMessages(htmlFiles, photoDir) {
  const allMessages = [];
  let currentMsg = null;

  for (const filePath of htmlFiles) {
    const $ = cheerio.load(filePath.content);

    $('div.message').each((_, msgEl) => {
      const $msg = $(msgEl);
      const isJoined = $msg.hasClass('joined');

      const idStr = $msg.attr('id') || '';
      const messageId = idStr.replace('message', '');

      const dateEl = $msg.find('div.date');
      const dateTitle = dateEl.attr('title') || '';
      const dateMatch = dateTitle.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}:\d{2})/);
      let date = null;
      if (dateMatch) {
        date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
      }

      const textEl = $msg.find('div.text');
      const rawHtml = textEl.length ? textEl.html() : '';
      const text = cleanHtml(rawHtml);

      const photos = [];
      $msg.find('a.photo_wrap').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('photos/')) {
          const filename = href.replace('photos/', '');
          const fullPath = path.join(photoDir, filename);
          photos.push(fullPath);
        }
      });

      if (isJoined && currentMsg) {
        currentMsg.photos.push(...photos);
        if (text && !currentMsg.text) {
          currentMsg.text = text;
        }
        return;
      }

      if (!text && photos.length === 0) return;
      if (text && text.length < 3 && photos.length === 0) return;

      currentMsg = {
        messageId,
        date,
        text,
        photos,
        rawHtml,
      };
      allMessages.push(currentMsg);
    });
  }

  return allMessages;
}

export function parseProducts(messages) {
  const products = [];

  for (const msg of messages) {
    if (!msg.text && msg.photos.length === 0) continue;

    if (msg.text && isBulkCatalog(msg.text)) {
      const bulkProducts = splitBulkCatalog(msg.text, msg.date, msg.photos, msg.messageId);
      products.push(...bulkProducts);
    } else {
      const product = parseSingleProduct(msg.text, msg.date, msg.photos, msg.messageId);
      if (product) {
        products.push(product);
      }
    }
  }

  return products;
}
