import React, { memo } from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";

const StatCard = memo(function StatCard({ icon: Icon, label, value, color, index = 0 }) {
  const { colors, radii, shadows } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(250)}
      style={{
        width: "48%",
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        ...shadows.sm(),
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: radii.sm,
          backgroundColor: (color || colors.primary) + "14",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <Icon size={18} color={color || colors.primary} strokeWidth={1.75} />
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "500", letterSpacing: 0.3 }}>
        {label}
      </Text>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", marginTop: 4, letterSpacing: -0.3 }}>
        {value}
      </Text>
    </Animated.View>
  );
});

export default memo(StatCard);
