import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

const Pressable = Animated.createAnimatedComponent(TouchableOpacity);

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
  fullWidth = false,
}) {
  const { colors, radii, shadows } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => { scale.value = withSpring(0.97, { damping: 15, stiffness: 400 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, minHeight: 36 },
    md: { paddingVertical: 12, paddingHorizontal: 20, minHeight: 48 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, minHeight: 54 },
  };

  const fontSizes = { sm: 13, md: 15, lg: 16 };

  const getBg = () => {
    if (variant === "outline" || variant === "ghost") return "transparent";
    return color || colors.primary;
  };

  const getBorder = () => {
    if (variant === "outline") return { borderWidth: 1.5, borderColor: colors.border };
    return {};
  };

  const getTextColor = () => {
    if (variant === "primary" || variant === "danger" || variant === "success") return "#FFFFFF";
    if (variant === "outline") return colors.text;
    return colors.primary;
  };

  const getShadow = () => {
    if (variant === "ghost") return {};
    if (variant === "outline") return {};
    return shadows.md();
  };

  return (
    <Animated.View style={[animatedStyle, fullWidth && { flex: 1 }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radii.lg,
            backgroundColor: getBg(),
            opacity: disabled ? 0.5 : 1,
          },
          sizeStyles[size],
          getBorder(),
          getShadow(),
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <>
            {Icon && (
              <Icon
                size={18}
                color={getTextColor()}
                style={{ marginRight: title ? 8 : 0 }}
                strokeWidth={2}
              />
            )}
            {title && (
              <Text
                style={{
                  color: getTextColor(),
                  fontSize: fontSizes[size],
                  fontWeight: "600",
                  letterSpacing: 0.2,
                }}
              >
                {title}
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
