import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
  patientName: string;
  age: number;
  phoneNumber: string;
  reason: string;
  referredTo: string;
  referredDate: string;
  status: "active" | "completed";
}

interface PartnerFacility {
  id: string;
  name: string;
  contact?: string;
  distance?: string;
}

export default function ReferralsScreen() {
  const navigation = useNavigation<ReferralsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  // Referrals Data
  const referralsData: ReferralItem[] = [
    {
      id: "1",
      patientName: "Nansubuga Sarah",
      age: 58,
      phoneNumber: "0700111222",
      reason: "Suspected cataract, vision loss",
      referredTo: "Luweero Hospital Eye Clinic",
      referredDate: "Jan 12, 2026",
      status: "active",
    },
    {
      id: "2",
      patientName: "Okello David",
      age: 62,
      phoneNumber: "0700222333",
      reason: "High blood pressure, diabetes",
      referredTo: "Bombo Health Center IV",
      referredDate: "Jan 10, 2026",
      status: "active",
    },
    {
      id: "3",
      patientName: "Nabirye Joyce",
      age: 55,
      phoneNumber: "0700333444",
      reason: "Eye pain and redness",
      referredTo: "Luweero Hospital Eye Clinic",
      referredDate: "Jan 8, 2026",
      status: "completed",
    },
  ];

  const activeReferrals = referralsData.filter((r) => r.status === "active");
  const completedReferrals = referralsData.filter(
    (r) => r.status === "completed",
  );

  const currentReferrals =
    activeTab === "active" ? activeReferrals : completedReferrals;

  // Partner Facilities
  const partnerFacilities: PartnerFacility[] = [
    {
      id: "1",
      name: "Luweero Hospital Eye Clinic",
      contact: "0414-123456",
      distance: "5.2 km",
    },
    {
      id: "2",
      name: "Bombo Health Center IV",
      contact: "0414-234567",
      distance: "8.7 km",
    },
    {
      id: "3",
      name: "Kiwoko Hospital",
      contact: "0414-345678",
      distance: "12.5 km",
    },
  ];

  // Statistics
  const stats = {
    active: 12,
    highPriority: 5,
    completed: 28,
  };

  const ReferralCard = ({ referral }: { referral: ReferralItem }) => (
    <View style={styles.outlinedCard}>
      {/* Patient Header */}
      <View style={styles.patientHeader}>
        <Text style={styles.patientName}>{referral.patientName}</Text>
        <Text style={styles.patientDetails}>
          Age {referral.age} • {referral.phoneNumber}
        </Text>
      </View>

      {/* Referral Details */}
      <View style={styles.detailSection}>
        <Text style={styles.detailLabel}>Reason for referral</Text>
        <Text style={styles.detailValue}>{referral.reason}</Text>
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.detailLabel}>Referred to</Text>
        <Text style={styles.detailValue}>{referral.referredTo}</Text>
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.detailLabel}>Referred on</Text>
        <Text style={styles.detailValue}>{referral.referredDate}</Text>
      </View>

      {/* Action Button */}
      {referral.status === "active" && (
        <TouchableOpacity style={styles.markCompleteButton}>
          <Text style={styles.markCompleteButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const PartnerFacilityCard = ({ facility }: { facility: PartnerFacility }) => (
    <View style={styles.facilityCard}>
      <Ionicons
        name="business"
        size={18}
        color="#2563EB"
        style={styles.facilityIcon}
      />
      <View style={styles.facilityInfo}>
        <Text style={styles.facilityName}>{facility.name}</Text>
        {facility.contact && facility.distance && (
          <Text style={styles.facilityDetails}>
            {facility.contact} • {facility.distance}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.facilityButton}>
        <Ionicons name="call-outline" size={18} color="#2563EB" />
      </TouchableOpacity>
    </View>
  );

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
            <Text style={styles.headerTitle}>Referral Management</Text>
            <Text style={styles.headerSubtitle}>
              Advanced eye care & NCD screening
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Top Actions */}
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="insights" size={20} color="#2563EB" />
            <Text style={styles.actionText}>Impact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={20} color="#2563EB" />
            <Text style={styles.actionText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={20} color="#2563EB" />
            <Text style={styles.actionText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.highPriority}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "active" && styles.activeTab]}
            onPress={() => setActiveTab("active")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "active" && styles.activeTabText,
              ]}
            >
              Active Referrals
            </Text>
            {activeTab === "active" && (
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
        <TouchableOpacity style={styles.createNewButton}>
          <View style={styles.plusIconContainer}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.createNewText}>Create New Referral</Text>
        </TouchableOpacity>

        {/* Partner Facilities Section */}
        <View style={styles.partnerFacilitiesSection}>
          <Text style={styles.sectionTitle}>Partner Facilities</Text>

          <View style={styles.facilitiesList}>
            {partnerFacilities.map((facility) => (
              <PartnerFacilityCard key={facility.id} facility={facility} />
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("CHWDashboard")}
        >
          <Ionicons name="home-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("VisionScreeningStep1")}
        >
          <Ionicons name="eye-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Screen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("InventoryScreen")}
        >
          <Ionicons name="cube-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Stock</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("PaymentsScreen")}
        >
          <Ionicons name="cash-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemActive}>
          <View style={styles.activeNavIcon}>
            <Ionicons name="document-text" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.navTextActive}>Referrals</Text>
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
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
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
  },
  patientName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
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
    height: 20,
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
