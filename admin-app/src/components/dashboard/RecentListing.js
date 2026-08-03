import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Building2, MapPin, TrendingUp } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

const STATUS_MAP = {
  AVAILABLE: { label: "Available", color: "#22C55E", bg: "#DCFCE7", darkBg: "#0D2E1A" },
  PENDING: { label: "Pending", color: "#F59E0B", bg: "#FEF3C7", darkBg: "#2D2006" },
  SOLD: { label: "Sold", color: "#EF4444", bg: "#FEE2E2", darkBg: "#2D1215" },
};

const RecentListing = memo(function RecentListing({ listing }) {
  const { colors, radii, isDark } = useTheme();
  const status = listing.status || "AVAILABLE";
  const cfg = STATUS_MAP[status] || STATUS_MAP.AVAILABLE;
  const image = listing.images?.[0];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: radii.md,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: 46, height: 46, borderRadius: radii.sm }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: radii.sm,
            backgroundColor: colors.bgTertiary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Building2 size={18} color={colors.textMuted} strokeWidth={1.75} />
        </View>
      )}

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
          {listing.title || "Untitled"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <MapPin size={11} color={colors.textMuted} strokeWidth={1.75} />
          <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 4 }}>
            {listing.city || "—"}
          </Text>
          {listing.price != null && (
            <>
              <Text style={{ color: colors.textMuted + "40", fontSize: 11, marginHorizontal: 6 }}>·</Text>
              <TrendingUp size={11} color={colors.textMuted} strokeWidth={1.75} />
              <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 4 }}>
                {Number(listing.price).toLocaleString()} ETB
              </Text>
            </>
          )}
        </View>
      </View>

      <View
        style={{
          backgroundColor: isDark ? cfg.darkBg : cfg.bg,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 9999,
        }}
      >
        <Text style={{ color: cfg.color, fontSize: 10, fontWeight: "600", letterSpacing: 0.3 }}>
          {cfg.label}
        </Text>
      </View>
    </View>
  );
});

export default memo(RecentListing);
