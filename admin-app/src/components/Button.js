import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
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
}) {
  const { colors } = useTheme();

  const bgColor =
    variant === "outline"
      ? "transparent"
      : variant === "ghost"
        ? "transparent"
        : colors.primary;

  const borderColor =
    variant === "outline" ? colors.border : "transparent";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
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
        borderWidth: variant === "outline" ? 1 : 0,
        borderColor,
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" || variant === "success" ? "#ffffff" : colors.primary}
          size="small"
        />
      ) : (
        <>
          {Icon && (
            <Icon
              size={18}
              color={
                variant === "primary" || variant === "danger" || variant === "success"
                  ? "#ffffff"
                  : colors.primary
              }
              style={{ marginRight: 8 }}
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
              fontWeight: "600",
            }}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
