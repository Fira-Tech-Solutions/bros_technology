import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
  error,
  icon: Icon,
  required = false,
  className = "",
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Animated.View
      entering={FadeIn.springify()}
      className={`mb-4 ${className}`}
    >
      {label && (
        <Text
          style={{ color: colors.textSecondary }}
          className="text-sm font-medium mb-2"
        >
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}
      <Animated.View
        entering={ZoomIn.springify()}
        className="flex-row items-center rounded-xl px-4"
        style={{
          backgroundColor: colors.input,
          borderWidth: 1.5,
          borderColor: error
            ? colors.danger
            : focused
              ? colors.primary
              : colors.inputBorder,
          minHeight: multiline ? 100 : 52,
          shadowColor: focused ? colors.primary : "transparent",
          shadowOffset: { width: 0, height: focused ? 4 : 0 },
          shadowOpacity: focused ? 0.2 : 0,
          shadowRadius: focused ? 8 : 0,
          elevation: focused ? 4 : 0,
        }}
      >
        {Icon && (
          <Icon
            size={20}
            color={focused ? colors.primary : colors.textMuted}
            style={{ marginRight: 12 }}
            strokeWidth={1.5}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 16,
            paddingVertical: multiline ? 12 : 0,
            textAlignVertical: multiline ? "top" : "center",
            fontWeight: "500",
          }}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textMuted} strokeWidth={1.5} />
            ) : (
              <Eye size={20} color={colors.textMuted} strokeWidth={1.5} />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <Animated.Text
          entering={FadeIn.springify()}
          style={{ color: colors.danger }}
          className="text-xs mt-1.5 font-medium"
        >
          {error}
        </Animated.Text>
      )}
    </Animated.View>
  );
}
