import client from "./client";

export const login = (email, password) =>
  client.post("/api/auth/login", { email, password });

export const register = (data) =>
  client.post("/api/auth/register", data);

export const getProfile = () => client.get("/api/auth/me");

export const updateProfile = (formData) =>
  client.put("/api/auth/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Telegram connection
export const connectTelegram = () =>
  client.post("/api/auth/telegram/connect");

export const getTelegramStatus = () =>
  client.get("/api/auth/telegram/status");

export const disconnectTelegram = () =>
  client.post("/api/auth/telegram/disconnect");
