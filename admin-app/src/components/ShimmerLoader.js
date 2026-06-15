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
      className={`overflow-hidden rounded-lg ${className}`}
      style={{
        width: width || "100%",
        height,
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
          backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
        }}
      />
    </View>
  );
}

export function ListingCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View
      className="rounded-2xl p-4 mb-3"
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <ShimmerLoader height={180} className="mb-3 rounded-xl" />
      <ShimmerLoader height={18} width="70%" className="mb-2" />
      <ShimmerLoader height={14} width="50%" className="mb-3" />
      <View className="flex-row justify-between">
        <ShimmerLoader height={14} width="30%" />
        <ShimmerLoader height={14} width="20%" />
      </View>
    </View>
  );
}

export function DashboardCardSkeleton() {
  return (
    <View className="flex-row flex-wrap justify-between">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="w-[48%] mb-3">
          <ShimmerLoader height={90} className="rounded-2xl" />
        </View>
      ))}
    </View>
  );
}
