import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Percent,
  Pencil,
  X,
  Check,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import {
  getCommissionSummary,
  getCommissionListings,
  updateListingCommission,
} from "../api/commissions";

const STATUS_FILTERS = [null, "AVAILABLE", "PENDING", "SOLD", "ARCHIVED"];
const STATUS_LABELS = {
  AVAILABLE: "Available",
  PENDING: "Pending",
  SOLD: "Sold",
  ARCHIVED: "Archived",
};
const COMMISSION_FILTERS = [
  { key: "set", label: "Set" },
  { key: "unset", label: "Unset" },
  { key: "all", label: "All" },
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

function EditModal({ visible, listing, onSave, onClose, colors }) {
  const [percent, setPercent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing) {
      setPercent(listing.commissionPercent != null ? String(listing.commissionPercent) : "");
    }
  }, [listing]);

  const handleSave = async () => {
    const val = percent.trim() === "" ? null : parseFloat(percent);
    if (val !== null && (isNaN(val) || val < 0 || val > 100)) {
      Alert.alert("Invalid", "Commission must be between 0 and 100");
      return;
    }
    setSaving(true);
    try {
      await updateListingCommission(listing.id, val);
      onSave(listing.id, val);
    } catch {
      Alert.alert("Error", "Failed to update commission");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 340,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
              {listing?.commissionPercent != null ? "Edit Commission" : "Set Commission"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>
            {listing?.title}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 16 }}>
            Price: {listing?.price ? `${Number(listing.price).toLocaleString()} ETB` : "—"}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.input,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.inputBorder,
              paddingHorizontal: 14,
              height: 52,
              marginBottom: 20,
            }}
          >
            <Percent size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
            <TextInput
              value={percent}
              onChangeText={setPercent}
              placeholder="e.g. 5"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              style={{
                flex: 1,
                color: colors.text,
                fontSize: 16,
                fontWeight: "600",
                padding: 0,
              }}
            />
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>%</Text>
          </View>

          <View className="flex-row" style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: colors.bgTertiary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: "700" }}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function CommissionScreen() {
  const { colors } = useTheme();

  const [summary, setSummary] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [commissionFilter, setCommissionFilter] = useState("set");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const params = {
        page: 1,
        limit: 20,
        status: statusFilter || undefined,
        commissionFilter,
      };
      const [sumRes, listRes] = await Promise.all([
        getCommissionSummary(),
        getCommissionListings(params),
      ]);
      setSummary(sumRes.data.data);
      setListings(listRes.data.data || []);
      setHasMore((listRes.data.pagination?.totalPages || 1) > 1);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, commissionFilter]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchData();
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setPage(nextPage);
    try {
      const res = await getCommissionListings({
        page: nextPage,
        limit: 20,
        status: statusFilter || undefined,
        commissionFilter,
      });
      setListings((prev) => [...prev, ...(res.data.data || [])]);
      setHasMore((res.data.pagination?.totalPages || 1) > nextPage);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCommissionSaved = (listingId, percent) => {
    setListings((prev) =>
      prev.map((l) => {
        if (l.id !== listingId) return l;
        const price = Number(l.price) || 0;
        const pct = percent || 0;
        return {
          ...l,
          commissionPercent: pct,
          commissionAmount: Math.round((price * pct) / 100 * 100) / 100,
        };
      })
    );
    setEditingListing(null);
    fetchData();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "—";
    return `${Number(amount).toLocaleString()} ETB`;
  };

  const renderItem = ({ item }) => {
    const commissionAmount = item.commissionAmount || 0;
    const percent = item.commissionPercent;
    const hasCommission = percent != null;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setEditingListing(item)}
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text
            style={{ color: colors.text, fontSize: 14, fontWeight: "600", flex: 1 }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
              backgroundColor:
                item.status === "SOLD" ? "#22c55e18" :
                item.status === "PENDING" ? "#eab30818" :
                item.status === "ARCHIVED" ? "#ef444418" : "#6366f118",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color:
                  item.status === "SOLD" ? "#22c55e" :
                  item.status === "PENDING" ? "#eab308" :
                  item.status === "ARCHIVED" ? "#ef4444" : "#6366f1",
              }}
            >
              {STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-2" style={{ gap: 12 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }} numberOfLines={1} style={{ flex: 1 }}>
            {item.agent?.name || "—"}
          </Text>
          <TouchableOpacity
            onPress={() => setEditingListing(item)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: hasCommission ? `${colors.primary}12` : `${colors.textMuted}10`,
            }}
          >
            {hasCommission ? (
              <>
                <Percent size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>
                  {percent}%
                </Text>
                <Pencil size={10} color={colors.primary} style={{ marginLeft: 4 }} />
              </>
            ) : (
              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600" }}>
                + Set Commission
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Price: {formatCurrency(item.price)}
          </Text>
          {hasCommission && (
            <Text style={{ color: "#22c55e", fontSize: 14, fontWeight: "700" }}>
              +{formatCurrency(commissionAmount)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !summary) {
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
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <>
              <View className="flex-row items-center mb-4">
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
                    Commission Tracking
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                    Admin · Revenue Overview
                  </Text>
                </View>
              </View>

              {summary && (
                <View className="flex-row" style={{ gap: 8, marginBottom: 20 }}>
                  <SummaryCard
                    icon={TrendingUp}
                    label="Total Value"
                    value={formatCurrency(summary.totalCommissionValue)}
                    color={colors.primary}
                    colors={colors}
                  />
                  <SummaryCard
                    icon={CheckCircle2}
                    label="Collected"
                    value={formatCurrency(summary.collectedCommission)}
                    color="#22c55e"
                    colors={colors}
                  />
                  <SummaryCard
                    icon={Clock}
                    label="Pending"
                    value={formatCurrency(summary.pendingCommission)}
                    color="#eab308"
                    colors={colors}
                  />
                </View>
              )}

              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                  Commission
                </Text>
                <View className="flex-row" style={{ gap: 6 }}>
                  {COMMISSION_FILTERS.map((cf) => {
                    const isActive = commissionFilter === cf.key;
                    return (
                      <TouchableOpacity
                        key={cf.key}
                        onPress={() => setCommissionFilter(cf.key)}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 6,
                          borderRadius: 16,
                          backgroundColor: isActive ? colors.primary : colors.input,
                          borderWidth: 1,
                          borderColor: isActive ? colors.primary : colors.inputBorder,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: isActive ? colors.primaryText : colors.textMuted,
                          }}
                        >
                          {cf.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                  Status
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                  {STATUS_FILTERS.map((s) => {
                    const isActive = statusFilter === s;
                    return (
                      <TouchableOpacity
                        key={s || "all"}
                        onPress={() => setStatusFilter(s)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          backgroundColor: isActive ? colors.primary : colors.input,
                          borderWidth: 1,
                          borderColor: isActive ? colors.primary : colors.inputBorder,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: isActive ? colors.primaryText : colors.textMuted,
                          }}
                        >
                          {s ? STATUS_LABELS[s] || s : "All"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {listings.length === 0 && !loading && (
                <View style={{ padding: 40, alignItems: "center" }}>
                  <DollarSign size={40} color={`${colors.textMuted}30`} />
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 12, textAlign: "center" }}>
                    No listings found.
                  </Text>
                </View>
              )}
            </>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ padding: 16 }}
              />
            ) : null
          }
        />

        <EditModal
          visible={!!editingListing}
          listing={editingListing}
          onSave={handleCommissionSaved}
          onClose={() => setEditingListing(null)}
          colors={colors}
        />
      </SafeAreaView>
    </View>
  );
}
