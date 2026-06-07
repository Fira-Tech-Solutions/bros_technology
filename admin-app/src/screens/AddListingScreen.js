import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  X,
  Check,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getCategories } from "../api/categories";
import { createListing } from "../api/listings";
import Button from "../components/Button";
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
    categoryName: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    images: [],
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

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const showBedroomFields =
    selectedCategory &&
    (selectedCategory.name === "REAL_ESTATE" ||
      selectedCategory.displayName?.toLowerCase().includes("real"));

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!form.title.trim()) newErrors.title = t("requiredField");
      if (!form.description.trim()) newErrors.description = t("requiredField");
      if (!form.price.trim()) newErrors.price = t("requiredField");
      else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
        newErrors.price = "Invalid price";
      }
      if (!form.categoryId) newErrors.categoryId = t("requiredField");
    }

    if (step === 2) {
      if (!form.city) newErrors.city = t("requiredField");
      if (!form.neighborhood.trim()) newErrors.neighborhood = t("requiredField");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10 - form.images.length,
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

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      updateForm("images", [...form.images, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    updateForm("images", newImages);
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

    const attributes = {};
    if (showBedroomFields) {
      if (form.bedrooms) attributes.bedrooms = parseInt(form.bedrooms, 10);
      if (form.bathrooms) attributes.bathrooms = parseInt(form.bathrooms, 10);
    }
    if (form.area) attributes.area = parseFloat(form.area);
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

  const renderStepIndicator = () => {
    const steps = [t("stepOne"), t("stepTwo"), t("stepThree")];
    return (
      <View className="flex-row justify-between px-5 mb-6">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;
          return (
            <View key={stepNum} className="flex-1 items-center">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mb-1"
                style={{
                  backgroundColor: isActive
                    ? colors.primary
                    : isCompleted
                      ? colors.success
                      : colors.bgTertiary,
                }}
              >
                {isCompleted ? (
                  <Check size={14} color="#ffffff" />
                ) : (
                  <Text
                    style={{
                      color: isActive ? "#ffffff" : colors.textMuted,
                    }}
                    className="text-sm font-bold"
                  >
                    {stepNum}
                  </Text>
                )}
              </View>
              <Text
                style={{
                  color: isActive ? colors.primary : colors.textMuted,
                  fontSize: 10,
                }}
                className="text-center"
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderStep1 = () => (
    <View>
      <Input
        label={t("title")}
        value={form.title}
        onChangeText={(v) => updateForm("title", v)}
        placeholder="Beautiful apartment in Bole"
        error={errors.title}
        required
      />
      <Input
        label={t("description")}
        value={form.description}
        onChangeText={(v) => updateForm("description", v)}
        placeholder="Describe the property..."
        multiline
        numberOfLines={4}
        error={errors.description}
        required
      />
      <Input
        label={t("price")}
        value={form.price}
        onChangeText={(v) => updateForm("price", v)}
        placeholder="25000"
        keyboardType="numeric"
        error={errors.price}
        required
      />

      <Text
        style={{ color: colors.textSecondary }}
        className="text-sm font-medium mb-2"
      >
        {t("category")} <Text className="text-red-500">*</Text>
      </Text>
      <View className="flex-row flex-wrap mb-4">
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => updateForm("categoryId", cat.id)}
            className="mr-2 mb-2 px-3 py-2 rounded-xl"
            style={{
              backgroundColor:
                form.categoryId === cat.id ? colors.primary : colors.bgTertiary,
              borderWidth: 1,
              borderColor:
                form.categoryId === cat.id ? colors.primary : colors.border,
            }}
          >
            <Text
              style={{
                color:
                  form.categoryId === cat.id ? "#ffffff" : colors.text,
              }}
              className="text-sm font-medium"
            >
              {cat.displayName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.categoryId && (
        <Text style={{ color: colors.danger }} className="text-xs -mt-2 mb-3">
          {errors.categoryId}
        </Text>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text
        style={{ color: colors.textSecondary }}
        className="text-sm font-medium mb-2"
      >
        {t("city")} <Text className="text-red-500">*</Text>
      </Text>
      <View className="flex-row flex-wrap mb-4">
        {CITIES.map((city) => (
          <TouchableOpacity
            key={city}
            onPress={() => updateForm("city", city)}
            className="mr-2 mb-2 px-3 py-2 rounded-xl"
            style={{
              backgroundColor:
                form.city === city ? colors.primary : colors.bgTertiary,
              borderWidth: 1,
              borderColor:
                form.city === city ? colors.primary : colors.border,
            }}
          >
            <Text
              style={{
                color: form.city === city ? "#ffffff" : colors.text,
              }}
              className="text-sm"
            >
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.city && (
        <Text style={{ color: colors.danger }} className="text-xs -mt-3 mb-3">
          {errors.city}
        </Text>
      )}

      <Input
        label={t("neighborhood")}
        value={form.neighborhood}
        onChangeText={(v) => updateForm("neighborhood", v)}
        placeholder="Bole, Kirkos, etc."
        error={errors.neighborhood}
        required
      />

      {showBedroomFields && (
        <>
          <Input
            label={t("bedrooms")}
            value={form.bedrooms}
            onChangeText={(v) => updateForm("bedrooms", v)}
            placeholder="3"
            keyboardType="numeric"
          />
          <Input
            label={t("bathrooms")}
            value={form.bathrooms}
            onChangeText={(v) => updateForm("bathrooms", v)}
            placeholder="2"
            keyboardType="numeric"
          />
        </>
      )}

      <Input
        label={t("area")}
        value={form.area}
        onChangeText={(v) => updateForm("area", v)}
        placeholder="150"
        keyboardType="numeric"
      />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text
        style={{ color: colors.textSecondary }}
        className="text-base mb-4"
      >
        {t("selectImages")} ({form.images.length}/10)
      </Text>

      <View className="flex-row mb-4">
        <TouchableOpacity
          onPress={pickImages}
          className="flex-1 mr-2 py-4 rounded-xl items-center"
          style={{
            backgroundColor: colors.bgTertiary,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: "dashed",
          }}
        >
          <Camera size={24} color={colors.primary} />
          <Text
            style={{ color: colors.text }}
            className="text-sm font-medium mt-2"
          >
            {t("selectImages")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takePhoto}
          className="flex-1 ml-2 py-4 rounded-xl items-center"
          style={{
            backgroundColor: colors.bgTertiary,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: "dashed",
          }}
        >
          <Camera size={24} color={colors.primary} />
          <Text
            style={{ color: colors.text }}
            className="text-sm font-medium mt-2"
          >
            Take Photo
          </Text>
        </TouchableOpacity>
      </View>

      {form.images.length > 0 && (
        <View className="flex-row flex-wrap">
          {form.images.map((img, index) => (
            <View key={index} className="relative mr-2 mb-2">
              <Image
                source={{ uri: img.uri }}
                className="w-24 h-24 rounded-xl"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => removeImage(index)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.danger }}
              >
                <X size={10} color="#ffffff" />
              </TouchableOpacity>
              {index === 0 && (
                <View
                  className="absolute bottom-0 left-0 right-0 py-0.5 rounded-b-xl items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text style={{ color: "#ffffff" }} className="text-xs font-medium">
                    Cover
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepIndicator()}
          {renderCurrentStep()}
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 px-5 py-4"
          style={{
            backgroundColor: colors.bgSecondary,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View className="flex-row">
            {step > 1 && (
              <TouchableOpacity
                onPress={prevStep}
                className="flex-row items-center py-3 px-5 rounded-xl mr-3"
                style={{
                  backgroundColor: colors.bgTertiary,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <ChevronLeft size={18} color={colors.text} />
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-semibold ml-1"
                >
                  {t("previous")}
                </Text>
              </TouchableOpacity>
            )}
            <View className="flex-1">
              {step < 3 ? (
                <Button
                  title={t("next")}
                  onPress={nextStep}
                  icon={ChevronRight}
                  size="lg"
                />
              ) : (
                <Button
                  title={t("submit")}
                  onPress={handleSubmit}
                  loading={submitting}
                  icon={Check}
                  size="lg"
                />
              )}
            </View>
          </View>
        </View>
      </View>

      <LoadingOverlay
        visible={submitting}
        message={t("creatingListing")}
      />
    </SafeAreaView>
  );
}
