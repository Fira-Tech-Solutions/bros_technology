import React, { createContext, useState, useContext } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const colors = isDark
    ? {
        bg: "#1a1a1e",
        bgSecondary: "#222226",
        bgTertiary: "#2e2e33",
        card: "#222226",
        border: "#333338",
        text: "#f5f5f0",
        textSecondary: "#c0c0b8",
        textMuted: "#7a7a82",
        primary: "#d4a04a",
        primaryText: "#1a1a1e",
        danger: "#c83030",
        success: "#d4a04a",
        warning: "#eab308",
        input: "#222226",
        inputBorder: "#333338",
        tabBar: "#1a1a1e",
        tabBarInactive: "#7a7a82",
      }
    : {
        bg: "#f5f5f0",
        bgSecondary: "#ffffff",
        bgTertiary: "#ecece8",
        card: "#ffffff",
        border: "#d8d8d0",
        text: "#1a1a1e",
        textSecondary: "#333338",
        textMuted: "#555560",
        primary: "#c85a2a",
        primaryText: "#ffffff",
        danger: "#b82828",
        success: "#c85a2a",
        warning: "#d97706",
        input: "#ffffff",
        inputBorder: "#d8d8d0",
        tabBar: "#ffffff",
        tabBarInactive: "#7a7a82",
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
