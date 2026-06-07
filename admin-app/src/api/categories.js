import client from "./client";

export const getCategories = () => client.get("/api/categories");

export const getCategory = (id) => client.get(`/api/categories/${id}`);
