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
import Animated, { FadeInDown } from "react-native-reanimated";
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
} from "lucide-react-native";
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
  { key: "available", label: "Available", color: "#22C55E" },
  { key: "pending", label: "Pending", color: "#F59E0B" },
  { key: "sold", label: "Sold", color: "#EF4444" },
  { key: "archived", label: "Archived", color: "#6B7280" },
];

function SummaryCard({ icon: Icon, label, value, color, colors, radii, index }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(200)} style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${color}15`, alignItems: "center", justifyContent: "center" }}>
            <Icon size={16} color={color} strokeWidth={1.75} />
          </View>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600" }}>{label}</Text>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700", marginTop: 2 }}>
          {value}
        </Text>
      </View>
    </Animated.View>
  );
}

function CategoryCard({ category, colors, radii }) {
  const Icon = CATEGORY_ICONS[category.categoryId] || Tag;
  const total = category.count;
  const soldPct = total > 0 ? Math.round((category.sold / total) * 100) : 0;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View style={{ width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.primaryTint, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
            <Icon size={19} color={colors.primary} strokeWidth={1.75} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
              {category.categoryName}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
              {total} {total === 1 ? "product" : "products"}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700" }}>
            {Number(category.totalValue).toLocaleString()} ETB
          </Text>
          {soldPct > 0 && (
            <Text style={{ color: "#22C55E", fontSize: 11, fontWeight: "600", marginTop: 2 }}>
              {soldPct}% sold
            </Text>
          )}
        </View>
      </View>

      {/* Status pills */}
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
                borderRadius: radii.sm,
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
          {category.available > 0 && <View style={{ flex: category.available, backgroundColor: "#6366F1" }} />}
          {category.sold > 0 && <View style={{ flex: category.sold, backgroundColor: "#22C55E" }} />}
          {category.pending > 0 && <View style={{ flex: category.pending, backgroundColor: "#F59E0B" }} />}
          {category.archived > 0 && <View style={{ flex: category.archived, backgroundColor: "#EF4444" }} />}
        </View>
      )}
    </View>
  );
}

export default function FinanceScreen() {
  const { colors, radii } = useTheme();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getAssetStats();
      setStats(res.data.data);
    } catch {} finally {
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
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={[]}
          renderItem={null}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={
            <>
              <Animated.View entering={FadeInDown.duration(300)} style={{ marginBottom: 24 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700", letterSpacing: -0.5 }}>
                  Finance
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                  Asset Tracking & Overview
                </Text>
              </Animated.View>

              {stats && (
                <>
                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                    <SummaryCard icon={Package} label="Total Assets" value={stats.totalAssets} color={colors.primary} colors={colors} radii={radii} index={0} />
                    <SummaryCard icon={TrendingUp} label="Total Value" value={formatCurrency(stats.totalValue)} color="#22C55E" colors={colors} radii={radii} index={1} />
                  </View>
                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
                    <SummaryCard icon={CheckCircle2} label="Available" value={stats.AVAILABLE || 0} color="#6366F1" colors={colors} radii={radii} index={2} />
                    <SummaryCard icon={ShoppingCart} label="Sold" value={stats.SOLD || 0} color="#22C55E" colors={colors} radii={radii} index={3} />
                    <SummaryCard icon={Clock} label="Pending" value={stats.PENDING || 0} color="#F59E0B" colors={colors} radii={radii} index={4} />
                    <SummaryCard icon={Archive} label="Archived" value={stats.ARCHIVED || 0} color="#EF4444" colors={colors} radii={radii} index={5} />
                  </View>
                </>
              )}

              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 }}>
                Assets by Category
              </Text>

              {stats?.byCategory?.length > 0 ? (
                stats.byCategory.map((cat) => (
                  <CategoryCard key={cat.categoryId} category={cat} colors={colors} radii={radii} />
                ))
              ) : (
                <View style={{ padding: 40, alignItems: "center" }}>
                  <Package size={40} color={colors.textMuted} strokeWidth={1} />
                  <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 12, textAlign: "center" }}>
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
