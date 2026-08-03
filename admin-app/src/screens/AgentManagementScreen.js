import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Share,
  ActivityIndicator,
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  Users,
  Plus,
  Copy,
  Trash2,
  Clock,
  Check,
  Share2,
  User,
  Phone,
} from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import {
  generateAgentCode,
  getAgentCodes,
  revokeAgentCode,
  getAgents,
  removeAgent,
} from "../api/agents";

function CodeCard({ code, colors, radii, onRevoke, onShare, copiedId, onCopy }) {
  const isExpired = new Date(code.expiresAt) < new Date();
  const isActive = !code.isUsed && !isExpired;
  const isCopied = copiedId === code.id;

  const timeLeft = () => {
    if (code.isUsed) return "Used";
    if (isExpired) return "Expired";
    const diff = new Date(code.expiresAt) - new Date();
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isActive ? colors.primary + "40" : colors.border,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", letterSpacing: 3 }}>
            {code.code}
          </Text>
          <TouchableOpacity
            onPress={() => onCopy(code.id, code.code)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: isCopied ? "#22C55E18" : colors.bgSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isCopied ? (
              <Check size={14} color="#22C55E" strokeWidth={3} />
            ) : (
              <Copy size={14} color={colors.textMuted} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            backgroundColor: isActive ? "#22C55E18" : code.isUsed ? "#6366F118" : "#EF444418",
          }}
        >
          <Text
            style={{
              color: isActive ? "#22C55E" : code.isUsed ? "#6366F1" : "#EF4444",
              fontSize: 11,
              fontWeight: "700",
            }}
          >
            {isActive ? "ACTIVE" : code.isUsed ? "USED" : "EXPIRED"}
          </Text>
        </View>
      </View>

      {code.agentName && (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <User size={13} color={colors.textMuted} strokeWidth={1.75} />
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 6 }}>{code.agentName}</Text>
        </View>
      )}
      {code.agentPhone && (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Phone size={13} color={colors.textMuted} strokeWidth={1.75} />
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 6 }}>{code.agentPhone}</Text>
        </View>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: isActive ? 12 : 0 }}>
        <Clock size={13} color={colors.textMuted} strokeWidth={1.75} />
        <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 6 }}>
          {timeLeft()} • Created {new Date(code.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {isActive && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => onShare(code.code)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary + "15",
              borderRadius: radii.md,
              paddingVertical: 10,
              gap: 6,
            }}
          >
            <Share2 size={15} color={colors.primary} strokeWidth={2} />
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRevoke(code.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#EF444415",
              borderRadius: radii.md,
              paddingVertical: 10,
              paddingHorizontal: 14,
              gap: 6,
            }}
          >
            <Trash2 size={15} color="#EF4444" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function AgentCard({ agent, colors, radii, onRemove }) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primary + "20",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 17, fontWeight: "700" }}>
            {agent.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>{agent.name}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{agent.email}</Text>
        </View>
        <View
          style={{
            backgroundColor: "#6366F118",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#6366F1", fontSize: 11, fontWeight: "700" }}>
            {agent._count?.listings || 0} listings
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Phone size={13} color={colors.textMuted} strokeWidth={1.75} />
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 6 }}>{agent.phone}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Clock size={13} color={colors.textMuted} strokeWidth={1.75} />
        <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 6 }}>
          Joined {new Date(agent.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onRemove(agent)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#EF444415",
          borderRadius: radii.md,
          paddingVertical: 10,
          gap: 6,
        }}
      >
        <Trash2 size={15} color="#EF4444" strokeWidth={2} />
        <Text style={{ color: "#EF4444", fontSize: 13, fontWeight: "600" }}>Remove Agent</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AgentManagementScreen({ navigation }) {
  const { colors, radii } = useTheme();
  const [tab, setTab] = useState("codes");
  const [codes, setCodes] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const copyTimeout = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [codesRes, agentsRes] = await Promise.all([
        getAgentCodes(),
        getAgents(),
      ]);
      setCodes(codesRes.data.data || []);
      setAgents(agentsRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch agent data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateAgentCode({
        agentName: agentName.trim() || undefined,
        agentPhone: agentPhone.trim() || undefined,
      });
      const newCode = res.data.data;
      setCodes((prev) => [newCode, ...prev]);
      setShowGenerateModal(false);
      setAgentName("");
      setAgentPhone("");

      Alert.alert(
        "Code Generated",
        `Code: ${newCode.code}\nExpires in 30 minutes`,
        [
          {
            text: "Share",
            onPress: () => shareCode(newCode.code),
          },
          { text: "OK" },
        ]
      );
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Failed to generate code");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id) => {
    Alert.alert("Revoke Code", "Are you sure you want to revoke this code?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke",
        style: "destructive",
        onPress: async () => {
          try {
            await revokeAgentCode(id);
            setCodes((prev) => prev.filter((c) => c.id !== id));
          } catch (err) {
            Alert.alert("Error", "Failed to revoke code");
          }
        },
      },
    ]);
  };

  const handleRemoveAgent = async (agent) => {
    Alert.alert(
      "Remove Agent",
      `Remove ${agent.name} and all their listings?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeAgent(agent.id);
              setAgents((prev) => prev.filter((a) => a.id !== agent.id));
            } catch (err) {
              Alert.alert("Error", "Failed to remove agent");
            }
          },
        },
      ]
    );
  };

  const shareCode = async (code) => {
    try {
      await Share.share({
        message: `Your BROS Technology agent registration code is: ${code}\n\nUse this code to create your account. It expires in 30 minutes.`,
      });
    } catch {}
  };

  const handleCopy = async (id, code) => {
    Clipboard.setString(code);
    setCopiedId(id);
    if (copyTimeout.current) clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCodes = codes.filter((c) => {
    if (tab === "active") return !c.isUsed && new Date(c.expiresAt) > new Date();
    if (tab === "used") return c.isUsed;
    return true;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700", letterSpacing: -0.5 }}>
              Agents
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
              {agents.length} registered • {codes.filter((c) => !c.isUsed && new Date(c.expiresAt) > new Date()).length} active codes
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowGenerateModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: radii.md,
              gap: 6,
            }}
          >
            <Plus size={17} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>New Code</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", paddingHorizontal: 20, marginBottom: 16, gap: 8 }}>
          {[
            { key: "codes", label: "Codes" },
            { key: "active", label: "Active" },
            { key: "used", label: "Used" },
            { key: "agents", label: "Registered" },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: tab === t.key ? colors.primary + "18" : colors.bgSecondary,
              }}
            >
              <Text
                style={{
                  color: tab === t.key ? colors.primary : colors.textMuted,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 20 }}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : tab === "agents" ? (
            agents.length === 0 ? (
              <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>No agents registered yet</Text>
            ) : (
              agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  colors={colors}
                  radii={radii}
                  onRemove={handleRemoveAgent}
                />
              ))
            )
          ) : filteredCodes.length === 0 ? (
            <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 40 }}>No codes found</Text>
          ) : (
            filteredCodes.map((code) => (
              <CodeCard
                key={code.id}
                code={code}
                colors={colors}
                radii={radii}
                onRevoke={handleRevoke}
                onShare={shareCode}
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Generate Code Modal */}
      <Modal visible={showGenerateModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.bg, borderRadius: radii.xl, padding: 24 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: 6 }}>
              Generate Agent Code
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 20 }}>
              A 6-digit code will be generated. It expires in 30 minutes.
            </Text>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>Agent Name (optional)</Text>
              <TextInput
                value={agentName}
                onChangeText={setAgentName}
                placeholder="Enter agent name"
                placeholderTextColor={colors.textMuted + "80"}
                style={{
                  backgroundColor: colors.input,
                  borderRadius: radii.md,
                  borderWidth: 1.5,
                  borderColor: colors.inputBorder,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.text,
                  fontSize: 15,
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>Agent Phone (optional)</Text>
              <TextInput
                value={agentPhone}
                onChangeText={setAgentPhone}
                placeholder="+251..."
                placeholderTextColor={colors.textMuted + "80"}
                keyboardType="phone-pad"
                style={{
                  backgroundColor: colors.input,
                  borderRadius: radii.md,
                  borderWidth: 1.5,
                  borderColor: colors.inputBorder,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.text,
                  fontSize: 15,
                }}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowGenerateModal(false);
                  setAgentName("");
                  setAgentPhone("");
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: radii.md,
                  backgroundColor: colors.bgSecondary,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleGenerate}
                disabled={generating}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: radii.md,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  opacity: generating ? 0.6 : 1,
                }}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>Generate</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
