import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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

const { width } = Dimensions.get("window");

export default function CHWDashboard() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const recentActivities = [
    {
      name: "Nakato Grace",
      action: "Screening completed +2.50D",
      time: "2h ago",
    },
    {
      name: "Musoke Peter",
      action: "Payment received +UGX 5,000",
      time: "5h ago",
    },
    {
      name: "Nansubuga Sarah",
      action: "Referred to Luweero Hospital",
      time: "1d ago",
    },
  ];

  const dashboardStats = [
    {
      label: "My Clients",
      value: "47",
      subtitle: "Active clients",
      subValue: "8 due for repayment",
    },
    {
      label: "Inventory",
      value: "45",
      subtitle: "Glasses in stock",
      subValue: "Good stock level",
    },
    {
      label: "Referrals",
      value: "3",
      subtitle: "Pending referrals",
      subValue: "1 outstanding",
    },
    {
      label: "Payments Due",
      value: "3",
      subtitle: "Clients due today",
      subValue: "UGX 15,000 expected",
    },
  ];

  const quickActions = [
    {
      title: "VHT Eye Screening",
      subtitle: "Uganda Job Aid Protocol",
      icon: "👁️",
      onPress: () => navigation.navigate("StartScreening"),
    },
    {
      title: "Quick Screening",
      subtitle: "Simple version",
      icon: "⚡",
      onPress: () => navigation.navigate("VisionScreeningStep1"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top Header with Logo and Menu - Fixed at top */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}></Text>
        </View>

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
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.userRole}>VHT - Luweero District</Text>

          <View style={styles.readyCard}>
            <MaterialIcons name="access-time" size={20} color="#1A4D8F" />
            <Text style={styles.readyText}>Ready to screen today?</Text>
          </View>
        </View>

        {/* This Week Stats */}
        <View style={styles.weekStatsSection}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekStatsRow}>
            <View style={styles.weekStatCard}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="users" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.weekStatNumber}>28</Text>
              <Text style={styles.weekStatLabel}>Screened</Text>
            </View>

            <View style={styles.weekStatCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#4CAF50" },
                ]}
              >
                <MaterialIcons name="school" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.weekStatNumber}>15</Text>
              <Text style={styles.weekStatLabel}>Classes Given</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Cards */}
        <View style={styles.quickActionsSection}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1A4D8F" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Dashboard Stats Grid - 2x2 */}
        <View style={styles.dashboardGridSection}>
          <View style={styles.dashboardGrid}>
            {dashboardStats.map((stat, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dashboardCard}
                onPress={() => {
                  // Map indices to correct screens based on your folder structure
                  const routes = [
                    "MyClients",
                    "Inventory",
                    "Referrals",
                    "Payments",
                  ];
                  navigation.navigate(routes[index] as any);
                }}
              >
                <Text style={styles.dashboardValue}>{stat.value}</Text>
                <Text style={styles.dashboardLabel}>{stat.label}</Text>
                <View style={styles.dashboardSub}>
                  <Text style={styles.dashboardSubtitle}>{stat.subtitle}</Text>
                  <Text
                    style={[
                      styles.dashboardSubValue,
                      stat.subValue.includes("Good")
                        ? styles.goodText
                        : stat.subValue.includes("due")
                          ? styles.dueText
                          : styles.normalText,
                    ]}
                  >
                    {stat.subValue}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityContent}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* View Reports Button */}
        <TouchableOpacity
          style={styles.reportsButton}
          onPress={() => navigation.navigate("Reports")}
        >
          <MaterialCommunityIcons name="file-chart" size={24} color="#1A4D8F" />
          <Text style={styles.reportsButtonText}>View Reports</Text>
          <Text style={styles.reportsSubtitle}>
            Sales, Payments, Stock & Referrals
          </Text>
        </TouchableOpacity>

        {/* Spacer for bottom navigation */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Navigation - Fixed at bottom */}
      <View style={styles.bottomNav}>
        {[
          { name: "Home", icon: "home", screen: "CHWDashboard" },
          {
            name: "Screen",
            icon: "eye",
            screen: "StartScreening",
            activeRoutes: [
              "StartScreening",
              "VisionScreen1",
              "VisionScreen2",
              "VisionScreen3",
              "VisionScreen4",
              "VisionScreen5",
              "VisionScreen6",
              "VisionScreeningStep1",
              "VisionScreeningStep2",
            ],
          },
          { name: "Stock", icon: "cube", screen: "Inventory" },
          { name: "Payments", icon: "cash", screen: "Payments" },
          { name: "Referrals", icon: "share", screen: "Referrals" },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.screen as any)}
          >
            <Ionicons
              name={item.icon as any}
              size={22}
              color={item.name === "Home" ? "#1A4D8F" : "#8E8E93"}
            />
            <Text
              style={[
                styles.navText,
                item.name === "Home" && styles.navTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  // Top Header Styles
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
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
  logoBox: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
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
  // Scroll View
  scrollView: {
    flex: 1,
    marginTop: 170, // Adjust for fixed header
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Space for bottom nav
  },
  // Welcome Section
  welcomeSection: {
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 16,
  },
  readyCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  readyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 12,
  },
  // This Week Section
  weekStatsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  weekStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekStatCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF9800",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  weekStatNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  weekStatLabel: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  // Quick Actions
  quickActionsSection: {
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  // Dashboard Grid
  dashboardGridSection: {
    marginBottom: 16,
  },
  dashboardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dashboardCard: {
    width: (width - 40) / 2, // 16px padding on each side + 8px gap
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A4D8F",
    marginBottom: 4,
  },
  dashboardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  dashboardSub: {
    marginTop: 4,
  },
  dashboardSubtitle: {
    fontSize: 12,
    color: "#666666",
  },
  dashboardSubValue: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  goodText: {
    color: "#4CAF50",
  },
  dueText: {
    color: "#EF4444",
  },
  normalText: {
    color: "#1A4D8F",
  },
  // Recent Activity
  recentActivitySection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: "#1A4D8F",
    fontWeight: "600",
  },
  activityList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  activityAction: {
    fontSize: 14,
    color: "#666666",
  },
  activityTime: {
    fontSize: 12,
    color: "#999999",
    marginLeft: 8,
  },
  // Reports Button
  reportsButton: {
    backgroundColor: "#E8F4FF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1A4D8F",
    marginBottom: 16,
  },
  reportsButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A4D8F",
    marginTop: 12,
    marginBottom: 4,
  },
  reportsSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  spacer: {
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
});
