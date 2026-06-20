import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Bell, CheckCheck, Building2, Send, Info } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../api/notifications";

const TYPE_CONFIG = {
  LISTING_CREATED: { icon: Building2, color: "#22c55e" },
  LISTING_UPDATED: { icon: Building2, color: "#eab308" },
  SYNDICATION_SUCCESS: { icon: Send, color: "#22c55e" },
  SYNDICATION_FAILED: { icon: Send, color: "#ef4444" },
};

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationScreen({ navigation }) {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await getNotifications({ limit: 100 });
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (item) => {
    if (item.isRead) {
      if (item.data?.listingId) {
        navigation.navigate("Properties", {
          screen: "ListingDetail",
          params: { id: item.data.listingId },
        });
      }
      return;
    }
    try {
      await markNotificationRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (item.data?.listingId) {
        navigation.navigate("Properties", {
          screen: "ListingDetail",
          params: { id: item.data.listingId },
        });
      }
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const renderItem = ({ item }) => {
    const config = TYPE_CONFIG[item.type] || { icon: Info, color: colors.textMuted };
    const IconComp = config.icon;

    return (
      <TouchableOpacity
        onPress={() => handleMarkRead(item)}
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: item.isRead ? "transparent" : `${colors.primary}08`,
        }}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: `${config.color}18`,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            marginTop: 2,
          }}
        >
          <IconComp size={18} color={config.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: item.isRead ? "500" : "700",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.isRead && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  marginLeft: 6,
                }}
              />
            )}
          </View>
          {item.body && (
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 13,
                marginTop: 3,
                lineHeight: 18,
              }}
              numberOfLines={2}
            >
              {item.body}
            </Text>
          )}
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 11,
              marginTop: 4,
              opacity: 0.6,
            }}
          >
            {timeAgo(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.bgTertiary,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700", flex: 1 }}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <>
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: colors.primaryText,
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                {unreadCount}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: `${colors.primary}15`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCheck size={16} color={colors.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
          <Bell size={48} color={colors.textMuted} opacity={0.3} />
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 15,
              marginTop: 12,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            No notifications yet
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              marginTop: 4,
              textAlign: "center",
              opacity: 0.6,
            }}
          >
            You'll see updates here when listings are created or syndicated
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
              }}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
