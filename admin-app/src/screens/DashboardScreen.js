import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Building2, MapPin, TrendingUp } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getListings } from "../api/listings";

const screenWidth = Dimensions.get("window").width;

const STATUS_MAP = {
  AVAILABLE: { label: "Available", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  PENDING: { label: "Pending", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
  SOLD: { label: "Sold", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  RENTED: { label: "Rented", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  RESERVED: { label: "Reserved", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
};

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartIndex, setChartIndex] = useState(0);
  const chartPagerRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await getListings({ limit: 100 });
      setListings(res.data.data || []);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const statusCounts = listings.reduce((acc, listing) => {
    const s = listing.status || "AVAILABLE";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const total = listings.length;
  const maxCount = Math.max(...Object.values(statusCounts), 1);

  const activeListings = listings.filter((l) => l.status === "AVAILABLE");
  const pendingListings = listings.filter((l) => l.status === "PENDING");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
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
        {/* ─── Header ─── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 }}>
              Dashboard
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
              {user?.name ? `Welcome back, ${user.name}` : ""}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: `${colors.primary}40`,
                overflow: "hidden",
              }}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ color: colors.primaryText, fontSize: 16, fontWeight: "700" }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── Total Count ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 18,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: `${colors.primary}18`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Building2 size={16} color={colors.primary} />
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Total Properties
              </Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 32, fontWeight: "700" }}>
              {loading ? "—" : total}
            </Text>
          </View>
        </View>

        {/* ─── Status Breakdown ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Status Breakdown
          </Text>

          {Object.entries(statusCounts).length === 0 && !loading ? (
            <Text style={{ color: colors.textMuted, fontSize: 13, paddingVertical: 20, textAlign: "center" }}>
              No properties found
            </Text>
          ) : (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: "hidden",
              }}
            >
              {/* Chart Tabs */}
              <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: `${colors.textMuted}15` }}>
                {["Bar Chart", "Pie Chart"].map((label, idx) => (
                  <View
                    key={label}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      alignItems: "center",
                      borderBottomWidth: 2,
                      borderBottomColor: chartIndex === idx ? colors.primary : "transparent",
                    }}
                  >
                    <Text style={{ color: chartIndex === idx ? colors.primary : colors.textMuted, fontSize: 12, fontWeight: chartIndex === idx ? "700" : "500" }}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Swipeable Charts */}
              <FlatList
                ref={chartPagerRef}
                data={[0, 1]}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => String(i)}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / (screenWidth - 40));
                  setChartIndex(idx);
                }}
                getItemLayout={(_, index) => ({
                  length: screenWidth - 40,
                  offset: (screenWidth - 40) * index,
                  index,
                })}
                renderItem={({ item: chartType }) => (
                  <View style={{ width: screenWidth - 40, padding: 16 }}>
                    {chartType === 0 ? (
                      /* ─── Bar Chart ─── */
                      <View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-end",
                            justifyContent: "space-around",
                            height: 140,
                            paddingTop: 10,
                            paddingBottom: 8,
                          }}
                        >
                          {Object.entries(statusCounts).map(([status, count]) => {
                            const cfg = STATUS_MAP[status] || { label: status, color: colors.textMuted };
                            const barHeight = maxCount > 0 ? (count / maxCount) * 100 : 0;
                            return (
                              <View key={status} style={{ alignItems: "center", flex: 1 }}>
                                <Text style={{ color: cfg.color, fontSize: 12, fontWeight: "700", marginBottom: 6 }}>
                                  {count}
                                </Text>
                                <View
                                  style={{
                                    width: 32,
                                    height: `${Math.max(barHeight, 4)}%`,
                                    backgroundColor: cfg.color,
                                    borderRadius: 6,
                                    opacity: 0.85,
                                  }}
                                />
                              </View>
                            );
                          })}
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                            borderTopWidth: 1,
                            borderTopColor: `${colors.textMuted}15`,
                            paddingTop: 10,
                            marginTop: 4,
                          }}
                        >
                          {Object.entries(statusCounts).map(([status]) => {
                            const cfg = STATUS_MAP[status] || { label: status, color: colors.textMuted };
                            return (
                              <View key={status} style={{ alignItems: "center", flex: 1 }}>
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cfg.color, marginBottom: 4 }} />
                                <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: "500" }} numberOfLines={1}>
                                  {cfg.label}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ) : (
                      /* ─── Pie Chart (Proportional Slices) ─── */
                      <View style={{ alignItems: "center", paddingVertical: 10 }}>
                        {(() => {
                          const entries = Object.entries(statusCounts);
                          const totalVal = entries.reduce((sum, [, c]) => sum + c, 0);
                          if (totalVal === 0) return null;

                          const size = 140;
                          const half = size / 2;
                          const RAY_STEP = 2;
                          const RAY_WIDTH = 4;

                          let cumDeg = 0;
                          const slices = entries.map(([status, count]) => {
                            const cfg = STATUS_MAP[status] || { label: status, color: colors.textMuted };
                            const deg = (count / totalVal) * 360;
                            const startDeg = cumDeg;
                            cumDeg += deg;
                            return { status, count, color: cfg.color, label: cfg.label, deg, startDeg };
                          });

                          return (
                            <View style={{ alignItems: "center" }}>
                              <View
                                style={{
                                  width: size,
                                  height: size,
                                  borderRadius: half,
                                  overflow: "hidden",
                                  backgroundColor: colors.card,
                                }}
                              >
                                {slices.map((slice) => {
                                  const rays = [];
                                  const steps = Math.max(1, Math.ceil(slice.deg / RAY_STEP));
                                  const actualStep = slice.deg / steps;
                                  for (let i = 0; i <= steps; i++) {
                                    rays.push(
                                      <View
                                        key={i}
                                        style={{
                                          position: "absolute",
                                          top: half,
                                          left: half - RAY_WIDTH / 2,
                                          width: RAY_WIDTH,
                                          height: half + 1,
                                          backgroundColor: slice.color,
                                          transformOrigin: "center top",
                                          transform: [{ rotate: `${slice.startDeg + i * actualStep - 90}deg` }],
                                        }}
                                      />
                                    );
                                  }
                                  return rays;
                                })}
                                {/* Center label */}
                                <View
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: size,
                                    height: size,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>{total}</Text>
                                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>Total</Text>
                                </View>
                              </View>

                              {/* Legend */}
                              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 16, gap: 12 }}>
                                {slices.map((slice) => {
                                  const pctVal = total > 0 ? ((slice.count / total) * 100).toFixed(1) : 0;
                                  return (
                                    <View key={slice.status} style={{ flexDirection: "row", alignItems: "center" }}>
                                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: slice.color, marginRight: 5 }} />
                                      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{slice.label}</Text>
                                      <Text style={{ color: slice.color, fontSize: 11, fontWeight: "700", marginLeft: 4 }}>{pctVal}%</Text>
                                    </View>
                                  );
                                })}
                              </View>
                            </View>
                          );
                        })()}
                      </View>
                    )}
                  </View>
                )}
              />

              {/* Page Dots */}
              <View style={{ flexDirection: "row", justifyContent: "center", paddingBottom: 14, gap: 6 }}>
                {[0, 1].map((i) => (
                  <View
                    key={i}
                    style={{
                      width: chartIndex === i ? 16 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: chartIndex === i ? colors.primary : `${colors.textMuted}30`,
                    }}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ─── Recent Properties ─── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Recent Properties
          </Text>

          {listings.slice(0, 10).map((listing) => {
            const status = listing.status || "AVAILABLE";
            const cfg = STATUS_MAP[status] || { label: status, color: colors.textMuted, bg: `${colors.textMuted}18` };
            const image = listing.images?.[0];

            return (
              <View
                key={listing.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{ width: 48, height: 48, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: colors.bgTertiary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Building2 size={18} color={colors.textMuted} />
                  </View>
                )}

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
                    {listing.title || "Untitled"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <MapPin size={11} color={colors.textMuted} />
                    <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 4 }}>
                      {listing.city || "—"}
                    </Text>
                    {listing.price != null && (
                      <>
                        <Text style={{ color: `${colors.textMuted}40`, fontSize: 11, marginHorizontal: 6 }}>·</Text>
                        <TrendingUp size={11} color={colors.textMuted} />
                        <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 4 }}>
                          {Number(listing.price).toLocaleString()} ETB
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: cfg.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: `${cfg.color}30`,
                  }}
                >
                  <Text style={{ color: cfg.color, fontSize: 10, fontWeight: "700" }}>
                    {cfg.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
