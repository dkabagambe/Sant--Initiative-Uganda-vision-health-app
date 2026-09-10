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
import { useLanguage } from "../../context/LanguageContext";

export default function VHTScreeningStep5() {
  const navigation = useNavigation<any>();
  const { updateScreeningData } = useScreening();
  const { t } = useLanguage();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const preparationSteps = [
    { id: "chair",   title: t("placeChair"),     instruction: t("placeChairInstruction"),     icon: "home" },
    { id: "measure", title: t("measureDistance"), instruction: t("measureDistanceInstruction"), icon: "resize" },
    { id: "chart",   title: t("positionEChart"),  instruction: t("positionEChartInstruction"),  icon: "image" },
    { id: "hands",   title: t("washHands"),       instruction: t("washHandsInstruction"),       icon: "water" },
    { id: "torch",   title: t("prepareTorch"),    instruction: t("prepareTorchInstruction"),    icon: "flashlight" },
  ];

  const toggleStep = (id: string) => {
    const next = new Set(completedSteps);
    next.has(id) ? next.delete(id) : next.add(id);
    setCompletedSteps(next);
  };

  const allStepsCompleted = completedSteps.size === preparationSteps.length;

  const handleContinue = () => {
    if (allStepsCompleted) {
      updateScreeningData({ screeningAreaPrepared: true });
      navigation.navigate("VHTScreeningStep6");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#0891B2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("step5Title")}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionCard}>
          <Ionicons name="settings" size={24} color="#0891B2" />
          <Text style={styles.instructionText}>{t("step5Instruction")}</Text>
        </View>

        {/* Critical distance warning */}
        <View style={styles.warningBox}>
          <Ionicons name="alert-circle" size={20} color="#D97706" />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Critical: 3-Metre Distance</Text>
            <Text style={styles.warningText}>
              The E-chart MUST be exactly 3 metres from the client for accurate distance vision testing.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("preparationSteps")}</Text>
          <Text style={styles.sectionSubtitle}>{t("completeAllSteps")}</Text>

          {preparationSteps.map((step) => (
            <TouchableOpacity
              key={step.id}
              style={[styles.stepCard, completedSteps.has(step.id) && styles.stepCardDone]}
              onPress={() => toggleStep(step.id)}
            >
              <View style={styles.stepLeft}>
                <View style={[styles.checkbox, completedSteps.has(step.id) && styles.checkboxChecked]}>
                  {completedSteps.has(step.id) && <Ionicons name="checkmark" size={16} color="#FFF" />}
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

        {allStepsCompleted && (
          <View style={styles.readyCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.readyText}>{t("setupComplete")}</Text>
          </View>
        )}
      </ScrollView>

      {/* Single footer button — no duplicate inside scroll */}
      <View style={[styles.footer, { paddingBottom: 24 }]}>
        <TouchableOpacity
          style={[styles.button, !allStepsCompleted && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!allStepsCompleted}
          activeOpacity={allStepsCompleted ? 0.7 : 1}
        >
          <Text style={[styles.buttonText, !allStepsCompleted && styles.buttonTextDisabled]}>
            {allStepsCompleted
              ? t("continueToDemo")
              : `${completedSteps.size}/${preparationSteps.length} ${t("itemsChecked")}`}
          </Text>
          {allStepsCompleted && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
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
  instructionText: { fontSize: 14, color: "#0C4A6E", flex: 1, lineHeight: 20 },
  warningBox: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#D97706",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  warningTitle: { fontSize: 14, fontWeight: "700", color: "#92400E", marginBottom: 2 },
  warningText: { fontSize: 13, color: "#B45309", lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 8 },
  sectionSubtitle: { fontSize: 14, color: "#6B7280", marginBottom: 12 },
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
  stepCardDone: { borderLeftColor: "#0891B2", backgroundColor: "#F0F9FF" },
  stepLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: "#D1D5DB",
    alignItems: "center", justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#0891B2", borderColor: "#0891B2" },
  stepTitle: { fontSize: 14, fontWeight: "600", color: "#1F2937", marginBottom: 2 },
  stepInstruction: { fontSize: 13, color: "#6B7280", lineHeight: 18 },
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
  readyText: { fontSize: 14, color: "#065F46", fontWeight: "500", textAlign: "center", lineHeight: 20 },
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
  buttonDisabled: { backgroundColor: "#D1D5DB" },
  buttonText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  buttonTextDisabled: { color: "#9CA3AF" },
});
