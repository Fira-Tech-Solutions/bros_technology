import client from "./client";

export const login = (email, password) =>
  client.post("/api/auth/login", { email, password });

export const register = (data) =>
  client.post("/api/auth/register", data);

export const getProfile = () => client.get("/api/auth/me");
