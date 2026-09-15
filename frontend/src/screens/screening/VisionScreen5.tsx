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
 * Each E shown one at a time (like Peek Acuity).
 * VHT taps ✓ Correct or ✗ Wrong for each letter.
 * "Can't See" counts as Wrong.
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
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────────────────────
type EDirection = "right" | "down" | "left" | "up";
type Eye = "right" | "left";
type Line = 1 | 2;
type Phase =
  | "instructions"   // setup instructions before starting each eye
  | "testing"        // showing letters one at a time
  | "eye_result"     // summary after one eye finishes
  | "final_result";  // both eyes done

// ─── Constants ───────────────────────────────────────────────────────────────
const DIRECTIONS: EDirection[] = ["right", "down", "left", "up"];
const LINE1_COUNT = 3; // 6/60 — 3 letters
const LINE2_COUNT = 5; // 6/12 — 5 letters
const LINE1_PASS = 2;  // need ≥2 correct on line 1
const LINE2_PASS = 4;  // need ≥4 correct on line 2

/** Pick a random direction different from the previous one */
function randomDirection(prev?: EDirection): EDirection {
  let dir: EDirection;
  do {
    dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
  } while (dir === prev);
  return dir;
}

/** Generate the sequence of directions for a line */
function generateSequence(count: number): EDirection[] {
  const seq: EDirection[] = [];
  for (let i = 0; i < count; i++) {
    seq.push(randomDirection(seq[i - 1]));
  }
  return seq;
}

// ─── Block E renderer ────────────────────────────────────────────────────────
function BlockE({ direction, size }: { direction: EDirection; size: number }) {
  const t = Math.round(size / 5); // thickness of each bar

  const rotationDeg =
    direction === "right"
      ? "0deg"
      : direction === "down"
      ? "90deg"
      : direction === "left"
      ? "180deg"
      : "270deg";

  return (
    <View style={{ transform: [{ rotate: rotationDeg }] }}>
      <View style={{ width: size, height: size, backgroundColor: "transparent" }}>
        {/* Vertical spine */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: t,
            height: size,
            backgroundColor: "#0A0A0A",
          }}
        />
        {/* Top bar */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: size,
            height: t,
            backgroundColor: "#0A0A0A",
          }}
        />
        {/* Middle bar */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: Math.round((size - t) / 2),
            width: size - t,
            height: t,
            backgroundColor: "#0A0A0A",
          }}
        />
        {/* Bottom bar */}
        <View
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: size,
            height: t,
            backgroundColor: "#0A0A0A",
          }}
        />
      </View>
    </View>
  );
}

// ─── Direction label helper ───────────────────────────────────────────────────
function dirLabel(d: EDirection) {
  return d === "right" ? "→ Right" : d === "left" ? "← Left" : d === "up" ? "↑ Up" : "↓ Down";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DistanceVisionTestScreen() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const [userData, setUserData] = useState<any>(null);

  // Which eye we are currently testing
  const [currentEye, setCurrentEye] = useState<Eye>("right");

  // Per-eye results store
  const [eyeResults, setEyeResults] = useState<
    Record<Eye, { line1: boolean[]; line2: boolean[] } | null>
  >({ right: null, left: null });

  // Current test state
  const [phase, setPhase] = useState<Phase>("instructions");
  const [currentLine, setCurrentLine] = useState<Line>(1);
  const [sequence, setSequence] = useState<EDirection[]>([]);
  const [letterIndex, setLetterIndex] = useState(0);
  const [lineResults, setLineResults] = useState<boolean[]>([]);
  // Store line1 results while testing line2
  const [savedLine1Results, setSavedLine1Results] = useState<boolean[]>([]);

  useEffect(() => {
    apiService.getCurrentUser().then((u) => { if (u) setUserData(u); }).catch(() => {});
  }, []);

  // ── Start a new eye ─────────────────────────────────────────────────────────
  const startEye = useCallback((eye: Eye) => {
    setCurrentEye(eye);
    setPhase("instructions");
    setCurrentLine(1);
    setLetterIndex(0);
    setLineResults([]);
    setSavedLine1Results([]);
  }, []);

  // ── Begin the actual letter-by-letter test ───────────────────────────────────
  const beginTest = useCallback(() => {
    setSequence(generateSequence(LINE1_COUNT));
    setLetterIndex(0);
    setLineResults([]);
    setCurrentLine(1);
    setPhase("testing");
  }, []);

  // ── Record answer for current letter ─────────────────────────────────────────
  const recordAnswer = useCallback(
    (correct: boolean) => {
      const newResults = [...lineResults, correct];
      const totalLetters = currentLine === 1 ? LINE1_COUNT : LINE2_COUNT;
      const isLastLetter = newResults.length === totalLetters;

      if (!isLastLetter) {
        // More letters to go on this line
        setLineResults(newResults);
        setLetterIndex((i) => i + 1);
        return;
      }

      // Line finished — evaluate
      const correctCount = newResults.filter(Boolean).length;
      const passThreshold = currentLine === 1 ? LINE1_PASS : LINE2_PASS;
      const linePassed = correctCount >= passThreshold;

      if (currentLine === 1) {
        if (!linePassed) {
          // Failed line 1 → save results and show eye result (fail)
          setEyeResults((prev) => ({
            ...prev,
            [currentEye]: { line1: newResults, line2: [] },
          }));
          setPhase("eye_result");
        } else {
          // Passed line 1 → proceed to line 2
          setSavedLine1Results(newResults);
          setSequence(generateSequence(LINE2_COUNT));
          setLetterIndex(0);
          setLineResults([]);
          setCurrentLine(2);
        }
      } else {
        // Line 2 done
        setEyeResults((prev) => ({
          ...prev,
          [currentEye]: { line1: savedLine1Results, line2: newResults },
        }));
        setPhase("eye_result");
      }
    },
    [lineResults, currentLine, currentEye, savedLine1Results]
  );

  // ── After eye result, decide next step ───────────────────────────────────────
  const handleEyeResultNext = useCallback(async () => {
    const result = eyeResults[currentEye];
    const line2Correct = result?.line2.filter(Boolean).length ?? 0;
    const line1Correct = result?.line1.filter(Boolean).length ?? 0;
    const eyePassed =
      line1Correct >= LINE1_PASS &&
      (result?.line2.length ?? 0) > 0 &&
      line2Correct >= LINE2_PASS;

    if (!eyePassed) {
      // This eye failed — REFER
      await handleFail(currentEye, result);
      return;
    }

    if (currentEye === "right") {
      // Right eye passed → test left eye
      startEye("left");
    } else {
      // Both eyes passed
      setPhase("final_result");
    }
  }, [currentEye, eyeResults, startEye]);

  // ── Handle fail ──────────────────────────────────────────────────────────────
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

    const root = navigation.getParent()?.getParent();
    if (root) {
      root.navigate("CreateReferralScreen", params);
    } else {
      const parent = navigation.getParent();
      if (parent) parent.navigate("CreateReferralScreen", params);
      else navigation.navigate("CreateReferralScreen" as any, params);
    }
  };

  // ── Both eyes passed → go to near vision ──────────────────────────────────
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

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  const clientAge = Number(screeningData.clientAge) || 0;
  const eyeLabel = currentEye === "right" ? "RIGHT" : "LEFT";
  const coverEye = currentEye === "right" ? "LEFT" : "RIGHT";

  // ── Phase: Instructions ────────────────────────────────────────────────────
  if (phase === "instructions") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.stepTitle}>Step 5: Distance Vision Test</Text>

          <View style={styles.badge}>
            <Ionicons name="eye" size={16} color="#1565C0" />
            <Text style={styles.badgeText}>E-Chart • 3 Metres • Ages 6+</Text>
          </View>

          {/* Which eye */}
          <View style={[styles.eyeBadge, { backgroundColor: currentEye === "right" ? "#1565C0" : "#6A1B9A" }]}>
            <Text style={styles.eyeBadgeText}>
              {currentEye === "right" ? "1st" : "2nd"}: Testing {eyeLabel} EYE 👁️
            </Text>
          </View>

          {/* Setup instructions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚙️ Set Up:</Text>

            <StepRow n="1" text={`Stand exactly 3 metres away from client`} />
            <StepRow n="2" text={`Ask client to cover their ${coverEye} eye gently with palm`} />
            <StepRow n="3" text="Hold E-chart at client's eye level" />
            <StepRow n="4" text='Say: "Tell me which way the legs of the E are pointing — Up, Down, Left, or Right."' />
            <StepRow n="5" text="Show the E chart to demonstrate (the hand/stool key)" />
          </View>

          {/* E direction demo */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 E Direction Key (show client):</Text>
            <Text style={styles.cardSubtitle}>The "legs" of the E point in one of 4 directions:</Text>
            <View style={styles.directionDemo}>
              {(["right", "up", "left", "down"] as EDirection[]).map((d) => (
                <View key={d} style={styles.directionItem}>
                  <BlockE direction={d} size={36} />
                  <Text style={styles.directionLabel}>{dirLabel(d).replace("→ ", "").replace("← ", "").replace("↑ ", "").replace("↓ ", "")}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Chart preview */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 E-Chart (Distance Vision — top 2 lines):</Text>

            <View style={styles.chartPreviewRow}>
              <Text style={styles.chartLineLabel}>Line 1{"\n"}6/60</Text>
              <View style={styles.chartEs}>
                <BlockE direction="right" size={56} />
                <BlockE direction="down" size={56} />
                <BlockE direction="left" size={56} />
              </View>
              <Text style={styles.chartPassNote}>Need ≥2{"\n"}correct</Text>
            </View>

            <View style={[styles.chartPreviewRow, { marginTop: 16 }]}>
              <Text style={styles.chartLineLabel}>Line 2{"\n"}6/12</Text>
              <View style={styles.chartEs}>
                <BlockE direction="right" size={30} />
                <BlockE direction="up" size={30} />
                <BlockE direction="down" size={30} />
                <BlockE direction="left" size={30} />
                <BlockE direction="right" size={30} />
              </View>
              <Text style={styles.chartPassNote}>Need ≥4{"\n"}correct</Text>
            </View>
          </View>

          {/* Spectacles note */}
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

  // ── Phase: Testing (one letter at a time) ─────────────────────────────────
  if (phase === "testing") {
    const totalLetters = currentLine === 1 ? LINE1_COUNT : LINE2_COUNT;
    const passThreshold = currentLine === 1 ? LINE1_PASS : LINE2_PASS;
    const currentDirection = sequence[letterIndex];
    const eSize = currentLine === 1 ? width * 0.45 : width * 0.3;
    const correctSoFar = lineResults.filter(Boolean).length;
    const wrongSoFar = lineResults.filter((r) => !r).length;

    // Early fail detection: too many wrong already
    const remainingLetters = totalLetters - lineResults.length - 1;
    const canStillPass = correctSoFar + remainingLetters + 1 >= passThreshold;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />

        <View style={styles.testingContainer}>
          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(letterIndex / totalLetters) * 100}%` },
              ]}
            />
          </View>

          {/* Status row */}
          <View style={styles.statusRow}>
            <View style={[styles.eyePill, { backgroundColor: currentEye === "right" ? "#1565C0" : "#6A1B9A" }]}>
              <Text style={styles.eyePillText}>{eyeLabel} EYE</Text>
            </View>
            <Text style={styles.lineTag}>
              Line {currentLine} ({currentLine === 1 ? "6/60" : "6/12"})
            </Text>
            <Text style={styles.letterCount}>
              {letterIndex + 1} / {totalLetters}
            </Text>
          </View>

          {/* Score running total */}
          <View style={styles.scoreRow}>
            <View style={styles.scorePill}>
              <Text style={[styles.scorePillText, { color: "#10B981" }]}>✓ {correctSoFar}</Text>
            </View>
            <View style={styles.scorePill}>
              <Text style={[styles.scorePillText, { color: "#EF4444" }]}>✗ {wrongSoFar}</Text>
            </View>
            <Text style={styles.needText}>Need ≥{passThreshold} correct</Text>
          </View>

          {/* The big E */}
          <View style={styles.eDisplay}>
            <View style={styles.eWhiteBox}>
              <BlockE direction={currentDirection} size={eSize} />
            </View>
          </View>

          {/* Instruction */}
          <Text style={styles.askText}>
            Ask: "Which way do the legs of the E point?"
          </Text>

          {/* Answer buttons */}
          <View style={styles.answerGrid}>
            <TouchableOpacity
              style={[styles.answerBtn, styles.correctBtn]}
              onPress={() => recordAnswer(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.answerBtnIcon}>✓</Text>
              <Text style={styles.answerBtnText}>CORRECT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.answerBtn, styles.wrongBtn]}
              onPress={() => recordAnswer(false)}
              activeOpacity={0.75}
            >
              <Text style={styles.answerBtnIcon}>✗</Text>
              <Text style={styles.answerBtnText}>WRONG</Text>
            </TouchableOpacity>
          </View>

          {/* Can't see button */}
          <TouchableOpacity
            style={styles.cantSeeBtn}
            onPress={() => recordAnswer(false)}
            activeOpacity={0.75}
          >
            <Ionicons name="eye-off" size={18} color="#6B7280" />
            <Text style={styles.cantSeeBtnText}>Can't See / No Response</Text>
          </TouchableOpacity>

          {/* Early fail warning */}
          {!canStillPass && (
            <View style={styles.earlyFailBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.earlyFailText}>
                Cannot reach {passThreshold} correct — eye will fail this line
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── Phase: Eye Result ──────────────────────────────────────────────────────
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

            {/* Line 1 result */}
            <View style={styles.resultLineRow}>
              <Text style={styles.resultLineTitle}>Line 1 (6/60) — 3 letters</Text>
              <View style={styles.resultLetters}>
                {result?.line1.map((ok, i) => (
                  <View key={i} style={[styles.resultDot, ok ? styles.dotCorrect : styles.dotWrong]}>
                    <Text style={styles.resultDotText}>{ok ? "✓" : "✗"}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.resultLineSummary, line1Passed ? styles.passText : styles.failText]}>
                {line1Correct}/{LINE1_COUNT} correct — {line1Passed ? `PASS (≥${LINE1_PASS})` : `FAIL (<${LINE1_PASS})`}
              </Text>
            </View>

            {/* Line 2 result (if tested) */}
            {line2Done ? (
              <View style={styles.resultLineRow}>
                <Text style={styles.resultLineTitle}>Line 2 (6/12) — 5 letters</Text>
                <View style={styles.resultLetters}>
                  {result?.line2.map((ok, i) => (
                    <View key={i} style={[styles.resultDot, ok ? styles.dotCorrect : styles.dotWrong]}>
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

          {/* Next action */}
          <View style={styles.actionCard}>
            {eyePassed && currentEye === "right" ? (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.actionText}>Right eye passed. Now test the LEFT eye.</Text>
              </>
            ) : eyePassed && currentEye === "left" ? (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.actionText}>Both eyes passed! Proceed to Near Vision Test.</Text>
              </>
            ) : (
              <>
                <Ionicons name="alert-circle" size={24} color="#DC2626" />
                <Text style={styles.actionText}>
                  {eyeLabel} eye failed. STOP and REFER to health facility.
                  {"\n"}Record "N" under "Distance Vision Test — Pass?" and "Y" under "Referred?".
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={handleEyeResultNext}>
            <Text style={styles.nextBtnText}>
              {eyePassed && currentEye === "right"
                ? "Test LEFT Eye →"
                : eyePassed && currentEye === "left"
                ? "Continue to Near Vision Test →"
                : "Complete Referral →"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Phase: Final Result (both passed) ─────────────────────────────────────
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

            {/* Right eye summary */}
            <View style={styles.resultLineRow}>
              <Text style={styles.resultLineTitle}>RIGHT EYE</Text>
              <Text style={[styles.resultLineSummary, styles.passText]}>
                Line 1: {rResult?.line1.filter(Boolean).length}/{LINE1_COUNT} ✓ &nbsp;
                Line 2: {rResult?.line2.filter(Boolean).length}/{LINE2_COUNT} ✓
              </Text>
            </View>

            {/* Left eye summary */}
            <View style={styles.resultLineRow}>
              <Text style={styles.resultLineTitle}>LEFT EYE</Text>
              <Text style={[styles.resultLineSummary, styles.passText]}>
                Line 1: {lResult?.line1.filter(Boolean).length}/{LINE1_COUNT} ✓ &nbsp;
                Line 2: {lResult?.line2.filter(Boolean).length}/{LINE2_COUNT} ✓
              </Text>
            </View>
          </View>

          <View style={styles.actionCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.actionText}>
              Record "Y" under "Distance Vision Test — Pass?" in the register.
              {"\n"}Proceed to Step 6: Near Vision Test.
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

  // Header
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

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  // Step title + badge
  stepTitle: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  badgeText: { fontSize: 13, fontWeight: "600", color: "#1565C0", marginLeft: 6 },

  eyeBadge: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: "center",
    marginBottom: 20,
  },
  eyeBadgeText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },

  // Cards
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

  // Step rows inside card
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  stepNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#1565C0",
    justifyContent: "center", alignItems: "center",
    marginRight: 12, marginTop: 1,
  },
  stepNumText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  stepText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },

  // Direction demo
  directionDemo: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 8 },
  directionItem: { alignItems: "center", gap: 6 },
  directionLabel: { fontSize: 13, color: "#374151", fontWeight: "600", marginTop: 6 },

  // Chart preview
  chartPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chartLineLabel: { fontSize: 12, color: "#6B7280", fontWeight: "600", textAlign: "center", width: 48 },
  chartEs: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, justifyContent: "center" },
  chartPassNote: { fontSize: 11, color: "#10B981", fontWeight: "600", textAlign: "center", width: 56 },

  // Info box
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  infoText: { flex: 1, fontSize: 13, color: "#1565C0", lineHeight: 18 },

  // Start button
  startBtn: {
    backgroundColor: "#1565C0",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  startBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },

  // ── Testing phase ─────────────────────────────────────────────────────────
  testingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "#F9FAFB",
  },

  progressBar: {
    height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, overflow: "hidden", marginBottom: 14,
  },
  progressFill: { height: "100%", backgroundColor: "#1565C0", borderRadius: 3 },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  eyePill: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14,
  },
  eyePillText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  lineTag: { fontSize: 14, fontWeight: "600", color: "#374151" },
  letterCount: { fontSize: 14, color: "#6B7280", fontWeight: "500" },

  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  scorePill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  scorePillText: { fontSize: 14, fontWeight: "700" },
  needText: { fontSize: 12, color: "#6B7280", marginLeft: 4 },

  eDisplay: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 200,
  },
  eWhiteBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },

  askText: {
    textAlign: "center",
    fontSize: 15,
    color: "#374151",
    fontStyle: "italic",
    marginVertical: 16,
    fontWeight: "500",
  },

  answerGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  answerBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  correctBtn: { backgroundColor: "#10B981" },
  wrongBtn: { backgroundColor: "#EF4444" },
  answerBtnIcon: { fontSize: 28, color: "#FFFFFF", fontWeight: "700" },
  answerBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", marginTop: 4 },

  cantSeeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  cantSeeBtnText: { fontSize: 14, color: "#6B7280", fontWeight: "500" },

  earlyFailBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  earlyFailText: { flex: 1, fontSize: 13, color: "#DC2626" },

  // ── Result phases ─────────────────────────────────────────────────────────
  resultContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  resultCard: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  resultPass: { backgroundColor: "#F0FDF4", borderColor: "#10B981" },
  resultFail: { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },

  resultEyeLabel: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 16 },

  resultLineRow: { marginBottom: 14 },
  resultLineTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  resultLetters: { flexDirection: "row", gap: 8, marginBottom: 6 },
  resultDot: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },
  dotCorrect: { backgroundColor: "#10B981" },
  dotWrong: { backgroundColor: "#EF4444" },
  resultDotText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  resultLineSummary: { fontSize: 13, fontWeight: "600" },
  passText: { color: "#10B981" },
  failText: { color: "#EF4444" },
  skippedText: { fontSize: 13, color: "#9CA3AF", fontStyle: "italic" },

  actionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },

  nextBtn: {
    backgroundColor: "#1565C0",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
