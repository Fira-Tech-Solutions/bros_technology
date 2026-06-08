import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, Building2, ArrowRight } from "lucide-react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";

const { width, height } = Dimensions.get("window");

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
          scrollEnabled={height > 800}
        >
          <ImageBackground
            source={require("../../assets/login-bg.jpg")}
            style={{ flex: 1, width, minHeight: height }}
            resizeMode="cover"
          >
            {/* Dark Overlay for better contrast */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.45)",
              }}
            />

            {/* Content Container */}
            <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}>
              {/* Logo Container with Animation */}
              <Animated.View
                entering={ZoomIn.springify()}
                style={{ alignItems: "center", marginBottom: 40 }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 24,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 24,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 10,
                  }}
                >
                  <Building2 size={40} color="#ffffff" strokeWidth={1.5} />
                </View>
              </Animated.View>

              {/* Header Text */}
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={{ alignItems: "center", marginBottom: 36 }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 32,
                    fontWeight: "800",
                    marginBottom: 12,
                    textShadowColor: "rgba(0, 0, 0, 0.2)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}
                >
                  {t("loginTitle")}
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 16,
                    fontWeight: "500",
                    textShadowColor: "rgba(0, 0, 0, 0.1)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  {t("loginSubtitle")}
                </Text>
              </Animated.View>

              {/* Premium Card Container */}
              <Animated.View
                entering={FadeInUp.delay(400).springify()}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderRadius: 28,
                  padding: 28,
                  backdropFilter: "blur(10px)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 20 },
                  shadowOpacity: 0.25,
                  shadowRadius: 30,
                  elevation: 15,
                }}
              >
                {/* Input Fields */}
                <Animated.View
                  entering={FadeInUp.delay(500).springify()}
                  style={{ marginBottom: 8 }}
                >
                  <Input
                    label={t("email")}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="admin@example.com"
                    keyboardType="email-address"
                    icon={Mail}
                    error={errors.email}
                    required
                    className="mb-6"
                  />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(600).springify()}>
                  <Input
                    label={t("password")}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    icon={Lock}
                    error={errors.password}
                    required
                    className="mb-2"
                  />
                </Animated.View>

                {/* Login Button */}
                <Animated.View
                  entering={FadeInUp.delay(700).springify()}
                  style={{ marginTop: 28 }}
                >
                  <Button
                    title={t("loginButton")}
                    onPress={handleLogin}
                    loading={loading}
                    size="lg"
                    icon={!loading ? ArrowRight : null}
                  />
                </Animated.View>
              </Animated.View>

              {/* Footer Text */}
              <Animated.View
                entering={FadeInUp.delay(800).springify()}
                style={{ alignItems: "center", marginTop: 32 }}
              >
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: 13,
                    fontWeight: "500",
                    textShadowColor: "rgba(0, 0, 0, 0.1)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Secure Login • Premium Experience
                </Text>
              </Animated.View>
            </View>
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
