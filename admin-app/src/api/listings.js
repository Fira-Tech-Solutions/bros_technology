import client from "./client";
import { getCached, setCache, invalidateGroup } from "../utils/cache";

const LISTINGS_GROUP = "listings";
const LISTING_GROUP = "listing";
const LISTINGS_TTL = 5;
const LISTING_TTL = 10;

export const getListings = async (params = {}, forceRefresh = false) => {
  const cacheKey = Object.keys(params).length ? `listings_${JSON.stringify(params)}` : "listings_all";
  if (!forceRefresh) {
    const cached = await getCached(cacheKey, LISTINGS_GROUP);
    if (cached) return cached;
  }
  const res = await client.get("/api/listings", { params });
  await setCache(cacheKey, LISTINGS_GROUP, res, LISTINGS_TTL);
  return res;
};

export const getListing = async (id, forceRefresh = false) => {
  const cacheKey = `listing_${id}`;
  if (!forceRefresh) {
    const cached = await getCached(cacheKey, LISTING_GROUP);
    if (cached) return cached;
  }
  const res = await client.get(`/api/listings/${id}`);
  await setCache(cacheKey, LISTING_GROUP, res, LISTING_TTL);
  return res;
};

export const createListing = async (formData) => {
  const res = await client.post("/api/listings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });
  await invalidateGroup(LISTINGS_GROUP);
  return res;
};

export const updateListing = async (id, formData) => {
  const res = await client.patch(`/api/listings/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });
  await invalidateGroup(LISTINGS_GROUP);
  await invalidateGroup(LISTING_GROUP);
  return res;
};

export const deleteListing = async (id) => {
  const res = await client.delete(`/api/listings/${id}`);
  await invalidateGroup(LISTINGS_GROUP);
  await invalidateGroup(LISTING_GROUP);
  return res;
};
