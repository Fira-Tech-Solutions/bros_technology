import React, { createContext, useState, useContext } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const colors = isDark
    ? {
        bg: "#0f172a",
        bgSecondary: "#1e293b",
        bgTertiary: "#334155",
        card: "#1e293b",
        border: "#334155",
        text: "#f1f5f9",
        textSecondary: "#94a3b8",
        textMuted: "#64748b",
        primary: "#3b82f6",
        primaryText: "#ffffff",
        danger: "#ef4444",
        success: "#22c55e",
        warning: "#f59e0b",
        input: "#1e293b",
        inputBorder: "#475569",
        tabBar: "#1e293b",
        tabBarInactive: "#64748b",
      }
    : {
        bg: "#f8fafc",
        bgSecondary: "#ffffff",
        bgTertiary: "#f1f5f9",
        card: "#ffffff",
        border: "#e2e8f0",
        text: "#0f172a",
        textSecondary: "#475569",
        textMuted: "#94a3b8",
        primary: "#2563eb",
        primaryText: "#ffffff",
        danger: "#dc2626",
        success: "#16a34a",
        warning: "#d97706",
        input: "#ffffff",
        inputBorder: "#cbd5e1",
        tabBar: "#ffffff",
        tabBarInactive: "#94a3b8",
      };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
