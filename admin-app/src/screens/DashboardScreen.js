import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getListings } from "../api/listings";
import SectionHeader from "../components/SectionHeader";
import useNotifications from "../hooks/useNotifications";
import useSuspenseCache from "../hooks/useSuspenseCache";
import { RecentListing, StatusChart } from "../components/dashboard";
import CachedImage from "../components/CachedImage";
import NotificationPopup from "../components/NotificationPopup";

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();

  const { data: listings, loading, refresh } = useSuspenseCache({
    key: "dashboard_listings",
    fetcher: async (force) => {
      const res = await getListings({ limit: 100 }, force);
      return res.data.data || [];
    },
    initial: [],
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const statusCounts = listings.reduce((acc, listing) => {
    const s = listing.status || "AVAILABLE";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const total = listings.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* ─── Top Bar ─── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../assets/bros_icon_concept4_monogram_clean.png")}
            style={{ width: 36, height: 36, borderRadius: 10 }}
            resizeMode="cover"
          />
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "700",
              letterSpacing: 0.5,
              marginLeft: 10,
            }}
          >
            BROS
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={() => setShowNotifications(true)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: colors.bgSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={20} color={unreadCount > 0 ? colors.primary : colors.textMuted} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -1,
                  right: -1,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: colors.danger,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: colors.bg,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 9, fontWeight: "800" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {user?.profileImage ? (
              <CachedImage
                uri={user.profileImage}
                style={{ width: 42, height: 42, borderRadius: 21 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ─── Status Chart ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="Status Breakdown" />
          <StatusChart statusCounts={statusCounts} total={total} />
        </View>

        {/* ─── Recent Properties ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <SectionHeader title="Recent Products" actionLabel="View All" onAction={() => navigation.navigate("Properties")} />
          {listings.slice(0, 8).map((listing) => (
            <RecentListing key={listing.id} listing={listing} />
          ))}
        </View>
      </ScrollView>

      <NotificationPopup
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNavigate={(screen, params) => navigation.navigate(screen, params)}
      />
    </SafeAreaView>
  );
}
