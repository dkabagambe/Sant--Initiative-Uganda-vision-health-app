import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  CHWDashboard: undefined;
  MyClients: undefined;
  Inventory: undefined;
  Referrals: undefined;
  Payments: undefined;
  Reports: undefined;
  StartScreening: undefined;
  VisionScreeningStep1: undefined;
  Settings: undefined;
};

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CHWDashboard"
>;

export default function CHWDashboard() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.organization}>Santé Initiative Uganda</Text>
              <Text style={styles.userName}>Jane Nambi</Text>
              <Text style={styles.userRole}>CHW - Luweero</Text>
            </View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate("Settings")}
            >
              <Ionicons name="menu" size={30} color="#1E40AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.welcomeText}>Welcome, Jane Nambi</Text>
          <Text style={styles.roleDistrict}>VHT - Luweero District</Text>
          <Text style={styles.readyText}>Ready to screen today?</Text>
        </View>

        {/* This Week Stats */}
        <View style={styles.weekStatsContainer}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekStats}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>28</Text>
              <Text style={styles.statLabel}>Screened</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Glasses Given</Text>
            </View>
          </View>
        </View>

        {/* Action Cards - 2x2 Grid */}
        <View style={styles.cardsGrid}>
          {/* Start New Screening - Blue Primary Card */}
          <TouchableOpacity
            style={styles.primaryCard}
            onPress={() => navigation.navigate("StartScreening")}
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

        {/* Spacer for bottom tab bar */}
        <View style={styles.spacer} />
      </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 100, // Extra space for bottom tab bar
  },
  header: {
    marginBottom: 28,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  organization: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 15,
    color: "#6B7280",
  },
  menuButton: {
    padding: 6,
    marginTop: -4,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  roleDistrict: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 4,
  },
  readyText: {
    fontSize: 15,
    color: "#6B7280",
  },
  weekStatsContainer: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  weekStats: {
    flexDirection: "row",
    gap: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  card: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryCard: {
    width: "47%",
    backgroundColor: "#1E40AF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E3A8A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryCardText: {
    color: "#FFFFFF",
  },
  primaryCardSubtitle: {
    fontSize: 15,
    color: "#E5E7EB",
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 4,
  },
  cardNote: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  goodStock: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "500",
    marginBottom: 12,
  },
  paymentsDueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentsDueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  paymentsDueTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
  },
  paymentsDueSubtitle: {
    fontSize: 15,
    color: "#6B7280",
  },
  paymentsDueBadge: {
    backgroundColor: "#EF4444",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentsDueNumber: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  paymentsDueAmount: {
    fontSize: 15,
    color: "#1F2937",
    marginBottom: 14,
  },
  paymentsDueButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  paymentsDueButtonText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },
  recentActivityContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    color: "#1E40AF",
    fontSize: 15,
    fontWeight: "500",
  },
  activityList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  activityAvatar: {
    marginRight: 14,
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 3,
  },
  activityDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 3,
  },
  activityTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  activityAmountPositive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  positiveAmount: {
    color: "#059669",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  activityAmountNeutral: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  neutralAmount: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
  },
  activityAmountInfo: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  reportsCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  reportsCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportsText: {
    flex: 1,
    marginLeft: 14,
  },
  reportsTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 3,
  },
  reportsSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  spacer: {
    height: 40,
  },
});
