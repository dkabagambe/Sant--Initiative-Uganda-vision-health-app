/**
 * VisionScreen5 – Step 5: Peek-style Distance Vision Test
 * ─────────────────────────────────────────────────────────
 * Mirrors Peek Acuity (org.peekvision.public.android):
 *
 *  Display  : WHITE background (#FFFFFF), BLACK tumbling-E (#000000).
 *  Distance : 2 metres (operator holds phone, patient points).
 *  Levels   : 6/60 → 6/36 → 6/24 → 6/18 → 6/12 → 6/9 → 6/6
 *             Each level = 3 letters, need ≥2 correct to advance.
 *  Input    : Swipe the E zone (≥ 80dp drag) OR tap an arrow button.
 *             Either method calls recordAnswer(swiped/tapped direction).
 *  Eyes     : RIGHT first then LEFT; header shows which eye is active.
 *  Results  : Snellen + LogMAR saved to ScreeningContext.
 *
 * BUG FIX (from screenshot):
 *  Previous code had testContainer backgroundColor:"#000000" and
 *  TumblingE color:"#FFFFFF" → white-on-black = invisible in dark mode.
 *  Fixed: background WHITE, E BLACK everywhere.
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
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
  Animated,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TumblingE, { EDirection, physicalDp } from "../../components/TumblingE";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Acuity ladder at 2 metres ────────────────────────────────────────────────
// Letter height formula:  h_mm = 5 × MAR × distance_mm / 3438
// At 2000 mm:
//   6/60 (MAR 10) = 29.1 mm   6/36 (MAR 6) = 17.5 mm
//   6/24 (MAR 4)  = 11.6 mm   6/18 (MAR 3) =  8.7 mm
//   6/12 (MAR 2)  =  5.8 mm   6/9  (MAR 1.5)= 4.4 mm
//   6/6  (MAR 1)  =  2.9 mm
interface AcuityLevel {
  snellen: string;
  logmar:  number;
  mm:      number;   // letter height at 2 m
}
const LEVELS: AcuityLevel[] = [
  { snellen: "6/60", logmar: 1.00, mm: 29.1 },
  { snellen: "6/36", logmar: 0.78, mm: 17.5 },
  { snellen: "6/24", logmar: 0.60, mm: 11.6 },
  { snellen: "6/18", logmar: 0.48, mm:  8.7 },
  { snellen: "6/12", logmar: 0.30, mm:  5.8 },
  { snellen: "6/9",  logmar: 0.18, mm:  4.4 },
  { snellen: "6/6",  logmar: 0.00, mm:  2.9 },
];
const LETTERS_PER_LEVEL = 3;
const PASS_THRESHOLD    = 2;   // ≥ 2 / 3 correct
const SWIPE_MIN_DP      = 80;  // minimum drag distance to count as a swipe

// ─── Types ────────────────────────────────────────────────────────────────────
type Eye   = "right" | "left";
type Phase = "instructions" | "testing" | "switch_eye" | "eye_result" | "final_result";

interface EyeResult {
  snellen: string;
  logmar:  number;
  levelIdx: number;  // highest level index the eye passed
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DIRS: EDirection[] = ["right", "down", "left", "up"];

function nextRandom(exclude?: EDirection): EDirection {
  let d: EDirection;
  do { d = DIRS[Math.floor(Math.random() * 4)]; } while (d === exclude);
  return d;
}

function eSizeDp(level: AcuityLevel): number {
  // Convert mm → dp, clamp to 85% of screen width so it always fits
  return Math.min(physicalDp(level.mm), SCREEN_W * 0.85);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VisionScreen5() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const [userData, setUserData] = useState<any>(null);

  // ── Phase / eye state ──────────────────────────────────────────────────────
  const [phase,       setPhase]       = useState<Phase>("instructions");
  const [currentEye,  setCurrentEye]  = useState<Eye>("right");
  const [eyeResults,  setEyeResults]  = useState<Record<Eye, EyeResult | null>>({
    right: null,
    left:  null,
  });

  // ── Level / letter state ───────────────────────────────────────────────────
  const [levelIdx,    setLevelIdx]    = useState(0);
  const [direction,   setDirection]   = useState<EDirection>(() => nextRandom());
  const [answers,     setAnswers]     = useState<boolean[]>([]);   // this level's results
  const [lastDir,     setLastDir]     = useState<EDirection | undefined>(undefined);

  // ── Feedback flash ─────────────────────────────────────────────────────────
  // Brief ✓/✗ overlay after each answer before the new E appears
  const [feedback,    setFeedback]    = useState<"correct" | "wrong" | null>(null);

  // ── Animation for E transition ─────────────────────────────────────────────
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    apiService.getCurrentUser()
      .then(u => { if (u) setUserData(u); })
      .catch(() => {});
  }, []);

  // ── Animate out → call fn → animate in ────────────────────────────────────
  const animateChange = useCallback((fn: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0,    duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.80, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      fn();
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1,    duration: 160, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1,    duration: 160, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, scaleAnim]);

  // ── Core answer handler ───────────────────────────────────────────────────
  // Called by both swipe and arrow-button press.
  const recordAnswer = useCallback(
    (answered: EDirection) => {
      const correct = answered === direction;
      const newAnswers = [...answers, correct];

      // Show feedback flash
      setFeedback(correct ? "correct" : "wrong");
      setTimeout(() => setFeedback(null), 500);

      if (newAnswers.length < LETTERS_PER_LEVEL) {
        // More letters to show at this level
        const nextDir = nextRandom(direction);
        animateChange(() => {
          setAnswers(newAnswers);
          setLastDir(direction);
          setDirection(nextDir);
        });
        return;
      }

      // Level finished — evaluate
      const correctCount = newAnswers.filter(Boolean).length;
      const passed = correctCount >= PASS_THRESHOLD;

      if (passed) {
        const nextLevelIdx = levelIdx + 1;
        if (nextLevelIdx >= LEVELS.length) {
          // Reached 6/6 — best possible result
          finishEye(currentEye, levelIdx);
        } else {
          // Advance to smaller level
          const nextDir = nextRandom();
          animateChange(() => {
            setLevelIdx(nextLevelIdx);
            setAnswers([]);
            setLastDir(undefined);
            setDirection(nextDir);
          });
        }
      } else {
        // Failed — record best level passed so far
        // If failing at first level (6/60), result is 6/60 failed = below 6/60
        const bestPassedIdx = levelIdx === 0 ? -1 : levelIdx - 1;
        finishEye(currentEye, bestPassedIdx, newAnswers);
      }
    },
    [answers, direction, levelIdx, currentEye, animateChange]
  );

  // ── Finish one eye ────────────────────────────────────────────────────────
  const finishEye = useCallback(
    (eye: Eye, passedLevelIdx: number, _finalAnswers?: boolean[]) => {
      if (passedLevelIdx < 0) {
        // Failed 6/60 — record as "< 6/60"
        setEyeResults(prev => ({
          ...prev,
          [eye]: { snellen: "< 6/60", logmar: 1.30, levelIdx: -1 },
        }));
      } else {
        const lv = LEVELS[passedLevelIdx];
        setEyeResults(prev => ({
          ...prev,
          [eye]: { snellen: lv.snellen, logmar: lv.logmar, levelIdx: passedLevelIdx },
        }));
      }
      setPhase("eye_result");
    },
    []
  );

  // ── After eye result ──────────────────────────────────────────────────────
  const handleEyeResultNext = useCallback(() => {
    if (currentEye === "right") {
      setPhase("switch_eye");
    } else {
      setPhase("final_result");
    }
  }, [currentEye]);

  // ── Switch-eye screen → begin left eye ───────────────────────────────────
  const beginLeftEye = useCallback(() => {
    setCurrentEye("left");
    setLevelIdx(0);
    setAnswers([]);
    setLastDir(undefined);
    setDirection(nextRandom());
    setPhase("instructions");
  }, []);

  // ── Start test (from instructions) ───────────────────────────────────────
  const beginTest = useCallback(() => {
    setLevelIdx(0);
    setAnswers([]);
    setLastDir(undefined);
    setDirection(nextRandom());
    setPhase("testing");
  }, []);

  // ── Save + navigate away ──────────────────────────────────────────────────
  const handleBothEyesDone = useCallback(async () => {
    const r = eyeResults.right;
    const l = eyeResults.left;

    const rightStr = r?.snellen ?? "not_tested";
    const leftStr  = l?.snellen ?? "not_tested";
    const needsRef =
      (r?.levelIdx ?? 99) < 3 ||   // worse than 6/18 for right eye
      (l?.levelIdx ?? 99) < 3;      // or for left eye

    const updates = {
      distanceVisionRight:  `${rightStr} LogMAR ${r?.logmar?.toFixed(2) ?? "—"}`,
      distanceVisionLeft:   `${leftStr}  LogMAR ${l?.logmar?.toFixed(2) ?? "—"}`,
      distanceVisionResult: needsRef ? "failed" : "passed",
      needsReferral: needsRef,
      referralReason: needsRef
        ? `Failed distance vision (Step 5). R: ${rightStr}  L: ${leftStr}`
        : "",
      referralUrgency: "normal",
      referralStep:    "Step 5 - Distance Vision Test",
    };
    updateScreeningData(updates);

    if (!needsRef) {
      navigation.navigate("VisionScreen6");
      return;
    }

    // Save screening then navigate to referral
    let savedId: string | null = null;
    try {
      const res = await apiService.createScreening({ ...screeningData, ...updates });
      if (res.success) savedId = res.data?.id || res.screeningId || null;
    } catch {
      try {
        const q = await AsyncStorage.getItem("offlineScreenings");
        const queue = q ? JSON.parse(q) : [];
        queue.push({
          ...screeningData, ...updates,
          offlineId: Date.now().toString(),
          timestamp: new Date().toISOString(),
        });
        await AsyncStorage.setItem("offlineScreenings", JSON.stringify(queue));
      } catch {}
    }

    const params = {
      fromScreening: true,
      screeningId:   savedId,
      clientName:    screeningData.clientName  || "",
      clientPhone:   screeningData.clientPhone || "",
      clientAge:     screeningData.clientAge   || "",
      clientSex:     screeningData.clientGender || "",
      district:      screeningData.district    || "",
      county:        screeningData.county      || "",
      subCounty:     screeningData.subCounty   || "",
      parish:        screeningData.parish      || "",
      reason:        updates.referralReason,
      urgency:       "normal",
      notes:         `Step 5 Distance Vision. R: ${rightStr}  L: ${leftStr}`,
    };
    const root = navigation.getParent()?.getParent();
    if (root) root.navigate("CreateReferralScreen", params);
    else navigation.navigate("CreateReferralScreen" as any, params);
  }, [eyeResults, screeningData, updateScreeningData, navigation]);

  // ── Derived display values ────────────────────────────────────────────────
  const eyeLabel = currentEye === "right" ? "RIGHT" : "LEFT";
  const coverEye = currentEye === "right" ? "LEFT"  : "RIGHT";
  const level    = LEVELS[levelIdx];
  const eSize    = eSizeDp(level);
  const correct  = answers.filter(Boolean).length;
  const wrong    = answers.filter(r => !r).length;
  const remaining = LETTERS_PER_LEVEL - answers.length - 1;
  const canPass  = correct + remaining + 1 >= PASS_THRESHOLD;

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: Instructions
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "instructions") {
    return (
      <SafeAreaView style={s.page}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />
        <ScrollView contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>

          <Text style={s.pageTitle}>Step 5: Distance Vision</Text>

          {/* Eye badge */}
          <View style={[s.eyeBadge, { backgroundColor: currentEye === "right" ? "#1565C0" : "#7C3AED" }]}>
            <Ionicons name="eye" size={16} color="#FFF" />
            <Text style={s.eyeBadgeTxt}>
              {currentEye === "right" ? "1st" : "2nd"}: Testing {eyeLabel} EYE
            </Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Setup</Text>
            <SetupRow n="1" text="Set screen brightness to maximum" />
            <SetupRow n="2" text="Stand exactly 2 metres from the client" />
            <SetupRow n="3" text={`Ask client to cover their ${coverEye} eye gently with their palm`} />
            <SetupRow n="4" text={`Say: "I'll show you a letter. Tell me which way the legs point — Up, Down, Left or Right."`} />
          </View>

          {/* Direction reference — white bg, black E */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Direction Reference</Text>
            <View style={s.dirRow}>
              {(["right","down","left","up"] as EDirection[]).map(d => (
                <View key={d} style={s.dirItem}>
                  <View style={s.dirEBox}>
                    <TumblingE direction={d} size={38} color="#000000" backgroundColor="#FFFFFF" />
                  </View>
                  <Text style={s.dirLabel}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Levels preview */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Acuity Levels  (2 m, need ≥ 2/3 to advance)</Text>
            {LEVELS.map((lv, i) => (
              <View key={lv.snellen} style={s.levelRow}>
                <Text style={s.levelSnellen}>{lv.snellen}</Text>
                <Text style={s.levelLogmar}>LogMAR {lv.logmar.toFixed(2)}</Text>
                <TumblingE direction="right" size={Math.max(8, 48 - i * 5)} color="#000000" backgroundColor="#FFFFFF" />
              </View>
            ))}
          </View>

          <View style={s.infoBox}>
            <Ionicons name="information-circle" size={16} color="#1565C0" />
            <Text style={s.infoTxt}>
              Swipe the E on screen in the direction the patient points, or tap the arrow buttons.
            </Text>
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: currentEye === "right" ? "#1565C0" : "#7C3AED" }]}
            onPress={beginTest}
          >
            <Text style={s.primaryBtnTxt}>Start {eyeLabel} Eye Test →</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: Testing  ← The main Peek-style full-screen
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "testing") {
    return (
      <GestureHandlerRootView style={s.testRoot}>
        <SafeAreaView style={s.testRoot}>
          <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

          {/* ── Top bar ─────────────────────────────────────────────── */}
          <View style={s.testBar}>
            {/* Eye pill */}
            <View style={[s.eyePill, { backgroundColor: currentEye === "right" ? "#1565C0" : "#7C3AED" }]}>
              <Text style={s.eyePillTxt}>{eyeLabel}</Text>
            </View>

            {/* Level */}
            <View style={s.levelInfo}>
              <Text style={s.levelBig}>{level.snellen}</Text>
              <Text style={s.levelSub}>LogMAR {level.logmar.toFixed(2)}</Text>
            </View>

            {/* Letter dots */}
            <View style={s.dots}>
              {Array.from({ length: LETTERS_PER_LEVEL }).map((_, i) => {
                const done = i < answers.length;
                const cur  = i === answers.length;
                return (
                  <View key={i} style={[
                    s.dot,
                    done && answers[i]  ? s.dotGreen : null,
                    done && !answers[i] ? s.dotRed   : null,
                    cur                 ? s.dotBlue  : null,
                    !done && !cur       ? s.dotGrey  : null,
                  ]} />
                );
              })}
            </View>
          </View>

          {/* ── Score bar ───────────────────────────────────────────── */}
          <View style={s.scoreBar}>
            <Text style={[s.scorePart, { color: "#16A34A" }]}>✓ {correct}</Text>
            <Text style={[s.scorePart, { color: "#6B7280" }]}>  need ≥{PASS_THRESHOLD}  </Text>
            <Text style={[s.scorePart, { color: "#DC2626" }]}>✗ {wrong}</Text>
          </View>

          {/* ── E zone — WHITE bg, BLACK E, swipe-enabled ───────────── */}
          <PanGestureHandler
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state !== State.END) return;
              const { translationX: dx, translationY: dy } = nativeEvent;
              const absDx = Math.abs(dx);
              const absDy = Math.abs(dy);
              const threshold = SWIPE_MIN_DP;
              if (absDx < threshold && absDy < threshold) return; // too small
              let swiped: EDirection;
              if (absDx >= absDy) {
                swiped = dx > 0 ? "right" : "left";
              } else {
                swiped = dy > 0 ? "down" : "up";
              }
              recordAnswer(swiped);
            }}
          >
            {/* View must be a direct child of PanGestureHandler */}
            <View style={s.eCanvas}>
              {/* Feedback flash overlay */}
              {feedback !== null && (
                <View style={[
                  s.feedbackOverlay,
                  feedback === "correct" ? s.feedbackCorrect : s.feedbackWrong,
                ]}>
                  <Text style={s.feedbackIcon}>
                    {feedback === "correct" ? "✓" : "✗"}
                  </Text>
                </View>
              )}

              {/* The E — black on white, animated */}
              <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                <TumblingE
                  key={`${direction}-${answers.length}-${levelIdx}`}
                  direction={direction}
                  size={eSize}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              </Animated.View>

              {/* Swipe hint shown until first answer */}
              {answers.length === 0 && (
                <Text style={s.swipeHint}>← Swipe or tap arrows →</Text>
              )}
            </View>
          </PanGestureHandler>

          {/* ── Prompt ──────────────────────────────────────────────── */}
          <Text style={s.prompt}>"Which way do the legs point?"</Text>

          {/* ── Arrow buttons (cruciform) ────────────────────────────── */}
          <View style={s.arrowGrid}>
            <View style={s.arrowRow}>
              <ArrowBtn dir="up"    onPress={() => recordAnswer("up")} />
            </View>
            <View style={s.arrowRow}>
              <ArrowBtn dir="left"  onPress={() => recordAnswer("left")} />
              <CantSeeBtn           onPress={() => recordAnswer(nextRandom(direction))} />
              <ArrowBtn dir="right" onPress={() => recordAnswer("right")} />
            </View>
            <View style={s.arrowRow}>
              <ArrowBtn dir="down"  onPress={() => recordAnswer("down")} />
            </View>
          </View>

          {/* ── Early fail warning ──────────────────────────────────── */}
          {!canPass && answers.length > 0 && (
            <View style={s.earlyFail}>
              <Ionicons name="alert-circle" size={13} color="#DC2626" />
              <Text style={s.earlyFailTxt}>Cannot reach {PASS_THRESHOLD} — advancing to result</Text>
            </View>
          )}
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: Eye result
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "eye_result") {
    const rec     = eyeResults[currentEye];
    const failed  = !rec || rec.levelIdx < 0;
    const needRef = failed || rec.levelIdx < 3;   // worse than 6/18 → refer

    return (
      <SafeAreaView style={s.page}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />
        <ScrollView contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>

          <View style={[s.resultCard, needRef ? s.cardFail : s.cardPass]}>
            <Text style={s.resultEyeLbl}>
              {eyeLabel} EYE — {needRef ? "❌ REFER" : "✅ PASS"}
            </Text>
            <Text style={s.resultSnellen}>{rec?.snellen ?? "< 6/60"}</Text>
            <Text style={s.resultLogmar}>
              LogMAR {rec?.logmar?.toFixed(2) ?? "—"}
            </Text>
          </View>

          <View style={s.actionCard}>
            <Ionicons
              name={needRef ? "alert-circle" : "checkmark-circle"}
              size={22}
              color={needRef ? "#DC2626" : "#16A34A"}
            />
            <Text style={s.actionTxt}>
              {needRef
                ? `${eyeLabel} eye vision is below 6/18. Referral recommended.${
                    currentEye === "right" ? "\nContinue to test LEFT eye before referring." : ""
                  }`
                : currentEye === "right"
                ? "Right eye passed. Now test the LEFT eye."
                : "Both eyes done — proceed to near vision test."}
            </Text>
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, {
              backgroundColor: currentEye === "right" ? "#1565C0" : (needRef ? "#DC2626" : "#16A34A"),
            }]}
            onPress={handleEyeResultNext}
          >
            <Text style={s.primaryBtnTxt}>
              {currentEye === "right" ? "Continue to LEFT Eye →" : "View Final Results →"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: Switch-eye screen
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "switch_eye") {
    return (
      <SafeAreaView style={s.switchPage}>
        <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
        <View style={s.switchBody}>
          <View style={s.switchIcon}>
            <Ionicons name="eye" size={48} color="#FFF" />
          </View>
          <Text style={s.switchTitle}>Right Eye Done ✓</Text>
          <Text style={s.switchSub}>
            Now ask the client to cover their{"\n"}
            <Text style={s.switchHighlight}>RIGHT EYE</Text>
            {"\n"}and uncover their LEFT eye.
          </Text>
          <TouchableOpacity style={s.switchBtn} onPress={beginLeftEye}>
            <Text style={s.switchBtnTxt}>Ready — Test LEFT Eye →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: Final result
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "final_result") {
    const r = eyeResults.right;
    const l = eyeResults.left;
    const rRef = !r || r.levelIdx < 3;
    const lRef = !l || l.levelIdx < 3;
    const anyRef = rRef || lRef;

    return (
      <SafeAreaView style={s.page}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />
        <ScrollView contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>

          <Text style={s.pageTitle}>Distance Vision Results</Text>

          {/* Results table */}
          <View style={s.tableCard}>
            <View style={s.tableHead}>
              {["Eye","Snellen","LogMAR","Result"].map(h => (
                <Text key={h} style={[s.tableCell, s.tableHdrTxt]}>{h}</Text>
              ))}
            </View>
            <ResultRow eye="RIGHT" rec={r} needRef={rRef} color="#1565C0" />
            <ResultRow eye="LEFT"  rec={l} needRef={lRef} color="#7C3AED" />
          </View>

          <View style={[s.actionCard, anyRef && s.actionCardRed]}>
            <Ionicons
              name={anyRef ? "alert-circle" : "checkmark-circle"}
              size={22}
              color={anyRef ? "#DC2626" : "#16A34A"}
            />
            <Text style={[s.actionTxt, anyRef && { color: "#DC2626" }]}>
              {anyRef
                ? "One or both eyes need referral to a health facility."
                : "Both eyes passed! Proceed to Near Vision Test (Step 6)."}
            </Text>
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: anyRef ? "#DC2626" : "#1565C0" }]}
            onPress={handleBothEyesDone}
          >
            <Text style={s.primaryBtnTxt}>
              {anyRef ? "Complete Referral →" : "Continue to Near Vision Test →"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Header({ userData, navigation }: any) {
  return (
    <View style={s.header}>
      <View style={s.logoBox}>
        <Image
          source={require("../../../assets/logo.png")}
          style={s.logo}
          resizeMode="contain"
        />
      </View>
      <View style={s.headerMid}>
        <Text style={s.headerTitle}>
          {userData?.fullName || userData?.full_name || "Santé Initiative Uganda"}
        </Text>
        <Text style={s.headerSub}>
          {userData?.district ? `VHT · ${userData.district}` : "Step 5 · Distance Vision"}
        </Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={s.menuBtn}>
        <Ionicons name="menu" size={26} color="#1A4D8F" />
      </TouchableOpacity>
    </View>
  );
}

function SetupRow({ n, text }: { n: string; text: string }) {
  return (
    <View style={s.setupRow}>
      <View style={s.setupNum}><Text style={s.setupNumTxt}>{n}</Text></View>
      <Text style={s.setupTxt}>{text}</Text>
    </View>
  );
}

function ArrowBtn({ dir, onPress }: { dir: EDirection; onPress: () => void }) {
  const icon =
    dir === "up"    ? "arrow-up"      :
    dir === "down"  ? "arrow-down"    :
    dir === "left"  ? "arrow-back"    : "arrow-forward";
  const label =
    dir === "up" ? "Up" : dir === "down" ? "Down" : dir === "left" ? "Left" : "Right";

  return (
    <TouchableOpacity style={s.arrowBtn} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon as any} size={32} color="#1565C0" />
      <Text style={s.arrowLbl}>{label}</Text>
    </TouchableOpacity>
  );
}

function CantSeeBtn({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={s.cantBtn} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="eye-off-outline" size={20} color="#9CA3AF" />
      <Text style={s.cantLbl}>Can't{"\n"}See</Text>
    </TouchableOpacity>
  );
}

function ResultRow({
  eye, rec, needRef, color,
}: { eye: string; rec: EyeResult | null; needRef: boolean; color: string }) {
  return (
    <View style={[s.tableRow, needRef && s.tableRowRed]}>
      <Text style={[s.tableCell, { color, fontWeight: "700" }]}>{eye}</Text>
      <Text style={s.tableCell}>{rec?.snellen ?? "—"}</Text>
      <Text style={s.tableCell}>{rec?.logmar?.toFixed(2) ?? "—"}</Text>
      <Text style={[s.tableCell, { color: needRef ? "#DC2626" : "#16A34A", fontWeight: "700" }]}>
        {needRef ? "REFER" : "PASS"}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────────────────────────
  page:      { flex: 1, backgroundColor: "#F9FAFB" },
  scrollPad: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 16 },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14, paddingVertical: 10, paddingTop: 44,
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
    elevation: 2,
  },
  logoBox:   { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  logo:      { width: 36, height: 36 },
  headerMid: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  headerSub:   { fontSize: 11, color: "#6B7280", marginTop: 1 },
  menuBtn:     { width: 40, alignItems: "flex-end" },

  // ── Eye badge / instructions ─────────────────────────────────────────────
  eyeBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 24, alignSelf: "center", marginBottom: 18,
  },
  eyeBadgeTxt: { fontSize: 16, fontWeight: "700", color: "#FFF" },

  card: {
    backgroundColor: "#FFF", borderRadius: 14, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: "#E5E7EB", elevation: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 12 },

  dirRow:  { flexDirection: "row", justifyContent: "space-around", paddingVertical: 4 },
  dirItem: { alignItems: "center", gap: 4 },
  dirEBox: {
    backgroundColor: "#FFFFFF", borderRadius: 8, padding: 6,
    borderWidth: 1, borderColor: "#D1D5DB", elevation: 1,
  },
  dirLabel: { fontSize: 11, fontWeight: "700", color: "#374151" },

  levelRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  levelSnellen: { fontSize: 13, fontWeight: "700", color: "#111827", width: 48 },
  levelLogmar:  { fontSize: 11, color: "#6B7280", flex: 1 },

  setupRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  setupNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#1565C0",
    justifyContent: "center", alignItems: "center", marginRight: 10, marginTop: 1,
  },
  setupNumTxt: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  setupTxt:    { flex: 1, fontSize: 13, color: "#374151", lineHeight: 19 },

  infoBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "#EFF6FF", padding: 12, borderRadius: 10, marginBottom: 18,
  },
  infoTxt: { flex: 1, fontSize: 13, color: "#1565C0", lineHeight: 18 },

  primaryBtn: {
    backgroundColor: "#1565C0",
    paddingVertical: 16, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  primaryBtnTxt: { fontSize: 16, fontWeight: "700", color: "#FFF" },

  // ── Testing phase ────────────────────────────────────────────────────────
  // testRoot is WHITE — fixes the black-background bug
  testRoot: { flex: 1, backgroundColor: "#FFFFFF" },

  testBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 10, paddingTop: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },

  eyePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  eyePillTxt: { fontSize: 11, fontWeight: "700", color: "#FFF" },

  levelInfo: { alignItems: "center" },
  levelBig: { fontSize: 14, fontWeight: "700", color: "#111827" },
  levelSub: { fontSize: 10, color: "#6B7280" },

  dots: { flexDirection: "row", gap: 6 },
  dot:      { width: 10, height: 10, borderRadius: 5 },
  dotGreen: { backgroundColor: "#16A34A" },
  dotRed:   { backgroundColor: "#DC2626" },
  dotBlue:  { backgroundColor: "#1565C0" },
  dotGrey:  { backgroundColor: "#D1D5DB" },

  scoreBar: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    paddingVertical: 8, backgroundColor: "#F9FAFB",
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  scorePart: { fontSize: 14, fontWeight: "600" },

  // ── E canvas — always WHITE background ──────────────────────────────────
  eCanvas: {
    flex: 1,
    backgroundColor: "#FFFFFF",          // <-- WHITE, never black
    justifyContent: "center",
    alignItems: "center",
  },

  // Feedback flash (shown 500 ms after each answer)
  feedbackOverlay: {
    position: "absolute", zIndex: 10,
    width: 80, height: 80, borderRadius: 40,
    justifyContent: "center", alignItems: "center",
    opacity: 0.88,
  },
  feedbackCorrect: { backgroundColor: "#16A34A" },
  feedbackWrong:   { backgroundColor: "#DC2626" },
  feedbackIcon:    { fontSize: 36, fontWeight: "700", color: "#FFF" },

  swipeHint: {
    position: "absolute", bottom: 16,
    fontSize: 12, color: "#9CA3AF", fontStyle: "italic",
  },

  prompt: {
    textAlign: "center", fontSize: 14, color: "#4B5563",
    fontStyle: "italic", paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },

  // Arrow buttons (cruciform)
  arrowGrid: { paddingHorizontal: 12, paddingBottom: 10, backgroundColor: "#FFFFFF" },
  arrowRow:  { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },

  arrowBtn: {
    width: 80, height: 80, borderRadius: 16,
    borderWidth: 2, borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    justifyContent: "center", alignItems: "center", gap: 4,
  },
  arrowLbl: { fontSize: 11, fontWeight: "700", color: "#1565C0" },

  cantBtn: {
    width: 80, height: 80, borderRadius: 16,
    borderWidth: 2, borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    justifyContent: "center", alignItems: "center", gap: 4,
  },
  cantLbl: { fontSize: 10, fontWeight: "600", color: "#9CA3AF", textAlign: "center" },

  earlyFail: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA",
    padding: 8, margin: 10, borderRadius: 8,
  },
  earlyFailTxt: { flex: 1, fontSize: 12, color: "#DC2626" },

  // ── Eye result / final result ────────────────────────────────────────────
  resultCard: { borderRadius: 14, padding: 20, marginBottom: 16, borderWidth: 2 },
  cardPass:   { backgroundColor: "#F0FDF4", borderColor: "#16A34A" },
  cardFail:   { backgroundColor: "#FEF2F2", borderColor: "#DC2626" },
  resultEyeLbl: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  resultSnellen: { fontSize: 36, fontWeight: "800", color: "#111827" },
  resultLogmar:  { fontSize: 14, color: "#6B7280", marginTop: 4 },

  actionCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  actionCardRed: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
  actionTxt: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },

  tableCard: {
    backgroundColor: "#FFF", borderRadius: 14, overflow: "hidden", marginBottom: 16,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  tableHead:   { flexDirection: "row", backgroundColor: "#F3F4F6", paddingVertical: 10, paddingHorizontal: 8 },
  tableHdrTxt: { fontSize: 12, fontWeight: "700", color: "#374151" },
  tableRow:    { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  tableRowRed: { backgroundColor: "#FEF2F2" },
  tableCell:   { flex: 1, fontSize: 13, color: "#111827", textAlign: "center" },

  // ── Switch-eye interstitial ───────────────────────────────────────────────
  switchPage: { flex: 1, backgroundColor: "#1565C0" },
  switchBody: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  switchIcon: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", marginBottom: 24,
  },
  switchTitle: { fontSize: 26, fontWeight: "800", color: "#FFF", marginBottom: 16 },
  switchSub: {
    fontSize: 18, color: "#DBEAFE", textAlign: "center", lineHeight: 28, marginBottom: 32,
  },
  switchHighlight: { fontWeight: "800", color: "#FFF" },
  switchBtn: {
    backgroundColor: "#FFF", paddingVertical: 16, paddingHorizontal: 40,
    borderRadius: 14, alignItems: "center",
  },
  switchBtnTxt: { fontSize: 17, fontWeight: "700", color: "#1565C0" },
});
