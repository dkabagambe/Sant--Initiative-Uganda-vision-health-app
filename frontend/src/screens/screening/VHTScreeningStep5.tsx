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

const preparationSteps = [
  {
    id: "chair",
    title: "Place Chair",
    instruction: "Place chair in a location with good light",
    icon: "home",
  },
  {
    id: "measure",
    title: "Measure Distance",
    instruction: "Measure exactly 3 metres using rope",
    icon: "measure",
  },
  {
    id: "chart",
    title: "Position E-Chart",
    instruction: "Place E-chart at 3 metres distance",
    icon: "image",
  },
  {
    id: "hands",
    title: "Wash Hands",
    instruction: "Wash or disinfect hands",
    icon: "water",
  },
  {
    id: "torch",
    title: "Prepare Torch",
    instruction: "Prepare torch and screening materials",
    icon: "flashlight",
  },
];

export default function VHTScreeningStep5() {
  const navigation = useNavigation<any>();
  const { updateScreeningData } = useScreening();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (id: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedSteps(newCompleted);
  };

  const allStepsCompleted = completedSteps.size === preparationSteps.length;

  const handleContinue = () => {
    if (allStepsCompleted) {
      updateScreeningData({ screeningAreaPrepared: true });
      navigation.navigate("VHTScreeningStep6");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#0891B2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 5: Prepare Screening Area</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionCard}>
          <Ionicons name="settings" size={24} color="#0891B2" />
          <Text style={styles.instructionText}>
            Prepare the screening environment before starting vision tests
          </Text>
        </View>

        <View style={styles.importantBox}>
          <Ionicons name="alert-circle" size={20} color="#D97706" />
          <View style={{ flex: 1 }}>
            <Text style={styles.importantTitle}>Critical: 3-Metre Distance</Text>
            <Text style={styles.importantText}>
              The E-chart MUST be exactly 3 metres away from the client for accurate distance vision testing
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Setup Checklist</Text>
          <Text style={styles.sectionSubtitle}>Complete each preparation step:</Text>

          {preparationSteps.map((step) => (
            <TouchableOpacity
              key={step.id}
              style={styles.stepCard}
              onPress={() => toggleStep(step.id)}
            >
              <View style={styles.stepLeft}>
                <View
                  style={[
                    styles.checkbox,
                    completedSteps.has(step.id) && styles.checkboxChecked,
                  ]}
                >
                  {completedSteps.has(step.id) && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepInstruction}>{step.instruction}</Text>
                </View>
              </View>
              <Ionicons
                name={step.icon as any}
                size={24}
                color={completedSteps.has(step.id) ? "#0891B2" : "#D1D5DB"}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lighting Requirements</Text>
          <View style={styles.infoBox}>
            <Ionicons name="sunny" size={20} color="#FBBF24" />
            <Text style={styles.infoText}>
              Good lighting is essential for accurate vision screening. Avoid shadowy or dimly lit areas.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Check</Text>
          <View style={styles.infoBox}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>
              Confirm torch batteries are working and all screening materials are clean and ready to use
            </Text>
          </View>
        </View>

        {allStepsCompleted && (
          <View style={styles.readyCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.readyText}>
              Screening area is ready! You may now proceed to explain and demonstrate the tests to the client.
            </Text>
          </View>
        )}

        {allStepsCompleted && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward-circle" size={22} color="#FFF" />
            <Text style={styles.continueButtonText}>Continue to Explain Tests</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 24 }]}>
        <TouchableOpacity
          style={[styles.button, !allStepsCompleted && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!allStepsCompleted}
          activeOpacity={allStepsCompleted ? 0.7 : 1}
        >
          <Text style={[styles.buttonText, !allStepsCompleted && styles.buttonTextDisabled]}>
            {allStepsCompleted
              ? "Area Ready - Proceed to Explain Tests"
              : `${completedSteps.size}/${preparationSteps.length} steps completed`}
          </Text>
          {allStepsCompleted && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
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
    backgroundColor: "#F0F9FF",
    borderLeftWidth: 4,
    borderLeftColor: "#0891B2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: "#0C4A6E",
    flex: 1,
    lineHeight: 20,
  },
  importantBox: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#D97706",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  importantTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  importantText: {
    fontSize: 13,
    color: "#B45309",
    lineHeight: 18,
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
  stepCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: "#E5E7EB",
  },
  stepLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
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
    backgroundColor: "#0891B2",
    borderColor: "#0891B2",
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  stepInstruction: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    borderLeftWidth: 4,
    borderLeftColor: "#0891B2",
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
  readyCard: {
    backgroundColor: "#DCFCE7",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  readyText: {
    fontSize: 14,
    color: "#065F46",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
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
