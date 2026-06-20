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
import { ArrowLeft, Mail, Lock, Send } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { forgotPassword, resetPassword } from "../api/auth";

export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setSending(true);
    try {
      await forgotPassword(email.trim());
      Alert.alert(
        "Reset Code Sent",
        "If the email exists, a 6-digit reset code has been sent. Check your inbox.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("ResetPassword", { email: email.trim() }),
          },
        ]
      );
    } catch (err) {
      Alert.alert("Error", "Failed to send reset code");
    } finally {
      setSending(false);
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
              Forgot Password
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
              Enter your email address and we'll send you a 6-digit code to reset your password.
            </Text>
          </View>

          {/* Email Input */}
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
                placeholder="Enter your email"
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

          {/* Send Button */}
          <View style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity
              onPress={handleSendReset}
              disabled={sending}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 14,
                height: 52,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? (
                <ActivityIndicator color={colors.primaryText} />
              ) : (
                <>
                  <Send size={18} color={colors.primaryText} />
                  <Text
                    style={{
                      color: colors.primaryText,
                      fontSize: 16,
                      fontWeight: "700",
                      marginLeft: 8,
                    }}
                  >
                    Send Reset Code
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