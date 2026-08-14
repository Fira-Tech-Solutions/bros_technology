import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_URL = 'https://api.broslaptop.com';
const PRODUCTS_DIR = path.join(__dirname, 'output/products');
const AGENT_ID = '81e00673-1e3b-4eed-b312-f61bc5e5be63';

const CATEGORY_MAP = {
  LAPTOPS: '5b7cd80b-0d8c-4c20-8bc4-a7653c6da4d2',
  IPHONES_SAMSUNG: '146f7476-9e6b-4a33-b3c5-d6fce504be1d',
  IPADS_MACBOOKS: '54048e50-6336-4bc6-a63e-b51eef1dd3ff',
  SMARTWATCHES: '4169cadf-18ad-45a0-9c55-f86ddc13dd60',
  AIRPODS: 'a8a780ac-0444-467f-a6e8-544b1c16018f',
};

function normalizeRam(ram) {
  if (!ram) return '8GB';
  const match = ram.match(/(\d+)\s*gb/i);
  if (!match) return '8GB';
  const gb = parseInt(match[1]);
  const allowed = [4, 8, 16, 32, 64];
  const closest = allowed.reduce((prev, curr) =>
    Math.abs(curr - gb) < Math.abs(prev - gb) ? curr : prev
  );
  return `${closest}GB`;
}

function normalizeStorage(storage) {
  if (!storage) return '256GB SSD';
  const match = storage.match(/(\d+)\s*(gb|tb)/i);
  if (!match) return '256GB SSD';
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const hasSsd = /ssd/i.test(storage);
  const hasHdd = /hdd/i.test(storage);
  const isTb = unit === 'tb';

  if (isTb) {
    return num >= 2 ? '2TB SSD' : '1TB SSD';
  }
  if (hasHdd) return '1TB HDD';
  if (hasSsd || !hasHdd) {
    if (num <= 128) return '128GB SSD';
    if (num <= 256) return '256GB SSD';
    if (num <= 512) return '512GB SSD';
    return '1TB SSD';
  }
  return '256GB SSD';
}

function normalizeCondition(cond) {
  if (!cond) return 'Used - Good';
  const lower = cond.toLowerCase();
  if (/brand\s*new|new|sealed/i.test(lower)) return 'Brand New';
  if (/like\s*new/i.test(lower)) return 'Used - Like New';
  if (/fair|okay|ok/i.test(lower)) return 'Used - Fair';
  return 'Used - Good';
}

function normalizeScreenSize(size) {
  if (!size) return null;
  const match = size.match(/([\d.]+)\s*(inch|"|″)/i);
  if (!match) return null;
  const inches = parseFloat(match[1]);
  const allowed = ['13.3"', '14"', '15.6"', '16"', '17.3"'];
  const closest = allowed.reduce((prev, curr) => {
    const prevNum = parseFloat(prev);
    const currNum = parseFloat(curr);
    return Math.abs(currNum - inches) < Math.abs(prevNum - inches) ? curr : prev;
  });
  return closest;
}

async function login() {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin.brostechnology@gmail.com',
      password: 'Bros.strong@password123',
    }),
  });
  const data = await res.json();
  return data.data.token;
}

async function createListing(token, product, images) {
  const form = new FormData();
  form.append('title', product.title);
  form.append('price', product.price);
  form.append('categoryId', CATEGORY_MAP[product.category] || CATEGORY_MAP.LAPTOPS);
  form.append('agentId', AGENT_ID);
  form.append('stockQuantity', product.stockQuantity || 1);

  if (product.description) {
    form.append('description', product.description);
  }

  const attributes = {
    brand: product.brand || '',
    model: product.model || product.title.split(' ').slice(0, 3).join(' '),
    processor: product.processor || '',
    ram: normalizeRam(product.ram),
    storage: normalizeStorage(product.storage),
    condition: normalizeCondition(product.condition),
    screenSize: normalizeScreenSize(product.screenSize) || null,
    color: product.color || null,
    contactPhones: product.contactPhones || [],
  };
  form.append('attributes', JSON.stringify(attributes));

  for (const imgPath of images) {
    try {
      const imgBuffer = await fs.readFile(imgPath);
      form.append('images', imgBuffer, {
        filename: path.basename(imgPath),
        contentType: 'image/jpeg',
      });
    } catch (err) {
      console.warn(`    Skipping missing image: ${path.basename(imgPath)}`);
    }
  }

  const res = await fetch(`${API_URL}/api/listings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Unknown error');
  }
  return data.data;
}

async function main() {
  console.log('=== Product Import Script (Retry) ===\n');

  const files = await fs.readdir(PRODUCTS_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'summary.json');

  // Load previous log to find already-imported titles
  let importedTitles = new Set();
  try {
    const log = await fs.readFile(path.join(__dirname, 'import.log'), 'utf8');
    for (const line of log.split('\n')) {
      const match = line.match(/\[\d+\/\d+\]\s+(.+?)\.\.\.\s+OK/);
      if (match) importedTitles.add(match[1].trim());
    }
  } catch {}

  console.log(`Previously imported: ${importedTitles.size}`);
  console.log(`Total products: ${jsonFiles.length}\n`);

  // Only retry products not already imported
  const toImport = [];
  for (const file of jsonFiles) {
    const product = JSON.parse(await fs.readFile(path.join(PRODUCTS_DIR, file), 'utf8'));
    const photoCount = (product.photos || []).length;
    if (photoCount < 3 || !product.price || product.price < 100) continue;
    if (importedTitles.has(product.title.slice(0, 30))) continue;
    toImport.push({ file, product });
  }

  console.log(`To retry: ${toImport.length}\n`);

  const token = await login();
  console.log('Logged in successfully\n');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toImport.length; i++) {
    const { file, product } = toImport[i];
    process.stdout.write(`[${i + 1}/${toImport.length}] ${product.title.slice(0, 50)}... `);

    try {
      const images = (product.photos || []).slice(0, 3);
      await createListing(token, product, images);
      success++;
      console.log(`OK (${images.length} photos)`);
    } catch (err) {
      failed++;
      console.log(`FAILED: ${err.message}`);
    }
  }

  console.log(`\n=== Retry Complete ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
