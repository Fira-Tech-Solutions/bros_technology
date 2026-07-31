import client from "./client";

export const getAssetStats = () => client.get("/api/commissions/asset-stats");

export const getCommissionSummary = () => client.get("/api/commissions/summary");

export const getCommissionListings = (params = {}) =>
  client.get("/api/commissions/listings", { params });

export const updateListingCommission = (id, commissionPercent) =>
  client.patch(`/api/commissions/listing/${id}`, { commissionPercent });
