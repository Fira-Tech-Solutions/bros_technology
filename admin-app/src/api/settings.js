import client from "./client";

export const getSettings = () => client.get("/api/settings");

export const updateSettings = (data) => client.put("/api/settings", data);
