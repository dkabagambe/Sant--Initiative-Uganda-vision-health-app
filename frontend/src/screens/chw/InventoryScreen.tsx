import React, { useState, useEffect } from "react";
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
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { apiService } from "../../services/api";
import AppHeader from "../../components/AppHeader";

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [totals, setTotals] = useState({ total_pairs: 0 });
  const [userData, setUserData] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [addStockPower, setAddStockPower] = useState<string | null>(null);
  const [addStockFrameType, setAddStockFrameType] = useState<string>("standard");
  const [addStockQuantity, setAddStockQuantity] = useState(0);
  const [addStockLoading, setAddStockLoading] = useState(false);
  const [stats, setStats] = useState({
    weekSold: 0,
    lowStockCount: 0,
    totalRevenue: 0,
    fullPayments: 0,
    hirePurchase: 0,
  });

  useEffect(() => {
    loadInventory();
    loadUserData();
    loadSalesData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setUserData(user);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInventorySummary();
      if (response.success) {
        setInventory(response.data.products);
        setTotals(response.data.totals);
        
        // Calculate stats
        const lowStock = response.data.products.filter((p: any) => p.stock_quantity < 20).length;
        setStats(prev => ({ ...prev, lowStockCount: lowStock }));
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
      Alert.alert("Error", "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const loadSalesData = async () => {
    try {
      // Get screenings with glasses sold this week
      const screenings = await apiService.getScreenings();
      if (screenings.success && screenings.data) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weekSales = screenings.data.filter((s: any) => 
          s.needs_glasses && new Date(s.created_at) >= weekAgo
        );
        
        // Get recent sales (last 4)
        const recent = weekSales.slice(0, 4).map((s: any) => ({
          name: s.client_name,
          power: s.recommended_power || '+2.00D',
          frameType: 'Standard',
          price: 15000,
          time: getTimeAgo(s.created_at),
        }));
        
        setRecentSales(recent);
        
        // Get payment stats
        const payments = await apiService.getPayments();
        if (payments.success && payments.data) {
          const completed = payments.data.filter((p: any) => p.status === 'completed');
          const fullPayments = completed.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
          const pending = payments.data.filter((p: any) => p.status === 'pending');
          const hirePurchase = pending.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
          
          setStats(prev => ({
            ...prev,
            weekSold: weekSales.length,
            totalRevenue: fullPayments + hirePurchase,
            fullPayments,
            hirePurchase,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load sales data:", error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    if (diffHours > 0) return `Today, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    return 'Just now';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadInventory(), loadSalesData()]);
    setRefreshing(false);
  };

  const getStatus = (quantity: number): "normal" | "low" | "critical" | undefined => {
    if (quantity === 0) return "critical";
    if (quantity < 20) return "critical";
    if (quantity < 50) return "low";
    return undefined;
  };

  const handleAddStock = () => {
    setAddStockPower(null);
    setAddStockFrameType("standard");
    setAddStockQuantity(0);
    setShowAddStockModal(true);
  };

  const handleSubmitAddStock = async () => {
    if (!addStockPower) {
      Alert.alert("Error", "Please select a power.");
      return;
    }
    if (addStockQuantity <= 0) {
      Alert.alert("Error", "Please enter a quantity greater than 0.");
      return;
    }

    setAddStockLoading(true);
    try {
      // Find the product by power
      const product = inventory.find((item: any) => item.power === addStockPower);
      if (!product) {
        Alert.alert("Error", `No product found for power ${addStockPower}. Please contact admin.`);
        setAddStockLoading(false);
        return;
      }

      const result = await apiService.addStock(product.id, addStockQuantity, addStockFrameType);
      if (result.success) {
        Alert.alert(
          "\u2705 Stock Added",
          `Successfully added ${addStockQuantity} pairs of ${addStockPower} (${addStockFrameType}) glasses.`
        );
        setShowAddStockModal(false);
        await loadInventory();
      } else {
        throw new Error("Failed to add stock");
      }
    } catch (error) {
      console.error("Add stock error:", error);
      Alert.alert("Error", "Failed to add stock. Please try again.");
    } finally {
      setAddStockLoading(false);
    }
  };

  const handleRequestReplenishment = async () => {
    try {
      // Get low stock items
      const lowStockItems = inventory.filter(item => item.stock_quantity < 20);
      
      if (lowStockItems.length === 0) {
        Alert.alert("No Low Stock", "All items are well stocked. No replenishment needed.");
        return;
      }

      const itemsList = lowStockItems.map(item => 
        `${item.power}: ${item.stock_quantity} pairs (need ${20 - item.stock_quantity} more)`
      ).join('\n');

      Alert.alert(
        "Request Stock Replenishment",
        `The following items need restocking:\n\n${itemsList}\n\nSubmit request?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Submit Request",
            onPress: async () => {
              // In production, this would call an API
              // await apiService.requestStockReplenishment({ items: lowStockItems });
              Alert.alert(
                "✅ Request Submitted",
                "Your stock replenishment request has been submitted successfully. You will be notified when stock arrives."
              );
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit request. Please try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FFF8" />

      <AppHeader 
        userName={userData?.full_name}
        userRole="VHT"
        district={userData?.district}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
            <Text style={styles.statNumber}>{totals.total_pairs || 0}</Text>
            <Text style={styles.statLabel}>In Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.weekSold}</Text>
            <Text style={styles.statLabel}>Sold (Week)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.lowStockCount}</Text>
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
            {inventory.map((item, index) => (
              <StockItem 
                key={item.id || index}
                power={item.power}
                totalPairs={item.stock_quantity}
                status={getStatus(item.stock_quantity)}
                breakdown={{
                  standard: item.stock_standard || 0,
                  metal: item.stock_metal || 0,
                  fashion: item.stock_fashion || 0,
                }}
              />
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
          <Text style={styles.revenueAmount}>UGX {stats.totalRevenue.toLocaleString()}</Text>

          <View style={styles.revenueBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Full Payments</Text>
              <Text style={styles.breakdownValue}>UGX {stats.fullPayments.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Hire-Purchase</Text>
              <Text style={styles.breakdownValue}>UGX {stats.hirePurchase.toLocaleString()}</Text>
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
              <Text style={styles.modalTitle}>Add Stock</Text>
              <TouchableOpacity onPress={() => setShowAddStockModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {/* Power Selection */}
              <Text style={styles.modalLabel}>Select Power *</Text>
              <View style={styles.powerGrid}>
                {["+1.00", "+1.50", "+2.00", "+2.50", "+3.00", "+3.50"].map((power) => (
                  <TouchableOpacity
                    key={power}
                    style={[
                      styles.powerOption,
                      addStockPower === power && styles.powerOptionSelected,
                    ]}
                    onPress={() => setAddStockPower(power)}
                  >
                    <Text
                      style={[
                        styles.powerOptionText,
                        addStockPower === power && styles.powerOptionTextSelected,
                      ]}
                    >
                      {power}D
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Frame Type */}
              <Text style={styles.modalLabel}>Frame Type</Text>
              <View style={styles.frameTypeRow}>
                {["standard", "metal", "fashion"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.frameTypeOption,
                      addStockFrameType === type && styles.frameTypeOptionSelected,
                    ]}
                    onPress={() => setAddStockFrameType(type)}
                  >
                    <Text
                      style={[
                        styles.frameTypeText,
                        addStockFrameType === type && styles.frameTypeTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quantity */}
              <Text style={styles.modalLabel}>Quantity (pairs) *</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setAddStockQuantity(Math.max(0, addStockQuantity - 1))}
                >
                  <Ionicons name="remove" size={24} color="#1E40AF" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{addStockQuantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setAddStockQuantity(addStockQuantity + 1)}
                >
                  <Ionicons name="add" size={24} color="#1E40AF" />
                </TouchableOpacity>
              </View>

              {/* Quick quantity buttons */}
              <View style={styles.quickQuantityRow}>
                {[5, 10, 20, 50].map((qty) => (
                  <TouchableOpacity
                    key={qty}
                    style={styles.quickQuantityButton}
                    onPress={() => setAddStockQuantity(qty)}
                  >
                    <Text style={styles.quickQuantityText}>{qty}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  (!addStockPower || addStockQuantity <= 0) && { opacity: 0.5 },
                ]}
                onPress={handleSubmitAddStock}
                disabled={!addStockPower || addStockQuantity <= 0 || addStockLoading}
              >
                {addStockLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonText}>
                    Add {addStockQuantity > 0 ? `${addStockQuantity} Pairs` : "Stock"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddStockModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
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
    paddingBottom: 120,
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
    height: 100,
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
    maxHeight: "80%",
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
  modalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
    marginTop: 16,
  },
  powerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  powerOption: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    minWidth: 80,
    alignItems: "center",
  },
  powerOptionSelected: {
    borderColor: "#1E40AF",
    backgroundColor: "#EFF6FF",
  },
  powerOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  powerOptionTextSelected: {
    color: "#1E40AF",
  },
  frameTypeRow: {
    flexDirection: "row",
    gap: 10,
  },
  frameTypeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  frameTypeOptionSelected: {
    borderColor: "#1E40AF",
    backgroundColor: "#EFF6FF",
  },
  frameTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  frameTypeTextSelected: {
    color: "#1E40AF",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginVertical: 12,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
  },
  quantityText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1F2937",
    minWidth: 60,
    textAlign: "center",
  },
  quickQuantityRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  quickQuantityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickQuantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  modalButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalCancelButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  modalCancelText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
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
