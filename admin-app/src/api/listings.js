import client from "./client";

export const getListings = (params = {}) =>
  client.get("/api/listings", { params });

export const getListing = (id) => client.get(`/api/listings/${id}`);

export const createListing = (formData) =>
  client.post("/api/listings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });

export const updateListing = (id, formData) =>
  client.patch(`/api/listings/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });
