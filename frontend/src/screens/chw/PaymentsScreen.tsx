import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { apiService } from "../../services/api";
import CHWHeader from "../../components/CHWHeader";
import { exportCsvFile } from "../../utils/export";

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

export default function PaymentsScreen() {
  const navigation = useNavigation<PaymentsScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  // ── Tab / filter state ────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending",
  );
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [providerFilter, setProviderFilter] = useState<
    "all" | "mtn" | "airtel"
  >("all");
  const [methodFilter, setMethodFilter] = useState<
    "all" | "cash" | "mobile_money"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Modal state ───────────────────────────────────────────────────────────
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [markPaidModalVisible, setMarkPaidModalVisible] = useState(false);
  const [clientSummaryVisible, setClientSummaryVisible] = useState(false);

  // ── Selected payment for modals ───────────────────────────────────────────
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedClientPayments, setSelectedClientPayments] = useState<any[]>(
    [],
  );
  const [selectedClientName, setSelectedClientName] = useState("");
  const [selectedClientPhone, setSelectedClientPhone] = useState("");

  // ── Record payment form ───────────────────────────────────────────────────
  const [recordPaymentMethod, setRecordPaymentMethod] = useState<
    "cash" | "mobile_money"
  >("cash");
  const [recordClientName, setRecordClientName] = useState("");
  const [recordClientPhone, setRecordClientPhone] = useState("");
  const [recordAmount, setRecordAmount] = useState("");
  const [recordProvider, setRecordProvider] = useState<"mtn" | "airtel">("mtn");

  // ── Loading state ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingRecord, setSubmittingRecord] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [payments, setPayments] = useState<any[]>([]);

  // Reload every time the screen is focused (e.g. after coming back from another screen)
  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, []),
  );

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPayments();
      if (response?.success) {
        setPayments(response.data || []);
      } else {
        // API returned success:false — show empty list, not an error crash
        setPayments([]);
        console.warn("Payments API returned success:false", response);
      }
    } catch (error: any) {
      console.error("Failed to load payments:", error);
      setPayments([]);
      Alert.alert(
        "Connection Error",
        "Could not load payments. Check your internet and try again.",
        [{ text: "Retry", onPress: loadPayments }, { text: "OK" }],
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  // ── Phone helpers ─────────────────────────────────────────────────────────
  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("256")) return `0${digits.slice(3, 12)}`.slice(0, 10);
    if (digits.startsWith("7")) return `0${digits}`.slice(0, 10);
    return digits.slice(0, 10);
  };

  const normalizePhoneToE164 = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("256")) return `+${digits}`;
    if (digits.startsWith("0")) return `+256${digits.slice(1)}`;
    if (digits.startsWith("7")) return `+256${digits}`;
    return `+${digits}`;
  };

  const isValidUgMobile = (value: string) =>
    /^\+2567\d{8}$/.test(normalizePhoneToE164(value));

  // ── Record new payment ────────────────────────────────────────────────────
  const handleRecordPayment = () => {
    setRecordPaymentMethod("cash");
    setRecordClientName("");
    setRecordClientPhone("");
    setRecordAmount("");
    setRecordProvider("mtn");
    setRecordModalVisible(true);
  };

  const submitRecordedPayment = async () => {
    const amountNumber = Number(recordAmount);
    if (!recordClientName.trim()) {
      Alert.alert("Validation", "Client name is required.");
      return;
    }
    if (
      !recordClientPhone.trim() ||
      !isValidUgMobile(recordClientPhone.trim())
    ) {
      Alert.alert(
        "Validation",
        "Enter a valid Uganda mobile number (e.g. 0773445535).",
      );
      return;
    }
    if (!recordAmount || isNaN(amountNumber) || amountNumber <= 0) {
      Alert.alert("Validation", "Enter a valid payment amount.");
      return;
    }

    const normalizedPhone = normalizePhoneToE164(recordClientPhone.trim());
    setSubmittingRecord(true);
    try {
      const result = await apiService.createPayment({
        clientName: recordClientName.trim(),
        clientPhone: normalizedPhone,
        amount: amountNumber,
        mobileMoneyNumber: normalizedPhone,
        paymentMethod: recordPaymentMethod,
        paymentType: "full",
        ...(recordPaymentMethod === "mobile_money" && {
          provider: recordProvider,
        }),
      });

      if (!result?.success) {
        throw new Error(result?.error || "Failed to record payment");
      }

      setRecordModalVisible(false);
      await loadPayments();

      const statusMsg =
        recordPaymentMethod === "cash"
          ? "Cash payment recorded and marked as completed."
          : "Mobile money payment recorded as pending. Mark it as paid once confirmed.";
      Alert.alert("✅ Payment Recorded", statusMsg);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to record payment. Please try again.",
      );
    } finally {
      setSubmittingRecord(false);
    }
  };

  // ── Mark as paid ──────────────────────────────────────────────────────────
  const handleMarkAsPaid = (payment: any) => {
    setSelectedPayment(payment);
    setMarkPaidModalVisible(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!selectedPayment?.id || confirmingPayment) return;
    setConfirmingPayment(true);
    try {
      const result = await apiService.updatePaymentStatus(
        selectedPayment.id,
        "completed",
      );
      if (!result?.success) throw new Error(result?.error || "Update failed");

      setMarkPaidModalVisible(false);
      await loadPayments();
      Alert.alert(
        "✅ Payment Confirmed",
        `Payment for ${selectedPayment.client_name || "client"} marked as paid.`,
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to update payment. Please try again.",
      );
    } finally {
      setConfirmingPayment(false);
    }
  };

  // ── Client summary ────────────────────────────────────────────────────────
  const getClientPayments = (clientPhone: string) =>
    payments
      .filter((p) => p.client_phone === clientPhone)
      .sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime(),
      );

  const getNextPendingDueDate = (clientPhone: string) => {
    const pending = payments
      .filter(
        (p) =>
          p.client_phone === clientPhone &&
          (p.status === "pending" || p.status === "overdue") &&
          p.due_date,
      )
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
      );
    return pending.length > 0 ? pending[0].due_date : null;
  };

  const openClientSummary = (payment: any) => {
    const phone = payment.client_phone || "";
    setSelectedClientName(payment.client_name || "Client");
    setSelectedClientPhone(phone);
    setSelectedClientPayments(getClientPayments(phone));
    setClientSummaryVisible(true);
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredPayments = payments.filter((p) => {
    const matchesTab =
      activeTab === "pending"
        ? p.status === "pending" || p.status === "overdue"
        : p.status === "completed";
    const matchesOverdue = overdueOnly ? p.status === "overdue" : true;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (p.client_name || "").toLowerCase().includes(q) ||
      (p.client_phone || "").includes(q) ||
      String(p.amount || "").includes(q) ||
      (p.transaction_id || "").toLowerCase().includes(q);
    const matchesProvider =
      providerFilter === "all" ||
      (p.provider || "").toLowerCase() === providerFilter;
    const matchesMethod =
      methodFilter === "all" ||
      (p.payment_method || "").toLowerCase() === methodFilter;
    return (
      matchesTab &&
      matchesOverdue &&
      matchesSearch &&
      matchesProvider &&
      matchesMethod
    );
  });

  // ── Stats from live payment data ──────────────────────────────────────────
  const pendingCount = payments.filter(
    (p) => p.status === "pending" || p.status === "overdue",
  ).length;
  const overdueCount = payments.filter((p) => p.status === "overdue").length;
  const completedCount = payments.filter(
    (p) => p.status === "completed",
  ).length;

  const pendingAmount = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const collectedAmount = payments
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

  // Monthly overview
  const now = new Date();
  const monthlyPayments = payments.filter((p) => {
    const d = new Date(p.payment_date || p.created_at || 0);
    return (
      !isNaN(d.getTime()) &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });
  const monthlyExpected = monthlyPayments.reduce(
    (s, p) => s + (Number(p.amount) || 0),
    0,
  );
  const monthlyCollected = monthlyPayments
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const monthlyRemaining = Math.max(monthlyExpected - monthlyCollected, 0);
  const monthlyPercent =
    monthlyExpected > 0 ? (monthlyCollected / monthlyExpected) * 100 : 0;
  const monthlyPeriod = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      await exportCsvFile({
        fileBaseName: "payments-export",
        title: "Payments CSV Export",
        headers: [
          "Client",
          "Phone",
          "Status",
          "Method",
          "Amount (UGX)",
          "Due Date",
          "Transaction ID",
          "Date",
        ],
        rows: filteredPayments.map((p) => [
          p.client_name || "",
          p.client_phone || "",
          p.status || "",
          p.payment_method || "",
          p.amount || 0,
          p.due_date || "",
          p.transaction_id || "",
          new Date(p.payment_date || p.created_at || 0).toLocaleDateString(),
        ]),
      });
    } catch {
      Alert.alert("Error", "Failed to export payments");
    }
  };

  // ── Payment card ──────────────────────────────────────────────────────────
  const PaymentItemCard = ({ payment }: { payment: any }) => {
    const isOverdue = payment.status === "overdue";
    const isPending = payment.status === "pending" || isOverdue;
    const nextDue = getNextPendingDueDate(payment.client_phone);
    const dueDisplay = payment.due_date
      ? new Date(payment.due_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : nextDue || "N/A";
    const paidDisplay = payment.payment_date
      ? new Date(payment.payment_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

    return (
      <TouchableOpacity
        style={[styles.paymentCard, isOverdue && styles.overdueCard]}
        onPress={() => openClientSummary(payment)}
        activeOpacity={0.85}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.clientInfo}>
            <View style={styles.avatar}>
              <Ionicons
                name="person-circle-outline"
                size={40}
                color="#4B5563"
              />
            </View>
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>
                {payment.client_name || "Unknown Client"}
              </Text>
              <Text style={styles.phoneNumber}>
                {payment.client_phone || "—"}
              </Text>
              {payment.product_name ? (
                <Text style={styles.productInfo}>
                  {payment.product_name}
                  {payment.product_power ? ` (${payment.product_power})` : ""}
                </Text>
              ) : null}
              {payment.payment_type === "installment" &&
              payment.installment_number ? (
                <Text style={styles.productInfo}>
                  Installment {payment.installment_number} of{" "}
                  {payment.total_installments}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>
              UGX {Number(payment.amount || 0).toLocaleString()}
            </Text>
            <Text style={styles.paymentMethodLabel}>
              {payment.payment_method === "mobile_money"
                ? "Mobile Money"
                : "Cash"}
            </Text>
            {isOverdue && <Text style={styles.overdueBadge}>OVERDUE</Text>}
          </View>
        </View>

        <View style={styles.paymentFooter}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                isOverdue
                  ? styles.overdueDot
                  : isPending
                    ? styles.pendingDot
                    : styles.completedDot,
              ]}
            />
            <Text
              style={
                isOverdue
                  ? styles.overdueText
                  : isPending
                    ? styles.pendingText
                    : styles.completedText
              }
            >
              {isPending ? `Due: ${dueDisplay}` : `Paid: ${paidDisplay}`}
            </Text>
          </View>

          {isPending ? (
            <TouchableOpacity
              style={[styles.payButton, isOverdue && styles.overdueButton]}
              onPress={() => handleMarkAsPaid(payment)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark"
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.payButtonText}>MARK PAID</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.completedBadgeText}>PAID</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CHWHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Loading payments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <CHWHeader />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color="#9CA3AF"
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone or amount..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E40AF"]}
          />
        }
      >
        {/* ── Summary Cards (tap to filter) ─────────────────────────────── */}
        <View style={styles.summaryRow}>
          <TouchableOpacity
            style={[
              styles.summaryCard,
              activeTab === "pending" &&
                !overdueOnly &&
                styles.summaryCardActive,
            ]}
            onPress={() => {
              setActiveTab("pending");
              setOverdueOnly(false);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.summaryIcon, { backgroundColor: "#FEF3C7" }]}>
              <MaterialIcons name="pending-actions" size={22} color="#F59E0B" />
            </View>
            <Text style={styles.summaryNumber}>{pendingCount}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryAmount}>
              UGX {pendingAmount.toLocaleString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.summaryCard,
              overdueOnly && styles.summaryCardOverdue,
            ]}
            onPress={() => {
              setActiveTab("pending");
              setOverdueOnly(true);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.summaryIcon, { backgroundColor: "#FEE2E2" }]}>
              <FontAwesome5
                name="exclamation-triangle"
                size={18}
                color="#DC2626"
              />
            </View>
            <Text style={[styles.summaryNumber, { color: "#DC2626" }]}>
              {overdueCount}
            </Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={[styles.summaryAmount, { color: "#DC2626" }]}>
              UGX{" "}
              {payments
                .filter((p) => p.status === "overdue")
                .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
                .toLocaleString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.summaryCard,
              activeTab === "completed" && styles.summaryCardCompleted,
            ]}
            onPress={() => {
              setActiveTab("completed");
              setOverdueOnly(false);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.summaryIcon, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons
                name="checkmark-done-circle"
                size={22}
                color="#059669"
              />
            </View>
            <Text style={[styles.summaryNumber, { color: "#059669" }]}>
              {completedCount}
            </Text>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={[styles.summaryAmount, { color: "#059669" }]}>
              UGX {collectedAmount.toLocaleString()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Record Payment Button ─────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.recordBtn}
          onPress={handleRecordPayment}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.recordBtnText}>Record New Payment</Text>
        </TouchableOpacity>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "pending" && styles.activeTab]}
            onPress={() => {
              setActiveTab("pending");
              setOverdueOnly(false);
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              {overdueOnly
                ? `Overdue (${overdueCount})`
                : `Pending (${pendingCount})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "completed" && styles.activeTab]}
            onPress={() => {
              setActiveTab("completed");
              setOverdueOnly(false);
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "completed" && styles.activeTabText,
              ]}
            >
              Completed ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Payment List ──────────────────────────────────────────────── */}
        <View style={styles.listSection}>
          {filteredPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? "No results found"
                  : `No ${overdueOnly ? "overdue" : activeTab} payments`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try a different search"
                  : activeTab === "pending"
                    ? "All payments are up to date"
                    : "No completed payments yet"}
              </Text>
              {activeTab === "pending" && !searchQuery && (
                <TouchableOpacity
                  style={styles.emptyAction}
                  onPress={handleRecordPayment}
                >
                  <Text style={styles.emptyActionText}>+ Record a Payment</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredPayments.map((payment) => (
              <PaymentItemCard key={payment.id} payment={payment} />
            ))
          )}
        </View>

        {/* ── Monthly Overview ──────────────────────────────────────────── */}
        <View style={styles.monthlySummary}>
          <View style={styles.monthlyHeader}>
            <Text style={styles.monthlyTitle}>Monthly Overview</Text>
            <Text style={styles.monthlyPeriod}>{monthlyPeriod}</Text>
          </View>
          <View style={styles.monthlyRow}>
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyLabel}>Expected</Text>
              <Text style={styles.monthlyValue}>
                UGX {monthlyExpected.toLocaleString()}
              </Text>
            </View>
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyLabel}>Collected</Text>
              <Text style={[styles.monthlyValue, { color: "#059669" }]}>
                UGX {monthlyCollected.toLocaleString()}
              </Text>
            </View>
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyLabel}>Remaining</Text>
              <Text style={[styles.monthlyValue, { color: "#DC2626" }]}>
                UGX {monthlyRemaining.toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(monthlyPercent, 100)}%`,
                  backgroundColor:
                    monthlyCollected >= monthlyExpected && monthlyExpected > 0
                      ? "#059669"
                      : "#F59E0B",
                },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {monthlyPercent.toFixed(0)}% collected
          </Text>
        </View>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleRecordPayment}
          >
            <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
            <Text style={styles.actionBtnText}>New Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
            <Ionicons name="download-outline" size={24} color="#2563EB" />
            <Text style={styles.actionBtnText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter-outline" size={24} color="#2563EB" />
            <Text style={styles.actionBtnText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Record Payment Modal ──────────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={recordModalVisible}
        onRequestClose={() => setRecordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Payment</Text>
              <TouchableOpacity
                onPress={() =>
                  !submittingRecord && setRecordModalVisible(false)
                }
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Payment Method</Text>
            <View style={styles.methodRow}>
              {(["cash", "mobile_money"] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.methodBtn,
                    recordPaymentMethod === m && styles.methodBtnActive,
                  ]}
                  onPress={() => setRecordPaymentMethod(m)}
                >
                  <Ionicons
                    name={
                      m === "cash" ? "cash-outline" : "phone-portrait-outline"
                    }
                    size={16}
                    color={recordPaymentMethod === m ? "#1E40AF" : "#6B7280"}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.methodBtnText,
                      recordPaymentMethod === m && styles.methodBtnTextActive,
                    ]}
                  >
                    {m === "cash" ? "Cash" : "Mobile Money"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Client Name *</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Sarah Nakato"
              value={recordClientName}
              onChangeText={setRecordClientName}
              autoCapitalize="words"
            />

            <Text style={styles.fieldLabel}>Phone Number *</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="0773 445 535"
              value={recordClientPhone}
              onChangeText={(v) => setRecordClientPhone(formatPhoneInput(v))}
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>Amount (UGX) *</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. 15000"
              value={recordAmount}
              onChangeText={setRecordAmount}
              keyboardType="numeric"
            />

            {recordPaymentMethod === "mobile_money" && (
              <>
                <Text style={styles.fieldLabel}>Provider</Text>
                <View style={styles.methodRow}>
                  {(["mtn", "airtel"] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.methodBtn,
                        recordProvider === p && styles.methodBtnActive,
                      ]}
                      onPress={() => setRecordProvider(p)}
                    >
                      <Text
                        style={[
                          styles.methodBtnText,
                          recordProvider === p && styles.methodBtnTextActive,
                        ]}
                      >
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.hintText}>
                  Payment will be recorded as pending. Mark as paid after the
                  client confirms.
                </Text>
              </>
            )}

            {recordPaymentMethod === "cash" && (
              <Text style={styles.hintText}>
                Cash payments are immediately marked as completed.
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setRecordModalVisible(false)}
                disabled={submittingRecord}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  submittingRecord && { opacity: 0.7 },
                ]}
                onPress={submitRecordedPayment}
                disabled={submittingRecord}
              >
                {submittingRecord ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Mark as Paid Modal ────────────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={markPaidModalVisible}
        onRequestClose={() =>
          !confirmingPayment && setMarkPaidModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Payment</Text>
              <TouchableOpacity
                onPress={() =>
                  !confirmingPayment && setMarkPaidModalVisible(false)
                }
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {selectedPayment && (
              <>
                <View style={styles.confirmInfo}>
                  <Ionicons name="person-circle" size={56} color="#4B5563" />
                  <Text style={styles.confirmName}>
                    {selectedPayment.client_name || "Client"}
                  </Text>
                  <Text style={styles.confirmPhone}>
                    {selectedPayment.client_phone || "—"}
                  </Text>
                  <View style={styles.confirmAmountBox}>
                    <Text style={styles.confirmAmountLabel}>
                      Amount to confirm
                    </Text>
                    <Text style={styles.confirmAmount}>
                      UGX {Number(selectedPayment.amount || 0).toLocaleString()}
                    </Text>
                  </View>
                  {selectedPayment.status === "overdue" && (
                    <View style={styles.overdueWarning}>
                      <Ionicons name="warning" size={16} color="#DC2626" />
                      <Text style={styles.overdueWarningText}>
                        This payment is overdue
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setMarkPaidModalVisible(false)}
                    disabled={confirmingPayment}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      { backgroundColor: "#059669" },
                      confirmingPayment && { opacity: 0.7 },
                    ]}
                    onPress={confirmMarkAsPaid}
                    disabled={confirmingPayment}
                  >
                    {confirmingPayment ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color="#fff"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.confirmBtnText}>Mark as Paid</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Filter Modal ──────────────────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Payments</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Provider</Text>
            <View style={styles.methodRow}>
              {(["all", "mtn", "airtel"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.methodBtn,
                    providerFilter === p && styles.methodBtnActive,
                  ]}
                  onPress={() => setProviderFilter(p)}
                >
                  <Text
                    style={[
                      styles.methodBtnText,
                      providerFilter === p && styles.methodBtnTextActive,
                    ]}
                  >
                    {p.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Method</Text>
            <View style={styles.methodRow}>
              {(
                [
                  ["all", "ALL"],
                  ["cash", "Cash"],
                  ["mobile_money", "Mobile Money"],
                ] as const
              ).map(([val, label]) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.methodBtn,
                    methodFilter === val && styles.methodBtnActive,
                  ]}
                  onPress={() => setMethodFilter(val)}
                >
                  <Text
                    style={[
                      styles.methodBtnText,
                      methodFilter === val && styles.methodBtnTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setProviderFilter("all");
                  setMethodFilter("all");
                  setOverdueOnly(false);
                }}
              >
                <Text style={styles.cancelBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.confirmBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Client Summary Modal ──────────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={clientSummaryVisible}
        onRequestClose={() => setClientSummaryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: "75%" }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Client History</Text>
              <TouchableOpacity onPress={() => setClientSummaryVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmName}>{selectedClientName}</Text>
            <Text style={styles.confirmPhone}>{selectedClientPhone}</Text>

            <View style={styles.clientStatsRow}>
              <View style={styles.clientStat}>
                <Text style={styles.clientStatNum}>
                  {selectedClientPayments.length}
                </Text>
                <Text style={styles.clientStatLabel}>Total</Text>
              </View>
              <View style={styles.clientStat}>
                <Text style={[styles.clientStatNum, { color: "#059669" }]}>
                  {
                    selectedClientPayments.filter(
                      (p) => p.status === "completed",
                    ).length
                  }
                </Text>
                <Text style={styles.clientStatLabel}>Paid</Text>
              </View>
              <View style={styles.clientStat}>
                <Text style={[styles.clientStatNum, { color: "#F59E0B" }]}>
                  {
                    selectedClientPayments.filter(
                      (p) => p.status === "pending" || p.status === "overdue",
                    ).length
                  }
                </Text>
                <Text style={styles.clientStatLabel}>Pending</Text>
              </View>
              <View style={styles.clientStat}>
                <Text style={styles.clientStatNum}>
                  {(
                    selectedClientPayments
                      .filter((p) => p.status === "completed")
                      .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0) /
                    1000
                  ).toFixed(0)}
                  K
                </Text>
                <Text style={styles.clientStatLabel}>UGX Paid</Text>
              </View>
            </View>

            <ScrollView
              style={{ flex: 1, marginTop: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {selectedClientPayments.map((p) => (
                <View key={p.id} style={styles.historyItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>
                      UGX {(parseFloat(p.amount) || 0).toLocaleString()}
                      {p.payment_type === "installment" && p.installment_number
                        ? ` • Installment ${p.installment_number}/${p.total_installments}`
                        : ""}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(
                        p.payment_date || p.created_at || 0,
                      ).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {p.due_date
                        ? ` • Due: ${new Date(p.due_date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}`
                        : ""}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      p.status === "completed"
                        ? styles.pillCompleted
                        : p.status === "overdue"
                          ? styles.pillOverdue
                          : styles.pillPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        p.status === "completed"
                          ? { color: "#059669" }
                          : p.status === "overdue"
                            ? { color: "#DC2626" }
                            : { color: "#F59E0B" },
                      ]}
                    >
                      {p.status}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Bottom Navigation ─────────────────────────────────────────────── */}
      <View
        style={[
          styles.bottomNav,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "AppTabs", params: { role: "CHW" } }],
            })
          }
        >
          <Ionicons name="home-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              "Screen" as any,
              { screen: "VHTScreeningStep1" } as any,
            )
          }
        >
          <Ionicons name="eye-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Screen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("InventoryScreen")}
        >
          <Ionicons name="cube-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
          <View style={styles.activeNavIcon}>
            <Ionicons name="cash" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.navTextActive}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("ReferralsScreen")}
        >
          <Ionicons name="document-text-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Referrals</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6B7280" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#374151" },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 },

  // Summary cards
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryCardActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  summaryCardOverdue: { borderColor: "#DC2626", backgroundColor: "#FEF2F2" },
  summaryCardCompleted: { borderColor: "#059669", backgroundColor: "#F0FDF4" },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryNumber: { fontSize: 22, fontWeight: "700", color: "#1F2937" },
  summaryLabel: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  summaryAmount: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
  },

  // Record button
  recordBtn: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recordBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 8 },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  activeTabText: { color: "#1E40AF" },

  // Payment list
  listSection: { marginBottom: 20 },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  overdueCard: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  clientInfo: { flexDirection: "row", flex: 1 },
  avatar: { marginRight: 12 },
  clientDetails: { flex: 1 },
  clientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  phoneNumber: { fontSize: 13, color: "#6B7280", marginBottom: 2 },
  productInfo: { fontSize: 12, color: "#9CA3AF", fontStyle: "italic" },
  amountContainer: { alignItems: "flex-end" },
  amount: { fontSize: 17, fontWeight: "700", color: "#1F2937" },
  paymentMethodLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  overdueBadge: {
    fontSize: 9,
    fontWeight: "700",
    color: "#DC2626",
    backgroundColor: "#FECACA",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    textAlign: "center",
  },
  paymentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
  },
  statusContainer: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  pendingDot: { backgroundColor: "#F59E0B" },
  completedDot: { backgroundColor: "#059669" },
  overdueDot: { backgroundColor: "#DC2626" },
  pendingText: { fontSize: 13, color: "#F59E0B" },
  completedText: { fontSize: 13, color: "#059669" },
  overdueText: { fontSize: 13, color: "#DC2626" },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  overdueButton: { backgroundColor: "#DC2626" },
  payButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  completedBadgeText: { fontSize: 13, color: "#059669", fontWeight: "700" },

  // Empty state
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: { fontSize: 14, color: "#9CA3AF", textAlign: "center" },
  emptyAction: {
    marginTop: 16,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyActionText: { color: "#1E40AF", fontWeight: "600", fontSize: 14 },

  // Monthly summary
  monthlySummary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  monthlyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  monthlyTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  monthlyPeriod: { fontSize: 13, color: "#6B7280" },
  monthlyRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 14,
  },
  monthlyItem: { alignItems: "center" },
  monthlyLabel: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  monthlyValue: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  progressBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressLabel: { fontSize: 12, color: "#6B7280", textAlign: "center" },

  // Quick actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  actionBtn: { alignItems: "center", padding: 12 },
  actionBtnText: {
    fontSize: 11,
    color: "#2563EB",
    marginTop: 4,
    fontWeight: "500",
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingTop: 12,
    maxHeight: "90%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 10,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: "#111827",
  },
  methodRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  methodBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  methodBtnActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  methodBtnText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  methodBtnTextActive: { color: "#1E40AF" },
  hintText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 4,
    fontStyle: "italic",
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#1E40AF",
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  confirmBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },

  // Mark as paid modal
  confirmInfo: { alignItems: "center", paddingVertical: 16 },
  confirmName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 10,
    marginBottom: 4,
  },
  confirmPhone: { fontSize: 14, color: "#6B7280", marginBottom: 12 },
  confirmAmountBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 8,
  },
  confirmAmountLabel: { fontSize: 12, color: "#6B7280" },
  confirmAmount: { fontSize: 26, fontWeight: "700", color: "#059669" },
  overdueWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  overdueWarningText: { color: "#DC2626", fontSize: 13, fontWeight: "600" },

  // Client summary modal
  clientStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    marginBottom: 4,
  },
  clientStat: { alignItems: "center" },
  clientStatNum: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  clientStatLabel: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#FAFAFA",
  },
  historyTitle: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  historyDate: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillCompleted: { backgroundColor: "#D1FAE5" },
  pillPending: { backgroundColor: "#FEF3C7" },
  pillOverdue: { backgroundColor: "#FEE2E2" },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  // Bottom nav
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 4 },
  navItemActive: { flex: 1, alignItems: "center", paddingVertical: 4 },
  activeNavIcon: {
    backgroundColor: "#2563EB",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -18,
    marginBottom: 2,
  },
  navText: { fontSize: 10, color: "#6B7280", marginTop: 3 },
  navTextActive: { fontSize: 10, color: "#2563EB", fontWeight: "700" },
});
