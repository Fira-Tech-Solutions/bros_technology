import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'brostechnology/listings';
const PEXELS_API_KEY = 'j4GnHQpUo8ix0iC1FxNRda3ALlSaIYd8El2jRBOoVw0Td8S5GgLQuYEd';
const TEMP_DIR = path.join(os.tmpdir(), 'seed-images');

const NEIGHBORHOODS = [
  'Bole', 'Kirkos', 'Arada', 'Yeka', 'Addis Ketema',
  'Akaki', 'Lideta', 'Nifas Silk', 'Mekanissa', 'Jemo',
  'Summe', 'Tuludeh', 'Saris', 'Megenagna', 'Atlas',
];
const CONDITIONS = ['Brand New', 'Used - Like New', 'Used - Good', 'Used - Fair'];
const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const RAM_OPTIONS = ['3GB', '4GB', '6GB', '8GB', '12GB', '16GB'];
const PHONE_COLORS = ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Green', 'Purple', 'Red', 'Natural Titanium', 'Desert Titanium', 'Midnight', 'Starlight'];
const CARRIERS = ['Unlocked', 'Ethio Telecom', 'Safaricom'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── PEXELS ────────────────────────────────────────────────
async function searchPexels(query, perPage = 15, page = 1) {
  const { data } = await axios.get('https://api.pexels.com/v1/search', {
    headers: { Authorization: PEXELS_API_KEY },
    params: { query, per_page: perPage, page, orientation: 'landscape', size: 'medium' },
  });
  return data.photos || [];
}

async function downloadImage(url, filename) {
  const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  const filePath = path.join(TEMP_DIR, filename);
  await fs.writeFile(filePath, data);
  return filePath;
}

async function uploadToCloudinary(filePath) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: CLOUDINARY_FOLDER,
    resource_type: 'image',
    format: 'webp',
    quality: 'auto:good',
    width: 1200,
    crop: 'limit',
  });
  return result.secure_url;
}

// ─── IMAGE POOL (small, reused) ────────────────────────────
async function buildImagePool(queries, needed) {
  const pool = [];
  let page = 1;
  while (pool.length < needed && page <= 5) {
    for (const q of queries) {
      const photos = await searchPexels(q, 20, page);
      for (const p of photos) {
        if (pool.length >= needed) break;
        pool.push(p.src.large);
      }
      if (pool.length >= needed) break;
      await delay(350);
    }
    page++;
    await delay(400);
  }
  return pool;
}

async function downloadAndUploadImages(urls) {
  const cloudUrls = [];
  for (let i = 0; i < urls.length; i++) {
    try {
      const filename = `seed_${Date.now()}_${i}.jpg`;
      const localPath = await downloadImage(urls[i], filename);
      const cloudUrl = await uploadToCloudinary(localPath);
      cloudUrls.push(cloudUrl);
      await fs.unlink(localPath).catch(() => {});
      process.stdout.write(`  → Uploaded ${cloudUrls.length}/${urls.length}\r`);
    } catch (err) {
      console.warn(`  [warn] image ${i} failed: ${err.message}`);
    }
  }
  console.log('');
  return cloudUrls;
}

// ─── PRODUCT GENERATORS ────────────────────────────────────
const IPHONES_SAMSUNG_DATA = [
  { brand: 'Apple', models: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12', 'iPhone SE (3rd Gen)', 'iPhone 11'] },
  { brand: 'Samsung', models: ['Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S24 Ultra', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy A56', 'Galaxy A55', 'Galaxy A36', 'Galaxy A16', 'Galaxy Z Fold6', 'Galaxy Z Flip6'] },
  { brand: 'Xiaomi', models: ['Redmi Note 14 Pro+', 'Redmi Note 14 Pro', 'Redmi 14C', 'POCO X7 Pro', 'POCO X7', 'Xiaomi 15 Ultra', 'Xiaomi 14'] },
  { brand: 'Huawei', models: ['Pura 70 Ultra', 'Pura 70 Pro', 'Nova 12 Pro', 'Nova 12'] },
  { brand: 'Tecno', models: ['Phantom V Fold2', 'Camon 30 Pro', 'Camon 30', 'Spark 20 Pro+', 'Pova 6 Pro'] },
  { brand: 'Infinix', models: ['Zero 40', 'Hot 50 Pro+', 'Hot 50', 'Note 40 Pro', 'Smart 9'] },
  { brand: 'Oppo', models: ['Find X8 Pro', 'Reno 12 Pro', 'Reno 12', 'A3 Pro', 'A3'] },
  { brand: 'Vivo', models: ['X200 Pro', 'X200', 'V40', 'V30 Pro', 'Y28'] },
  { brand: 'Realme', models: ['GT 7 Pro', 'GT 6', '13 Pro+', '13', '12 Pro', 'C67'] },
  { brand: 'Nothing', models: ['Phone (2a) Plus', 'Phone (2a)', 'Phone (2)'] },
  { brand: 'Google', models: ['Pixel 9 Pro', 'Pixel 9', 'Pixel 8a', 'Pixel 8'] },
  { brand: 'OnePlus', models: ['13', '12R', '12', 'Nord CE4'] },
];

function generatePhone() {
  const bd = pick(IPHONES_SAMSUNG_DATA);
  const model = pick(bd.models);
  const storage = pick(STORAGE_OPTIONS);
  const ram = pick(RAM_OPTIONS);
  const color = pick(PHONE_COLORS);
  const condition = pick(CONDITIONS);
  const carrier = pick(CARRIERS);
  const year = randInt(2021, 2026);
  const battery = randInt(80, 100);
  let price;
  if (bd.brand === 'Apple') price = model.includes('Pro Max') ? randInt(75000, 120000) : model.includes('Pro') ? randInt(60000, 95000) : randInt(25000, 65000);
  else if (bd.brand === 'Samsung') price = model.includes('Ultra') ? randInt(55000, 90000) : model.includes('S2') ? randInt(30000, 65000) : randInt(8000, 35000);
  else price = randInt(5000, 45000);
  if (condition === 'Used - Like New') price = Math.round(price * 0.85);
  else if (condition === 'Used - Good') price = Math.round(price * 0.7);
  else if (condition === 'Used - Fair') price = Math.round(price * 0.55);
  return {
    title: `${bd.brand} ${model} ${storage} - ${color}`,
    description: `${condition} ${bd.brand} ${model} with ${storage} storage and ${ram} RAM. ${color}. ${carrier}. Battery: ${battery}%.`,
    price,
    attributes: { brand: bd.brand, model, storage, ram, color, condition, carrier, year, batteryHealth: `${battery}%`, hasWarranty: Math.random() > 0.5 },
  };
}

const LAPTOP_BRANDS = [
  { brand: 'Apple', models: ['MacBook Pro M4 14"', 'MacBook Pro M4 Pro 14"', 'MacBook Air M3 15"', 'MacBook Air M3 13"', 'MacBook Air M2 13"'] },
  { brand: 'Dell', models: ['XPS 15', 'XPS 13 Plus', 'Inspiron 16', 'Latitude 7440', 'Alienware m16 R2'] },
  { brand: 'HP', models: ['Spectre x360 14', 'Envy 16', 'Pavilion 15', 'Victus 16', 'EliteBook 840 G10'] },
  { brand: 'Lenovo', models: ['ThinkPad X1 Carbon Gen 12', 'ThinkPad T14s Gen 4', 'IdeaPad Slim 5 14', 'Legion Pro 7i 16', 'Yoga 9i 14'] },
  { brand: 'Asus', models: ['ROG Strix G16', 'ROG Zephyrus G16', 'Zenbook 14 OLED', 'Vivobook 15', 'TUF Gaming A15'] },
  { brand: 'Acer', models: ['Predator Helios 16', 'Nitro V 15', 'Aspire 5', 'Swift Go 14'] },
  { brand: 'MSI', models: ['Raider GE78 HX', 'Cyborg 15', 'Thin 15'] },
  { brand: 'Samsung', models: ['Galaxy Book4 Ultra', 'Galaxy Book4 Pro', 'Galaxy Book4'] },
];
const PROCESSORS = ['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M1', 'Apple M2', 'Apple M3', 'Apple M4'];
const GPUS = ['Intel UHD', 'Intel Iris Xe', 'NVIDIA RTX 4050', 'NVIDIA RTX 4060', 'NVIDIA RTX 4070', 'NVIDIA RTX 3050', 'NVIDIA RTX 3060', 'AMD Radeon Graphics'];

function generateLaptop() {
  const bd = pick(LAPTOP_BRANDS);
  const model = pick(bd.models);
  const processor = bd.brand === 'Apple' ? pick(['Apple M1', 'Apple M2', 'Apple M3', 'Apple M4', 'Apple M3 Pro', 'Apple M4 Pro']) : pick(PROCESSORS);
  const ram = pick(['8GB', '16GB', '32GB', '64GB']);
  const storage = pick(['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD']);
  const gpu = bd.brand === 'Apple' ? `${processor.split(' ').slice(0, 2).join(' ')} GPU` : pick(GPUS);
  const screenSize = pick(['13.3"', '14"', '15.6"', '16"', '17.3"']);
  const color = pick(['Black', 'Silver', 'White', 'Space Gray', 'Midnight', 'Starlight', 'Blue']);
  const condition = pick(CONDITIONS);
  let price;
  if (bd.brand === 'Apple') price = model.includes('Pro') ? randInt(120000, 350000) : randInt(70000, 150000);
  else if (bd.brand === 'Dell' || bd.brand === 'HP') price = randInt(30000, 180000);
  else price = randInt(25000, 200000);
  if (condition === 'Used - Like New') price = Math.round(price * 0.8);
  else if (condition === 'Used - Good') price = Math.round(price * 0.65);
  else if (condition === 'Used - Fair') price = Math.round(price * 0.5);
  return {
    title: `${bd.brand} ${model} ${ram} ${storage}`,
    description: `${condition} ${bd.brand} ${model}. ${processor}, ${ram} RAM, ${storage}, ${gpu}, ${screenSize}. ${color}.`,
    price,
    attributes: { brand: bd.brand, model, processor, ram, storage, gpu, screenSize, color, condition, hasWarranty: Math.random() > 0.5, os: bd.brand === 'Apple' ? 'macOS' : 'Windows 11' },
  };
}

function generateIPadMac() {
  const isMacBook = Math.random() > 0.5;
  if (isMacBook) {
    const model = pick(['MacBook Pro M4 Max 16"', 'MacBook Pro M4 Pro 16"', 'MacBook Air M3 15"', 'MacBook Air M3 13"']);
    const processor = model.includes('M4') ? pick(['Apple M4 Pro', 'Apple M4 Max', 'Apple M4']) : 'Apple M3';
    const ram = pick(['8GB', '16GB', '24GB', '36GB']);
    const storage = pick(['512GB SSD', '1TB SSD', '2TB SSD']);
    const condition = pick(CONDITIONS);
    let price = model.includes('Max') || model.includes('Pro') ? randInt(150000, 350000) : randInt(90000, 180000);
    if (condition !== 'Brand New') price = Math.round(price * 0.8);
    return { title: `Apple ${model} ${ram} ${storage}`, description: `${condition} Apple ${model}. ${processor}, ${ram}, ${storage}.`, price, attributes: { brand: 'Apple', model, processor, ram, storage, color: pick(['Space Black', 'Silver', 'Starlight', 'Midnight']), condition, hasWarranty: Math.random() > 0.3 } };
  }
  const model = pick(['iPad Pro M4 13"', 'iPad Pro M4 11"', 'iPad Air M2 13"', 'iPad Air M2 11"', 'iPad 10th Gen', 'iPad Mini 6th Gen']);
  const storage = pick(['64GB', '128GB', '256GB', '512GB', '1TB']);
  const color = pick(['Space Black', 'Silver', 'Starlight', 'Midnight', 'Blue', 'Purple', 'Pink']);
  const condition = pick(CONDITIONS);
  let price = model.includes('Pro') ? randInt(60000, 180000) : randInt(30000, 80000);
  if (condition !== 'Brand New') price = Math.round(price * 0.8);
  return { title: `Apple ${model} ${storage} - ${color}`, description: `${condition} Apple ${model}. ${storage}. ${color}.`, price, attributes: { brand: 'Apple', model, storage, color, condition, screenSize: model.includes('13"') ? '13"' : model.includes('11"') ? '11"' : '10.9"', hasWarranty: Math.random() > 0.3 } };
}

function generateAirpods() {
  const model = pick(['AirPods 4', 'AirPods 4 (ANC)', 'AirPods Pro 2 (USB-C)', 'AirPods Pro 2 (Lightning)', 'AirPods Pro 1', 'AirPods 3rd Gen', 'AirPods 2nd Gen', 'AirPods Max (USB-C)', 'AirPods Max (Lightning)']);
  const color = pick(['White', 'Silver', 'Space Gray', 'Sky Blue', 'Green', 'Pink']);
  const condition = pick(CONDITIONS);
  let price = model.includes('Max') ? randInt(35000, 45000) : model.includes('Pro') ? randInt(15000, 28000) : randInt(5000, 18000);
  if (condition !== 'Brand New') price = Math.round(price * 0.75);
  return { title: `Apple ${model} - ${color}`, description: `${condition} Apple ${model}. ${color}.`, price, attributes: { brand: 'Apple', model, color, condition, hasWarranty: Math.random() > 0.3, hasAppleCare: Math.random() > 0.6 } };
}

const WATCH_BRANDS = [
  { brand: 'Apple', models: ['Apple Watch Ultra 2', 'Apple Watch Series 10 46mm', 'Apple Watch Series 10 42mm', 'Apple Watch SE 2nd Gen 44mm'] },
  { brand: 'Samsung', models: ['Galaxy Watch Ultra', 'Galaxy Watch7 44mm', 'Galaxy Watch6 Classic 47mm', 'Galaxy Watch FE'] },
  { brand: 'Huawei', models: ['Watch GT 5 Pro 46mm', 'Watch GT 5 46mm', 'Watch GT 4 46mm', 'Watch Fit 3'] },
  { brand: 'Xiaomi', models: ['Watch S4', 'Redmi Watch 5', 'Smart Band 9 Pro'] },
  { brand: 'Amazfit', models: ['T-Rex Ultra', 'T-Rex 3', 'GTR 4', 'Active 2'] },
  { brand: 'Garmin', models: ['Fenix 8', 'Forerunner 965', 'Venu 3', 'Instinct 2X'] },
];

function generateWatch() {
  const bd = pick(WATCH_BRANDS);
  const model = pick(bd.models);
  const color = pick(['Black', 'Silver', 'White', 'Gold', 'Rose Gold', 'Blue', 'Green', 'Titanium', 'Midnight', 'Orange']);
  const condition = pick(CONDITIONS);
  let price = bd.brand === 'Apple' ? (model.includes('Ultra') ? randInt(45000, 60000) : randInt(15000, 40000)) : bd.brand === 'Samsung' ? randInt(12000, 35000) : randInt(8000, 30000);
  if (condition !== 'Brand New') price = Math.round(price * 0.75);
  return { title: `${bd.brand} ${model} - ${color}`, description: `${condition} ${bd.brand} ${model}. ${color}.`, price, attributes: { brand: bd.brand, model, color, caseSize: pick(['38mm', '40mm', '41mm', '42mm', '44mm', '45mm', '46mm', '49mm']), condition, connectivity: pick(['Bluetooth Only', 'Wi-Fi + Cellular', 'Wi-Fi Only']), hasWarranty: Math.random() > 0.3 } };
}

// ─── MAIN ──────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   BROS Technology — Product Seed Script     ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // 1. Clear
  console.log('[1/5] Removing existing listings...');
  const deleted = await prisma.listing.deleteMany();
  console.log(`  ✓ Deleted ${deleted.count} listings\n`);

  // 2. Agent
  console.log('[2/5] Fetching Demo Agent...');
  const agent = await prisma.user.findUnique({ where: { email: 'agent@brostechnology.com' } });
  if (!agent) { console.error('✗ Run seed.js first'); process.exit(1); }
  console.log(`  ✓ ${agent.name} (${agent.id})\n`);

  // 3. Categories
  console.log('[3/5] Fetching categories...');
  const cats = await prisma.category.findMany();
  const catMap = Object.fromEntries(cats.map(c => [c.name, c.id]));
  console.log(`  ✓ ${cats.length} categories\n`);

  // 4. Temp dir
  await fs.mkdir(TEMP_DIR, { recursive: true });

  // 5. Seed
  const BUDGET = [
    { name: 'IPHONES_SAMSUNG', count: 200, gen: generatePhone, queries: ['iPhone 15 Pro smartphone', 'Samsung Galaxy phone', 'Xiaomi Redmi phone', 'Tecno smartphone', 'Infinix phone'], imgsNeeded: 30 },
    { name: 'LAPTOPS', count: 120, gen: generateLaptop, queries: ['MacBook Pro laptop', 'Dell XPS laptop', 'HP laptop', 'Lenovo ThinkPad', 'gaming laptop'], imgsNeeded: 30 },
    { name: 'IPADS_MACBOOKS', count: 70, gen: generateIPadMac, queries: ['iPad Pro tablet', 'MacBook Air laptop', 'Apple tablet'], imgsNeeded: 25 },
    { name: 'SMARTWATCHES', count: 60, gen: generateWatch, queries: ['Apple Watch', 'Samsung Galaxy Watch', 'smartwatch wearable'], imgsNeeded: 25 },
    { name: 'AIRPODS', count: 50, gen: generateAirpods, queries: ['AirPods earbuds', 'wireless earbuds', 'AirPods Max'], imgsNeeded: 20 },
  ];

  let totalCreated = 0;

  for (const cfg of BUDGET) {
    const catId = catMap[cfg.name];
    if (!catId) { console.log(`  ⚠ Skip ${cfg.name}`); continue; }

    console.log(`[4/5] ${cfg.name} (${cfg.count} products)...`);

    // Fetch a small pool of images (reused across listings)
    console.log(`  → Fetching ${cfg.imgsNeeded} images from Pexels...`);
    const imageUrls = await buildImagePool(cfg.queries, cfg.imgsNeeded);
    console.log(`  → Got ${imageUrls.length} URLs`);

    console.log(`  → Uploading to Cloudinary...`);
    const cloudImages = await downloadAndUploadImages(imageUrls);
    console.log(`  ✓ ${cloudImages.length} images ready\n`);

    if (cloudImages.length === 0) {
      console.log(`  ⚠ No images, skipping ${cfg.name}\n`);
      continue;
    }

    // Generate listings (reusing images from pool)
    const listings = [];
    for (let i = 0; i < cfg.count; i++) {
      const product = cfg.gen();
      const neighborhood = pick(NEIGHBORHOODS);
      const numImages = randInt(2, Math.min(4, cloudImages.length));
      const listingImages = [];
      for (let j = 0; j < numImages; j++) {
        listingImages.push(cloudImages[(i + j) % cloudImages.length]);
      }
      listings.push({
        title: product.title,
        description: product.description,
        price: product.price,
        city: 'Addis Ababa',
        neighborhood,
        images: listingImages,
        attributes: product.attributes,
        categoryId: catId,
        agentId: agent.id,
        status: Math.random() > 0.15 ? 'AVAILABLE' : pick(['PENDING', 'SOLD']),
        viewsCount: randInt(0, 500),
        inquiryClicks: randInt(0, 50),
      });
    }

    const result = await prisma.listing.createMany({ data: listings });
    totalCreated += result.count;
    console.log(`  ✓ Created ${result.count} listings\n`);
  }

  // Cleanup
  console.log('[5/5] Cleanup...');
  await fs.rm(TEMP_DIR, { recursive: true, force: true });
  console.log('  ✓ Done\n');

  console.log('═══════════════════════════════════════════════');
  console.log(`  TOTAL: ${totalCreated} products seeded`);
  console.log('═══════════════════════════════════════════════');
}

main()
  .catch(e => { console.error('✗ Failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
