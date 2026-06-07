import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function Card({
  children,
  onPress,
  className = "",
  padding = true,
}) {
  const { colors } = useTheme();

  const content = (
    <View
      className={`rounded-2xl ${padding ? "p-4" : ""} ${className}`}
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
