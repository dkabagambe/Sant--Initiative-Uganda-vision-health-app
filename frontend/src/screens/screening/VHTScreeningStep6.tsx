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

const explanationSteps = [
  {
    id: "general",
    title: "General Explanation",
    content: "Explain that you will examine the eyes and vision",
    icon: "eye",
  },
  {
    id: "distance-test",
    title: "Distance Vision Test",
    content:
      "Demonstrate how the client will cover one eye during distance testing and indicate the direction of the E on the chart",
    icon: "eye",
  },
  {
    id: "near-test",
    title: "Near Vision Test",
    content: "Demonstrate near vision testing using both eyes (reading small text)",
    icon: "document-text",
  },
  {
    id: "torch-test",
    title: "Torch/Light Test",
    content:
      "Explain that you will shine a light in their eyes to check how the pupils respond",
    icon: "flashlight",
  },
  {
    id: "pinhole",
    title: "Pinhole Test",
    content:
      "Explain that you may use a pinhole to test vision clarity if needed",
    icon: "aperture",
  },
];

export default function VHTScreeningStep6() {
  const navigation = useNavigation<any>();
  const { updateScreeningData } = useScreening();
  const [demonstratedSteps, setDemonstratedSteps] = useState<Set<string>>(
    new Set()
  );
  const [clientUnderstands, setClientUnderstands] = useState<boolean | null>(null);

  const toggleDemonstrated = (id: string) => {
    const newDemonstrated = new Set(demonstratedSteps);
    if (newDemonstrated.has(id)) {
      newDemonstrated.delete(id);
    } else {
      newDemonstrated.add(id);
    }
    setDemonstratedSteps(newDemonstrated);
  };

  const allDemonstrated = demonstratedSteps.size === explanationSteps.length;
  const canProceed = allDemonstrated && clientUnderstands === true;

  const handleContinue = () => {
    if (canProceed) {
      updateScreeningData({ testsExplainedToClient: true });
      navigation.navigate("VisionScreen3");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 6: Explain & Demonstrate</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionCard}>
          <Ionicons name="megaphone" size={24} color="#8B5CF6" />
          <Text style={styles.instructionText}>
            Explain and demonstrate each test so the client knows exactly what to expect
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tests to Explain</Text>
          <Text style={styles.sectionSubtitle}>Demonstrate each test:</Text>

          {explanationSteps.map((step) => (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.explanationCard,
                demonstratedSteps.has(step.id) &&
                  styles.explanationCardDemonstrated,
              ]}
              onPress={() => toggleDemonstrated(step.id)}
            >
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.checkbox,
                    demonstratedSteps.has(step.id) &&
                      styles.checkboxDemonstrated,
                  ]}
                >
                  {demonstratedSteps.has(step.id) && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepContent}>{step.content}</Text>
                </View>
              </View>
              <Ionicons
                name={step.icon as any}
                size={24}
                color={
                  demonstratedSteps.has(step.id) ? "#8B5CF6" : "#D1D5DB"
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Understanding</Text>
          <View style={styles.infoBox}>
            <Ionicons name="help-circle" size={20} color="#8B5CF6" />
            <Text style={styles.infoText}>
              Before starting the tests, confirm the client understands what you will do and ask if they have questions
            </Text>
          </View>

          <View style={styles.confirmationButtons}>
            <TouchableOpacity
              style={[
                styles.understandButton,
                clientUnderstands === false && styles.understandButtonActive,
              ]}
              onPress={() => setClientUnderstands(false)}
            >
              <Ionicons
                name={
                  clientUnderstands === false
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={clientUnderstands === false ? "#DC2626" : "#D1D5DB"}
              />
              <Text
                style={[
                  styles.understandButtonText,
                  clientUnderstands === false &&
                    styles.understandButtonTextActive,
                ]}
              >
                Needs More Explanation
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.understandButton,
                clientUnderstands === true && styles.understandButtonActive,
              ]}
              onPress={() => setClientUnderstands(true)}
            >
              <Ionicons
                name={
                  clientUnderstands === true
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={clientUnderstands === true ? "#10B981" : "#D1D5DB"}
              />
              <Text
                style={[
                  styles.understandButtonText,
                  clientUnderstands === true &&
                    styles.understandButtonTextActive,
                ]}
              >
                Client Understands ✓
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {allDemonstrated && clientUnderstands === true && (
          <View style={styles.readyCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.readyText}>
              Client is ready! You may now proceed with the vision screening tests.
            </Text>
          </View>
        )}

        {canProceed && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle" size={22} color="#FFF" />
            <Text style={styles.continueButtonText}>Start Vision Screening Tests</Text>
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
            {canProceed
              ? "Start Vision Screening Tests"
              : "Demonstrate all tests first"}
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
    backgroundColor: "#F3E8FF",
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: "#5B21B6",
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
  explanationCard: {
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
  explanationCardDemonstrated: {
    borderLeftColor: "#8B5CF6",
  },
  cardLeft: {
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
  checkboxDemonstrated: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  stepContent: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: "#4B5563",
    flex: 1,
    lineHeight: 20,
  },
  confirmationButtons: {
    gap: 10,
  },
  understandButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  understandButtonActive: {
    borderColor: "#8B5CF6",
    backgroundColor: "#F3E8FF",
  },
  understandButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  understandButtonTextActive: {
    color: "#1F2937",
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
