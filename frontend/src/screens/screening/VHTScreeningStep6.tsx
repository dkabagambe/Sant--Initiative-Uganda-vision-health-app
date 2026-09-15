/**
 * VHTScreeningStep6 — Step 3 of the MOH 8-step protocol:
 * "Explaining and Demonstrating Screening & Use Of Charts"
 *
 * MOH Manual Section 5, Step 3 (page 29):
 * - Explain the 3 lines of the E-chart:
 *     Line 1 (6/60)  — Distance vision (top)
 *     Line 2 (6/12)  — Distance vision (second)
 *     N8 row         — Near vision (bottom)
 * - Demonstrate E direction key: Up / Down / Left / Right
 * - Distance test: one eye at a time, cover other eye with palm
 * - Near test: both eyes open, hold chart at arm's length (~40 cm)
 * - Spectacles rule:
 *     Far glasses → keep on for distance test
 *     Reading glasses only → remove for distance, keep for near
 * - Ensure client understands before proceeding
 */

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
import TumblingE from "../../components/TumblingE";

type EDir = "right" | "down" | "left" | "up";
// Alias so existing JSX (<BlockE>) keeps working without changes
const BlockE = ({ direction, size }: { direction: EDir; size: number }) => (
  <TumblingE direction={direction} size={size} />
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VHTScreeningStep6() {
  const navigation   = useNavigation<any>();
  const { updateScreeningData } = useScreening();
  const { t }        = useLanguage();

  const [demonstratedSteps, setDemonstratedSteps] = useState<Set<string>>(new Set());
  const [clientUnderstands,  setClientUnderstands]  = useState<boolean | null>(null);

  const explanationSteps = [
    {
      id:      "echart-overview",
      title:   "Explain the E-Chart (3 lines)",
      content: "Show the chart. Top 2 lines = distance vision. Bottom line (N8) = near vision.",
      icon:    "eye-outline",
    },
    {
      id:      "direction-key",
      title:   "Demonstrate E Direction Key",
      content: "Use hand gesture (like 3-legged stool). Show Up, Down, Left, Right. Ask client to copy each.",
      icon:    "hand-left-outline",
    },
    {
      id:      "distance-test",
      title:   "Explain Distance Vision Test",
      content: "One eye at a time. Cover other eye with palm. VHT stands 3 metres away.",
      icon:    "resize-outline",
    },
    {
      id:      "near-test",
      title:   "Explain Near Vision Test",
      content: "Both eyes open. Client holds chart at arm's length (~40 cm). Read the N8 (bottom) row.",
      icon:    "document-text-outline",
    },
    {
      id:      "spectacles",
      title:   "Spectacles Rule",
      content: "Far/distance glasses → keep on for distance test. Reading-only glasses → remove for distance, keep for near.",
      icon:    "glasses-outline",
    },
    {
      id:      "torch-test",
      title:   "Explain Torch Light Test",
      content: "For ALL ages. Shine torch from the side of the eye. Do NOT use phone light. Max 5 seconds per eye.",
      icon:    "flashlight-outline",
    },
  ];

  const toggle = (id: string) => {
    const next = new Set(demonstratedSteps);
    next.has(id) ? next.delete(id) : next.add(id);
    setDemonstratedSteps(next);
  };

  const allDone   = demonstratedSteps.size === explanationSteps.length;
  const canProceed = allDone && clientUnderstands === true;

  const handleContinue = () => {
    if (canProceed) {
      updateScreeningData({ testsExplainedToClient: true });
      navigation.navigate("VisionScreen3");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 3: Explain & Demonstrate</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionCard}>
          <Ionicons name="megaphone" size={24} color="#8B5CF6" />
          <Text style={styles.instructionText}>
            Explain and demonstrate the screening process to the client before starting any tests. Ensure they understand and feel comfortable.
          </Text>
        </View>

        {/* ── E-CHART VISUAL ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 E-Chart (show to client)</Text>
          <Text style={styles.sectionSubtitle}>
            The E-chart has 3 lines. Top 2 lines test distance vision. Bottom line (N8) tests near vision.
          </Text>

          <View style={styles.chartCard}>
            {/* Line 1 — 6/60 */}
            <View style={styles.chartRow}>
              <View style={styles.chartLabel}>
                <Text style={styles.chartCode}>6/60</Text>
                <Text style={styles.chartNote}>Distance{"\n"}Line 1</Text>
              </View>
              <View style={styles.chartEs}>
                <BlockE direction="right" size={52} />
                <BlockE direction="down"  size={52} />
                <BlockE direction="left"  size={52} />
              </View>
              <View style={styles.chartMeta}>
                <Text style={styles.chartMetaText}>3 letters</Text>
                <Text style={styles.chartPassText}>≥2 to pass</Text>
              </View>
            </View>

            <View style={styles.chartDivider} />

            {/* Line 2 — 6/12 */}
            <View style={styles.chartRow}>
              <View style={styles.chartLabel}>
                <Text style={styles.chartCode}>6/12</Text>
                <Text style={styles.chartNote}>Distance{"\n"}Line 2</Text>
              </View>
              <View style={styles.chartEs}>
                <BlockE direction="right" size={32} />
                <BlockE direction="up"    size={32} />
                <BlockE direction="down"  size={32} />
                <BlockE direction="left"  size={32} />
                <BlockE direction="right" size={32} />
              </View>
              <View style={styles.chartMeta}>
                <Text style={styles.chartMetaText}>5 letters</Text>
                <Text style={styles.chartPassText}>≥4 to pass</Text>
              </View>
            </View>

            <View style={styles.chartDivider} />

            {/* N8 — Near Vision */}
            <View style={[styles.chartRow, { backgroundColor: "#FFFBEB" }]}>
              <View style={styles.chartLabel}>
                <Text style={[styles.chartCode, { color: "#B45309" }]}>N8</Text>
                <Text style={[styles.chartNote, { color: "#92400E" }]}>Near{"\n"}Vision</Text>
              </View>
              <View style={styles.chartEs}>
                <BlockE direction="left"  size={20} />
                <BlockE direction="right" size={20} />
                <BlockE direction="up"    size={20} />
                <BlockE direction="down"  size={20} />
                <BlockE direction="left"  size={20} />
              </View>
              <View style={styles.chartMeta}>
                <Text style={styles.chartMetaText}>5 letters</Text>
                <Text style={[styles.chartPassText, { color: "#B45309" }]}>at 40 cm</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── DIRECTION KEY ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🖐️ Direction Key (demonstrate to client)</Text>
          <Text style={styles.sectionSubtitle}>
            Use a hand gesture like a 3-legged stool. Ask the client to show you which direction the E is facing.
          </Text>

          <View style={styles.dirKeyCard}>
            {(["right", "up", "left", "down"] as EDir[]).map((dir) => (
              <View key={dir} style={styles.dirKeyItem}>
                <View style={styles.dirKeyBox}>
                  <BlockE direction={dir} size={38} />
                </View>
                <Text style={styles.dirKeyLabel}>
                  {dir === "right" ? "→ Right" : dir === "left" ? "← Left" : dir === "up" ? "↑ Up" : "↓ Down"}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#1565C0" />
            <Text style={styles.infoText}>
              Say: <Text style={{ fontStyle: "italic" }}>"Which way are the legs of the E pointing? Show me with your hand."</Text>
            </Text>
          </View>
        </View>

        {/* ── SPECTACLES RULE ──────────────────────────────────────────── */}
        <View style={styles.spectaclesCard}>
          <Text style={styles.spectaclesTitle}>👓 Spectacles Rule</Text>
          <View style={styles.spectaclesRow}>
            <View style={[styles.pill, { backgroundColor: "#DBEAFE" }]}>
              <Text style={[styles.pillText, { color: "#1D4ED8" }]}>Distance glasses</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.ruleText}>Keep on for distance test. Remove for near test.</Text>
          </View>
          <View style={[styles.spectaclesRow, { marginTop: 8 }]}>
            <View style={[styles.pill, { backgroundColor: "#FEF3C7" }]}>
              <Text style={[styles.pillText, { color: "#92400E" }]}>Reading glasses only</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.ruleText}>Remove for distance test. Keep on for near test.</Text>
          </View>
        </View>

        {/* ── DEMONSTRATION CHECKLIST ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Demonstration Checklist</Text>
          <Text style={styles.sectionSubtitle}>
            Demonstrate each point to the client, then tap to mark as done:
          </Text>

          {explanationSteps.map((step) => {
            const done = demonstratedSteps.has(step.id);
            return (
              <TouchableOpacity
                key={step.id}
                style={[styles.stepCard, done && styles.stepCardDone]}
                onPress={() => toggle(step.id)}
                activeOpacity={0.7}
              >
                <View style={styles.stepLeft}>
                  <View style={[styles.checkbox, done && styles.checkboxDone]}>
                    {done && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, done && { color: "#5B21B6" }]}>{step.title}</Text>
                    <Text style={styles.stepContent}>{step.content}</Text>
                  </View>
                </View>
                <Ionicons name={step.icon as any} size={22} color={done ? "#8B5CF6" : "#D1D5DB"} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── CLIENT UNDERSTANDING ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Does the client understand and feel comfortable?</Text>

          <View style={styles.confirmRow}>
            <TouchableOpacity
              style={[styles.confirmBtn, clientUnderstands === false && styles.confirmBtnNo]}
              onPress={() => setClientUnderstands(false)}
            >
              <Ionicons
                name={clientUnderstands === false ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={clientUnderstands === false ? "#DC2626" : "#D1D5DB"}
              />
              <Text style={[styles.confirmBtnText, clientUnderstands === false && { color: "#DC2626" }]}>
                Not yet — demonstrate again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, clientUnderstands === true && styles.confirmBtnYes]}
              onPress={() => setClientUnderstands(true)}
            >
              <Ionicons
                name={clientUnderstands === true ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={clientUnderstands === true ? "#10B981" : "#D1D5DB"}
              />
              <Text style={[styles.confirmBtnText, clientUnderstands === true && { color: "#065F46" }]}>
                Yes — client understands
              </Text>
            </TouchableOpacity>
          </View>

          {clientUnderstands === false && (
            <View style={styles.retryBox}>
              <Ionicons name="refresh-circle" size={20} color="#D97706" />
              <Text style={styles.retryText}>
                Demonstrate again using the direction key above. Ensure client can copy each gesture before proceeding.
              </Text>
            </View>
          )}
        </View>

        {canProceed && (
          <View style={styles.readyCard}>
            <Ionicons name="checkmark-circle" size={28} color="#10B981" />
            <Text style={styles.readyText}>
              All demonstrated and client understands. Ready to begin screening tests.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !canProceed && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!canProceed}
          activeOpacity={canProceed ? 0.7 : 1}
        >
          <Text style={[styles.buttonText, !canProceed && styles.buttonTextDisabled]}>
            {canProceed ? "Continue → Torch Light Test" : "Complete all steps above first"}
          </Text>
          {canProceed && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#1F2937", flex: 1, textAlign: "center" },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  instructionCard: {
    backgroundColor: "#F3E8FF", borderLeftWidth: 4, borderLeftColor: "#8B5CF6",
    padding: 12, borderRadius: 8, marginBottom: 20, flexDirection: "row", gap: 12,
  },
  instructionText: { fontSize: 14, color: "#5B21B6", flex: 1, lineHeight: 20 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1F2937", marginBottom: 6 },
  sectionSubtitle: { fontSize: 13, color: "#6B7280", marginBottom: 12, lineHeight: 18 },

  // E-Chart
  chartCard: { borderWidth: 2, borderColor: "#1F2937", borderRadius: 10, overflow: "hidden" },
  chartRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10, backgroundColor: "#FFF" },
  chartLabel: { width: 50, alignItems: "center" },
  chartCode: { fontSize: 12, fontWeight: "700", color: "#374151" },
  chartNote: { fontSize: 10, color: "#6B7280", textAlign: "center", marginTop: 2, lineHeight: 13 },
  chartEs: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" },
  chartMeta: { width: 54, alignItems: "flex-end" },
  chartMetaText: { fontSize: 11, color: "#6B7280" },
  chartPassText: { fontSize: 11, color: "#10B981", fontWeight: "600" },
  chartDivider: { height: 1, backgroundColor: "#E5E7EB" },

  // Direction key
  dirKeyCard: {
    flexDirection: "row", justifyContent: "space-around",
    backgroundColor: "#F9FAFB", borderRadius: 10, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  dirKeyItem: { alignItems: "center", gap: 8 },
  dirKeyBox: {
    backgroundColor: "#FFF", borderRadius: 8, padding: 8,
    elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2,
  },
  dirKeyLabel: { fontSize: 12, fontWeight: "700", color: "#374151" },

  infoBox: {
    backgroundColor: "#EFF6FF", borderRadius: 8, padding: 10,
    flexDirection: "row", gap: 8,
  },
  infoText: { fontSize: 13, color: "#1D4ED8", flex: 1, lineHeight: 18 },

  // Spectacles
  spectaclesCard: {
    backgroundColor: "#F8F9FA", borderRadius: 10, padding: 14, marginBottom: 24,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  spectaclesTitle: { fontSize: 14, fontWeight: "700", color: "#1F2937", marginBottom: 10 },
  spectaclesRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  pillText: { fontSize: 11, fontWeight: "600" },
  arrow: { fontSize: 16, color: "#6B7280" },
  ruleText: { flex: 1, fontSize: 12, color: "#374151", lineHeight: 16 },

  // Checklist
  stepCard: {
    backgroundColor: "#F9FAFB", borderRadius: 8, padding: 12, marginBottom: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderLeftWidth: 4, borderLeftColor: "#E5E7EB",
  },
  stepCardDone: { borderLeftColor: "#8B5CF6" },
  stepLeft: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#D1D5DB",
    alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  checkboxDone: { backgroundColor: "#8B5CF6", borderColor: "#8B5CF6" },
  stepTitle: { fontSize: 14, fontWeight: "600", color: "#1F2937", marginBottom: 2 },
  stepContent: { fontSize: 12, color: "#6B7280", lineHeight: 17 },

  // Confirm
  confirmRow: { gap: 10 },
  confirmBtn: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 8, borderWidth: 2, borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB", gap: 10,
  },
  confirmBtnYes: { borderColor: "#10B981", backgroundColor: "#F0FDF4" },
  confirmBtnNo:  { borderColor: "#DC2626", backgroundColor: "#FEF2F2" },
  confirmBtnText: { fontSize: 14, color: "#6B7280", fontWeight: "500" },

  retryBox: {
    backgroundColor: "#FEF3C7", borderLeftWidth: 4, borderLeftColor: "#D97706",
    padding: 12, borderRadius: 8, flexDirection: "row", gap: 10, marginTop: 12,
  },
  retryText: { fontSize: 13, color: "#92400E", flex: 1, lineHeight: 18 },

  readyCard: {
    backgroundColor: "#DCFCE7", borderLeftWidth: 4, borderLeftColor: "#10B981",
    padding: 14, borderRadius: 8, flexDirection: "row", alignItems: "center",
    gap: 12, marginBottom: 24,
  },
  readyText: { fontSize: 14, color: "#065F46", fontWeight: "500", flex: 1, lineHeight: 20 },

  footer: {
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: "#E5E7EB",
  },
  button: {
    backgroundColor: "#8B5CF6", paddingVertical: 14, borderRadius: 8,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
  },
  buttonDisabled: { backgroundColor: "#D1D5DB" },
  buttonText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  buttonTextDisabled: { color: "#9CA3AF" },
});
