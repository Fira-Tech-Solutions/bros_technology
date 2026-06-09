import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, ArrowLeft } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";

const { height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
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
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ImageBackground
        source={require("../../assets/login-2.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
        />

        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Logo + Back row */}
              <Animated.View
                entering={FadeInDown.delay(100).springify()}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingTop: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowLeft size={22} color="#ffffff" strokeWidth={2} />
                </TouchableOpacity>

                <View
                  style={{ flexDirection: "row", alignItems: "center", marginLeft: 16 }}
                >
                  <Image
                    source={require("../../assets/android-chrome-192x192.png")}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                    }}
                    resizeMode="cover"
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text
                      style={{
                        fontFamily: "serif",
                        fontStyle: "italic",
                        color: "#ef4444",
                        fontSize: 18,
                        fontWeight: "700",
                        letterSpacing: 0.5,
                      }}
                      numberOfLines={1}
                    >
                      Retailment
                    </Text>
                    <Text
                      style={{
                        fontFamily: "serif",
                        fontStyle: "italic",
                        color: "rgba(239, 68, 68, 0.6)",
                        fontSize: 9,
                        letterSpacing: 2,
                        fontWeight: "500",
                        marginTop: 1,
                      }}
                      numberOfLines={1}
                    >
                      SECURE ACCESS
                    </Text>
                  </View>
                </View>
              </Animated.View>

              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  paddingHorizontal: 24,
                  paddingBottom: 40,
                }}
              >
                {/* Spacer */}

                {/* Form Card */}
                <Animated.View
                  entering={FadeInUp.delay(300).springify().damping(15)}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: 28,
                    padding: 28,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.15,
                    shadowRadius: 30,
                    elevation: 12,
                  }}
                >
                  <Animated.View entering={FadeInUp.delay(350).springify()}>
                    <Input
                      label={t("email")}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="admin@example.com"
                      keyboardType="email-address"
                      icon={Mail}
                      error={errors.email}
                      required
                      className="mb-4"
                    />
                  </Animated.View>

                  <Animated.View entering={FadeInUp.delay(420).springify()}>
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

                  <Animated.View entering={FadeInUp.delay(500).springify()}>
                    <Button
                      title={t("loginButton")}
                      onPress={handleLogin}
                      loading={loading}
                      size="lg"
                      className="mt-2"
                    />
                  </Animated.View>

                  <Animated.View
                    entering={FadeInUp.delay(580).springify()}
                    style={{ alignItems: "center", marginTop: 20 }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          "Forgot Password",
                          "Password reset functionality coming soon."
                        )
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text
                        style={{
                          color: colors.primary,
                          fontSize: 14,
                          fontWeight: "600",
                          letterSpacing: 0.3,
                        }}
                      >
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
