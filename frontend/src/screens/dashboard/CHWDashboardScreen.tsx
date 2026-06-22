import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { apiService, User } from "../../services/api";

type RootStackParamList = {
  CHWDashboard: undefined;
  VisionScreen1: undefined;
  StartScreening: undefined;
  MyClients: undefined;
  Inventory: undefined;
  Referrals: undefined;
  Payments: undefined;
  Reports: undefined;
};

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CHWDashboard"
>;

export default function CHWDashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    screenings_this_week: 0,
    clients_needing_glasses: 0,
    total_screenings: 0,
    clients_referred: 0,
  });
  const [user, setUser] = useState<Partial<User>>({ fullName: "VHT", village: "" });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardData, userData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getCurrentUser(),
      ]);

      if (dashboardData.success) {
        setStats(dashboardData.data.screenings);
      }
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.organization}>Santé Initiative Uganda</Text>
              <Text style={styles.userName}>{user.fullName || user.full_name}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle" size={40} color="#1E40AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.roleDistrict}>{user.fullName}</Text>
          <Text style={styles.readyText}>Ready to screen today?</Text>
        </View>

        {/* This Week Stats */}
        <View style={styles.weekStatsContainer}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekStats}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.screenings_this_week}</Text>
              <Text style={styles.statLabel}>Screened</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.clients_needing_glasses}</Text>
              <Text style={styles.statLabel}>Glasses Given</Text>
            </View>
          </View>
        </View>

        {/* Action Cards - 2x2 Grid */}
        <View style={styles.cardsGrid}>
          {/* Start New Screening - Blue Primary Card */}
          <TouchableOpacity
            style={styles.primaryCard}
            onPress={() => navigation.navigate("VHTScreeningStep1" as any)}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, styles.primaryCardText]}>
                Start New Screening
              </Text>
              <Ionicons name="eye-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.primaryCardSubtitle}>
              Begin vision assessment
            </Text>
          </TouchableOpacity>

          {/* My Clients */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("MyClients")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>My Clients</Text>
              <Ionicons name="people-outline" size={24} color="#1E40AF" />
            </View>
            <Text style={styles.cardSubtitle}>47 Active clients</Text>
            <Text style={styles.cardNote}>8 due for repayment</Text>
          </TouchableOpacity>

          {/* Inventory */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Inventory")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Inventory</Text>
              <Ionicons name="cube-outline" size={24} color="#1E40AF" />
            </View>
            <Text style={styles.cardSubtitle}>45 Glasses in stock</Text>
            <Text style={styles.goodStock}>Good stock level</Text>
          </TouchableOpacity>

          {/* Referrals */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Referrals")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Referrals</Text>
              <Ionicons name="share-outline" size={24} color="#1E40AF" />
            </View>
            <Text style={styles.cardSubtitle}>3 Pending referrals</Text>
            <Text style={styles.cardNote}>1 outstanding</Text>
          </TouchableOpacity>
        </View>

        {/* Payments Due Card */}
        <View style={styles.paymentsDueCard}>
          <View style={styles.paymentsDueHeader}>
            <View>
              <Text style={styles.paymentsDueTitle}>Payments Due</Text>
              <Text style={styles.paymentsDueSubtitle}>Clients due today</Text>
            </View>
            <View style={styles.paymentsDueBadge}>
              <Text style={styles.paymentsDueNumber}>3</Text>
            </View>
          </View>
          <Text style={styles.paymentsDueAmount}>UGX 15,000 expected</Text>
          <TouchableOpacity
            style={styles.paymentsDueButton}
            onPress={() => navigation.navigate("Payments")}
          >
            <Text style={styles.paymentsDueButtonText}>Payments Due</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {/* Activity 1 */}
            <View style={styles.activityItem}>
              <View style={styles.activityAvatar}>
                <Ionicons name="person-circle" size={40} color="#6B7280" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>Nakato Grace</Text>
                <Text style={styles.activityDescription}>
                  Screening completed • +2.50D
                </Text>
                <Text style={styles.activityTime}>2h ago</Text>
              </View>
              <View style={styles.activityAmountNeutral}>
                <Text style={styles.neutralAmount}>+2.50</Text>
              </View>
            </View>

            {/* Activity 2 */}
            <View style={styles.activityItem}>
              <View style={styles.activityAvatar}>
                <Ionicons name="person-circle" size={40} color="#6B7280" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>Musoke Peter</Text>
                <Text style={styles.activityDescription}>
                  Payment received • UGX 5,000
                </Text>
                <Text style={styles.activityTime}>5h ago</Text>
              </View>
              <View style={styles.activityAmountPositive}>
                <Ionicons name="arrow-down" size={16} color="#059669" />
                <Text style={styles.positiveAmount}>+5,000</Text>
              </View>
            </View>

            {/* Activity 3 */}
            <View style={styles.activityItem}>
              <View style={styles.activityAvatar}>
                <Ionicons name="person-circle" size={40} color="#6B7280" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>Nansubuga Sarah</Text>
                <Text style={styles.activityDescription}>
                  Referred to Luweero Hospital
                </Text>
                <Text style={styles.activityTime}>1d ago</Text>
              </View>
              <View style={styles.activityAmountInfo}>
                <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
              </View>
            </View>
          </View>
        </View>

        {/* View Reports Card */}
        <TouchableOpacity
          style={styles.reportsCard}
          onPress={() => navigation.navigate("Reports")}
        >
          <View style={styles.reportsCardContent}>
            <Ionicons name="document-text-outline" size={32} color="#1E40AF" />
            <View style={styles.reportsText}>
              <Text style={styles.reportsTitle}>View Reports</Text>
              <Text style={styles.reportsSubtitle}>
                Sales, Payments, Stock & Referrals
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* NO BOTTOM NAVIGATION HERE - It will be provided by CHWTabs */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF8",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 120, // Space for tab bar
  },
  header: {
    paddingTop: 16,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  organization: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 2,
  },
  userRole: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  profileButton: {
    padding: 4,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  roleDistrict: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  readyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  weekStatsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  weekStats: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryCard: {
    width: "48%",
    backgroundColor: "#1E40AF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E3A8A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryCardText: {
    color: "#FFFFFF",
  },
  primaryCardSubtitle: {
    fontSize: 14,
    color: "#E5E7EB",
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  cardNote: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
  },
  goodStock: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
    marginBottom: 12,
  },
  paymentsDueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentsDueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentsDueTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  paymentsDueSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  paymentsDueBadge: {
    backgroundColor: "#EF4444",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentsDueNumber: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  paymentsDueAmount: {
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 12,
  },
  paymentsDueButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  paymentsDueButtonText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
  recentActivityContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "500",
  },
  activityList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  activityAvatar: {
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  activityAmountPositive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positiveAmount: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  activityAmountNeutral: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  neutralAmount: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },
  activityAmountInfo: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportsCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  reportsCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportsText: {
    flex: 1,
    marginLeft: 12,
  },
  reportsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  reportsSubtitle: {
    fontSize: 12,
    color: "#6B7280",
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
});
