import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail, Lock, User, Phone, Hash } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";
import DeviceIllustration from "../components/DeviceIllustration";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const STEPS = { CODE: 0, FORM: 1 };

export default function AgentSignupScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { registerAgent } = useAuth();

  const [step, setStep] = useState(STEPS.CODE);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const styles = useMemo(() => ({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    hero: {
      height: SCREEN_HEIGHT * 0.38,
      backgroundColor: "#1878B4",
      borderBottomLeftRadius: 36,
      borderBottomRightRadius: 36,
      overflow: "hidden",
    },
    heroContent: {
      flex: 1,
    },
    backButton: {
      position: "absolute",
      top: 8,
      left: 20,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    heroInner: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 10,
      paddingBottom: 20,
    },
    heroLogo: {
      width: 68,
      height: 68,
      borderRadius: 18,
    },
    heroWordmark: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 3,
      marginTop: 10,
    },
    heroPill: {
      marginTop: 6,
      backgroundColor: "rgba(255,255,255,0.16)",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    heroPillText: {
      color: "#FFFFFF",
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 2.5,
    },
    illustrationWrap: {
      marginTop: 12,
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
    },
    linkText: {
      color: colors.textMuted,
      fontSize: 14,
    },
  }), [colors]);

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a valid 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await registerAgent.verifyCode(code);
      const result = res.data?.data || res.data;
      if (result?.valid) {
        if (result.agentName) setName(result.agentName);
        if (result.agentPhone) setPhone(result.agentPhone);
        setStep(STEPS.FORM);
      } else {
        Alert.alert("Invalid Code", "Code verification failed");
      }
    } catch (err) {
      Alert.alert("Invalid Code", err.response?.data?.error || "Code verification failed");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = t("requiredField");
    if (!email.trim()) newErrors.email = t("requiredField");
    if (!phone.trim()) newErrors.phone = t("requiredField");
    if (!password || password.length < 8) newErrors.password = "Min 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerAgent.signup({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim(),
        agentCode: code.trim(),
      });
    } catch (err) {
      Alert.alert("Signup Failed", err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* ─── Hero ─── */}
      <View style={styles.hero}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View style={styles.heroContent}>
            <TouchableOpacity
              onPress={() => (step === STEPS.FORM ? setStep(STEPS.CODE) : navigation.goBack())}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.backButton}
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.2} />
            </TouchableOpacity>
            <View style={styles.heroInner}>
              <Image
                source={require("../../assets/bros_icon_concept4_monogram_clean.png")}
                style={styles.heroLogo}
                resizeMode="cover"
              />
              <Text style={styles.heroWordmark}>BROS TECHNOLOGY</Text>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>AGENT PORTAL</Text>
              </View>
              <View style={styles.illustrationWrap}>
                <DeviceIllustration width={180} height={130} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ─── Form Sheet ─── */}
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
            <View style={styles.grabber} />

            <Animated.View entering={FadeInUp.duration(250).springify()}>
              <Text style={styles.heading}>
                {step === STEPS.CODE ? "Agent Registration" : "Create Account"}
              </Text>
              <Text style={styles.subheading}>
                {step === STEPS.CODE
                  ? "Enter the 6-digit code shared by the admin"
                  : "Fill in your details to complete registration"}
              </Text>

              {step === STEPS.CODE ? (
                <>
                  <View style={{ marginTop: 20 }}>
                    <Input
                      value={code}
                      onChangeText={setCode}
                      placeholder="000000"
                      keyboardType="number-pad"
                      icon={Hash}
                      maxLength={6}
                      returnKeyType="done"
                      onSubmitEditing={handleVerifyCode}
                    />
                  </View>
                  <View style={{ marginTop: 8 }}>
                    <Button
                      title="Verify Code"
                      onPress={handleVerifyCode}
                      loading={loading}
                      size="lg"
                      color={colors.primary}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={{ marginTop: 20 }}>
                    <Input
                      value={name}
                      onChangeText={setName}
                      placeholder="Full Name"
                      icon={User}
                      error={errors.name}
                      returnKeyType="next"
                    />
                  </View>
                  <View>
                    <Input
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email"
                      keyboardType="email-address"
                      icon={Mail}
                      error={errors.email}
                      returnKeyType="next"
                    />
                  </View>
                  <View>
                    <Input
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Phone (+251...)"
                      keyboardType="phone-pad"
                      icon={Phone}
                      error={errors.phone}
                      returnKeyType="next"
                    />
                  </View>
                  <View>
                    <Input
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password (min 8 chars)"
                      secureTextEntry
                      icon={Lock}
                      error={errors.password}
                      returnKeyType="done"
                      onSubmitEditing={handleSignup}
                    />
                  </View>
                  <View style={{ marginTop: 8 }}>
                    <Button
                      title="Create Account"
                      onPress={handleSignup}
                      loading={loading}
                      size="lg"
                      color={colors.primary}
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={{ alignItems: "center", marginTop: 22 }}
              >
                <Text style={styles.linkText}>
                  Already have an account?{" "}
                  <Text style={{ color: colors.primary, fontWeight: "600" }}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
