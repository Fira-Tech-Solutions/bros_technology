import React from "react";
import { View, TouchableOpacity } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

export default function Card({
  children,
  onPress,
  className = "",
  padding = true,
  variant = "default",
  style = {},
}) {
  const { colors, radii, shadows } = useTheme();

  const bg = variant === "highlight" ? colors.primaryTint : colors.card;
  const border = variant === "highlight" ? `${colors.primary}20` : colors.border;

  const content = (
    <Animated.View
      entering={FadeIn.duration(250)}
      className={`${padding ? "" : ""} ${className}`}
      style={[
        {
          backgroundColor: bg,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: border,
          padding: padding ? 18 : 0,
          overflow: "hidden",
        },
        shadows.sm(),
        style,
      ]}
    >
      {children}
    </Animated.View>
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
