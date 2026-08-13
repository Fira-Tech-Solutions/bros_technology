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
import { ArrowLeft, Mail, Send, CheckCircle } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { forgotPassword } from "../api/auth";

export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

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
      setSent(true);
    } catch (err) {
      Alert.alert("Error", "Failed to send reset link");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.successTint || colors.primaryTint,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}>
            <CheckCircle size={32} color={colors.primary} />
          </View>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: 12, textAlign: "center" }}>
            Check Your Email
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 32 }}>
            If an account exists with {email}, a password reset link has been sent. Open the link in your email to reset your password.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 14,
              height: 52,
              paddingHorizontal: 32,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.primaryText || "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
              Back to Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setSent(false); setEmail(""); }}
            style={{ marginTop: 16, padding: 8 }}
          >
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>
              Try another email
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
              Enter your email address and we'll send you a link to reset your password.
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
                <ActivityIndicator color={colors.primaryText || "#FFFFFF"} />
              ) : (
                <>
                  <Send size={18} color={colors.primaryText || "#FFFFFF"} />
                  <Text
                    style={{
                      color: colors.primaryText || "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "700",
                      marginLeft: 8,
                    }}
                  >
                    Send Reset Link
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
