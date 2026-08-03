import React, { memo, useState, useRef } from "react";
import { View, Text, FlatList, Dimensions, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const screenWidth = Dimensions.get("window").width;

const STATUS_MAP = {
  AVAILABLE: { label: "Available", color: "#22C55E" },
  PENDING: { label: "Pending", color: "#F59E0B" },
  SOLD: { label: "Sold", color: "#EF4444" },
  ARCHIVED: { label: "Archived", color: "#6B7280" },
};

const StatusChart = memo(function StatusChart({ statusCounts, total }) {
  const { colors, radii, shadows } = useTheme();
  const [chartIndex, setChartIndex] = useState(0);
  const chartPagerRef = useRef(null);
  const maxCount = Math.max(...Object.values(statusCounts), 1);

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
        ...shadows.sm(),
      }}
    >
      {/* Chart Tabs */}
      <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {["Bar Chart", "Pie Chart"].map((label, idx) => (
          <TouchableOpacity
            key={label}
            onPress={() => {
              chartPagerRef.current?.scrollToOffset({ offset: idx * (screenWidth - 40), animated: true });
              setChartIndex(idx);
            }}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: chartIndex === idx ? colors.primary : "transparent",
            }}
          >
            <Text
              style={{
                color: chartIndex === idx ? colors.primary : colors.textMuted,
                fontSize: 12,
                fontWeight: chartIndex === idx ? "600" : "500",
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Charts */}
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
          <View style={{ width: screenWidth - 40, padding: 18 }}>
            {chartType === 0 ? (
              <View>
                <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", height: 130, paddingTop: 10 }}>
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
                            width: 28,
                            height: `${Math.max(barHeight, 4)}%`,
                            backgroundColor: cfg.color,
                            borderRadius: 8,
                            opacity: 0.85,
                          }}
                        />
                      </View>
                    );
                  })}
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-around", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 8 }}>
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
              <View style={{ alignItems: "center", paddingVertical: 10 }}>
                {(() => {
                  const entries = Object.entries(statusCounts);
                  const totalVal = entries.reduce((sum, [, c]) => sum + c, 0);
                  if (totalVal === 0) return null;
                  const size = 130;
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
                      <View style={{ width: size, height: size, borderRadius: half, overflow: "hidden", backgroundColor: colors.card }}>
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
                        <View style={{ position: "absolute", top: 0, left: 0, width: size, height: size, alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>{total}</Text>
                          <Text style={{ color: colors.textMuted, fontSize: 10 }}>Total</Text>
                        </View>
                      </View>
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
              width: chartIndex === i ? 18 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: chartIndex === i ? colors.primary : colors.textMuted + "30",
            }}
          />
        ))}
      </View>
    </View>
  );
});

export default memo(StatusChart);
