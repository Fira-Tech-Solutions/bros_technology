import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import { parseMessages, parseProducts } from './parser.js';
import { deduplicate } from './deduplicator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPORT_DIR = process.env.EXPORT_DIR || path.join(__dirname, '..', 'temp', 'ChatExport_2026-08-13 (1)');
const OUTPUT_DIR = path.join(__dirname, 'output');
const PRODUCTS_DIR = path.join(OUTPUT_DIR, 'products');

function findHtmlFiles(dir) {
  const files = [];
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.html') && f.startsWith('messages')) {
      files.push(path.join(dir, f));
    }
  }
  return files.sort();
}

function loadHtmlFiles(htmlPaths) {
  return htmlPaths.map(p => ({
    path: p,
    content: fs.readFileSync(p, 'utf-8'),
  }));
}

function saveProduct(product, index) {
  const safeName = (product.title || 'unknown')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60);
  const filename = `${String(index).padStart(4, '0')}_${safeName}.json`;
  const filepath = path.join(PRODUCTS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(product, null, 2));
  return filename;
}

function main() {
  console.log('=== Telegram Channel Migration ===\n');

  console.log(`Export directory: ${EXPORT_DIR}`);
  const htmlFiles = findHtmlFiles(EXPORT_DIR);
  console.log(`Found ${htmlFiles.length} HTML files: ${htmlFiles.map(f => path.basename(f)).join(', ')}\n`);

  const photoDir = path.join(EXPORT_DIR, 'photos');
  const photoCount = fs.existsSync(photoDir)
    ? fs.readdirSync(photoDir).filter(f => !f.endsWith('_thumb.jpg') && !f.includes('_thumb (')).length
    : 0;
  console.log(`Photos found: ${photoCount} unique photos\n`);

  console.log('Parsing HTML files...');
  const htmlContents = loadHtmlFiles(htmlFiles);
  const messages = parseMessages(htmlContents, photoDir);
  console.log(`Extracted ${messages.length} messages with content\n`);

  console.log('Extracting products...');
  const products = parseProducts(messages);
  console.log(`Found ${products.length} product entries (before dedup)\n`);

  const withPrice = products.filter(p => p.price);
  const withoutPrice = products.filter(p => !p.price);
  console.log(`  With price: ${withPrice.length}`);
  console.log(`  Without price: ${withoutPrice.length}`);
  console.log('');

  console.log('Deduplicating...');
  const { unique, dedupCount, totalGroups } = deduplicate(products);
  console.log(`Unique products: ${unique.length}`);
  console.log(`Duplicates removed: ${dedupCount}`);
  console.log(`Total groups: ${totalGroups}\n`);

  const categoryStats = {};
  for (const p of unique) {
    const cat = p.categoryGuess || 'UNKNOWN';
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  }
  console.log('Category breakdown:');
  for (const [cat, count] of Object.entries(categoryStats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log('');

  const brandStats = {};
  for (const p of unique) {
    const brand = p.brand || 'Unknown';
    brandStats[brand] = (brandStats[brand] || 0) + 1;
  }
  console.log('Brand breakdown:');
  for (const [brand, count] of Object.entries(brandStats).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`  ${brand}: ${count}`);
  }
  console.log('');

  const reposted = unique.filter(p => p.postCount > 1);
  console.log(`Products posted multiple times: ${reposted.length}`);
  if (reposted.length > 0) {
    console.log('Top reposted:');
    for (const p of reposted.slice(0, 5)) {
      console.log(`  ${p.title} — posted ${p.postCount}x (${p.allPostDates?.join(', ')})`);
    }
  }
  console.log('');

  console.log('Saving products...');
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });

  for (let i = 0; i < unique.length; i++) {
    saveProduct(unique[i], i + 1);
  }
  console.log(`Saved ${unique.length} product files to ${PRODUCTS_DIR}\n`);

  const summary = {
    exportDir: EXPORT_DIR,
    totalMessages: messages.length,
    totalProductsBeforeDedup: products.length,
    uniqueProducts: unique.length,
    duplicatesRemoved: dedupCount,
    totalGroups,
    categoryStats,
    brandStats,
    productsWithPrice: withPrice.length,
    productsWithoutPrice: withoutPrice.length,
    repostedProducts: reposted.length,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(`Summary saved to ${path.join(OUTPUT_DIR, 'summary.json')}`);
  console.log('\nDone!');
}

main();
