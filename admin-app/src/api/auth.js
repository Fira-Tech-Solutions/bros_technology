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

export const forgotPassword = (email) =>
  client.post("/api/auth/forgot-password", { email });

export const resetPassword = (email, token, password) =>
  client.post("/api/auth/reset-password", { email, token, password });
