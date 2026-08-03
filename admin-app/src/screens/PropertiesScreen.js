import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  Plus,
  X,
  Tag,
  Smartphone,
  Laptop,
  Pencil,
  Trash2,
  Search,
  Headphones,
  Watch,
  Monitor,
  ChevronDown,
  ChevronRight,
} from "lucide-react-native";

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
import ListingCard from "../components/ListingCard";
import { ListingCardSkeleton } from "../components/ShimmerLoader";

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

export default function PropertiesScreen({ navigation }) {
  const { colors, radii, shadows } = useTheme();
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
              refreshCategories();
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

  const renderCategory = ({ item }) => {
    const IconComp = getIconComponent(item.icon);
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.sm(),
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radii.md,
            backgroundColor: colors.primaryTint,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
          }}
        >
          <IconComp size={20} color={colors.primary} strokeWidth={1.75} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600", letterSpacing: -0.2 }}>
            {item.displayName}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>
            {item.listingCount || 0} products · {item.name}
          </Text>
        </View>
        <TouchableOpacity onPress={() => openEditCategory(item)} style={{ padding: 8 }}>
          <Pencil size={16} color={colors.textMuted} strokeWidth={1.75} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteCategory(item)} style={{ padding: 8, marginLeft: 4 }}>
          <Trash2 size={16} color={colors.textMuted} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* ─── Header ─── */}
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}
      >
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700", letterSpacing: -0.5 }}>
          {t("propertiesTitle")}
        </Text>
      </Animated.View>

      {/* ─── Search Bar ─── */}
      {tab === "listings" && (
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.input,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.inputBorder,
              paddingHorizontal: 14,
              height: 48,
            }}
          >
            <Search size={17} color={colors.textMuted} strokeWidth={1.75} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search products..."
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, marginLeft: 10, color: colors.text, fontSize: 14 }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={16} color={colors.textMuted} strokeWidth={1.75} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ─── Category Filter Chips ─── */}
      {tab === "listings" && categories.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 9999,
                backgroundColor: selectedCategory === null ? colors.primary : colors.bgTertiary,
                borderWidth: 1,
                borderColor: selectedCategory === null ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  color: selectedCategory === null ? colors.white : colors.textMuted,
                  fontSize: 13,
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
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 9999,
                    backgroundColor: isActive ? colors.primary : colors.bgTertiary,
                    borderWidth: 1,
                    borderColor: isActive ? colors.primary : colors.border,
                  }}
                >
                  {cat.icon &&
                    React.createElement(getIconComponent(cat.icon), {
                      size: 13,
                      color: isActive ? colors.white : colors.textMuted,
                      strokeWidth: 1.75,
                    })}
                  <Text
                    style={{
                      color: isActive ? colors.white : colors.textMuted,
                      fontSize: 13,
                      fontWeight: "600",
                      marginLeft: cat.icon ? 6 : 0,
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

      {/* ─── Tab Bar ─── */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          marginBottom: 4,
          backgroundColor: colors.bgTertiary,
          borderRadius: radii.md,
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
              paddingVertical: 9,
              borderRadius: radii.sm,
              backgroundColor: tab === item.key ? colors.primary : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: tab === item.key ? colors.white : colors.textMuted,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Listings Tab ─── */}
      {tab === "listings" &&
        (loading ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </View>
        ) : (
          <FlatList
            data={filteredListings}
            renderItem={({ item, index }) => (
              <ListingCard
                listing={item}
                index={index}
                onPress={() => navigation.navigate("ListingDetail", { listingId: item.id })}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingMore ? (
                <View style={{ paddingVertical: 16, alignItems: "center" }}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: "500" }}>
                  {searchQuery || selectedCategory ? "No matching products" : t("noResults")}
                </Text>
              </View>
            }
          />
        ))}

      {/* ─── Categories Tab ─── */}
      {tab === "categories" &&
        (loading ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            {[1, 2, 3].map((i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: "500" }}>
                  No categories yet
                </Text>
              </View>
            }
          />
        ))}

      {/* ─── Floating Add Button ─── */}
      <TouchableOpacity
        onPress={() => {
          if (tab === "listings") navigation.navigate("AddListing");
          else openAddCategory();
        }}
        style={{
          position: "absolute",
          bottom: 28,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          ...shadows.lg(colors.primary),
        }}
      >
        <Plus size={26} color={colors.white} strokeWidth={2.25} />
      </TouchableOpacity>

      {/* ─── Add/Edit Category Modal ─── */}
      <Modal
        visible={showAddCategory}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddCategory(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: colors.bgSecondary,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              padding: 24,
              maxHeight: "85%",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", letterSpacing: -0.3 }}>
                {editingCategory ? "Edit Category" : "New Category"}
              </Text>
              <TouchableOpacity onPress={() => setShowAddCategory(false)} style={{ padding: 4 }}>
                <X size={22} color={colors.textMuted} strokeWidth={1.75} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
                Name
              </Text>
              <TextInput
                value={catName}
                onChangeText={setCatName}
                placeholder="e.g. PHONES_TABLETS"
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.input,
                  borderWidth: 1,
                  borderColor: colors.inputBorder,
                  borderRadius: radii.md,
                  paddingHorizontal: 16,
                  height: 48,
                  color: colors.text,
                  fontSize: 14,
                  marginBottom: 20,
                }}
                autoCapitalize="characters"
              />

              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
                Display Name
              </Text>
              <TextInput
                value={catDisplayName}
                onChangeText={setCatDisplayName}
                placeholder="e.g. Phones & Tablets"
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.input,
                  borderWidth: 1,
                  borderColor: colors.inputBorder,
                  borderRadius: radii.md,
                  paddingHorizontal: 16,
                  height: 48,
                  color: colors.text,
                  fontSize: 14,
                  marginBottom: 20,
                }}
              />

              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 10 }}>
                Icon
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
                {ICON_OPTIONS.map((opt) => {
                  const isSelected = catIcon === opt.name;
                  return (
                    <TouchableOpacity
                      key={opt.name}
                      onPress={() => setCatIcon(opt.name)}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: radii.md,
                        backgroundColor: isSelected ? colors.primaryTint : colors.bgTertiary,
                        borderWidth: 1.5,
                        borderColor: isSelected ? colors.primary : colors.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <opt.Icon
                        size={20}
                        color={isSelected ? colors.primary : colors.textMuted}
                        strokeWidth={1.75}
                      />
                      <Text
                        style={{
                          color: isSelected ? colors.primary : colors.textMuted,
                          fontSize: 9,
                          marginTop: 4,
                          fontWeight: isSelected ? "600" : "500",
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 6 }}>
                Category Fields
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 12 }}>
                Define what information is required when creating a listing in this category.
              </Text>

              {catSchemaRules.map((rule, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.bgTertiary,
                    borderRadius: radii.sm,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: 12,
                    height: 44,
                    marginBottom: 8,
                  }}
                >
                  <Tag size={14} color={colors.textMuted} strokeWidth={1.75} style={{ marginRight: 10 }} />
                  <Text style={{ flex: 1, color: colors.text, fontSize: 13, fontWeight: "500" }}>
                    {rule.field}
                  </Text>
                  <View style={{ backgroundColor: colors.primaryTint, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 }}>
                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>{rule.type}</Text>
                  </View>
                  {rule.required && (
                    <View style={{ backgroundColor: `${colors.danger}15`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 }}>
                      <Text style={{ color: colors.danger, fontSize: 10, fontWeight: "600" }}>Required</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => setCatSchemaRules((prev) => prev.filter((_, i) => i !== idx))}>
                    <X size={14} color={colors.danger} strokeWidth={1.75} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
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
                    borderRadius: radii.sm,
                    paddingHorizontal: 12,
                    height: 44,
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
                      borderRadius: radii.sm,
                      paddingHorizontal: 12,
                      height: 44,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 12 }}>{newRuleType}</Text>
                    <ChevronDown size={12} color={colors.textMuted} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                  {showRuleTypeDropdown && (
                    <View style={{ position: "absolute", top: 46, right: 0, backgroundColor: colors.card, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, overflow: "hidden", zIndex: 100, width: 120 }}>
                      {["string", "number", "boolean", "select"].map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => { setNewRuleType(type); setShowRuleTypeDropdown(false); }}
                          style={{ paddingHorizontal: 12, height: 38, justifyContent: "center", borderBottomWidth: 1, borderBottomColor: colors.border }}
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
                    borderRadius: radii.sm,
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={18} color={colors.white} strokeWidth={2.25} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSaveCategory}
                disabled={savingCat}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 9999,
                  height: 52,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: savingCat ? 0.6 : 1,
                  marginBottom: 20,
                }}
              >
                {savingCat ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Plus size={18} color={colors.white} strokeWidth={2.25} />
                    <Text style={{ color: colors.white, fontSize: 15, fontWeight: "700", marginLeft: 8 }}>
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
