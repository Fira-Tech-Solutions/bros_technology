import React, { createContext, useState, useContext, useMemo } from "react";
import { lightColors, darkColors, radii, spacing, typography, shadows } from "../config/theme";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const value = useMemo(() => {
    const colors = isDark ? darkColors : lightColors;
    return { isDark, toggleTheme, colors, radii, spacing, typography, shadows };
  }, [isDark]);

  return (
    <ThemeContext.Provider value={value}>
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
