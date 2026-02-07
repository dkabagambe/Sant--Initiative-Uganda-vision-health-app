import React from "react";
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
  VisionScreeningStep1: undefined;
};

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

export default function VSLADashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FFF8" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={styles.organization}>Santé Initiative Uganda</Text>
            <Text style={styles.groupName}>Bombo Women's VSLA</Text>
            <Text style={styles.location}>VSLA - Luweero District</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={44} color="#1E40AF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, Bombo Women's VSLA</Text>
          <Text style={styles.subtitle}>Ready to manage payments today?</Text>
        </View>

        {/* This Week Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekStats}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="swap-horizontal" size={20} color="#1E40AF" />
              </View>
              <Text style={styles.statNumber}>34</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="eye-outline" size={20} color="#059669" />
              </View>
              <Text style={styles.statNumber}>22</Text>
              <Text style={styles.statLabel}>Glasses Issued</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.cardsGrid}>
            {/* Row 1 */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Payments")}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: "#DBEAFE" }]}>
                  <Ionicons name="cash-outline" size={24} color="#1E40AF" />
                </View>
                <Text style={styles.cardTitle}>Manage Payments</Text>
              </View>
              <Text style={styles.cardSubtitle}>Track member payments</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardActionText}>View</Text>
                <Ionicons name="arrow-forward" size={16} color="#1E40AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Members")}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: "#F3E8FF" }]}>
                  <Ionicons name="people-outline" size={24} color="#7C3AED" />
                </View>
                <Text style={styles.cardTitle}>Members</Text>
              </View>
              <Text style={styles.cardSubtitle}>32 VSLA members</Text>
              <View style={styles.pendingContainer}>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>5 pending</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardActionText}>View</Text>
                <Ionicons name="arrow-forward" size={16} color="#7C3AED" />
              </View>
            </TouchableOpacity>

            {/* Row 2 */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Stock")}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: "#DCFCE7" }]}>
                  <Ionicons name="cube-outline" size={24} color="#059669" />
                </View>
                <Text style={styles.cardTitle}>Stock</Text>
              </View>
              <Text style={styles.cardSubtitle}>67 Glasses in stock</Text>
              <View style={styles.stockStatus}>
                <View style={styles.statusIndicator} />
                <Text style={styles.goodStock}>Good stock level</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardActionText}>View</Text>
                <Ionicons name="arrow-forward" size={16} color="#059669" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Loans")}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="wallet-outline" size={24} color="#D97706" />
                </View>
                <Text style={styles.cardTitle}>Loans</Text>
              </View>
              <Text style={styles.cardSubtitle}>8 Active loans</Text>
              <Text style={styles.loanAmount}>UGX 240,000</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardActionText}>View</Text>
                <Ionicons name="arrow-forward" size={16} color="#D97706" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payments Due Card */}
        <TouchableOpacity style={styles.paymentsDueCard} activeOpacity={0.8}>
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
          <TouchableOpacity
            style={styles.paymentsDueButton}
            activeOpacity={0.7}
          >
            <Text style={styles.paymentsDueButtonText}>View Due Payments</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.6}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {/* Activity 1 */}
            <View style={styles.activityItem}>
              <View style={styles.activityAvatar}>
                <Ionicons
                  name="person-circle-outline"
                  size={36}
                  color="#6B7280"
                />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>Nalwoga Joyce</Text>
                <Text style={styles.activityDescription}>
                  Payment received • UGX 8,000
                </Text>
                <Text style={styles.activityTime}>2h ago</Text>
              </View>
              <View style={styles.activityAmountPositive}>
                <Ionicons name="arrow-down" size={14} color="#059669" />
                <Text style={styles.positiveAmount}>+8,000</Text>
              </View>
            </View>

            {/* Activity 2 */}
            <View style={styles.activityItem}>
              <View style={styles.activityAvatar}>
                <Ionicons
                  name="person-circle-outline"
                  size={36}
                  color="#6B7280"
                />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>Mukasa David</Text>
                <Text style={styles.activityDescription}>
                  New loan issued • UGX 30,000
                </Text>
                <Text style={styles.activityTime}>4h ago</Text>
              </View>
              <View style={styles.activityAmountNegative}>
                <Ionicons name="arrow-up" size={14} color="#DC2626" />
                <Text style={styles.negativeAmount}>-30,000</Text>
              </View>
            </View>

            {/* Activity 3 */}
            <View style={styles.activityItem}>
              <View style={styles.activityAvatar}>
                <Ionicons
                  name="person-circle-outline"
                  size={36}
                  color="#6B7280"
                />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>Nambi Sarah</Text>
                <Text style={styles.activityDescription}>
                  Glasses issued • +2.50D
                </Text>
                <Text style={styles.activityTime}>1d ago</Text>
              </View>
              <View style={styles.activityAmountNeutral}>
                <Text style={styles.neutralAmount}>+2.50D</Text>
              </View>
            </View>
          </View>
        </View>

        {/* View Reports Card */}
        <TouchableOpacity
          style={styles.reportsCard}
          onPress={() => navigation.navigate("Reports")}
          activeOpacity={0.7}
        >
          <View style={styles.reportsCardContent}>
            <Ionicons name="document-text-outline" size={32} color="#1E40AF" />
            <View style={styles.reportsText}>
              <Text style={styles.reportsTitle}>View Reports</Text>
              <Text style={styles.reportsSubtitle}>
                Sales, Payments, Stock & Referrals
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Spacer for bottom navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation - Now with "Screen" tab next to "Home" */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItemActive}>
          <Ionicons name="home" size={24} color="#1E40AF" />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>

        {/* NEW: Screen Tab - according to Figma design */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("VisionScreeningStep1")}
        >
          <Ionicons name="eye-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Screen</Text>
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
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="document-text-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Referrals</Text>
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
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  headerInfo: {
    flex: 1,
  },
  organization: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    color: "#6B7280",
  },
  profileButton: {
    padding: 4,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  welcomeSection: {
    marginBottom: 28,
    paddingTop: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  weekStats: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
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
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
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
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
    marginBottom: 8,
  },
  pendingContainer: {
    marginBottom: 16,
  },
  pendingBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  pendingText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  stockStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  goodStock: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
  },
  loanAmount: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardActionText: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "600",
  },
  paymentsDueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
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
    alignItems: "flex-start",
    marginBottom: 12,
  },
  paymentsDueTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  paymentsDueSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  paymentsDueBadge: {
    backgroundColor: "#EF4444",
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  paymentsDueNumber: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  paymentsDueAmount: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
    marginBottom: 20,
  },
  paymentsDueButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  paymentsDueButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
  viewAllText: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "600",
  },
  activityList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  positiveAmount: {
    color: "#059669",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  activityAmountNegative: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  negativeAmount: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  activityAmountNeutral: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  neutralAmount: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
  },
  reportsCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
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
    marginLeft: 16,
  },
  reportsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  reportsSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  bottomSpacer: {
    height: 40,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
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
  navText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 11,
    color: "#1E40AF",
    fontWeight: "600",
    marginTop: 4,
  },
});
