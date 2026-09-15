/**
 * VisionScreen5 — Step 5: Simple Distance Vision Test
 *
 * MOH Manual spec (Section 5, Step 5):
 *  - E-chart top two lines only for distance vision
 *  - Client must be 3 metres from chart
 *  - Test one eye at a time (cover the other eye)
 *  - Line 1 (6/60): 3 letters — show one at a time, random direction
 *      Pass: ≥2 correct  → proceed to Line 2
 *      Fail: ≤1 correct  → STOP and REFER
 *  - Line 2 (6/12): 5 letters — show one at a time, random direction
 *      Pass: ≥4 correct  → Eye passes, test other eye / complete
 *      Fail: ≤3 correct  → STOP and REFER
 *  - Repeat for both RIGHT and LEFT eye
 *  - If wearing distance spectacles, keep them on
 *
 * Testing UI mirrors Peek Acuity:
 *  - Full-screen pure-white background
 *  - SVG Tumbling E occupies ~65% of screen width
 *  - Large arrow direction buttons at the bottom
 *  - Minimal chrome during the test — the E is the only focus
 */

import React, { useState, useEffect, useCallback } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import TumblingE, { EDirection } from "../../components/TumblingE";

const { width, height } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────────────────────
type Eye = "right" | "left";
type Line = 1 | 2;
type Phase =
  | "instructions"
  | "testing"
  | "eye_result"
  | "final_result";

// ─── Constants ───────────────────────────────────────────────────────────────
const DIRECTIONS: EDirection[] = ["right", "down", "left", "up"];
const LINE1_COUNT = 3;
const LINE2_COUNT = 5;
const LINE1_PASS = 2;
const LINE2_PASS = 4;

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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DistanceVisionTestScreen() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const [userData, setUserData] = useState<any>(null);

  const [currentEye, setCurrentEye] = useState<Eye>("right");
  const [eyeResults, setEyeResults] = useState<
    Record<Eye, { line1: boolean[]; line2: boolean[] } | null>
  >({ right: null, left: null });

  const [phase, setPhase] = useState<Phase>("instructions");
  const [currentLine, setCurrentLine] = useState<Line>(1);
  const [sequence, setSequence] = useState<EDirection[]>([]);
  const [letterIndex, setLetterIndex] = useState(0);
  const [lineResults, setLineResults] = useState<boolean[]>([]);
  const [savedLine1Results, setSavedLine1Results] = useState<boolean[]>([]);

  useEffect(() => {
    apiService.getCurrentUser().then((u) => { if (u) setUserData(u); }).catch(() => {});
  }, []);

  const startEye = useCallback((eye: Eye) => {
    setCurrentEye(eye);
    setPhase("instructions");
    setCurrentLine(1);
    setLetterIndex(0);
    setLineResults([]);
    setSavedLine1Results([]);
  }, []);

  const beginTest = useCallback(() => {
    setSequence(generateSequence(LINE1_COUNT));
    setLetterIndex(0);
    setLineResults([]);
    setCurrentLine(1);
    setPhase("testing");
  }, []);

  const recordAnswer = useCallback(
    (correct: boolean) => {
      const newResults = [...lineResults, correct];
      const totalLetters = currentLine === 1 ? LINE1_COUNT : LINE2_COUNT;
      const isLastLetter = newResults.length === totalLetters;

      if (!isLastLetter) {
        setLineResults(newResults);
        setLetterIndex((i) => i + 1);
        return;
      }

      const correctCount = newResults.filter(Boolean).length;
      const passThreshold = currentLine === 1 ? LINE1_PASS : LINE2_PASS;
      const linePassed = correctCount >= passThreshold;

      if (currentLine === 1) {
        if (!linePassed) {
          setEyeResults((prev) => ({ ...prev, [currentEye]: { line1: newResults, line2: [] } }));
          setPhase("eye_result");
        } else {
          setSavedLine1Results(newResults);
          setSequence(generateSequence(LINE2_COUNT));
          setLetterIndex(0);
          setLineResults([]);
          setCurrentLine(2);
        }
      } else {
        setEyeResults((prev) => ({ ...prev, [currentEye]: { line1: savedLine1Results, line2: newResults } }));
        setPhase("eye_result");
      }
    },
    [lineResults, currentLine, currentEye, savedLine1Results]
  );

  const handleEyeResultNext = useCallback(async () => {
    const result = eyeResults[currentEye];
    const line2Correct = result?.line2.filter(Boolean).length ?? 0;
    const line1Correct = result?.line1.filter(Boolean).length ?? 0;
    const eyePassed =
      line1Correct >= LINE1_PASS &&
      (result?.line2.length ?? 0) > 0 &&
      line2Correct >= LINE2_PASS;

    if (!eyePassed) {
      await handleFail(currentEye, result);
      return;
    }
    if (currentEye === "right") {
      startEye("left");
    } else {
      setPhase("final_result");
    }
  }, [currentEye, eyeResults, startEye]);

  const handleFail = async (eye: Eye, result: any) => {
    const line1c = result?.line1.filter(Boolean).length ?? 0;
    const line2c = result?.line2.filter(Boolean).length ?? 0;
    const failDetail =
      result?.line2.length > 0
        ? `Line 1: ${line1c}/${LINE1_COUNT}, Line 2: ${line2c}/${LINE2_COUNT}`
        : `Line 1: ${line1c}/${LINE1_COUNT} (failed, did not proceed to line 2)`;

    const eyeLabel = eye === "right" ? "Right" : "Left";
    const reasonText = `${eyeLabel} eye failed distance vision test. ${failDetail}`;

    const referralData = {
      ...screeningData,
      distanceVisionRight: eye === "right"
        ? `Line1: ${line1c}/${LINE1_COUNT}, Line2: ${line2c}/${LINE2_COUNT}`
        : (screeningData.distanceVisionRight || "not_tested"),
      distanceVisionLeft: eye === "left"
        ? `Line1: ${line1c}/${LINE1_COUNT}, Line2: ${line2c}/${LINE2_COUNT}`
        : (screeningData.distanceVisionLeft || "not_tested"),
      distanceVisionResult: "failed",
      nearVisionResult: "not_tested",
      needsReferral: true,
      needsGlasses: false,
      referralReason: reasonText,
      referralUrgency: "normal",
      referralStep: "Step 5 - Distance Vision Test",
    };

    updateScreeningData(referralData);

    let savedScreeningId: string | null = null;
    try {
      const res = await apiService.createScreening(referralData);
      if (res.success) savedScreeningId = res.data?.id || res.screeningId || null;
    } catch {
      try {
        const q = await AsyncStorage.getItem("offlineScreenings");
        const queue = q ? JSON.parse(q) : [];
        queue.push({ ...referralData, offlineId: Date.now().toString(), timestamp: new Date().toISOString() });
        await AsyncStorage.setItem("offlineScreenings", JSON.stringify(queue));
      } catch {}
    }

    const params = {
      fromScreening: true,
      screeningId: savedScreeningId,
      clientName: screeningData.clientName || "",
      clientPhone: screeningData.clientPhone || "",
      clientAge: screeningData.clientAge || "",
      clientSex: screeningData.clientGender || "",
      district: screeningData.district || "",
      county: screeningData.county || "",
      subCounty: screeningData.subCounty || "",
      parish: screeningData.parish || "",
      reason: reasonText,
      urgency: "normal",
      notes: `Referred from Step 5 — Distance Vision Test.\n${eyeLabel} eye failed.\n${failDetail}`,
    };

    const root = navigation.getParent()?.getParent()?.getParent();
    if (root) root.navigate("CreateReferralScreen", params);
    else {
      const parent = navigation.getParent()?.getParent();
      if (parent) parent.navigate("CreateReferralScreen", params);
      else navigation.navigate("CreateReferralScreen" as any, params);
    }
  };

  const handleBothEyesPassed = () => {
    const rResult = eyeResults.right;
    const lResult = eyeResults.left;
    updateScreeningData({
      distanceVisionRight: `Line1: ${rResult?.line1.filter(Boolean).length}/${LINE1_COUNT}, Line2: ${rResult?.line2.filter(Boolean).length}/${LINE2_COUNT}`,
      distanceVisionLeft: `Line1: ${lResult?.line1.filter(Boolean).length}/${LINE1_COUNT}, Line2: ${lResult?.line2.filter(Boolean).length}/${LINE2_COUNT}`,
      distanceVisionResult: "passed",
    });
    navigation.navigate("VisionScreen6");
  };

  const eyeLabel = currentEye === "right" ? "RIGHT" : "LEFT";
  const coverEye = currentEye === "right" ? "LEFT" : "RIGHT";

  // ── Phase: Instructions ──────────────────────────────────────────────────
  if (phase === "instructions") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.stepTitle}>Step 5: Distance Vision Test</Text>

          <View style={styles.badge}>
            <Ionicons name="eye" size={16} color="#1565C0" />
            <Text style={styles.badgeText}>E-Chart · 3 Metres · Ages 6+</Text>
          </View>

          <View style={[styles.eyeBadge, { backgroundColor: currentEye === "right" ? "#1565C0" : "#6A1B9A" }]}>
            <Text style={styles.eyeBadgeText}>
              {currentEye === "right" ? "1st" : "2nd"}: Testing {eyeLabel} EYE 👁️
            </Text>
          </View>

          {/* Setup */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚙️ Set Up:</Text>
            <StepRow n="1" text="Stand exactly 3 metres away from the client" />
            <StepRow n="2" text={`Ask client to cover their ${coverEye} eye gently with palm`} />
            <StepRow n="3" text="Hold E-chart at client's eye level" />
            <StepRow n="4" text='"Tell me which way the legs of the E are pointing — Up, Down, Left, or Right."' />
          </View>

          {/* Direction key preview using SVG TumblingE */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 E Direction Key:</Text>
            <View style={styles.directionDemo}>
              {(["right", "up", "left", "down"] as EDirection[]).map((d) => (
                <View key={d} style={styles.directionItem}>
                  <View style={styles.directionEBox}>
                    <TumblingE direction={d} size={40} />
                  </View>
                  <Text style={styles.directionLabel}>
                    {d === "right" ? "Right" : d === "left" ? "Left" : d === "up" ? "Up" : "Down"}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Chart preview */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 E-Chart — top 2 lines:</Text>
            <View style={styles.chartPreviewRow}>
              <Text style={styles.chartLineLabel}>Line 1{"\n"}6/60</Text>
              <View style={styles.chartEs}>
                <TumblingE direction="right" size={56} />
                <TumblingE direction="down"  size={56} />
                <TumblingE direction="left"  size={56} />
              </View>
              <Text style={styles.chartPassNote}>≥2/3{"\n"}to pass</Text>
            </View>
            <View style={styles.chartDivider} />
            <View style={[styles.chartPreviewRow, { marginTop: 12 }]}>
              <Text style={styles.chartLineLabel}>Line 2{"\n"}6/12</Text>
              <View style={styles.chartEs}>
                <TumblingE direction="right" size={34} />
                <TumblingE direction="up"    size={34} />
                <TumblingE direction="down"  size={34} />
                <TumblingE direction="left"  size={34} />
                <TumblingE direction="right" size={34} />
              </View>
              <Text style={styles.chartPassNote}>≥4/5{"\n"}to pass</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color="#1565C0" />
            <Text style={styles.infoText}>
              If client wears spectacles for distance (not reading only), keep them on during this test.
            </Text>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={beginTest}>
            <Text style={styles.startBtnText}>Start Testing {eyeLabel} Eye →</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Phase: Testing — Full-screen Peek-style ──────────────────────────────
  if (phase === "testing") {
    const totalLetters = currentLine === 1 ? LINE1_COUNT : LINE2_COUNT;
    const passThreshold = currentLine === 1 ? LINE1_PASS : LINE2_PASS;
    const currentDirection = sequence[letterIndex];
    const correctSoFar = lineResults.filter(Boolean).length;
    const wrongSoFar = lineResults.filter((r) => !r).length;

    // Line 1 (6/60) → large E (~65% screen width)
    // Line 2 (6/12) → smaller E (~42% screen width)
    const eSize = currentLine === 1
      ? Math.round(width * 0.65)
      : Math.round(width * 0.42);

    const remainingLetters = totalLetters - lineResults.length - 1;
    const canStillPass = correctSoFar + remainingLetters + 1 >= passThreshold;

    return (
      <SafeAreaView style={styles.testContainer}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

        {/* ── Top strip — minimal info ─────────────────────────────────── */}
        <View style={styles.testTopBar}>
          <View style={[styles.eyePill, { backgroundColor: currentEye === "right" ? "#1565C0" : "#6A1B9A" }]}>
            <Text style={styles.eyePillText}>{eyeLabel} EYE</Text>
          </View>

          <Text style={styles.lineTag}>
            Line {currentLine}  ({currentLine === 1 ? "6/60" : "6/12"})
          </Text>

          {/* Letter progress dots */}
          <View style={styles.progressDots}>
            {Array.from({ length: totalLetters }).map((_, i) => {
              const answered = i < lineResults.length;
              const correct  = answered && lineResults[i];
              const wrong    = answered && !lineResults[i];
              const current  = i === lineResults.length;
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

        {/* ── Score strip ─────────────────────────────────────────────── */}
        <View style={styles.scoreStrip}>
          <Text style={styles.scoreCorrect}>✓ {correctSoFar} correct</Text>
          <Text style={styles.scoreNeed}>need ≥{passThreshold}</Text>
          <Text style={styles.scoreWrong}>✗ {wrongSoFar} wrong</Text>
        </View>

        {/* ── THE E — full white canvas ─────────────────────────────── */}
        <View style={styles.eCanvas}>
          <TumblingE direction={currentDirection} size={eSize} color="#111111" />
        </View>

        {/* ── Prompt ────────────────────────────────────────────────── */}
        <Text style={styles.promptText}>
          Ask: "Which way do the legs point?"
        </Text>

        {/* ── Direction answer buttons (arrow style) ───────────────── */}
        <View style={styles.arrowGrid}>
          {/* Up */}
          <View style={styles.arrowRow}>
            <ArrowBtn direction="up"    onPress={() => recordAnswer(sequence[letterIndex] === "up")} />
          </View>
          {/* Left / Can't see / Right */}
          <View style={styles.arrowRow}>
            <ArrowBtn direction="left"  onPress={() => recordAnswer(sequence[letterIndex] === "left")} />
            <CantSeeBtn                 onPress={() => recordAnswer(false)} />
            <ArrowBtn direction="right" onPress={() => recordAnswer(sequence[letterIndex] === "right")} />
          </View>
          {/* Down */}
          <View style={styles.arrowRow}>
            <ArrowBtn direction="down"  onPress={() => recordAnswer(sequence[letterIndex] === "down")} />
          </View>
        </View>

        {/* ── Early fail warning ───────────────────────────────────── */}
        {!canStillPass && (
          <View style={styles.earlyFailBanner}>
            <Ionicons name="alert-circle" size={15} color="#DC2626" />
            <Text style={styles.earlyFailText}>
              Cannot reach {passThreshold} correct — eye will fail this line
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ── Phase: Eye Result ───────────────────────────────────────────────────
  if (phase === "eye_result") {
    const result = eyeResults[currentEye];
    const line1Correct = result?.line1.filter(Boolean).length ?? 0;
    const line2Correct = result?.line2.filter(Boolean).length ?? 0;
    const line1Done = (result?.line1.length ?? 0) > 0;
    const line2Done = (result?.line2.length ?? 0) > 0;
    const line1Passed = line1Correct >= LINE1_PASS;
    const line2Passed = line2Correct >= LINE2_PASS;
    const eyePassed = line1Passed && line2Done && line2Passed;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />

        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={[styles.resultCard, eyePassed ? styles.resultPass : styles.resultFail]}>
            <Text style={styles.resultEyeLabel}>{eyeLabel} EYE — {eyePassed ? "✅ PASSED" : "❌ FAILED"}</Text>

            <View style={styles.resultLineRow}>
              <Text style={styles.resultLineTitle}>Line 1 (6/60) — 3 letters</Text>
              <View style={styles.resultLetters}>
                {result?.line1.map((ok, i) => (
                  <View key={i} style={[styles.resultDot, ok ? styles.dotCorrectBig : styles.dotWrongBig]}>
                    <Text style={styles.resultDotText}>{ok ? "✓" : "✗"}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.resultLineSummary, line1Passed ? styles.passText : styles.failText]}>
                {line1Correct}/{LINE1_COUNT} correct — {line1Passed ? `PASS (≥${LINE1_PASS})` : `FAIL (<${LINE1_PASS})`}
              </Text>
            </View>

            {line2Done ? (
              <View style={styles.resultLineRow}>
                <Text style={styles.resultLineTitle}>Line 2 (6/12) — 5 letters</Text>
                <View style={styles.resultLetters}>
                  {result?.line2.map((ok, i) => (
                    <View key={i} style={[styles.resultDot, ok ? styles.dotCorrectBig : styles.dotWrongBig]}>
                      <Text style={styles.resultDotText}>{ok ? "✓" : "✗"}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.resultLineSummary, line2Passed ? styles.passText : styles.failText]}>
                  {line2Correct}/{LINE2_COUNT} correct — {line2Passed ? `PASS (≥${LINE2_PASS})` : `FAIL (<${LINE2_PASS})`}
                </Text>
              </View>
            ) : (
              <View style={styles.resultLineRow}>
                <Text style={styles.resultLineTitle}>Line 2 (6/12)</Text>
                <Text style={styles.skippedText}>Not tested (failed line 1)</Text>
              </View>
            )}
          </View>

          <View style={styles.actionCard}>
            {eyePassed && currentEye === "right" ? (
              <><Ionicons name="checkmark-circle" size={24} color="#10B981" /><Text style={styles.actionText}>Right eye passed. Now test the LEFT eye.</Text></>
            ) : eyePassed && currentEye === "left" ? (
              <><Ionicons name="checkmark-circle" size={24} color="#10B981" /><Text style={styles.actionText}>Both eyes passed! Proceed to Near Vision Test.</Text></>
            ) : (
              <><Ionicons name="alert-circle" size={24} color="#DC2626" /><Text style={styles.actionText}>{eyeLabel} eye failed. STOP and REFER.{"\n"}Record "N" under "Distance Vision Test — Pass?" and "Y" under "Referred?".</Text></>
            )}
          </View>

          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: eyePassed ? "#1565C0" : "#DC2626" }]} onPress={handleEyeResultNext}>
            <Text style={styles.nextBtnText}>
              {eyePassed && currentEye === "right" ? "Test LEFT Eye →"
                : eyePassed && currentEye === "left" ? "Continue to Near Vision Test →"
                : "Complete Referral →"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Phase: Final Result ─────────────────────────────────────────────────
  if (phase === "final_result") {
    const rResult = eyeResults.right;
    const lResult = eyeResults.left;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />

        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={[styles.resultCard, styles.resultPass]}>
            <Text style={styles.resultEyeLabel}>✅ DISTANCE VISION — BOTH EYES PASSED</Text>
            <View style={styles.resultLineRow}>
              <Text style={styles.resultLineTitle}>RIGHT EYE</Text>
              <Text style={[styles.resultLineSummary, styles.passText]}>
                Line 1: {rResult?.line1.filter(Boolean).length}/{LINE1_COUNT} ✓  ·  Line 2: {rResult?.line2.filter(Boolean).length}/{LINE2_COUNT} ✓
              </Text>
            </View>
            <View style={styles.resultLineRow}>
              <Text style={styles.resultLineTitle}>LEFT EYE</Text>
              <Text style={[styles.resultLineSummary, styles.passText]}>
                Line 1: {lResult?.line1.filter(Boolean).length}/{LINE1_COUNT} ✓  ·  Line 2: {lResult?.line2.filter(Boolean).length}/{LINE2_COUNT} ✓
              </Text>
            </View>
          </View>

          <View style={styles.actionCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.actionText}>
              Record "Y" under "Distance Vision Test — Pass?".{"\n"}Proceed to Step 6: Near Vision Test.
            </Text>
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={handleBothEyesPassed}>
            <Text style={styles.nextBtnText}>Continue to Near Vision Test →</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

// ─── Arrow direction button ───────────────────────────────────────────────────
function ArrowBtn({ direction, onPress }: { direction: EDirection; onPress: () => void }) {
  const icon =
    direction === "up" ? "arrow-up" :
    direction === "down" ? "arrow-down" :
    direction === "left" ? "arrow-back" : "arrow-forward";

  return (
    <TouchableOpacity style={styles.arrowBtn} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon as any} size={36} color="#1565C0" />
      <Text style={styles.arrowBtnLabel}>
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

// ─── Shared sub-components ────────────────────────────────────────────────────
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
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF",
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
  resultContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  stepTitle: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 8 },

  badge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#EFF6FF", paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, alignSelf: "flex-start", marginBottom: 16,
  },
  badgeText: { fontSize: 13, fontWeight: "600", color: "#1565C0", marginLeft: 6 },

  eyeBadge: {
    paddingVertical: 10, paddingHorizontal: 24, borderRadius: 24,
    alignSelf: "center", marginBottom: 20,
  },
  eyeBadgeText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },

  card: {
    backgroundColor: "#FFFFFF", borderRadius: 12, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: "#E5E7EB",
    elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 },

  directionDemo: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 8 },
  directionItem: { alignItems: "center", gap: 6 },
  directionEBox: {
    backgroundColor: "#FFFFFF", borderRadius: 8, padding: 6,
    elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, borderWidth: 1, borderColor: "#E5E7EB",
  },
  directionLabel: { fontSize: 12, fontWeight: "700", color: "#374151", marginTop: 4 },

  chartPreviewRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chartLineLabel: { fontSize: 12, color: "#6B7280", fontWeight: "600", textAlign: "center", width: 48 },
  chartEs: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, justifyContent: "center" },
  chartPassNote: { fontSize: 11, color: "#10B981", fontWeight: "600", textAlign: "center", width: 56 },
  chartDivider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 },

  infoBox: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: "#EFF6FF", padding: 12, borderRadius: 10, marginBottom: 20, gap: 8,
  },
  infoText: { flex: 1, fontSize: 13, color: "#1565C0", lineHeight: 18 },

  startBtn: { backgroundColor: "#1565C0", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  startBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },

  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  stepNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: "#1565C0",
    justifyContent: "center", alignItems: "center", marginRight: 12, marginTop: 1,
  },
  stepNumText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  stepText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },

  // ── TESTING PHASE — full screen white ─────────────────────────────────────
  testContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  testTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  eyePill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14 },
  eyePillText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  lineTag: { fontSize: 13, fontWeight: "600", color: "#374151" },

  progressDots: { flexDirection: "row", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotCorrect: { backgroundColor: "#10B981" },
  dotWrong:   { backgroundColor: "#EF4444" },
  dotCurrent: { backgroundColor: "#1565C0" },
  dotPending: { backgroundColor: "#D1D5DB" },

  scoreStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 6,
    backgroundColor: "#F9FAFB",
  },
  scoreCorrect: { fontSize: 13, fontWeight: "700", color: "#10B981" },
  scoreNeed:    { fontSize: 12, color: "#6B7280" },
  scoreWrong:   { fontSize: 13, fontWeight: "700", color: "#EF4444" },

  // The E lives on a pure white canvas that fills the available vertical space
  eCanvas: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  promptText: {
    textAlign: "center",
    fontSize: 15,
    color: "#6B7280",
    fontStyle: "italic",
    fontWeight: "500",
    paddingHorizontal: 24,
    marginBottom: 12,
  },

  // Arrow buttons — cruciform layout
  arrowGrid: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 0,
  },
  arrowRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  arrowBtn: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  arrowBtnLabel: { fontSize: 11, fontWeight: "700", color: "#1565C0" },

  cantSeeBtn: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  cantSeeBtnLabel: { fontSize: 10, fontWeight: "600", color: "#9CA3AF", textAlign: "center" },

  earlyFailBanner: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FEF2F2", padding: 8, margin: 12, borderRadius: 8,
    gap: 6, borderWidth: 1, borderColor: "#FECACA",
  },
  earlyFailText: { flex: 1, fontSize: 12, color: "#DC2626" },

  // ── Result phase ──────────────────────────────────────────────────────────
  resultCard: { borderRadius: 14, padding: 20, marginBottom: 16, borderWidth: 2 },
  resultPass: { backgroundColor: "#F0FDF4", borderColor: "#10B981" },
  resultFail: { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },
  resultEyeLabel: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 16 },
  resultLineRow: { marginBottom: 14 },
  resultLineTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  resultLetters: { flexDirection: "row", gap: 8, marginBottom: 6 },
  resultDot: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  dotCorrectBig: { backgroundColor: "#10B981" },
  dotWrongBig:   { backgroundColor: "#EF4444" },
  resultDotText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  resultLineSummary: { fontSize: 13, fontWeight: "600" },
  passText: { color: "#10B981" },
  failText: { color: "#EF4444" },
  skippedText: { fontSize: 13, color: "#9CA3AF", fontStyle: "italic" },

  actionCard: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: "#FFFFFF", borderRadius: 12,
    padding: 16, marginBottom: 20, gap: 12,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  actionText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },

  nextBtn: {
    backgroundColor: "#1565C0", paddingVertical: 16, borderRadius: 12, alignItems: "center",
  },
  nextBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
