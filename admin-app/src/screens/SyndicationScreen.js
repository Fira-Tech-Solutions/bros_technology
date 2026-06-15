import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Send,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { getSyndicationLogs, retrySyndication } from "../api/syndication";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import ShimmerLoader from "../components/ShimmerLoader";

export default function SyndicationScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      const { data } = await getSyndicationLogs();
      setLogs(data.data || []);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleRetry = async (id) => {
    setRetryingId(id);
    try {
      await retrySyndication(id);
      Alert.alert(t("success"), t("retrySuccess"));
      fetchLogs();
    } catch {
      Alert.alert(t("error"), t("retryFailed"));
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle2 size={20} color={colors.success} />;
      case "FAILED":
        return <XCircle size={20} color={colors.danger} />;
      default:
        return <Clock size={20} color={colors.warning} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderLog = ({ item }) => (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {getStatusIcon(item.status)}
          <View className="ml-3 flex-1">
            <Text
              style={{ color: colors.text }}
              className="text-base font-semibold"
              numberOfLines={1}
            >
              {item.listing?.title || "Listing"}
            </Text>
            <Text
              style={{ color: colors.textSecondary }}
              className="text-sm"
            >
              {item.platform}
            </Text>
          </View>
        </View>
        <StatusBadge status={item.status} size="sm" />
      </View>

      <View className="flex-row items-center mb-3">
        <Clock size={12} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted }} className="text-xs ml-1">
          {formatDate(item.runAt)}
        </Text>
      </View>

      {item.errorMessage && (
        <View
          className="p-3 rounded-xl mb-3"
          style={{ backgroundColor: `${colors.danger}12` }}
        >
          <Text style={{ color: colors.danger }} className="text-xs">
            {item.errorMessage}
          </Text>
        </View>
      )}

      {item.status === "FAILED" && (
        <TouchableOpacity
          onPress={() => handleRetry(item.id)}
          disabled={retryingId === item.id}
          className="flex-row items-center justify-center py-2 px-4 rounded-xl"
          style={{
            backgroundColor: colors.primary,
            opacity: retryingId === item.id ? 0.5 : 1,
          }}
        >
          <RefreshCw
            size={14}
            color={colors.primaryText}
            style={{
              marginRight: 6,
            }}
          />
          <Text style={{ color: colors.primaryText }} className="text-sm font-semibold">
            {retryingId === item.id ? t("retrying") : t("manualRetry")}
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const LogCardSkeleton = () => (
    <View className="mb-3">
      <ShimmerLoader height={120} className="rounded-2xl" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View className="px-5 pt-2 pb-4">
        <Text
          style={{ color: colors.textSecondary }}
          className="text-sm"
        >
          {t("syndicationSubtitle")}
        </Text>
      </View>

      {loading ? (
        <View className="px-5">
          {[1, 2, 3].map((i) => (
            <LogCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderLog}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Send size={48} color={colors.textMuted} />
              <Text
                style={{ color: colors.textSecondary }}
                className="text-base mt-4"
              >
                {t("noLogs")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
