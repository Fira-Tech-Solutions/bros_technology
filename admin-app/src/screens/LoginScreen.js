import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Linking,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";
import DeviceIllustration from "../components/DeviceIllustration";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_HEIGHT * 0.43;

export default function LoginScreen({ navigation }) {
  const { colors, radii } = useTheme();
  const { t } = useLanguage();
  const { signIn } = useAuth();

  const passwordRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  const styles = useMemo(() => ({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    hero: {
      height: HERO_HEIGHT,
      backgroundColor: "#1878B4",
      borderBottomLeftRadius: 36,
      borderBottomRightRadius: 36,
      overflow: "hidden",
    },
    heroContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 10,
      paddingBottom: 20,
    },
    heroWordmark: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: 3,
      marginTop: 14,
    },
    heroPill: {
      marginTop: 8,
      backgroundColor: "rgba(255,255,255,0.16)",
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 20,
    },
    heroPillText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2.5,
    },
    illustrationWrap: {
      marginTop: 16,
      alignItems: "center",
    },
    sheet: {
      flex: 1,
      backgroundColor: colors.bg,
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      marginTop: -36,
    },
    sheetContent: {
      padding: 24,
      paddingTop: 16,
      paddingBottom: 40,
    },
    grabber: {
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 20,
    },
    heading: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.5,
    },
    subheading: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 6,
      marginBottom: 4,
    },
    forgotText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    agentText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    footer: {
      textAlign: "center",
      color: colors.textMuted,
      fontSize: 11,
      letterSpacing: 0.5,
      marginTop: 40,
    },
    errorBox: {
      backgroundColor: colors.dangerTint,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginTop: 14,
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: "500",
      textAlign: "center",
    },
  }), [colors]);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = t("requiredField");
    if (!password) newErrors.password = t("requiredField");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    setLoginError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        setLoginError("Request timed out. Check your network.");
      } else if (!err.response) {
        setLoginError("Unable to reach the server. Check your connection.");
      } else {
        const errData = err.response?.data?.error;
        setLoginError(typeof errData === 'string' ? errData : errData?.message || t("invalidCredentials"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* ══════════ STATIC HERO ══════════ */}
      <View style={styles.hero}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View style={styles.heroContent}>
            {/* Wordmark */}
            <Text style={styles.heroWordmark}>BROS TECHNOLOGY</Text>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>ADMIN PANEL</Text>
            </View>

            {/* Device illustration */}
            <View style={styles.illustrationWrap}>
              <DeviceIllustration width={200} height={145} />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ══════════ FORM SHEET ══════════ */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={{ flex: 1 }}
      >
        <View style={styles.sheet}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Grabber */}
            <View style={styles.grabber} />

            {/* Heading */}
            <Animated.View entering={FadeInUp.duration(250).springify()}>
              <Text style={styles.heading}>Welcome back</Text>
              <Text style={styles.subheading}>Sign in to manage your store</Text>

              {/* Error */}
              {loginError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{loginError}</Text>
                </View>
              ) : null}

              {/* Inputs */}
              <View style={{ marginTop: 20 }}>
                <Input
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setLoginError("");
                  }}
                  placeholder="Email address"
                  keyboardType="email-address"
                  icon={Mail}
                  error={errors.email}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              <View>
                <Input
                  ref={passwordRef}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setLoginError("");
                  }}
                  placeholder="Password"
                  secureTextEntry
                  icon={Lock}
                  error={errors.password}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>

              {/* Forgot password */}
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={{ alignSelf: "flex-end", marginBottom: 16, marginTop: 2 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Button */}
              <Button
                title={t("loginButton")}
                onPress={handleLogin}
                loading={loading}
                disabled={!email || !password}
                size="lg"
                color={colors.primary}
              />

              {/* Agent signup */}
              <TouchableOpacity
                onPress={() => navigation.navigate("AgentSignup")}
                style={{ alignItems: "center", marginTop: 22 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.agentText}>
                  Register as Agent
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer */}
            <TouchableOpacity onPress={() => Linking.openURL("https://firatech.systems")}>
              <Text style={styles.footer}>
                © fira tech solutions
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
