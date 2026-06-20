import client from "./client";
import { getCached, setCache, invalidateGroup } from "../utils/cache";

const CACHE_GROUP = "categories";
const CACHE_KEY = "categories_all";
const CACHE_TTL = 60;

export const getCategories = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = await getCached(CACHE_KEY, CACHE_GROUP);
    if (cached) return cached;
  }
  const res = await client.get("/api/categories");
  await setCache(CACHE_KEY, CACHE_GROUP, res, CACHE_TTL);
  return res;
};

export const getCategory = (id) => client.get(`/api/categories/${id}`);

export const createCategory = async (data) => {
  const res = await client.post("/api/categories", data);
  await invalidateGroup(CACHE_GROUP);
  return res;
};

export const updateCategory = async (id, data) => {
  const res = await client.patch(`/api/categories/${id}`, data);
  await invalidateGroup(CACHE_GROUP);
  return res;
};

export const deleteCategory = async (id) => {
  const res = await client.delete(`/api/categories/${id}`);
  await invalidateGroup(CACHE_GROUP);
  return res;
};
