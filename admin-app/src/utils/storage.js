import { Platform } from "react-native";

let store;

if (Platform.OS === "web") {
  store = {
    getItem: async (key) => {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    setItem: async (key, value) => {
      try { localStorage.setItem(key, value); } catch {}
    },
    deleteItem: async (key) => {
      try { localStorage.removeItem(key); } catch {}
    },
  };
} else {
  try {
    const SecureStore = require("expo-secure-store");
    store = {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      deleteItem: (key) => SecureStore.deleteItemAsync(key),
    };
  } catch {
    const mem = {};
    store = {
      getItem: async (key) => mem[key] ?? null,
      setItem: async (key, value) => { mem[key] = value; },
      deleteItem: async (key) => { delete mem[key]; },
    };
  }
}

export const getItemAsync = (key) => store.getItem(key);
export const setItemAsync = (key, value) => store.setItem(key, value);
export const deleteItemAsync = (key) => store.deleteItem(key);
