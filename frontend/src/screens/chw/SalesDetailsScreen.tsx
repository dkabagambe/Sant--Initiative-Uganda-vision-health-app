import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../../services/api";
import { moderateScale, scale, verticalScale, fontSize as responsiveFontSize } from "../../utils/responsive";

interface SaleItemProps {
  id: string;
  clientName: string;
  power: string;
  frameType: string;
  amount: string;
  time: string;
  paymentMethod: string;
  paymentType: string;
}

const SaleItem = ({
  clientName,
  power,
  frameType,
  amount,
  time,
  paymentMethod,
  paymentType,
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
        <View style={styles.paymentBadge}>
          <Text style={styles.paymentBadgeText}>
            {paymentType === "full" ? "Full Payment" : "Hire-Purchase"}
          </Text>
        </View>
      </View>
      <Text style={styles.saleAmount}>{amount}</Text>
    </View>
  );
};

export default function SalesDetailsScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sales, setSales] = useState<SaleItemProps[]>([]);
  const [filteredSales, setFilteredSales] = useState<SaleItemProps[]>([]);
  const [filterType, setFilterType] = useState<"week" | "month" | "custom">("week");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    fullPayments: 0,
    hirePurchase: 0,
  });

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, filterType, customStartDate, customEndDate]);

  const loadSales = async () => {
    try {
      const response = await apiService.getPayments();
      if (response.success) {
        const formattedSales = (response.data || []).map((payment: any) => ({
          id: payment.id,
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
          paymentMethod: payment.payment_method || "mobile_money",
          paymentType: payment.payment_type || "full",
        }));
        setSales(formattedSales);

        // Calculate stats
        const totalSales = response.data?.length || 0;
        const totalRevenue = response.data?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
        const fullPayments = response.data?.filter((p: any) => p.payment_type === "full").reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
        const hirePurchase = totalRevenue - fullPayments;

        setStats({
          totalSales,
          totalRevenue,
          fullPayments,
          hirePurchase,
        });
      }
    } catch (error) {
      console.error("Failed to load sales:", error);
      Alert.alert("Error", "Failed to load sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSales();
    setRefreshing(false);
  };

  const filterSales = () => {
    const now = new Date();
    let filtered = [...sales];

    if (filterType === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = sales.filter((sale) => {
        const saleDate = new Date(sale.time);
        return saleDate >= weekAgo;
      });
    } else if (filterType === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = sales.filter((sale) => {
        const saleDate = new Date(sale.time);
        return saleDate >= monthAgo;
      });
    } else if (filterType === "custom") {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        filtered = sales.filter((sale) => {
          const saleDate = new Date(sale.time);
          return saleDate >= start && saleDate <= end;
        });
      }
    }

    setFilteredSales(filtered);
  };

  const handleExport = () => {
    Alert.alert(
      "Export Sales Data",
      "Sales data will be exported as CSV and shared via email or other apps.",
      [
        {
          text: "Export This Week",
          onPress: () => exportData("week"),
        },
        {
          text: "Export This Month",
          onPress: () => exportData("month"),
        },
        {
          text: "Export All",
          onPress: () => exportData("all"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const exportData = (period: "week" | "month" | "all") => {
    let dataToExport = [...sales];
    
    if (period === "week") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      dataToExport = sales.filter((sale) => {
        const saleDate = new Date(sale.time);
        return saleDate >= weekAgo;
      });
    } else if (period === "month") {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dataToExport = sales.filter((sale) => {
        const saleDate = new Date(sale.time);
        return saleDate >= monthAgo;
      });
    }

    // Create CSV content
    const headers = ["Client Name", "Power", "Frame Type", "Amount", "Time", "Payment Method", "Payment Type"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map((sale) => [
        sale.clientName,
        sale.power,
        sale.frameType,
        sale.amount,
        sale.time,
        sale.paymentMethod,
        sale.paymentType,
      ].join(",")),
    ].join("\n");

    // In a real app, you would use Share API or File System API to save/share the CSV
    Alert.alert(
      "Export Complete",
      `Exported ${dataToExport.length} sales records. In production, this would save/share a CSV file.`
    );
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "custom":
        return customStartDate && customEndDate
          ? `${customStartDate} - ${customEndDate}`
          : "Custom Range";
      default:
        return "This Week";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Loading sales data...</Text>
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
        <Text style={styles.headerTitle}>Sales Management</Text>
        <TouchableOpacity onPress={handleExport}>
          <Ionicons name="download-outline" size={24} color="#1E40AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalSales}</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>UGX {stats.totalRevenue.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
        </View>

        {/* Payment Type Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Payment Type Breakdown</Text>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: "#10B981" }]} />
              <Text style={styles.breakdownLabel}>Full Payments</Text>
              <Text style={styles.breakdownValue}>UGX {stats.fullPayments.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: "#F59E0B" }]} />
              <Text style={styles.breakdownLabel}>Hire-Purchase</Text>
              <Text style={styles.breakdownValue}>UGX {stats.hirePurchase.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter Sales</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Text style={styles.filterButtonText}>{getFilterLabel()}</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sales List */}
        <View style={styles.salesSection}>
          <Text style={styles.salesTitle}>
            Sales ({filteredSales.length} records)
          </Text>
          {filteredSales.length > 0 ? (
            <FlatList
              data={filteredSales}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <SaleItem {...item} />}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No sales found for selected period</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting the date filter</Text>
            </View>
          )}
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Sales</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterType === "week" && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setFilterType("week");
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.filterOptionText}>This Week</Text>
                {filterType === "week" && (
                  <Ionicons name="checkmark" size={20} color="#1E40AF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterType === "month" && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setFilterType("month");
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.filterOptionText}>This Month</Text>
                {filterType === "month" && (
                  <Ionicons name="checkmark" size={20} color="#1E40AF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterType === "custom" && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setFilterType("custom");
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.filterOptionText}>Custom Range</Text>
                {filterType === "custom" && (
                  <Ionicons name="checkmark" size={20} color="#1E40AF" />
                )}
              </TouchableOpacity>

              {filterType === "custom" && (
                <View style={styles.customDateSection}>
                  <Text style={styles.customDateLabel}>Start Date</Text>
                  <TextInput
                    style={styles.customDateInput}
                    value={customStartDate}
                    onChangeText={setCustomStartDate}
                    placeholder="YYYY-MM-DD"
                  />
                  <Text style={styles.customDateLabel}>End Date</Text>
                  <TextInput
                    style={styles.customDateInput}
                    value={customEndDate}
                    onChangeText={setCustomEndDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              )}
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
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
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
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    padding: scale(16),
    borderRadius: moderateScale(12),
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: verticalScale(12),
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  breakdownDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  breakdownLabel: {
    fontSize: responsiveFontSize.small,
    color: "#6B7280",
  },
  breakdownValue: {
    fontSize: responsiveFontSize.small,
    fontWeight: "600",
    color: "#1F2937",
  },
  filterSection: {
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterTitle: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#1F2937",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: scale(6),
  },
  filterButtonText: {
    fontSize: responsiveFontSize.small,
    color: "#6B7280",
  },
  salesSection: {
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
  },
  salesTitle: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: verticalScale(12),
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
    marginBottom: verticalScale(4),
  },
  paymentBadge: {
    alignSelf: "flex-start",
  },
  paymentBadgeText: {
    fontSize: responsiveFontSize.small,
    fontWeight: "600",
    color: "#1E40AF",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  saleAmount: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#059669",
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: verticalScale(8),
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: verticalScale(40),
  },
  emptyStateText: {
    fontSize: responsiveFontSize.medium,
    color: "#6B7280",
    marginTop: verticalScale(12),
  },
  emptyStateSubtext: {
    fontSize: responsiveFontSize.small,
    color: "#9CA3AF",
    marginTop: verticalScale(4),
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
    maxHeight: "60%",
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
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterOptionSelected: {
    backgroundColor: "#F0FDF4",
  },
  filterOptionText: {
    fontSize: responsiveFontSize.medium,
    color: "#1F2937",
  },
  customDateSection: {
    marginTop: verticalScale(20),
    paddingTop: verticalScale(20),
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  customDateLabel: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: verticalScale(8),
  },
  customDateInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    fontSize: responsiveFontSize.medium,
    marginBottom: verticalScale(16),
  },
});
