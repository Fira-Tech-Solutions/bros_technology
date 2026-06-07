import axios from "axios";
import { getItemAsync, deleteItemAsync } from "../utils/storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  async (config) => {
    const token = await getItemAsync("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await deleteItemAsync("auth_token");
      await deleteItemAsync("user_data");
    }

    if (error.code === "ECONNABORTED") {
      error.message =
        "Request timed out. Please check your network connection and try again.";
    }

    if (!error.response && error.request) {
      error.message =
        "Unable to reach the server. Please verify your network and server address.";
    }

    return Promise.reject(error);
  }
);

export default client;
