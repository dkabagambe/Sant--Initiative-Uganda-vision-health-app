import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { apiService } from "../../services/api";

type FollowUpType = "referral" | "glasses";

interface PendingReferral {
  id: string;
  client_name: string;
  client_phone: string;
  client_age: number;
  client_district: string;
  reason: string;
  facility_name: string;
  facility_location: string;
  referred_date: string;
  screening_id: string;
  follow_up_type: "referral";
}

interface PendingGlasses {
  screening_id: string;
  client_name: string;
  client_phone: string;
  client_age: number;
  client_district: string;
  glasses_power: string;
  screening_date: string;
  follow_up_type: "glasses";
}

export default function VHTCommunityFollowUpScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<FollowUpType>("referral");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referrals, setReferrals] = useState<PendingReferral[]>([]);
  const [glassesClients, setGlassesClients] = useState<PendingGlasses[]>([]);
  const [selectedClient, setSelectedClient] = useState<
    PendingReferral | PendingGlasses | null
  >(null);

  // Referral follow-up form
  const [attendedFacility, setAttendedFacility] = useState<boolean | null>(null);
  const [treatmentReceived, setTreatmentReceived] = useState("");
  const [barriers, setBarriers] = useState("");
  const [referralNotes, setReferralNotes] = useState("");

  // Glasses follow-up form
  const [glassesInUse, setGlassesInUse] = useState<boolean | null>(null);
  const [glassesHelp, setGlassesHelp] = useState<boolean | null>(null);
  const [hasHeadaches, setHasHeadaches] = useState<boolean | null>(null);
  const [glassesCondition, setGlassesCondition] = useState<string>("");
  const [educationReinforced, setEducationReinforced] = useState(false);
  const [needsReferral, setNeedsReferral] = useState(false);
  const [glassesNotes, setGlassesNotes] = useState("");

  const loadPending = async () => {
    try {
      const response = await apiService.getPendingFollowUps();
      if (response.success) {
        setReferrals(response.data.referrals || []);
        setGlassesClients(response.data.glasses || []);
      }
    } catch (error) {
      console.error("Failed to load follow-ups:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPending();
    }, [])
  );

  const resetForm = () => {
    setSelectedClient(null);
    setAttendedFacility(null);
    setTreatmentReceived("");
    setBarriers("");
    setReferralNotes("");
    setGlassesInUse(null);
    setGlassesHelp(null);
    setHasHeadaches(null);
    setGlassesCondition("");
    setEducationReinforced(false);
    setNeedsReferral(false);
    setGlassesNotes("");
  };

  const canSubmitReferral =
    attendedFacility !== null &&
    (attendedFacility ? treatmentReceived.trim().length > 0 : barriers.trim().length > 0);

  const canSubmitGlasses =
    glassesInUse !== null &&
    glassesHelp !== null &&
    hasHeadaches !== null &&
    glassesCondition !== "" &&
    educationReinforced;

  const handleSubmitReferralFollowUp = async () => {
    if (!selectedClient || !canSubmitReferral) return;
    const client = selectedClient as PendingReferral;
    setSubmitting(true);
    try {
      const result = await apiService.createFollowUp({
        follow_up_type: "referral",
        referral_id: client.id,
        screening_id: client.screening_id,
        client_name: client.client_name,
        client_phone: client.client_phone,
        client_age: client.client_age,
        client_district: client.client_district,
        attended_facility: attendedFacility,
        treatment_received: attendedFacility ? treatmentReceived : null,
        barriers: !attendedFacility ? barriers : null,
        education_reinforced: true,
        notes: referralNotes,
      });

      if (result.success) {
        Alert.alert(
          "Follow-up Recorded",
          attendedFacility
            ? "Client attendance at health facility recorded."
            : "Barriers identified. Client encouraged to attend facility.",
          [{ text: "OK", onPress: () => { resetForm(); loadPending(); } }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to record follow-up. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitGlassesFollowUp = async () => {
    if (!selectedClient || !canSubmitGlasses) return;
    const client = selectedClient as PendingGlasses;
    setSubmitting(true);
    try {
      const result = await apiService.createFollowUp({
        follow_up_type: "glasses",
        screening_id: client.screening_id,
        client_name: client.client_name,
        client_phone: client.client_phone,
        client_age: client.client_age,
        client_district: client.client_district,
        glasses_in_use: glassesInUse,
        glasses_help: glassesHelp,
        has_headaches: hasHeadaches,
        glasses_condition: glassesCondition,
        education_reinforced: educationReinforced,
        needs_referral: needsReferral || hasHeadaches === true || glassesCondition === "broken" || glassesCondition === "lost",
        notes: glassesNotes,
      });

      if (result.success) {
        const msg = needsReferral || hasHeadaches || glassesCondition === "broken" || glassesCondition === "lost"
          ? "Follow-up recorded. Consider referral if problems persist."
          : "Glasses follow-up recorded successfully.";
        Alert.alert("Follow-up Recorded", msg, [
          { text: "OK", onPress: () => { resetForm(); loadPending(); } },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to record follow-up. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderBoolToggle = (
    value: boolean | null,
    onChange: (v: boolean) => void,
    yesLabel: string,
    noLabel: string
  ) => (
    <View style={styles.toggleRow}>
      <TouchableOpacity
        style={[styles.toggleBtn, value === true && styles.toggleBtnYes]}
        onPress={() => onChange(true)}
      >
        <Text style={[styles.toggleText, value === true && styles.toggleTextActive]}>
          {yesLabel}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleBtn, value === false && styles.toggleBtnNo]}
        onPress={() => onChange(false)}
      >
        <Text style={[styles.toggleText, value === false && styles.toggleTextActive]}>
          {noLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderReferralForm = () => (
    <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.clientCard}>
        <Text style={styles.clientName}>{(selectedClient as PendingReferral).client_name}</Text>
        <Text style={styles.clientDetail}>
          Referred to: {(selectedClient as PendingReferral).facility_name}
        </Text>
        <Text style={styles.clientDetail}>
          Reason: {(selectedClient as PendingReferral).reason}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Did client attend the health facility?</Text>
        {renderBoolToggle(attendedFacility, setAttendedFacility, "Yes, attended", "No, did not attend")}
      </View>

      {attendedFacility === true && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Treatment or advice received</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Record treatment or advice received at facility..."
            value={treatmentReceived}
            onChangeText={setTreatmentReceived}
          />
        </View>
      )}

      {attendedFacility === false && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Barriers to attendance</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Identify barriers and note encouragement given..."
            value={barriers}
            onChangeText={setBarriers}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional notes</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Any other observations..."
          value={referralNotes}
          onChangeText={setReferralNotes}
        />
      </View>

      <View style={styles.reminderBox}>
        <Ionicons name="information-circle" size={20} color="#0891B2" />
        <Text style={styles.reminderText}>
          Visit referred clients during subsequent household visits. Encourage prompt attendance at the health facility.
        </Text>
      </View>
    </ScrollView>
  );

  const renderGlassesForm = () => (
    <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.clientCard}>
        <Text style={styles.clientName}>{(selectedClient as PendingGlasses).client_name}</Text>
        <Text style={styles.clientDetail}>
          Glasses power: {(selectedClient as PendingGlasses).glasses_power || "N/A"}
        </Text>
        <Text style={styles.clientDetail}>
          Dispensed: {(selectedClient as PendingGlasses).screening_date}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Are glasses being used?</Text>
        {renderBoolToggle(glassesInUse, setGlassesInUse, "Yes", "No")}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Do glasses help with reading and near work?</Text>
        {renderBoolToggle(glassesHelp, setGlassesHelp, "Yes", "No")}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Any headaches, discomfort or poor vision?</Text>
        {renderBoolToggle(hasHeadaches, setHasHeadaches, "Yes", "No")}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Glasses condition</Text>
        <View style={styles.conditionGrid}>
          {["good", "scratched", "broken", "lost"].map((cond) => (
            <TouchableOpacity
              key={cond}
              style={[
                styles.conditionBtn,
                glassesCondition === cond && styles.conditionBtnSelected,
              ]}
              onPress={() => setGlassesCondition(cond)}
            >
              <Text
                style={[
                  styles.conditionText,
                  glassesCondition === cond && styles.conditionTextSelected,
                ]}
              >
                {cond.charAt(0).toUpperCase() + cond.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkRow, educationReinforced && styles.checkRowActive]}
        onPress={() => setEducationReinforced(!educationReinforced)}
      >
        <View style={[styles.checkbox, educationReinforced && styles.checkboxChecked]}>
          {educationReinforced && <Ionicons name="checkmark" size={14} color="#FFF" />}
        </View>
        <Text style={styles.checkLabel}>
          Reinforced eye health education messages
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.checkRow, needsReferral && styles.checkRowActive]}
        onPress={() => setNeedsReferral(!needsReferral)}
      >
        <View style={[styles.checkbox, needsReferral && styles.checkboxChecked]}>
          {needsReferral && <Ionicons name="checkmark" size={14} color="#FFF" />}
        </View>
        <Text style={styles.checkLabel}>
          Refer if problems persist
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional notes</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Any other observations..."
          value={glassesNotes}
          onChangeText={setGlassesNotes}
        />
      </View>
    </ScrollView>
  );

  const renderClientList = () => {
    const items = activeTab === "referral" ? referrals : glassesClients;

    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
          <Text style={styles.emptyTitle}>No clients pending follow-up</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === "referral"
              ? "All referred clients have been followed up."
              : "No glasses clients need follow-up at this time."}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPending(); }} />
        }
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={activeTab === "referral" ? (item as PendingReferral).id : (item as PendingGlasses).screening_id}
            style={styles.listItem}
            onPress={() => setSelectedClient(item)}
          >
            <View style={styles.listItemLeft}>
              <View style={[styles.typeBadge, activeTab === "referral" ? styles.referralBadge : styles.glassesBadge]}>
                <Ionicons
                  name={activeTab === "referral" ? "medical" : "glasses-outline"}
                  size={16}
                  color="#FFF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listItemName}>{item.client_name}</Text>
                <Text style={styles.listItemSub}>
                  {activeTab === "referral"
                    ? `Referred: ${(item as PendingReferral).facility_name}`
                    : `Power: ${(item as PendingGlasses).glasses_power || "N/A"}`}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => selectedClient ? resetForm() : navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#10B981" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Follow-up</Text>
        <View style={{ width: 28 }} />
      </View>

      {!selectedClient && (
        <>
          <View style={styles.introCard}>
            <Ionicons name="people" size={24} color="#0891B2" />
            <Text style={styles.introText}>
              Visit referred clients and glasses recipients during subsequent household visits.
            </Text>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "referral" && styles.tabActive]}
              onPress={() => setActiveTab("referral")}
            >
              <Text style={[styles.tabText, activeTab === "referral" && styles.tabTextActive]}>
                Referrals ({referrals.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "glasses" && styles.tabActive]}
              onPress={() => setActiveTab("glasses")}
            >
              <Text style={[styles.tabText, activeTab === "glasses" && styles.tabTextActive]}>
                Glasses ({glassesClients.length})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>{renderClientList()}</View>
        </>
      )}

      {selectedClient && (
        <>
          {activeTab === "referral" ? renderReferralForm() : renderGlassesForm()}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (activeTab === "referral" ? !canSubmitReferral : !canSubmitGlasses) && styles.submitBtnDisabled,
              ]}
              onPress={activeTab === "referral" ? handleSubmitReferralFollowUp : handleSubmitGlassesFollowUp}
              disabled={submitting || (activeTab === "referral" ? !canSubmitReferral : !canSubmitGlasses)}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>Record Follow-up</Text>
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ECFEFF",
    margin: 16,
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#0891B2",
  },
  introText: { flex: 1, fontSize: 13, color: "#0E7490", lineHeight: 20 },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 6 },
  tabActive: { backgroundColor: "#FFF", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  tabText: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  tabTextActive: { color: "#10B981", fontWeight: "600" },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  listItemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  typeBadge: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  referralBadge: { backgroundColor: "#DC2626" },
  glassesBadge: { backgroundColor: "#9333EA" },
  listItemName: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  listItemSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 8 },
  formScroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  clientCard: {
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  clientName: { fontSize: 18, fontWeight: "700", color: "#065F46" },
  clientDetail: { fontSize: 13, color: "#107569", marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937", marginBottom: 10 },
  toggleRow: { flexDirection: "row", gap: 10 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  toggleBtnYes: { backgroundColor: "#DCFCE7", borderColor: "#10B981" },
  toggleBtnNo: { backgroundColor: "#FEE2E2", borderColor: "#DC2626" },
  toggleText: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  toggleTextActive: { color: "#1F2937", fontWeight: "600" },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "#F9FAFB",
  },
  conditionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  conditionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  conditionBtnSelected: { backgroundColor: "#EDE9FE", borderColor: "#9333EA" },
  conditionText: { fontSize: 13, fontWeight: "500", color: "#6B7280" },
  conditionTextSelected: { color: "#7C3AED", fontWeight: "600" },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 10,
  },
  checkRowActive: { backgroundColor: "#F0FDF4" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#10B981", borderColor: "#10B981" },
  checkLabel: { fontSize: 14, color: "#374151", flex: 1 },
  reminderBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  reminderText: { flex: 1, fontSize: 13, color: "#0369A1", lineHeight: 20 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: 24,
  },
  submitBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  submitBtnDisabled: { backgroundColor: "#D1D5DB" },
  submitText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
});
