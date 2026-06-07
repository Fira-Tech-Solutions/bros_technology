import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";

const STATUS_CONFIG = {
  SUCCESS: {
    bgLight: "#dcfce7",
    bgDark: "#14532d",
    textLight: "#166534",
    textDark: "#86efac",
    label: "Success",
  },
  FAILED: {
    bgLight: "#fee2e2",
    bgDark: "#7f1d1d",
    textLight: "#991b1b",
    textDark: "#fca5a5",
    label: "Failed",
  },
  PENDING: {
    bgLight: "#fef3c7",
    bgDark: "#78350f",
    textLight: "#92400e",
    textDark: "#fcd34d",
    label: "Pending",
  },
};

export default function StatusBadge({ status, size = "md" }) {
  const { isDark } = useTheme();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const sizeClasses = {
    sm: "px-2 py-0.5",
    md: "px-3 py-1",
    lg: "px-4 py-1.5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <View
      className={`rounded-full self-start ${sizeClasses[size]}`}
      style={{
        backgroundColor: isDark ? config.bgDark : config.bgLight,
      }}
    >
      <Text
        style={{
          color: isDark ? config.textDark : config.textLight,
          fontSize: size === "sm" ? 11 : size === "lg" ? 15 : 13,
          fontWeight: "600",
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}
