import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";
import { useTheme } from "../context/ThemeContext";

const SHIMMER_WIDTH = Dimensions.get("window").width;

export default function ShimmerLoader({ width, height = 20, className = "" }) {
  const { colors, isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SHIMMER_WIDTH, SHIMMER_WIDTH],
  });

  return (
    <View
      style={{
        width: width || "100%",
        height,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: colors.bgTertiary,
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX }],
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        }}
      />
    </View>
  );
}

export function ListingCardSkeleton() {
  const { colors, radii, shadows } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.sm(),
      }}
    >
      <ShimmerLoader height={160} className="mb-3" style={{ borderRadius: 12 }} />
      <ShimmerLoader height={16} width="70%" style={{ marginBottom: 8 }} />
      <ShimmerLoader height={12} width="50%" style={{ marginBottom: 12 }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <ShimmerLoader height={12} width="30%" />
        <ShimmerLoader height={12} width="20%" />
      </View>
    </View>
  );
}

export function DashboardCardSkeleton() {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={{ width: "48%", marginBottom: 10 }}>
          <ShimmerLoader height={90} style={{ borderRadius: 16 }} />
        </View>
      ))}
    </View>
  );
}
