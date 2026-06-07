import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
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
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text
          style={{ color: colors.textSecondary }}
          className="text-sm font-medium mb-1.5"
        >
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}
      <View
        className="flex-row items-center rounded-xl px-4"
        style={{
          backgroundColor: colors.input,
          borderWidth: 1,
          borderColor: error
            ? colors.danger
            : focused
              ? colors.primary
              : colors.inputBorder,
          minHeight: multiline ? 100 : 48,
        }}
      >
        {Icon && (
          <Icon
            size={18}
            color={focused ? colors.primary : colors.textMuted}
            style={{ marginRight: 10 }}
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
          }}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={18} color={colors.textMuted} />
            ) : (
              <Eye size={18} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={{ color: colors.danger }} className="text-xs mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
