import { Platform } from "react-native";

let SecureStore;
if (Platform.OS !== "web") {
  SecureStore = require("expo-secure-store");
}

const webStorage = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  deleteItem: async (key) => localStorage.removeItem(key),
};

const store = Platform.OS === "web" ? webStorage : SecureStore;

export const getItemAsync = (key) => store.getItem(key);
export const setItemAsync = (key, value) => store.setItem(key, value);
export const deleteItemAsync = (key) => store.deleteItem(key);
