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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  X,
  Check,
  Mail,
  Lock,
  Home,
  BedDouble,
  Bath,
  ChevronDown,
  Plus,
  ArrowRight,
  TreePine,
  Tag,
  Car,
  Smartphone,
  Laptop,
  Calendar,
  Gauge,
  Fuel,
  Palette,
  Maximize2,
  Sofa,
  Star,
  MapPin,
  DollarSign,
  CircleDollarSign,
  Ruler,
  ParkingSquare,
  Settings,
  Hash,
  ToggleLeft,
  Type,
  Blinds,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getCategories } from "../api/categories";
import { createListing } from "../api/listings";
import Input from "../components/Input";
import LoadingOverlay from "../components/LoadingOverlay";

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
  area: { label: "Area (m²)", icon: Ruler, type: "number" },
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
  plotSize: { label: "Plot Size (m²)", icon: Ruler, type: "number" },
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
    label: fieldName.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    icon: Tag,
    type: ruleType || "string",
  };
}

function WizardProgress({ currentStep, colors }) {
  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Category Details" },
    { num: 3, label: "Media & Submit" },
  ];

  return (
    <View style={{ paddingHorizontal: 4, marginBottom: 24 }}>
      <View className="flex-row items-center justify-between mb-2">
        {steps.map((s, i) => {
          const isActive = s.num === currentStep;
          const isDone = s.num < currentStep;
          const isLast = i === steps.length - 1;
          return (
            <React.Fragment key={s.num}>
              <View className="items-center" style={{ flex: 1 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: isActive
                      ? colors.primary
                      : isDone
                        ? `${colors.primary}48`
                        : `${colors.textMuted}18`,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: isActive
                      ? colors.primary
                      : isDone
                        ? `${colors.primary}64`
                        : `${colors.textMuted}28`,
                  }}
                >
                  {isDone ? (
                    <Check size={13} color={colors.primaryText} />
                  ) : (
                    <Text
                      style={{
                        color: isActive ? colors.primaryText : `${colors.textMuted}80`,
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {s.num}
                    </Text>
                  )}
                </View>
                <Text
                  style={{
                    color: isActive ? colors.primary : `${colors.textMuted}60`,
                    fontSize: 9,
                    fontWeight: isActive ? "600" : "400",
                    marginTop: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  {s.label}
                </Text>
              </View>
              {!isLast && (
                <View
                  style={{
                    flex: 0.8,
                    height: 1.5,
                    backgroundColor: isDone
                      ? `${colors.primary}48`
                      : `${colors.textMuted}18`,
                    marginBottom: 18,
                    marginHorizontal: 4,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

function GadaaPatternBar({ colors }) {
  const tiles = Array.from({ length: 18 });
  const CREAM = "#f5e6d0";

  return (
    <View
      style={{
        flexDirection: "row",
        height: 24,
        borderRadius: 6,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {tiles.map((_, i) => {
        const colorSet = i % 3 === 0 ? colors.card : i % 3 === 1 ? colors.primary : CREAM;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: colorSet,
              opacity: i % 2 === 0 ? 1 : 0.7,
              borderRightWidth: 0.5,
              borderRightColor: `${colors.text}20`,
            }}
          />
        );
      })}
    </View>
  );
}

function CategoryDropdown({ categories, value, onSelect, colors }) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value);

  return (
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.input,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: value ? colors.primary : colors.inputBorder,
          paddingHorizontal: 16,
          height: 52,
        }}
        activeOpacity={0.7}
      >
        <Home size={18} color={value ? colors.primary : colors.textMuted} style={{ marginRight: 12 }} />
        <Text
          style={{
            flex: 1,
            color: value ? colors.text : colors.textMuted,
            fontSize: 14,
            fontWeight: "500",
          }}
        >
          {selected ? selected.displayName : "Select Category"}
        </Text>
        <ChevronDown size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {open && (
        <View
          style={{
            marginTop: 4,
            backgroundColor: colors.bgSecondary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => {
                onSelect(cat.id);
                setOpen(false);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: value === cat.id ? `${colors.primary}18` : "transparent",
              }}
            >
              <Text
                style={{
                  color: value === cat.id ? colors.primary : colors.text,
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                {cat.displayName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function ListingTypeSelector({ value, onChange, colors }) {
  const options = [
    { key: "SELL", label: "Sell", icon: CircleDollarSign },
    { key: "RENT", label: "Rent", icon: Calendar },
  ];

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 8 }}>
        Listing Type
      </Text>
      <View className="flex-row gap-3">
        {options.map((opt) => {
          const isSelected = value === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => onChange(opt.key)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 1.5,
                backgroundColor: isSelected ? `${colors.primary}18` : colors.input,
                borderColor: isSelected ? colors.primary : colors.inputBorder,
              }}
            >
              <opt.icon size={16} color={isSelected ? colors.primary : colors.textMuted} style={{ marginRight: 6 }} />
              <Text
                style={{
                  color: isSelected ? colors.primary : colors.textMuted,
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
  );
}

function DynamicField({ rule, value, onChange, colors, error }) {
  const meta = getFieldMeta(rule.field, rule.type);
  const Icon = meta.icon;
  const isBoolean = rule.type === "boolean";
  const isNumber = rule.type === "number";

  if (isBoolean) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.input,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: error ? colors.danger : colors.inputBorder,
          paddingHorizontal: 16,
          height: 52,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon size={18} color={colors.textMuted} style={{ marginRight: 12 }} />
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}>
            {meta.label}
          </Text>
        </View>
        <Switch
          value={!!value}
          onValueChange={(v) => onChange(rule.field, v)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.primaryText}
        />
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 12 }}>
      <TextInput
        value={value || ""}
        onChangeText={(v) => onChange(rule.field, v)}
        placeholder={`${meta.label}${rule.required ? " *" : ""}`}
        placeholderTextColor={colors.textMuted}
        keyboardType={isNumber ? "numeric" : "default"}
        style={{
          backgroundColor: colors.input,
          borderWidth: 1.5,
          borderColor: error ? colors.danger : colors.inputBorder,
          borderRadius: 12,
          paddingHorizontal: 16,
          height: 52,
          color: colors.text,
          fontSize: 14,
          fontWeight: "500",
        }}
      />
      {error && (
        <Text style={{ color: colors.danger, fontSize: 10, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

export default function AddListingScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    neighborhood: "",
    categoryId: "",
    images: [],
  });

  const [dynamicFields, setDynamicFields] = useState({
    listingType: "SELL",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await getCategories();
      setCategories(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const updateDynamic = (field, value) => {
    setDynamicFields((prev) => ({ ...prev, [field]: value }));
    if (errors[`attr_${field}`]) {
      setErrors((prev) => ({ ...prev, [`attr_${field}`]: null }));
    }
  };

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const schemaRules = useMemo(() => {
    if (!selectedCategory?.schemaRules) return [];
    if (Array.isArray(selectedCategory.schemaRules)) return selectedCategory.schemaRules;
    return [];
  }, [selectedCategory]);

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!form.title.trim()) newErrors.title = t("requiredField");
      if (!form.description.trim()) newErrors.description = t("requiredField");
      if (!form.price.trim()) newErrors.price = t("requiredField");
      else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)
        newErrors.price = "Invalid price";
      if (!form.categoryId) newErrors.categoryId = t("requiredField");
    }

    if (step === 2) {
      if (!form.city) newErrors.city = t("requiredField");
      if (!form.neighborhood.trim()) newErrors.neighborhood = t("requiredField");

      for (const rule of schemaRules) {
        if (rule.required) {
          const val = dynamicFields[rule.field];
          if (val === undefined || val === null || val === "") {
            newErrors[`attr_${rule.field}`] = `${getFieldMeta(rule.field, rule.type).label} is required`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 5 - form.images.length,
      quality: 0.8,
    });
    if (!result.canceled) {
      updateForm("images", [...form.images, ...result.assets]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Camera permission is required");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      updateForm("images", [...form.images, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    updateForm("images", form.images.filter((_, i) => i !== index));
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("price", parseFloat(form.price));
    formData.append("city", form.city);
    formData.append("neighborhood", form.neighborhood.trim());
    formData.append("categoryId", form.categoryId);
    formData.append("agentId", user.id);
    formData.append("status", "AVAILABLE");

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

    if (Object.keys(attributes).length > 0) {
      formData.append("attributes", JSON.stringify(attributes));
    }

    form.images.forEach((img, index) => {
      const ext = img.uri.split(".").pop() || "jpg";
      const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
      formData.append("images", {
        uri: img.uri,
        type: mimeType,
        name: `image_${index}.${ext}`,
      });
    });

    return formData;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const formData = buildFormData();
      await createListing(formData);
      Alert.alert(t("success"), t("listingCreated"), [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.message ||
        t("listingError");
      Alert.alert(t("error"), msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 16,
        }}
      >
        Basic Information
      </Text>

      <Input
        value={form.title}
        onChangeText={(v) => updateForm("title", v)}
        placeholder="Property title"
        icon={Mail}
        error={errors.title}
        required
      />
      <Input
        value={form.description}
        onChangeText={(v) => updateForm("description", v)}
        placeholder="Describe the property..."
        icon={Lock}
        multiline
        numberOfLines={3}
        error={errors.description}
        required
      />
      <Input
        value={form.price}
        onChangeText={(v) => updateForm("price", v)}
        placeholder="Price (ETB)"
        icon={DollarSign}
        keyboardType="numeric"
        error={errors.price}
        required
      />

      <CategoryDropdown
        categories={categories}
        value={form.categoryId}
        onSelect={(id) => {
          updateForm("categoryId", id);
          setDynamicFields({ listingType: dynamicFields.listingType });
        }}
        colors={colors}
      />
      {errors.categoryId && (
        <Text style={{ color: colors.danger, fontSize: 11, marginTop: -12, marginBottom: 12 }}>
          {errors.categoryId}
        </Text>
      )}

      <ListingTypeSelector
        value={dynamicFields.listingType || "SELL"}
        onChange={(v) => updateDynamic("listingType", v)}
        colors={colors}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 16,
        }}
      >
        Location & Category Details
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 8 }}>
          City
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city}
              onPress={() => updateForm("city", city)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: form.city === city ? colors.primary : colors.input,
                borderWidth: 1,
                borderColor: form.city === city ? colors.primary : colors.inputBorder,
              }}
            >
              <Text
                style={{
                  color: form.city === city ? colors.primaryText : colors.text,
                  fontSize: 12,
                  fontWeight: "500",
                }}
              >
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.city && (
          <Text style={{ color: colors.danger, fontSize: 10, marginTop: 4 }}>{errors.city}</Text>
        )}
      </View>

      <Input
        value={form.neighborhood}
        onChangeText={(v) => updateForm("neighborhood", v)}
        placeholder="Neighborhood (e.g. Bole)"
        icon={MapPin}
        error={errors.neighborhood}
        required
      />

      {schemaRules.length > 0 && (
        <View
          style={{
            marginTop: 8,
            backgroundColor: `${colors.primary}06`,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: `${colors.primary}18`,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 10,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            {selectedCategory?.displayName || "Category"} Details
          </Text>

          {schemaRules.map((rule) => (
            <DynamicField
              key={rule.field}
              rule={rule}
              value={dynamicFields[rule.field]}
              onChange={updateDynamic}
              colors={colors}
              error={errors[`attr_${rule.field}`]}
            />
          ))}
        </View>
      )}
    </>
  );

  const renderStep3 = () => (
    <>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 16,
        }}
      >
        Property Media
      </Text>

      <View style={{ marginBottom: 24 }}>
        <TouchableOpacity
          onPress={pickImages}
          activeOpacity={0.7}
          style={{
            borderWidth: 1.5,
            borderColor: `${colors.primary}30`,
            borderStyle: "dashed",
            borderRadius: 14,
            padding: 24,
            alignItems: "center",
            backgroundColor: `${colors.primary}06`,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: `${colors.primary}18`,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
              borderWidth: 1,
              borderColor: `${colors.primary}24`,
            }}
          >
            <Plus size={22} color={colors.primary} />
          </View>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
            Media Upload
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>
            (up to 5 photos)
          </Text>
        </TouchableOpacity>

        <View className="flex-row gap-3">
          {[0, 1, 2].map((idx) => {
            const img = form.images[idx];
            return (
              <View key={idx} style={{ flex: 1, alignItems: "center" }}>
                {img ? (
                  <View style={{ position: "relative" }}>
                    <Image
                      source={{ uri: img.uri }}
                      style={{ width: 72, height: 72, borderRadius: 36 }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(idx)}
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: colors.danger,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1.5,
                        borderColor: colors.bg,
                      }}
                    >
                      <X size={10} color={colors.primaryText} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: colors.bgTertiary,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Camera size={16} color={colors.textMuted} />
                  </View>
                )}
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 8,
                    marginTop: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  {idx === 0 ? "Cover" : idx === 1 ? "Photo 2" : "Photo 3"}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Summary */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          Listing Summary
        </Text>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
          {form.title || "Untitled"}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
          {selectedCategory?.displayName || "—"} · {form.city || "—"} · {form.neighborhood || "—"}
        </Text>
        <View className="flex-row items-center mt-2">
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "700" }}>
            {form.price ? `${Number(form.price).toLocaleString()} ETB` : "—"}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 8 }}>
            {dynamicFields.listingType === "RENT" ? "/month" : ""}
          </Text>
        </View>
        <View className="flex-row gap-2 mt-2 flex-wrap">
          {Object.entries(dynamicFields).map(([key, val]) => {
            if (key === "listingType" || val === undefined || val === null || val === "") return null;
            const meta = getFieldMeta(key);
            return (
              <View
                key={key}
                style={{
                  backgroundColor: `${colors.primary}12`,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>
                  {meta.label}: {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <GadaaPatternBar colors={colors} />
        <View
          style={{
            backgroundColor: `${colors.text}04`,
            padding: 12,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 8,
              textTransform: "uppercase",
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
            Gadaa · Oromoo Heritage · Black · Red · White
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        activeOpacity={0.85}
        disabled={submitting}
        style={{
          backgroundColor: colors.primary,
          borderRadius: 28,
          height: 54,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 8,
          borderWidth: 1,
          borderColor: `${colors.primaryText}18`,
          opacity: submitting ? 0.6 : 1,
        }}
      >
        <Text
          style={{
            color: colors.primaryText,
            fontSize: 15,
            fontWeight: "700",
            letterSpacing: 0.3,
            marginRight: 10,
          }}
        >
          Submit &amp; Syndicate to Telegram
        </Text>
        <ArrowRight size={18} color={colors.primaryText} />
      </TouchableOpacity>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <LinearGradient
          colors={[`${colors.primary}08`, "transparent"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200 }}
        />

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center mb-4">
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: `${colors.primary}18`,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
                borderWidth: 1,
                borderColor: `${colors.primary}30`,
              }}
            >
              <TreePine size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700", letterSpacing: -0.2 }}>
                Add New Property
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                Odaa Realty · Listing Portal
              </Text>
            </View>
          </View>

          <WizardProgress currentStep={step} colors={colors} />

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: colors.bgSecondary,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {step > 1 && (
            <TouchableOpacity
              onPress={prevStep}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 10,
                backgroundColor: colors.bgTertiary,
                borderWidth: 1,
                borderColor: colors.border,
                marginRight: 12,
              }}
            >
              <ChevronLeft size={16} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600", marginLeft: 4 }}>
                Back
              </Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {step < 3 ? (
            <TouchableOpacity
              onPress={nextStep}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: colors.primaryText, fontSize: 13, fontWeight: "700", marginRight: 6 }}>
                Next
              </Text>
              <ChevronRight size={16} color={colors.primaryText} />
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>

      <LoadingOverlay visible={submitting} message={t("creatingListing")} />
    </View>
  );
}
