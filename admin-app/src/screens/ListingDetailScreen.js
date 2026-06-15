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
import * as ImagePicker from "expo-image-picker";
import {
  ChevronLeft,
  Trash2,
  Camera,
  X,
  Plus,
  Check,
  MapPin,
  BedDouble,
  Bath,
  Calendar,
  Gauge,
  Fuel,
  Palette,
  Maximize2,
  Sofa,
  Star,
  DollarSign,
  CircleDollarSign,
  Ruler,
  ParkingSquare,
  Settings,
  Hash,
  Tag,
  Car,
  Home,
  Landmark,
  TreePine,
  GraduationCap,
  Heart,
  Shield,
  Wrench,
  Briefcase,
  ShoppingBag,
  Gem,
  Smartphone,
  Laptop,
  Bike,
  Truck,
  Handshake,
  PackageX,
  Clock,
  Blinds,
  Building2,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { getListing, updateListing, deleteListing } from "../api/listings";
import { getCategories } from "../api/categories";
import LoadingOverlay from "../components/LoadingOverlay";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

const ICON_OPTIONS = [
  { name: "home", Icon: Home, label: "House" },
  { name: "building2", Icon: Building2, label: "Building" },
  { name: "car", Icon: Car, label: "Car" },
  { name: "bike", Icon: Bike, label: "Bike" },
  { name: "truck", Icon: Truck, label: "Truck" },
  { name: "smartphone", Icon: Smartphone, label: "Phone" },
  { name: "laptop", Icon: Laptop, label: "Laptop" },
  { name: "sofa", Icon: Sofa, label: "Furniture" },
  { name: "gem", Icon: Gem, label: "Jewelry" },
  { name: "shoppingBag", Icon: ShoppingBag, label: "Shopping" },
  { name: "briefcase", Icon: Briefcase, label: "Business" },
  { name: "landmark", Icon: Landmark, label: "Land" },
  { name: "treePine", Icon: TreePine, label: "Nature" },
  { name: "graduationCap", Icon: GraduationCap, label: "Education" },
  { name: "heart", Icon: Heart, label: "Health" },
  { name: "shield", Icon: Shield, label: "Security" },
  { name: "wrench", Icon: Wrench, label: "Tools" },
  { name: "palette", Icon: Palette, label: "Design" },
  { name: "tag", Icon: Tag, label: "Other" },
];

function getIconComponent(iconName) {
  const found = ICON_OPTIONS.find((o) => o.name === iconName);
  return found ? found.Icon : Tag;
}

const STATUS_MAP = {
  AVAILABLE: { label: "Available", color: "#22c55e", Icon: Check },
  PENDING: { label: "Pending", color: "#eab308", Icon: Clock },
  SOLD: { label: "Sold", color: "#ef4444", Icon: CircleDollarSign },
  RENTED: { label: "Rented", color: "#6366f1", Icon: Handshake },
  RESERVED: { label: "Reserved", color: "#f97316", Icon: PackageX },
};

const STATUS_OPTIONS = Object.keys(STATUS_MAP);

const CITIES = [
  "Addis Ababa",
  "Dire Dawa",
  "Hawassa",
  "Bahir Dar",
  "Mekelle",
  "Adama",
  "Gondar",
  "Jimma",
];

const FIELD_META = {
  bedrooms: { label: "Bedrooms", icon: BedDouble, type: "number" },
  bathrooms: { label: "Bathrooms", icon: Bath, type: "number" },
  area: { label: "Area (m\u00b2)", icon: Ruler, type: "number" },
  furnished: { label: "Furnished", icon: Sofa, type: "boolean" },
  parking: { label: "Parking Spots", icon: ParkingSquare, type: "number" },
  floors: { label: "Floors", icon: Hash, type: "number" },
  yearBuilt: { label: "Year Built", icon: Calendar, type: "number" },
  condition: { label: "Condition", icon: Star, type: "string" },
  make: { label: "Make / Brand", icon: Car, type: "string" },
  model: { label: "Model", icon: Tag, type: "string" },
  year: { label: "Year", icon: Calendar, type: "number" },
  mileage: { label: "Mileage (km)", icon: Gauge, type: "number" },
  fuelType: { label: "Fuel Type", icon: Fuel, type: "string" },
  transmission: { label: "Transmission", icon: Settings, type: "string" },
  color: { label: "Color", icon: Palette, type: "string" },
  engineSize: { label: "Engine Size", icon: Gauge, type: "string" },
  vin: { label: "VIN", icon: Hash, type: "string" },
  brand: { label: "Brand", icon: Tag, type: "string" },
  storage: { label: "Storage", icon: Tag, type: "string" },
  screenSize: { label: "Screen Size", icon: Maximize2, type: "string" },
  processor: { label: "Processor", icon: Settings, type: "string" },
  ram: { label: "RAM", icon: Hash, type: "string" },
  os: { label: "Operating System", icon: Settings, type: "string" },
  hasAC: { label: "Air Conditioning", icon: Blinds, type: "boolean" },
  hasWifi: { label: "Wi-Fi", icon: Blinds, type: "boolean" },
  plotSize: { label: "Plot Size (m\u00b2)", icon: Ruler, type: "number" },
  zoning: { label: "Zoning", icon: Tag, type: "string" },
  material: { label: "Material", icon: Tag, type: "string" },
  capacity: { label: "Capacity", icon: Hash, type: "number" },
  seats: { label: "Seats", icon: Sofa, type: "number" },
  bodyType: { label: "Body Type", icon: Car, type: "string" },
  listingType: { label: "Listing Type", icon: CircleDollarSign, type: "string" },
};

function getFieldMeta(fieldName, ruleType) {
  if (FIELD_META[fieldName]) return FIELD_META[fieldName];
  return {
    label: fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase()),
    icon: Tag,
    type: ruleType || "string",
  };
}

function getImageUrl(images) {
  if (!images || images.length === 0) return null;
  const path = images[0];
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}/${path}`;
}

function SectionHeader({ title, colors }) {
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
        marginTop: 20,
      }}
    >
      {title}
    </Text>
  );
}

function FieldRow({ label, icon: Icon, children, colors }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.input,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.inputBorder,
        paddingHorizontal: 14,
        height: 52,
        marginBottom: 10,
      }}
    >
      <Icon size={18} color={colors.textMuted} style={{ marginRight: 12 }} />
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 13,
          fontWeight: "500",
          width: 100,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View style={{ flex: 1, alignItems: "flex-end" }}>{children}</View>
    </View>
  );
}

function EditableField({
  label,
  icon,
  value,
  onChangeText,
  keyboardType,
  colors,
  multiline,
}) {
  return (
    <FieldRow label={label} icon={icon} colors={colors}>
      <TextInput
        value={value || ""}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        style={{
          color: colors.text,
          fontSize: 14,
          fontWeight: "500",
          textAlign: "right",
          flex: 1,
          ...(multiline ? { minHeight: 60, textAlignVertical: "top" } : {}),
        }}
      />
    </FieldRow>
  );
}

function BooleanField({ label, icon, value, onToggle, colors }) {
  return (
    <FieldRow label={label} icon={icon} colors={colors}>
      <Switch
        value={!!value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.primaryText}
      />
    </FieldRow>
  );
}

function StatusPicker({ value, onChange, colors }) {
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
              backgroundColor: active ? `${s.color}20` : colors.bgTertiary,
              borderWidth: 1.5,
              borderColor: active ? s.color : colors.border,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <s.Icon size={12} color={active ? s.color : colors.textMuted} />
            <Text
              style={{
                color: active ? s.color : colors.textMuted,
                fontSize: 11,
                fontWeight: active ? "700" : "500",
                marginLeft: 5,
              }}
            >
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
  const { colors } = useTheme();

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
  const [removedImages, setRemovedImages] = useState([]);

  const [dynamicFields, setDynamicFields] = useState({});
  const [listingType, setListingType] = useState("SELL");

  useEffect(() => {
    loadData();
  }, [listingId]);

  const loadData = async () => {
    try {
      const [listingRes, catRes] = await Promise.all([
        getListing(listingId),
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
      setListingType(data.attributes?.listingType || "SELL");
    } catch {
      Alert.alert("Error", "Failed to load listing");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const schemaRules = useMemo(() => {
    if (!selectedCategory?.schemaRules) return [];
    if (Array.isArray(selectedCategory.schemaRules))
      return selectedCategory.schemaRules;
    return [];
  }, [selectedCategory]);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateDynamic = (field, value) =>
    setDynamicFields((prev) => ({ ...prev, [field]: value }));

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
    if (!result.canceled) {
      setNewImages((prev) => [...prev, ...result.assets]);
    }
  };

  const removeExistingImage = (index) => {
    const img = existingImages[index];
    setRemovedImages((prev) => [...prev, img]);
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

      const attributes = { ...dynamicFields, listingType };
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
        formData.append("images", {
          uri: img.uri,
          type: mimeType,
          name: `image_${index}.${ext}`,
        });
      });

      await updateListing(listingId, formData);
      Alert.alert("Success", "Listing updated", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.message ||
        "Failed to update listing";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Listing", `Delete "${form.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteListing(listingId);
            navigation.goBack();
          } catch {
            Alert.alert("Error", "Failed to delete listing");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const totalImages = existingImages.length + newImages.length;

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
            paddingVertical: 12,
            backgroundColor: colors.bgSecondary,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <ChevronLeft size={20} color={colors.text} />
            <Text
              style={{
                color: colors.text,
                fontSize: 15,
                fontWeight: "600",
                marginLeft: 4,
              }}
            >
              Back
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: "row",
                alignItems: "center",
                marginRight: 10,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <>
                  <Check size={14} color={colors.primaryText} />
                  <Text
                    style={{
                      color: colors.primaryText,
                      fontSize: 13,
                      fontWeight: "700",
                      marginLeft: 5,
                    }}
                  >
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
                backgroundColor: `${colors.danger}18`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Images Section */}
          <SectionHeader title="Photos" colors={colors} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            {existingImages.map((img, idx) => {
              const uri = img.startsWith("http")
                ? img
                : `${API_BASE_URL}/${img}`;
              return (
                <View key={`exist-${idx}`} style={{ marginRight: 10 }}>
                  <Image
                    source={{ uri }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
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
                      borderWidth: 1.5,
                      borderColor: colors.bg,
                    }}
                  >
                    <X size={10} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            })}
            {newImages.map((img, idx) => (
              <View key={`new-${idx}`} style={{ marginRight: 10 }}>
                <Image
                  source={{ uri: img.uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 12,
                  }}
                  resizeMode="cover"
                />
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
                    borderWidth: 1.5,
                    borderColor: colors.bg,
                  }}
                >
                  <X size={10} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {totalImages < 5 && (
              <TouchableOpacity
                onPress={pickImages}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: `${colors.primary}40`,
                  borderStyle: "dashed",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: `${colors.primary}08`,
                }}
              >
                <Camera size={22} color={colors.primary} />
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 9,
                    fontWeight: "600",
                    marginTop: 4,
                  }}
                >
                  Add Photo
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Basic Info */}
          <SectionHeader title="Basic Information" colors={colors} />

          <View style={{ marginBottom: 10 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Title
            </Text>
            <TextInput
              value={form.title}
              onChangeText={(v) => updateForm("title", v)}
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.input,
                borderWidth: 1.5,
                borderColor: colors.inputBorder,
                borderRadius: 12,
                paddingHorizontal: 14,
                height: 48,
                color: colors.text,
                fontSize: 14,
                fontWeight: "500",
              }}
            />
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Description
            </Text>
            <TextInput
              value={form.description}
              onChangeText={(v) => updateForm("description", v)}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: colors.input,
                borderWidth: 1.5,
                borderColor: colors.inputBorder,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colors.text,
                fontSize: 14,
                fontWeight: "500",
                textAlignVertical: "top",
                minHeight: 90,
              }}
            />
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Price (ETB)
            </Text>
            <TextInput
              value={form.price}
              onChangeText={(v) => updateForm("price", v)}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.input,
                borderWidth: 1.5,
                borderColor: colors.inputBorder,
                borderRadius: 12,
                paddingHorizontal: 14,
                height: 48,
                color: colors.text,
                fontSize: 14,
                fontWeight: "500",
              }}
            />
          </View>

          {/* Listing Type */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Listing Type
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                { key: "SELL", label: "Sell", icon: CircleDollarSign },
                { key: "RENT", label: "Rent", icon: Calendar },
              ].map((opt) => {
                const sel = listingType === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setListingType(opt.key)}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 12,
                      borderRadius: 10,
                      borderWidth: 1.5,
                      backgroundColor: sel
                        ? `${colors.primary}18`
                        : colors.input,
                      borderColor: sel ? colors.primary : colors.inputBorder,
                    }}
                  >
                    <opt.icon
                      size={16}
                      color={sel ? colors.primary : colors.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color: sel ? colors.primary : colors.textMuted,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Status */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Status
            </Text>
            <StatusPicker
              value={form.status}
              onChange={(s) => updateForm("status", s)}
              colors={colors}
            />
          </View>

          {/* Location */}
          <SectionHeader title="Location" colors={colors} />

          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              City
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {CITIES.map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => updateForm("city", city)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      form.city === city ? colors.primary : colors.input,
                    borderWidth: 1,
                    borderColor:
                      form.city === city ? colors.primary : colors.inputBorder,
                  }}
                >
                  <Text
                    style={{
                      color:
                        form.city === city ? colors.primaryText : colors.text,
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Neighborhood
            </Text>
            <TextInput
              value={form.neighborhood}
              onChangeText={(v) => updateForm("neighborhood", v)}
              placeholder="e.g. Bole"
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.input,
                borderWidth: 1.5,
                borderColor: colors.inputBorder,
                borderRadius: 12,
                paddingHorizontal: 14,
                height: 48,
                color: colors.text,
                fontSize: 14,
                fontWeight: "500",
              }}
            />
          </View>

          {/* Category Details */}
          {schemaRules.length > 0 && (
            <>
              <SectionHeader
                title={`${selectedCategory?.displayName || "Category"} Details`}
                colors={colors}
              />
              {schemaRules.map((rule) => {
                const meta = getFieldMeta(rule.field, rule.type);
                const Icon = meta.icon;
                const val = dynamicFields[rule.field];

                if (rule.type === "boolean") {
                  return (
                    <BooleanField
                      key={rule.field}
                      label={meta.label}
                      icon={Icon}
                      value={val}
                      onToggle={(v) => updateDynamic(rule.field, v)}
                      colors={colors}
                    />
                  );
                }

                return (
                  <EditableField
                    key={rule.field}
                    label={meta.label}
                    icon={Icon}
                    value={val !== undefined && val !== null ? String(val) : ""}
                    onChangeText={(v) => updateDynamic(rule.field, v)}
                    keyboardType={rule.type === "number" ? "numeric" : "default"}
                    colors={colors}
                  />
                );
              })}
            </>
          )}
        </ScrollView>

        {/* Bottom Save Bar */}
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
            <Text
              style={{ color: colors.textMuted, fontSize: 11, marginBottom: 2 }}
            >
              {selectedCategory?.displayName || "—"} · {form.city || "—"} ·{" "}
              {form.neighborhood || "—"}
            </Text>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "700" }}>
              {form.price ? `${Number(form.price).toLocaleString()} ETB` : "—"}
              {listingType === "RENT" ? (
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  {" "}
                  /month
                </Text>
              ) : null}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 24,
              paddingHorizontal: 24,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.primaryText} />
            ) : (
              <>
                <Check size={16} color={colors.primaryText} />
                <Text
                  style={{
                    color: colors.primaryText,
                    fontSize: 14,
                    fontWeight: "700",
                    marginLeft: 6,
                  }}
                >
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
