import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";

export default function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
}) {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
        paddingHorizontal: 32,
      }}
    >
      {Icon && (
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.primaryTint,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Icon size={28} color={colors.primary} strokeWidth={1.5} />
        </View>
      )}
      <Text
        style={{
          color: colors.text,
          fontSize: 17,
          fontWeight: "600",
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      {message && (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 13,
            textAlign: "center",
            lineHeight: 18,
            marginBottom: actionLabel ? 20 : 0,
          }}
        >
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} size="sm" />
      )}
    </Animated.View>
  );
}
