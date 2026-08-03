import React, { createContext, useState, useContext, useEffect } from "react";
import { getProfile, login, register } from "../api/auth";
import client from "../api/client";
import { getItemAsync, setItemAsync, deleteItemAsync } from "../utils/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrapAuth();
  }, []);

  const bootstrapAuth = async () => {
    try {
      const storedToken = await getItemAsync("auth_token");
      if (storedToken) {
        setToken(storedToken);
        const { data } = await getProfile();
        setUser(data.data);
      }
    } catch {
      try {
        await deleteItemAsync("auth_token");
      } catch {}
      try {
        await deleteItemAsync("user_data");
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const { data } = await login(email, password);
    const { token: authToken, user: userData } = data.data;
    await setItemAsync("auth_token", authToken);
    await setItemAsync("user_data", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  const signOut = async () => {
    try {
      await deleteItemAsync("auth_token");
    } catch {}
    try {
      await deleteItemAsync("user_data");
    } catch {}
    setToken(null);
    setUser(null);
  };

  const updateUser = async (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
    await setItemAsync("user_data", JSON.stringify({ ...user, ...newUserData }));
  };

  const isAuthenticated = !!token && !!user;

  const registerAgent = {
    verifyCode: async (code) => {
      return client.post("/api/auth/verify-agent-code", { code });
    },
    signup: async ({ email, password, name, phone, agentCode }) => {
      const { data } = await register({
        email,
        password,
        name,
        phone,
        agentCode,
      });
      const { token: authToken, user: userData } = data.data;
      await setItemAsync("auth_token", authToken);
      await setItemAsync("user_data", JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return userData;
    },
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signOut, updateUser, isAuthenticated, registerAgent }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
