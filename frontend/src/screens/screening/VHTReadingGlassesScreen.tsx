/**
 * VHTReadingGlassesScreen — Step 7 of MOH 8-step protocol:
 * "Dispensing Reading Glasses"
 *
 * MOH Manual Section 5, Step 7 (pages 37-42):
 *
 * Eligibility: Age 40+ who PASSED torch test, PASSED distance vision,
 *              and FAILED near vision test.
 *
 * Power testing — SEQUENTIAL, starting at +1.00:
 *   Ask client to hold E-chart at arm's length and try +1.00 sample glasses.
 *   Ask: "Can you see the N8 line clearly?"
 *   YES → that is the correct power → proceed to frame fitting
 *   NO  → try next power (+1.50 → +2.00 → +2.50 → +3.00)
 *   If NONE of the 5 powers work → REFER to health facility
 *
 * Frame fitting:
 *   - Try each frame in the correct power
 *   - Ask: comfortable? stays when moving head?
 *   - Dispense glasses + case
 *
 * Recording:
 *   - Record Y in register: "Dispensed Glasses - [power]"
 *   - Record in Community Daily Consumption Log: "Reading glasses, [power]"
 *
 * Education (pages 41-42 of job aid):
 *   1. For near work only (reading, sewing, counting money, sorting rice, phone)
 *   2. Remove when walking / looking at distance
 *   3. Use good lighting during near work
 *   4. Glasses do NOT damage eyes (address myth)
 *   5. Hold by frame not lenses
 *   6. Two hands when removing
 *   7. Clean with water and clean cloth only
 *   8. Store in case when not in use
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";
import TumblingE from "../../components/TumblingE";

// ─── Constants ────────────────────────────────────────────────────────────────
const POWERS = ["+1.00", "+1.50", "+2.00", "+2.50", "+3.00"] as const;
type GlassPower = typeof POWERS[number];

const FRAMES = [
  { id: "metal",   label: "Metal Frame",   desc: "Durable, long-lasting" },
  { id: "plastic", label: "Plastic Frame", desc: "Comfortable, lightweight" },
  { id: "halfrim", label: "Half-Rim Frame", desc: "Very light, minimal" },
];

const EDUCATION_POINTS = [
  { id: "near-only",     title: "For Near Work Only",         content: "Reading, sewing, counting money, sorting rice, using phone. NOT for walking or looking far." },
  { id: "remove-dist",   title: "Remove for Distance",        content: "Remove glasses when walking, driving, or looking at distant objects." },
  { id: "lighting",      title: "Use Good Lighting",          content: "Use adequate lighting during near work to reduce eye strain." },
  { id: "no-damage",     title: "Glasses Do NOT Damage Eyes", content: "Reassure client: glasses do not damage the eyes. A common myth — not true." },
  { id: "hold-frame",    title: "Hold by the Frame",          content: "Always hold glasses by the frame, not the lenses, to avoid scratching." },
  { id: "two-hands",     title: "Two Hands When Removing",    content: "Use two hands when putting on or taking off glasses to prevent bending." },
  { id: "clean",         title: "Clean with Water & Cloth",   content: "Clean lenses with water and a clean, soft cloth only. No harsh materials." },
  { id: "store",         title: "Store in Case",              content: "Store glasses folded in the protective case when not in use." },
];

// ─── Block E (for N8 reference) ───────────────────────────────────────────────
type EDir = "right" | "down" | "left" | "up";
// Alias so existing JSX (<BlockE>) keeps working without changes
const BlockE = ({ direction, size }: { direction: EDir; size: number }) => (
  <TumblingE direction={direction} size={size} />
);

// ─── Main Component ───────────────────────────────────────────────────────────
type Step = "power" | "frame" | "education" | "recording" | "referred";

export default function VHTReadingGlassesScreen() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();

  const [step, setStep]                         = useState<Step>("power");
  const [powerIndex, setPowerIndex]             = useState(0);           // which power we're testing (0=+1.00)
  const [selectedPower, setSelectedPower]       = useState<GlassPower | null>(null);
  const [selectedFrame, setSelectedFrame]       = useState<string | null>(null);
  const [caseProvided, setCaseProvided]         = useState(false);
  const [educationDone, setEducationDone]       = useState<Set<string>>(new Set());
  const [recordingDone, setRecordingDone]       = useState<Set<string>>(new Set());

  const currentPower = POWERS[powerIndex];

  // ── Power testing ─────────────────────────────────────────────────────────
  const handlePowerYes = () => {
    setSelectedPower(currentPower);
    setStep("frame");
  };

  const handlePowerNo = () => {
    if (powerIndex < POWERS.length - 1) {
      setPowerIndex(powerIndex + 1);
    } else {
      // All 5 powers tried — none worked → refer
      setStep("referred");
    }
  };

  // ── Education toggle ──────────────────────────────────────────────────────
  const toggleEducation = (id: string) => {
    const next = new Set(educationDone);
    next.has(id) ? next.delete(id) : next.add(id);
    setEducationDone(next);
  };

  // ── Recording toggle ──────────────────────────────────────────────────────
  const toggleRecording = (id: string) => {
    const next = new Set(recordingDone);
    next.has(id) ? next.delete(id) : next.add(id);
    setRecordingDone(next);
  };

  const allEducationDone  = educationDone.size === EDUCATION_POINTS.length;
  const allRecordingDone  = recordingDone.size === 2;
  const canFinish         = allEducationDone && allRecordingDone && selectedFrame && caseProvided;

  const handleFinish = () => {
    // Update context AND pass all glasses data as route params so ScreeningComplete
    // can read them immediately without waiting for React state to flush.
    updateScreeningData({
      needsGlasses:             true,
      glassesDispensed:         true,
      glassesPower:             selectedPower ?? undefined,
      selectedGlassesPower:     selectedPower ?? undefined,
      recommendedPower:         selectedPower ?? undefined,
      glassesFrameType:         selectedFrame ?? undefined,
      selectedFrameType:        selectedFrame ?? undefined,
      glassesEducationProvided: true,
    });
    navigation.navigate("ScreeningComplete", {
      glassesDispensed:  true,
      glassesPower:      selectedPower,
      glassesFrameType:  selectedFrame,
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#0891B2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 7: Reading Glasses</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress stepper */}
      <View style={styles.stepper}>
        {(["power", "frame", "education", "recording"] as Step[]).map((s, i) => {
          const labels = ["Power", "Frame", "Educate", "Record"];
          const active = step === s;
          const done   = step === "referred" || (
            ["power","frame","education","recording"].indexOf(step) > i
          );
          return (
            <React.Fragment key={s}>
              <View style={styles.stepperItem}>
                <View style={[styles.stepperCircle, done && styles.stepperCircleDone, active && styles.stepperCircleActive]}>
                  {done ? (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  ) : (
                    <Text style={styles.stepperNum}>{i + 1}</Text>
                  )}
                </View>
                <Text style={[styles.stepperLabel, active && { color: "#0891B2", fontWeight: "700" }]}>{labels[i]}</Text>
              </View>
              {i < 3 && <View style={[styles.stepperLine, done && { backgroundColor: "#10B981" }]} />}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── STEP: POWER TESTING ─────────────────────────────────────── */}
        {step === "power" && (
          <>
            <View style={styles.instructionCard}>
              <Ionicons name="information-circle" size={24} color="#0891B2" />
              <Text style={styles.instructionText}>
                Test powers in order starting from the weakest (+1.00). Use the LOWEST power that lets the client see the N8 line clearly.
              </Text>
            </View>

            {/* Power sequence progress */}
            <View style={styles.powerProgressCard}>
              <Text style={styles.powerProgressTitle}>Testing order:</Text>
              <View style={styles.powerProgressRow}>
                {POWERS.map((p, i) => (
                  <View
                    key={p}
                    style={[
                      styles.powerPip,
                      i < powerIndex  && styles.powerPipFailed,
                      i === powerIndex && styles.powerPipActive,
                      i > powerIndex  && styles.powerPipPending,
                    ]}
                  >
                    <Text style={[styles.powerPipText, i === powerIndex && { color: "#FFF" }]}>{p}</Text>
                    {i < powerIndex && <Text style={{ fontSize: 10, color: "#EF4444" }}>✗</Text>}
                  </View>
                ))}
              </View>
            </View>

            {/* Current power being tested */}
            <View style={styles.currentPowerCard}>
              <Text style={styles.currentPowerLabel}>Now testing:</Text>
              <Text style={styles.currentPowerValue}>{currentPower}</Text>
              <Text style={styles.currentPowerSub}>
                {powerIndex === 0 ? "Weakest — start here" : powerIndex === POWERS.length - 1 ? "Strongest available" : `Power ${powerIndex + 1} of ${POWERS.length}`}
              </Text>
            </View>

            {/* N8 row reference */}
            <View style={styles.n8Card}>
              <Text style={styles.n8Title}>N8 Row (what client must see at 40 cm):</Text>
              <View style={styles.n8Row}>
                {(["left", "right", "up", "down", "left"] as EDir[]).map((d, i) => (
                  <BlockE key={i} direction={d} size={22} />
                ))}
              </View>
              <Text style={styles.n8Note}>Ask: "Can you see these E's clearly? Which way are they pointing?"</Text>
            </View>

            {/* Instructions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Instructions:</Text>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>1</Text>
                <Text style={styles.stepText}>Ask client to put on the {currentPower} sample glasses</Text>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>2</Text>
                <Text style={styles.stepText}>Hand client the E-chart to hold at arm's length (~40 cm)</Text>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>3</Text>
                <Text style={styles.stepText}>Ask client to look at the N8 row (bottom line) with BOTH eyes open</Text>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>4</Text>
                <Text style={styles.stepText}>Ask: "Can you see the N8 row clearly?"</Text>
              </View>
            </View>

            {/* Yes / No buttons */}
            <View style={styles.powerAnswerRow}>
              <TouchableOpacity style={styles.powerYesBtn} onPress={handlePowerYes} activeOpacity={0.75}>
                <Text style={styles.powerBtnIcon}>✓</Text>
                <Text style={styles.powerBtnTitle}>Yes — can see clearly</Text>
                <Text style={styles.powerBtnSub}>{currentPower} is the correct power</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.powerNoBtn} onPress={handlePowerNo} activeOpacity={0.75}>
                <Text style={styles.powerBtnIcon}>✗</Text>
                <Text style={styles.powerBtnTitle}>
                  {powerIndex < POWERS.length - 1 ? `No — try ${POWERS[powerIndex + 1]}` : "No — none worked"}
                </Text>
                <Text style={styles.powerBtnSub}>
                  {powerIndex < POWERS.length - 1 ? "Move to next power" : "Must refer to facility"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── STEP: REFERRED (none of 5 powers worked) ─────────────────── */}
        {step === "referred" && (
          <>
            <View style={styles.referCard}>
              <Ionicons name="alert-circle" size={40} color="#DC2626" />
              <Text style={styles.referTitle}>None of the 5 powers worked</Text>
              <Text style={styles.referSubtitle}>
                All powers tested: {POWERS.join(", ")}{"\n"}
                Client cannot see N8 clearly with any available power.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>📋 Required Actions:</Text>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>1</Text>
                <Text style={styles.stepText}>Record "Y" in register under "Referred?"</Text>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>2</Text>
                <Text style={styles.stepText}>Complete VHT Referral Form</Text>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>3</Text>
                <Text style={styles.stepText}>Reason for referral: "None of the 5 reading glass powers (+1.00 to +3.00) corrected near vision"</Text>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>4</Text>
                <Text style={styles.stepText}>Refer to health facility for further eye examination</Text>
              </View>
            </View>
          </>
        )}

        {/* ── STEP: FRAME FITTING ───────────────────────────────────────── */}
        {step === "frame" && selectedPower && (
          <>
            <View style={styles.powerFoundCard}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.powerFoundText}>Correct power found: <Text style={{ fontWeight: "700" }}>{selectedPower}</Text></Text>
            </View>

            <View style={styles.instructionCard}>
              <Ionicons name="glasses" size={24} color="#0891B2" />
              <Text style={styles.instructionText}>
                Now help the client try different frame styles in {selectedPower} power. Find the best fit.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fitting Instructions:</Text>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>1</Text>
                <Text style={styles.stepText}>Hand mirror to client</Text>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>2</Text>
                <Text style={styles.stepText}>Ask client to try each frame style in {selectedPower}</Text>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>3</Text>
                <Text style={styles.stepText}>Ask: "Are they comfortable? Do they pinch?"</Text>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>4</Text>
                <Text style={styles.stepText}>Ask client to move head up and down — do the glasses stay in place?</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Frame Style Dispensed:</Text>
              {FRAMES.map((fr) => (
                <TouchableOpacity
                  key={fr.id}
                  style={[styles.frameBtn, selectedFrame === fr.id && styles.frameBtnSelected]}
                  onPress={() => setSelectedFrame(fr.id)}
                >
                  <Ionicons
                    name={selectedFrame === fr.id ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={selectedFrame === fr.id ? "#0891B2" : "#D1D5DB"}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.frameBtnText, selectedFrame === fr.id && { color: "#0891B2" }]}>{fr.label}</Text>
                    <Text style={styles.frameBtnDesc}>{fr.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setCaseProvided(!caseProvided)}
            >
              <View style={[styles.checkbox, caseProvided && styles.checkboxDone]}>
                {caseProvided && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
              <Text style={styles.checkboxLabel}>Glasses case (or clean cloth) has been provided to client</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── STEP: EDUCATION ───────────────────────────────────────────── */}
        {step === "education" && selectedPower && (
          <>
            <View style={styles.powerFoundCard}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.powerFoundText}>Power: {selectedPower} • Frame: {selectedFrame}</Text>
            </View>

            <View style={styles.instructionCard}>
              <Ionicons name="school" size={24} color="#7C3AED" />
              <Text style={[styles.instructionText, { color: "#5B21B6" }]}>
                Educate the client on how to use and care for their reading glasses. Tick each point as you explain it.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education Checklist ({educationDone.size}/{EDUCATION_POINTS.length}):</Text>
              {EDUCATION_POINTS.map((pt) => {
                const done = educationDone.has(pt.id);
                return (
                  <TouchableOpacity
                    key={pt.id}
                    style={[styles.educationCard, done && styles.educationCardDone]}
                    onPress={() => toggleEducation(pt.id)}
                  >
                    <View style={[styles.checkbox, done && styles.checkboxDone]}>
                      {done && <Ionicons name="checkmark" size={16} color="#FFF" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.eduTitle, done && { color: "#5B21B6" }]}>{pt.title}</Text>
                      <Text style={styles.eduContent}>{pt.content}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* ── STEP: RECORDING ───────────────────────────────────────────── */}
        {step === "recording" && selectedPower && (
          <>
            <View style={styles.powerFoundCard}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.powerFoundText}>Power: {selectedPower} • Frame: {selectedFrame}</Text>
            </View>

            <View style={styles.instructionCard}>
              <Ionicons name="document-text" size={24} color="#0891B2" />
              <Text style={styles.instructionText}>
                Record the dispensing in the VHT Register and Community Daily Consumption Log before completing.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Recording Checklist:</Text>

              <TouchableOpacity
                style={[styles.recordCard, recordingDone.has("register") && styles.recordCardDone]}
                onPress={() => toggleRecording("register")}
              >
                <View style={[styles.checkbox, recordingDone.has("register") && styles.checkboxDone]}>
                  {recordingDone.has("register") && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recordTitle}>VHT Community Eye Health Register</Text>
                  <Text style={styles.recordDetail}>
                    Record "Y" in the register under:{"\n"}
                    <Text style={{ fontWeight: "700" }}>"Dispensed Glasses — {selectedPower}"</Text>
                  </Text>
                </View>
                <Ionicons name="book-outline" size={22} color={recordingDone.has("register") ? "#0891B2" : "#D1D5DB"} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.recordCard, recordingDone.has("consumption-log") && styles.recordCardDone]}
                onPress={() => toggleRecording("consumption-log")}
              >
                <View style={[styles.checkbox, recordingDone.has("consumption-log") && styles.checkboxDone]}>
                  {recordingDone.has("consumption-log") && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recordTitle}>Community Daily Consumption Log</Text>
                  <Text style={styles.recordDetail}>
                    Name of Item: <Text style={{ fontWeight: "700" }}>"Reading glasses, {selectedPower}"</Text>{"\n"}
                    Dispensing Unit: <Text style={{ fontWeight: "700" }}>"Pair"</Text>{"\n"}
                    Quantity: <Text style={{ fontWeight: "700" }}>1</Text>
                  </Text>
                </View>
                <Ionicons name="clipboard-outline" size={22} color={recordingDone.has("consumption-log") ? "#0891B2" : "#D1D5DB"} />
              </TouchableOpacity>
            </View>
          </>
        )}

      </ScrollView>

      {/* ── STICKY FOOTER — always visible ──────────────────────────────── */}
      <View style={styles.footer}>

        {/* Power step — no footer button, user taps Yes/No cards above */}

        {/* Referred step */}
        {step === "referred" && (
          <TouchableOpacity
            style={styles.footerBtnRed}
            onPress={() => {
              updateScreeningData({
                needsReferral: true,
                needsGlasses: false,
                referralReason: "None of the 5 reading glass powers (+1.00 to +3.00) corrected near vision. Requires specialist examination.",
                referralStep: "Step 7 - Reading Glasses",
                referralUrgency: "normal",
              });
              const params = {
                fromScreening: true,
                clientName: screeningData.clientName || "",
                clientPhone: screeningData.clientPhone || "",
                clientAge: String(screeningData.clientAge || ""),
                clientSex: screeningData.clientGender || "",
                district: screeningData.district || "",
                reason: "None of the 5 reading glass powers (+1.00 to +3.00) corrected near vision. Requires specialist examination.",
                urgency: "normal",
              };
              const root = navigation.getParent()?.getParent();
              if (root) root.navigate("CreateReferralScreen", params);
              else navigation.navigate("CreateReferralScreen" as any, params);
            }}
          >
            <Ionicons name="medical" size={20} color="#FFF" />
            <Text style={styles.footerBtnText}>Create Referral →</Text>
          </TouchableOpacity>
        )}

        {/* Frame step */}
        {step === "frame" && (
          <TouchableOpacity
            style={[styles.footerBtnGreen, !(selectedFrame && caseProvided) && styles.footerBtnDisabled]}
            onPress={() => { if (selectedFrame && caseProvided) setStep("education"); }}
            activeOpacity={selectedFrame && caseProvided ? 0.8 : 1}
          >
            <Text style={[styles.footerBtnText, !(selectedFrame && caseProvided) && styles.footerBtnTextDisabled]}>
              {selectedFrame && caseProvided
                ? "Continue → Educate Client"
                : `${!selectedFrame ? "Select a frame" : "Confirm case given"} to continue`}
            </Text>
            {selectedFrame && caseProvided && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
          </TouchableOpacity>
        )}

        {/* Education step */}
        {step === "education" && (
          <TouchableOpacity
            style={[styles.footerBtnGreen, !allEducationDone && styles.footerBtnDisabled]}
            onPress={() => { if (allEducationDone) setStep("recording"); }}
            activeOpacity={allEducationDone ? 0.8 : 1}
          >
            <Text style={[styles.footerBtnText, !allEducationDone && styles.footerBtnTextDisabled]}>
              {allEducationDone
                ? "Continue → Record Dispensing"
                : `${EDUCATION_POINTS.length - educationDone.size} education point(s) remaining`}
            </Text>
            {allEducationDone && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
          </TouchableOpacity>
        )}

        {/* Recording step */}
        {step === "recording" && (
          <TouchableOpacity
            style={[styles.footerBtnGreen, !canFinish && styles.footerBtnDisabled]}
            onPress={handleFinish}
            activeOpacity={canFinish ? 0.8 : 1}
          >
            <Ionicons name="checkmark-circle" size={20} color={canFinish ? "#FFF" : "#9CA3AF"} />
            <Text style={[styles.footerBtnText, !canFinish && styles.footerBtnTextDisabled]}>
              {canFinish ? "✅ Complete Dispensing" : "Complete both records above to continue"}
            </Text>
          </TouchableOpacity>
        )}

      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#1F2937", flex: 1, textAlign: "center" },

  // Stepper
  stepper: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  stepperItem: { alignItems: "center", gap: 4 },
  stepperCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#E5E7EB",
    justifyContent: "center", alignItems: "center",
  },
  stepperCircleActive: { backgroundColor: "#0891B2" },
  stepperCircleDone:   { backgroundColor: "#10B981" },
  stepperNum: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  stepperLabel: { fontSize: 11, color: "#6B7280" },
  stepperLine: { flex: 1, height: 2, backgroundColor: "#E5E7EB", marginHorizontal: 4, marginBottom: 14 },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  instructionCard: {
    backgroundColor: "#E0F7FF", borderLeftWidth: 4, borderLeftColor: "#0891B2",
    padding: 12, borderRadius: 8, marginBottom: 16, flexDirection: "row", gap: 12,
  },
  instructionText: { fontSize: 14, color: "#0C4A6E", flex: 1, lineHeight: 20 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1F2937", marginBottom: 10 },

  // Power testing
  powerProgressCard: {
    backgroundColor: "#F9FAFB", borderRadius: 10, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  powerProgressTitle: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  powerProgressRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  powerPip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, alignItems: "center",
  },
  powerPipActive:  { backgroundColor: "#0891B2", borderColor: "#0891B2" },
  powerPipFailed:  { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },
  powerPipPending: { backgroundColor: "#F9FAFB", borderColor: "#D1D5DB" },
  powerPipText:    { fontSize: 12, fontWeight: "700", color: "#374151" },

  currentPowerCard: {
    backgroundColor: "#0891B2", borderRadius: 12, padding: 20,
    alignItems: "center", marginBottom: 14,
  },
  currentPowerLabel: { fontSize: 13, color: "#BAE6FD" },
  currentPowerValue: { fontSize: 42, fontWeight: "700", color: "#FFF", marginVertical: 4 },
  currentPowerSub:   { fontSize: 13, color: "#BAE6FD" },

  n8Card: {
    backgroundColor: "#FFFBEB", borderRadius: 10, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: "#FDE68A", alignItems: "center",
  },
  n8Title: { fontSize: 13, fontWeight: "600", color: "#92400E", marginBottom: 10 },
  n8Row: { flexDirection: "row", gap: 12, marginBottom: 8 },
  n8Note: { fontSize: 12, color: "#92400E", fontStyle: "italic", textAlign: "center" },

  card: {
    backgroundColor: "#F9FAFB", borderRadius: 10, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 10 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  stepNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#0891B2", color: "#FFF",
    fontSize: 12, fontWeight: "700",
    textAlign: "center", lineHeight: 22,
  },
  stepText: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 19 },

  powerAnswerRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  powerYesBtn: {
    flex: 1, backgroundColor: "#10B981", borderRadius: 12,
    padding: 16, alignItems: "center",
  },
  powerNoBtn: {
    flex: 1, backgroundColor: "#EF4444", borderRadius: 12,
    padding: 16, alignItems: "center",
  },
  powerBtnIcon:  { fontSize: 28, color: "#FFF", fontWeight: "700" },
  powerBtnTitle: { fontSize: 13, fontWeight: "700", color: "#FFF", marginTop: 4, textAlign: "center" },
  powerBtnSub:   { fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2, textAlign: "center" },

  // Refer
  referCard: {
    backgroundColor: "#FEF2F2", borderRadius: 12, padding: 20,
    alignItems: "center", marginBottom: 16, gap: 8,
    borderWidth: 2, borderColor: "#EF4444",
  },
  referTitle: { fontSize: 18, fontWeight: "700", color: "#991B1B" },
  referSubtitle: { fontSize: 14, color: "#7F1D1D", textAlign: "center", lineHeight: 20 },

  // Frame
  powerFoundCard: {
    backgroundColor: "#DCFCE7", borderRadius: 8, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14,
  },
  powerFoundText: { fontSize: 14, color: "#065F46" },

  frameBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#F9FAFB", borderRadius: 8, padding: 14,
    marginBottom: 10, borderWidth: 2, borderColor: "#E5E7EB",
  },
  frameBtnSelected: { borderColor: "#0891B2", backgroundColor: "#E0F7FF" },
  frameBtnText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  frameBtnDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#D1D5DB",
    alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  checkboxDone: { backgroundColor: "#0891B2", borderColor: "#0891B2" },
  checkboxLabel: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },

  nextBtn: {
    backgroundColor: "#0891B2", paddingVertical: 14, borderRadius: 10,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
    marginBottom: 16,
  },
  nextBtnText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  educationCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#F9FAFB", borderRadius: 8, padding: 12,
    marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#E5E7EB",
  },
  educationCardDone: { borderLeftColor: "#7C3AED" },
  eduTitle: { fontSize: 14, fontWeight: "600", color: "#1F2937", marginBottom: 2 },
  eduContent: { fontSize: 12, color: "#6B7280", lineHeight: 17 },

  // Recording
  recordCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#F9FAFB", borderRadius: 10, padding: 14,
    marginBottom: 12, borderWidth: 2, borderColor: "#E5E7EB",
  },
  recordCardDone: { borderColor: "#0891B2", backgroundColor: "#E0F7FF" },
  recordTitle: { fontSize: 14, fontWeight: "700", color: "#1F2937", marginBottom: 4 },
  recordDetail: { fontSize: 13, color: "#374151", lineHeight: 19 },

  // Finish
  finishBtn: {
    backgroundColor: "#10B981", paddingVertical: 16, borderRadius: 10,
    alignItems: "center", marginBottom: 16,
  },
  finishBtnDisabled: { backgroundColor: "#E5E7EB" },
  finishBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },

  // Sticky footer
  footer: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerBtnGreen: {
    backgroundColor: "#10B981",
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  footerBtnRed: {
    backgroundColor: "#DC2626",
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  footerBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  footerBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
  footerBtnTextDisabled: {
    color: "#9CA3AF",
  },
});
