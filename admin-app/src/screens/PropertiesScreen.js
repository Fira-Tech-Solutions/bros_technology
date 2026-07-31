import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  X,
  Tag,
  Smartphone,
  Laptop,
  Pencil,
  Trash2,
  CircleCheck,
  CircleDollarSign,
  Clock,
  Search,
  Headphones,
  Watch,
  Monitor,
  ChevronDown,
  Handshake,
  PackageX,
  ChevronRight,
  MapPin,
} from "lucide-react-native";

import CachedImage from "../components/CachedImage";
import useSuspenseCache from "../hooks/useSuspenseCache";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { getListings } from "../api/listings";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";
import Card from "../components/Card";
import { ListingCardSkeleton } from "../components/ShimmerLoader";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

const ICON_OPTIONS = [
  { name: "smartphone", Icon: Smartphone, label: "Phone" },
  { name: "laptop", Icon: Laptop, label: "Laptop" },
  { name: "headphones", Icon: Headphones, label: "Audio" },
  { name: "watch", Icon: Watch, label: "Watch" },
  { name: "tablet", Icon: Monitor, label: "Tablet" },
];

function getIconComponent(iconName) {
  const found = ICON_OPTIONS.find((o) => o.name === iconName);
  return found ? found.Icon : Tag;
}

const STATUS_MAP = {
  AVAILABLE: { label: "Available", color: "#22c55e", Icon: CircleCheck },
  PENDING: { label: "Pending", color: "#eab308", Icon: Clock },
  SOLD: { label: "Sold", color: "#ef4444", Icon: CircleDollarSign },
  RENTED: { label: "Rented", color: "#6366f1", Icon: Handshake },
  RESERVED: { label: "Reserved", color: "#f97316", Icon: PackageX },
};

export default function PropertiesScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [tab, setTab] = useState("listings");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState("");
  const [catDisplayName, setCatDisplayName] = useState("");
  const [catIcon, setCatIcon] = useState("smartphone");
  const [savingCat, setSavingCat] = useState(false);
  const [catSchemaRules, setCatSchemaRules] = useState([]);
  const [newRuleField, setNewRuleField] = useState("");
  const [newRuleType, setNewRuleType] = useState("string");
  const [newRuleRequired, setNewRuleRequired] = useState(false);
  const [showRuleTypeDropdown, setShowRuleTypeDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: categories, refresh: refreshCategories } = useSuspenseCache({
    key: "properties_categories",
    fetcher: async (force) => {
      const { data } = await getCategories(force);
      return data.data || [];
    },
    initial: [],
  });

  const fetchListings = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        const { data } = await getListings({ page: pageNum, limit: 10 }, pageNum === 1);
        const items = data.data || [];
        const totalPages = data.pagination?.totalPages || 1;
        if (append) {
          setListings((prev) => [...prev, ...items]);
        } else {
          setListings(items);
        }
        setHasMore(pageNum < totalPages);
      } catch {
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    if (tab === "listings") fetchListings(1);
    else refreshCategories();
  };

  const loadMore = () => {
    if (!hasMore || loadingMore || tab !== "listings") return;
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchListings(nextPage, true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredListings = listings.filter((item) => {
    if (selectedCategory) {
      if (item.categoryId !== selectedCategory) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.city?.toLowerCase().includes(q) ||
      item.neighborhood?.toLowerCase().includes(q) ||
      item.category?.displayName?.toLowerCase().includes(q)
    );
  });

  const getImageUrl = (images) => {
    if (!images || images.length === 0) return null;
    const path = images[0];
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}/${path}`;
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDisplayName(cat.displayName);
    setCatIcon(cat.icon || "smartphone");
    setCatSchemaRules(Array.isArray(cat.schemaRules) ? cat.schemaRules : []);
    setShowAddCategory(true);
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatDisplayName("");
    setCatIcon("smartphone");
    setCatSchemaRules([]);
    setShowAddCategory(true);
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }
    if (!catDisplayName.trim()) {
      Alert.alert("Error", "Display name is required");
      return;
    }
    setSavingCat(true);
    try {
      const payload = {
        name: catName.trim(),
        displayName: catDisplayName.trim(),
        icon: catIcon,
        schemaRules: catSchemaRules,
      };
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }
      setCatName("");
      setCatDisplayName("");
      setCatIcon("smartphone");
      setEditingCategory(null);
      setShowAddCategory(false);
      refreshCategories();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        `Failed to ${editingCategory ? "update" : "create"} category`;
      Alert.alert("Error", msg);
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = (item) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${item.displayName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(item.id);
              setCategories((prev) => prev.filter((c) => c.id !== item.id));
            } catch (err) {
              const msg =
                err.response?.data?.error || "Failed to delete category";
              Alert.alert("Error", msg);
            }
          },
        },
      ]
    );
  };

  const renderListing = ({ item }) => {
    const imageUrl = getImageUrl(item.images);
    const status = item.status || "AVAILABLE";
    const statusCfg = STATUS_MAP[status] || {
      label: status,
      color: colors.textMuted,
      Icon: Tag,
    };
    const listingType = item.attributes?.listingType || "sell";

    return (
      <Card
        onPress={() =>
          navigation.navigate("ListingDetail", { listingId: item.id })
        }
        className="mb-3"
        padding={false}
      >
        <View className="flex-row">
          {imageUrl ? (
            <CachedImage
              uri={imageUrl}
              className="w-28 h-28 rounded-l-2xl"
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-28 h-28 rounded-l-2xl items-center justify-center"
              style={{ backgroundColor: colors.bgTertiary }}
            >
              <Text style={{ color: colors.textMuted }} className="text-xs">
                No Image
              </Text>
            </View>
          )}
          <View className="flex-1 p-3 justify-between">
            <View>
              <Text
                style={{ color: colors.text }}
                className="text-base font-semibold mb-1"
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View className="flex-row items-center mb-1">
                <MapPin size={12} color={colors.textMuted} />
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-xs ml-1"
                  numberOfLines={1}
                >
                  {item.neighborhood}, {item.city}
                </Text>
              </View>
              <View className="flex-row items-center">
                {item.category?.icon &&
                  React.createElement(getIconComponent(item.category.icon), {
                    size: 10,
                    color: colors.textMuted,
                  })}
                <Text
                  style={{ color: colors.textMuted }}
                  className="text-xs ml-1"
                >
                  {item.category?.displayName}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <Text
                style={{ color: colors.primary }}
                className="text-lg font-bold"
              >
                {formatPrice(item.price)}
                {listingType === "RENT" ? (
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                    {" "}
                    /mo
                  </Text>
                ) : null}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: `${statusCfg.color}18`,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 6,
                  }}
                >
                  <statusCfg.Icon size={10} color={statusCfg.color} />
                  <Text
                    style={{
                      color: statusCfg.color,
                      fontSize: 9,
                      fontWeight: "700",
                      marginLeft: 4,
                    }}
                  >
                    {statusCfg.label}
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </View>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderCategory = ({ item }) => {
    const IconComp = getIconComponent(item.icon);
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 14,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: `${colors.primary}15`,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <IconComp size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
            {item.displayName}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
            {item.listingCount || 0} properties · {item.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => openEditCategory(item)}
          style={{ padding: 6 }}
        >
          <Pencil size={16} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteCategory(item)}
          style={{ padding: 6, marginLeft: 4 }}
        >
          <Trash2 size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text style={{ color: colors.text }} className="text-2xl font-bold">
            {t("propertiesTitle")}
          </Text>
        </View>

        {/* Search Bar */}
        {tab === "listings" && (
          <View className="px-5 mb-2">
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.input,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.inputBorder,
                paddingHorizontal: 12,
                height: 44,
              }}
            >
              <Search size={16} color={colors.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search properties..."
                placeholderTextColor={colors.textMuted}
                style={{
                  flex: 1,
                  marginLeft: 8,
                  color: colors.text,
                  fontSize: 14,
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <X size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Category Filter Chips */}
        {tab === "listings" && categories.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            >
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor:
                    selectedCategory === null ? colors.primary : colors.bgTertiary,
                  borderWidth: 1,
                  borderColor:
                    selectedCategory === null ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color:
                      selectedCategory === null ? colors.primaryText : colors.textMuted,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(isActive ? null : cat.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 20,
                      backgroundColor: isActive ? colors.primary : colors.bgTertiary,
                      borderWidth: 1,
                      borderColor: isActive ? colors.primary : colors.border,
                    }}
                  >
                    {cat.icon &&
                      React.createElement(getIconComponent(cat.icon), {
                        size: 12,
                        color: isActive ? colors.primaryText : colors.textMuted,
                      })}
                    <Text
                      style={{
                        color: isActive ? colors.primaryText : colors.textMuted,
                        fontSize: 12,
                        fontWeight: "600",
                        marginLeft: cat.icon ? 5 : 0,
                      }}
                    >
                      {cat.displayName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Tab Bar */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 20,
            marginTop: 8,
            marginBottom: 4,
            backgroundColor: colors.bgTertiary,
            borderRadius: 10,
            padding: 3,
          }}
        >
          {[
            { key: "listings", label: "Listings" },
            { key: "categories", label: "Categories" },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => {
                setTab(item.key);
                setSearchQuery("");
                setSelectedCategory(null);
                if (item.key === "categories") refreshCategories();
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor:
                  tab === item.key ? colors.primary : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    tab === item.key ? colors.primaryText : colors.textMuted,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Listings Tab */}
        {tab === "listings" &&
          (loading ? (
            <View className="px-5 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <FlatList
              data={filteredListings}
              renderItem={renderListing}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                loadingMore ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View className="items-center mt-20">
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="text-base"
                  >
                    {searchQuery || selectedCategory
                      ? "No matching properties"
                      : t("noResults")}
                  </Text>
                </View>
              }
            />
          ))}

        {/* Categories Tab */}
        {tab === "categories" &&
          (loading ? (
            <View className="px-5 pt-4">
              {[1, 2, 3].map((i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View className="items-center mt-20">
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="text-base"
                  >
                    No categories yet
                  </Text>
                </View>
              }
            />
          ))}
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => {
          if (tab === "listings") navigation.navigate("AddListing");
          else openAddCategory();
        }}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={24} color={colors.primaryText} />
      </TouchableOpacity>

      {/* Add/Edit Category Modal */}
      <Modal
        visible={showAddCategory}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddCategory(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.bgSecondary,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: "85%",
            }}
          >
            <View className="flex-row items-center justify-between mb-5">
              <Text style={{ color: colors.text }} className="text-lg font-bold">
                {editingCategory ? "Edit Category" : "New Category"}
              </Text>
              <TouchableOpacity onPress={() => setShowAddCategory(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm font-medium mb-2"
              >
                Name
              </Text>
              <TextInput
                value={catName}
                onChangeText={setCatName}
                placeholder="e.g. REAL_ESTATE"
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.input,
                  borderWidth: 1,
                  borderColor: colors.inputBorder,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  height: 48,
                  color: colors.text,
                  fontSize: 14,
                  marginBottom: 16,
                }}
                autoCapitalize="characters"
              />

              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm font-medium mb-2"
              >
                Display Name
              </Text>
              <TextInput
                value={catDisplayName}
                onChangeText={setCatDisplayName}
                placeholder="e.g. Real Estate"
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.input,
                  borderWidth: 1,
                  borderColor: colors.inputBorder,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  height: 48,
                  color: colors.text,
                  fontSize: 14,
                  marginBottom: 16,
                }}
              />

              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm font-medium mb-2"
              >
                Icon
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                {ICON_OPTIONS.map((opt) => {
                  const isSelected = catIcon === opt.name;
                  return (
                    <TouchableOpacity
                      key={opt.name}
                      onPress={() => setCatIcon(opt.name)}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        backgroundColor: isSelected
                          ? `${colors.primary}20`
                          : colors.bgTertiary,
                        borderWidth: 1.5,
                        borderColor: isSelected ? colors.primary : colors.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <opt.Icon
                        size={20}
                        color={isSelected ? colors.primary : colors.textMuted}
                      />
                      <Text
                        style={{
                          color: isSelected ? colors.primary : colors.textMuted,
                          fontSize: 8,
                          marginTop: 3,
                          fontWeight: isSelected ? "600" : "400",
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Schema Rules Editor */}
              <Text
                style={{ color: colors.textSecondary }}
                className="text-sm font-medium mb-2"
              >
                Category Fields
              </Text>
              <Text
                style={{ color: colors.textMuted, fontSize: 11, marginBottom: 8 }}
              >
                Define what information is required when creating a listing in this category.
              </Text>

              {catSchemaRules.map((rule, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.input,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: 12,
                    height: 44,
                    marginBottom: 6,
                  }}
                >
                  <Tag size={14} color={colors.textMuted} style={{ marginRight: 8 }} />
                  <Text style={{ flex: 1, color: colors.text, fontSize: 13, fontWeight: "500" }}>
                    {rule.field}
                  </Text>
                  <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginRight: 6 }}>
                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>{rule.type}</Text>
                  </View>
                  {rule.required && (
                    <View style={{ backgroundColor: `${colors.danger}15`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginRight: 6 }}>
                      <Text style={{ color: colors.danger, fontSize: 10, fontWeight: "600" }}>Required</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => setCatSchemaRules((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <X size={14} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add new rule */}
              <View style={{ flexDirection: "row", gap: 6, marginBottom: 20 }}>
                <TextInput
                  value={newRuleField}
                  onChangeText={setNewRuleField}
                  placeholder="Field name"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    flex: 1,
                    backgroundColor: colors.input,
                    borderWidth: 1,
                    borderColor: colors.inputBorder,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    height: 40,
                    color: colors.text,
                    fontSize: 13,
                  }}
                />
                <View style={{ position: "relative" }}>
                  <TouchableOpacity
                    onPress={() => setShowRuleTypeDropdown(!showRuleTypeDropdown)}
                    style={{
                      backgroundColor: colors.input,
                      borderWidth: 1,
                      borderColor: colors.inputBorder,
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 12 }}>{newRuleType}</Text>
                    <ChevronDown size={12} color={colors.textMuted} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                  {showRuleTypeDropdown && (
                    <View style={{ position: "absolute", top: 42, right: 0, backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border, overflow: "hidden", zIndex: 100, width: 120 }}>
                      {["string", "number", "boolean", "select"].map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => { setNewRuleType(type); setShowRuleTypeDropdown(false); }}
                          style={{ paddingHorizontal: 12, height: 36, justifyContent: "center", borderBottomWidth: 1, borderBottomColor: colors.border }}
                        >
                          <Text style={{ color: newRuleType === type ? colors.primary : colors.text, fontSize: 12, fontWeight: newRuleType === type ? "600" : "400" }}>{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (!newRuleField.trim()) return;
                    setCatSchemaRules((prev) => [...prev, { field: newRuleField.trim(), type: newRuleType, required: newRuleRequired }]);
                    setNewRuleField("");
                    setNewRuleRequired(false);
                  }}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 10,
                    width: 40,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={18} color={colors.primaryText} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSaveCategory}
                disabled={savingCat}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 28,
                  height: 52,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: savingCat ? 0.6 : 1,
                  marginBottom: 20,
                }}
              >
                {savingCat ? (
                  <ActivityIndicator color={colors.primaryText} />
                ) : (
                  <>
                    <Plus size={18} color={colors.primaryText} />
                    <Text
                      style={{
                        color: colors.primaryText,
                        fontSize: 15,
                        fontWeight: "700",
                        marginLeft: 8,
                      }}
                    >
                      {editingCategory ? "Update Category" : "Add Category"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
