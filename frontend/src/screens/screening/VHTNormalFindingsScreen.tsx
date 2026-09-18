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

// Step 8 disinfection checklist (MOH manual Section 5, Step 8)
const step8Points = [
  { id: "disinfect-echart",   title: "Disinfect E-chart",           instruction: "Wipe down the E-chart that the client touched" },
  { id: "disinfect-glasses",  title: "Disinfect Sample Glasses",    instruction: "Disinfect any sample reading glasses the client tried on (if used)" },
  { id: "disinfect-mirror",   title: "Disinfect Mirror",            instruction: "Disinfect the mirror the client used (if used)" },
  { id: "wash-hands",         title: "Wash Your Hands",             instruction: "Wash hands with clean water and soap (or disinfectant if no water)" },
  { id: "new-register-line",  title: "Start New Register Line",     instruction: "Begin a new line in the VHT Community Eye Health Register for the next client" },
];

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
    id: "register",
    title: "Record Results in Register",
    instruction: "Record Y in register: Key Questions Pass, Torch Test Pass, Distance Vision Pass, Near Vision Pass",
  },
  {
    id: "dont-drops",
    title: "Do NOT Provide Eye Drops",
    instruction: "Do NOT provide eye drops",
  },
  {
    id: "dont-ointments",
    title: "Do NOT Provide Ointments",
    instruction: "Do NOT provide ointments",
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
  const [counselingProvided, setCounselingProvided] = useState<Set<string>>(new Set());
  const [step8Done, setStep8Done] = useState<Set<string>>(new Set());

  const toggleCounseling = (id: string) => {
    const newSet = new Set(counselingProvided);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCounselingProvided(newSet);
  };

  const toggleStep8 = (id: string) => {
    const newSet = new Set(step8Done);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setStep8Done(newSet);
  };

  const allCounselingProvided = counselingProvided.size === counselingPoints.length;
  const allStep8Done = step8Done.size === step8Points.length;
  const canComplete = allCounselingProvided && allStep8Done;

  const handleComplete = () => {
    if (canComplete) {
      const finalNotes =
        (screeningData.notes || "") +
        "\nAll tests passed - normal findings. Counseling provided. Supplies disinfected. Register updated.";
      // Update context AND pass notes as param - context flush is async so
      // ScreeningComplete might read stale notes if we rely on context alone.
      updateScreeningData({
        needsReferral: false,
        needsGlasses: false,
        notes: finalNotes,
      });
      navigation.navigate("ScreeningComplete", {
        glassesDispensed: false,
        notes: finalNotes,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#10B981" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete: Normal Findings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={40} color="#10B981" />
          <Text style={styles.successText}>
            Client Vision Assessment: NORMAL
          </Text>
          <Text style={styles.successSubtext}>
            All tests passed - no referral or glasses needed
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 7: Counsel Client on Normal Findings</Text>
          <Text style={styles.sectionSubtitle}>
            After both near and far distance vision tests, confirm each action:
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
              Record Y in register for: Key Questions, Torch Test, Distance Vision, Near Vision. Record N under Referred and Dispensed Glasses.
            </Text>
          </View>
        </View>

        {/* ── STEP 8: PREPARE FOR NEXT CLIENT ─────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 8: Prepare for Next Client</Text>
          <Text style={styles.sectionSubtitle}>
            Before welcoming the next household member, complete these actions:
          </Text>

          {step8Points.map((pt) => {
            const done = step8Done.has(pt.id);
            return (
              <TouchableOpacity
                key={pt.id}
                style={[styles.counselingCard, done && styles.counselingCardProvided]}
                onPress={() => toggleStep8(pt.id)}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.checkbox, done && styles.checkboxProvided]}>
                    {done && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pointTitle}>{pt.title}</Text>
                    <Text style={styles.pointInstruction}>{pt.instruction}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {canComplete && (
          <View style={styles.completionCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.completionText}>
              All done! Screening complete and area prepared for next client.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 24 }]}>
        <TouchableOpacity
          style={[styles.button, !canComplete && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={!canComplete}
          activeOpacity={canComplete ? 0.7 : 1}
        >
          <Text style={[styles.buttonText, !canComplete && styles.buttonTextDisabled]}>
            {canComplete ? "Complete Screening" : "Complete all steps above first"}
          </Text>
          {canComplete && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
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
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1F2937", flex: 1, textAlign: "center" },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
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
