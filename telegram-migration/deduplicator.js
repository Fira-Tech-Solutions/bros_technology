function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeStorage(storage) {
  if (!storage) return '';
  const s = normalize(storage);
  const match = s.match(/(\d+)\s*(gb|tb)\s*(ssd|hdd|nvme|emmc)?/i);
  if (!match) return s;
  const size = match[1];
  const unit = match[2].toUpperCase();
  const type = match[3]?.toUpperCase() || '';
  return `${size}${unit} ${type}`.trim();
}

function normalizeRam(ram) {
  if (!ram) return '';
  const match = ram.match(/(\d+)\s*gb/i);
  return match ? `${match[1]}GB` : normalize(ram);
}

function normalizeProcessor(proc) {
  if (!proc) return '';
  let p = normalize(proc);
  p = p.replace(/generation|gen/g, '').trim();
  p = p.replace(/\s+/g, ' ');
  return p;
}

function getDedupKey(product) {
  const brand = normalize(product.brand || '');
  const model = normalize(product.title || '').replace(/^(hp|dell|lenovo|apple|samsung|asus|microsoft|toshiba|acer)\s*/i, '');
  const processor = normalizeProcessor(product.processor);
  const storage = normalizeStorage(product.storage);
  const ram = normalizeRam(product.ram);

  return `${brand}|${model}|${processor}|${storage}|${ram}`;
}

export function deduplicate(products) {
  const groups = new Map();

  for (const product of products) {
    const key = getDedupKey(product);

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(product);
  }

  const unique = [];
  let dedupCount = 0;

  for (const [key, group] of groups) {
    group.sort((a, b) => {
      const dateA = a.date || '0000-00-00';
      const dateB = b.date || '0000-00-00';
      return dateB.localeCompare(dateA);
    });

    const latest = { ...group[0] };
    latest.postCount = group.length;
    latest.allPostDates = group.map(p => p.date).filter(Boolean);

    if (group.length > 1) {
      dedupCount += group.length - 1;
      const prices = group.map(p => p.price).filter(Boolean);
      if (prices.length > 0) {
        latest.allPrices = [...new Set(prices)].sort((a, b) => a - b);
      }
    }

    unique.push(latest);
  }

  unique.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return { unique, dedupCount, totalGroups: groups.size };
}
