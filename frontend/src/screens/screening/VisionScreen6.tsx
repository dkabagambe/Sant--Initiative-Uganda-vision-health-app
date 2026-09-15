/**
 * VisionScreen6 — Step 6: Simple Near Vision Test
 *
 * MOH Manual spec (Section 5, Step 6):
 *  - Test BOTH EYES at the same time (no covering)
 *  - Client holds E-chart at arm's length (~40 cm)
 *  - Ask client to read row N8 (bottom row — smallest E's)
 *  - 5 letters shown one at a time
 *  - Pass: ≥4 correct (consistent with Line 2 of distance test)
 *  - If client wears reading glasses ONLY, put them on for this test
 *
 *  Pass → end visit (normal, no glasses needed)
 *  Fail + Age 6–39 → REFER
 *  Fail + Age 40+  → Step 7 (dispense reading glasses)
 *
 * Testing UI mirrors Peek Acuity: full-screen white, large SVG E,
 * cruciform arrow buttons.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";
import TumblingE, { EDirection } from "../../components/TumblingE";

const { width } = Dimensions.get("window");

// ─── Constants ────────────────────────────────────────────────────────────────
const N8_COUNT = 5;
const N8_PASS  = 4;   // ≥4/5 correct — consistent with Line 2 of distance test

const DIRECTIONS: EDirection[] = ["right", "down", "left", "up"];

function randomDirection(prev?: EDirection): EDirection {
  let dir: EDirection;
  do { dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]; }
  while (dir === prev);
  return dir;
}

function generateSequence(count: number): EDirection[] {
  const seq: EDirection[] = [];
  for (let i = 0; i < count; i++) seq.push(randomDirection(seq[i - 1]));
  return seq;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface VisionScreen6Props {
  clientAge: number;
  onComplete: (passed: boolean) => void;
  onRefer?: () => void;
}

type Phase = "instructions" | "testing" | "result";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VisionScreen6({ clientAge, onComplete, onRefer }: VisionScreen6Props) {
  const navigation = useNavigation<any>();
  const { screeningData } = useScreening();
  const [userData, setUserData] = useState<any>(null);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [sequence, setSequence] = useState<EDirection[]>([]);
  const [letterIndex, setLetterIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);

  React.useEffect(() => {
    apiService.getCurrentUser().then((u) => { if (u) setUserData(u); }).catch(() => {});
  }, []);

  const beginTest = useCallback(() => {
    setSequence(generateSequence(N8_COUNT));
    setLetterIndex(0);
    setResults([]);
    setPhase("testing");
  }, []);

  const recordAnswer = useCallback(
    (correct: boolean) => {
      const newResults = [...results, correct];
      const isLast = newResults.length === N8_COUNT;

      if (!isLast) {
        setResults(newResults);
        setLetterIndex((i) => i + 1);
        return;
      }

      const correctCount = newResults.filter(Boolean).length;
      const passed = correctCount >= N8_PASS;
      setResults(newResults);
      setTestPassed(passed);
      setPhase("result");
    },
    [results]
  );

  const age = clientAge > 0 ? clientAge : (Number(screeningData?.clientAge) || 0);
  const correctSoFar = results.filter(Boolean).length;
  const wrongSoFar   = results.filter((r) => !r).length;

  // N8 (near vision, held at 40 cm) → medium E, ~45% of screen width
  const eSize = Math.round(width * 0.45);

  // ── Instructions ─────────────────────────────────────────────────────────
  if (phase === "instructions") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.stepTitle}>Step 6: Near Vision Test</Text>

          <View style={styles.badge}>
            <Ionicons name="document-text" size={16} color="#7C3AED" />
            <Text style={[styles.badgeText, { color: "#7C3AED" }]}>E-Chart · N8 Row · Both Eyes · 40 cm</Text>
          </View>

          {/* Prerequisites */}
          <View style={styles.prereqCard}>
            <Text style={styles.prereqTitle}>✅ Prerequisites:</Text>
            {[
              "Torch Light Test — Passed",
              "Distance Vision Test — Passed",
              `Client age: ${age > 0 ? `${age} years (≥6)` : "Recorded"}`,
            ].map((t) => (
              <View key={t} style={styles.prereqRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.prereqText}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Test Instructions:</Text>
            <StepRow n="1" text="Both eyes open — do NOT cover either eye" />
            <StepRow n="2" text="Hand the E-chart to the client" />
            <StepRow n="3" text={'Say: "Hold this at arm\'s length (~40 cm from your eyes)"'} />
            <StepRow n="4" text="Point to the N8 row (bottom row — smallest E's)" />
            <StepRow n="5" text="Make sure there is good lighting" />
          </View>

          {/* Spectacles note */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color="#7C3AED" />
            <Text style={[styles.infoText, { color: "#5B21B6" }]}>
              If client wears spectacles for ONLY seeing close (reading glasses), ask them to put them on.
            </Text>
          </View>

          {/* N8 preview */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 N8 Row (near vision — bottom line):</Text>
            <Text style={styles.cardSubtitle}>5 E's shown one at a time. Client must get ≥{N8_PASS} correct.</Text>
            <View style={styles.n8Preview}>
              {(["right", "up", "left", "down", "right"] as EDirection[]).map((d, i) => (
                <TumblingE key={i} direction={d} size={32} />
              ))}
            </View>
            <Text style={styles.n8Label}>N8 row (smallest — test this row at 40 cm)</Text>
          </View>

          {/* Pathway */}
          <View style={styles.pathwayContainer}>
            <View style={[styles.pathwayItem, { backgroundColor: "#F0FDF4", borderColor: "#10B981" }]}>
              <Text style={styles.pathwayText}><Text style={styles.bold}>✅ Pass (≥{N8_PASS}/5):</Text> Record "Y" — End visit normally.</Text>
            </View>
            <View style={[styles.pathwayItem, { backgroundColor: "#EDE9FE", borderColor: "#7C3AED" }]}>
              <Text style={styles.pathwayText}><Text style={styles.bold}>⚠️ Fail + Age 40+:</Text> Presbyopia (normal aging) — proceed to Step 7: Dispense reading glasses.</Text>
            </View>
            <View style={[styles.pathwayItem, { backgroundColor: "#FEF2F2", borderColor: "#EF4444" }]}>
              <Text style={styles.pathwayText}><Text style={styles.bold}>❌ Fail + Age 6–39:</Text> Record "N" and "Y" under Referred — REFER to health facility.</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.startBtn, { backgroundColor: "#7C3AED" }]} onPress={beginTest}>
            <Text style={styles.startBtnText}>Start Near Vision Test →</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Testing — full screen ─────────────────────────────────────────────────
  if (phase === "testing") {
    const currentDirection = sequence[letterIndex];
    const remainingLetters = N8_COUNT - results.length - 1;
    const canStillPass = correctSoFar + remainingLetters + 1 >= N8_PASS;

    return (
      <SafeAreaView style={styles.testContainer}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

        {/* Top bar */}
        <View style={styles.testTopBar}>
          <View style={[styles.eyePill, { backgroundColor: "#7C3AED" }]}>
            <Text style={styles.eyePillText}>BOTH EYES</Text>
          </View>

          <Text style={styles.lineTag}>N8 row (40 cm)</Text>

          {/* Progress dots */}
          <View style={styles.progressDots}>
            {Array.from({ length: N8_COUNT }).map((_, i) => {
              const answered = i < results.length;
              const correct  = answered && results[i];
              const wrong    = answered && !results[i];
              const current  = i === results.length;
              return (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    correct  && styles.dotCorrect,
                    wrong    && styles.dotWrong,
                    current  && styles.dotCurrent,
                    !answered && !current && styles.dotPending,
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Score strip */}
        <View style={styles.scoreStrip}>
          <Text style={styles.scoreCorrect}>✓ {correctSoFar} correct</Text>
          <Text style={styles.scoreNeed}>need ≥{N8_PASS}</Text>
          <Text style={styles.scoreWrong}>✗ {wrongSoFar} wrong</Text>
        </View>

        {/* Distance reminder */}
        <View style={styles.distanceReminder}>
          <Ionicons name="resize-outline" size={14} color="#7C3AED" />
          <Text style={styles.distanceReminderText}>Client holds chart at arm's length (~40 cm)</Text>
        </View>

        {/* The E */}
        <View style={styles.eCanvas}>
          <TumblingE direction={currentDirection} size={eSize} color="#111111" />
        </View>

        <Text style={styles.promptText}>Ask: "Which way do the legs of the E point?"</Text>

        {/* Arrow buttons */}
        <View style={styles.arrowGrid}>
          <View style={styles.arrowRow}>
            <ArrowBtn direction="up"    color="#7C3AED" onPress={() => recordAnswer(sequence[letterIndex] === "up")} />
          </View>
          <View style={styles.arrowRow}>
            <ArrowBtn direction="left"  color="#7C3AED" onPress={() => recordAnswer(sequence[letterIndex] === "left")} />
            <CantSeeBtn                                  onPress={() => recordAnswer(false)} />
            <ArrowBtn direction="right" color="#7C3AED" onPress={() => recordAnswer(sequence[letterIndex] === "right")} />
          </View>
          <View style={styles.arrowRow}>
            <ArrowBtn direction="down"  color="#7C3AED" onPress={() => recordAnswer(sequence[letterIndex] === "down")} />
          </View>
        </View>

        {!canStillPass && (
          <View style={styles.earlyFailBanner}>
            <Ionicons name="alert-circle" size={15} color="#DC2626" />
            <Text style={styles.earlyFailText}>Cannot reach {N8_PASS} correct — will fail near vision</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (phase === "result") {
    const correctCount = results.filter(Boolean).length;
    const passed = testPassed === true;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.resultCard, passed ? styles.resultPass : styles.resultFail]}>
            <Text style={styles.resultTitle}>
              {passed ? "✅ Near Vision Test — PASSED" : "❌ Near Vision Test — FAILED"}
            </Text>

            <View style={styles.resultLetters}>
              {results.map((ok, i) => (
                <View key={i} style={[styles.resultDot, ok ? styles.dotCorrectBig : styles.dotWrongBig]}>
                  <Text style={styles.resultDotText}>{ok ? "✓" : "✗"}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.resultScore, passed ? styles.passText : styles.failText]}>
              {correctCount}/{N8_COUNT} correct (need ≥{N8_PASS})
            </Text>
          </View>

          {/* Register recording */}
          <View style={styles.registerCard}>
            <Text style={styles.registerTitle}>📝 Record in VHT Register:</Text>
            <View style={styles.registerRow}>
              <Text style={styles.registerField}>Near Vision Test — Pass?</Text>
              <Text style={[styles.registerValue, passed ? styles.passText : styles.failText]}>
                {passed ? '"Y"' : '"N"'}
              </Text>
            </View>
            {!passed && (
              <View style={styles.registerRow}>
                <Text style={styles.registerField}>Referred?</Text>
                <Text style={[styles.registerValue, { color: "#EF4444" }]}>"Y"</Text>
              </View>
            )}
          </View>

          {/* Action */}
          <View style={[
            styles.actionCard,
            passed ? styles.actionPass : (age >= 40 ? styles.actionPurple : styles.actionFail),
          ]}>
            {passed ? (
              <><Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.actionText}>Client passed. Conclude the visit. No glasses needed.</Text></>
            ) : age >= 40 ? (
              <><Ionicons name="glasses-outline" size={24} color="#7C3AED" />
                <Text style={styles.actionText}>Client is {age} — near vision failure at 40+ is Presbyopia (normal aging).{"\n"}Proceed to Step 7: Dispense Reading Glasses.</Text></>
            ) : (
              <><Ionicons name="alert-circle" size={24} color="#DC2626" />
                <Text style={styles.actionText}>Near vision problem in client aged {age} (under 40) is abnormal.{"\n"}STOP and REFER to health facility.</Text></>
            )}
          </View>

          <TouchableOpacity
            style={[styles.startBtn, {
              backgroundColor: passed ? "#2E7D32" : (age >= 40 ? "#7C3AED" : "#DC2626"),
            }]}
            onPress={() => onComplete(passed)}
          >
            <Text style={styles.startBtnText}>
              {passed ? "✅ Complete Screening"
                : age >= 40 ? "👓 Proceed to Reading Glasses"
                : "🏥 Create Referral"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

// ─── Arrow button ─────────────────────────────────────────────────────────────
function ArrowBtn({ direction, color = "#1565C0", onPress }: {
  direction: EDirection; color?: string; onPress: () => void;
}) {
  const icon =
    direction === "up" ? "arrow-up" :
    direction === "down" ? "arrow-down" :
    direction === "left" ? "arrow-back" : "arrow-forward";

  return (
    <TouchableOpacity
      style={[styles.arrowBtn, { borderColor: color + "44", backgroundColor: color + "11" }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon as any} size={36} color={color} />
      <Text style={[styles.arrowBtnLabel, { color }]}>
        {direction === "up" ? "Up" : direction === "down" ? "Down" : direction === "left" ? "Left" : "Right"}
      </Text>
    </TouchableOpacity>
  );
}

function CantSeeBtn({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.cantSeeBtn} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="eye-off" size={22} color="#9CA3AF" />
      <Text style={styles.cantSeeBtnLabel}>Can't{"\n"}See</Text>
    </TouchableOpacity>
  );
}

function Header({ userData, navigation }: any) {
  return (
    <View style={styles.header}>
      <View style={styles.logoBox}>
        <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{userData?.fullName || userData?.full_name || "Santé Initiative Uganda"}</Text>
        <Text style={styles.headerSubtitle}>{userData?.district ? `VHT — ${userData.district} District` : ""}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.menuBtn}>
        <Ionicons name="menu" size={28} color="#1A4D8F" />
      </TouchableOpacity>
    </View>
  );
}

function StepRow({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNum}><Text style={styles.stepNumText}>{n}</Text></View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF",
    paddingHorizontal: 16, paddingVertical: 12, paddingTop: 44,
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
    elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  logoBox: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  logo: { width: 40, height: 40 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  headerSubtitle: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  menuBtn: { width: 44, alignItems: "flex-end" },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  stepTitle: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 8 },

  badge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F5F3FF", paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, alignSelf: "flex-start", marginBottom: 16,
  },
  badgeText: { fontSize: 13, fontWeight: "600", marginLeft: 6 },

  prereqCard: {
    backgroundColor: "#F0FDF4", borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: "#A7F3D0",
  },
  prereqTitle: { fontSize: 14, fontWeight: "700", color: "#065F46", marginBottom: 8 },
  prereqRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  prereqText: { fontSize: 13, color: "#065F46" },

  card: {
    backgroundColor: "#FFFFFF", borderRadius: 12, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: "#E5E7EB",
    elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 },
  cardSubtitle: { fontSize: 13, color: "#6B7280", marginBottom: 12 },

  n8Preview: {
    flexDirection: "row", justifyContent: "space-around",
    paddingVertical: 12, backgroundColor: "#FAFAFA",
    borderRadius: 8, marginBottom: 6,
  },
  n8Label: { textAlign: "center", fontSize: 12, color: "#7C3AED", fontWeight: "600" },

  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  stepNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: "#7C3AED",
    justifyContent: "center", alignItems: "center", marginRight: 12, marginTop: 1,
  },
  stepNumText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  stepText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },

  infoBox: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: "#F5F3FF", padding: 12, borderRadius: 10, marginBottom: 16, gap: 8,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },

  pathwayContainer: { marginBottom: 20, gap: 8 },
  pathwayItem: { padding: 12, borderRadius: 10, borderWidth: 1 },
  pathwayText: { fontSize: 13, color: "#374151", lineHeight: 18 },
  bold: { fontWeight: "700" },

  startBtn: { paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  startBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },

  // ── Testing ──────────────────────────────────────────────────────────────
  testContainer: { flex: 1, backgroundColor: "#FFFFFF" },

  testTopBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10, paddingTop: 14,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  eyePill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14 },
  eyePillText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  lineTag: { fontSize: 13, fontWeight: "600", color: "#374151" },

  progressDots: { flexDirection: "row", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotCorrect: { backgroundColor: "#10B981" },
  dotWrong:   { backgroundColor: "#EF4444" },
  dotCurrent: { backgroundColor: "#7C3AED" },
  dotPending: { backgroundColor: "#D1D5DB" },

  scoreStrip: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, paddingVertical: 6, backgroundColor: "#F9FAFB",
  },
  scoreCorrect: { fontSize: 13, fontWeight: "700", color: "#10B981" },
  scoreNeed:    { fontSize: 12, color: "#6B7280" },
  scoreWrong:   { fontSize: 13, fontWeight: "700", color: "#EF4444" },

  distanceReminder: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 4, paddingVertical: 4, backgroundColor: "#F5F3FF",
  },
  distanceReminderText: { fontSize: 12, color: "#7C3AED", fontWeight: "500" },

  eCanvas: {
    flex: 1, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center",
  },

  promptText: {
    textAlign: "center", fontSize: 15, color: "#6B7280",
    fontStyle: "italic", fontWeight: "500",
    paddingHorizontal: 24, marginBottom: 12,
  },

  arrowGrid: { paddingHorizontal: 16, paddingBottom: 16, gap: 0 },
  arrowRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 },

  arrowBtn: {
    width: 80, height: 80, borderRadius: 16,
    borderWidth: 2, justifyContent: "center", alignItems: "center", gap: 4,
  },
  arrowBtnLabel: { fontSize: 11, fontWeight: "700" },

  cantSeeBtn: {
    width: 80, height: 80, borderRadius: 16,
    borderWidth: 2, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB",
    justifyContent: "center", alignItems: "center", gap: 4,
  },
  cantSeeBtnLabel: { fontSize: 10, fontWeight: "600", color: "#9CA3AF", textAlign: "center" },

  earlyFailBanner: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FEF2F2", padding: 8, margin: 12, borderRadius: 8,
    gap: 6, borderWidth: 1, borderColor: "#FECACA",
  },
  earlyFailText: { flex: 1, fontSize: 12, color: "#DC2626" },

  // ── Result ───────────────────────────────────────────────────────────────
  resultCard: { borderRadius: 14, padding: 20, marginBottom: 16, borderWidth: 2 },
  resultPass: { backgroundColor: "#F0FDF4", borderColor: "#10B981" },
  resultFail: { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },
  resultTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 14 },

  resultLetters: { flexDirection: "row", gap: 8, marginBottom: 10 },
  resultDot: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  dotCorrectBig: { backgroundColor: "#10B981" },
  dotWrongBig:   { backgroundColor: "#EF4444" },
  resultDotText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  resultScore: { fontSize: 15, fontWeight: "600" },
  passText: { color: "#10B981" },
  failText: { color: "#EF4444" },

  registerCard: {
    backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  registerTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 10 },
  registerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 6, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  registerField: { fontSize: 13, color: "#6B7280" },
  registerValue: { fontSize: 14, fontWeight: "700" },

  actionCard: {
    flexDirection: "row", alignItems: "flex-start", borderRadius: 12,
    padding: 16, marginBottom: 20, gap: 12, borderWidth: 1,
  },
  actionPass:   { backgroundColor: "#F0FDF4", borderColor: "#A7F3D0" },
  actionPurple: { backgroundColor: "#F5F3FF", borderColor: "#C4B5FD" },
  actionFail:   { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  actionText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },
});
