import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  PaymentsScreen: undefined;
  CHWDashboard: undefined;
  VisionScreeningStep1: undefined;
  InventoryScreen: undefined;
  ReferralsScreen: undefined;
  PaymentDetails: { paymentId: string };
};

type PaymentsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PaymentsScreen"
>;

interface PaymentItem {
  id: string;
  clientName: string;
  phoneNumber: string;
  status: "pending" | "completed" | "overdue";
  date: string;
  dueDate?: string;
  method: string;
  amount: string;
  progress?: string; // e.g., "Installation 2 of 3"
  isOverdue: boolean;
}

export default function PaymentsScreen() {
  const navigation = useNavigation<PaymentsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending",
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPayments, setFilteredPayments] = useState<PaymentItem[]>([]);

  // Sample data
  const paymentData: PaymentItem[] = [
    {
      id: "1",
      clientName: "Nakato Grace",
      phoneNumber: "0700123456",
      status: "pending",
      date: "Jan 10, 2026",
      dueDate: "Jan 15, 2026",
      method: "MTN Money",
      amount: "UGX 10,000",
      progress: "Installation 2 of 3",
      isOverdue: false,
    },
    {
      id: "2",
      clientName: "Musoke Peter",
      phoneNumber: "0700234567",
      status: "pending",
      date: "Jan 5, 2026",
      dueDate: "Jan 10, 2026",
      method: "Airtel Money",
      amount: "UGX 15,000",
      progress: "Installation 1 of 3",
      isOverdue: true,
    },
    {
      id: "3",
      clientName: "Nambi Sarah",
      phoneNumber: "0700345678",
      status: "completed",
      date: "Jan 20, 2026",
      method: "Cash",
      amount: "UGX 15,000",
      progress: "Installation 3 of 3",
      isOverdue: false,
    },
    {
      id: "4",
      clientName: "Okello James",
      phoneNumber: "0700456789",
      status: "completed",
      date: "Jan 5, 2026",
      method: "MTN Money",
      amount: "UGX 15,000",
      isOverdue: false,
    },
  ];

  // Filter payments based on active tab and search
  const pendingPayments = paymentData.filter(
    (p) =>
      p.status === "pending" &&
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const completedPayments = paymentData.filter(
    (p) =>
      p.status === "completed" &&
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentPayments =
    activeTab === "pending" ? pendingPayments : completedPayments;

  const handleMarkAsPaid = (payment: PaymentItem) => {
    setSelectedPayment(payment);
    setModalVisible(true);
  };

  const confirmPayment = () => {
    Alert.alert(
      "Payment Confirmed",
      `Successfully marked payment for ${selectedPayment?.clientName} as paid.`,
      [{ text: "OK", onPress: () => setModalVisible(false) }],
    );
  };

  const PaymentItemCard = ({ payment }: { payment: PaymentItem }) => (
    <TouchableOpacity
      style={[styles.paymentCard, payment.isOverdue && styles.overdueCard]}
      onPress={() =>
        navigation.navigate("PaymentDetails", { paymentId: payment.id })
      }
    >
      <View style={styles.paymentHeader}>
        <View style={styles.clientInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person-circle-outline" size={40} color="#4B5563" />
          </View>
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{payment.clientName}</Text>
            <Text style={styles.phoneNumber}>
              <Ionicons name="call-outline" size={12} color="#6B7280" />{" "}
              {payment.phoneNumber}
            </Text>
            {payment.progress && (
              <Text style={styles.installationProgress}>
                {payment.progress}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{payment.amount}</Text>
          {payment.isOverdue && (
            <Text style={styles.overdueBadge}>OVERDUE</Text>
          )}
        </View>
      </View>

      <View style={styles.paymentFooter}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, styles[`${payment.status}Dot`]]} />
          <Text style={styles[`${payment.status}Text`]}>
            {payment.status === "pending"
              ? `Due: ${payment.dueDate}`
              : `Paid: ${payment.date}`}
          </Text>
        </View>

        {payment.status === "pending" && (
          <TouchableOpacity
            style={[
              styles.payButton,
              payment.isOverdue && styles.overdueButton,
            ]}
            onPress={() => handleMarkAsPaid(payment)}
          >
            <Text style={styles.payButtonText}>
              {payment.isOverdue ? "MARK PAID" : "MARK PAID"}
            </Text>
          </TouchableOpacity>
        )}

        {payment.status === "completed" && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.completedText}>PAID</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Statistics
  const stats = {
    pending: pendingPayments.length,
    overdue: pendingPayments.filter((p) => p.isOverdue).length,
    completed: completedPayments.length,
    totalAmount: pendingPayments.reduce(
      (sum, p) => sum + parseInt(p.amount.replace(/\D/g, "")),
      0,
    ),
    collectedAmount: completedPayments.reduce(
      (sum, p) => sum + parseInt(p.amount.replace(/\D/g, "")),
      0,
    ),
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.organization}>Santé Initiative</Text>
              <Text style={styles.userName}>VHT</Text>
              {/* <Text style={styles.userRole}>CHW - Luweero</Text> */}
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#374151" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search payments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <MaterialIcons name="pending-actions" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.summaryNumber}>{stats.pending}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <FontAwesome5
                name="exclamation-triangle"
                size={20}
                color="#DC2626"
              />
            </View>
            <Text style={styles.summaryNumber}>{stats.overdue}</Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons
                name="checkmark-done-circle"
                size={24}
                color="#059669"
              />
            </View>
            <Text style={styles.summaryNumber}>{stats.completed}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "pending" && styles.activeTab]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              Pending ({stats.pending})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "completed" && styles.activeTab]}
            onPress={() => setActiveTab("completed")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "completed" && styles.activeTabText,
              ]}
            >
              Completed ({stats.completed})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment List */}
        <View style={styles.section}>
          {currentPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No payments found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? "Try a different search"
                  : `No ${activeTab} payments`}
              </Text>
            </View>
          ) : (
            currentPayments.map((payment) => (
              <PaymentItemCard key={payment.id} payment={payment} />
            ))
          )}
        </View>

        {/* Monthly Summary */}
        <View style={styles.monthlySummary}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Monthly Overview</Text>
            <Text style={styles.summaryPeriod}>January 2026</Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expected</Text>
              <Text style={styles.summaryAmount}>
                UGX {stats.totalAmount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Collected</Text>
              <Text style={[styles.summaryAmount, { color: "#059669" }]}>
                UGX {stats.collectedAmount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text style={[styles.summaryAmount, { color: "#DC2626" }]}>
                UGX{" "}
                {(stats.totalAmount - stats.collectedAmount).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${stats.collectedAmount > 0 ? (stats.collectedAmount / stats.totalAmount) * 100 : 0}%`,
                    backgroundColor:
                      stats.collectedAmount >= stats.totalAmount
                        ? "#059669"
                        : "#F59E0B",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressPercentageText}>
              {((stats.collectedAmount / stats.totalAmount) * 100 || 0).toFixed(
                0,
              )}
              % collected
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={24} color="#2563EB" />
            <Text style={styles.actionText}>New Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={24} color="#2563EB" />
            <Text style={styles.actionText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="filter" size={24} color="#2563EB" />
            <Text style={styles.actionText}>Filter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Mark as Paid Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mark as Paid</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {selectedPayment && (
              <>
                <View style={styles.modalClientInfo}>
                  <Ionicons
                    name="person-circle-outline"
                    size={48}
                    color="#4B5563"
                  />
                  <Text style={styles.modalClientName}>
                    {selectedPayment.clientName}
                  </Text>
                  <Text style={styles.modalClientPhone}>
                    {selectedPayment.phoneNumber}
                  </Text>
                  <Text style={styles.modalAmount}>
                    {selectedPayment.amount}
                  </Text>
                  {selectedPayment.isOverdue && (
                    <Text style={styles.modalOverdue}>
                      OVERDUE - {selectedPayment.dueDate}
                    </Text>
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={confirmPayment}
                  >
                    <Text style={styles.confirmButtonText}>
                      Confirm Payment
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

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

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("InventoryScreen")}
        >
          <Ionicons name="cube-outline" size={24} color="#6B7280" />
          <Text style={styles.navText}>Stock</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemActive}>
          <View style={styles.activeNavIcon}>
            <Ionicons name="cash" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.navTextActive}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("ReferralsScreen")}
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
    backgroundColor: "#F9FAFB",
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerInfo: {
    marginLeft: 12,
  },
  organization: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  userRole: {
    fontSize: 13,
    color: "#6B7280",
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryCard: {
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
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#1E40AF",
  },
  section: {
    marginBottom: 24,
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  overdueCard: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: "row",
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  installationProgress: {
    // Renamed from progressText
    fontSize: 13,
    color: "#4B5563",
    fontStyle: "italic",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  overdueBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626",
    backgroundColor: "#FECACA",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  paymentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pendingDot: {
    backgroundColor: "#F59E0B",
  },
  completedDot: {
    backgroundColor: "#059669",
  },
  overdueDot: {
    backgroundColor: "#DC2626",
  },
  pendingText: {
    fontSize: 14,
    color: "#F59E0B",
  },
  completedText: {
    fontSize: 14,
    color: "#059669",
  },
  overdueText: {
    fontSize: 14,
    color: "#DC2626",
  },
  payButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  overdueButton: {
    backgroundColor: "#DC2626",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  monthlySummary: {
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
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  summaryPeriod: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBackground: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressPercentageText: {
    // Renamed from progressText
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    alignItems: "center",
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 4,
    fontWeight: "500",
  },
  bottomSpacer: {
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
    borderTopColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
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
  activeNavIcon: {
    backgroundColor: "#2563EB",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
    marginBottom: 4,
  },
  navText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalClientInfo: {
    alignItems: "center",
    marginBottom: 32,
  },
  modalClientName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 12,
    marginBottom: 4,
  },
  modalClientPhone: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  modalAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  modalOverdue: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
