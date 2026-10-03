import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../../services/api";
import CHWHeader from "../../components/CHWHeader";

interface ScannedClient {
  id: string;
  client_name: string;
  client_phone: string;
  client_age: number;
  client_gender: string;
  client_district: string;
  created_at: string;
  // screening data we can pass along
  screening_id?: string;
}

export default function SelectClientForReferralScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState("");
  const [allClients, setAllClients] = useState<ScannedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      // getScreenings returns {success, data:[{id, client_name, client_phone, ...}]}
      const res = await apiService.getScreenings();
      if (res.success && Array.isArray(res.data)) {
        // Deduplicate by phone/name — keep most recent screening per client
        const seen = new Map<string, ScannedClient>();
        for (const s of res.data as ScannedClient[]) {
          const key = (s.client_phone || s.client_name || s.id)
            .trim()
            .toLowerCase();
          if (!seen.has(key)) {
            seen.set(key, {
              id: s.id,
              client_name: s.client_name || "Unknown",
              client_phone: s.client_phone || "",
              client_age: s.client_age,
              client_gender: s.client_gender || "",
              client_district: s.client_district || "",
              created_at: s.created_at || "",
              screening_id: s.id,
            });
          }
        }
        setAllClients(Array.from(seen.values()));
      } else {
        setError("Could not load clients from server.");
      }
    } catch (e: any) {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = query.trim()
    ? allClients.filter(
        (c) =>
          c.client_name.toLowerCase().includes(query.toLowerCase()) ||
          c.client_phone.includes(query) ||
          c.client_district.toLowerCase().includes(query.toLowerCase()),
      )
    : allClients;

  const handleSelect = (client: ScannedClient) => {
    // Navigate to CreateReferralScreen with client pre-filled.
    // fromScreening = false so the form is NOT locked/read-only, and
    // after save it goes back (not reset to AppTabs).
    navigation.navigate("CreateReferralScreen", {
      fromScreening: false,
      screeningId: client.screening_id || null,
      clientName: client.client_name,
      clientPhone: client.client_phone,
      clientAge: client.client_age ? String(client.client_age) : "",
      clientSex: client.client_gender,
      district: client.client_district,
    });
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderClient = ({ item }: { item: ScannedClient }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() => handleSelect(item)}
      activeOpacity={0.85}
    >
      <View style={styles.clientAvatar}>
        <Text style={styles.clientAvatarText}>
          {(item.client_name || "?")[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.client_name}</Text>
        <View style={styles.clientMeta}>
          {item.client_age ? (
            <Text style={styles.clientMetaText}>Age {item.client_age}</Text>
          ) : null}
          {item.client_gender ? (
            <Text style={styles.clientMetaText}>{item.client_gender}</Text>
          ) : null}
          {item.client_district ? (
            <Text style={styles.clientMetaText}>{item.client_district}</Text>
          ) : null}
        </View>
        {item.client_phone ? (
          <Text style={styles.clientPhone}>
            <Ionicons name="call-outline" size={12} color="#6B7280" />{" "}
            {item.client_phone}
          </Text>
        ) : null}
        {item.created_at ? (
          <Text style={styles.clientDate}>
            Screened {formatDate(item.created_at)}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <CHWHeader />

      {/* Page header */}
      <View style={styles.pageHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#1E40AF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Select Client</Text>
          <Text style={styles.pageSubtitle}>
            Choose a recently screened client to refer
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone or district..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading clients…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color="#D1D5DB" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadClients}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={56} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            {query ? "No clients found" : "No screened clients yet"}
          </Text>
          <Text style={styles.emptyText}>
            {query
              ? "Try a different name, phone or district."
              : "Complete a screening first, then create a referral here."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderClient}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  backBtn: { padding: 4 },
  pageTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  pageSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 1 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 0,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  separator: { height: 1, backgroundColor: "#F3F4F6" },

  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    gap: 12,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  clientAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16A34A",
  },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 3 },
  clientMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 3 },
  clientMetaText: {
    fontSize: 12,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  clientPhone: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  clientDate: { fontSize: 11, color: "#9CA3AF" },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: { fontSize: 14, color: "#6B7280", marginTop: 8 },
  errorText: { fontSize: 14, color: "#DC2626", textAlign: "center" },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    marginTop: 4,
  },
  retryBtnText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  emptyTitle: { fontSize: 17, fontWeight: "600", color: "#374151", textAlign: "center" },
  emptyText: { fontSize: 13, color: "#9CA3AF", textAlign: "center", lineHeight: 20 },
});
