import React, { useState, useMemo, forwardRef } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

const Input = forwardRef(function Input(
  {
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
    small = false,
    returnKeyType,
    onSubmitEditing,
    blurOnSubmit,
    autoCapitalize,
  },
  ref
) {
  const { colors, radii } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const containerStyle = useMemo(
    () => ({
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F7F9FB",
      borderRadius: radii.md,
      borderWidth: 1.5,
      borderColor: error
        ? colors.danger
        : focused
          ? colors.primary
          : "transparent",
      paddingHorizontal: 14,
      minHeight: multiline ? 100 : 48,
    }),
    [colors, radii, error, focused, multiline]
  );

  const inputStyle = useMemo(
    () => ({
      flex: 1,
      color: colors.text,
      fontSize: small ? 14 : 15,
      paddingVertical: multiline ? 12 : 0,
      textAlignVertical: multiline ? "top" : "center",
      fontWeight: "400",
    }),
    [colors, small, multiline]
  );

  return (
    <View style={{ marginBottom: 14 }}>
      {label && (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: "500",
            marginBottom: 6,
            marginLeft: 2,
          }}
        >
          {label}
          {required && <Text style={{ color: colors.danger }}> *</Text>}
        </Text>
      )}
      <View style={containerStyle}>
        {Icon && (
          <Icon
            size={18}
            color={focused ? colors.primary : colors.textMuted}
            style={{ marginRight: 10 }}
            strokeWidth={1.75}
          />
        )}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted + "80"}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={inputStyle}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={18} color={colors.textMuted} strokeWidth={1.75} />
            ) : (
              <Eye size={18} color={colors.textMuted} strokeWidth={1.75} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={{
            color: colors.danger,
            fontSize: 12,
            marginTop: 4,
            marginLeft: 2,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
});

export default Input;
