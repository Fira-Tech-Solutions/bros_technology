import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Save,
  Phone,
  MessageCircle,
  Send,
  Mail,
  MapPin,
  Clock,
  Globe,
  ExternalLink,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { getSettings, updateSettings } from "../api/settings";

const SETTING_FIELDS = [
  {
    section: "Contact Information",
    sectionAm: "የግንኙነት መረጃ",
    sectionOm: "Odeeffannoo Walitta'",
    fields: [
      { key: "siteName", label: "Shop Name", icon: Globe, placeholder: "BROS Technology" },
      { key: "contactEmail", label: "Email", icon: Mail, placeholder: "email@example.com", keyboardType: "email-address" },
      { key: "whatsappNumber", label: "WhatsApp", icon: MessageCircle, placeholder: "+251972195934", keyboardType: "phone-pad" },
      { key: "callNumber1", label: "Primary Phone", icon: Phone, placeholder: "+251972195934", keyboardType: "phone-pad" },
      { key: "callNumber2", label: "Secondary Phone", icon: Phone, placeholder: "+251980564814", keyboardType: "phone-pad" },
      { key: "telegramHandle", label: "Telegram Handle", icon: Send, placeholder: "brostechnology" },
    ],
  },
  {
    section: "Business Details",
    sectionAm: "የንግድ መረጃ",
    sectionOm: "Odeeffannoo Daldalaa",
    fields: [
      { key: "location", label: "Location", icon: MapPin, placeholder: "Addis Ababa, Ethiopia" },
      { key: "shopGoogleMapUrl", label: "Google Maps URL", icon: MapPin, placeholder: "https://maps.google.com/?q=9.0054,38.7636" },
      { key: "shopMapAddress", label: "Map Address Label", icon: MapPin, placeholder: "Bole Road, Addis Ababa" },
      { key: "businessHours", label: "Business Hours", icon: Clock, placeholder: "Mon – Sat, 9:00 AM – 7:00 PM" },
      { key: "adminTelegramUsername", label: "Admin Telegram (for Order button)", icon: Send, placeholder: "your_personal_username" },
      { key: "miniAppUrl", label: "Mini App URL (for Explore button)", icon: Globe, placeholder: "https://your-deployed-domain.com" },
    ],
  },
  {
    section: "Social Media",
    sectionAm: "ማህበራዊ ሚዲያ",
    sectionOm: "Meediyaa Haamaa",
    fields: [
      { key: "facebookUrl", label: "Facebook URL", icon: ExternalLink, placeholder: "https://facebook.com/..." },
      { key: "instagramUrl", label: "Instagram URL", icon: ExternalLink, placeholder: "https://instagram.com/..." },
      { key: "tiktokUrl", label: "TikTok URL", icon: ExternalLink, placeholder: "https://tiktok.com/..." },
      { key: "youtubeUrl", label: "YouTube URL", icon: ExternalLink, placeholder: "https://youtube.com/..." },
    ],
  },
];

export default function ContactSettingsScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await getSettings();
      setSettings(res.data?.data || res.data || {});
    } catch (err) {
      Alert.alert("Error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      Alert.alert("Success", "Settings updated successfully");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: "600", color: colors.text }}>
          Contact & Social Media
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Save size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {SETTING_FIELDS.map((section) => (
            <View key={section.section} style={{ marginBottom: 28 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.primary,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                {section.section}
              </Text>

              <View
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                }}
              >
                {section.fields.map((field, idx) => {
                  const Icon = field.icon;
                  return (
                    <View
                      key={field.key}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        borderBottomWidth: idx < section.fields.length - 1 ? 1 : 0,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: colors.primary + "15",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 12,
                        }}
                      >
                        <Icon size={15} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.textTertiary,
                            marginBottom: 2,
                          }}
                        >
                          {field.label}
                        </Text>
                        <TextInput
                          style={{
                            fontSize: 15,
                            color: colors.text,
                            paddingVertical: 2,
                          }}
                          value={settings[field.key] || ""}
                          onChangeText={(v) => handleChange(field.key, v)}
                          placeholder={field.placeholder}
                          placeholderTextColor={colors.textTertiary}
                          keyboardType={field.keyboardType || "default"}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              marginTop: 8,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
