import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert, // Added Alert import
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  InventoryScreen: undefined;
  CHWDashboard: undefined;
  VisionScreeningStep1: undefined;
  Payments: undefined;
  Referrals: undefined;
};

type InventoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "InventoryScreen"
>;

interface StockItemProps {
  power: string;
  totalPairs: number;
  status?: "normal" | "low" | "critical";
  breakdown: {
    standard: number;
    metal: number;
    fashion: number;
  };
}

const StockItem = ({
  power,
  totalPairs,
  status,
  breakdown,
}: StockItemProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "critical":
        return "#EF4444";
      case "low":
        return "#F59E0B";
      default:
        return "transparent";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "critical":
        return "Critical";
      case "low":
        return "Low";
      default:
        return "";
    }
  };

  return (
    <View style={styles.stockItem}>
      <View style={styles.stockItemHeader}>
        <Text style={styles.stockPower}>{power}</Text>
        <View style={styles.stockQuantityContainer}>
          <Text style={styles.stockQuantity}>{totalPairs} pairs</Text>
          {status && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() },
              ]}
            >
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.breakdownContainer}>
        <View style={styles.frameBreakdownItem}>
          <View style={[styles.frameDot, { backgroundColor: "#1E40AF" }]} />
          <Text style={styles.breakdownText}>
            Standard:{" "}
            <Text style={styles.breakdownCount}>{breakdown.standard}</Text>
          </Text>
        </View>
        <View style={styles.frameBreakdownItem}>
          <View style={[styles.frameDot, { backgroundColor: "#6B7280" }]} />
          <Text style={styles.breakdownText}>
            Metal: <Text style={styles.breakdownCount}>{breakdown.metal}</Text>
          </Text>
        </View>
        <View style={styles.frameBreakdownItem}>
          <View style={[styles.frameDot, { backgroundColor: "#7C3AED" }]} />
          <Text style={styles.breakdownText}>
            Fashion:{" "}
            <Text style={styles.breakdownCount}>{breakdown.fashion}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

interface SaleItemProps {
  clientName: string;
  power: string;
  frameType: string;
  amount: string;
  time: string;
}

const SaleItem = ({
  clientName,
  power,
  frameType,
  amount,
  time,
}: SaleItemProps) => {
  return (
    <View style={styles.saleItem}>
      <View style={styles.saleAvatar}>
        <Ionicons name="person-circle-outline" size={36} color="#6B7280" />
      </View>
      <View style={styles.saleDetails}>
        <Text style={styles.saleClientName}>{clientName}</Text>
        <Text style={styles.saleDescription}>
          {power} • {frameType}
        </Text>
        <Text style={styles.saleTime}>{time}</Text>
      </View>
      <Text style={styles.saleAmount}>{amount}</Text>
    </View>
  );
};

export default function InventoryScreen() {
  const navigation = useNavigation<InventoryScreenNavigationProp>();
  const [showAddStockModal, setShowAddStockModal] = useState(false);

  const stockData: StockItemProps[] = [
    {
      power: "+1.00D",
      totalPairs: 20,
      breakdown: { standard: 12, metal: 5, fashion: 3 },
    },
    {
      power: "+1.50D",
      totalPairs: 14,
      breakdown: { standard: 8, metal: 4, fashion: 2 },
    },
    {
      power: "+2.00D",
      totalPairs: 9,
      status: "low",
      breakdown: { standard: 6, metal: 2, fashion: 1 },
    },
    {
      power: "+2.50D",
      totalPairs: 4,
      status: "critical",
      breakdown: { standard: 3, metal: 1, fashion: 0 },
    },
    {
      power: "+3.00D",
      totalPairs: 10,
      breakdown: { standard: 5, metal: 3, fashion: 2 },
    },
    {
      power: "+3.50D",
      totalPairs: 7,
      breakdown: { standard: 4, metal: 2, fashion: 1 },
    },
  ];

  const recentSales: SaleItemProps[] = [
    {
      clientName: "Nakato Grace",
      power: "+2.50D",
      frameType: "Standard",
      amount: "UGX 15,000",
      time: "Today, 10:30 AM",
    },
    {
      clientName: "Musoke Peter",
      power: "+2.00D",
      frameType: "Metal",
      amount: "UGX 18,000",
      time: "Today, 9:15 AM",
    },
    {
      clientName: "Nambi Sarah",
      power: "+1.50D",
      frameType: "Standard",
      amount: "UGX 15,000",
      time: "Yesterday",
    },
    {
      clientName: "Okello James",
      power: "+3.00D",
      frameType: "Fashion",
      amount: "UGX 20,000",
      time: "Yesterday",
    },
  ];

  const handleAddStock = () => {
    setShowAddStockModal(true);
  };

  const handleRequestReplenishment = () => {
    Alert.alert(
      "Stock Replenishment Request",
      "Your request for stock replenishment has been submitted successfully.",
      [{ text: "OK" }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FFF8" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={styles.organization}>Santé Initiative Uganda</Text>
            <Text style={styles.userName}>VHT</Text>
            {/* <Text style={styles.userRole}>CHW - Luweero</Text> */}
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
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Inventory & Sales</Text>
          <Text style={styles.totalStock}>Total stock: 64 pairs</Text>
        </View>

        {/* Low Stock Alert */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Ionicons name="alert-circle" size={24} color="#DC2626" />
            <Text style={styles.alertTitle}>Low stock alert</Text>
          </View>
          <Text style={styles.alertText}>
            +2.50D has only 4 pairs left. Consider reordering.
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>64</Text>
            <Text style={styles.statLabel}>In Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>23</Text>
            <Text style={styles.statLabel}>Sold (Week)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
        </View>

        {/* Current Stock by Power */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Stock by Power</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddStock}>
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Stock</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stockList}>
            {stockData.map((item, index) => (
              <StockItem key={index} {...item} />
            ))}
          </View>
        </View>

        {/* Recent Sales */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sales</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.salesList}>
            {recentSales.map((sale, index) => (
              <SaleItem key={index} {...sale} />
            ))}
          </View>
        </View>

        {/* Revenue Summary */}
        <View style={styles.revenueCard}>
          <Text style={styles.revenueTitle}>Revenue Summary</Text>
          <Text style={styles.revenueSubtitle}>Total Sales (This Month)</Text>
          <Text style={styles.revenueAmount}>UGX 1,245,000</Text>

          <View style={styles.revenueBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Full Payments</Text>
              <Text style={styles.breakdownValue}>UGX 780,000</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Hire-Purchase</Text>
              <Text style={styles.breakdownValue}>UGX 465,000</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestReplenishment}
          >
            <Text style={styles.requestButtonText}>
              Request Stock Replenishment
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacer */}
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

        <TouchableOpacity style={styles.navItemActive}>
          <Ionicons name="cube" size={24} color="#1E40AF" />
          <Text style={styles.navTextActive}>Stock</Text>
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
          onPress={() => navigation.navigate("Referrals")}
        >
          <Ionicons name="document-text-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Referrals</Text>
        </TouchableOpacity>
      </View>

      {/* Add Stock Modal */}
      <Modal
        visible={showAddStockModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddStockModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Stock</Text>
              <TouchableOpacity onPress={() => setShowAddStockModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                This feature will allow you to add new glasses stock to your
                inventory. Implementation details would include form inputs for
                power, frame type, quantity, and price.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowAddStockModal(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  userRole: {
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
    paddingTop: 20,
    paddingBottom: 100,
  },
  titleSection: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  totalStock: {
    fontSize: 16,
    color: "#6B7280",
  },
  alertCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
    marginLeft: 8,
  },
  alertText: {
    fontSize: 14,
    color: "#B91C1C",
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
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
    fontSize: 28,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  viewAllText: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E40AF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  stockList: {
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
  stockItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  stockItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stockPower: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  stockQuantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockQuantity: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  breakdownContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  frameBreakdownItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  frameDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  breakdownText: {
    fontSize: 13,
    color: "#6B7280",
  },
  breakdownCount: {
    fontWeight: "600",
    color: "#1F2937",
  },
  salesList: {
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
  saleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  saleAvatar: {
    marginRight: 12,
  },
  saleDetails: {
    flex: 1,
  },
  saleClientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  saleDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  saleTime: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  saleAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#059669",
  },
  revenueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  revenueSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 20,
  },
  revenueBreakdown: {
    gap: 12,
    marginBottom: 24,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  breakdownLabel: {
    fontSize: 15,
    color: "#6B7280",
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  requestButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  requestButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
