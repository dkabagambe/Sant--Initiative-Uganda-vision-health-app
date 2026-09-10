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

export default function VHTScreeningStep1() {
  const navigation = useNavigation<any>();
  const { updateScreeningData } = useScreening();
  const { t } = useLanguage();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const equipmentChecklist = [
    { id: "echart", label: t("equip_echart") },
    { id: "torch", label: t("equip_torch") },
    { id: "batteries", label: t("equip_batteries") },
    { id: "rope", label: t("equip_rope") },
    { id: "glasses", label: t("equip_glasses") },
    { id: "referral", label: t("equip_referral") },
    { id: "register", label: t("equip_register") },
    { id: "mirror", label: t("equip_mirror") },
    { id: "cases", label: t("equip_cases") },
    { id: "disinfectant", label: t("equip_disinfectant") },
    { id: "cloth", label: t("equip_cloth") },
  ];

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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1E40AF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("step1Title")}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionCard}>
          <Ionicons name="information-circle" size={24} color="#1E40AF" />
          <Text style={styles.instructionText}>{t("step1Instruction")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("equipmentChecklist")}</Text>
          <Text style={styles.sectionSubtitle}>{t("checkHaveItems")}</Text>

          {equipmentChecklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checklistItem}
              onPress={() => toggleItem(item.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  checkedItems.has(item.id) && styles.checkboxChecked,
                ]}
              >
                {checkedItems.has(item.id) && (
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                )}
              </View>
              <Text style={styles.checklistLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("equipmentCondition")}</Text>
          <View style={styles.infoBox}>
            <Ionicons name="alert-circle" size={20} color="#D97706" />
            <Text style={styles.infoText}>{t("confirmCleanWorking")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("supervisorNotification")}</Text>
          <View style={styles.infoBox}>
            <Ionicons name="people" size={20} color="#0891B2" />
            <Text style={styles.infoText}>{t("informedSupervisor")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("referralPathways")}</Text>
          <View style={styles.infoBox}>
            <Ionicons name="map" size={20} color="#7C3AED" />
            <Text style={styles.infoText}>{t("reviewReferralPathways")}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 24 }]}>
        <Text style={styles.footerHint}>
          {allChecked ? t("equipmentReady") : t("completeChecklist")}
        </Text>
        <TouchableOpacity
          style={[styles.button, !allChecked && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!allChecked}
          activeOpacity={allChecked ? 0.7 : 1}
        >
          <Text
            style={[styles.buttonText, !allChecked && styles.buttonTextDisabled]}
          >
            {allChecked
              ? t("continueToScreening")
              : `${checkedItems.size}/${equipmentChecklist.length} ${t("itemsChecked")}`}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={allChecked ? "#FFF" : "#9CA3AF"}
          />
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
  instructionText: { fontSize: 14, color: "#0C4A6E", flex: 1, lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 8 },
  sectionSubtitle: { fontSize: 14, color: "#6B7280", marginBottom: 12 },
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
  checkboxChecked: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  checklistLabel: { fontSize: 15, color: "#374151", flex: 1 },
  infoBox: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
  },
  infoText: { fontSize: 14, color: "#4B5563", flex: 1, lineHeight: 20 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  footerHint: { fontSize: 13, color: "#4B5563", marginBottom: 8, textAlign: "center" },
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
