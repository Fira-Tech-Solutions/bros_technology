import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  Sun,
  Moon,
  Globe,
  LogOut,
  ChevronRight,
  Info,
  ChevronDown,
  Phone,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function SettingsScreen({ navigation }) {
  const { isDark, toggleTheme, colors, radii } = useTheme();
  const { language, setLanguage, t, languages } = useLanguage();
  const { user, signOut } = useAuth();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const currentLanguage = languages.find((l) => l.code === language);

  const handleLanguageChange = (code) => {
    setLanguage(code);
    setShowLanguageDropdown(false);
  };

  const handleLogout = () => {
    Alert.alert(t("logout"), "Are you sure you want to logout?", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: async () => {
          try { await signOut(); } catch {}
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View entering={FadeInDown.duration(300)} style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700", letterSpacing: -0.5 }}>
            {t("settingsTitle")}
          </Text>
        </Animated.View>

        {/* Profile Card */}
        {user && (
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={{ paddingHorizontal: 20, marginBottom: 28 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.card,
                borderRadius: radii.lg,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>
                  {user.name}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
                  {user.email}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.75} />
            </View>
          </TouchableOpacity>
        )}

        {/* Appearance */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
            {t("appearance")}
          </Text>
          <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {isDark ? <Moon size={19} color={colors.primary} strokeWidth={1.75} /> : <Sun size={19} color={colors.primary} strokeWidth={1.75} />}
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: "500", marginLeft: 14 }}>
                  {isDark ? t("darkMode") : t("lightMode")}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
            {t("language")}
          </Text>
          <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
            <TouchableOpacity
              onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Globe size={19} color={colors.primary} strokeWidth={1.75} />
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: "500", marginLeft: 14 }}>
                  {currentLanguage?.label || "English"}
                </Text>
              </View>
              <ChevronDown size={18} color={colors.textMuted} strokeWidth={1.75} style={{ transform: [{ rotate: showLanguageDropdown ? "180deg" : "0deg" }] }} />
            </TouchableOpacity>
            {showLanguageDropdown && (
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => handleLanguageChange(lang.code)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: language === lang.code ? colors.primaryTint : "transparent",
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{ color: language === lang.code ? colors.primary : colors.text, fontSize: 15, fontWeight: language === lang.code ? "600" : "400" }}>
                      {lang.label}
                    </Text>
                    {language === lang.code && (
                      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.white }} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Store */}
        {user?.role === "SUPER_ADMIN" && (
          <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
              Store
            </Text>
            <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("ContactSettings")}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Phone size={19} color={colors.primary} strokeWidth={1.75} />
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: "500", marginLeft: 14 }}>
                    Contact & Social Media
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.75} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* About */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
            {t("about")}
          </Text>
          <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 }}>
              <Info size={19} color={colors.primary} strokeWidth={1.75} />
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "500", marginLeft: 14 }}>
                {t("version")} 1.0.0
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              borderRadius: radii.lg,
              backgroundColor: `${colors.danger}10`,
              borderWidth: 1,
              borderColor: `${colors.danger}25`,
            }}
          >
            <LogOut size={18} color={colors.danger} strokeWidth={1.75} />
            <Text style={{ color: colors.danger, fontSize: 15, fontWeight: "600", marginLeft: 8 }}>
              {t("logout")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
