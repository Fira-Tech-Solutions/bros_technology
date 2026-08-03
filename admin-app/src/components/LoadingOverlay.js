import React from "react";
import { View, ActivityIndicator, Text, Modal } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function LoadingOverlay({ visible, message = "Loading..." }) {
  const { colors, radii, shadows } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: radii.lg,
            padding: 28,
            alignItems: "center",
            minWidth: 140,
            ...shadows.lg(),
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: "500",
              marginTop: 14,
            }}
          >
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
