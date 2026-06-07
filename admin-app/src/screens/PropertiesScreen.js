import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search, MapPin } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { getListings } from "../api/listings";
import Card from "../components/Card";
import { ListingCardSkeleton } from "../components/ShimmerLoader";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

export default function PropertiesScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchListings = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        const { data } = await getListings({ page: pageNum, limit: 10 });
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
    fetchListings(1);
  };

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
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

  const getImageUrl = (images) => {
    if (!images || images.length === 0) return null;
    const path = images[0];
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}/${path}`;
  };

  const renderListing = ({ item }) => {
    const imageUrl = getImageUrl(item.images);
    return (
      <Card onPress={() => {}} className="mb-3" padding={false}>
        <View className="flex-row">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
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
              <Text
                style={{ color: colors.textMuted }}
                className="text-xs"
              >
                {item.category?.displayName}
              </Text>
            </View>
            <Text style={{ color: colors.primary }} className="text-lg font-bold">
              {formatPrice(item.price)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <Text
            style={{ color: colors.text }}
            className="text-2xl font-bold"
          >
            {t("propertiesTitle")}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddListing")}
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="px-5 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </View>
        ) : (
          <FlatList
            data={listings}
            renderItem={renderListing}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <View className="items-center mt-20">
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-base"
                >
                  {t("noResults")}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
