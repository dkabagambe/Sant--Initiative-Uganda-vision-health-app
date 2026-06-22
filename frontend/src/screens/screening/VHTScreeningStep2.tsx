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

const greetingActions = [
  {
    id: "greet",
    title: "Greet Household Members",
    instruction: "Greet household members respectfully",
  },
  {
    id: "introduce",
    title: "Introduce Yourself",
    instruction: "Introduce yourself as a VHT by full names",
  },
  {
    id: "explain",
    title: "Explain the Service",
    instruction:
      "Explain that you are providing eye health services as part of integrated community health services",
  },
  {
    id: "request",
    title: "Request Permission",
    instruction:
      "Request permission to conduct eye health education and screening",
  },
];

export default function VHTScreeningStep2() {
  const navigation = useNavigation<any>();
  const { updateScreeningData } = useScreening();
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  const toggleAction = (id: string) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedActions(newCompleted);
  };

  const allActionsCompleted = completedActions.size === greetingActions.length;
  const canProceed = allActionsCompleted && consentGiven === true;

  const handleContinue = () => {
    if (canProceed) {
      updateScreeningData({ consentObtained: true });
      navigation.navigate("VHTScreeningStep3");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1E40AF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 2: Greet & Introduce</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionCard}>
          <Ionicons name="information-circle" size={24} color="#10B981" />
          <Text style={styles.instructionText}>
            Build trust and obtain consent before starting the screening
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VHT Actions</Text>
          <Text style={styles.sectionSubtitle}>Complete each action:</Text>

          {greetingActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => toggleAction(action.id)}
            >
              <View style={styles.actionLeft}>
                <View
                  style={[
                    styles.checkbox,
                    completedActions.has(action.id) && styles.checkboxChecked,
                  ]}
                >
                  {completedActions.has(action.id) && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionInstruction}>{action.instruction}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consent</Text>
          <View style={styles.importantBox}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.importantText}>
              Only proceed if household has given permission to conduct screening
            </Text>
          </View>

          <View style={styles.consentButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.consentButton,
                consentGiven === false && styles.consentButtonActive,
              ]}
              onPress={() => setConsentGiven(false)}
            >
              <Ionicons
                name={consentGiven === false ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={consentGiven === false ? "#DC2626" : "#D1D5DB"}
              />
              <Text
                style={[
                  styles.consentButtonText,
                  consentGiven === false && styles.consentButtonTextActive,
                ]}
              >
                Consent NOT Given
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.consentButton,
                consentGiven === true && styles.consentButtonActive,
              ]}
              onPress={() => setConsentGiven(true)}
            >
              <Ionicons
                name={consentGiven === true ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={consentGiven === true ? "#10B981" : "#D1D5DB"}
              />
              <Text
                style={[
                  styles.consentButtonText,
                  consentGiven === true && styles.consentButtonTextActive,
                ]}
              >
                Consent Given ✓
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {consentGiven === true && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Screen One Person at a Time</Text>
            <View style={styles.infoBox}>
              <Ionicons name="people" size={20} color="#0891B2" />
              <Text style={styles.infoText}>
                Screen one household member at a time and open a new register entry for each client
              </Text>
            </View>
          </View>
        )}

        {consentGiven === false && (
          <View style={styles.section}>
            <View style={styles.declinedBox}>
              <Ionicons name="close-circle" size={24} color="#DC2626" />
              <Text style={styles.declinedText}>
                Without consent, you cannot proceed with screening. Thank the household and move to the next house.
              </Text>
            </View>
          </View>
        )}

        {canProceed && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward-circle" size={22} color="#FFF" />
            <Text style={styles.continueButtonText}>Continue to Eye Health Education</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 24 }]}>
        <TouchableOpacity
          style={[styles.button, !canProceed && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!canProceed}
          activeOpacity={canProceed ? 0.7 : 1}
        >
          <Text style={[styles.buttonText, !canProceed && styles.buttonTextDisabled]}>
            {canProceed ? "Proceed to Education" : "Complete actions and get consent"}
          </Text>
          {canProceed && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
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
  instructionCard: {
    backgroundColor: "#DCFCE7",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: "#065F46",
    flex: 1,
    lineHeight: 20,
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
  actionCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  actionLeft: {
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
  checkboxChecked: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  actionInstruction: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  importantBox: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    gap: 12,
  },
  importantText: {
    fontSize: 14,
    color: "#7F1D1D",
    flex: 1,
    lineHeight: 20,
  },
  consentButtonsContainer: {
    gap: 10,
  },
  consentButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  consentButtonActive: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  consentButtonText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },
  consentButtonTextActive: {
    color: "#1F2937",
  },
  infoBox: {
    backgroundColor: "#F0F9FF",
    borderLeftWidth: 4,
    borderLeftColor: "#0891B2",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#0C4A6E",
    flex: 1,
    lineHeight: 20,
  },
  declinedBox: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
  },
  declinedText: {
    fontSize: 14,
    color: "#7F1D1D",
    flex: 1,
    lineHeight: 20,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  button: {
    backgroundColor: "#16A34A",
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
  continueButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
