import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Camera,
  Save,
  Mail,
  User,
  Phone,
  Globe,
  MessageCircle,
  Send,
  Link,
  Unlink,
  ExternalLink,
  Check,
  Copy,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { updateProfile, connectTelegram, getTelegramStatus, disconnectTelegram } from "../api/auth";

const SOCIAL_FIELDS = [
  { key: "phone", label: "Phone", placeholder: "+251 9XX XXX XXX", icon: Phone },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+251 9XX XXX XXX", icon: MessageCircle },
  { key: "telegram", label: "Telegram", placeholder: "@username", icon: Send },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/username", icon: Globe },
  { key: "twitter", label: "Twitter / X", placeholder: "x.com/username", icon: Globe },
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/username", icon: Camera },
  { key: "tiktok", label: "TikTok", placeholder: "tiktok.com/@username", icon: Globe },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@username", icon: Globe },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/username", icon: Globe },
  { key: "website", label: "Website", placeholder: "yoursite.com", icon: Globe },
];

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    phone: user?.phone || "",
    whatsapp: user?.whatsapp || "",
    telegram: user?.telegram || "",
    facebook: user?.facebook || "",
    twitter: user?.twitter || "",
    instagram: user?.instagram || "",
    tiktok: user?.tiktok || "",
    youtube: user?.youtube || "",
    linkedin: user?.linkedin || "",
    website: user?.website || "",
  });

  // Telegram connection state
  const [telegramStatus, setTelegramStatus] = useState({
    connected: user?.telegramConnected || false,
    hasPendingCode: false,
    pendingCode: null,
    telegramUsername: null,
    telegramFirstName: null,
    telegramPhotoUrl: null,
  });
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [botUsername, setBotUsername] = useState(null);
  const [copiedAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchTelegramStatus();
    fetchBotUsername();
  }, []);

  const fetchTelegramStatus = async () => {
    try {
      const { data } = await getTelegramStatus();
      setTelegramStatus(data.data);
    } catch (err) {
      console.log("Failed to fetch Telegram status");
    }
  };

  const fetchBotUsername = async () => {
    try {
      const client = (await import("../api/client")).default;
      const { data } = await client.get("/api/syndication/telegram/info");
      if (data.data?.bot?.username) {
        setBotUsername(data.data.bot.username);
      }
    } catch (err) {
      console.log("Failed to fetch bot username");
    }
  };

  const handleConnectTelegram = async () => {
    setTelegramLoading(true);
    try {
      const { data } = await connectTelegram();
      const code = data.data.code;
      setTelegramStatus((prev) => ({
        ...prev,
        hasPendingCode: true,
        pendingCode: code,
      }));

      // Open Telegram with the code
      const username = botUsername || "adamProperies_bot";
      const url = `https://t.me/${username}?start=${code}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Connection Code", `Copy this code and send it to our Telegram bot:\n\n${code}`);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to generate connection code");
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    Alert.alert(
      "Disconnect Telegram",
      "Are you sure you want to disconnect Telegram notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            setTelegramLoading(true);
            try {
              await disconnectTelegram();
              setTelegramStatus({
                connected: false,
                hasPendingCode: false,
                pendingCode: null,
                telegramUsername: null,
                telegramFirstName: null,
                telegramPhotoUrl: null,
              });
              updateUser({ telegramConnected: false });
            } catch (err) {
              Alert.alert("Error", "Failed to disconnect Telegram");
            } finally {
              setTelegramLoading(false);
            }
          },
        },
      ]
    );
  };

  const copyCode = () => {
    if (telegramStatus.pendingCode) {
      // Use Alert to display code for user to copy
      Alert.alert(
        "Your Connection Code",
        telegramStatus.pendingCode,
        [
          { text: "Close", style: "cancel" },
          {
            text: "Open Telegram",
            onPress: () => {
              const username = botUsername || "adamProperies_bot";
              Linking.openURL(`https://t.me/${username}?start=${telegramStatus.pendingCode}`);
            },
          },
        ]
      );

      // Show copied animation
      Animated.sequence([
        Animated.timing(copiedAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(copiedAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]).start();
    }
  };

  const hasImageChanged = profileImageUri !== null;
  const currentImage = profileImageUri || user?.profileImage;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permission to change your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());

      Object.entries(socialLinks).forEach(([key, value]) => {
        formData.append(key, value.trim());
      });

      if (hasImageChanged) {
        const filename = profileImageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("profileImage", {
          uri: profileImageUri,
          name: filename,
          type,
        });
      }

      const { data } = await updateProfile(formData);
      updateUser(data.data);

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const updateSocialLink = (key, value) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

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
              Edit Profile
            </Text>
          </View>

          {/* Profile Picture */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <TouchableOpacity onPress={pickImage}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: colors.bgTertiary,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: colors.primary,
                  overflow: "hidden",
                }}
              >
                {currentImage ? (
                  <Image
                    source={{ uri: currentImage }}
                    style={{ width: 94, height: 94, borderRadius: 47 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 36,
                      fontWeight: "700",
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || "?"}
                  </Text>
                )}
              </View>
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: colors.bg,
                }}
              >
                <Camera size={14} color={colors.primaryText} />
              </View>
            </TouchableOpacity>
            <Text
              style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}
            >
              Tap to change photo
            </Text>
          </View>

          {/* Basic Info */}
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
              Full Name
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
                marginBottom: 16,
              }}
            >
              <User size={18} color={colors.textMuted} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color: colors.text,
                  fontSize: 15,
                }}
              />
            </View>

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
              Email
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
                placeholder="Email address"
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

          {/* Social Media & Contact */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              Contact & Social Media
            </Text>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: "hidden",
              }}
            >
              {SOCIAL_FIELDS.map((field, index) => {
                const IconComp = field.icon;
                return (
                  <View
                    key={field.key}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 14,
                      height: 52,
                      borderBottomWidth: index < SOCIAL_FIELDS.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <IconComp size={18} color={colors.textMuted} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text
                        style={{
                          color: colors.textMuted,
                          fontSize: 10,
                          fontWeight: "500",
                          marginBottom: 2,
                        }}
                      >
                        {field.label}
                      </Text>
                      <TextInput
                        value={socialLinks[field.key]}
                        onChangeText={(v) => updateSocialLink(field.key, v)}
                        placeholder={field.placeholder}
                        placeholderTextColor={`${colors.textMuted}80`}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{
                          color: colors.text,
                          fontSize: 14,
                          padding: 0,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Telegram Connection */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              Telegram Notifications
            </Text>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
              }}
            >
              {/* Connected State */}
              {telegramStatus.connected ? (
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#22c55e18",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        overflow: "hidden",
                      }}
                    >
                      {telegramStatus.telegramPhotoUrl ? (
                        <Image
                          source={{ uri: telegramStatus.telegramPhotoUrl }}
                          style={{ width: 48, height: 48, borderRadius: 24 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Send size={20} color="#22c55e" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
                        Connected
                      </Text>
                      <Text style={{ color: "#22c55e", fontSize: 13, marginTop: 2 }}>
                        @{telegramStatus.telegramUsername || "telegram_user"}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#22c55e",
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleDisconnectTelegram}
                    disabled={telegramLoading}
                    style={{
                      backgroundColor: `${colors.danger}15`,
                      borderRadius: 10,
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {telegramLoading ? (
                      <ActivityIndicator color={colors.danger} size="small" />
                    ) : (
                      <>
                        <Unlink size={14} color={colors.danger} />
                        <Text style={{ color: colors.danger, fontSize: 13, fontWeight: "600", marginLeft: 6 }}>
                          Disconnect
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {/* Status Row */}
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: telegramStatus.hasPendingCode ? `${colors.primary}18` : colors.bgTertiary,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Send size={18} color={telegramStatus.hasPendingCode ? colors.primary : colors.textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
                        {telegramStatus.hasPendingCode ? "Waiting for connection" : "Not Connected"}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                        Receive notifications & OTP via Telegram
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: telegramStatus.hasPendingCode ? "#eab308" : colors.textMuted,
                      }}
                    />
                  </View>

                  {/* Pending Code */}
                  {telegramStatus.hasPendingCode && (
                    <View
                      style={{
                        backgroundColor: `${colors.primary}10`,
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 12,
                      }}
                    >
                      <Text style={{ color: colors.textMuted, fontSize: 10, marginBottom: 6, textTransform: "uppercase" }}>
                        Your Code
                      </Text>
                      <TouchableOpacity
                        onPress={copyCode}
                        style={{
                          backgroundColor: colors.card,
                          borderRadius: 8,
                          paddingVertical: 10,
                          borderWidth: 1,
                          borderColor: colors.border,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: colors.primary,
                            fontSize: 24,
                            fontWeight: "700",
                            letterSpacing: 6,
                          }}
                        >
                          {telegramStatus.pendingCode}
                        </Text>
                        <Copy size={16} color={colors.textMuted} style={{ marginLeft: 10 }} />
                      </TouchableOpacity>
                      <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 8, textAlign: "center" }}>
                        Tap code to copy • Paste in Telegram bot chat
                      </Text>
                    </View>
                  )}

                  {/* Connect Button */}
                  <TouchableOpacity
                    onPress={handleConnectTelegram}
                    disabled={telegramLoading}
                    style={{
                      backgroundColor: "#0088cc",
                      borderRadius: 10,
                      height: 44,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: telegramLoading ? 0.6 : 1,
                    }}
                  >
                    {telegramLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Send size={16} color="#fff" />
                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600", marginLeft: 8 }}>
                          {telegramStatus.hasPendingCode ? "Re-send Code" : "Connect Telegram"}
                        </Text>
                        <ExternalLink size={12} color="#fff" style={{ marginLeft: 6 }} />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Save Button */}
          <View style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 14,
                height: 52,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator color={colors.primaryText} />
              ) : (
                <>
                  <Save size={18} color={colors.primaryText} />
                  <Text
                    style={{
                      color: colors.primaryText,
                      fontSize: 16,
                      fontWeight: "700",
                      marginLeft: 8,
                    }}
                  >
                    Save Changes
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
