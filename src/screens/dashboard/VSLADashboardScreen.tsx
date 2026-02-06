import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Dashboard: undefined;
  Payments: undefined;
  Members: undefined;
  Stock: undefined;
  Loans: undefined;
  Reports: undefined;
  Settings: undefined;
};

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

export default function VSLADashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

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
              <Text style={styles.groupName}>Bombo Women's VSLA</Text>
              <Text style={styles.location}>VSLA - Luweero District</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle" size={40} color="#1E40AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.welcomeText}>Welcome, Bombo Women's VSLA</Text>
          <Text style={styles.subtitle}>Ready to manage payments today?</Text>
        </View>

        {/* This Week Stats */}
        <View style={styles.weekStatsContainer}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekStats}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>34</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>22</Text>
              <Text style={styles.statLabel}>Glasses Issued</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Cards */}
        <View style={styles.cardsGrid}>
          {/* Row 1 */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Payments")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Manage Payments</Text>
              <Ionicons name="cash-outline" size={24} color="#1E40AF" />
            </View>
            <Text style={styles.cardSubtitle}>Track member payments</Text>
            <TouchableOpacity style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Manage Payments</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Members")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Members</Text>
              <Ionicons name="people-outline" size={24} color="#1E40AF" />
            </View>
            <Text style={styles.cardSubtitle}>32 VSLA members</Text>
            <Text style={styles.cardNote}>5 pending payments</Text>
            <TouchableOpacity style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Members</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Row 2 */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Stock")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Stock</Text>
              <Ionicons name="cube-outline" size={24} color="#1E40AF" />
            </View>
            <Text style={styles.cardSubtitle}>67 Glasses in stock</Text>
            <Text style={styles.goodStock}>Good stock level</Text>
            <TouchableOpacity style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Stock</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Loans")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Loans</Text>
              <Ionicons name="wallet-outline" size={24} color="#1E40AF" />
            </View>
            <Text style={styles.cardSubtitle}>8 Active loans</Text>
            <Text style={styles.cardNote}>UGX 240,000</Text>
            <TouchableOpacity style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Loans</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Payments Due Card */}
        <View style={styles.paymentsDueCard}>
          <View style={styles.paymentsDueHeader}>
            <View>
              <Text style={styles.paymentsDueTitle}>Payments Due</Text>
              <Text style={styles.paymentsDueSubtitle}>Due today</Text>
            </View>
            <View style={styles.paymentsDueBadge}>
              <Text style={styles.paymentsDueNumber}>3</Text>
            </View>
          </View>
          <Text style={styles.paymentsDueAmount}>UGX 15,000 expected</Text>
          <TouchableOpacity style={styles.paymentsDueButton}>
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
                <Text style={styles.activityName}>Nalwoga Joyce</Text>
                <Text style={styles.activityDescription}>
                  Payment received • UGX 8,000
                </Text>
                <Text style={styles.activityTime}>2h ago</Text>
              </View>
              <View style={styles.activityAmountPositive}>
                <Ionicons name="arrow-down" size={16} color="#059669" />
                <Text style={styles.positiveAmount}>+8,000</Text>
              </View>
            </View>

            {/* Activity 2 */}
            <View style={styles.activityItem}>
              <View style={styles.activityAvatar}>
                <Ionicons name="person-circle" size={40} color="#6B7280" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>Mukasa David</Text>
                <Text style={styles.activityDescription}>
                  New loan issued • UGX 30,000
                </Text>
                <Text style={styles.activityTime}>4h ago</Text>
              </View>
              <View style={styles.activityAmountNegative}>
                <Ionicons name="arrow-up" size={16} color="#DC2626" />
                <Text style={styles.negativeAmount}>-30,000</Text>
              </View>
            </View>

            {/* Activity 3 */}
            <View style={styles.activityItem}>
              <View style={styles.activityAvatar}>
                <Ionicons name="person-circle" size={40} color="#6B7280" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>Nambi Sarah</Text>
                <Text style={styles.activityDescription}>
                  Glasses issued • +2.50D
                </Text>
                <Text style={styles.activityTime}>1d ago</Text>
              </View>
              <View style={styles.activityAmountNeutral}>
                <Text style={styles.neutralAmount}>+2.50</Text>
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

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItemActive}>
          <Ionicons name="home" size={24} color="#1E40AF" />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Stock")}
        >
          <Ionicons name="cube-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Stock</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Payments")}
        >
          <Ionicons name="cash-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Reports")}
        >
          <Ionicons name="bar-chart-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#6B7280" />
          <Text style={styles.navText}>More</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 80, // Space for bottom nav
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
  groupName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 2,
  },
  location: {
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
  subtitle: {
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
    width: "48%", // 2 cards per row with gap
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
  cardButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cardButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
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
  activityAmountNegative: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  negativeAmount: {
    color: "#DC2626",
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
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navItemActive: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navText: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 10,
    color: "#1E40AF",
    fontWeight: "600",
    marginTop: 4,
  },
});
