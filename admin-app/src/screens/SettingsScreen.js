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
  const { isDark, toggleTheme, colors } = useTheme();
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
          try {
            await signOut();
          } catch {
            // signOut clears local state even if storage fails
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-5 pt-4 pb-6">
          <Text
            style={{ color: colors.text }}
            className="text-2xl font-bold mb-1"
          >
            {t("settingsTitle")}
          </Text>
        </View>

        {user && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            className="px-5 mb-6"
          >
            <View
              className="flex-row items-center p-4 rounded-2xl"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary }}
              >
                <Text
                  style={{ color: colors.primaryText }}
                  className="text-lg font-bold"
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  style={{ color: colors.text }}
                  className="text-base font-semibold"
                >
                  {user.name}
                </Text>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-sm"
                >
                  {user.email}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        )}

        <View className="px-5 mb-6">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-sm font-semibold uppercase tracking-wide mb-3"
          >
            {t("appearance")}
          </Text>
          <View
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                {isDark ? (
                  <Moon size={20} color={colors.primary} />
                ) : (
                  <Sun size={20} color={colors.primary} />
                )}
                <Text
                  style={{ color: colors.text }}
                  className="ml-3 text-base font-medium"
                >
                  {isDark ? t("darkMode") : t("lightMode")}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.primaryText}
              />
            </View>
          </View>
        </View>

        <View className="px-5 mb-6">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-sm font-semibold uppercase tracking-wide mb-3"
          >
            {t("language")}
          </Text>
          <View
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <Globe size={20} color={colors.primary} />
                <Text
                  style={{ color: colors.text }}
                  className="ml-3 text-base font-medium"
                >
                  {currentLanguage?.label || "English"}
                </Text>
              </View>
              <ChevronDown
                size={18}
                color={colors.textMuted}
                style={{
                  transform: [{ rotate: showLanguageDropdown ? "180deg" : "0deg" }],
                }}
              />
            </TouchableOpacity>
            {showLanguageDropdown && (
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => handleLanguageChange(lang.code)}
                    className="flex-row items-center justify-between px-4 py-3"
                    style={{
                      backgroundColor:
                        language === lang.code ? `${colors.primary}10` : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: language === lang.code ? colors.primary : colors.text,
                        fontSize: 15,
                        fontWeight: language === lang.code ? "600" : "400",
                      }}
                    >
                      {lang.label}
                    </Text>
                    {language === lang.code && (
                      <View
                        className="w-5 h-5 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <View className="w-2 h-2 rounded-full bg-white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {user?.role === "SUPER_ADMIN" && (
          <View className="px-5 mb-6">
            <Text
              style={{ color: colors.textSecondary }}
              className="text-sm font-semibold uppercase tracking-wide mb-3"
            >
              Store
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("ContactSettings")}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center">
                  <Phone size={20} color={colors.primary} />
                  <Text
                    style={{ color: colors.text }}
                    className="ml-3 text-base font-medium"
                  >
                    Contact & Social Media
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="px-5 mb-6">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-sm font-semibold uppercase tracking-wide mb-3"
          >
            {t("about")}
          </Text>
          <View
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center p-4">
              <Info size={20} color={colors.primary} />
              <Text
                style={{ color: colors.text }}
                className="ml-3 text-base font-medium"
              >
                {t("version")} 1.0.0
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center p-4 rounded-2xl"
            style={{
              backgroundColor: `${colors.danger}12`,
              borderWidth: 1,
              borderColor: `${colors.danger}30`,
            }}
          >
            <LogOut size={20} color={colors.danger} />
            <Text
              style={{ color: colors.danger }}
              className="ml-2 text-base font-semibold"
            >
              {t("logout")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
