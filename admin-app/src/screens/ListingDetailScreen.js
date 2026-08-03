import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import {
  ChevronLeft,
  Trash2,
  Camera,
  X,
  Check,
  DollarSign,
  CircleDollarSign,
  Calendar,
  Tag,
  Smartphone,
  Laptop,
  Settings,
  Hash,
  Star,
  Gauge,
  Maximize2,
  Palette,
  Ruler,
  Car,
} from "lucide-react-native";

import CachedImage from "../components/CachedImage";
import { useTheme } from "../context/ThemeContext";
import { getListing, updateListing, deleteListing } from "../api/listings";
import { getCategories } from "../api/categories";
import LoadingOverlay from "../components/LoadingOverlay";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_MAP = {
  AVAILABLE: { label: "Available", color: "#22C55E", bg: "#DCFCE7", darkBg: "#0D2E1A" },
  PENDING: { label: "Pending", color: "#F59E0B", bg: "#FEF3C7", darkBg: "#2D2006" },
  SOLD: { label: "Sold", color: "#EF4444", bg: "#FEE2E2", darkBg: "#2D1215" },
  ARCHIVED: { label: "Archived", color: "#6B7280", bg: "#F3F4F6", darkBg: "#1F2429" },
};

const STATUS_OPTIONS = Object.keys(STATUS_MAP);

const FIELD_META = {
  brand: { label: "Brand", icon: Tag },
  model: { label: "Model", icon: Tag },
  storage: { label: "Storage", icon: Tag },
  ram: { label: "RAM", icon: Hash },
  color: { label: "Color", icon: Palette },
  condition: { label: "Condition", icon: Star },
  year: { label: "Year", icon: Calendar },
  processor: { label: "Processor", icon: Settings },
  gpu: { label: "GPU", icon: Settings },
  screenSize: { label: "Screen Size", icon: Maximize2 },
  os: { label: "OS", icon: Settings },
  batteryHealth: { label: "Battery Health", icon: Gauge },
  carrier: { label: "Carrier", icon: Tag },
  hasWarranty: { label: "Warranty", icon: Check },
  hasAppleCare: { label: "AppleCare", icon: Check },
  connectivity: { label: "Connectivity", icon: Tag },
  caseSize: { label: "Case Size", icon: Ruler },
  storageType: { label: "Storage Type", icon: Tag },
  price: { label: "Price", icon: DollarSign },
  mileage: { label: "Mileage", icon: Gauge },
  fuelType: { label: "Fuel Type", icon: Gauge },
  transmission: { label: "Transmission", icon: Settings },
  engineSize: { label: "Engine Size", icon: Settings },
  vin: { label: "VIN", icon: Hash },
  make: { label: "Make", icon: Car },
  area: { label: "Area", icon: Ruler },
  bedrooms: { label: "Bedrooms", icon: Tag },
  bathrooms: { label: "Bathrooms", icon: Tag },
  furnished: { label: "Furnished", icon: Tag },
  parking: { label: "Parking", icon: Tag },
  floors: { label: "Floors", icon: Tag },
  yearBuilt: { label: "Year Built", icon: Calendar },
  listingType: { label: "Listing Type", icon: CircleDollarSign },
};

function getFieldMeta(fieldName, ruleType) {
  if (FIELD_META[fieldName]) return FIELD_META[fieldName];
  return {
    label: fieldName.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    icon: Tag,
  };
}

function getImageUrl(images) {
  if (!images || images.length === 0) return null;
  const path = images[0];
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}/${path}`;
}

function SectionLabel({ title, colors }) {
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 14,
        marginTop: 24,
      }}
    >
      {title}
    </Text>
  );
}

function FieldLabel({ label, colors }) {
  return (
    <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
      {label}
    </Text>
  );
}

function StyledInput({ value, onChangeText, placeholder, keyboardType, multiline, colors, radii }) {
  return (
    <TextInput
      value={value || ""}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType={keyboardType || "default"}
      multiline={multiline}
      style={{
        backgroundColor: colors.input,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: radii.md,
        paddingHorizontal: 16,
        height: multiline ? undefined : 52,
        minHeight: multiline ? 90 : undefined,
        color: colors.text,
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 14,
        textAlignVertical: multiline ? "top" : undefined,
        paddingVertical: multiline ? 14 : undefined,
      }}
    />
  );
}

function StatusPicker({ value, onChange, colors, radii }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {STATUS_OPTIONS.map((key) => {
        const s = STATUS_MAP[key];
        const active = value === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: active ? (colors.isDark ? s.darkBg : s.bg) : colors.bgTertiary,
              borderWidth: 1,
              borderColor: active ? s.color : colors.border,
              borderRadius: 9999,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: s.color, marginRight: 7 }} />
            <Text style={{ color: active ? s.color : colors.textMuted, fontSize: 12, fontWeight: active ? "700" : "500" }}>
              {s.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ListingDetailScreen({ route, navigation }) {
  const { listingId } = route.params;
  const { colors, radii, shadows } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState(null);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    neighborhood: "",
    categoryId: "",
    status: "AVAILABLE",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [dynamicFields, setDynamicFields] = useState({});

  useEffect(() => {
    loadData();
  }, [listingId]);

  const loadData = async () => {
    try {
      const [listingRes, catRes] = await Promise.all([
        getListing(listingId, true),
        getCategories(),
      ]);
      const data = listingRes.data.data;
      const cats = catRes.data.data || [];
      setListing(data);
      setCategories(cats);
      setForm({
        title: data.title || "",
        description: data.description || "",
        price: String(data.price || ""),
        city: data.city || "",
        neighborhood: data.neighborhood || "",
        categoryId: data.categoryId || "",
        status: data.status || "AVAILABLE",
      });
      setExistingImages(data.images || []);
      setDynamicFields(data.attributes || {});
    } catch {
      Alert.alert("Error", "Failed to load product");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const schemaRules = useMemo(() => {
    if (!selectedCategory?.schemaRules) return [];
    if (Array.isArray(selectedCategory.schemaRules)) return selectedCategory.schemaRules;
    return [];
  }, [selectedCategory]);

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateDynamic = (field, value) => setDynamicFields((prev) => ({ ...prev, [field]: value }));

  const pickImages = async () => {
    const remaining = 5 - existingImages.length - newImages.length;
    if (remaining <= 0) {
      Alert.alert("Limit", "Maximum 5 images allowed");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled) setNewImages((prev) => [...prev, ...result.assets]);
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    if (!form.price.trim() || isNaN(parseFloat(form.price))) {
      Alert.alert("Error", "Valid price is required");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("price", parseFloat(form.price));
      formData.append("city", form.city);
      formData.append("neighborhood", form.neighborhood.trim());
      formData.append("categoryId", form.categoryId);
      formData.append("status", form.status);
      const attributes = { ...dynamicFields };
      for (const rule of schemaRules) {
        const val = attributes[rule.field];
        if (val === undefined || val === null || val === "") {
          delete attributes[rule.field];
        } else if (rule.type === "number") {
          attributes[rule.field] = parseFloat(val);
        } else if (rule.type === "boolean") {
          attributes[rule.field] = !!val;
        }
      }
      formData.append("attributes", JSON.stringify(attributes));
      newImages.forEach((img, index) => {
        const ext = img.uri.split(".").pop() || "jpg";
        const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
        formData.append("images", { uri: img.uri, type: mimeType, name: `image_${index}.${ext}` });
      });
      await updateListing(listingId, formData);
      Alert.alert("Success", "Product updated", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || "Failed to update product";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Product", `Delete "${form.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteListing(listingId);
            navigation.goBack();
          } catch {
            Alert.alert("Error", "Failed to delete product");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const totalImages = existingImages.length + newImages.length;
  const statusCfg = STATUS_MAP[form.status] || STATUS_MAP.AVAILABLE;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: colors.bgSecondary,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <ChevronLeft size={20} color={colors.text} strokeWidth={1.75} />
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600", marginLeft: 4 }}>
              Back
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 9999,
                paddingHorizontal: 18,
                paddingVertical: 9,
                flexDirection: "row",
                alignItems: "center",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Check size={15} color={colors.white} strokeWidth={2.5} />
                  <Text style={{ color: colors.white, fontSize: 13, fontWeight: "700", marginLeft: 6 }}>
                    Save
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: `${colors.danger}15`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={16} color={colors.danger} strokeWidth={1.75} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photos */}
          <SectionLabel title="Photos" colors={colors} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {existingImages.map((img, idx) => {
              const uri = img.startsWith("http") ? img : `${API_BASE_URL}/${img}`;
              return (
                <View key={`exist-${idx}`} style={{ marginRight: 10 }}>
                  <CachedImage uri={uri} style={{ width: 96, height: 96, borderRadius: radii.sm }} resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => removeExistingImage(idx)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: colors.danger,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={10} color="#fff" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              );
            })}
            {newImages.map((img, idx) => (
              <View key={`new-${idx}`} style={{ marginRight: 10 }}>
                <Image source={{ uri: img.uri }} style={{ width: 96, height: 96, borderRadius: radii.sm }} resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => removeNewImage(idx)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: colors.danger,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={10} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ))}
            {totalImages < 5 && (
              <TouchableOpacity
                onPress={pickImages}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: radii.sm,
                  borderWidth: 2,
                  borderColor: colors.border,
                  borderStyle: "dashed",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.bgTertiary,
                }}
              >
                <Camera size={20} color={colors.textMuted} strokeWidth={1.75} />
                <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: "600", marginTop: 4 }}>
                  Add
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Basic Info */}
          <SectionLabel title="Basic Information" colors={colors} />
          <FieldLabel label="Title" colors={colors} />
          <StyledInput
            value={form.title}
            onChangeText={(v) => updateForm("title", v)}
            placeholder="Product title"
            colors={colors}
            radii={radii}
          />

          <FieldLabel label="Description" colors={colors} />
          <StyledInput
            value={form.description}
            onChangeText={(v) => updateForm("description", v)}
            placeholder="Describe the product"
            multiline
            colors={colors}
            radii={radii}
          />

          <FieldLabel label="Price (ETB)" colors={colors} />
          <StyledInput
            value={form.price}
            onChangeText={(v) => updateForm("price", v)}
            placeholder="0"
            keyboardType="numeric"
            colors={colors}
            radii={radii}
          />

          {/* Status */}
          <FieldLabel label="Status" colors={colors} />
          <View style={{ marginBottom: 14 }}>
            <StatusPicker value={form.status} onChange={(s) => updateForm("status", s)} colors={colors} radii={radii} />
          </View>

          {/* Category Details */}
          {schemaRules.length > 0 && (
            <>
              <SectionLabel title={`${selectedCategory?.displayName || "Category"} Details`} colors={colors} />
              {schemaRules.map((rule) => {
                const meta = getFieldMeta(rule.field, rule.type);
                const Icon = meta.icon;
                const val = dynamicFields[rule.field];

                if (rule.type === "boolean") {
                  return (
                    <View
                      key={rule.field}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: colors.input,
                        borderRadius: radii.md,
                        borderWidth: 1,
                        borderColor: colors.inputBorder,
                        paddingHorizontal: 16,
                        height: 52,
                        marginBottom: 10,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Icon size={17} color={colors.textMuted} strokeWidth={1.75} style={{ marginRight: 12 }} />
                        <Text style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}>{meta.label}</Text>
                      </View>
                      <Switch
                        value={!!val}
                        onValueChange={(v) => updateDynamic(rule.field, v)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.white}
                      />
                    </View>
                  );
                }

                return (
                  <View key={rule.field} style={{ marginBottom: 14 }}>
                    <FieldLabel label={meta.label} colors={colors} />
                    <TextInput
                      value={val !== undefined && val !== null ? String(val) : ""}
                      onChangeText={(v) => updateDynamic(rule.field, v)}
                      placeholder={meta.label}
                      placeholderTextColor={colors.textMuted}
                      keyboardType={rule.type === "number" ? "numeric" : "default"}
                      style={{
                        backgroundColor: colors.input,
                        borderWidth: 1,
                        borderColor: colors.inputBorder,
                        borderRadius: radii.md,
                        paddingHorizontal: 16,
                        height: 52,
                        color: colors.text,
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    />
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        {/* Bottom Bar */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingVertical: 14,
            backgroundColor: colors.bgSecondary,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 2 }}>
              {selectedCategory?.displayName || "—"} · {form.neighborhood || "—"}
            </Text>
            <Text style={{ color: colors.primary, fontSize: 17, fontWeight: "700" }}>
              {form.price ? `${Number(form.price).toLocaleString()} ETB` : "—"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 9999,
              paddingHorizontal: 24,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Check size={16} color={colors.white} strokeWidth={2.5} />
                <Text style={{ color: colors.white, fontSize: 14, fontWeight: "700", marginLeft: 6 }}>
                  Save Changes
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <LoadingOverlay visible={saving} message="Saving changes..." />
    </SafeAreaView>
  );
}
