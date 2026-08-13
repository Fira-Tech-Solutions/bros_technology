import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Lock, Eye, EyeOff, Check, Mail, Link } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { resetPassword } from "../api/auth";

export default function ResetPasswordScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { email: defaultEmail } = route.params || {};

  const [email, setEmail] = useState(defaultEmail || "");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }

    if (!token.trim()) {
      Alert.alert("Error", "Reset token is required");
      return;
    }

    if (!password) {
      Alert.alert("Error", "New password is required");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setResetting(true);
    try {
      await resetPassword(email.trim(), token.trim(), password);
      Alert.alert(
        "Password Reset",
        "Your password has been reset successfully. You can now login with your new password.",
        [
          { text: "Login", onPress: () => navigation.navigate("Login") },
        ]
      );
    } catch (err) {
      const message = err.response?.data?.error || "Failed to reset password. The link may have expired.";
      Alert.alert("Error", message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.bgTertiary,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text
              style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}
            >
              Reset Password
            </Text>
          </View>

          {/* Description */}
          <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 16,
                lineHeight: 24,
              }}
            >
              Open the reset link from your email, then copy the token from the link URL and paste it below.
            </Text>
          </View>

          {/* Email Input */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Email Address
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.input,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.inputBorder,
                paddingHorizontal: 14,
                height: 52,
              }}
            >
              <Mail size={18} color={colors.textMuted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color: colors.text,
                  fontSize: 15,
                }}
              />
            </View>
          </View>

          {/* Token Input */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Reset Token
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.input,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.inputBorder,
                paddingHorizontal: 14,
                height: 52,
              }}
            >
              <Link size={18} color={colors.textMuted} />
              <TextInput
                value={token}
                onChangeText={setToken}
                placeholder="Paste token from email link"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color: colors.text,
                  fontSize: 13,
                }}
              />
            </View>
          </View>

          {/* New Password Input */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              New Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.input,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.inputBorder,
                paddingHorizontal: 14,
                height: 52,
              }}
            >
              <Lock size={18} color={colors.textMuted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password (min 8 chars)"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color: colors.text,
                  fontSize: 15,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 8 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color={colors.textMuted} />
                ) : (
                  <Eye size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Confirm Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.input,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.inputBorder,
                paddingHorizontal: 14,
                height: 52,
              }}
            >
              <Lock size={18} color={colors.textMuted} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color: colors.text,
                  fontSize: 15,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ padding: 8 }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} color={colors.textMuted} />
                ) : (
                  <Eye size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
            {password && confirmPassword && password !== confirmPassword && (
              <Text style={{ color: colors.danger, fontSize: 11, marginTop: 4 }}>
                Passwords do not match
              </Text>
            )}
          </View>

          {/* Reset Button */}
          <View style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity
              onPress={handleReset}
              disabled={resetting}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 14,
                height: 52,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: resetting ? 0.6 : 1,
              }}
            >
              {resetting ? (
                <ActivityIndicator color={colors.primaryText || "#FFFFFF"} />
              ) : (
                <>
                  <Check size={18} color={colors.primaryText || "#FFFFFF"} />
                  <Text
                    style={{
                      color: colors.primaryText || "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "700",
                      marginLeft: 8,
                    }}
                  >
                    Reset Password
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
