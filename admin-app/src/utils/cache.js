import { getItemAsync, setItemAsync, deleteItemAsync } from "./storage";

const CACHE_PREFIX = "c_";
const VER_PREFIX = "v_";

async function getGroupVersion(group) {
  try {
    const v = await getItemAsync(`${VER_PREFIX}${group}`);
    return v ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}

async function bumpGroupVersion(group) {
  try {
    const current = await getGroupVersion(group);
    await setItemAsync(`${VER_PREFIX}${group}`, String(current + 1));
  } catch {}
}

export async function getCached(key, group) {
  try {
    const raw = await getItemAsync(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      await deleteItemAsync(`${CACHE_PREFIX}${key}`);
      return null;
    }
    if (group && entry.version !== undefined) {
      const currentVer = await getGroupVersion(group);
      if (entry.version !== currentVer) return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function setCache(key, group, data, ttlMinutes = 5) {
  try {
    const version = group ? await getGroupVersion(group) : 0;
    const entry = {
      data,
      version,
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    };
    await setItemAsync(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {}
}

export async function invalidateGroup(group) {
  await bumpGroupVersion(group);
}

export async function clearCache() {
  try {
    await deleteItemAsync("cache_clear");
  } catch {}
}
