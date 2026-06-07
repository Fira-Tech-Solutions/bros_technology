import React, { createContext, useState, useContext, useEffect } from "react";
import { getProfile, login } from "../api/auth";
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
      await deleteItemAsync("auth_token");
      await deleteItemAsync("user_data");
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
    await deleteItemAsync("auth_token");
    await deleteItemAsync("user_data");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signOut, isAuthenticated }}
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
