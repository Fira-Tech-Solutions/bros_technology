import client from "./client";

export const getSyndicationLogs = (params = {}) =>
  client.get("/api/syndication/logs", { params });

export const retrySyndication = (id) =>
  client.post(`/api/syndication/retry/${id}`);
