import client from "./client";

export const getSyndicationConfigs = () =>
  client.get("/api/syndication/config");

export const getSyndicationConfig = (platform) =>
  client.get(`/api/syndication/config/${platform}`);

export const saveSyndicationConfig = (data) =>
  client.post("/api/syndication/config", data);

export const deleteSyndicationConfig = (platform) =>
  client.delete(`/api/syndication/config/${platform}`);

export const getTelegramInfo = () =>
  client.get("/api/syndication/telegram/info");

export const deleteSyndicationMessage = (messageId, logId) =>
  client.post(`/api/syndication/delete-message/${messageId}`, { logId });

export const editSyndicationMessage = (messageId, caption) =>
  client.post(`/api/syndication/edit-message/${messageId}`, { caption });

export const getSyndicationLogs = (params = {}) =>
  client.get("/api/syndication/logs", { params });

export const retrySyndication = (id) =>
  client.post(`/api/syndication/retry/${id}`);

// Telegram webhook configuration
export const setupTelegramWebhook = (webhookUrl) =>
  client.post("/api/syndication/telegram/setup-webhook", { webhookUrl });

export const getTelegramWebhookInfo = () =>
  client.get("/api/syndication/telegram/webhook-info");

export const configureTelegramBot = () =>
  client.post("/api/auth/telegram/configure");
