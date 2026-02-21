import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Referral {
  id: string;
  clientName: string;
  clientAge: number;
  clientPhone: string;
  reason: string;
  urgency: "urgent" | "normal" | "high";
  facilityName: string;
  facilityLocation: string;
  referredDate: string;
  status: "active" | "completed";
}

export default function ReferralManagementScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadUserData(), loadReferrals()]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("userData");
      if (userStr) {
        setUserData(JSON.parse(userStr));
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const loadReferrals = async () => {
    try {
      const response = await apiService.getReferrals();
      if (response.success) {
        setReferrals(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load referrals:", error);
      setReferrals([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReferrals();
    setRefreshing(false);
  };

  const handleMarkComplete = async (referralId: string) => {
    Alert.alert(
      "Mark as Complete",
      "Has the client completed their visit to the health facility?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Complete",
          onPress: async () => {
            try {
              await apiService.updateReferralStatus(referralId, "completed");
              await loadReferrals();
              Alert.alert("Success", "Referral marked as completed");
            } catch (error) {
              Alert.alert("Error", "Failed to update referral status");
            }
          },
        },
      ]
    );
  };

  const activeReferrals = referrals.filter((r) => r.status === "active");
  const completedReferrals = referrals.filter((r) => r.status === "completed");
  const urgentCount = activeReferrals.filter((r) => r.urgency === "urgent" || r.urgency === "high").length;

  const displayedReferrals = activeTab === "active" ? activeReferrals : completedReferrals;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading referrals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Santé Initiative Uganda</Text>
            <Text style={styles.headerName}>{userData?.fullName || "CHW User"}</Text>
            <Text style={styles.headerRole}>
              CHW - {userData?.district || "District"}
            </Text>
          </View>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={20} color="#2E7D32" />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Referral Management</Text>
          <Text style={styles.pageSubtitle}>Advanced eye care & NCD screening</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeReferrals.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statNumber}>{urgentCount}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statNumber}>{completedReferrals.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "active" && styles.tabActive]}
            onPress={() => setActiveTab("active")}
          >
            <Text style={[styles.tabText, activeTab === "active" && styles.tabTextActive]}>
              Active Referrals
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "completed" && styles.tabActive]}
            onPress={() => setActiveTab("completed")}
          >
            <Text style={[styles.tabText, activeTab === "completed" && styles.tabTextActive]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Referrals List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {displayedReferrals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {activeTab === "active" ? "No active referrals" : "No completed referrals"}
            </Text>
          </View>
        ) : (
          displayedReferrals.map((referral) => (
            <View key={referral.id} style={styles.referralCard}>
              <View style={styles.referralHeader}>
                <View style={styles.referralHeaderLeft}>
                  <Text style={styles.referralName}>{referral.clientName}</Text>
                  <Text style={styles.referralInfo}>
                    Age {referral.clientAge} • {referral.clientPhone}
                  </Text>
                </View>
                {(referral.urgency === "urgent" || referral.urgency === "high") && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>Urgent</Text>
                  </View>
                )}
              </View>

              <View style={styles.referralBody}>
                <View style={styles.referralRow}>
                  <Text style={styles.referralLabel}>Reason for referral</Text>
                  <Text style={styles.referralValue}>{referral.reason}</Text>
                </View>

                <View style={styles.referralRow}>
                  <Text style={styles.referralLabel}>Referred to</Text>
                  <Text style={styles.referralValue}>{referral.facilityName}</Text>
                </View>

                <View style={styles.referralRow}>
                  <Text style={styles.referralLabel}>Referred on</Text>
                  <Text style={styles.referralValue}>
                    {new Date(referral.referredDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              {activeTab === "active" && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleMarkComplete(referral.id)}
                >
                  <Text style={styles.completeButtonText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {/* Partner Facilities */}
        <View style={styles.facilitiesCard}>
          <Text style={styles.facilitiesTitle}>Partner Facilities</Text>
          <View style={styles.facilitiesList}>
            <Text style={styles.facilityItem}>• Luweero Hospital Eye Clinic</Text>
            <Text style={styles.facilityItem}>• Bombo Health Center IV</Text>
            <Text style={styles.facilityItem}>• Kiwoko Hospital</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create New Referral Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("VisionScreen1")}
      >
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create New Referral</Text>
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "CHWTabs" }] })}
        >
          <Ionicons name="home-outline" size={24} color="#666666" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("VisionScreen1")}
        >
          <Ionicons name="eye-outline" size={24} color="#666666" />
          <Text style={styles.tabLabel}>Screen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="cube-outline" size={24} color="#666666" />
          <Text style={styles.tabLabel}>Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="cash-outline" size={24} color="#666666" />
          <Text style={styles.tabLabel}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="share-social" size={24} color="#2E7D32" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Referrals</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  headerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  headerRole: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  exportText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "600",
  },
  titleSection: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statCardOrange: {
    backgroundColor: "#FFF7ED",
  },
  statCardGreen: {
    backgroundColor: "#F0FDF4",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#2E7D32",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#2E7D32",
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 16,
  },
  referralCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  referralHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  referralHeaderLeft: {
    flex: 1,
  },
  referralName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  referralInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  urgentBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  urgentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  referralBody: {
    gap: 12,
  },
  referralRow: {
    gap: 4,
  },
  referralLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  referralValue: {
    fontSize: 14,
    color: "#111827",
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  facilitiesCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  facilitiesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  facilitiesList: {
    gap: 8,
  },
  facilityItem: {
    fontSize: 14,
    color: "#6B7280",
  },
  createButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  tabLabelActive: {
    color: "#2E7D32",
    fontWeight: "600",
  },
});
