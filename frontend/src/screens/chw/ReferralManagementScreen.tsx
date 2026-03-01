import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppHeader from "../../components/AppHeader";
import { exportCsvFile } from "../../utils/export";

interface Referral {
  id: string;
  client_name: string;
  client_phone: string;
  client_age: number;
  client_gender: string;
  client_district: string;
  reason: string;
  urgency: "urgent" | "normal" | "high" | "low";
  facility_name: string;
  facility_location: string;
  referred_date: string;
  completed_date?: string;
  notes?: string;
  status: "pending" | "active" | "completed";
}

export default function ReferralManagementScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("completed");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editFacilityName, setEditFacilityName] = useState("");
  const [editFacilityLocation, setEditFacilityLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editUrgency, setEditUrgency] = useState<Referral["urgency"]>("normal");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadUserData(), loadReferrals()]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const user = await apiService.getCurrentUser();
      if (user) {
        setUserData(user);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const loadReferrals = async () => {
    try {
      const response = await apiService.getReferrals();
      if (response.success) {
        setReferrals(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load referrals:", error);
      setReferrals([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReferrals();
    setRefreshing(false);
  };

  const handleMarkComplete = async (referralId: string) => {
    Alert.alert(
      "Mark as Complete",
      "Has the client completed their visit to the health facility?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Complete",
          onPress: async () => {
            try {
              const result = await apiService.updateReferralStatus(referralId, "completed");
              if (result.success) {
                await loadReferrals();
                Alert.alert("Success", "Referral marked as completed");
              } else {
                Alert.alert("Error", result.error || "Failed to update referral");
              }
            } catch (error) {
              console.error("Mark complete error:", error);
              Alert.alert("Error", "Failed to update referral status");
            }
          },
        },
      ]
    );
  };

  const handleImpact = async () => {
    try {
      const stats = await apiService.getDashboardStats();
      Alert.alert(
        "Impact Dashboard",
        `People Screened: ${stats.data?.totalScreenings || 0}\n` +
        `Glasses Provided: ${stats.data?.totalSales || 0}\n` +
        `Repayments on Track: ${stats.data?.repaymentRate || 0}%\n` +
        `Referrals Made: ${stats.data?.totalReferrals || 0}\n` +
        `NCD Detected: ${stats.data?.ncdDetected || 0}`,
        [
          { text: "Close", style: "cancel" },
          { text: "Export", onPress: handleExportDialog }
        ]
      );
    } catch (error) {
      console.error('Impact error:', error);
      Alert.alert('Error', 'Failed to load impact data');
    }
  };

  const handleExportDialog = () => {
    Alert.alert(
      "Export Program Report",
      "Select reporting period for data export",
      [
        { text: "📅 Daily Report", onPress: () => handleExport('daily') },
        { text: "📊 Weekly Report", onPress: () => handleExport('weekly') },
        { text: "📈 Monthly Report", onPress: () => handleExport('monthly') },
        { text: "📉 Quarterly Report", onPress: () => handleExport('quarterly') },
        { text: "📑 Six Months Report", onPress: () => handleExport('sixmonths') },
        { text: "📋 Yearly Report", onPress: () => handleExport('yearly') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleExport = async (period: string) => {
    try {
      const stats = await apiService.getDashboardStats();
      const activeReferrals = referrals.filter((r) => r.status === "active" || r.status === "pending");
      const completedReferrals = referrals.filter((r) => r.status === "completed");
      const urgentCount = activeReferrals.filter((r) => r.urgency === "urgent" || r.urgency === "high").length;
      await exportCsvFile({
        fileBaseName: `referrals-${period}-report`,
        title: `${period.toUpperCase()} Referrals CSV`,
        headers: [
          "Period",
          "CHW",
          "District",
          "People Screened",
          "Glasses Provided",
          "Repayments On Track %",
          "Referrals Made",
          "NCD Detected",
          "Active Referrals",
          "High Priority Referrals",
          "Completed Referrals",
          "Client Name",
          "Phone",
          "Age",
          "Gender",
          "District (Client)",
          "Reason",
          "Urgency",
          "Facility",
          "Facility Location",
          "Status",
          "Referred Date",
        ],
        rows: referrals.map((r) => [
          period,
          userData?.fullName || "N/A",
          userData?.district || "N/A",
          stats.data?.totalScreenings || 0,
          stats.data?.totalSales || 0,
          stats.data?.repaymentRate || 0,
          stats.data?.totalReferrals || 0,
          stats.data?.ncdDetected || 0,
          activeReferrals.length,
          urgentCount,
          completedReferrals.length,
          r.client_name || "",
          r.client_phone || "",
          r.client_age || "",
          r.client_gender || "",
          r.client_district || "",
          r.reason || "",
          r.urgency || "",
          r.facility_name || "",
          r.facility_location || "",
          r.status || "",
          r.referred_date ? new Date(r.referred_date).toLocaleDateString() : "",
        ]),
      });
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleCreateReferral = () => {
    navigation.navigate("CreateReferralScreen");
  };

  const activeReferrals = referrals.filter((r) => r.status === "active" || r.status === "pending");
  const completedReferrals = referrals.filter((r) => r.status === "completed");
  const urgentCount = activeReferrals.filter((r) => r.urgency === "urgent" || r.urgency === "high").length;
  const displayedReferrals = activeTab === "active" ? activeReferrals : completedReferrals;

  const openReferralDetail = (referral: Referral) => {
    setSelectedReferral(referral);
    setEditFacilityName(referral.facility_name || "");
    setEditFacilityLocation(referral.facility_location || "");
    setEditNotes(referral.notes || "");
    setEditUrgency(referral.urgency || "normal");
    setDetailVisible(true);
  };

  const handleSaveReferral = async () => {
    if (!selectedReferral) return;
    try {
      const result = await apiService.updateReferral(selectedReferral.id, {
        facilityName: editFacilityName,
        facilityLocation: editFacilityLocation,
        notes: editNotes,
        urgency: editUrgency,
      });
      if (result.success) {
        await loadReferrals();
        setDetailVisible(false);
      } else {
        Alert.alert("Error", result.error || "Failed to update referral");
      }
    } catch (error) {
      console.error("Update referral error:", error);
      Alert.alert("Error", "Failed to update referral. Please try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading referrals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />

      <AppHeader 
        userName={userData?.fullName || userData?.full_name}
        userRole={userData?.role}
        district={userData?.district}
      />

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Referral Management</Text>
        <Text style={styles.pageSubtitle}>Advanced eye care & NCD screening</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={styles.statNumber}>{activeReferrals.length}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>High Priority</Text>
          <Text style={[styles.statNumber, styles.statOrange]}>{urgentCount}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={[styles.statNumber, styles.statGreen]}>{completedReferrals.length}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.impactBtn} onPress={handleImpact}>
          <Text style={styles.impactBtnText}>Impact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportDialog}>
          <Text style={styles.exportBtnText}>Export</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newBtn} onPress={handleCreateReferral}>
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "active" && styles.tabBtnActive]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={[styles.tabBtnText, activeTab === "active" && styles.tabBtnTextActive]}>
            Active Referrals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "completed" && styles.tabBtnActive]}
          onPress={() => setActiveTab("completed")}
        >
          <Text style={[styles.tabBtnText, activeTab === "completed" && styles.tabBtnTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Referrals List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {displayedReferrals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No referrals found</Text>
          </View>
        ) : (
          <>
            {displayedReferrals.map((referral) => (
              <TouchableOpacity
                key={referral.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => openReferralDetail(referral)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.clientName}>{referral.client_name}</Text>
                  {(referral.urgency === "urgent" || referral.urgency === "high") && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>{referral.urgency === "urgent" ? "Urgent" : "High"}</Text>
                    </View>
                  )}
                </View>

                {/* Client details row */}
                <Text style={styles.clientInfo}>
                  {[referral.client_age ? `Age ${referral.client_age}` : null, referral.client_gender, referral.client_district].filter(Boolean).join(" • ")}
                </Text>

                {referral.client_phone ? (
                  <Text style={styles.clientPhone}>{referral.client_phone}</Text>
                ) : null}

                {activeTab === "completed" ? (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Reason</Text>
                    </View>
                    <Text style={styles.infoValue}>{referral.reason}</Text>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Facility</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {referral.facility_name || "Not specified"}
                      {referral.facility_location ? ` — ${referral.facility_location}` : ""}
                    </Text>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Referred</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {new Date(referral.referred_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Completed</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {referral.completed_date
                        ? new Date(referral.completed_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </Text>

                    {referral.notes ? (
                      <>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Notes</Text>
                        </View>
                        <Text style={styles.infoValue}>{referral.notes}</Text>
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>Reason for referral</Text>
                    </View>
                    <Text style={styles.cardValue}>{referral.reason}</Text>

                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>Referred to</Text>
                    </View>
                    <Text style={styles.cardValue}>
                      {referral.facility_name || "Not specified"}
                      {referral.facility_location ? ` — ${referral.facility_location}` : ""}
                    </Text>

                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>Referred on</Text>
                    </View>
                    <Text style={styles.cardValue}>
                      {new Date(referral.referred_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>

                    {referral.notes ? (
                      <>
                        <View style={styles.cardRow}>
                          <Text style={styles.cardLabel}>Notes</Text>
                        </View>
                        <Text style={styles.cardValue}>{referral.notes}</Text>
                      </>
                    ) : null}

                    <TouchableOpacity
                      style={styles.markCompleteBtn}
                      onPress={() => handleMarkComplete(referral.id)}
                    >
                      <Text style={styles.markCompleteBtnText}>Mark Complete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </TouchableOpacity>
            ))}

            {activeTab === "completed" && (
              <View style={styles.historyFooter}>
                <Text style={styles.historyText}>Showing recent completed referrals</Text>
                <TouchableOpacity style={styles.viewAllBtn}>
                  <Text style={styles.viewAllText}>View All History</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Create Button */}
        <TouchableOpacity style={styles.createBtn} onPress={handleCreateReferral}>
          <Text style={styles.createBtnText}>+ Create New Referral</Text>
        </TouchableOpacity>

        {/* Partner Facilities */}
        <View style={styles.facilitiesBox}>
          <Text style={styles.facilitiesTitle}>Partner Facilities</Text>
          <Text style={styles.facilityItem}>• Luweero Hospital Eye Clinic</Text>
          <Text style={styles.facilityItem}>• Bombo Health Center IV</Text>
          <Text style={styles.facilityItem}>• Kiwoko Hospital</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Referral Detail & Edit Modal */}
      <Modal
        visible={detailVisible && !!selectedReferral}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModalContent}>
            {selectedReferral && (
              <>
                <View style={styles.detailModalHeader}>
                  <Text style={styles.detailModalTitle}>Referral Summary</Text>
                  <TouchableOpacity onPress={() => setDetailVisible(false)}>
                    <Ionicons name="close" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 480 }}>
                  <Text style={styles.detailSectionTitle}>Client</Text>
                  <Text style={styles.detailModalText}>
                    {selectedReferral.client_name}
                    {selectedReferral.client_age
                      ? ` • Age ${selectedReferral.client_age}`
                      : ""}
                    {selectedReferral.client_gender
                      ? ` • ${selectedReferral.client_gender}`
                      : ""}
                  </Text>
                  {selectedReferral.client_phone ? (
                    <Text style={styles.detailModalText}>
                      Phone: {selectedReferral.client_phone}
                    </Text>
                  ) : null}

                  <Text style={styles.detailSectionTitle}>Reason</Text>
                  <Text style={styles.detailModalText}>
                    {selectedReferral.reason}
                  </Text>

                  <Text style={styles.detailSectionTitle}>Facility</Text>
                  <TextInput
                    style={styles.detailInput}
                    placeholder="Facility name"
                    value={editFacilityName}
                    onChangeText={setEditFacilityName}
                  />
                  <TextInput
                    style={styles.detailInput}
                    placeholder="Facility location"
                    value={editFacilityLocation}
                    onChangeText={setEditFacilityLocation}
                  />

                  <Text style={styles.detailSectionTitle}>Urgency</Text>
                  <View style={styles.urgencyRow}>
                    {["low", "normal", "high", "urgent"].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.urgencyChip,
                          editUrgency === level && styles.urgencyChipActive,
                        ]}
                        onPress={() =>
                          setEditUrgency(level as Referral["urgency"])
                        }
                      >
                        <Text
                          style={[
                            styles.urgencyChipText,
                            editUrgency === level && styles.urgencyChipTextActive,
                          ]}
                        >
                          {level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.detailSectionTitle}>Notes</Text>
                  <TextInput
                    style={[styles.detailInput, { height: 80 }]}
                    multiline
                    placeholder="Add or edit notes..."
                    value={editNotes}
                    onChangeText={setEditNotes}
                  />

                  <Text style={styles.detailSectionTitle}>Dates</Text>
                  <Text style={styles.detailModalText}>
                    Referred:{" "}
                    {new Date(
                      selectedReferral.referred_date,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                  {selectedReferral.completed_date ? (
                    <Text style={styles.detailModalText}>
                      Completed:{" "}
                      {new Date(
                        selectedReferral.completed_date,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  ) : null}
                </ScrollView>

                <View style={styles.detailModalActions}>
                  <TouchableOpacity
                    style={styles.detailSecondaryButton}
                    onPress={() => setDetailVisible(false)}
                  >
                    <Text style={styles.detailSecondaryText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.detailPrimaryButton}
                    onPress={handleSaveReferral}
                  >
                    <Text style={styles.detailPrimaryText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("CHWDashboard")}
        >
          <Ionicons name="home-outline" size={24} color="#666666" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("VisionScreen1")}
        >
          <Ionicons name="eye-outline" size={24} color="#666666" />
          <Text style={styles.tabLabel}>Screen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("InventoryScreen")}
        >
          <Ionicons name="cube-outline" size={24} color="#666666" />
          <Text style={styles.tabLabel}>Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("PaymentsScreen")}
        >
          <Ionicons name="cash-outline" size={24} color="#666666" />
          <Text style={styles.tabLabel}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="share-social" size={24} color="#2E7D32" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Referrals</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  statOrange: {
    color: "#F97316",
  },
  statGreen: {
    color: "#2E7D32",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  impactBtn: {
    flex: 1,
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  impactBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  exportBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  exportBtnText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  newBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  newBtnText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: "#2E7D32",
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabBtnTextActive: {
    color: "#2E7D32",
  },
  content: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  clientPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 12,
  },
  clientInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  urgentBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  infoRow: {
    marginTop: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    marginTop: 2,
  },
  cardRow: {
    marginTop: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 14,
    color: "#111827",
    marginTop: 2,
  },
  markCompleteBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  markCompleteBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  historyFooter: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  historyText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  viewAllBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  createBtn: {
    backgroundColor: "#2E7D32",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  createBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  facilitiesBox: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  facilitiesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  facilityItem: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  tabLabelActive: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  // Detail modal styles
  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  detailModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  detailModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 12,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailModalText: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 2,
  },
  detailInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  urgencyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  urgencyChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  urgencyChipActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#16A34A",
  },
  urgencyChipText: {
    fontSize: 13,
    color: "#4B5563",
    textTransform: "capitalize",
  },
  urgencyChipTextActive: {
    color: "#166534",
    fontWeight: "600",
  },
  detailModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },
  detailSecondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  detailSecondaryText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
  },
  detailPrimaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2E7D32",
    alignItems: "center",
  },
  detailPrimaryText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
