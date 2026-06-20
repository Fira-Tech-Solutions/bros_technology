import React, { useState } from "react";
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
  Modal,
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
  Check,
  Plus,
  Trash2,
  X,
  Edit3,
  Link,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api/auth";

const PRESET_FIELDS = [
  { key: "phone", label: "Phone", placeholder: "+251 9XX XXX XXX", icon: Phone, color: "#25D366" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+251 9XX XXX XXX", icon: MessageCircle, color: "#25D366" },
  { key: "telegram", label: "Telegram", placeholder: "@username", icon: Send, color: "#0088cc" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/username", icon: Globe, color: "#1877F2" },
  { key: "twitter", label: "Twitter / X", placeholder: "x.com/username", icon: Globe, color: "#000000" },
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/username", icon: Globe, color: "#E4405F" },
  { key: "tiktok", label: "TikTok", placeholder: "tiktok.com/@username", icon: Globe, color: "#000000" },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@username", icon: Globe, color: "#FF0000" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/username", icon: Globe, color: "#0A66C2" },
  { key: "website", label: "Website", placeholder: "yoursite.com", icon: Globe, color: "#6B7280" },
];

// Icons for custom fields
const CUSTOM_ICONS = [Globe, Link, MessageCircle, Send, Camera, Phone];

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [presetLinks, setPresetLinks] = useState({
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
  const [customLinks, setCustomLinks] = useState(
    (user?.customSocials || []).map((c) => ({ ...c, id: Math.random().toString() }))
  );

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showEditIndex, setShowEditIndex] = useState(null); // { type: 'preset'|'custom', key/index }
  const [editValue, setEditValue] = useState("");

  // Custom field inputs
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");

  const hasImageChanged = profileImageUri !== null;
  const currentImage = profileImageUri || user?.profileImage;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera roll permission to change your profile picture.");
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

  // Build set socials list (preset fields that have values + custom)
  const getSetSocials = () => {
    const setPresets = PRESET_FIELDS
      .filter((f) => presetLinks[f.key]?.trim())
      .map((f) => ({
        type: "preset",
        key: f.key,
        label: f.label,
        value: presetLinks[f.key],
        icon: f.icon,
        color: f.color,
        placeholder: f.placeholder,
      }));
    const setCustoms = customLinks.map((c, i) => ({
      type: "custom",
      index: i,
      key: c.key,
      label: c.key,
      value: c.value,
      icon: CUSTOM_ICONS[i % CUSTOM_ICONS.length],
      color: "#6B7280",
      placeholder: "Enter link or username",
    }));
    return [...setPresets, ...setCustoms];
  };

  // Available preset fields (not yet set)
  const getAvailablePresets = () => {
    return PRESET_FIELDS.filter((f) => !presetLinks[f.key]?.trim());
  };

  const handleAddPreset = (fieldKey) => {
    setPresetLinks((prev) => ({ ...prev, [fieldKey]: " " }));
    setShowAddModal(false);
  };

  const handleRemovePreset = (key) => {
    Alert.alert("Remove", `Clear ${PRESET_FIELDS.find((f) => f.key === key)?.label || key}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear", style: "destructive",
        onPress: () => {
          setPresetLinks((prev) => ({ ...prev, [key]: "" }));
        },
      },
    ]);
  };

  const handleAddCustom = () => {
    if (!customKey.trim()) {
      Alert.alert("Error", "Platform name is required");
      return;
    }
    if (!customValue.trim()) {
      Alert.alert("Error", "Link or username is required");
      return;
    }
    setCustomLinks((prev) => [
      ...prev,
      { id: Math.random().toString(), key: customKey.trim(), value: customValue.trim() },
    ]);
    setCustomKey("");
    setCustomValue("");
    setShowCustomModal(false);
  };

  const handleRemoveCustom = (id) => {
    Alert.alert("Remove", `Remove "${customLinks.find((c) => c.id === id)?.key}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setCustomLinks((prev) => prev.filter((c) => c.id !== id)) },
    ]);
  };

  // Inline edit
  const startEdit = (item) => {
    setEditValue(item.value);
    setShowEditIndex({ type: item.type, key: item.key, index: item.index });
  };

  const saveEdit = () => {
    if (!showEditIndex) return;
    const { type, key, index } = showEditIndex;
    if (type === "preset") {
      setPresetLinks((prev) => ({ ...prev, [key]: editValue }));
    } else {
      setCustomLinks((prev) =>
        prev.map((c, i) => (i === index ? { ...c, value: editValue } : c))
      );
    }
    setShowEditIndex(null);
    setEditValue("");
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Error", "Name is required"); return; }
    if (!email.trim()) { Alert.alert("Error", "Email is required"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { Alert.alert("Error", "Please enter a valid email"); return; }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());

      Object.entries(presetLinks).forEach(([key, value]) => {
        formData.append(key, value.trim());
      });

      const customPayload = customLinks.map(({ key, value }) => ({ key, value }));
      formData.append("customSocials", JSON.stringify(customPayload));

      if (hasImageChanged) {
        const filename = profileImageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("profileImage", { uri: profileImageUri, name: filename, type });
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

  const setSocials = getSetSocials();
  const availablePresets = getAvailablePresets();

  const renderSocialCard = (item, index) => {
    const IconComp = item.icon;
    const isEditing = showEditIndex && showEditIndex.type === item.type && showEditIndex.key === item.key;

    return (
      <View
        key={`${item.type}-${item.key}-${index}`}
        style={{
          backgroundColor: colors.input,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          paddingHorizontal: 14,
          paddingVertical: 10,
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 34, height: 34, borderRadius: 10,
              backgroundColor: `${item.color}18`,
              alignItems: "center", justifyContent: "center",
              marginRight: 10,
            }}
          >
            <IconComp size={16} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: "600", marginBottom: 2 }}>
              {item.label}
            </Text>
            {isEditing ? (
              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                placeholder={item.placeholder}
                placeholderTextColor={`${colors.textMuted}80`}
                autoCapitalize="none"
                autoFocus
                style={{
                  color: colors.text, fontSize: 13, padding: 0,
                  borderBottomWidth: 1, borderBottomColor: colors.primary, paddingVertical: 2,
                }}
              />
            ) : (
              <TouchableOpacity onPress={() => startEdit(item)}>
                <Text style={{ color: colors.text, fontSize: 13 }} numberOfLines={1}>
                  {item.value}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  onPress={saveEdit}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    backgroundColor: colors.primary,
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Check size={14} color={colors.primaryText} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowEditIndex(null)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    backgroundColor: colors.bgTertiary,
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={14} color={colors.textMuted} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => startEdit(item)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    backgroundColor: colors.bgTertiary,
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Edit3 size={13} color={colors.textMuted} />
                </TouchableOpacity>
                {item.type === "preset" ? (
                  <TouchableOpacity
                    onPress={() => handleRemovePreset(item.key)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      backgroundColor: `${colors.danger}15`,
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X size={13} color={colors.danger} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleRemoveCustom(item.id)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      backgroundColor: `${colors.danger}15`,
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Trash2 size={13} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <View style={{
            flexDirection: "row", alignItems: "center",
            paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: colors.bgTertiary,
                alignItems: "center", justifyContent: "center", marginRight: 12,
              }}
            >
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>
              Edit Profile
            </Text>
          </View>

          {/* Profile Picture */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <TouchableOpacity onPress={pickImage}>
              <View style={{
                width: 100, height: 100, borderRadius: 50,
                backgroundColor: colors.bgTertiary,
                alignItems: "center", justifyContent: "center",
                borderWidth: 3, borderColor: colors.primary, overflow: "hidden",
              }}>
                {currentImage ? (
                  <Image source={{ uri: currentImage }} style={{ width: 94, height: 94, borderRadius: 47 }} resizeMode="cover" />
                ) : (
                  <Text style={{ color: colors.text, fontSize: 36, fontWeight: "700" }}>
                    {user?.name?.charAt(0).toUpperCase() || "?"}
                  </Text>
                )}
              </View>
              <View style={{
                position: "absolute", bottom: 0, right: 0,
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: colors.primary,
                alignItems: "center", justifyContent: "center",
                borderWidth: 2, borderColor: colors.bg,
              }}>
                <Camera size={14} color={colors.primaryText} />
              </View>
            </TouchableOpacity>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
              Tap to change photo
            </Text>
          </View>

          {/* Basic Info */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{
              color: colors.textSecondary, fontSize: 12, fontWeight: "600",
              textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8,
            }}>
              Full Name
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: colors.input, borderRadius: 12,
              borderWidth: 1, borderColor: colors.inputBorder,
              paddingHorizontal: 14, height: 52, marginBottom: 16,
            }}>
              <User size={18} color={colors.textMuted} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                style={{ flex: 1, marginLeft: 10, color: colors.text, fontSize: 15 }}
              />
            </View>

            <Text style={{
              color: colors.textSecondary, fontSize: 12, fontWeight: "600",
              textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8,
            }}>
              Email
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: colors.input, borderRadius: 12,
              borderWidth: 1, borderColor: colors.inputBorder,
              paddingHorizontal: 14, height: 52,
            }}>
              <Mail size={18} color={colors.textMuted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ flex: 1, marginLeft: 10, color: colors.text, fontSize: 15 }}
              />
            </View>
          </View>

          {/* Contact & Social Media */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{
              color: colors.textMuted, fontSize: 11, fontWeight: "600",
              textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12,
            }}>
              Contact & Social Media
            </Text>

            {setSocials.length === 0 && (
              <View style={{
                backgroundColor: colors.card, borderRadius: 14,
                borderWidth: 1, borderColor: colors.border,
                padding: 20, alignItems: "center", marginBottom: 12,
              }}>
                <Globe size={28} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 8, textAlign: "center" }}>
                  No contacts added yet
                </Text>
              </View>
            )}

            {/* Set socials cards */}
            {setSocials.map((item, i) => renderSocialCard(item, i))}

            {/* Add buttons row */}
            <View style={{ flexDirection: "row", gap: 8 }}>
              {availablePresets.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  style={{
                    flex: 1, backgroundColor: `${colors.primary}15`,
                    borderRadius: 12, height: 44,
                    flexDirection: "row", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Plus size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600", marginLeft: 6 }}>
                    Add Social
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowCustomModal(true)}
                style={{
                  flex: 1, backgroundColor: colors.card,
                  borderRadius: 12, height: 44,
                  borderWidth: 1, borderColor: colors.border,
                  flexDirection: "row", alignItems: "center", justifyContent: "center",
                }}
              >
                <Plus size={16} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600", marginLeft: 6 }}>
                  Add Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <View style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: colors.primary, borderRadius: 14, height: 52,
                flexDirection: "row", alignItems: "center", justifyContent: "center",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator color={colors.primaryText} />
              ) : (
                <>
                  <Save size={18} color={colors.primaryText} />
                  <Text style={{ color: colors.primaryText, fontSize: 16, fontWeight: "700", marginLeft: 8 }}>
                    Save Changes
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Preset Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{
            backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
            paddingTop: 20, paddingBottom: Platform.OS === "ios" ? 40 : 20, paddingHorizontal: 20,
            maxHeight: "60%",
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>Add Social Link</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {availablePresets.map((field) => {
                const IconComp = field.icon;
                return (
                  <TouchableOpacity
                    key={field.key}
                    onPress={() => handleAddPreset(field.key)}
                    style={{
                      flexDirection: "row", alignItems: "center",
                      paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
                    }}
                  >
                    <View style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: `${field.color}18`,
                      alignItems: "center", justifyContent: "center", marginRight: 12,
                    }}>
                      <IconComp size={16} color={field.color} />
                    </View>
                    <Text style={{ color: colors.text, fontSize: 15, fontWeight: "500" }}>{field.label}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 8, flex: 1 }} numberOfLines={1}>
                      {field.placeholder}
                    </Text>
                    <Plus size={16} color={colors.primary} />
                  </TouchableOpacity>
                );
              })}
              {availablePresets.length === 0 && (
                <View style={{ paddingVertical: 30, alignItems: "center" }}>
                  <Check size={28} color={colors.success || "#22c55e"} />
                  <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8 }}>
                    All social links added
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Custom Modal */}
      <Modal visible={showCustomModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{
            backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
            paddingTop: 20, paddingBottom: Platform.OS === "ios" ? 40 : 20, paddingHorizontal: 20,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>Add Custom Link</Text>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600", marginBottom: 6 }}>
              Platform Name
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: colors.input, borderRadius: 12,
              borderWidth: 1, borderColor: colors.inputBorder,
              paddingHorizontal: 14, height: 48, marginBottom: 14,
            }}>
              <Globe size={16} color={colors.textMuted} />
              <TextInput
                value={customKey}
                onChangeText={setCustomKey}
                placeholder="e.g. GitHub, Snapchat, Discord"
                placeholderTextColor={`${colors.textMuted}80`}
                style={{ flex: 1, marginLeft: 10, color: colors.text, fontSize: 14 }}
              />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600", marginBottom: 6 }}>
              Link or Username
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: colors.input, borderRadius: 12,
              borderWidth: 1, borderColor: colors.inputBorder,
              paddingHorizontal: 14, height: 48, marginBottom: 20,
            }}>
              <Link size={16} color={colors.textMuted} />
              <TextInput
                value={customValue}
                onChangeText={setCustomValue}
                placeholder="github.com/username or @username"
                placeholderTextColor={`${colors.textMuted}80`}
                autoCapitalize="none"
                style={{ flex: 1, marginLeft: 10, color: colors.text, fontSize: 14 }}
              />
            </View>
            <TouchableOpacity
              onPress={handleAddCustom}
              style={{
                backgroundColor: colors.primary, borderRadius: 12, height: 48,
                flexDirection: "row", alignItems: "center", justifyContent: "center",
              }}
            >
              <Plus size={18} color={colors.primaryText} />
              <Text style={{ color: colors.primaryText, fontSize: 15, fontWeight: "700", marginLeft: 8 }}>
                Add Custom Link
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
