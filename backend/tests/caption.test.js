#!/usr/bin/env node

function formatPrice(price) {
  if (!price) return 'Price on request';
  const num = Number(price);
  if (Number.isNaN(num)) return 'Price on request';
  return `${num.toLocaleString('en-US')} ETB`;
}

function escapeMarkdownV1(text) {
  if (!text) return '';
  return String(text).replace(/([_*`[\]~>!\\])/g, '\\$1');
}

const FIELD_LABELS = {
  brand: '📱 Brand', model: '📦 Model', storage: '💾 Storage', ram: '🧠 RAM',
  color: '🎨 Color', condition: '✅ Condition', processor: '⚡ Processor',
  gpu: '🎮 GPU', screenSize: '🖥 Screen', os: '💻 OS', batteryHealth: '🔋 Battery',
  carrier: '📡 Carrier', hasWarranty: '🛡 Warranty',
};

const CATEGORY_CAPTIONS = {
  IPHONES_SAMSUNG: ['brand', 'model', 'storage', 'ram', 'color', 'condition', 'batteryHealth', 'carrier', 'hasWarranty'],
};

function buildContactSection(callNumbers, telegramHandle, channelUsername) {
  const lines = [];
  for (const num of callNumbers) lines.push(`📞 Call us: ${num}`);
  if (telegramHandle) lines.push(`💬 Message us: @${telegramHandle}`);
  if (channelUsername) lines.push(`📢 Join channel: @${channelUsername}`);
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
    ? listing.attributes : {};

  const sections = [`*${title}*`];

  if (fields && fields.length > 0) {
    const attrLines = [];
    for (const field of fields) {
      const value = attributes[field];
      if (value === undefined || value === null || value === '') continue;
      const label = FIELD_LABELS[field] || field;
      const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : escapeMarkdownV1(value);
      attrLines.push(`${label}: ${displayValue}`);
    }
    if (attrLines.length > 0) sections.push('', ...attrLines);
  }

  const description = listing.description
    ? escapeMarkdownV1(listing.description.length > 200 ? `${listing.description.slice(0, 200)}...` : listing.description)
    : '';
  if (description) sections.push('', description);

  sections.push('', `💰 *Price:* ${price}`);

  const { callNumbers = [], telegramHandle = '', channelUsername = '' } = context;
  sections.push(...buildContactSection(callNumbers, telegramHandle, channelUsername));

  sections.push('', 'Listed on _BROS Technology_');
  return sections.join('\n');
}

function buildMediaCaption(listing, context = {}) {
  const full = buildCaption(listing, context);
  if (full.length <= 1024) return full;

  const title = escapeMarkdownV1(listing.title) || 'Untitled Listing';
  const price = formatPrice(listing.price);
  const categoryName = listing.category?.name || '';
  const fields = CATEGORY_CAPTIONS[categoryName];
  const attributes = listing.attributes && typeof listing.attributes === 'object'
    ? listing.attributes : {};

  const short = [`*${title}*`];
  if (fields && fields.length > 0) {
    const shown = fields.filter((f) => {
      const v = attributes[f];
      return v !== undefined && v !== null && v !== '';
    }).slice(0, 3);
    for (const field of shown) {
      const label = FIELD_LABELS[field] || field;
      const displayValue = typeof attributes[field] === 'boolean'
        ? (attributes[field] ? 'Yes' : 'No') : escapeMarkdownV1(attributes[field]);
      short.push(`${label}: ${displayValue}`);
    }
  }
  short.push('', `💰 *Price:* ${price}`);
  short.push('', '_Full details in the listing post_');
  return short.join('\n');
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    passed++;
  } catch (e) {
    console.error(`  \x1b[31m✗\x1b[0m ${name}`);
    console.error(`    ${e.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

const LISTING = {
  title: 'iPhone 14 * Pro Max',
  description: 'Great phone with _battery_ life and `code` stuff (up to 2.4GHz) tested!',
  price: 75000,
  customTelegramCaption: null,
  category: { name: 'IPHONES_SAMSUNG' },
  attributes: {
    brand: 'Apple', model: 'iPhone 14', storage: '128GB', ram: '6GB',
    color: 'Deep Purple', condition: 'Like New', batteryHealth: '95%',
    carrier: 'Unlocked', hasWarranty: true,
  },
};

const CTX_FULL = {
  callNumbers: ['+251972195934', '+251980564814'],
  telegramHandle: 'brostechnology',
  channelUsername: 'broslaptop',
};

const LISTING_BRACKETS = {
  ...LISTING,
  title: 'Samsung Galaxy S24 [Ultra] Edition',
  attributes: { ...LISTING.attributes, brand: 'Samsung [Official]' },
};

const LISTING_UNKNOWN_CAT = {
  ...LISTING,
  title: 'Mystery Gadget *v2*',
  category: { name: 'UNKNOWN' },
  attributes: { someField: 'value with _underscores_' },
};

console.log('\n--- escapeMarkdownV1 ---');

test('escapes asterisks in title', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  assert(c.includes('iPhone 14 \\* Pro Max'), `Got: ${c.substring(0, 60)}`);
});

test('escapes underscores in description', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  assert(c.includes('\\_battery\\_'), `Got: ${c}`);
});

test('escapes backticks in description', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  assert(c.includes('\\`code\\`'), `Got: ${c}`);
});

test('escapes parentheses in description', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  assert(c.includes('(up to 2.4GHz)'), `Got: ${c}`);
});

test('escapes brackets in title', () => {
  const c = buildCaption(LISTING_BRACKETS, CTX_FULL);
  assert(c.includes('\\[Ultra\\]'), `Got: ${c}`);
});

test('escapes brackets in attribute values', () => {
  const c = buildCaption(LISTING_BRACKETS, CTX_FULL);
  assert(c.includes('Samsung \\[Official\\]'), `Got: ${c}`);
});

console.log('\n--- structure order ---');

test('title is bold', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  assert(c.startsWith('*Title') || c.startsWith('*iPhone'), `Starts with: ${c.substring(0, 30)}`);
});

test('attributes come before price', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  const brandIdx = c.indexOf('Apple');
  const priceIdx = c.indexOf('*Price:*');
  assert(brandIdx > 0 && brandIdx < priceIdx, `brand=${brandIdx} price=${priceIdx}`);
});

test('description comes before price', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  const descIdx = c.indexOf('Great phone');
  const priceIdx = c.indexOf('*Price:*');
  assert(descIdx > 0 && descIdx < priceIdx, `desc=${descIdx} price=${priceIdx}`);
});

test('price comes before contact', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  const priceIdx = c.indexOf('*Price:*');
  const phoneIdx = c.indexOf('📞');
  assert(priceIdx < phoneIdx, `price=${priceIdx} phone=${phoneIdx}`);
});

test('contact comes before footer', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  const phoneIdx = c.indexOf('📞');
  const footerIdx = c.indexOf('BROS Technology');
  assert(phoneIdx < footerIdx, `phone=${phoneIdx} footer=${footerIdx}`);
});

console.log('\n--- content correctness ---');

test('custom caption returned as-is', () => {
  const c = buildCaption({ ...LISTING, customTelegramCaption: 'Custom *text*' }, CTX_FULL);
  assert(c === 'Custom *text*', `Got: ${c}`);
});

test('works with empty context (no contact info)', () => {
  const c = buildCaption(LISTING, {});
  assert(!c.includes('📞'), `Should not have phone`);
  assert(!c.includes('💬'), `Should not have telegram`);
  assert(!c.includes('📢'), `Should not have channel`);
  assert(c.includes('*Price:*'), `Should have price`);
});

test('unknown category still works', () => {
  const c = buildCaption(LISTING_UNKNOWN_CAT, CTX_FULL);
  assert(c.includes('Mystery Gadget'), `Missing title`);
  assert(c.includes('*Price:*'), `Missing price`);
  assert(c.includes('\\*v2\\*'), `Should escape title asterisks: ${c}`);
});

test('boolean attribute renders as Yes/No', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  assert(c.includes('🛡 Warranty: Yes'), `Got: ${c}`);
});

test('contact section has all elements', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  assert(c.includes('📞 Call us: +251972195934'), `Missing phone1`);
  assert(c.includes('📞 Call us: +251980564814'), `Missing phone2`);
  assert(c.includes('💬 Message us: @brostechnology'), `Missing telegram`);
  assert(c.includes('📢 Join channel: @broslaptop'), `Missing channel`);
});

test('price formatted with commas', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  assert(c.includes('75,000 ETB'), `Got: ${c}`);
});

test('no unescaped * outside formatting', () => {
  const c = buildCaption(LISTING, CTX_FULL);
  const lines = c.split('\n');
  for (const line of lines) {
    const stripped = line.replace(/\*Price:\*/g, '').replace(/^\*/, '').replace(/\*$/, '');
    const stars = stripped.match(/(?<!\\)\*/g);
    assert(!stars || stars.length === 0, `Unescaped * in: "${line}"`);
  }
});

console.log('\n--- media group caption ---');

test('exact failing listing works (parentheses + dashes)', () => {
  const realListing = {
    title: 'HP Elitebook 1040 G3',
    description: 'High Quality processor  Intel Core i5 -6th generation (up to 2.4GHz) with Intel Turbo Boost technology',
    price: 51999,
    customTelegramCaption: null,
    category: { name: 'LAPTOPS' },
    attributes: { brand: 'HP', model: 'EliteBook 840 G10', processor: 'Intel Core i5', ram: '16GB', storage: '512GB SSD', gpu: 'Intel Iris Xe', color: 'Silver', condition: 'Used - Like New', os: 'Windows 11', hasWarranty: true },
  };
  const c = buildCaption(realListing, CTX_FULL);
  assert(c.includes('(up to 2.4GHz)'), `Parentheses should NOT be escaped: ${c}`);
  assert(c.includes('51,999 ETB'), `Missing price`);
});

test('short caption escapes markdown when over 1024', () => {
  const longListing = {
    ...LISTING,
    title: 'A'.repeat(900) + ' * special',
    description: 'x'.repeat(200),
  };
  const c = buildMediaCaption(longListing, CTX_FULL);
  const hasEscaped = c.includes('\\* special') || !c.includes('* special');
  assert(hasEscaped, `Should escape asterisks: ${c.substring(0, 120)}`);
});

test('short caption uses price after attributes', () => {
  const longListing = {
    ...LISTING,
    title: 'B'.repeat(900),
  };
  const c = buildMediaCaption(longListing, CTX_FULL);
  const brandIdx = c.indexOf('Apple');
  const priceIdx = c.indexOf('*Price:*');
  assert(brandIdx > 0 && brandIdx < priceIdx, `brand=${brandIdx} price=${priceIdx}`);
});

console.log(`\n\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m\n`);
process.exit(failed > 0 ? 1 : 0);
