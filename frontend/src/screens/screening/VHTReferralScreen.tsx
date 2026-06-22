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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";

export default function VHTReferralScreen() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const [referralFacility, setReferralFacility] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [facilitySelected, setFacilitySelected] = useState(false);

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

  const handleCompleteReferral = () => {
    if (!referralFacility) {
      Alert.alert("Required", "Please select or specify a health facility");
      return;
    }

    updateScreeningData({
      needsReferral: true,
      referralReason: referralReason,
      referralFacility: referralFacility === "Other (specify below)" ? additionalNotes : referralFacility,
      referralStep: "pending",
      notes: additionalNotes,
    });

    Alert.alert(
      "Referral Completed",
      `Client has been referred to: ${referralFacility}\n\nVHT Actions:\n• Explain why referral is necessary\n• Encourage prompt attendance\n• Record in register\n• Follow up on attendance during next visits`,
      [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("ScreeningComplete");
          },
        },
      ]
    );
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

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
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
            <View style={styles.actionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.actionText}>
                Explain why referral is necessary
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.actionText}>
                Tell client where to go
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.actionText}>
                Encourage prompt attendance
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.actionText}>
                Record referral in register
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.actionText}>
                Follow up on attendance
              </Text>
            </View>
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
                  name={
                    referralFacility === facility
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    referralFacility === facility ? "#DC2626" : "#D1D5DB"
                  }
                />
                <Text
                  style={[
                    styles.facilityButtonText,
                    referralFacility === facility &&
                      styles.facilityButtonTextSelected,
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
            <Text style={styles.sectionTitle}>Specify Facility</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter health facility name"
              placeholderTextColor="#9CA3AF"
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              multiline
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any additional information for the referral (e.g., urgent, specific symptoms, etc.)"
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
              Visit this client during your next household visits to check if they attended the health facility
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 24 }]}>
        <TouchableOpacity
          style={[
            styles.button,
            (!facilitySelected || !referralFacility) &&
              styles.buttonDisabled,
          ]}
          onPress={handleCompleteReferral}
          disabled={!facilitySelected || !referralFacility}
          activeOpacity={facilitySelected && referralFacility ? 0.7 : 1}
        >
          <Text style={[styles.buttonText, (!facilitySelected || !referralFacility) && styles.buttonTextDisabled]}>
            Complete Referral
          </Text>
          {facilitySelected && referralFacility && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
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
  warningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7F1D1D",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#9F1239",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  actionsList: {
    gap: 10,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
    lineHeight: 20,
  },
  facilitiesList: {
    gap: 10,
  },
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
  facilityButtonSelected: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  facilityButtonText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  facilityButtonTextSelected: {
    color: "#DC2626",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
    textAlignVertical: "top",
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
  reminderText: {
    fontSize: 13,
    color: "#5B21B6",
    flex: 1,
    lineHeight: 20,
  },
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
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonTextDisabled: {
    color: "#9CA3AF",
  },
});
