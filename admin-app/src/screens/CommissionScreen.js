import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle2,
  Archive,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Watch,
  Tag,
  ChevronRight,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { getAssetStats } from "../api/commissions";

const CATEGORY_ICONS = {
  IPHONES_SAMSUNG: Smartphone,
  IPADS_MACBOOKS: Tablet,
  LAPTOPS: Laptop,
  AIRPODS: Headphones,
  SMARTWATCHES: Watch,
};

const STATUS_CONFIG = [
  { key: "available", label: "Available", color: "#6366f1", icon: Package },
  { key: "sold", label: "Sold", color: "#22c55e", icon: ShoppingCart },
  { key: "pending", label: "Pending", color: "#eab308", icon: Clock },
  { key: "archived", label: "Archived", color: "#ef4444", icon: Archive },
];

function SummaryCard({ icon: Icon, label, value, color, colors }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: `${color}18`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Icon size={18} color={color} />
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "500" }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700", marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

function CategoryCard({ category, colors }) {
  const Icon = CATEGORY_ICONS[category.categoryId] || Tag;
  const total = category.count;
  const soldPct = total > 0 ? Math.round((category.sold / total) * 100) : 0;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: `${colors.primary}12`,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Icon size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
              {category.categoryName}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
              {total} {total === 1 ? "product" : "products"}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700" }}>
            {Number(category.totalValue).toLocaleString()} ETB
          </Text>
          {soldPct > 0 && (
            <Text style={{ color: "#22c55e", fontSize: 11, fontWeight: "600", marginTop: 2 }}>
              {soldPct}% sold
            </Text>
          )}
        </View>
      </View>

      {/* Status bars */}
      <View style={{ flexDirection: "row", gap: 6, marginTop: 14 }}>
        {STATUS_CONFIG.map((s) => {
          const count = category[s.key] || 0;
          if (count === 0) return null;
          return (
            <View
              key={s.key}
              style={{
                flex: 1,
                backgroundColor: `${s.color}12`,
                borderRadius: 8,
                padding: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: s.color, fontSize: 16, fontWeight: "700" }}>{count}</Text>
              <Text style={{ color: s.color, fontSize: 9, fontWeight: "600", marginTop: 2 }}>
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Progress bar */}
      {total > 0 && (
        <View style={{ flexDirection: "row", height: 4, borderRadius: 2, overflow: "hidden", marginTop: 12, backgroundColor: `${colors.textMuted}15` }}>
          {category.available > 0 && (
            <View style={{ flex: category.available, backgroundColor: "#6366f1" }} />
          )}
          {category.sold > 0 && (
            <View style={{ flex: category.sold, backgroundColor: "#22c55e" }} />
          )}
          {category.pending > 0 && (
            <View style={{ flex: category.pending, backgroundColor: "#eab308" }} />
          )}
          {category.archived > 0 && (
            <View style={{ flex: category.archived, backgroundColor: "#ef4444" }} />
          )}
        </View>
      )}
    </View>
  );
}

export default function FinanceScreen() {
  const { colors } = useTheme();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getAssetStats();
      setStats(res.data.data);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "—";
    return `${Number(amount).toLocaleString()} ETB`;
  };

  if (loading && !stats) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <LinearGradient
          colors={[`${colors.primary}08`, "transparent"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200 }}
        />

        <FlatList
          data={[]}
          renderItem={null}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
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
                  <DollarSign size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700", letterSpacing: -0.2 }}>
                    Finance
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                    Asset Tracking & Overview
                  </Text>
                </View>
              </View>

              {/* Summary Cards */}
              {stats && (
                <>
                  <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                    <SummaryCard
                      icon={Package}
                      label="Total Assets"
                      value={stats.totalAssets}
                      color={colors.primary}
                      colors={colors}
                    />
                    <SummaryCard
                      icon={TrendingUp}
                      label="Total Value"
                      value={formatCurrency(stats.totalValue)}
                      color="#22c55e"
                      colors={colors}
                    />
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
                    <SummaryCard
                      icon={CheckCircle2}
                      label="Available"
                      value={stats.AVAILABLE || 0}
                      color="#6366f1"
                      colors={colors}
                    />
                    <SummaryCard
                      icon={ShoppingCart}
                      label="Sold"
                      value={stats.SOLD || 0}
                      color="#22c55e"
                      colors={colors}
                    />
                    <SummaryCard
                      icon={Clock}
                      label="Pending"
                      value={stats.PENDING || 0}
                      color="#eab308"
                      colors={colors}
                    />
                    <SummaryCard
                      icon={Archive}
                      label="Archived"
                      value={stats.ARCHIVED || 0}
                      color="#ef4444"
                      colors={colors}
                    />
                  </View>
                </>
              )}

              {/* Category Breakdown */}
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 10,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 10,
                  }}
                >
                  Assets by Category
                </Text>
              </View>

              {stats?.byCategory?.length > 0 ? (
                stats.byCategory.map((cat) => (
                  <CategoryCard key={cat.categoryId} category={cat} colors={colors} />
                ))
              ) : (
                <View style={{ padding: 40, alignItems: "center" }}>
                  <Package size={40} color={`${colors.textMuted}30`} />
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 12, textAlign: "center" }}>
                    No assets found.
                  </Text>
                </View>
              )}
            </>
          }
        />
      </SafeAreaView>
    </View>
  );
}
