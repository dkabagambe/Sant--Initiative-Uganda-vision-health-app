import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";

const counselingPoints = [
  {
    id: "healthy",
    title: "Eyes Appear Healthy",
    instruction: "Reassure the client that the eyes appear healthy",
  },
  {
    id: "future",
    title: "Seek Help if Problems Develop",
    instruction:
      "Tell the client to seek help if future eye problems develop",
  },
  {
    id: "practices",
    title: "Good Eye Health Practices",
    instruction: "Remind the client about good eye health practices",
  },
  {
    id: "dont-drops",
    title: "Do NOT Provide Eye Drops",
    instruction:
      "Do NOT provide eye drops - these require professional prescription",
  },
  {
    id: "dont-ointments",
    title: "Do NOT Provide Ointments",
    instruction:
      "Do NOT provide ointments - these require professional prescription",
  },
  {
    id: "dont-traditional",
    title: "Avoid Traditional Remedies",
    instruction:
      "Do NOT recommend traditional remedies such as breast milk, saliva, urine or herbs",
  },
];

export default function VHTNormalFindingsScreen() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const [counselingProvided, setCounselingProvided] = useState<Set<string>>(
    new Set()
  );

  const toggleCounseling = (id: string) => {
    const newSet = new Set(counselingProvided);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCounselingProvided(newSet);
  };

  const allCounselingProvided =
    counselingProvided.size === counselingPoints.length;

  const handleComplete = () => {
    if (allCounselingProvided) {
      updateScreeningData({
        needsReferral: false,
        needsGlasses: false,
      });
      navigation.navigate("ScreeningComplete", { glassesDispensed: false });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#10B981" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Normal Vision Findings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={40} color="#10B981" />
          <Text style={styles.successText}>
            Client Vision Assessment: NORMAL
          </Text>
          <Text style={styles.successSubtext}>
            No referral or glasses needed
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Counseling to Provide</Text>
          <Text style={styles.sectionSubtitle}>
            Confirm you have provided all counseling:
          </Text>

          {counselingPoints.map((point) => (
            <TouchableOpacity
              key={point.id}
              style={[
                styles.counselingCard,
                counselingProvided.has(point.id) &&
                  styles.counselingCardProvided,
              ]}
              onPress={() => toggleCounseling(point.id)}
            >
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.checkbox,
                    counselingProvided.has(point.id) &&
                      styles.checkboxProvided,
                  ]}
                >
                  {counselingProvided.has(point.id) && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pointTitle}>{point.title}</Text>
                  <Text style={styles.pointInstruction}>
                    {point.instruction}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Reminders</Text>

          <View style={styles.reminderBox}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.reminderText}>
              Never provide eye drops or ointments without professional guidance. These require proper diagnosis and prescription.
            </Text>
          </View>

          <View style={styles.reminderBox}>
            <Ionicons name="leaf" size={20} color="#10B981" />
            <Text style={styles.reminderText}>
              Emphasize the importance of good eye health practices: washing hands, maintaining hygiene, eating vitamin A-rich foods, and seeking early care if problems develop.
            </Text>
          </View>

          <View style={styles.reminderBox}>
            <Ionicons name="calendar" size={20} color="#0891B2" />
            <Text style={styles.reminderText}>
              Advise annual eye examinations, especially for people 40 years and above who may develop presbyopia.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Record Results</Text>
          <View style={styles.infoBox}>
            <Ionicons name="document-text" size={20} color="#7C3AED" />
            <Text style={styles.infoText}>
              Record the results in your register noting that the client had normal vision findings and counseling was provided.
            </Text>
          </View>
        </View>

        {allCounselingProvided && (
          <View style={styles.completionCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.completionText}>
              All counseling provided. Screening is complete.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 24 }]}>
        <TouchableOpacity
          style={[
            styles.button,
            !allCounselingProvided && styles.buttonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!allCounselingProvided}
          activeOpacity={allCounselingProvided ? 0.7 : 1}
        >
          <Text style={[styles.buttonText, !allCounselingProvided && styles.buttonTextDisabled]}>
            {allCounselingProvided
              ? "Complete Screening"
              : "Provide all counseling first"}
          </Text>
          {allCounselingProvided && (
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          )}
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
  successCard: {
    backgroundColor: "#DCFCE7",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: "center",
    gap: 12,
  },
  successText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065F46",
  },
  successSubtext: {
    fontSize: 14,
    color: "#107569",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  counselingCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#E5E7EB",
  },
  counselingCardProvided: {
    borderLeftColor: "#10B981",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxProvided: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  pointTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  pointInstruction: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  reminderBox: {
    backgroundColor: "#F9FAFB",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
  },
  reminderText: {
    fontSize: 13,
    color: "#4B5563",
    flex: 1,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    borderLeftWidth: 4,
    borderLeftColor: "#7C3AED",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    color: "#4B5563",
    flex: 1,
    lineHeight: 20,
  },
  completionCard: {
    backgroundColor: "#DCFCE7",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  completionText: {
    fontSize: 14,
    color: "#065F46",
    fontWeight: "500",
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  button: {
    backgroundColor: "#10B981",
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
