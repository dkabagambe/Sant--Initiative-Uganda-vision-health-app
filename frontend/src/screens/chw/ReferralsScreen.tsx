import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { apiService } from "../../services/api";

type RootStackParamList = {
  CHWDashboard: undefined;
  VisionScreeningStep1: undefined;
  InventoryScreen: undefined;
  PaymentsScreen: undefined;
  ReferralsScreen: undefined;
};

type ReferralsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ReferralsScreen"
>;

interface ReferralItem {
  id: string;
  client_name: string;
  reason: string;
  facility_name: string;
  referred_date: string;
  status: string;
  urgency: string;
}

export default function ReferralsScreen() {
  const navigation = useNavigation<ReferralsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending",
  );
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReferrals();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setUserData(user);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReferrals();
      if (response.success) {
        setReferrals(response.data);
      }
    } catch (error) {
      console.error("Failed to load referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReferrals();
    setRefreshing(false);
  };

  const handleMarkComplete = (referralId: string, clientName: string) => {
    Alert.alert(
      "Mark Referral Complete",
      `Are you sure you want to mark the referral for ${clientName} as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Complete",
          onPress: async () => {
            try {
              const result = await apiService.updateReferralStatus(referralId, "completed");
              if (result.success) {
                await loadReferrals();
                Alert.alert("Success", "Referral marked as completed");
              } else {
                Alert.alert("Error", result.error || "Failed to update referral");
              }
            } catch (error) {
              console.error("Failed to update referral:", error);
              Alert.alert("Error", "Failed to update referral. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleCreateReferral = () => {
    // Navigate to root-level CreateReferralScreen (ReferralsTab -> CHWTabs -> Root)
    const root = navigation.getParent()?.getParent();
    if (root) {
      root.navigate("CreateReferralScreen" as any);
    } else {
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate("CreateReferralScreen" as any);
      } else {
        (navigation as any).navigate("CreateReferralScreen");
      }
    }
  };

  const pendingReferrals = referrals.filter((r) => r.status === "pending");
  const completedReferrals = referrals.filter((r) => r.status === "completed");

  const currentReferrals =
    activeTab === "pending" ? pendingReferrals : completedReferrals;

  const ReferralCard = ({ referral }: { referral: ReferralItem }) => (
    <View style={styles.outlinedCard}>
      {/* Patient Header */}
      <View style={styles.patientHeader}>
        <Text style={styles.patientName}>{referral.client_name}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                referral.urgency === "urgent" ? "#FEE2E2" : "#E0F2FE",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: referral.urgency === "urgent" ? "#DC2626" : "#0284C7" },
            ]}
          >
            {referral.urgency}
          </Text>
        </View>
      </View>

      {/* Referral Details */}
      <View style={styles.detailSection}>
        <Text style={styles.detailLabel}>Reason for referral</Text>
        <Text style={styles.detailValue}>{referral.reason}</Text>
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.detailLabel}>Referred to</Text>
        <Text style={styles.detailValue}>
          {referral.facility_name || "Not specified"}
        </Text>
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.detailLabel}>Referred on</Text>
        <Text style={styles.detailValue}>
          {new Date(referral.referred_date).toLocaleDateString()}
        </Text>
      </View>

      {/* Action Button */}
      {referral.status === "pending" && (
        <TouchableOpacity
          style={styles.markCompleteButton}
          onPress={() => handleMarkComplete(referral.id, referral.client_name)}
        >
          <Text style={styles.markCompleteButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={{ marginTop: 12, color: "#666" }}>
            Loading referrals...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {userData?.full_name || "Referral Management"}
            </Text>
            <Text style={styles.headerSubtitle}>
              VHT -{" "}
              {userData?.district
                ? `${userData.district} District`
                : "Advanced eye care"}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2E7D32"]}
          />
        }
      >
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingReferrals.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedReferrals.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{referrals.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Create New Referral Button */}
        <TouchableOpacity 
          style={styles.createReferralButton}
          onPress={handleCreateReferral}
        >
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.createReferralText}>Create New Referral</Text>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "pending" && styles.activeTab]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              Pending Referrals
            </Text>
            {activeTab === "pending" && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "completed" && styles.activeTab]}
            onPress={() => setActiveTab("completed")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "completed" && styles.activeTabText,
              ]}
            >
              Completed
            </Text>
            {activeTab === "completed" && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
        </View>

        {/* Referrals List */}
        <View style={styles.referralsList}>
          {currentReferrals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyStateTitle}>No referrals found</Text>
              <Text style={styles.emptyStateText}>
                No {activeTab} referrals
              </Text>
            </View>
          ) : (
            currentReferrals.map((referral) => (
              <ReferralCard key={referral.id} referral={referral} />
            ))
          )}
        </View>

        {/* Create New Referral Button */}
        <TouchableOpacity style={styles.createNewButton} onPress={handleCreateReferral}>
          <View style={styles.plusIconContainer}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.createNewText}>Create New Referral</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 2,
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  createReferralButton: {
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createReferralText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    position: "relative",
  },
  activeTab: {
    backgroundColor: "#F3F4F6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#1F2937",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: -4,
    width: "60%",
    height: 3,
    backgroundColor: "#2563EB",
    borderRadius: 1.5,
  },
  referralsList: {
    gap: 16,
    marginBottom: 20,
  },
  outlinedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  patientHeader: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  patientName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  patientDetails: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailSection: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "400",
  },
  markCompleteButton: {
    marginTop: 16,
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1D4ED8",
  },
  markCompleteButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginBottom: 24,
  },
  plusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  createNewText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },
  partnerFacilitiesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  facilitiesList: {
    gap: 12,
  },
  facilityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  facilityIcon: {
    marginRight: 12,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  facilityDetails: {
    fontSize: 13,
    color: "#6B7280",
  },
  facilityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 100,
  },
  // Bottom Navigation
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  navItemActive: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  activeNavIcon: {
    backgroundColor: "#2563EB",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
    marginBottom: 4,
  },
  navText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "600",
  },
});
