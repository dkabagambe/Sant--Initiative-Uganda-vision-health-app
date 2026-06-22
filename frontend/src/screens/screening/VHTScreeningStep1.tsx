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

const equipmentChecklist = [
  { id: "echart", label: "E-chart" },
  { id: "torch", label: "Torch" },
  { id: "batteries", label: "Batteries" },
  { id: "rope", label: "3-metre rope" },
  { id: "glasses", label: "Reading glasses" },
  { id: "referral", label: "Referral forms" },
  { id: "register", label: "Register" },
  { id: "mirror", label: "Mirror" },
  { id: "cases", label: "Glasses cases" },
  { id: "disinfectant", label: "Disinfectant" },
  { id: "cloth", label: "Clean cloth" },
];

export default function VHTScreeningStep1() {
  const navigation = useNavigation<any>();
  const { updateScreeningData } = useScreening();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const allChecked = checkedItems.size === equipmentChecklist.length;

  const handleContinue = () => {
    if (allChecked) {
      updateScreeningData({ equipmentChecked: true });
      navigation.navigate("VHTScreeningStep2");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1E40AF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 1: Prepare for Visit</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionCard}>
          <Ionicons name="information-circle" size={24} color="#1E40AF" />
          <Text style={styles.instructionText}>
            Before going for household visits, confirm all equipment is present, clean and working
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Checklist</Text>
          <Text style={styles.sectionSubtitle}>
            Check that you have all these items:
          </Text>

          {equipmentChecklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checklistItem}
              onPress={() => toggleItem(item.id)}
            >
              <View style={[styles.checkbox, checkedItems.has(item.id) && styles.checkboxChecked]}>
                {checkedItems.has(item.id) && (
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                )}
              </View>
              <Text style={styles.checklistLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Condition</Text>
          <View style={styles.infoBox}>
            <Ionicons name="alert-circle" size={20} color="#D97706" />
            <Text style={styles.infoText}>
              Confirm all equipment is clean and working before proceeding
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supervisor Notification</Text>
          <View style={styles.infoBox}>
            <Ionicons name="people" size={20} color="#0891B2" />
            <Text style={styles.infoText}>
              Have you informed your supervisor of planned visits?
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Pathways</Text>
          <View style={styles.infoBox}>
            <Ionicons name="map" size={20} color="#7C3AED" />
            <Text style={styles.infoText}>
              Review referral pathways to health facilities before leaving
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, !allChecked && styles.startButtonDisabled]}
          onPress={handleContinue}
          disabled={!allChecked}
          activeOpacity={allChecked ? 0.7 : 1}
        >
          <Ionicons name="play-circle" size={22} color={allChecked ? "#FFF" : "#9CA3AF"} />
          <Text style={[styles.startButtonText, !allChecked && styles.startButtonTextDisabled]}>
            {allChecked ? "Start Screening" : `Check all equipment first (${checkedItems.size}/${equipmentChecklist.length})`}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 24 }]}>
        <Text style={styles.footerHint}>
          {allChecked
            ? "Equipment ready. Continue to household screening."
            : "Complete the checklist to continue to household screening."}
        </Text>
        <TouchableOpacity
          style={[styles.button, !allChecked && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!allChecked}
          activeOpacity={allChecked ? 0.7 : 1}
        >
          <Text style={[styles.buttonText, !allChecked && styles.buttonTextDisabled]}>
            {allChecked
              ? "Continue to Screening"
              : `${checkedItems.size}/${equipmentChecklist.length} items checked`}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={allChecked ? "#FFF" : "#9CA3AF"} />
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
    backgroundColor: "#DBEAFE",
    borderLeftWidth: 4,
    borderLeftColor: "#1E40AF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: "#0C4A6E",
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
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },
  checklistLabel: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  footerHint: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 8,
    textAlign: "center",
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
  startButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 0,
    marginTop: 8,
    marginBottom: 8,
  },
  startButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  startButtonTextDisabled: {
    color: "#9CA3AF",
  },
});
