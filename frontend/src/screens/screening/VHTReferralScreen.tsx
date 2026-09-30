import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function VHTReferralScreen() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData, resetScreeningData } = useScreening();
  const [referralFacility, setReferralFacility] = useState("");
  const [otherFacilityName, setOtherFacilityName] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [facilitySelected, setFacilitySelected] = useState(false);
  const [saving, setSaving] = useState(false);

  const referralReason =
    screeningData.referralReason ||
    "Based on assessment, immediate referral to health facility is required";

  const commonFacilities = [
    "District Hospital",
    "Regional Referral Hospital",
    "Health Centre IV",
    "Health Centre III",
    "Eye Clinic/Specialist",
    "Other (specify below)",
  ];

  const handleFacilitySelect = (facility: string) => {
    setReferralFacility(facility);
    setFacilitySelected(true);
  };

  const isButtonDisabled =
    !facilitySelected ||
    !referralFacility ||
    (referralFacility === "Other (specify below)" && !otherFacilityName.trim()) ||
    saving;

  const handleCompleteReferral = async () => {
    if (!referralFacility) {
      Alert.alert("Required", "Please select or specify a health facility");
      return;
    }

    const finalFacility =
      referralFacility === "Other (specify below)"
        ? otherFacilityName.trim() || "Other"
        : referralFacility;

    const updatedData = {
      needsReferral: true,
      needsGlasses: false,
      referralReason: referralReason,
      referralFacility: finalFacility,
      referralStep: "VHT Key Questions (Step 4)",
      notes: additionalNotes || screeningData.notes || "",
    };

    updateScreeningData(updatedData);

    setSaving(true);
    try {
      // 1. Save the screening record
      const screeningPayload = {
        ...screeningData,
        ...updatedData,
      };

      let savedScreeningId: string | null = null;
      try {
        const res = await apiService.createScreening(screeningPayload);
        if (res?.success) {
          savedScreeningId = res.screeningId || res.data?.id || null;
        } else {
          throw new Error(res?.error || "Server returned failure");
        }
      } catch {
        // Offline fallback
        try {
          const q = await AsyncStorage.getItem("offlineScreenings");
          const queue = q ? JSON.parse(q) : [];
          const offlineId = Date.now().toString();
          queue.push({
            ...screeningPayload,
            offlineId,
            timestamp: new Date().toISOString(),
          });
          await AsyncStorage.setItem("offlineScreenings", JSON.stringify(queue));
          savedScreeningId = offlineId;
        } catch {}
      }

      // 2. Navigate to CreateReferralScreen with all pre-filled data
      const referralParams = {
        fromScreening: true,
        screeningId: savedScreeningId,
        clientName: screeningData.clientName || "",
        clientPhone: screeningData.clientPhone || "",
        clientAge: String(screeningData.clientAge || ""),
        clientSex: screeningData.clientGender || "",
        district: screeningData.district || "",
        county: screeningData.county || "",
        subCounty: screeningData.subCounty || "",
        parish: screeningData.parish || "",
        reason: referralReason,
        urgency: "normal",
        facilityName: finalFacility,
        notes: additionalNotes || "",
      };

      setSaving(false);
      resetScreeningData();
      navigation.navigate("CreateReferralScreen", referralParams);
    } catch (error) {
      setSaving(false);
      Alert.alert("Error", "Failed to save screening. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#DC2626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Referral</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.warningCard}>
          <Ionicons name="alert-circle" size={32} color="#DC2626" />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>REFERRAL REQUIRED</Text>
            <Text style={styles.warningText}>{referralReason}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VHT Actions</Text>
          <View style={styles.actionsList}>
            {[
              "Explain why referral is necessary",
              "Tell client where to go",
              "Encourage prompt attendance",
              "Record referral in register",
              "Follow up on attendance",
            ].map((action, i) => (
              <View key={i} style={styles.actionItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Health Facility</Text>
          <View style={styles.facilitiesList}>
            {commonFacilities.map((facility, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.facilityButton,
                  referralFacility === facility && styles.facilityButtonSelected,
                ]}
                onPress={() => handleFacilitySelect(facility)}
              >
                <Ionicons
                  name={referralFacility === facility ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={referralFacility === facility ? "#DC2626" : "#D1D5DB"}
                />
                <Text
                  style={[
                    styles.facilityButtonText,
                    referralFacility === facility && styles.facilityButtonTextSelected,
                  ]}
                >
                  {facility}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {referralFacility === "Other (specify below)" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specify Facility Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter health facility name"
              placeholderTextColor="#9CA3AF"
              value={otherFacilityName}
              onChangeText={setOtherFacilityName}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any additional information for the referral"
            placeholderTextColor="#9CA3AF"
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-up Reminder</Text>
          <View style={styles.reminderBox}>
            <Ionicons name="calendar" size={20} color="#7C3AED" />
            <Text style={styles.reminderText}>
              Visit this client during your next household visits to check if they
              attended the health facility
            </Text>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: 24 }]}>
        <TouchableOpacity
          style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleCompleteReferral}
          disabled={isButtonDisabled}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>Save & Complete Referral</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  warningCard: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: "row",
    gap: 12,
  },
  warningTitle: { fontSize: 16, fontWeight: "700", color: "#7F1D1D", marginBottom: 4 },
  warningText: { fontSize: 14, color: "#9F1239", lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 12 },
  actionsList: { gap: 10 },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  actionText: { fontSize: 14, color: "#4B5563", flex: 1, lineHeight: 20 },
  facilitiesList: { gap: 10 },
  facilityButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  facilityButtonSelected: { borderColor: "#DC2626", backgroundColor: "#FEF2F2" },
  facilityButtonText: { fontSize: 15, color: "#6B7280", fontWeight: "500" },
  facilityButtonTextSelected: { color: "#DC2626", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
    minHeight: 96,
  },
  reminderBox: {
    backgroundColor: "#F3E8FF",
    borderLeftWidth: 4,
    borderLeftColor: "#7C3AED",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
  },
  reminderText: { fontSize: 13, color: "#5B21B6", flex: 1, lineHeight: 20 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  button: {
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonDisabled: { backgroundColor: "#D1D5DB" },
  buttonText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
});
