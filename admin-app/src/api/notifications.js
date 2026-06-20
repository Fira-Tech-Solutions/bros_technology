import client from "./client";

export const getNotifications = (params) =>
  client.get("/api/notifications", { params });

export const markNotificationRead = (id) =>
  client.put(`/api/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  client.put("/api/notifications/read-all");
