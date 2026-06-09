import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

const variants = {
  primary: "bg-blue-600 active:bg-blue-700",
  secondary: "bg-gray-200 active:bg-gray-300",
  danger: "bg-red-600 active:bg-red-700",
  success: "bg-green-600 active:bg-green-700",
  outline: "bg-transparent border border-gray-300",
  ghost: "bg-transparent",
};

const textVariants = {
  primary: "text-white font-semibold",
  secondary: "text-gray-800 font-semibold",
  danger: "text-white font-semibold",
  success: "text-white font-semibold",
  outline: "text-gray-700 font-semibold",
  ghost: "text-blue-600 font-semibold",
};

const sizes = {
  sm: "py-2 px-3 rounded-lg",
  md: "py-3 px-5 rounded-xl",
  lg: "py-4 px-6 rounded-xl",
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  color,
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgColor =
    variant === "outline"
      ? "transparent"
      : variant === "ghost"
        ? "transparent"
        : color || colors.primary;

  const borderColor =
    variant === "outline" ? colors.border : "transparent";

  return (
    <Animated.View
      entering={FadeIn.springify()}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        className={`flex-row items-center justify-center ${sizes[size]} ${
          disabled ? "opacity-50" : ""
        } ${className}`}
        style={{
          backgroundColor:
            variant === "primary" || variant === "danger" || variant === "success"
              ? bgColor
              : variant === "outline"
                ? "transparent"
                : colors.bgSecondary,
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {loading ? (
          <ActivityIndicator
            color={
              variant === "primary" || variant === "danger" || variant === "success"
                ? "#ffffff"
                : colors.primary
            }
            size="small"
          />
        ) : (
          <>
            {Icon && (
              <Icon
                size={20}
                color={
                  variant === "primary" || variant === "danger" || variant === "success"
                    ? "#ffffff"
                    : colors.primary
                }
                style={{ marginRight: 10 }}
                strokeWidth={1.5}
              />
            )}
            <Text
              style={{
                color:
                  variant === "primary" || variant === "danger" || variant === "success"
                    ? "#ffffff"
                    : variant === "outline"
                      ? colors.text
                      : colors.primary,
                fontSize: size === "sm" ? 14 : 16,
                fontWeight: "700",
                letterSpacing: 0.3,
              }}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
