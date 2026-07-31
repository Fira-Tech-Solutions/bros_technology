import React, { useState, useMemo, useCallback } from "react";
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
  Pressable,
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
  Tag,
  Smartphone,
  Laptop,
  Calendar,
  Palette,
  Star,
  DollarSign,
  Hash,
  Search,
  GripVertical,
  Crop,
  ChevronDown,
  Plus,
  ArrowRight,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getCategories } from "../api/categories";
import { createListing } from "../api/listings";
import Input from "../components/Input";
import LoadingOverlay from "../components/LoadingOverlay";
import useSuspenseCache from "../hooks/useSuspenseCache";
import { PRODUCT_OPTIONS } from "../config/productOptions";

const FIELD_ICONS = {
  brand: Smartphone,
  model: Tag,
  storage: Hash,
  ram: Hash,
  color: Palette,
  condition: Star,
  year: Calendar,
  price: DollarSign,
  processor: Laptop,
  gpu: Hash,
  screenSize: Hash,
  os: Hash,
  batteryHealth: Hash,
  carrier: Tag,
  hasWarranty: Check,
  hasAppleCare: Check,
  connectivity: Tag,
  caseSize: Hash,
  storageType: Hash,
  default: Tag,
};

function getFieldIcon(fieldName) {
  return FIELD_ICONS[fieldName] || FIELD_ICONS.default;
}

function getFieldLabel(fieldName) {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function WizardProgress({ currentStep, colors }) {
  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Details" },
    { num: 3, label: "Media" },
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

function CategoryDropdown({ categories, value, onSelect, colors }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = categories.find((c) => c.id === value);
  const filtered = categories.filter((c) =>
    c.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const ICON_MAP = {
    smartphone: Smartphone,
    laptop: Laptop,
    headphones: Tag,
    watch: Tag,
    tablet: Tag,
  };

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
        {(() => {
          const Icon = ICON_MAP[selected?.icon] || Tag;
          return <Icon size={18} color={value ? colors.primary : colors.textMuted} style={{ marginRight: 12 }} />;
        })()}
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              height: 40,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.input,
            }}
          >
            <Search size={14} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search..."
              placeholderTextColor={colors.textMuted}
              style={{
                flex: 1,
                marginLeft: 8,
                color: colors.text,
                fontSize: 13,
                padding: 0,
              }}
              autoCapitalize="none"
            />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }} nestedScrollEnabled>
            {filtered.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  onSelect(cat.id);
                  setOpen(false);
                  setSearch("");
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  backgroundColor: value === cat.id ? `${colors.primary}18` : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {(() => {
                  const Icon = ICON_MAP[cat.icon] || Tag;
                  return <Icon size={16} color={value === cat.id ? colors.primary : colors.textMuted} style={{ marginRight: 10 }} />;
                })()}
                <Text
                  style={{
                    flex: 1,
                    color: value === cat.id ? colors.primary : colors.text,
                    fontSize: 13,
                    fontWeight: value === cat.id ? "600" : "400",
                  }}
                >
                  {cat.displayName}
                </Text>
                {value === cat.id && <Check size={14} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            {filtered.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>No categories found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function getPredefinedOptions(fieldName, categoryName, dynamicFields) {
  const catOptions = PRODUCT_OPTIONS[categoryName];
  if (!catOptions || !catOptions[fieldName]) return null;

  const opts = catOptions[fieldName];

  if (typeof opts === 'object' && !Array.isArray(opts)) {
    if (fieldName === 'model' && dynamicFields.brand) {
      return opts[dynamicFields.brand] || [];
    }
    return null;
  }

  return Array.isArray(opts) ? opts : null;
}

function SchemaField({ rule, value, onChange, colors, error, categoryName, dynamicFields }) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const Icon = getFieldIcon(rule.field);
  const isBoolean = rule.type === "boolean";
  const isNumber = rule.type === "number";

  let options = rule.options || [];
  const predefined = getPredefinedOptions(rule.field, categoryName, dynamicFields);
  if (predefined && predefined.length > 0) {
    options = [...new Set([...predefined, ...options])];
  }
  const hasPredefined = options.length > 0;
  const hasOther = hasPredefined && !isBoolean;
  const isSelect = isBoolean || hasPredefined;

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
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon size={18} color={colors.textMuted} style={{ marginRight: 12 }} />
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}>
            {getFieldLabel(rule.field)}
          </Text>
          {rule.required && <Text style={{ color: colors.danger, fontSize: 12, marginLeft: 4 }}>*</Text>}
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

  if (customMode) {
    return (
      <View style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ flex: 1, position: "relative" }}>
            <TextInput
              value={customValue}
              onChangeText={setCustomValue}
              placeholder={`Enter custom ${getFieldLabel(rule.field).toLowerCase()}`}
              placeholderTextColor={colors.textMuted}
              autoFocus
              style={{
                backgroundColor: colors.input,
                borderWidth: 1.5,
                borderColor: error ? colors.danger : colors.inputBorder,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingLeft: 42,
                height: 52,
                color: colors.text,
                fontSize: 14,
                fontWeight: "500",
              }}
            />
            <View style={{ position: "absolute", left: 16, top: 17 }}>
              <Icon size={18} color={colors.primary} />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (customValue.trim()) {
                onChange(rule.field, customValue.trim());
                setCustomMode(false);
                setCustomValue('');
              }
            }}
            style={{
              height: 52,
              paddingHorizontal: 16,
              backgroundColor: colors.primary,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={18} color={colors.primaryText} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setCustomMode(false);
              setCustomValue('');
            }}
            style={{
              height: 52,
              paddingHorizontal: 12,
              backgroundColor: colors.bgTertiary,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        {error && <Text style={{ color: colors.danger, fontSize: 10, marginTop: 2 }}>{error}</Text>}
      </View>
    );
  }

  if (isSelect) {
    return (
      <View style={{ marginBottom: 10 }}>
        <TouchableOpacity
          onPress={() => setOpen(!open)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.input,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: error ? colors.danger : colors.inputBorder,
            paddingHorizontal: 16,
            height: 52,
          }}
          activeOpacity={0.7}
        >
          <Icon size={18} color={value ? colors.primary : colors.textMuted} style={{ marginRight: 12 }} />
          <Text style={{ flex: 1, color: value ? colors.text : colors.textMuted, fontSize: 14, fontWeight: "500" }}>
            {value || `${getFieldLabel(rule.field)}${rule.required ? " *" : ""}`}
          </Text>
          <ChevronDown size={16} color={colors.textMuted} />
        </TouchableOpacity>
        {open && (
          <View
            style={{
              marginTop: 2,
              backgroundColor: colors.card,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
              maxHeight: 220,
            }}
          >
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    setOpen(false);
                    onChange(rule.field, opt);
                  }}
                  style={{
                    paddingHorizontal: 16,
                    height: 42,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: value === opt ? `${colors.primary}10` : "transparent",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      color: value === opt ? colors.primary : colors.text,
                      fontSize: 13,
                      fontWeight: value === opt ? "600" : "400",
                    }}
                  >
                    {opt}
                  </Text>
                  {value === opt && <Check size={14} color={colors.primary} />}
                </TouchableOpacity>
              ))}
              {hasOther && (
                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                    setCustomMode(true);
                  }}
                  style={{
                    paddingHorizontal: 16,
                    height: 42,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: `${colors.primary}08`,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Plus size={14} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>
                    Other (type custom)
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}
        {error && <Text style={{ color: colors.danger, fontSize: 10, marginTop: 2 }}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ position: "relative" }}>
        <TextInput
          value={value || ""}
          onChangeText={(v) => onChange(rule.field, v)}
          placeholder={`${getFieldLabel(rule.field)}${rule.required ? " *" : ""}`}
          placeholderTextColor={colors.textMuted}
          keyboardType={isNumber ? "numeric" : "default"}
          style={{
            backgroundColor: colors.input,
            borderWidth: 1.5,
            borderColor: error ? colors.danger : colors.inputBorder,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingLeft: 42,
            height: 52,
            color: colors.text,
            fontSize: 14,
            fontWeight: "500",
          }}
        />
        <View style={{ position: "absolute", left: 16, top: 17 }}>
          <Icon size={18} color={value ? colors.primary : colors.textMuted} />
        </View>
      </View>
      {error && <Text style={{ color: colors.danger, fontSize: 10, marginTop: 2 }}>{error}</Text>}
    </View>
  );
}

export default function AddListingScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const { data: categories } = useSuspenseCache({
    key: "add_listing_categories",
    fetcher: async (force) => {
      const { data } = await getCategories(force);
      return data.data || [];
    },
    initial: [],
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    categoryId: "",
    images: [],
  });

  const [dynamicFields, setDynamicFields] = useState({});
  const [errors, setErrors] = useState({});

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const updateDynamic = (field, value) => {
    setDynamicFields((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'brand') {
        next.model = '';
      }
      return next;
    });
    if (errors[`attr_${field}`]) setErrors((prev) => ({ ...prev, [`attr_${field}`]: null }));
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
      if (!form.price.trim()) newErrors.price = t("requiredField");
      else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) newErrors.price = "Invalid price";
      if (!form.categoryId) newErrors.categoryId = t("requiredField");
    }
    if (step === 2) {
      for (const rule of schemaRules) {
        if (rule.required) {
          const val = dynamicFields[rule.field];
          if (val === undefined || val === null || val === "") {
            newErrors[`attr_${rule.field}`] = `${getFieldLabel(rule.field)} is required`;
          }
        }
      }
    }
    if (step === 3) {
      if (form.images.length === 0) newErrors.images = "At least one image is required";
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
      selectionLimit: 10 - form.images.length,
      quality: 1,
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
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      updateForm("images", [...form.images, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    updateForm("images", form.images.filter((_, i) => i !== index));
  };

  const moveImage = useCallback(
    (fromIndex, toIndex) => {
      if (toIndex < 0 || toIndex >= form.images.length) return;
      const imgs = [...form.images];
      const [moved] = imgs.splice(fromIndex, 1);
      imgs.splice(toIndex, 0, moved);
      updateForm("images", imgs);
    },
    [form.images]
  );

  const [dragIndex, setDragIndex] = useState(null);

  const handleLongPress = (index) => {
    setDragIndex(index);
  };

  const handlePress = (index) => {
    if (dragIndex !== null && dragIndex !== index) {
      moveImage(dragIndex, index);
      setDragIndex(null);
    }
  };

  const cropImage = async (img, index) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const newImages = [...form.images];
      newImages[index] = result.assets[0];
      updateForm("images", newImages);
    }
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("price", parseFloat(form.price));
    formData.append("city", "Addis Ababa");
    formData.append("neighborhood", "Addis Ababa");
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
        placeholder="Product title"
        icon={Tag}
        error={errors.title}
        required
      />
      <Input
        value={form.description}
        onChangeText={(v) => updateForm("description", v)}
        placeholder="Describe the product (optional)"
        icon={Tag}
        multiline
        numberOfLines={3}
        error={errors.description}
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
          setDynamicFields({});
        }}
        colors={colors}
      />
      {errors.categoryId && (
        <Text style={{ color: colors.danger, fontSize: 11, marginTop: -12, marginBottom: 12 }}>
          {errors.categoryId}
        </Text>
      )}
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
        {selectedCategory?.displayName || "Category"} Details
      </Text>

      {schemaRules.length > 0 ? (
        <View
          style={{
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
            Specifications
          </Text>
          {schemaRules.map((rule) => (
            <SchemaField
              key={rule.field}
              rule={rule}
              value={dynamicFields[rule.field]}
              onChange={updateDynamic}
              colors={colors}
              error={errors[`attr_${rule.field}`]}
              categoryName={selectedCategory?.name}
              dynamicFields={dynamicFields}
            />
          ))}
        </View>
      ) : (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center" }}>
            No fields defined for this category.
          </Text>
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
        Product Photos
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
            Add Photos
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>
            Up to 10 photos. Hold & drag to reorder cover.
          </Text>
        </TouchableOpacity>

        {form.images.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {form.images.map((img, idx) => (
              <Pressable
                key={idx}
                onLongPress={() => handleLongPress(idx)}
                onPress={() => handlePress(idx)}
                delayLongPress={200}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 2,
                  borderColor: dragIndex === idx ? colors.primary : idx === 0 ? colors.primary : colors.border,
                  opacity: dragIndex !== null && dragIndex !== idx ? 0.6 : 1,
                }}
              >
                <Image source={{ uri: img.uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />

                {/* Cover badge */}
                {idx === 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      backgroundColor: colors.primary,
                      borderRadius: 6,
                      paddingHorizontal: 5,
                      paddingVertical: 1,
                    }}
                  >
                    <Text style={{ color: colors.primaryText, fontSize: 8, fontWeight: "700" }}>COVER</Text>
                  </View>
                )}

                {/* Actions */}
                <View style={{ position: "absolute", bottom: 4, right: 4, flexDirection: "row", gap: 3 }}>
                  <TouchableOpacity
                    onPress={() => cropImage(img, idx)}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Crop size={10} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeImage(idx)}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: colors.danger,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={10} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Drag handle */}
                <View
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    borderRadius: 4,
                    padding: 2,
                  }}
                >
                  <GripVertical size={10} color="#fff" />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {errors.images && (
          <Text style={{ color: colors.danger, fontSize: 11, marginTop: 8 }}>{errors.images}</Text>
        )}
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
          {selectedCategory?.displayName || "—"}
        </Text>
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "700", marginTop: 4 }}>
          {form.price ? `${Number(form.price).toLocaleString()} ETB` : "—"}
        </Text>
        <View className="flex-row gap-2 mt-2 flex-wrap">
          {Object.entries(dynamicFields).map(([key, val]) => {
            if (val === undefined || val === null || val === "") return null;
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
                  {getFieldLabel(key)}: {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                </Text>
              </View>
            );
          })}
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
          {submitting ? "Creating..." : "Create Listing"}
        </Text>
        {!submitting && <ArrowRight size={18} color={colors.primaryText} />}
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
              <Smartphone size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700", letterSpacing: -0.2 }}>
                Add New Listing
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                BROS Technology
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
