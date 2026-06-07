import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, Building2 } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = t("requiredField");
    if (!password) newErrors.password = t("requiredField");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      Alert.alert(
        t("error"),
        err.response?.data?.error || t("invalidCredentials")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6">
            <View className="items-center mb-10">
              <View
                className="w-20 h-20 rounded-2xl items-center justify-center mb-6"
                style={{ backgroundColor: colors.primary }}
              >
                <Building2 size={36} color="#ffffff" />
              </View>
              <Text
                style={{ color: colors.text }}
                className="text-3xl font-bold mb-2"
              >
                {t("loginTitle")}
              </Text>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-base"
              >
                {t("loginSubtitle")}
              </Text>
            </View>

            <View>
              <Input
                label={t("email")}
                value={email}
                onChangeText={setEmail}
                placeholder="admin@example.com"
                keyboardType="email-address"
                icon={Mail}
                error={errors.email}
                required
              />
              <Input
                label={t("password")}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                icon={Lock}
                error={errors.password}
                required
              />
              <View className="mt-4">
                <Button
                  title={t("loginButton")}
                  onPress={handleLogin}
                  loading={loading}
                  size="lg"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
