import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { apiService } from "../../services/api";
import { exportCsvFile, exportPdfFromHtml } from "../../utils/export";
import CHWHeader from "../../components/CHWHeader";

type RootStackParamList = {
  CHWDashboard: undefined;
  Reports: undefined;
  Settings: undefined;
};

type ReportsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Reports"
>;

type ReportSummary = {
  total_screenings: number;
  glasses_sold: number;
  referrals_made: number;
  total_payments: number;
  completed_payments: number;
  total_revenue: number;
  average_sale: number;
  full_payment_revenue: number;
  hire_purchase_revenue: number;
};

type ReportsBundle = {
  summary: ReportSummary;
  screenings: any[];
  payments: any[];
  referrals: any[];
};

type InventorySummary = {
  products: any[];
  totals: {
    total_pairs?: number;
    total_standard?: number;
    total_metal?: number;
    total_fashion?: number;
  };
};

const emptySummary: ReportSummary = {
  total_screenings: 0,
  glasses_sold: 0,
  referrals_made: 0,
  total_payments: 0,
  completed_payments: 0,
  total_revenue: 0,
  average_sale: 0,
  full_payment_revenue: 0,
  hire_purchase_revenue: 0,
};

const formatUGX = (value: number) =>
  new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const toIso = (date: Date) => date.toISOString().split("T")[0];

const getDateRangeByPeriod = (period: string) => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "Daily":
      break;
    case "Weekly":
      start.setDate(end.getDate() - 6);
      break;
    case "Monthly":
      start.setDate(1);
      break;
    case "Quarterly":
      start.setMonth(end.getMonth() - 2, 1);
      break;
    case "6 Months":
      start.setMonth(end.getMonth() - 5, 1);
      break;
    case "Yearly":
      start.setMonth(0, 1);
      break;
    default:
      start.setDate(1);
      break;
  }

  return { startDate: toIso(start), endDate: toIso(end) };
};

const getFrameType = (payment: any) => {
  const explicit = String(payment?.frame_type || "").toLowerCase();
  if (explicit.includes("metal")) return "Metal";
  if (explicit.includes("fashion")) return "Fashion";
  if (explicit.includes("standard")) return "Standard";

  const productName = String(payment?.product_name || "").toLowerCase();
  if (productName.includes("metal")) return "Metal";
  if (productName.includes("fashion")) return "Fashion";
  return "Standard";
};

const getPowerLabel = (payment: any) => {
  const explicit = payment?.product_power ?? payment?.power;
  if (explicit !== undefined && explicit !== null && `${explicit}`.trim() !== "") {
    const n = Number(explicit);
    if (!Number.isNaN(n)) return n > 0 ? `+${n.toFixed(2)}D` : `${n.toFixed(2)}D`;
    return `${explicit}`;
  }

  const productName = String(payment?.product_name || "");
  const match = productName.match(/[+-]?\d+(\.\d+)?/);
  if (match?.[0]) {
    const n = Number(match[0]);
    if (!Number.isNaN(n)) return n > 0 ? `+${n.toFixed(2)}D` : `${n.toFixed(2)}D`;
  }
  return "Unknown";
};

export default function ReportsScreen() {
  const navigation = useNavigation<ReportsScreenNavigationProp>();
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");
  const [activeMetricTab, setActiveMetricTab] = useState<
    "sales" | "hire" | "stock" | "referrals"
  >("sales");
  const [reports, setReports] = useState<ReportsBundle>({
    summary: emptySummary,
    screenings: [],
    payments: [],
    referrals: [],
  });
  const [inventory, setInventory] = useState<InventorySummary>({
    products: [],
    totals: {},
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [userDistrict, setUserDistrict] = useState("");

  const periods = ["Daily", "Weekly", "Monthly", "Quarterly", "6 Months", "Yearly"];

  useEffect(() => {
    loadReports(selectedPeriod);
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await apiService.getCurrentUser();
      if (user) {
        setUserName(user.fullName || user.full_name || "");
        setUserDistrict(user.district || "");
      }
    } catch (error) {
      console.error("load user data error:", error);
    }
  };

  const loadReports = async (period: string) => {
    try {
      const { startDate, endDate } = getDateRangeByPeriod(period);
      const [summaryRes, screeningsRes, paymentsRes, referralsRes, inventoryRes] =
        await Promise.all([
          apiService.getReports(undefined, startDate, endDate),
          apiService.getReports("screenings", startDate, endDate),
          apiService.getReports("payments", startDate, endDate),
          apiService.getReports("referrals", startDate, endDate),
          apiService.getInventorySummary(),
        ]);

      setReports({
        summary: summaryRes?.success ? summaryRes.data || emptySummary : emptySummary,
        screenings: screeningsRes?.success ? screeningsRes.data || [] : [],
        payments: paymentsRes?.success ? paymentsRes.data || [] : [],
        referrals: referralsRes?.success ? referralsRes.data || [] : [],
      });
      setInventory(
        inventoryRes?.success
          ? {
              products: inventoryRes?.data?.products || [],
              totals: inventoryRes?.data?.totals || {},
            }
          : { products: [], totals: {} },
      );
    } catch (error) {
      console.error("Failed to load reports:", error);
      Alert.alert("Reports Error", "Failed to load report data from the database.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports(selectedPeriod);
    setRefreshing(false);
  };

  const handlePeriodPress = async (period: string) => {
    if (period === selectedPeriod) return;
    setSelectedPeriod(period);
    setLoading(true);
    await loadReports(period);
  };

  const completedPayments = useMemo(
    () => reports.payments.filter((p) => `${p?.status}`.toLowerCase() === "completed"),
    [reports.payments],
  );

  const scopedPayments = useMemo(() => {
    if (activeMetricTab === "hire") {
      return completedPayments.filter((p) => {
        const type = `${p?.payment_type || ""}`.toLowerCase();
        return type === "installment" || type === "hire-purchase" || type === "hire_purchase";
      });
    }
    if (activeMetricTab === "referrals") return [];
    return completedPayments;
  }, [activeMetricTab, completedPayments]);

  const revenueTotal = scopedPayments.reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);
  const salesCount = scopedPayments.length;
  const avgSale = salesCount > 0 ? Math.round(revenueTotal / salesCount) : 0;
  const fullPaymentRevenue = scopedPayments.reduce((sum, p) => {
    const type = `${p?.payment_type || ""}`.toLowerCase();
    return type === "full" ? sum + (Number(p?.amount) || 0) : sum;
  }, 0);
  const hirePurchaseRevenue = scopedPayments.reduce((sum, p) => {
    const type = `${p?.payment_type || ""}`.toLowerCase();
    return type === "installment" || type === "hire-purchase" || type === "hire_purchase"
      ? sum + (Number(p?.amount) || 0)
      : sum;
  }, 0);

  const powerRows = useMemo(() => {
    const map = new Map<string, { label: string; count: number; revenue: number }>();
    scopedPayments.forEach((p) => {
      const label = getPowerLabel(p);
      const amount = Number(p?.amount) || 0;
      const prev = map.get(label) || { label, count: 0, revenue: 0 };
      map.set(label, {
        label,
        count: prev.count + 1,
        revenue: prev.revenue + amount,
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 7);
  }, [scopedPayments]);

  const frameRows = useMemo(() => {
    const map = new Map<string, { label: string; count: number; revenue: number }>();
    scopedPayments.forEach((p) => {
      const label = getFrameType(p);
      const amount = Number(p?.amount) || 0;
      const prev = map.get(label) || { label, count: 0, revenue: 0 };
      map.set(label, {
        label,
        count: prev.count + 1,
        revenue: prev.revenue + amount,
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [scopedPayments]);

  const maxPowerCount = Math.max(1, ...powerRows.map((r) => r.count));

  const allHirePayments = useMemo(
    () =>
      reports.payments.filter((p) => {
        const type = `${p?.payment_type || ""}`.toLowerCase();
        return type === "installment" || type === "hire-purchase" || type === "hire_purchase";
      }),
    [reports.payments],
  );

  const hireCompletedPayments = allHirePayments.filter(
    (p) => `${p?.status || ""}`.toLowerCase() === "completed",
  );
  const hirePendingPayments = allHirePayments.filter((p) => {
    const status = `${p?.status || ""}`.toLowerCase();
    return status === "pending" || status === "overdue";
  });

  const totalHireValue = allHirePayments.reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);
  const hireCollectedValue = hireCompletedPayments.reduce(
    (sum, p) => sum + (Number(p?.amount) || 0),
    0,
  );
  const hireOutstandingValue = Math.max(totalHireValue - hireCollectedValue, 0);
  const hireCollectionRate =
    totalHireValue > 0 ? Math.round((hireCollectedValue / totalHireValue) * 100) : 0;
  const hireClientsCount = new Set(
    allHirePayments.map((p) => p?.client_phone || p?.client_name || p?.id),
  ).size;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const hireOverdueCount = hirePendingPayments.filter((p) => {
    const status = `${p?.status || ""}`.toLowerCase();
    if (status === "overdue") return true;
    const due = p?.due_date ? new Date(p.due_date) : null;
    return due ? due < today : false;
  }).length;

  const hireDueSoonCount = hirePendingPayments.filter((p) => {
    const due = p?.due_date ? new Date(p.due_date) : null;
    if (!due) return false;
    const inSevenDays = new Date(today);
    inSevenDays.setDate(today.getDate() + 7);
    return due >= today && due <= inSevenDays;
  }).length;

  const hireOnTrackCount = Math.max(
    hirePendingPayments.length - hireDueSoonCount - hireOverdueCount,
    0,
  );

  const recentHirePayments = [...hireCompletedPayments]
    .sort((a, b) => {
      const da = new Date(a?.payment_date || a?.created_at || 0).getTime();
      const db = new Date(b?.payment_date || b?.created_at || 0).getTime();
      return db - da;
    })
    .slice(0, 5);

  const stockProducts = inventory.products || [];
  const totalStockPairs = Number(inventory.totals?.total_pairs || 0);
  const stockValue = stockProducts.reduce(
    (sum, p) => sum + (Number(p?.price) || 0) * (Number(p?.stock_quantity) || 0),
    0,
  );
  const stockNormalCount = stockProducts.filter((p) => `${p?.status}` === "normal").length;
  const stockLowCount = stockProducts.filter((p) => `${p?.status}` === "low").length;
  const stockCriticalCount = stockProducts.filter((p) => `${p?.status}` === "critical").length;
  const stockOutCount = stockProducts.filter((p) => `${p?.status}` === "out_of_stock").length;
  const stockHealthyRate =
    stockProducts.length > 0
      ? Math.round((stockNormalCount / stockProducts.length) * 100)
      : 0;
  const stockStandard = Number(inventory.totals?.total_standard || 0);
  const stockMetal = Number(inventory.totals?.total_metal || 0);
  const stockFashion = Number(inventory.totals?.total_fashion || 0);
  const recentStockAlerts = [...stockProducts]
    .sort((a, b) => (Number(a?.stock_quantity) || 0) - (Number(b?.stock_quantity) || 0))
    .slice(0, 5);

  const allReferrals = reports.referrals || [];
  const totalReferrals = allReferrals.length;
  const completedReferrals = allReferrals.filter(
    (r) => `${r?.status || ""}`.toLowerCase() === "completed",
  );
  const pendingReferrals = allReferrals.filter(
    (r) => `${r?.status || ""}`.toLowerCase() === "pending",
  );
  const highUrgencyReferrals = allReferrals.filter((r) => {
    const urgency = `${r?.urgency || ""}`.toLowerCase();
    return urgency === "high" || urgency === "urgent";
  });
  const referralCompletionRate =
    totalReferrals > 0 ? Math.round((completedReferrals.length / totalReferrals) * 100) : 0;

  const ncdReasonRegex = /(diabet|hypertens|ncd|bp|sugar|stroke|cardio|asthma)/i;
  const ncdReferralsCount = allReferrals.filter((r) =>
    ncdReasonRegex.test(String(r?.reason || "")),
  ).length;
  const eyeCareReferralsCount = Math.max(totalReferrals - ncdReferralsCount, 0);

  const referralTypeMap = new Map<string, number>();
  allReferrals.forEach((r) => {
    const reason = String(r?.reason || "Other").trim() || "Other";
    referralTypeMap.set(reason, (referralTypeMap.get(reason) || 0) + 1);
  });
  const referralTypeRows = Array.from(referralTypeMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxReferralTypeCount = Math.max(1, ...referralTypeRows.map((r) => r.count));

  const recentReferrals = [...allReferrals]
    .sort((a, b) => {
      const da = new Date(a?.referred_date || a?.created_at || 0).getTime();
      const db = new Date(b?.referred_date || b?.created_at || 0).getTime();
      return db - da;
    })
    .slice(0, 5);

  const facilityMap = new Map<string, number>();
  allReferrals.forEach((r) => {
    const facility = String(r?.facility_name || "").trim();
    if (!facility) return;
    facilityMap.set(facility, (facilityMap.get(facility) || 0) + 1);
  });
  const topFacility =
    Array.from(facilityMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "No facility data";

  const handleExport = async () => {
    try {
      setActionLoading(true);
      const exportRowsByTab: Record<string, Array<[string, string | number]>> = {
        sales: [
          ["Total Revenue", formatUGX(revenueTotal)],
          ["Average Sale", formatUGX(avgSale)],
          ["Sales Count", salesCount],
          ["Full Payments Revenue", formatUGX(fullPaymentRevenue)],
          ["Hire Purchase Revenue", formatUGX(hirePurchaseRevenue)],
        ],
        hire: [
          ["Total HP Value", formatUGX(totalHireValue)],
          ["Collection Rate", `${hireCollectionRate}%`],
          ["Collected", formatUGX(hireCollectedValue)],
          ["Outstanding", formatUGX(hireOutstandingValue)],
          ["On Track", hireOnTrackCount],
          ["Due Soon", hireDueSoonCount],
          ["Overdue", hireOverdueCount],
        ],
        stock: [
          ["Total Stock Value", formatUGX(stockValue)],
          ["Total Pairs", totalStockPairs],
          ["Stock Health", `${stockHealthyRate}%`],
          ["Healthy", stockNormalCount],
          ["Low/Critical", stockLowCount + stockCriticalCount],
          ["Out of Stock", stockOutCount],
          ["Standard", stockStandard],
          ["Metal", stockMetal],
          ["Fashion", stockFashion],
        ],
        referrals: [
          ["Total Referrals", totalReferrals],
          ["Completion Rate", `${referralCompletionRate}%`],
          ["Completed", completedReferrals.length],
          ["Pending", pendingReferrals.length],
          ["High Priority", highUrgencyReferrals.length],
          ["Eye Care", eyeCareReferralsCount],
          ["NCD", ncdReferralsCount],
          ["Top Facility", topFacility],
        ],
      };
      const activeExportRows = exportRowsByTab[activeMetricTab] || exportRowsByTab.sales;

      Alert.alert("Export Report", "Choose export format", [
        {
          text: "CSV",
          onPress: async () => {
            try {
              await exportCsvFile({
                fileBaseName: `reports-${selectedPeriod.toLowerCase()}`,
                title: `Reports ${selectedPeriod} CSV`,
                headers: ["Period", "Tab", "Metric", "Value"],
                rows: activeExportRows.map(([metric, value]) => [
                  selectedPeriod,
                  activeMetricTab,
                  metric,
                  value,
                ]),
              });
            } catch (error) {
              Alert.alert("Export Error", "Could not export CSV report.");
            }
          },
        },
        {
          text: "PDF",
          onPress: async () => {
            try {
              const html = `
                <html>
                  <body style="font-family: Arial; padding: 24px;">
                    <h2>Sante Initiative Report (${selectedPeriod})</h2>
                    <p>Scope: ${activeMetricTab}</p>
                    <table border="1" cellspacing="0" cellpadding="8" style="border-collapse: collapse; width: 100%;">
                      <tr><th align="left">Metric</th><th align="left">Value</th></tr>
                      ${activeExportRows
                        .map(
                          ([metric, value]) =>
                            `<tr><td>${String(metric)}</td><td>${String(value)}</td></tr>`,
                        )
                        .join("")}
                    </table>
                  </body>
                </html>
              `;
              await exportPdfFromHtml({
                title: `Reports ${selectedPeriod} PDF`,
                html,
              });
            } catch (error) {
              Alert.alert("Export Error", "Could not export PDF report.");
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <CHWHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2E7D32"]} />
        }
      >
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Reports & Analytics</Text>
          <Text style={styles.subtitle}>Generate comprehensive reports</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodRow}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodChip, selectedPeriod === period && styles.periodChipActive]}
              onPress={() => handlePeriodPress(period)}
            >
              <Text
                style={[
                  styles.periodChipText,
                  selectedPeriod === period && styles.periodChipTextActive,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.metricTabs}>
          <TouchableOpacity
            style={styles.metricTab}
            onPress={() => setActiveMetricTab("sales")}
          >
            <Ionicons
              name="cash-outline"
              size={14}
              color={activeMetricTab === "sales" ? "#2E7D32" : "#6B7280"}
            />
            <Text style={[styles.metricText, activeMetricTab === "sales" && styles.metricTextActive]}>
              Sales
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.metricTab} onPress={() => setActiveMetricTab("hire")}>
            <Ionicons
              name="card-outline"
              size={14}
              color={activeMetricTab === "hire" ? "#2E7D32" : "#6B7280"}
            />
            <Text style={[styles.metricText, activeMetricTab === "hire" && styles.metricTextActive]}>
              Hire-Purchase
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.metricTab} onPress={() => setActiveMetricTab("stock")}>
            <Ionicons
              name="cube-outline"
              size={14}
              color={activeMetricTab === "stock" ? "#2E7D32" : "#6B7280"}
            />
            <Text style={[styles.metricText, activeMetricTab === "stock" && styles.metricTextActive]}>
              Stock
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.metricTab}
            onPress={() => setActiveMetricTab("referrals")}
          >
            <Ionicons
              name="people-outline"
              size={14}
              color={activeMetricTab === "referrals" ? "#2E7D32" : "#6B7280"}
            />
            <Text
              style={[
                styles.metricText,
                activeMetricTab === "referrals" && styles.metricTextActive,
              ]}
            >
              Referrals
            </Text>
          </TouchableOpacity>
        </View>

        {activeMetricTab === "hire" ? (
          <>
            <View style={styles.cardsGrid}>
              <View style={[styles.card, styles.cardBlue]}>
                <Text style={styles.cardTitleLight}>Total HP Value</Text>
                <Text style={styles.cardValueLight}>{formatUGX(totalHireValue)}</Text>
                <Text style={styles.cardSubLight}>{hireClientsCount} clients</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Collection Rate</Text>
                <Text style={styles.cardValue}>{hireCollectionRate}%</Text>
                <Text style={[styles.cardSub, { color: "#16A34A" }]}>on track</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Collected</Text>
                <Text style={[styles.cardValue, { color: "#16A34A" }]}>
                  {formatUGX(hireCollectedValue)}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Outstanding</Text>
                <Text style={[styles.cardValue, { color: "#B45309" }]}>
                  {formatUGX(hireOutstandingValue)}
                </Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Payment Status</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusCard, styles.statusCardGreen]}>
                  <Text style={[styles.statusValue, { color: "#15803D" }]}>{hireOnTrackCount}</Text>
                  <Text style={[styles.statusLabel, { color: "#15803D" }]}>On Track</Text>
                </View>
                <View style={[styles.statusCard, styles.statusCardAmber]}>
                  <Text style={[styles.statusValue, { color: "#A16207" }]}>{hireDueSoonCount}</Text>
                  <Text style={[styles.statusLabel, { color: "#A16207" }]}>Due Soon</Text>
                </View>
                <View style={[styles.statusCard, styles.statusCardRed]}>
                  <Text style={[styles.statusValue, { color: "#BE123C" }]}>{hireOverdueCount}</Text>
                  <Text style={[styles.statusLabel, { color: "#BE123C" }]}>Overdue</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Recent Payments</Text>
              {recentHirePayments.length === 0 ? (
                <Text style={styles.emptyText}>No hire-purchase payments in this period.</Text>
              ) : (
                recentHirePayments.map((p, idx) => {
                  const paymentDate = p?.payment_date || p?.created_at;
                  return (
                    <View
                      key={`${p?.id || p?.transaction_id || idx}`}
                      style={[
                        styles.recentPaymentRow,
                        idx === recentHirePayments.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recentName}>{p?.client_name || "Unknown Client"}</Text>
                        <Text style={styles.recentMeta}>
                          {paymentDate ? new Date(paymentDate).toLocaleDateString() : "-"}
                        </Text>
                      </View>
                      <Text style={styles.recentAmount}>{formatUGX(Number(p?.amount) || 0)}</Text>
                    </View>
                  );
                })
              )}
            </View>
          </>
        ) : activeMetricTab === "stock" ? (
          <>
            <View style={styles.cardsGrid}>
              <View style={[styles.card, styles.cardBlue]}>
                <Text style={styles.cardTitleLight}>Total Stock Value</Text>
                <Text style={styles.cardValueLight}>{formatUGX(stockValue)}</Text>
                <Text style={styles.cardSubLight}>{totalStockPairs} pairs</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Stock Health</Text>
                <Text style={styles.cardValue}>{stockHealthyRate}%</Text>
                <Text style={[styles.cardSub, { color: "#16A34A" }]}>healthy</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>In Stock</Text>
                <Text style={[styles.cardValue, { color: "#16A34A" }]}>
                  {stockNormalCount + stockLowCount}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Out of Stock</Text>
                <Text style={[styles.cardValue, { color: "#BE123C" }]}>{stockOutCount}</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Stock Status</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusCard, styles.statusCardGreen]}>
                  <Text style={[styles.statusValue, { color: "#15803D" }]}>{stockNormalCount}</Text>
                  <Text style={[styles.statusLabel, { color: "#15803D" }]}>Healthy</Text>
                </View>
                <View style={[styles.statusCard, styles.statusCardAmber]}>
                  <Text style={[styles.statusValue, { color: "#A16207" }]}>
                    {stockLowCount + stockCriticalCount}
                  </Text>
                  <Text style={[styles.statusLabel, { color: "#A16207" }]}>Low/Critical</Text>
                </View>
                <View style={[styles.statusCard, styles.statusCardRed]}>
                  <Text style={[styles.statusValue, { color: "#BE123C" }]}>{stockOutCount}</Text>
                  <Text style={[styles.statusLabel, { color: "#BE123C" }]}>Out</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Stock by Frame Type</Text>
              <View style={styles.frameRow}>
                <Text style={styles.frameLabel}>Standard</Text>
                <Text style={styles.frameMeta}>{stockStandard} pairs</Text>
              </View>
              <View style={styles.frameRow}>
                <Text style={styles.frameLabel}>Metal</Text>
                <Text style={styles.frameMeta}>{stockMetal} pairs</Text>
              </View>
              <View style={styles.frameRow}>
                <Text style={styles.frameLabel}>Fashion</Text>
                <Text style={styles.frameMeta}>{stockFashion} pairs</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Recent Stock Alerts</Text>
              {recentStockAlerts.length === 0 ? (
                <Text style={styles.emptyText}>No stock products available.</Text>
              ) : (
                recentStockAlerts.map((p, idx) => (
                  <View
                    key={`${p?.id || idx}`}
                    style={[
                      styles.recentPaymentRow,
                      idx === recentStockAlerts.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recentName}>{p?.name || "Product"}</Text>
                      <Text style={styles.recentMeta}>
                        {p?.power ? `Power ${p.power}` : "No power"} - status:{" "}
                        {String(p?.status || "unknown").replace(/_/g, " ")}
                      </Text>
                    </View>
                    <Text style={styles.recentAmount}>{Number(p?.stock_quantity) || 0}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        ) : activeMetricTab === "referrals" ? (
          <>
            <View style={styles.cardsGrid}>
              <View style={[styles.card, styles.cardBlue]}>
                <Text style={styles.cardTitleLight}>Total Referrals</Text>
                <Text style={styles.cardValueLight}>{totalReferrals}</Text>
                <Text style={styles.cardSubLight}>{pendingReferrals.length} pending</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Completion Rate</Text>
                <Text style={styles.cardValue}>{referralCompletionRate}%</Text>
                <Text style={[styles.cardSub, { color: "#16A34A" }]}>
                  {completedReferrals.length} completed
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Eye Care</Text>
                <Text style={styles.cardValue}>{eyeCareReferralsCount}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>High Priority</Text>
                <Text style={[styles.cardValue, { color: "#BE123C" }]}>
                  {highUrgencyReferrals.length}
                </Text>
                <Text style={styles.cardSub}>NCD: {ncdReferralsCount}</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Referral by Type</Text>
              {referralTypeRows.length === 0 ? (
                <Text style={styles.emptyText}>No referrals in this period.</Text>
              ) : (
                referralTypeRows.map((row) => (
                  <View key={row.label} style={styles.powerRow}>
                    <View style={styles.powerTop}>
                      <Text style={styles.powerLabel}>{row.label}</Text>
                      <Text style={styles.powerMeta}>{row.count}</Text>
                    </View>
                    <View style={styles.refTrack}>
                      <View
                        style={[
                          styles.refFill,
                          { width: `${(row.count / maxReferralTypeCount) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Recent Referrals</Text>
              {recentReferrals.length === 0 ? (
                <Text style={styles.emptyText}>No recent referrals.</Text>
              ) : (
                recentReferrals.map((r, idx) => {
                  const status = `${r?.status || "pending"}`.toLowerCase();
                  const statusStyle =
                    status === "completed"
                      ? styles.badgeCompleted
                      : status === "active"
                      ? styles.badgeActive
                      : styles.badgePending;
                  const statusTextStyle =
                    status === "completed"
                      ? styles.badgeCompletedText
                      : status === "active"
                      ? styles.badgeActiveText
                      : styles.badgePendingText;
                  return (
                    <View
                      key={`${r?.id || idx}`}
                      style={[
                        styles.recentPaymentRow,
                        idx === recentReferrals.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recentName}>{r?.client_name || "Unknown client"}</Text>
                        <Text style={styles.recentMeta}>
                          {r?.facility_name || "No facility"} -{" "}
                          {r?.referred_date
                            ? new Date(r.referred_date).toLocaleDateString()
                            : "No date"}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, statusStyle]}>
                        <Text style={[styles.statusBadgeText, statusTextStyle]}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <View style={styles.topFacilityCard}>
              <Text style={styles.topFacilityLabel}>Top Referral Facility</Text>
              <Text style={styles.topFacilityName}>{topFacility}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.cardsGrid}>
              <View style={[styles.card, styles.cardGreen]}>
                <Text style={styles.cardTitleLight}>Total Revenue</Text>
                <Text style={styles.cardValueLight}>{formatUGX(revenueTotal)}</Text>
                <Text style={styles.cardSubLight}>{salesCount} sales</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Average Sale</Text>
                <Text style={styles.cardValue}>{formatUGX(avgSale)}</Text>
                <Text style={styles.cardSub}>per transaction</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Full Payments</Text>
                <Text style={styles.cardValue}>{formatUGX(fullPaymentRevenue)}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Hire-Purchase</Text>
                <Text style={styles.cardValue}>{formatUGX(hirePurchaseRevenue)}</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Sales by Power</Text>
              {powerRows.map((row) => (
                <View key={row.label} style={styles.powerRow}>
                  <View style={styles.powerTop}>
                    <Text style={styles.powerLabel}>{row.label}</Text>
                    <Text style={styles.powerMeta}>
                      {row.count} sales {formatUGX(row.revenue)}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${
                            (row.count / maxPowerCount) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
              {powerRows.length === 0 && <Text style={styles.emptyText}>No sales in this period.</Text>}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Sales by Frame Type</Text>
              {frameRows.map((row) => (
                <View key={row.label} style={styles.frameRow}>
                  <Text style={styles.frameLabel}>{row.label}</Text>
                  <Text style={styles.frameMeta}>{row.count} sales  {formatUGX(row.revenue)}</Text>
                </View>
              ))}
              {frameRows.length === 0 && <Text style={styles.emptyText}>No frame sales in this period.</Text>}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#6B7280" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { width: 72, height: 24, resizeMode: "contain" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  userInfo: { alignItems: "flex-end", marginRight: 8, maxWidth: 120 },
  userName: { fontSize: 11, color: "#111827", fontWeight: "600" },
  userRole: { fontSize: 10, color: "#6B7280" },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    marginRight: 6,
  },
  exportIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 100 },
  titleWrap: { marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  subtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  periodRow: { marginBottom: 10 },
  periodChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  periodChipActive: { backgroundColor: "#2E7D32", borderColor: "#2E7D32" },
  periodChipText: { fontSize: 11, color: "#4B5563", fontWeight: "500" },
  periodChipTextActive: { color: "#FFFFFF" },
  metricTabs: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
    flexWrap: "wrap",
  },
  metricTab: { flexDirection: "row", alignItems: "center", marginRight: 14, marginBottom: 4 },
  metricText: { fontSize: 12, color: "#6B7280", marginLeft: 4, fontWeight: "500" },
  metricTextActive: { color: "#2E7D32", fontWeight: "700" },
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 12 },
  card: {
    width: "49%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  cardGreen: { backgroundColor: "#1B7A2A", borderColor: "#1B7A2A" },
  cardBlue: { backgroundColor: "#1558BC", borderColor: "#1558BC" },
  cardTitle: { fontSize: 11, color: "#6B7280", marginBottom: 4 },
  cardValue: { fontSize: 22, color: "#111827", fontWeight: "700" },
  cardSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  cardTitleLight: { fontSize: 11, color: "#D1FAE5", marginBottom: 4 },
  cardValueLight: { fontSize: 22, color: "#FFFFFF", fontWeight: "700" },
  cardSubLight: { fontSize: 11, color: "#ECFDF5", marginTop: 2 },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 12, color: "#111827", fontWeight: "700", marginBottom: 8 },
  statusRow: { flexDirection: "row", justifyContent: "space-between" },
  statusCard: {
    width: "32%",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCardGreen: { backgroundColor: "#ECFDF3" },
  statusCardAmber: { backgroundColor: "#FFF8E1" },
  statusCardRed: { backgroundColor: "#FFF1F2" },
  statusValue: { fontSize: 22, fontWeight: "700" },
  statusLabel: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  recentPaymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  recentName: { fontSize: 12, color: "#111827", fontWeight: "600" },
  recentMeta: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  recentAmount: { fontSize: 12, color: "#111827", fontWeight: "600" },
  powerRow: { marginBottom: 8 },
  powerTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  powerLabel: { fontSize: 12, color: "#1F2937", fontWeight: "600" },
  powerMeta: { fontSize: 11, color: "#6B7280" },
  progressTrack: { height: 6, borderRadius: 4, backgroundColor: "#E5E7EB", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#2E7D32" },
  refTrack: { height: 6, borderRadius: 4, backgroundColor: "#E5E7EB", overflow: "hidden" },
  refFill: { height: "100%", backgroundColor: "#1D4ED8" },
  frameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  frameLabel: { fontSize: 12, color: "#1F2937", fontWeight: "500" },
  frameMeta: { fontSize: 11, color: "#6B7280" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 10, fontWeight: "700" },
  badgePending: { backgroundColor: "#FFF8E1" },
  badgePendingText: { color: "#A16207" },
  badgeActive: { backgroundColor: "#EFF6FF" },
  badgeActiveText: { color: "#1D4ED8" },
  badgeCompleted: { backgroundColor: "#ECFDF3" },
  badgeCompletedText: { color: "#15803D" },
  topFacilityCard: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  topFacilityLabel: { fontSize: 10, color: "#1D4ED8", fontWeight: "600", marginBottom: 4 },
  topFacilityName: { fontSize: 15, color: "#1E3A8A", fontWeight: "700" },
  emptyText: { fontSize: 12, color: "#9CA3AF", paddingVertical: 8 },
});
