import { File, Directory, Paths } from "expo-file-system";

const MAX_FILES = 200;
const ACCESS_FILE = "access_times.json";

function getCacheDir() {
  return new Directory(Paths.cache, "media_cache");
}

function getAccessFile() {
  return new File(getCacheDir(), ACCESS_FILE);
}

function getCacheFile(url) {
  const hash = url.split("").reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0);
  const ext = url.replace(/\?.*/, "").split(".").pop() || "jpg";
  return new File(getCacheDir(), `${Math.abs(hash)}.${ext}`);
}

async function ensureDir() {
  const dir = getCacheDir();
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
}

async function getAccessData() {
  try {
    const file = getAccessFile();
    if (file.exists) {
      return JSON.parse(file.textSync());
    }
  } catch {}
  return {};
}

async function saveAccessData(data) {
  try {
    await ensureDir();
    getAccessFile().write(JSON.stringify(data));
  } catch {}
}

async function evictIfNeeded() {
  try {
    const dir = getCacheDir();
    if (!dir.exists) return;
    const files = dir.list().filter((f) => f.name !== ACCESS_FILE);
    if (files.length <= MAX_FILES) return;
    const access = await getAccessData();
    const sorted = files.sort((a, b) => (access[a.name] || 0) - (access[b.name] || 0));
    const toDelete = sorted.slice(0, sorted.length - MAX_FILES);
    await Promise.allSettled(toDelete.map((f) => f.delete()));
  } catch {}
}

export async function cacheImage(url) {
  if (!url || url.startsWith("file://") || url.startsWith("data:")) return url;
  try {
    await ensureDir();
    const file = getCacheFile(url);
    if (file.exists) {
      getAccessData().then((data) => {
        data[file.name] = Date.now();
        saveAccessData(data);
      });
      return file.uri;
    }
    const result = await File.downloadFileAsync(url, getCacheDir());
    await evictIfNeeded();
    return result.uri;
  } catch {
    return url;
  }
}

export async function getCachedUri(url) {
  if (!url || url.startsWith("file://") || url.startsWith("data:")) return url;
  try {
    const file = getCacheFile(url);
    return file.exists ? file.uri : url;
  } catch {
    return url;
  }
}

export async function prefetchImages(urls) {
  await ensureDir();
  const results = await Promise.allSettled(urls.filter(Boolean).map(cacheImage));
  return results.map((r) => (r.status === "fulfilled" ? r.value : null));
}

export async function clearMediaCache() {
  try {
    const dir = getCacheDir();
    if (dir.exists) dir.delete();
  } catch {}
}

export async function getMediaCacheInfo() {
  try {
    await ensureDir();
    const dir = getCacheDir();
    const files = dir.list().filter((f) => f.name !== ACCESS_FILE);
    const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
    return { count: files.length, bytes: totalBytes };
  } catch {
    return { count: 0, bytes: 0 };
  }
}
