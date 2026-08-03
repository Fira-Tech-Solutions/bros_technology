import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

export default function SectionHeader({
  title,
  actionLabel,
  onAction,
  marginBottom = 12,
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom,
      }}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {title}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 12,
              fontWeight: "600",
              marginRight: 2,
            }}
          >
            {actionLabel}
          </Text>
          <ChevronRight size={14} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}
