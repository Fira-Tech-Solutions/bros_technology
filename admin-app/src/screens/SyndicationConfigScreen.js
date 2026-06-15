import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
  Modal,
  RefreshControl,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Send,
  Save,
  Key,
  Hash,
  Eye,
  EyeOff,
  Power,
  MessageCircle,
  ChevronRight,
  Bot,
  Users,
  Check,
  X,
  Clock,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  CircleCheck,
  CircleX,
  AlertTriangle,
  Pencil,
  Settings,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";
import {
  getSyndicationConfigs,
  saveSyndicationConfig,
  getTelegramInfo,
  getSyndicationLogs,
  deleteSyndicationMessage,
  editSyndicationMessage,
  retrySyndication,
} from "../api/syndication";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_MAP = {
  PENDING: { label: "Pending", color: "#eab308", Icon: Clock },
  SUCCESS: { label: "Success", color: "#22c55e", Icon: CircleCheck },
  FAILED: { label: "Failed", color: "#ef4444", Icon: CircleX },
};

const ACTION_MAP = {
  NEW_POST: { label: "New Post", color: "#3b82f6", bg: "#3b82f618" },
  EDITED: { label: "Edited", color: "#a855f7", bg: "#a855f718" },
  DELETED: { label: "Deleted", color: "#ef4444", bg: "#ef444418" },
};

const FILTER_OPTIONS = [
  { key: null, label: "All" },
  { key: "SUCCESS", label: "Successful" },
  { key: "PENDING", label: "Pending" },
  { key: "FAILED", label: "Failed" },
];

const screenWidth = Dimensions.get("window").width;

function SettingsTab({ colors }) {
  const [botToken, setBotToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [botInfo, setBotInfo] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const [testing, setTesting] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configRes, infoRes] = await Promise.all([
        getSyndicationConfigs(),
        getTelegramInfo(),
      ]);
      const tgConfig = (configRes.data.data || []).find(
        (c) => c.platform === "TELEGRAM"
      );
      if (tgConfig) {
        setBotToken(tgConfig.botToken || "");
        setChannelId(tgConfig.channelId || "");
        setIsActive(tgConfig.isActive !== false);
      }
      if (infoRes.data.data) {
        setBotInfo(infoRes.data.data.bot);
        setChannelInfo(infoRes.data.data.channel);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!botToken.trim()) {
      Alert.alert("Error", "Bot token is required");
      return;
    }
    if (!channelId.trim()) {
      Alert.alert("Error", "Channel ID is required");
      return;
    }
    setSaving(true);
    try {
      await saveSyndicationConfig({
        platform: "TELEGRAM",
        botToken: botToken.trim(),
        channelId: channelId.trim(),
        isActive,
      });
      Alert.alert("Success", "Telegram config saved");
      setConfigOpen(false);
      loadData();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const { data } = await getTelegramInfo();
      if (data.data.bot && data.data.channel) {
        setBotInfo(data.data.bot);
        setChannelInfo(data.data.channel);
        Alert.alert("Success", `Connected to @${data.data.bot.username}`);
      } else {
        Alert.alert("Error", "Could not connect. Check your bot token and channel ID.");
      }
    } catch {
      Alert.alert("Error", "Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      {/* Bot Info Card */}
      {botInfo && (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {botInfo.photoUrl ? (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  overflow: "hidden",
                  marginRight: 14,
                  borderWidth: 2,
                  borderColor: colors.primary,
                }}
              >
                <Image
                  source={{ uri: botInfo.photoUrl }}
                  style={{ width: 56, height: 56 }}
                />
              </View>
            ) : (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: `${colors.primary}15`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                  borderWidth: 2,
                  borderColor: colors.primary,
                }}
              >
                <Bot size={24} color={colors.primary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
                {botInfo.first_name}
              </Text>
              <Text style={{ color: colors.primary, fontSize: 13, marginTop: 2 }}>
                @{botInfo.username}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                ID: {botInfo.id} · {botInfo.can_join_groups ? "Can join groups" : "Private"}
              </Text>
            </View>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#22c55e",
              }}
            />
          </View>
        </View>
      )}

      {/* Channel Info Card */}
      {channelInfo && (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {channelInfo.photoUrl ? (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  overflow: "hidden",
                  marginRight: 14,
                  borderWidth: 2,
                  borderColor: colors.primary,
                }}
              >
                <Image
                  source={{ uri: channelInfo.photoUrl }}
                  style={{ width: 56, height: 56 }}
                />
              </View>
            ) : (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: `${colors.primary}15`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                  borderWidth: 2,
                  borderColor: colors.primary,
                }}
              >
                <Send size={24} color={colors.primary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }} numberOfLines={1}>
                {channelInfo.title}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                {channelInfo.type} · {channelInfo.memberCount || 0} members
              </Text>
              {channelInfo.username && (
                <Text style={{ color: colors.primary, fontSize: 12, marginTop: 2 }}>
                  @{channelInfo.username}
                </Text>
              )}
            </View>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#22c55e",
              }}
            />
          </View>
        </View>
      )}

      {/* Gear Button */}
      <TouchableOpacity
        onPress={() => setConfigOpen(true)}
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: `${colors.primary}15`,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Settings size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
              Configuration
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
              Bot token, channel, status
            </Text>
          </View>
        </View>
        <ChevronRight size={16} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Config Modal */}
      <Modal visible={configOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: colors.bgSecondary,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "85%",
            }}
          >
            <View style={{ alignItems: "center", paddingTop: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                }}
              />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700" }}>
                  Configuration
                </Text>
                <TouchableOpacity onPress={() => setConfigOpen(false)} style={{ padding: 4 }}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>
                Bot Token
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.input,
                  borderWidth: 1.5,
                  borderColor: colors.inputBorder,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  marginBottom: 16,
                }}
              >
                <Key size={16} color={colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  value={botToken}
                  onChangeText={setBotToken}
                  placeholder="123456:ABC-DEF..."
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showToken}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{ flex: 1, color: colors.text, fontSize: 14 }}
                />
                <TouchableOpacity onPress={() => setShowToken(!showToken)} style={{ padding: 4 }}>
                  {showToken ? (
                    <EyeOff size={16} color={colors.textMuted} />
                  ) : (
                    <Eye size={16} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>
                Channel / Group ID
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.input,
                  borderWidth: 1.5,
                  borderColor: colors.inputBorder,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  marginBottom: 16,
                }}
              >
                <Hash size={16} color={colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  value={channelId}
                  onChangeText={setChannelId}
                  placeholder="-1001234567890"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{ flex: 1, color: colors.text, fontSize: 14 }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: colors.input,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  marginBottom: 24,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Power size={16} color={colors.textMuted} style={{ marginRight: 10 }} />
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}>Active</Text>
                </View>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.primaryText}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={handleTestConnection}
                  disabled={testing}
                  style={{
                    flex: 1,
                    backgroundColor: colors.bgTertiary,
                    borderRadius: 12,
                    height: 48,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: colors.border,
                    opacity: testing ? 0.6 : 1,
                  }}
                >
                  {testing ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <RefreshCw size={14} color={colors.textMuted} />
                      <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600", marginLeft: 6 }}>
                        Test
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={saving}
                  style={{
                    flex: 2,
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    height: 48,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.primaryText} />
                  ) : (
                    <>
                      <Save size={14} color={colors.primaryText} />
                      <Text style={{ color: colors.primaryText, fontSize: 13, fontWeight: "700", marginLeft: 6 }}>
                        Save Config
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function PostsTab({ colors }) {
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [detailModal, setDetailModal] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const pagerRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const lastPage = useRef(0);

  useEffect(() => {
    const id = scrollX.addListener(({ value }) => {
      const idx = Math.round(value / screenWidth);
      if (idx !== lastPage.current && idx >= 0 && idx < FILTER_OPTIONS.length) {
        lastPage.current = idx;
        setPageIndex(idx);
      }
    });
    return () => scrollX.removeListener(id);
  }, []);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data } = await getSyndicationLogs({ limit: 200 });
      setAllLogs(data.data || []);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const pageLogs = useMemo(() => {
    return FILTER_OPTIONS.map((opt) => {
      if (!opt.key) return allLogs;
      return allLogs.filter((l) => l.status === opt.key);
    });
  }, [allLogs]);

  const onFilterPress = (idx) => {
    setPageIndex(idx);
    lastPage.current = idx;
    pagerRef.current?.scrollToIndex({ index: idx, animated: true });
  };

  const handleDelete = (log) => {
    if (!log.messageId) {
      Alert.alert("Error", "No message ID found for this post");
      return;
    }
    Alert.alert("Delete Post", `Delete this post from Telegram?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(log.id);
          try {
            await deleteSyndicationMessage(log.messageId, log.id);
            setAllLogs((prev) =>
              prev.map((l) =>
                l.id === log.id ? { ...l, action: "DELETED", messageId: null } : l
              )
            );
            setDetailModal(null);
            Alert.alert("Success", "Post deleted from Telegram");
          } catch (err) {
            Alert.alert("Error", err.response?.data?.error || "Failed to delete");
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  };

  const handleEdit = (log) => {
    setDetailModal(log);
    setEditCaption(log.listing?.title || "");
  };

  const handleSaveEdit = async () => {
    if (!detailModal?.messageId) return;
    setEditing(true);
    try {
      await editSyndicationMessage(detailModal.messageId, editCaption);
      setAllLogs((prev) =>
        prev.map((l) =>
          l.id === detailModal.id ? { ...l, action: "EDITED" } : l
        )
      );
      Alert.alert("Success", "Post updated on Telegram");
      setDetailModal(null);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Failed to edit");
    } finally {
      setEditing(false);
    }
  };

  const handleRetry = async (log) => {
    try {
      await retrySyndication(log.id);
      setAllLogs((prev) =>
        prev.map((l) =>
          l.id === log.id ? { ...l, status: "PENDING", action: "NEW_POST", errorMessage: null } : l
        )
      );
      Alert.alert("Success", "Re-syndication triggered");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Failed to retry");
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderLogItem = (item) => {
    const statusCfg = STATUS_MAP[item.status] || {
      label: item.status,
      color: colors.textMuted,
      Icon: Clock,
    };
    const actionCfg = ACTION_MAP[item.action] || null;
    const imageUrl = item.listing?.images?.[0];
    const imageUri = imageUrl?.startsWith("http")
      ? imageUrl
      : imageUrl
        ? `${API_BASE_URL}/${imageUrl}`
        : null;

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleEdit(item)}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 52, height: 52, borderRadius: 10 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 10,
                backgroundColor: colors.bgTertiary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ImageIcon size={18} color={colors.textMuted} />
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
              {item.listing?.title || "Unknown listing"}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
              {item.listing?.city}, {item.listing?.neighborhood}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, flexWrap: "wrap", gap: 6 }}>
              <View
                style={{
                  backgroundColor: `${statusCfg.color}18`,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <statusCfg.Icon size={10} color={statusCfg.color} />
                <Text style={{ color: statusCfg.color, fontSize: 10, fontWeight: "700", marginLeft: 4 }}>
                  {statusCfg.label}
                </Text>
              </View>
              {actionCfg && (
                <View
                  style={{
                    backgroundColor: actionCfg.bg,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: actionCfg.color, fontSize: 10, fontWeight: "700" }}>
                    {actionCfg.label}
                  </Text>
                </View>
              )}
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                {formatDate(item.runAt)}
              </Text>
            </View>
            {item.errorMessage && (
              <Text style={{ color: colors.danger, fontSize: 11, marginTop: 4 }} numberOfLines={1}>
                {item.errorMessage}
              </Text>
            )}
          </View>
          <ChevronRight size={16} color={colors.textMuted} style={{ marginTop: 4 }} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderPage = ({ item: logs, index }) => (
    <View style={{ width: screenWidth, flex: 1 }}>
      {logs.length === 0 ? (
        <View style={{ alignItems: "center", paddingTop: 60, paddingHorizontal: 40 }}>
          <MessageCircle size={40} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 12 }}>
            No posts found
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4, textAlign: "center" }}>
            {FILTER_OPTIONS[index].key
              ? `No ${FILTER_OPTIONS[index].label.toLowerCase()} posts`
              : "Posts will appear here after syndication"}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {logs.map((item) => renderLogItem(item))}
        </ScrollView>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          marginTop: 12,
          marginBottom: 4,
          gap: 6,
        }}
      >
        {FILTER_OPTIONS.map((opt, idx) => {
          const isActive = pageIndex === idx;
          return (
            <TouchableOpacity
              key={opt.key || "all"}
              onPress={() => onFilterPress(idx)}
              style={{
                flex: 1,
                paddingVertical: 7,
                borderRadius: 8,
                backgroundColor: isActive ? colors.primary : colors.bgTertiary,
                borderWidth: 1,
                borderColor: isActive ? colors.primary : colors.border,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: isActive ? colors.primaryText : colors.textMuted,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        ref={pagerRef}
        data={pageLogs}
        renderItem={renderPage}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        style={{ flex: 1 }}
      />

      <Modal visible={!!detailModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: colors.bgSecondary,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "85%",
            }}
          >
            <View style={{ alignItems: "center", paddingTop: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                }}
              />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700" }}>
                  Post Details
                </Text>
                <TouchableOpacity onPress={() => setDetailModal(null)} style={{ padding: 4 }}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {detailModal && (
                <>
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 14,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: colors.border,
                      marginBottom: 14,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {detailModal.listing?.images?.[0] ? (
                        <Image
                          source={{
                            uri: detailModal.listing.images[0].startsWith("http")
                              ? detailModal.listing.images[0]
                              : `${API_BASE_URL}/${detailModal.listing.images[0]}`,
                          }}
                          style={{ width: 64, height: 64, borderRadius: 10 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 10,
                            backgroundColor: colors.bgTertiary,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ImageIcon size={20} color={colors.textMuted} />
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }} numberOfLines={1}>
                          {detailModal.listing?.title}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>
                          {detailModal.listing?.city}, {detailModal.listing?.neighborhood}
                        </Text>
                        {detailModal.listing?.price && (
                          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700", marginTop: 4 }}>
                            ${Number(detailModal.listing.price).toLocaleString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
                    {(() => {
                      const st = STATUS_MAP[detailModal.status] || { label: detailModal.status, color: colors.textMuted, Icon: Clock };
                      return (
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: `${st.color}18`,
                            paddingVertical: 8,
                            borderRadius: 10,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                          }}
                        >
                          <st.Icon size={12} color={st.color} />
                          <Text style={{ color: st.color, fontSize: 12, fontWeight: "700", marginLeft: 5 }}>
                            {st.label}
                          </Text>
                        </View>
                      );
                    })()}
                    {(() => {
                      const ac = ACTION_MAP[detailModal.action];
                      if (!ac) return null;
                      return (
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: ac.bg,
                            paddingVertical: 8,
                            borderRadius: 10,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: ac.color, fontSize: 12, fontWeight: "700" }}>
                            {ac.label}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>

                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 14,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: colors.border,
                      marginBottom: 14,
                    }}
                  >
                    <DetailRow label="Posted" value={formatDate(detailModal.runAt)} colors={colors} />
                    {detailModal.messageId && (
                      <DetailRow label="Message ID" value={String(detailModal.messageId)} colors={colors} />
                    )}
                    <DetailRow label="Channel" value={detailModal.channelInfo} colors={colors} />
                    <DetailRow label="Platform" value={detailModal.platform} colors={colors} />
                    {detailModal.errorMessage && (
                      <DetailRow label="Error" value={detailModal.errorMessage} colors={colors} valueColor={colors.danger} />
                    )}
                  </View>

                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 14,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: colors.border,
                      marginBottom: 14,
                    }}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 8 }}>
                      Telegram Caption
                    </Text>
                    <TextInput
                      value={editCaption}
                      onChangeText={setEditCaption}
                      multiline
                      numberOfLines={5}
                      placeholderTextColor={colors.textMuted}
                      style={{
                        backgroundColor: colors.input,
                        borderWidth: 1.5,
                        borderColor: colors.inputBorder,
                        borderRadius: 10,
                        padding: 12,
                        color: colors.text,
                        fontSize: 13,
                        minHeight: 100,
                        textAlignVertical: "top",
                        lineHeight: 18,
                      }}
                    />
                  </View>

                  {detailModal.status === "SUCCESS" && detailModal.messageId && (
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                      <TouchableOpacity
                        onPress={handleSaveEdit}
                        disabled={editing}
                        style={{
                          flex: 1,
                          backgroundColor: colors.primary,
                          borderRadius: 12,
                          height: 46,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: editing ? 0.6 : 1,
                        }}
                      >
                        {editing ? (
                          <ActivityIndicator color={colors.primaryText} />
                        ) : (
                          <>
                            <Check size={15} color={colors.primaryText} />
                            <Text style={{ color: colors.primaryText, fontSize: 13, fontWeight: "700", marginLeft: 6 }}>
                              Save & Update
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(detailModal)}
                        disabled={deleting === detailModal.id}
                        style={{
                          backgroundColor: `${colors.danger}15`,
                          borderRadius: 12,
                          height: 46,
                          width: 46,
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1,
                          borderColor: `${colors.danger}30`,
                          opacity: deleting === detailModal.id ? 0.6 : 1,
                        }}
                      >
                        {deleting === detailModal.id ? (
                          <ActivityIndicator size={15} color={colors.danger} />
                        ) : (
                          <Trash2 size={15} color={colors.danger} />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {detailModal.status === "FAILED" && (
                    <TouchableOpacity
                      onPress={() => {
                        setDetailModal(null);
                        handleRetry(detailModal);
                      }}
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: 12,
                        height: 46,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 20,
                      }}
                    >
                      <RefreshCw size={15} color={colors.primaryText} />
                      <Text style={{ color: colors.primaryText, fontSize: 13, fontWeight: "700", marginLeft: 6 }}>
                        Retry Syndication
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ label, value, colors, valueColor }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: valueColor || colors.text, fontSize: 12, fontWeight: "500", maxWidth: "60%", textAlign: "right" }} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export default function SyndicationConfigScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState("posts");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1 }}>
        <View className="px-5 pt-4 pb-2">
          <Text style={{ color: colors.text }} className="text-2xl font-bold">
            Syndication
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 20,
            marginTop: 8,
            marginBottom: 4,
            backgroundColor: colors.bgTertiary,
            borderRadius: 10,
            padding: 3,
          }}
        >
          {[
            { key: "settings", label: "Settings", icon: Send },
            { key: "posts", label: "Posts", icon: MessageCircle },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => setTab(item.key)}
              style={{
                flex: 1,
                flexDirection: "row",
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: tab === item.key ? colors.primary : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <item.icon
                size={14}
                color={tab === item.key ? colors.primaryText : colors.textMuted}
              />
              <Text
                style={{
                  color: tab === item.key ? colors.primaryText : colors.textMuted,
                  fontSize: 13,
                  fontWeight: "600",
                  marginLeft: 6,
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "settings" ? <SettingsTab colors={colors} /> : <PostsTab colors={colors} />}
      </View>
    </SafeAreaView>
  );
}
