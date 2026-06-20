import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, ArrowLeft } from "lucide-react-native";

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
      if (err.code === "ECONNABORTED") {
        Alert.alert("Connection Error", "Request timed out. Check your network.");
      } else if (!err.response) {
        Alert.alert(
          "Connection Error",
          "Unable to reach the server. Make sure the backend is running and EXPO_PUBLIC_API_URL is set correctly."
        );
      } else {
        Alert.alert(
          t("error"),
          err.response?.data?.error || t("invalidCredentials")
        );
      }
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
              {/* Logo + Back row */}
              <View
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
                        color: colors.primary,
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
                        color: `${colors.primary}99`,
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
              </View>

              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  paddingHorizontal: 24,
                  paddingBottom: 250,
                }}
              >
                {/* Spacer */}

                {/* Form Card */}
                <View
                  style={{
                    backgroundColor: "transparent",
                    borderRadius: 0,
                    padding: 0,
                    shadowColor: "transparent",
                    shadowOpacity: 0,
                    elevation: 0,
                  }}
                >
                  <View>
                    <Input
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email"
                      keyboardType="email-address"
                      icon={Mail}
                      error={errors.email}
                      rounded="full"
                      small
                      className="mb-4"
                    />
                  </View>

                  <View>
                    <Input
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      secureTextEntry
                      icon={Lock}
                      error={errors.password}
                      rounded="full"
                      small
                      className="mb-4"
                    />
                  </View>

                  <View>
                    <Button
                      title={t("loginButton")}
                      onPress={handleLogin}
                      loading={loading}
                      size="lg"
                      color={colors.primary}
                      className="mt-2 rounded-[100px]"
                    />
                  </View>

                  <View
                    style={{ alignItems: "center", marginTop: 20 }}
                  >
                    <TouchableOpacity
                      onPress={() => navigation.navigate("ForgotPassword")}
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
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => Linking.openURL("https://firatech.systems")}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "rgba(255,255,255,0.35)",
                      fontSize: 11,
                      letterSpacing: 0.5,
                      marginTop: 16,
                    }}
                  >
                    fira tech solutions
                  </Text>
                </TouchableOpacity>
              </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
