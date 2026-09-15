/**
 * VisionScreen6 — Step 6: Simple Near Vision Test
 *
 * MOH Manual spec (Section 5, Step 6):
 *  - Test BOTH EYES at the same time (no covering)
 *  - Client holds E-chart at arm's length (~40 cm)
 *  - Ask client to read row N8 (bottom row of E-chart — smallest E's)
 *  - The N8 row uses the same Tumbling E chart — 5 letters, one at a time
 *  - If client wears spectacles for ONLY near (reading), ask them to put on
 *    the glasses for this test
 *
 *  Pass logic:
 *    - Can correctly identify the N8 E directions → PASS → end visit (normal)
 *    - Cannot → FAIL
 *      - Age 6-39: REFER to health facility
 *      - Age 40+: REFER + proceed to Step 7 (dispense reading glasses)
 *
 *  This component calls onComplete(passed: boolean) which is handled by
 *  VisionScreen6Wrapper (navigation to NormalFindings / VHTReadingGlasses /
 *  CreateReferralScreen).
 *
 *  The N8 row has 5 letters — client must identify ≥4 to pass (same
 *  standard as Line 2 of the distance test, consistent with manual).
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

const { width } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────
type EDirection = "right" | "down" | "left" | "up";
type Phase = "instructions" | "testing" | "result";

// ─── Constants ────────────────────────────────────────────────────────────────
const N8_COUNT = 5;     // N8 row has 5 letters
const N8_PASS = 4;      // need ≥4 correct to pass

const DIRECTIONS: EDirection[] = ["right", "down", "left", "up"];

function randomDirection(prev?: EDirection): EDirection {
  let dir: EDirection;
  do {
    dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
  } while (dir === prev);
  return dir;
}

function generateSequence(count: number): EDirection[] {
  const seq: EDirection[] = [];
  for (let i = 0; i < count; i++) {
    seq.push(randomDirection(seq[i - 1]));
  }
  return seq;
}

// ─── Block E ─────────────────────────────────────────────────────────────────
function BlockE({ direction, size }: { direction: EDirection; size: number }) {
  const t = Math.round(size / 5);
  const deg =
    direction === "right" ? "0deg"
    : direction === "down" ? "90deg"
    : direction === "left" ? "180deg"
    : "270deg";

  return (
    <View style={{ transform: [{ rotate: deg }] }}>
      <View style={{ width: size, height: size }}>
        <View style={{ position: "absolute", left: 0, top: 0, width: t, height: size, backgroundColor: "#0A0A0A" }} />
        <View style={{ position: "absolute", left: 0, top: 0, width: size, height: t, backgroundColor: "#0A0A0A" }} />
        <View style={{ position: "absolute", left: 0, top: Math.round((size - t) / 2), width: size - t, height: t, backgroundColor: "#0A0A0A" }} />
        <View style={{ position: "absolute", left: 0, bottom: 0, width: size, height: t, backgroundColor: "#0A0A0A" }} />
      </View>
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface VisionScreen6Props {
  clientAge: number;
  onComplete: (passed: boolean) => void;
  onRefer?: () => void;
}

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

      // All letters done
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
  const wrongSoFar = results.filter((r) => !r).length;
  const eSize = width * 0.28; // N8 is the smallest, so smaller than distance lines

  // ── Instructions phase ───────────────────────────────────────────────────
  if (phase === "instructions") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.stepTitle}>Step 6: Near Vision Test</Text>

          <View style={styles.badge}>
            <Ionicons name="document-text" size={16} color="#7C3AED" />
            <Text style={[styles.badgeText, { color: "#7C3AED" }]}>E-Chart • N8 Row • Both Eyes • 40 cm</Text>
          </View>

          {/* Prerequisites */}
          <View style={styles.prereqCard}>
            <Text style={styles.prereqTitle}>✅ Prerequisites confirmed:</Text>
            <View style={styles.prereqRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.prereqText}>Torch Light Test — Passed</Text>
            </View>
            <View style={styles.prereqRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.prereqText}>Distance Vision Test — Passed</Text>
            </View>
            <View style={styles.prereqRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.prereqText}>
                Client age: {age > 0 ? `${age} years (≥6)` : "Recorded"}
              </Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Test Instructions:</Text>

            <StepRow n="1" text="Both eyes open — do NOT cover either eye" />
            <StepRow n="2" text="Hand the E-chart to the client" />
            <StepRow n="3" text={"Say: \"Hold this chart at arm's length (about 40 cm from your eyes)\""} />
            <StepRow n="4" text={"Point to the N8 row (bottom row — smallest E's) and say: \"Tell me which way the legs of each E are pointing — Up, Down, Left, or Right\""} />
            <StepRow n="5" text="Make sure there is good lighting in the room" />
          </View>

          {/* Spectacles note */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color="#7C3AED" />
            <Text style={[styles.infoText, { color: "#5B21B6" }]}>
              If client wears spectacles for ONLY seeing close (reading glasses),
              ask them to put on their glasses for this test.
            </Text>
          </View>

          {/* N8 row preview */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 E-Chart — Near Vision (N8 row — bottom line):</Text>
            <Text style={styles.cardSubtitle}>
              These 5 small E's are shown one at a time during the test.
              Client must get ≥{N8_PASS} correct to pass.
            </Text>
            <View style={styles.chartPreview}>
              {(["right", "up", "left", "down", "right"] as EDirection[]).map((d, i) => (
                <BlockE key={i} direction={d} size={32} />
              ))}
            </View>
            <Text style={styles.n8Label}>N8 row (smallest — test this row)</Text>
          </View>

          {/* Pass criteria */}
          <View style={styles.pathwayContainer}>
            <View style={[styles.pathwayItem, { backgroundColor: "#F0FDF4", borderColor: "#10B981" }]}>
              <Text style={styles.pathwayText}>
                <Text style={styles.boldText}>✅ Pass (≥{N8_PASS} correct):</Text>
                {" "}Record "Y" in register — End visit. No glasses needed.
              </Text>
            </View>
            <View style={[styles.pathwayItem, { backgroundColor: "#EDE9FE", borderColor: "#7C3AED" }]}>
              <Text style={styles.pathwayText}>
                <Text style={styles.boldText}>⚠️ Fail + Age 40+:</Text>
                {" "}Record "N" — Presbyopia (normal aging). Proceed to dispense reading glasses.
              </Text>
            </View>
            <View style={[styles.pathwayItem, { backgroundColor: "#FEF2F2", borderColor: "#EF4444" }]}>
              <Text style={styles.pathwayText}>
                <Text style={styles.boldText}>❌ Fail + Age 6-39:</Text>
                {" "}Record "N" and "Y" under Referred — REFER to health facility.
              </Text>
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

  // ── Testing phase ────────────────────────────────────────────────────────
  if (phase === "testing") {
    const currentDirection = sequence[letterIndex];
    const remainingLetters = N8_COUNT - results.length - 1;
    const canStillPass = correctSoFar + remainingLetters + 1 >= N8_PASS;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />

        <View style={styles.testingContainer}>
          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(letterIndex / N8_COUNT) * 100}%`, backgroundColor: "#7C3AED" }]} />
          </View>

          {/* Status row */}
          <View style={styles.statusRow}>
            <View style={[styles.eyePill, { backgroundColor: "#7C3AED" }]}>
              <Text style={styles.eyePillText}>BOTH EYES</Text>
            </View>
            <Text style={styles.lineTag}>N8 row (40 cm)</Text>
            <Text style={styles.letterCount}>{letterIndex + 1} / {N8_COUNT}</Text>
          </View>

          {/* Score */}
          <View style={styles.scoreRow}>
            <View style={styles.scorePill}>
              <Text style={[styles.scorePillText, { color: "#10B981" }]}>✓ {correctSoFar}</Text>
            </View>
            <View style={styles.scorePill}>
              <Text style={[styles.scorePillText, { color: "#EF4444" }]}>✗ {wrongSoFar}</Text>
            </View>
            <Text style={styles.needText}>Need ≥{N8_PASS} correct</Text>
          </View>

          {/* The E */}
          <View style={styles.eDisplay}>
            <View style={styles.eWhiteBox}>
              <BlockE direction={currentDirection} size={eSize} />
            </View>
            <Text style={styles.distanceNote}>
              📏 Client holds chart at arm's length (~40 cm)
            </Text>
          </View>

          <Text style={styles.askText}>
            Ask: "Which way do the legs of the E point?"
          </Text>

          {/* Answer buttons */}
          <View style={styles.answerGrid}>
            <TouchableOpacity
              style={[styles.answerBtn, { backgroundColor: "#10B981" }]}
              onPress={() => recordAnswer(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.answerBtnIcon}>✓</Text>
              <Text style={styles.answerBtnText}>CORRECT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.answerBtn, { backgroundColor: "#EF4444" }]}
              onPress={() => recordAnswer(false)}
              activeOpacity={0.75}
            >
              <Text style={styles.answerBtnIcon}>✗</Text>
              <Text style={styles.answerBtnText}>WRONG</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cantSeeBtn} onPress={() => recordAnswer(false)} activeOpacity={0.75}>
            <Ionicons name="eye-off" size={18} color="#6B7280" />
            <Text style={styles.cantSeeBtnText}>Can't See / No Response</Text>
          </TouchableOpacity>

          {!canStillPass && (
            <View style={styles.earlyFailBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.earlyFailText}>
                Cannot reach {N8_PASS} correct — will fail near vision test
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── Result phase ─────────────────────────────────────────────────────────
  if (phase === "result") {
    const correctCount = results.filter(Boolean).length;
    const passed = testPassed === true;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Result card */}
          <View style={[styles.resultCard, passed ? styles.resultPass : styles.resultFail]}>
            <Text style={styles.resultTitle}>
              {passed ? "✅ Near Vision Test — PASSED" : "❌ Near Vision Test — FAILED"}
            </Text>

            {/* Letter-by-letter dots */}
            <View style={styles.resultLetters}>
              {results.map((ok, i) => (
                <View key={i} style={[styles.resultDot, ok ? styles.dotCorrect : styles.dotWrong]}>
                  <Text style={styles.resultDotText}>{ok ? "✓" : "✗"}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.resultScore, passed ? styles.passText : styles.failText]}>
              {correctCount}/{N8_COUNT} correct (need ≥{N8_PASS})
            </Text>
          </View>

          {/* Recording instruction */}
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

          {/* Pathway action card */}
          <View style={[styles.actionCard, passed ? styles.actionPass : (age >= 40 ? styles.actionPurple : styles.actionFail)]}>
            {passed ? (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.actionText}>
                  Client passed near vision test.{"\n"}
                  Conclude the visit. No glasses needed.{"\n"}
                  Proceed to record normal findings.
                </Text>
              </>
            ) : age >= 40 ? (
              <>
                <Ionicons name="glasses-outline" size={24} color="#7C3AED" />
                <Text style={styles.actionText}>
                  Client is {age} years old — near vision failure at 40+ is Presbyopia (normal aging).{"\n"}
                  Proceed to Step 7: Dispense Reading Glasses.
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="alert-circle" size={24} color="#DC2626" />
                <Text style={styles.actionText}>
                  Near vision problem in client aged {age} (under 40) is abnormal.{"\n"}
                  STOP and REFER to health facility for eye examination.
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.startBtn, {
              backgroundColor: passed ? "#2E7D32" : (age >= 40 ? "#7C3AED" : "#DC2626"),
            }]}
            onPress={() => onComplete(passed)}
          >
            <Text style={styles.startBtnText}>
              {passed
                ? "✅ Complete Screening"
                : age >= 40
                ? "👓 Proceed to Reading Glasses"
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

// ─── Shared sub-components ────────────────────────────────────────────────────
function Header({ userData, navigation }: any) {
  return (
    <View style={styles.header}>
      <View style={styles.logoBox}>
        <Image
          source={require("../../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>
          {userData?.fullName || userData?.full_name || "Santé Initiative Uganda"}
        </Text>
        <Text style={styles.headerSubtitle}>
          {userData?.district ? `VHT — ${userData.district} District` : ""}
        </Text>
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
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 44,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  badgeText: { fontSize: 13, fontWeight: "600", marginLeft: 6 },

  prereqCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  prereqTitle: { fontSize: 14, fontWeight: "700", color: "#065F46", marginBottom: 8 },
  prereqRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  prereqText: { fontSize: 13, color: "#065F46" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 },
  cardSubtitle: { fontSize: 13, color: "#6B7280", marginBottom: 12 },

  chartPreview: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    marginBottom: 6,
  },
  n8Label: { textAlign: "center", fontSize: 12, color: "#7C3AED", fontWeight: "600" },

  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  stepNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#7C3AED",
    justifyContent: "center", alignItems: "center",
    marginRight: 12, marginTop: 1,
  },
  stepNumText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  stepText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F5F3FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },

  pathwayContainer: { marginBottom: 20, gap: 8 },
  pathwayItem: {
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  pathwayText: { fontSize: 13, color: "#374151", lineHeight: 18 },
  boldText: { fontWeight: "700" },

  startBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  startBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },

  // ── Testing ──────────────────────────────────────────────────────────────
  testingContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  progressBar: { height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, overflow: "hidden", marginBottom: 14 },
  progressFill: { height: "100%", borderRadius: 3 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  eyePill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14 },
  eyePillText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  lineTag: { fontSize: 14, fontWeight: "600", color: "#374151" },
  letterCount: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  scoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
  scorePill: { backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  scorePillText: { fontSize: 14, fontWeight: "700" },
  needText: { fontSize: 12, color: "#6B7280", marginLeft: 4 },

  eDisplay: { alignItems: "center", justifyContent: "center", flex: 1, minHeight: 180 },
  eWhiteBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16, padding: 32,
    alignItems: "center", justifyContent: "center",
    elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
    borderWidth: 2, borderColor: "#E5E7EB",
  },
  distanceNote: {
    marginTop: 12, fontSize: 13, color: "#7C3AED",
    fontWeight: "500", textAlign: "center",
  },

  askText: {
    textAlign: "center", fontSize: 15,
    color: "#374151", fontStyle: "italic",
    marginVertical: 14, fontWeight: "500",
  },

  answerGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  answerBtn: { flex: 1, paddingVertical: 18, borderRadius: 14, alignItems: "center" },
  answerBtnIcon: { fontSize: 28, color: "#FFFFFF", fontWeight: "700" },
  answerBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", marginTop: 4 },

  cantSeeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 12, backgroundColor: "#F3F4F6",
    borderRadius: 10, gap: 8, marginBottom: 12,
  },
  cantSeeBtnText: { fontSize: 14, color: "#6B7280", fontWeight: "500" },

  earlyFailBanner: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FEF2F2", padding: 10, borderRadius: 8,
    gap: 6, borderWidth: 1, borderColor: "#FECACA",
  },
  earlyFailText: { flex: 1, fontSize: 13, color: "#DC2626" },

  // ── Result ───────────────────────────────────────────────────────────────
  resultCard: { borderRadius: 14, padding: 20, marginBottom: 16, borderWidth: 2 },
  resultPass: { backgroundColor: "#F0FDF4", borderColor: "#10B981" },
  resultFail: { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },
  resultTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 14 },
  resultLetters: { flexDirection: "row", gap: 8, marginBottom: 10 },
  resultDot: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  dotCorrect: { backgroundColor: "#10B981" },
  dotWrong: { backgroundColor: "#EF4444" },
  resultDotText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  resultScore: { fontSize: 15, fontWeight: "600" },
  passText: { color: "#10B981" },
  failText: { color: "#EF4444" },

  registerCard: {
    backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: "#E5E7EB",
  },
  registerTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 10 },
  registerRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
    paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  registerField: { fontSize: 13, color: "#6B7280" },
  registerValue: { fontSize: 14, fontWeight: "700" },

  actionCard: {
    flexDirection: "row", alignItems: "flex-start",
    borderRadius: 12, padding: 16, marginBottom: 20,
    gap: 12, borderWidth: 1,
  },
  actionPass: { backgroundColor: "#F0FDF4", borderColor: "#A7F3D0" },
  actionPurple: { backgroundColor: "#F5F3FF", borderColor: "#C4B5FD" },
  actionFail: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  actionText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },
});
