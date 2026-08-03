import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";

const STATUS_CONFIG = {
  AVAILABLE: { color: "#22C55E", bg: "#DCFCE7", darkBg: "#0D2E1A", label: "Available" },
  PENDING: { color: "#F59E0B", bg: "#FEF3C7", darkBg: "#2D2006", label: "Pending" },
  SOLD: { color: "#EF4444", bg: "#FEE2E2", darkBg: "#2D1215", label: "Sold" },
  ARCHIVED: { color: "#6B7280", bg: "#F3F4F6", darkBg: "#1F2429", label: "Archived" },
  SUCCESS: { color: "#22C55E", bg: "#DCFCE7", darkBg: "#0D2E1A", label: "Success" },
  FAILED: { color: "#EF4444", bg: "#FEE2E2", darkBg: "#2D1215", label: "Failed" },
  ACTIVE: { color: "#1878B4", bg: "#EAF4FB", darkBg: "#0D2A3D", label: "Active" },
  INACTIVE: { color: "#6B7280", bg: "#F3F4F6", darkBg: "#1F2429", label: "Inactive" },
};

export default function StatusBadge({ status, size = "md", label: customLabel }) {
  const { isDark } = useTheme();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const sizeStyles = {
    sm: { paddingHorizontal: 8, paddingVertical: 3 },
    md: { paddingHorizontal: 10, paddingVertical: 4 },
    lg: { paddingHorizontal: 14, paddingVertical: 6 },
  };

  const fontSizes = { sm: 11, md: 12, lg: 14 };

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: 9999,
        backgroundColor: isDark ? config.darkBg : config.bg,
        ...sizeStyles[size],
      }}
    >
      <Text
        style={{
          color: config.color,
          fontSize: fontSizes[size],
          fontWeight: "600",
          letterSpacing: 0.2,
        }}
      >
        {customLabel || config.label}
      </Text>
    </View>
  );
}
