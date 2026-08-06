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
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {getStatusIcon(item.status)}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}
              numberOfLines={1}
            >
              {item.listing?.title || "Listing"}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {item.platform}
            </Text>
          </View>
        </View>
        <StatusBadge status={item.status} size="sm" />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Clock size={12} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 4 }}>
          {formatDate(item.runAt)}
        </Text>
      </View>

      {item.errorMessage && (
        <View
          style={{ padding: 12, borderRadius: 12, marginBottom: 12, backgroundColor: `${colors.danger}12` }}
        >
          <Text style={{ color: colors.danger, fontSize: 12 }}>
            {item.errorMessage}
          </Text>
        </View>
      )}

      {item.status === "FAILED" && (
        <TouchableOpacity
          onPress={() => handleRetry(item.id)}
          disabled={retryingId === item.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: colors.primary,
            opacity: retryingId === item.id ? 0.5 : 1,
          }}
        >
          <RefreshCw
            size={14}
            color={colors.primaryText}
            style={{ marginRight: 6 }}
          />
          <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: "600" }}>
            {retryingId === item.id ? t("retrying") : t("manualRetry")}
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const LogCardSkeleton = () => (
    <View style={{ marginBottom: 12 }}>
      <ShimmerLoader height={120} style={{ borderRadius: 16 }} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          {t("syndicationSubtitle")}
        </Text>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 20 }}>
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
            <View style={{ alignItems: "center", marginTop: 80 }}>
              <Send size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 16 }}>
                {t("noLogs")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
