import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MapPin, ChevronRight } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

const STATUS_MAP = {
  AVAILABLE: { label: "Available", color: "#22C55E", bg: "#DCFCE7", darkBg: "#0D2E1A" },
  PENDING: { label: "Pending", color: "#F59E0B", bg: "#FEF3C7", darkBg: "#2D2006" },
  SOLD: { label: "Sold", color: "#EF4444", bg: "#FEE2E2", darkBg: "#2D1215" },
  ARCHIVED: { label: "Archived", color: "#6B7280", bg: "#F3F4F6", darkBg: "#1F2429" },
};

const ListingCard = memo(function ListingCard({ listing, index = 0, onPress }) {
  const { colors, radii, shadows, isDark } = useTheme();

  const status = listing.status || "AVAILABLE";
  const cfg = STATUS_MAP[status] || STATUS_MAP.AVAILABLE;
  const image = listing.images?.[0];

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(200)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          ...shadows.sm(),
        }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: 64, height: 64, borderRadius: radii.sm }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radii.sm,
              backgroundColor: colors.bgTertiary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 20 }}>📦</Text>
          </View>
        )}

        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text
            style={{ color: colors.text, fontSize: 15, fontWeight: "600", letterSpacing: -0.2 }}
            numberOfLines={1}
          >
            {listing.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
            <MapPin size={11} color={colors.textMuted} strokeWidth={1.75} />
            <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 4 }} numberOfLines={1}>
              {listing.neighborhood}{listing.city ? `, ${listing.city}` : ""}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "700" }}>
              {Number(listing.price).toLocaleString()} ETB
            </Text>
            <View style={{ flex: 1 }} />
            <View
              style={{
                backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 9999,
              }}
            >
              <Text style={{ color: cfg.color, fontSize: 10, fontWeight: "600", letterSpacing: 0.3 }}>
                {cfg.label}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} style={{ marginLeft: 6 }} strokeWidth={1.75} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default ListingCard;
