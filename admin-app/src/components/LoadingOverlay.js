import React from "react";
import { View, ActivityIndicator, Text, Modal } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function LoadingOverlay({ visible, message = "Loading..." }) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <View
          className="rounded-2xl p-8 items-center"
          style={{ backgroundColor: colors.card }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{ color: colors.text }}
            className="mt-4 text-base font-medium"
          >
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
