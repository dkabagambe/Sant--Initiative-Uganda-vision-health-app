import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { apiService } from "../../services/api";

type RootStackParamList = {
  CHWDashboard: undefined;
  Reports: undefined;
  Settings: undefined;
};

type ReportsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Reports"
>;

const { width } = Dimensions.get("window");

export default function ReportsScreen() {
  const navigation = useNavigation<ReportsScreenNavigationProp>();
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const periods = [
    "Daily",
    "Weekly",
    "Monthly",
    "Quarterly",
    "6 Months",
    "Yearly",
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReports();
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={{ marginTop: 12, color: "#666" }}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const summaryCards = [
    { label: "Screenings", value: reports?.totalScreenings || "0", subtitle: "total screenings" },
    { label: "Payments", value: reports?.totalPayments || "0", subtitle: "transactions" },
    { label: "Referrals", value: reports?.totalReferrals || "0", subtitle: "referrals made" },
    { label: "Referrals", value: "15", subtitle: "total referrals" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A4D8F" />
          </TouchableOpacity>
        </View>

        {/* <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
        </View> */}

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="menu" size={28} color="#1A4D8F" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2E7D32"]} />
        }
      >
        {/* Reports Header */}
        <View style={styles.reportsHeader}>
          <Text style={styles.reportsTitle}>Reports & Analytics</Text>
          <Text style={styles.reportsSubtitle}>
            Generate comprehensive reports
          </Text>
        </View>

        {/* Time Period Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.periodScrollView}
          contentContainerStyle={styles.periodContainer}
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary Cards Grid */}
        <View style={styles.summaryGrid}>
          {summaryCards.map((card, index) => (
            <View key={index} style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>{card.label}</Text>
              <Text style={styles.summaryCardValue}>{card.value}</Text>
              <Text style={styles.summaryCardSubtitle}>{card.subtitle}</Text>
            </View>
          ))}
        </View>

        {/* Total Revenue Section */}
        <View style={styles.revenueSection}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueTitle}>Total Revenue</Text>
          </View>
          <Text style={styles.revenueAmount}>UGX 1,245,000</Text>

          <View style={styles.revenueStats}>
            <View style={styles.revenueStat}>
              <Text style={styles.revenueStatValue}>87 sales</Text>
              <Text style={styles.revenueStatLabel}>Average Sale</Text>
              <Text style={styles.revenueStatDetail}>
                UGX 14,310 per transaction
              </Text>
            </View>

            <View style={styles.revenueBreakdown}>
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownContent}>
                  <Text style={styles.breakdownTitle}>Full Payments</Text>
                  <Text style={styles.breakdownAmount}>UGX 780,000</Text>
                </View>
              </View>

              <View style={styles.breakdownItem}>
                <View style={styles.breakdownContent}>
                  <Text style={styles.breakdownTitle}>Hire-Purchase</Text>
                  <Text style={styles.breakdownAmount}>UGX 465,000</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  userSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  organization: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 16,
    color: "#666666",
  },
  reportsHeader: {
    marginBottom: 20,
  },
  reportsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  reportsSubtitle: {
    fontSize: 16,
    color: "#666666",
  },
  periodScrollView: {
    marginBottom: 20,
  },
  periodContainer: {
    flexDirection: "row",
    paddingRight: 16,
  },
  periodButton: {
    backgroundColor: "#e7e7e7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  periodButtonActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  periodButtonText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryCard: {
    width: (width - 40) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCardLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
    fontWeight: "500",
  },
  summaryCardValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A4D8F",
    marginBottom: 4,
  },
  summaryCardSubtitle: {
    fontSize: 12,
    color: "#999999",
  },
  revenueSection: {
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueHeader: {
    marginBottom: 12,
  },
  revenueTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  revenueAmount: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#fff",
  },
  revenueStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#fff",
  },
  revenueStat: {
    flex: 1,
  },
  revenueStatValue: {
    fontSize: 14,
    marginBottom: 4,
    color: "#fff",
  },
  revenueStatLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  revenueStatDetail: {
    fontSize: 14,
    color: "#fff",
  },
  revenueBreakdown: {
    flex: 1,
    alignItems: "flex-end",
  },
  breakdownItem: {
    marginBottom: 12,
  },
  breakdownContent: {
    alignItems: "flex-end",
  },
  breakdownTitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A4D8F",
  },
  powerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  powerGrid: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  powerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  powerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  powerDetails: {
    alignItems: "flex-end",
  },
  powerSales: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
  },
  powerRevenue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A4D8F",
  },
  frameSection: {
    marginBottom: 20,
  },
  frameGrid: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  frameItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  frameLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  frameDetails: {
    alignItems: "flex-end",
  },
  frameSales: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
  },
  frameRevenue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A4D8F",
  },
  spacer: {
    height: 20,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },
  navTextActive: {
    color: "#1A4D8F",
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 100,
  },
});
