import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Building2,
  FileText,
  Eye,
  Send,
  ChevronRight,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getListings } from "../api/listings";
import Card from "../components/Card";
import { DashboardCardSkeleton } from "../components/ShimmerLoader";

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    active: 0,
    drafts: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const [activeRes, draftRes] = await Promise.all([
        getListings({ status: "AVAILABLE", limit: 1 }),
        getListings({ status: "PENDING", limit: 1 }),
      ]);

      const active = activeRes.data.pagination?.total || activeRes.data.data?.length || 0;
      const drafts = draftRes.data.pagination?.total || draftRes.data.data?.length || 0;

      let totalViews = 0;
      try {
        const allRes = await getListings({ limit: 100 });
        totalViews = (allRes.data.data || []).reduce(
          (sum, l) => sum + (l.viewsCount || 0),
          0
        );
      } catch {}

      setStats({ active, drafts, totalViews });
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const statCards = [
    {
      label: t("activeListings"),
      value: stats.active,
      icon: Building2,
      color: "#22c55e",
    },
    {
      label: t("draftListings"),
      value: stats.drafts,
      icon: FileText,
      color: "#f59e0b",
    },
    {
      label: t("totalViews"),
      value: stats.totalViews,
      icon: Eye,
      color: "#3b82f6",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-5 pt-4 pb-6">
          <Text
            style={{ color: colors.text }}
            className="text-2xl font-bold mb-1"
          >
            {t("dashboardTitle")}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-base">
            {user?.name ? `Welcome, ${user.name}` : ""}
          </Text>
        </View>

        {loading ? (
          <View className="px-5">
            <DashboardCardSkeleton />
          </View>
        ) : (
          <View className="px-5 flex-row flex-wrap justify-between">
            {statCards.map((card) => (
              <Card key={card.label} className="w-[48%] mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: `${card.color}20` }}
                  >
                    <card.icon size={20} color={card.color} />
                  </View>
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-2xl font-bold"
                >
                  {card.value}
                </Text>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-sm mt-1"
                >
                  {card.label}
                </Text>
              </Card>
            ))}
          </View>
        )}

        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={() => navigation.navigate("Syndication")}
            className="flex-row items-center justify-between py-4 px-4 rounded-2xl"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: "#8b5cf620" }}
              >
                <Send size={20} color="#8b5cf6" />
              </View>
              <View>
                <Text
                  style={{ color: colors.text }}
                  className="text-base font-semibold"
                >
                  {t("syndicationStatus")}
                </Text>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-sm"
                >
                  {t("viewSyndicationLogs")}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
