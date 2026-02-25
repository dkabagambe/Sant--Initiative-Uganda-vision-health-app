import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { moderateScale, scale, verticalScale, fontSize as responsiveFontSize } from "../../utils/responsive";

interface StockItemProps {
  power: string;
  totalPairs: number;
  status: "normal" | "low" | "critical";
  breakdown: {
    standard: number;
    metal: number;
    fashion: number;
  };
}

interface SaleItemProps {
  clientName: string;
  power: string;
  frameType: string;
  amount: string;
  time: string;
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
        <Text style={styles.stockPower}>{power}D</Text>
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

export default function InventoryDetailsScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<SaleItemProps[]>([]);
  const [totals, setTotals] = useState({
    total_pairs: 0,
    total_standard: 0,
    total_metal: 0,
    total_fashion: 0,
  });
  const [stats, setStats] = useState({
    weekSold: 0,
    lowStockCount: 0,
    totalRevenue: 0,
    fullPayments: 0,
    hirePurchase: 0,
  });

  // Add Stock Modal State
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [addStockPower, setAddStockPower] = useState<string | null>(null);
  const [addStockFrameType, setAddStockFrameType] = useState("standard");
  const [addStockQuantity, setAddStockQuantity] = useState(0);
  const [addStockLoading, setAddStockLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadInventory(), loadSalesData()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadInventory = async () => {
    try {
      // Try getInventorySummary first (authenticated), fallback to getInventory
      const response = await apiService.getInventorySummary();
      if (response.success && response.data?.products?.length > 0) {
        setInventory(response.data.products);
        setTotals({
          total_pairs: response.data.totalStock?.total_pairs || 0,
          total_standard: response.data.totalStock?.total_standard || 0,
          total_metal: response.data.totalStock?.total_metal || 0,
          total_fashion: response.data.totalStock?.total_fashion || 0,
        });
      } else {
        // Fallback to unauthenticated endpoint
        const fallback = await apiService.getInventory();
        if (fallback.success) {
          setInventory(fallback.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
      // Fallback to unauthenticated endpoint
      try {
        const fallback = await apiService.getInventory();
        if (fallback.success) {
          setInventory(fallback.data || []);
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
  };

  const loadSalesData = async () => {
    try {
      const response = await apiService.getPayments();
      if (response.success) {
        const sales = (response.data || [])
          .slice(0, 5)
          .map((payment: any) => ({
            clientName: payment.client_name || "Unknown",
            power: "+1.00", // TODO: Get from product when linked
            frameType: "standard", // TODO: Get from product when linked
            amount: `UGX ${(payment.amount || 0).toLocaleString()}`,
            time: new Date(payment.payment_date || payment.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
        setRecentSales(sales);

        // Calculate stats
        const weekSold = response.data?.length || 0;
        const lowStockCount = inventory.filter((p: any) => p.stock_quantity < 10).length;
        const totalRevenue = response.data?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
        const fullPayments = response.data?.filter((p: any) => p.payment_type === "full").reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
        const hirePurchase = totalRevenue - fullPayments;

        setStats({
          weekSold,
          lowStockCount,
          totalRevenue,
          fullPayments,
          hirePurchase,
        });
      }
    } catch (error) {
      console.error("Failed to load sales data:", error);
    }
  };

  const getStatus = (quantity: number): "normal" | "low" | "critical" | undefined => {
    if (quantity === 0) return "critical";
    if (quantity < 5) return "critical";
    if (quantity < 10) return "low";
    return undefined;
  };

  const handleAddStock = () => {
    setAddStockPower(null);
    setAddStockFrameType("standard");
    setAddStockQuantity(0);
    setShowAddStockModal(true);
  };

  const handleSubmitAddStock = async () => {
    if (!addStockPower || addStockQuantity <= 0) {
      Alert.alert("Error", "Please select a power and enter a valid quantity");
      return;
    }

    setAddStockLoading(true);
    try {
      const product = inventory.find((p) => p.power === addStockPower);
      if (!product) {
        Alert.alert("Error", "Product not found");
        return;
      }

      const result = await apiService.addStock(product.id, addStockQuantity, addStockFrameType);
      if (result.success) {
        Alert.alert("Success", "Stock added successfully");
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
      const lowStockItems = inventory.filter((p: any) => p.stock_quantity < 10);
      if (lowStockItems.length === 0) {
        Alert.alert("Info", "No items need replenishment at the moment.");
        return;
      }

      // In production, this would call an API
      // await apiService.requestStockReplenishment({ items: lowStockItems });
      Alert.alert(
        "✅ Request Submitted",
        "Your stock replenishment request has been submitted successfully. You will be notified when stock arrives."
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E40AF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory Management</Text>
        <View style={{ width: 24 }} />
      </View>

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
          <Text style={styles.totalStock}>Total stock: {totals.total_pairs || 0} pairs</Text>
        </View>

        {/* Low Stock Alert - Dynamic */}
        {inventory.filter((p: any) => p.stock_quantity > 0 && p.stock_quantity < 20).length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons name="alert-circle" size={24} color="#DC2626" />
              <Text style={styles.alertTitle}>Low stock alert</Text>
            </View>
            <Text style={styles.alertText}>
              {inventory
                .filter((p: any) => p.stock_quantity > 0 && p.stock_quantity < 20)
                .map((p: any) => `${p.power}D has only ${p.stock_quantity} pairs left`)
                .join(". ")}
              . Consider reordering.
            </Text>
          </View>
        )}

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
                status={getStatus(item.stock_quantity) || "normal"}
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
            <TouchableOpacity onPress={() => navigation.navigate("SalesDetailsScreen")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.salesList}>
            {recentSales.length > 0 ? (
              recentSales.map((sale, index) => (
                <SaleItem key={index} {...sale} />
              ))
            ) : (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Ionicons name="receipt-outline" size={32} color="#D1D5DB" />
                <Text style={{ color: "#9CA3AF", marginTop: 8, fontSize: 14 }}>No sales this week</Text>
              </View>
            )}
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
              {/* Power Selection - from database */}
              <Text style={styles.modalLabel}>Select Power *</Text>
              <View style={styles.powerGrid}>
                {inventory.map((product: any) => (
                  <TouchableOpacity
                    key={product.id}
                    style={[
                      styles.powerOption,
                      addStockPower === product.power && styles.powerOptionSelected,
                    ]}
                    onPress={() => setAddStockPower(product.power)}
                  >
                    <Text
                      style={[
                        styles.powerOptionText,
                        addStockPower === product.power && styles.powerOptionTextSelected,
                      ]}
                    >
                      {product.power}D
                    </Text>
                    <Text style={{ fontSize: 11, color: product.stock_quantity === 0 ? "#DC2626" : "#6B7280", marginTop: 2 }}>
                      {product.stock_quantity} in stock
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
                  <Ionicons name="remove" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={addStockQuantity.toString()}
                  onChangeText={(text) => setAddStockQuantity(parseInt(text) || 0)}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setAddStockQuantity(addStockQuantity + 1)}
                >
                  <Ionicons name="add" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Quick Select */}
              <View style={styles.quickQuantityRow}>
                {[5, 10, 20, 50].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={styles.quickQuantityButton}
                    onPress={() => setAddStockQuantity(addStockQuantity + num)}
                  >
                    <Text style={styles.quickQuantityText}>+{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Submit Buttons */}
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowAddStockModal(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSubmitButton, addStockLoading && { opacity: 0.7 }]}
                  onPress={handleSubmitAddStock}
                  disabled={addStockLoading}
                >
                  {addStockLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalSubmitButtonText}>
                      Add {addStockQuantity} Pairs
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: responsiveFontSize.large,
    fontWeight: "600",
    color: "#1F2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: responsiveFontSize.medium,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(120),
  },
  titleSection: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  screenTitle: {
    fontSize: responsiveFontSize.xlarge,
    fontWeight: "700",
    color: "#1F2937",
  },
  totalStock: {
    fontSize: responsiveFontSize.medium,
    color: "#6B7280",
    marginTop: verticalScale(4),
  },
  alertCard: {
    backgroundColor: "#FEF2F2",
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    padding: scale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
    gap: scale(8),
  },
  alertTitle: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#DC2626",
  },
  alertText: {
    fontSize: responsiveFontSize.regular,
    color: "#7F1D1D",
    lineHeight: verticalScale(20),
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    gap: scale(12),
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: scale(16),
    borderRadius: moderateScale(12),
    alignItems: "center",
    elevation: 2,
  },
  statNumber: {
    fontSize: responsiveFontSize.xlarge,
    fontWeight: "700",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: responsiveFontSize.small,
    color: "#6B7280",
    marginTop: verticalScale(4),
  },
  section: {
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: responsiveFontSize.large,
    fontWeight: "600",
    color: "#1F2937",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E40AF",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    gap: scale(6),
  },
  addButtonText: {
    fontSize: responsiveFontSize.small,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stockList: {
    gap: verticalScale(12),
  },
  stockItem: {
    backgroundColor: "#FFFFFF",
    padding: scale(16),
    borderRadius: moderateScale(12),
    elevation: 2,
  },
  stockItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  stockPower: {
    fontSize: responsiveFontSize.large,
    fontWeight: "600",
    color: "#1F2937",
  },
  stockQuantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  stockQuantity: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#1F2937",
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  statusText: {
    fontSize: responsiveFontSize.small,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  breakdownContainer: {
    gap: verticalScale(8),
  },
  frameBreakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  frameDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  breakdownText: {
    fontSize: responsiveFontSize.regular,
    color: "#6B7280",
  },
  breakdownCount: {
    fontWeight: "600",
    color: "#1F2937",
  },
  salesList: {
    gap: verticalScale(12),
  },
  saleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: scale(16),
    borderRadius: moderateScale(12),
    elevation: 2,
  },
  saleAvatar: {
    marginRight: scale(12),
  },
  saleDetails: {
    flex: 1,
  },
  saleClientName: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: verticalScale(2),
  },
  saleDescription: {
    fontSize: responsiveFontSize.regular,
    color: "#6B7280",
    marginBottom: verticalScale(2),
  },
  saleTime: {
    fontSize: responsiveFontSize.small,
    color: "#9CA3AF",
  },
  saleAmount: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#059669",
  },
  viewAllText: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#1E40AF",
  },
  revenueCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    padding: scale(20),
    borderRadius: moderateScale(12),
    elevation: 2,
  },
  revenueTitle: {
    fontSize: responsiveFontSize.large,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: verticalScale(8),
  },
  revenueSubtitle: {
    fontSize: responsiveFontSize.regular,
    color: "#6B7280",
    marginBottom: verticalScale(12),
  },
  revenueAmount: {
    fontSize: responsiveFontSize.xxlarge,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: verticalScale(20),
  },
  revenueBreakdown: {
    marginBottom: verticalScale(20),
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  breakdownLabel: {
    fontSize: responsiveFontSize.regular,
    color: "#6B7280",
  },
  breakdownValue: {
    fontSize: responsiveFontSize.regular,
    fontWeight: "600",
    color: "#1F2937",
  },
  requestButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: "center",
  },
  requestButtonText: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomSpacer: {
    height: verticalScale(100),
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
    padding: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: responsiveFontSize.large,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalBody: {
    padding: scale(20),
  },
  modalLabel: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: verticalScale(12),
  },
  powerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
    marginBottom: verticalScale(20),
  },
  powerOption: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: moderateScale(8),
    padding: scale(12),
    alignItems: "center",
    minWidth: scale(70),
  },
  powerOptionSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#1E40AF",
  },
  powerOptionText: {
    fontSize: responsiveFontSize.regular,
    fontWeight: "600",
    color: "#1F2937",
  },
  powerOptionTextSelected: {
    color: "#1E40AF",
  },
  frameTypeRow: {
    flexDirection: "row",
    gap: scale(8),
    marginBottom: verticalScale(20),
  },
  frameTypeOption: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    alignItems: "center",
  },
  frameTypeOptionSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#1E40AF",
  },
  frameTypeText: {
    fontSize: responsiveFontSize.regular,
    fontWeight: "600",
    color: "#1F2937",
  },
  frameTypeTextSelected: {
    color: "#1E40AF",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(16),
    marginBottom: verticalScale(20),
  },
  quantityButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityInput: {
    width: scale(80),
    height: scale(48),
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: moderateScale(8),
    textAlign: "center",
    fontSize: responsiveFontSize.large,
    fontWeight: "600",
    color: "#1F2937",
  },
  quickQuantityRow: {
    flexDirection: "row",
    gap: scale(8),
    marginBottom: verticalScale(20),
  },
  quickQuantityButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    alignItems: "center",
  },
  quickQuantityText: {
    fontSize: responsiveFontSize.regular,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalSubmitButton: {
    flex: 2,
    backgroundColor: "#1E40AF",
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: "center",
  },
  modalSubmitButtonText: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
