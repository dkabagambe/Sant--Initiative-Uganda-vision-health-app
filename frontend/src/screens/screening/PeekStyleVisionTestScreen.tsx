/**
 * PeekStyleVisionTestScreen
 * ─────────────────────────────────────────────────────────────────────────────
 * Step 5 Distance Vision Test — cloned from Peek Acuity logic.
 *
 * Protocol (Peek Acuity at 2 m):
 *  • Acuity levels (Snellen / LogMAR):
 *      6/60  (1.0)  →  6/36  (0.78)  →  6/24  (0.60)  →  6/18  (0.48)
 *      6/12  (0.30) →  6/9   (0.18)  →  6/6   (0.00)
 *  • Each level: show 3 letters, random direction, no consecutive repeats.
 *  • Pass criterion: ≥ 2/3 correct → advance to next (smaller) level.
 *  • Fail criterion: ≤ 1/3 correct → record acuity as the PREVIOUS passed level.
 *  • If patient fails 6/60: offer 1 m re-test, then count-fingers/hand-movement/
 *    light-perception options.
 *  • Test RIGHT eye first (cover left), then LEFT eye (cover right).
 *  • Operator holds phone; patient verbally or gesturally points direction.
 *
 * Display (black on white, white background):
 *  • SVG Tumbling E — 5×5 grid, solid black, white background.
 *  • Size at each level = physicalDp(letterHeightMM_at_2m).
 *    Peek uses 2 m distance; letter heights are 2/3 of standard 3 m sizes.
 *  • Size clamped to min(computed, screenWidth * 0.85) so it always fits.
 *  • Smooth animated direction/size transitions with scale + fade.
 *
 * Calibration screen:
 *  • Asks operator to maximise screen brightness (manual: Settings → Display).
 *  • Checks ambient light via an informational prompt (no sensor API needed).
 *
 * Results screen:
 *  • Shows Snellen fraction and LogMAR for each eye.
 *  • "Simulated blur" view — a blurred circle overlay over a placeholder scene —
 *    to explain the level of vision loss to the patient.
 *  • Saves right_eye, left_eye, distance_m, date_tested to ScreeningContext.
 *
 * Navigation:
 *  • On both eyes tested → VisionScreen6 (Near Vision Test)
 *  • On referral needed → CreateReferralScreen (same as VisionScreen5)
 *
 * NOTE: This is a React Native / Expo TypeScript screen.
 *  The filename ends in .tsx — NOT a Kotlin/Compose file.
 *  The package.json does not include expo-brightness; brightness is handled
 *  via a manual user prompt on the calibration screen.
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
  ScrollView,
  Animated,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useScreening } from "../../context/ScreeningContext";
import { apiService } from "../../services/api";
import TumblingE, { EDirection, physicalDp } from "../../components/TumblingE";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Acuity ladder ────────────────────────────────────────────────────────────
/**
 * Letter heights at 2 metres (Snellen standard).
 * Physical formula: h = 5 × MAR × distance / 3438  (in mm, distance in mm).
 * At 2000 mm:
 *   6/60 → MAR=10 → 5×10×2000/3438 ≈ 29.1 mm
 *   6/36 → MAR=6  → 5×6 ×2000/3438 ≈ 17.5 mm
 *   6/24 → MAR=4  → 5×4 ×2000/3438 ≈ 11.6 mm
 *   6/18 → MAR=3  → 5×3 ×2000/3438 ≈  8.7 mm
 *   6/12 → MAR=2  → 5×2 ×2000/3438 ≈  5.8 mm
 *   6/9  → MAR=1.5→ 5×1.5×2000/3438≈  4.4 mm
 *   6/6  → MAR=1  → 5×1 ×2000/3438 ≈  2.9 mm
 */
interface AcuityLevel {
  snellen: string;   // e.g. "6/60"
  logmar: number;    // e.g. 1.0
  heightMM: number;  // letter height at 2 m in mm
}

const ACUITY_LADDER: AcuityLevel[] = [
  { snellen: "6/60", logmar: 1.00, heightMM: 29.1 },
  { snellen: "6/36", logmar: 0.78, heightMM: 17.5 },
  { snellen: "6/24", logmar: 0.60, heightMM: 11.6 },
  { snellen: "6/18", logmar: 0.48, heightMM:  8.7 },
  { snellen: "6/12", logmar: 0.30, heightMM:  5.8 },
  { snellen: "6/9",  logmar: 0.18, heightMM:  4.4 },
  { snellen: "6/6",  logmar: 0.00, heightMM:  2.9 },
];

// Blur levels (0–4) matched to logmar for the simulation overlay
function blurForLogMAR(logmar: number): number {
  if (logmar >= 1.0) return 16;
  if (logmar >= 0.6) return 10;
  if (logmar >= 0.3) return 6;
  if (logmar >= 0.1) return 3;
  return 0;
}

const DIRECTIONS: EDirection[] = ["right", "down", "left", "up"];
const LETTERS_PER_LEVEL = 3;
const PASS_THRESHOLD    = 2; // ≥ 2/3 to pass

function randomDirection(exclude?: EDirection): EDirection {
  let d: EDirection;
  do { d = DIRECTIONS[Math.floor(Math.random() * 4)]; } while (d === exclude);
  return d;
}

function makeSequence(): EDirection[] {
  const seq: EDirection[] = [];
  for (let i = 0; i < LETTERS_PER_LEVEL; i++) {
    seq.push(randomDirection(seq[i - 1]));
  }
  return seq;
}

function eSizeDp(level: AcuityLevel): number {
  return Math.min(physicalDp(level.heightMM), SCREEN_W * 0.85);
}

// ─── Phase types ──────────────────────────────────────────────────────────────
type Eye   = "right" | "left";
type Phase = "calibration" | "instructions" | "testing" | "eye_result" | "final_result";

interface EyeRecord {
  acuity: AcuityLevel | null;  // null = below 6/60
  snellen: string;
  logmar: number | null;
  passed6_60: boolean;
  failedBefore6_60: boolean;   // true if failed at 6/60 itself
  retested1m: boolean;
  countFingers: boolean | null;
  handMovement: boolean | null;
  lightPerception: boolean | null;
}

const NULL_EYE: EyeRecord = {
  acuity: null,
  snellen: "< 6/60",
  logmar: null,
  passed6_60: false,
  failedBefore6_60: false,
  retested1m: false,
  countFingers: null,
  handMovement: null,
  lightPerception: null,
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function PeekStyleVisionTestScreen() {
  const navigation  = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const [userData, setUserData] = useState<any>(null);

  // ── Phase state ──
  const [phase,      setPhase]      = useState<Phase>("calibration");
  const [currentEye, setCurrentEye] = useState<Eye>("right");
  const [eyeRecords, setEyeRecords] = useState<Record<Eye, EyeRecord | null>>({
    right: null,
    left:  null,
  });

  // ── Testing sub-state ──
  const [levelIdx,     setLevelIdx]     = useState(0);        // index into ACUITY_LADDER
  const [sequence,     setSequence]     = useState<EDirection[]>([]);
  const [letterIdx,    setLetterIdx]    = useState(0);
  const [lineResults,  setLineResults]  = useState<boolean[]>([]);
  const [lastPassedLevel, setLastPassedLevel] = useState<number | null>(null); // idx

  // ── Low-vision sub-state (fail at 6/60) ──
  const [lowVisionPhase, setLowVisionPhase] = useState<
    "idle" | "retest_1m" | "count_fingers" | "hand_movement" | "light_perception"
  >("idle");
  const [retest1mResults, setRetest1mResults]  = useState<boolean[]>([]);

  // ── Animation refs ──
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    apiService.getCurrentUser().then(u => { if (u) setUserData(u); }).catch(() => {});
  }, []);

  // Animate between letters
  const animateTransition = useCallback((fn: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      fn();
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, scaleAnim]);

  // ── Start an eye ──────────────────────────────────────────────────────────
  const startEye = useCallback((eye: Eye) => {
    setCurrentEye(eye);
    setPhase("instructions");
    setLevelIdx(0);
    setLetterIdx(0);
    setLineResults([]);
    setLastPassedLevel(null);
    setLowVisionPhase("idle");
    setRetest1mResults([]);
  }, []);

  // ── Begin testing this eye from current levelIdx ──────────────────────────
  const beginLevel = useCallback((idx: number) => {
    setSequence(makeSequence());
    setLetterIdx(0);
    setLineResults([]);
    setLevelIdx(idx);
    setPhase("testing");
  }, []);

  // ── Record an answer ──────────────────────────────────────────────────────
  const recordAnswer = useCallback(
    (correct: boolean) => {
      const newResults = [...lineResults, correct];

      if (newResults.length < LETTERS_PER_LEVEL) {
        // More letters remain
        animateTransition(() => {
          setLineResults(newResults);
          setLetterIdx(i => i + 1);
        });
        return;
      }

      // Level complete
      const correctCount = newResults.filter(Boolean).length;
      const passed = correctCount >= PASS_THRESHOLD;

      if (passed) {
        const nextIdx = levelIdx + 1;
        if (nextIdx >= ACUITY_LADDER.length) {
          // Reached best (6/6) — record it
          finishEye(currentEye, levelIdx, newResults, false);
        } else {
          setLastPassedLevel(levelIdx);
          animateTransition(() => beginLevel(nextIdx));
        }
      } else {
        // Failed this level
        if (levelIdx === 0) {
          // Failed at 6/60 — enter low-vision assessment
          setLineResults(newResults);
          setLowVisionPhase("retest_1m");
          setRetest1mResults([]);
        } else {
          // Record the last passed level as the result
          finishEye(currentEye, lastPassedLevel ?? (levelIdx - 1), newResults, false);
        }
      }
    },
    [lineResults, levelIdx, currentEye, lastPassedLevel, animateTransition, beginLevel]
  );

  // ── Record answer in 1 m retest ──────────────────────────────────────────
  const record1mAnswer = useCallback(
    (correct: boolean) => {
      const updated = [...retest1mResults, correct];
      if (updated.length < LETTERS_PER_LEVEL) {
        setRetest1mResults(updated);
        return;
      }
      const passed = updated.filter(Boolean).length >= PASS_THRESHOLD;
      if (passed) {
        // 6/60 at 1 m → visual acuity ~6/60 but borderline — record 6/60
        finishEye(currentEye, 0, lineResults, false, { retested1m: true });
      } else {
        setLowVisionPhase("count_fingers");
      }
      setRetest1mResults(updated);
    },
    [retest1mResults, currentEye, lineResults]
  );

  // ── Finish an eye ─────────────────────────────────────────────────────────
  const finishEye = useCallback(
    (
      eye: Eye,
      passedLevelIdx: number,
      _results: boolean[],
      _failedBefore6_60 = false,
      extra?: Partial<EyeRecord>
    ) => {
      const level = ACUITY_LADDER[passedLevelIdx];
      const record: EyeRecord = {
        acuity: level,
        snellen: level.snellen,
        logmar: level.logmar,
        passed6_60: passedLevelIdx >= 0,
        failedBefore6_60: false,
        retested1m: false,
        countFingers: null,
        handMovement: null,
        lightPerception: null,
        ...extra,
      };
      setEyeRecords(prev => ({ ...prev, [eye]: record }));
      setPhase("eye_result");
    },
    []
  );

  const finishEyeLowVision = useCallback(
    (
      eye: Eye,
      cf: boolean | null,
      hm: boolean | null,
      lp: boolean | null
    ) => {
      const record: EyeRecord = {
        ...NULL_EYE,
        failedBefore6_60: true,
        retested1m: true,
        countFingers: cf,
        handMovement: hm,
        lightPerception: lp,
      };
      setEyeRecords(prev => ({ ...prev, [eye]: record }));
      setPhase("eye_result");
    },
    []
  );

  // ── After eye result, proceed ─────────────────────────────────────────────
  const handleEyeResultNext = useCallback(async () => {
    const record = eyeRecords[currentEye];
    const isReferralNeeded =
      !record ||
      record.failedBefore6_60 ||
      (record.logmar !== null && record.logmar > 0.48); // worse than 6/18 → refer

    if (isReferralNeeded && currentEye === "right") {
      // Still test the left eye first, then decide referral at the end
    }

    if (currentEye === "right") {
      startEye("left");
    } else {
      setPhase("final_result");
    }
  }, [currentEye, eyeRecords, startEye]);

  // ── Build referral and navigate ───────────────────────────────────────────
  const completeAndNavigate = useCallback(
    async (navigateTo: "VisionScreen6" | "CreateReferralScreen") => {
      const rRec = eyeRecords.right;
      const lRec = eyeRecords.left;

      const rightStr = rRec
        ? rRec.failedBefore6_60
          ? `< 6/60 (CF:${rRec.countFingers} HM:${rRec.handMovement} LP:${rRec.lightPerception})`
          : `${rRec.snellen} (LogMAR ${rRec.logmar?.toFixed(2)})`
        : "not_tested";
      const leftStr = lRec
        ? lRec.failedBefore6_60
          ? `< 6/60 (CF:${lRec.countFingers} HM:${lRec.handMovement} LP:${lRec.lightPerception})`
          : `${lRec.snellen} (LogMAR ${lRec.logmar?.toFixed(2)})`
        : "not_tested";

      const needsRef =
        (rRec?.failedBefore6_60 ?? false) ||
        (lRec?.failedBefore6_60 ?? false) ||
        (rRec?.logmar !== null && (rRec?.logmar ?? 0) > 0.48) ||
        (lRec?.logmar !== null && (lRec?.logmar ?? 0) > 0.48);

      const updated = {
        distanceVisionRight:  rightStr,
        distanceVisionLeft:   leftStr,
        distanceVisionResult: needsRef ? "failed" : "passed",
        needsReferral:        needsRef,
        referralReason:       needsRef ? "Failed distance vision at ≥ 6/18 threshold (Step 5)" : "",
        referralUrgency:      "normal" as const,
        referralStep:         "Step 5 - Distance Vision Test (Peek)",
      };
      updateScreeningData(updated);

      if (navigateTo === "VisionScreen6") {
        navigation.navigate("VisionScreen6");
        return;
      }

      // Save + referral
      let savedId: string | null = null;
      try {
        const res = await apiService.createScreening({ ...screeningData, ...updated });
        if (res.success) savedId = res.data?.id || res.screeningId || null;
      } catch {
        try {
          const q = await AsyncStorage.getItem("offlineScreenings");
          const queue = q ? JSON.parse(q) : [];
          queue.push({ ...screeningData, ...updated, offlineId: Date.now().toString(), timestamp: new Date().toISOString() });
          await AsyncStorage.setItem("offlineScreenings", JSON.stringify(queue));
        } catch {}
      }

      const root = navigation.getParent()?.getParent();
      const params = {
        fromScreening: true,
        screeningId:   savedId,
        clientName:    screeningData.clientName || "",
        clientPhone:   screeningData.clientPhone || "",
        clientAge:     screeningData.clientAge || "",
        clientSex:     screeningData.clientGender || "",
        district:      screeningData.district || "",
        county:        screeningData.county || "",
        subCounty:     screeningData.subCounty || "",
        parish:        screeningData.parish || "",
        reason:        updated.referralReason,
        urgency:       "normal",
        notes:         `Step 5 Peek Vision Test — R: ${rightStr}  L: ${leftStr}`,
      };
      if (root) root.navigate("CreateReferralScreen", params);
      else navigation.navigate("CreateReferralScreen" as any, params);
    },
    [eyeRecords, screeningData, updateScreeningData, navigation]
  );

  const eyeLabel  = currentEye === "right" ? "RIGHT" : "LEFT";
  const coverEye  = currentEye === "right" ? "LEFT"  : "RIGHT";

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE: Calibration
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "calibration") {
    return (
      <SafeAreaView style={styles.lightContainer}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <SmallHeader userData={userData} navigation={navigation} />
        <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>

          <Text style={styles.pageTitle}>Step 5: Peek Distance Vision</Text>

          <View style={styles.calCard}>
            <Text style={styles.calTitle}>📱 Calibrate Before Testing</Text>

            <CalStep icon="sunny" color="#F59E0B" title="Max Brightness">
              Go to <Text style={styles.bold}>Settings → Display → Brightness</Text>.{"\n"}
              Drag slider all the way to maximum, or use the quick-settings panel.
            </CalStep>

            <CalStep icon="partly-sunny" color="#3B82F6" title="Check Ambient Light">
              Do NOT stand directly in sunlight or very bright glare.{"\n"}
              Normal indoor or shade lighting is ideal.
            </CalStep>

            <CalStep icon="expand" color="#8B5CF6" title="Distance: 2 Metres">
              Mark 2 metres on the ground with your foot.{"\n"}
              Client stands at the mark, operator holds phone.
            </CalStep>

            <CalStep icon="eye-off" color="#EF4444" title="Cover Fellow Eye">
              Client covers the eye not being tested with their palm —{"\n"}
              NOT pressing hard, just a gentle cover.
            </CalStep>
          </View>

          {/* Live preview of the E so the operator can confirm it is visible */}
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>E preview (6/60 at 2 m)</Text>
            <View style={styles.previewEBox}>
              <TumblingE
                direction="right"
                size={Math.min(physicalDp(29.1), SCREEN_W * 0.55)}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text style={styles.previewSub}>
              The E should be solid black, sharp, with clear white gaps.{"\n"}
              If it looks grey/blurry, wipe the screen.
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => startEye("right")}>
            <Ionicons name="eye" size={20} color="#FFF" />
            <Text style={styles.primaryBtnText}>Setup complete — Start Test →</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE: Instructions
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "instructions") {
    return (
      <SafeAreaView style={styles.lightContainer}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <SmallHeader userData={userData} navigation={navigation} />
        <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>

          <View style={[styles.eyeBanner, { backgroundColor: currentEye === "right" ? "#1D4ED8" : "#7C3AED" }]}>
            <Ionicons name="eye" size={18} color="#FFF" />
            <Text style={styles.eyeBannerText}>
              {currentEye === "right" ? "1st" : "2nd"}: Testing {eyeLabel} EYE
            </Text>
          </View>

          <View style={styles.instCard}>
            <Text style={styles.instCardTitle}>👁️ Ready to test {eyeLabel} eye</Text>
            <InstrRow n="1" text={`Ask client to cover their ${coverEye} eye gently with their palm.`} />
            <InstrRow n="2" text={`Stand ${currentEye === "right" ? "2 metres" : "still at 2 metres"} from the client.`} />
            <InstrRow n="3" text={`Say: "I'll show you a letter shaped like an E. Tell me which way the legs are pointing: Up, Down, Left, or Right."`} />
            <InstrRow n="4" text="Start with the largest letter — show one at a time." />
          </View>

          {/* Direction reference */}
          <View style={styles.dirCard}>
            <Text style={styles.instCardTitle}>Direction Reference</Text>
            <View style={styles.dirRow}>
              {(["right","down","left","up"] as EDirection[]).map(d => (
                <View key={d} style={styles.dirItem}>
                  <View style={styles.dirEWrap}>
                    <TumblingE direction={d} size={36} color="#000000" />
                  </View>
                  <Text style={styles.dirLabel}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: currentEye === "right" ? "#1D4ED8" : "#7C3AED" }]}
            onPress={() => beginLevel(0)}
          >
            <Text style={styles.primaryBtnText}>Begin {eyeLabel} Eye Test →</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE: Testing
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "testing") {
    const level       = ACUITY_LADDER[levelIdx];
    const eSize       = eSizeDp(level);
    const direction   = sequence[letterIdx] ?? "right";
    const correct     = lineResults.filter(Boolean).length;
    const wrong       = lineResults.filter(r => !r).length;
    const remaining   = LETTERS_PER_LEVEL - lineResults.length - 1;
    const canStillPass= correct + remaining + 1 >= PASS_THRESHOLD;

    // Low-vision sub-screens (still in "testing" phase, different UI)
    if (lowVisionPhase === "retest_1m") {
      return (
        <LowVision1mScreen
          eye={currentEye}
          results={retest1mResults}
          onAnswer={record1mAnswer}
          level={ACUITY_LADDER[0]}
        />
      );
    }
    if (lowVisionPhase === "count_fingers") {
      return (
        <LowVisionChoiceScreen
          eye={currentEye}
          title="Can the client count fingers?"
          subtitle="Hold up 2-4 fingers at 1 metre. Ask: 'How many fingers?'"
          onYes={() => finishEyeLowVision(currentEye, true, null, null)}
          onNo={() => setLowVisionPhase("hand_movement")}
        />
      );
    }
    if (lowVisionPhase === "hand_movement") {
      return (
        <LowVisionChoiceScreen
          eye={currentEye}
          title="Can the client detect hand movement?"
          subtitle="Wave your hand slowly 30 cm from the eye. Ask: 'Is my hand moving?'"
          onYes={() => finishEyeLowVision(currentEye, false, true, null)}
          onNo={() => setLowVisionPhase("light_perception")}
        />
      );
    }
    if (lowVisionPhase === "light_perception") {
      return (
        <LowVisionChoiceScreen
          eye={currentEye}
          title="Can the client perceive light?"
          subtitle="Cover the room, shine a torch. Ask: 'Can you see the light?'"
          onYes={() => finishEyeLowVision(currentEye, false, false, true)}
          onNo={() => finishEyeLowVision(currentEye, false, false, false)}
        />
      );
    }

    return (
      <SafeAreaView style={styles.testRoot}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <View style={styles.testTopBar}>
          <View style={[styles.eyePill, { backgroundColor: currentEye === "right" ? "#1D4ED8" : "#7C3AED" }]}>
            <Text style={styles.eyePillTxt}>{eyeLabel}</Text>
          </View>

          <View style={styles.levelInfo}>
            <Text style={styles.levelSnellen}>{level.snellen}</Text>
            <Text style={styles.levelLogmar}>LogMAR {level.logmar.toFixed(2)}</Text>
          </View>

          {/* Letter dots */}
          <View style={styles.dotRow}>
            {Array.from({ length: LETTERS_PER_LEVEL }).map((_, i) => {
              const done  = i < lineResults.length;
              const isOk  = done && lineResults[i];
              const isErr = done && !lineResults[i];
              const isCur = i === lineResults.length;
              return (
                <View key={i} style={[
                  styles.dot,
                  isOk  && styles.dotGreen,
                  isErr && styles.dotRed,
                  isCur && styles.dotBlue,
                  !done && !isCur && styles.dotGrey,
                ]} />
              );
            })}
          </View>
        </View>

        {/* ── Score bar ───────────────────────────────────────────────── */}
        <View style={styles.scoreBar}>
          <Text style={styles.scoreTxt}>
            <Text style={{ color: "#16A34A" }}>✓ {correct}</Text>
            {"  "}
            <Text style={{ color: "#6B7280" }}>need ≥{PASS_THRESHOLD}</Text>
            {"  "}
            <Text style={{ color: "#DC2626" }}>✗ {wrong}</Text>
          </Text>
        </View>

        {/* ── E canvas — WHITE background, BLACK letter ──────────────── */}
        <View style={styles.eCanvas}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <TumblingE
              key={`${direction}-${letterIdx}-${levelIdx}`}
              direction={direction}
              size={eSize}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </Animated.View>
        </View>

        {/* ── Prompt ──────────────────────────────────────────────────── */}
        <Text style={styles.prompt}>
          "Which way do the legs of the E point?"
        </Text>

        {/* ── Arrow buttons ───────────────────────────────────────────── */}
        <View style={styles.arrowGrid}>
          <View style={styles.arrowRow}>
            <DirectionBtn direction="up"    onPress={() => recordAnswer(direction === "up")} />
          </View>
          <View style={styles.arrowRow}>
            <DirectionBtn direction="left"  onPress={() => recordAnswer(direction === "left")} />
            <CantSeeBtn                     onPress={() => recordAnswer(false)} />
            <DirectionBtn direction="right" onPress={() => recordAnswer(direction === "right")} />
          </View>
          <View style={styles.arrowRow}>
            <DirectionBtn direction="down"  onPress={() => recordAnswer(direction === "down")} />
          </View>
        </View>

        {/* ── Early fail warning ──────────────────────────────────────── */}
        {!canStillPass && (
          <View style={styles.earlyFail}>
            <Ionicons name="alert-circle" size={14} color="#DC2626" />
            <Text style={styles.earlyFailTxt}>
              Cannot reach {PASS_THRESHOLD} correct — will move to previous level
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE: Eye result
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "eye_result") {
    const rec = eyeRecords[currentEye];
    const needsRef = !rec || rec.failedBefore6_60 || (rec.logmar !== null && rec.logmar > 0.48);
    const blur     = rec?.logmar != null ? blurForLogMAR(rec.logmar) : 18;

    return (
      <SafeAreaView style={styles.lightContainer}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <SmallHeader userData={userData} navigation={navigation} />
        <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>

          {/* Result card */}
          <View style={[styles.resultCard, needsRef ? styles.cardFail : styles.cardPass]}>
            <Text style={styles.resultEyeLbl}>
              {eyeLabel} EYE — {needsRef ? "❌ REFER" : "✅ PASS"}
            </Text>

            {rec?.failedBefore6_60 ? (
              <View>
                <Text style={styles.resultSnellen}>Below 6/60</Text>
                {rec.countFingers !== null && (
                  <Text style={styles.resultDetail}>Count Fingers: {rec.countFingers ? "Yes ✓" : "No ✗"}</Text>
                )}
                {rec.handMovement !== null && (
                  <Text style={styles.resultDetail}>Hand Movement: {rec.handMovement ? "Yes ✓" : "No ✗"}</Text>
                )}
                {rec.lightPerception !== null && (
                  <Text style={styles.resultDetail}>Light Perception: {rec.lightPerception ? "Yes ✓" : "No ✗"}</Text>
                )}
              </View>
            ) : (
              <View>
                <Text style={styles.resultSnellen}>{rec?.snellen ?? "—"}</Text>
                <Text style={styles.resultLogmar}>LogMAR {rec?.logmar?.toFixed(2) ?? "—"}</Text>
              </View>
            )}
          </View>

          {/* Simulated blur explanation */}
          <View style={styles.simCard}>
            <Text style={styles.simTitle}>What the client sees (approx.)</Text>
            <BlurSimulation blurRadius={blur} />
            <Text style={styles.simCaption}>
              {rec?.failedBefore6_60
                ? "Severe visual impairment — urgent referral recommended."
                : needsRef
                ? `Vision of ${rec?.snellen} — referral recommended.`
                : `Vision of ${rec?.snellen} is within normal range.`}
            </Text>
          </View>

          {/* Action advice */}
          <View style={styles.actionCard}>
            {needsRef ? (
              <>
                <Ionicons name="alert-circle" size={22} color="#DC2626" />
                <Text style={styles.actionTxt}>
                  {eyeLabel} eye vision is below the referral threshold (6/18).
                  {"\n"}Record "N" in Distance Vision Pass column and refer the client.
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                <Text style={styles.actionTxt}>
                  {eyeLabel} eye passed.
                  {currentEye === "right" ? " Now test the LEFT eye." : " Both eyes done."}
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: needsRef ? "#DC2626" : (currentEye === "right" ? "#1D4ED8" : "#7C3AED") }]}
            onPress={handleEyeResultNext}
          >
            <Text style={styles.primaryBtnText}>
              {currentEye === "right" ? "Test LEFT Eye →" : "View Final Results →"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE: Final result
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "final_result") {
    const rRec = eyeRecords.right;
    const lRec = eyeRecords.left;
    const rNeedsRef = !rRec || rRec.failedBefore6_60 || (rRec.logmar !== null && rRec.logmar > 0.48);
    const lNeedsRef = !lRec || lRec.failedBefore6_60 || (lRec.logmar !== null && lRec.logmar > 0.48);
    const anyRef    = rNeedsRef || lNeedsRef;

    return (
      <SafeAreaView style={styles.lightContainer}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <SmallHeader userData={userData} navigation={navigation} />
        <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>

          <Text style={styles.pageTitle}>Distance Vision Results</Text>

          {/* Table */}
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHdrTxt]}>Eye</Text>
              <Text style={[styles.tableCell, styles.tableHdrTxt]}>Snellen</Text>
              <Text style={[styles.tableCell, styles.tableHdrTxt]}>LogMAR</Text>
              <Text style={[styles.tableCell, styles.tableHdrTxt]}>Result</Text>
            </View>
            <TableRow
              eye="RIGHT"
              rec={rRec}
              needsRef={rNeedsRef}
              eyeColor="#1D4ED8"
            />
            <TableRow
              eye="LEFT"
              rec={lRec}
              needsRef={lNeedsRef}
              eyeColor="#7C3AED"
            />
          </View>

          {/* Summary blur sim — worst eye */}
          <View style={styles.simCard}>
            <Text style={styles.simTitle}>Worst eye — simulated view</Text>
            <BlurSimulation
              blurRadius={
                Math.max(
                  rRec?.logmar != null ? blurForLogMAR(rRec.logmar) : 18,
                  lRec?.logmar != null ? blurForLogMAR(lRec.logmar) : 18
                )
              }
            />
          </View>

          {/* Action */}
          <View style={[styles.actionCard, anyRef && styles.actionCardRed]}>
            <Ionicons
              name={anyRef ? "alert-circle" : "checkmark-circle"}
              size={22}
              color={anyRef ? "#DC2626" : "#16A34A"}
            />
            <Text style={[styles.actionTxt, anyRef && { color: "#DC2626" }]}>
              {anyRef
                ? "One or both eyes failed. Refer the client to a health facility."
                : "Both eyes passed distance vision screening. Proceed to Near Vision Test."}
            </Text>
          </View>

          {anyRef ? (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: "#DC2626" }]}
              onPress={() => completeAndNavigate("CreateReferralScreen")}
            >
              <Text style={styles.primaryBtnText}>Complete Referral →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => completeAndNavigate("VisionScreen6")}
            >
              <Text style={styles.primaryBtnText}>Continue to Near Vision Test →</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

// ─── Sub-screens for low vision ────────────────────────────────────────────────
function LowVision1mScreen({
  eye, results, onAnswer, level,
}: {
  eye: Eye;
  results: boolean[];
  onAnswer: (correct: boolean) => void;
  level: AcuityLevel;
}) {
  const done     = results.length;
  const eDir     = useRef<EDirection[]>(makeSequence()).current;
  const direction: EDirection = eDir[done] ?? "right";
  const size     = Math.min(physicalDp(level.heightMM), SCREEN_W * 0.85);

  return (
    <SafeAreaView style={styles.testRoot}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.testTopBar}>
        <View style={[styles.eyePill, { backgroundColor: eye === "right" ? "#1D4ED8" : "#7C3AED" }]}>
          <Text style={styles.eyePillTxt}>{eye.toUpperCase()}</Text>
        </View>
        <Text style={styles.levelSnellen}>Retest at 1 m · 6/60</Text>
        <View style={styles.dotRow}>
          {Array.from({ length: LETTERS_PER_LEVEL }).map((_, i) => (
            <View key={i} style={[
              styles.dot,
              i < done && results[i]  && styles.dotGreen,
              i < done && !results[i] && styles.dotRed,
              i === done              && styles.dotBlue,
              i > done                && styles.dotGrey,
            ]} />
          ))}
        </View>
      </View>
      <View style={styles.eCanvas}>
        <TumblingE direction={direction} size={size} color="#000000" backgroundColor="#FFFFFF" />
      </View>
      <Text style={styles.prompt}>1 metre distance · "Which way?"</Text>
      <View style={styles.arrowGrid}>
        <View style={styles.arrowRow}>
          <DirectionBtn direction="up"    onPress={() => onAnswer(direction === "up")} />
        </View>
        <View style={styles.arrowRow}>
          <DirectionBtn direction="left"  onPress={() => onAnswer(direction === "left")} />
          <CantSeeBtn                     onPress={() => onAnswer(false)} />
          <DirectionBtn direction="right" onPress={() => onAnswer(direction === "right")} />
        </View>
        <View style={styles.arrowRow}>
          <DirectionBtn direction="down"  onPress={() => onAnswer(direction === "down")} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function LowVisionChoiceScreen({
  eye, title, subtitle, onYes, onNo,
}: {
  eye: Eye;
  title: string;
  subtitle: string;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <SafeAreaView style={styles.lightContainer}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.lvHeader}>
        <View style={[styles.eyePill, { backgroundColor: eye === "right" ? "#1D4ED8" : "#7C3AED" }]}>
          <Text style={styles.eyePillTxt}>{eye.toUpperCase()} EYE</Text>
        </View>
        <Text style={styles.lvTitle}>Low Vision Assessment</Text>
      </View>
      <View style={styles.lvBody}>
        <Text style={styles.lvQuestion}>{title}</Text>
        <Text style={styles.lvSubtitle}>{subtitle}</Text>
        <View style={styles.lvBtnRow}>
          <TouchableOpacity style={styles.lvYesBtn} onPress={onYes}>
            <Ionicons name="checkmark" size={28} color="#FFF" />
            <Text style={styles.lvBtnTxt}>YES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lvNoBtn} onPress={onNo}>
            <Ionicons name="close" size={28} color="#FFF" />
            <Text style={styles.lvBtnTxt}>NO</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Blur simulation composable ────────────────────────────────────────────────
/**
 * Simulates what the patient sees at a given LogMAR level.
 * Uses overlapping semi-transparent white circles with increasing radius
 * to approximate the blur effect — no blur shader needed.
 */
function BlurSimulation({ blurRadius }: { blurRadius: number }) {
  const SIZE = 200;
  if (blurRadius === 0) {
    return (
      <View style={[styles.blurBox, { width: SIZE, height: SIZE }]}>
        <Text style={styles.blurText}>👁️ Clear</Text>
        <Text style={styles.blurSubText}>6/6 — Normal vision</Text>
      </View>
    );
  }

  const layers = Math.min(blurRadius, 8);
  return (
    <View style={[styles.blurBox, { width: SIZE, height: SIZE }]}>
      {/* Base scene */}
      <Text style={[styles.blurText, { fontSize: Math.max(10, 28 - blurRadius) }]}>
        👁️
      </Text>
      {/* Blur overlay rings */}
      {Array.from({ length: layers }).map((_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width:  SIZE * (0.4 + i * 0.12),
            height: SIZE * (0.4 + i * 0.12),
            borderRadius: (SIZE * (0.4 + i * 0.12)) / 2,
            backgroundColor: `rgba(255,255,255,${0.07 + i * 0.03})`,
            alignSelf: "center",
          }}
        />
      ))}
      <Text style={styles.blurSubText}>Blur level {blurRadius}</Text>
    </View>
  );
}

// ─── Reusable small components ────────────────────────────────────────────────
function SmallHeader({ userData, navigation }: any) {
  return (
    <View style={styles.header}>
      <View style={styles.logoBox}>
        <Image source={require("../../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={styles.headerTitle}>{userData?.fullName || userData?.full_name || "Santé Initiative Uganda"}</Text>
        <Text style={styles.headerSub}>{userData?.district ? `VHT · ${userData.district}` : "Step 5 · Distance Vision"}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.menuBtn}>
        <Ionicons name="menu" size={26} color="#1A4D8F" />
      </TouchableOpacity>
    </View>
  );
}

function CalStep({
  icon, color, title, children,
}: { icon: string; color: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.calStep}>
      <View style={[styles.calStepIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.calStepTitle}>{title}</Text>
        <Text style={styles.calStepBody}>{children}</Text>
      </View>
    </View>
  );
}

function InstrRow({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.instrRow}>
      <View style={styles.instrNum}><Text style={styles.instrNumTxt}>{n}</Text></View>
      <Text style={styles.instrTxt}>{text}</Text>
    </View>
  );
}

function DirectionBtn({ direction, onPress }: { direction: EDirection; onPress: () => void }) {
  const icon =
    direction === "up"    ? "arrow-up"      :
    direction === "down"  ? "arrow-down"    :
    direction === "left"  ? "arrow-back"    : "arrow-forward";
  const label =
    direction === "up"    ? "Up"    :
    direction === "down"  ? "Down"  :
    direction === "left"  ? "Left"  : "Right";

  return (
    <TouchableOpacity style={styles.arrowBtn} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name={icon as any} size={34} color="#1D4ED8" />
      <Text style={styles.arrowLbl}>{label}</Text>
    </TouchableOpacity>
  );
}

function CantSeeBtn({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.cantSeeBtn} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name="eye-off-outline" size={22} color="#9CA3AF" />
      <Text style={styles.cantSeeLbl}>Can't{"\n"}See</Text>
    </TouchableOpacity>
  );
}

function TableRow({
  eye, rec, needsRef, eyeColor,
}: { eye: string; rec: EyeRecord | null; needsRef: boolean; eyeColor: string }) {
  return (
    <View style={[styles.tableRow, needsRef && styles.tableRowFail]}>
      <Text style={[styles.tableCell, { color: eyeColor, fontWeight: "700" }]}>{eye}</Text>
      <Text style={styles.tableCell}>
        {rec?.failedBefore6_60 ? "< 6/60" : rec?.snellen ?? "—"}
      </Text>
      <Text style={styles.tableCell}>
        {rec?.failedBefore6_60 ? "—" : (rec?.logmar?.toFixed(2) ?? "—")}
      </Text>
      <Text style={[styles.tableCell, { color: needsRef ? "#DC2626" : "#16A34A", fontWeight: "700" }]}>
        {needsRef ? "REFER" : "PASS"}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Layout ──
  lightContainer: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollPad:      { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 40 },

  // ── Header ──
  header: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 14, paddingVertical: 10, paddingTop: 42,
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
    elevation: 2,
  },
  logoBox:   { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  logo:      { width: 36, height: 36 },
  headerTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  headerSub:   { fontSize: 11, color: "#6B7280", marginTop: 1 },
  menuBtn:     { width: 40, alignItems: "flex-end" },

  // ── Typography ──
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 16 },
  bold:      { fontWeight: "700" },

  // ── Eye banner ──
  eyeBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24,
    alignSelf: "center", marginBottom: 18,
  },
  eyeBannerText: { fontSize: 16, fontWeight: "700", color: "#FFF" },

  // ── Calibration ──
  calCard: {
    backgroundColor: "#FFF", borderRadius: 14, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: "#E5E7EB", elevation: 1,
  },
  calTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 14 },
  calStep: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  calStepIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  calStepTitle: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 2 },
  calStepBody:  { fontSize: 13, color: "#4B5563", lineHeight: 18 },

  previewCard: {
    backgroundColor: "#FFF", borderRadius: 14, padding: 18, marginBottom: 20,
    borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center",
  },
  previewLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 12 },
  previewEBox:  {
    backgroundColor: "#FFFFFF",
    borderWidth: 2, borderColor: "#E5E7EB", borderRadius: 12,
    padding: 16, marginBottom: 10,
    justifyContent: "center", alignItems: "center",
  },
  previewSub: { fontSize: 12, color: "#6B7280", textAlign: "center", lineHeight: 17 },

  // ── Instructions ──
  instCard: {
    backgroundColor: "#FFF", borderRadius: 14, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  instCardTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 12 },
  instrRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  instrNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#1D4ED8",
    justifyContent: "center", alignItems: "center", marginRight: 10, marginTop: 1,
  },
  instrNumTxt: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  instrTxt:    { flex: 1, fontSize: 13, color: "#374151", lineHeight: 19 },

  dirCard: {
    backgroundColor: "#FFF", borderRadius: 14, padding: 18, marginBottom: 20,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  dirRow:  { flexDirection: "row", justifyContent: "space-around", paddingVertical: 8 },
  dirItem: { alignItems: "center", gap: 6 },
  dirEWrap: {
    backgroundColor: "#FFF", borderRadius: 8, padding: 6,
    borderWidth: 1, borderColor: "#D1D5DB",
    elevation: 1,
  },
  dirLabel: { fontSize: 11, fontWeight: "700", color: "#374151" },

  // ── Testing ──
  testRoot: { flex: 1, backgroundColor: "#FFFFFF" },

  testTopBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 10, paddingTop: 14,
    backgroundColor: "#FFF",
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  eyePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  eyePillTxt: { fontSize: 11, fontWeight: "700", color: "#FFF" },

  levelInfo:    { alignItems: "center" },
  levelSnellen: { fontSize: 14, fontWeight: "700", color: "#111827" },
  levelLogmar:  { fontSize: 10, color: "#6B7280" },

  dotRow: { flexDirection: "row", gap: 6 },
  dot:       { width: 10, height: 10, borderRadius: 5 },
  dotGreen:  { backgroundColor: "#16A34A" },
  dotRed:    { backgroundColor: "#DC2626" },
  dotBlue:   { backgroundColor: "#1D4ED8" },
  dotGrey:   { backgroundColor: "#D1D5DB" },

  scoreBar: {
    paddingHorizontal: 24, paddingVertical: 8,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
    alignItems: "center",
  },
  scoreTxt: { fontSize: 14, fontWeight: "600" },

  // ── E Canvas — WHITE background, BLACK E ──
  eCanvas: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  prompt: {
    textAlign: "center", fontSize: 14, color: "#4B5563",
    fontStyle: "italic", paddingHorizontal: 20, marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },

  arrowGrid: { paddingHorizontal: 12, paddingBottom: 12, backgroundColor: "#FFFFFF" },
  arrowRow:  { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },

  arrowBtn: {
    width: 82, height: 82, borderRadius: 16,
    borderWidth: 2, borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    justifyContent: "center", alignItems: "center", gap: 4,
  },
  arrowLbl: { fontSize: 11, fontWeight: "700", color: "#1D4ED8" },

  cantSeeBtn: {
    width: 82, height: 82, borderRadius: 16,
    borderWidth: 2, borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    justifyContent: "center", alignItems: "center", gap: 4,
  },
  cantSeeLbl: { fontSize: 10, fontWeight: "600", color: "#9CA3AF", textAlign: "center" },

  earlyFail: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA",
    padding: 8, margin: 12, borderRadius: 8,
  },
  earlyFailTxt: { flex: 1, fontSize: 12, color: "#DC2626" },

  // ── Eye result ──
  resultCard: { borderRadius: 14, padding: 20, marginBottom: 16, borderWidth: 2 },
  cardPass:   { backgroundColor: "#F0FDF4", borderColor: "#16A34A" },
  cardFail:   { backgroundColor: "#FEF2F2", borderColor: "#DC2626" },
  resultEyeLbl: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 10 },
  resultSnellen: { fontSize: 28, fontWeight: "800", color: "#111827" },
  resultLogmar:  { fontSize: 14, color: "#6B7280", marginTop: 2 },
  resultDetail:  { fontSize: 13, color: "#374151", marginTop: 4 },

  // ── Blur sim ──
  simCard: {
    backgroundColor: "#FFF", borderRadius: 14, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center",
  },
  simTitle:   { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 12 },
  simCaption: { fontSize: 12, color: "#6B7280", marginTop: 10, textAlign: "center" },

  blurBox: {
    backgroundColor: "#1F2937", borderRadius: 12,
    justifyContent: "center", alignItems: "center",
    overflow: "hidden",
  },
  blurText:    { fontSize: 28, zIndex: 1 },
  blurSubText: { fontSize: 10, color: "#D1D5DB", marginTop: 4, zIndex: 1 },

  // ── Action card ──
  actionCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  actionCardRed: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
  actionTxt: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },

  // ── Table ──
  tableCard: {
    backgroundColor: "#FFF", borderRadius: 14, overflow: "hidden", marginBottom: 16,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  tableHeader: { flexDirection: "row", backgroundColor: "#F3F4F6", paddingVertical: 10, paddingHorizontal: 8 },
  tableHdrTxt: { fontSize: 12, fontWeight: "700", color: "#374151" },
  tableRow:    { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  tableRowFail:{ backgroundColor: "#FEF2F2" },
  tableCell:   { flex: 1, fontSize: 13, color: "#111827", textAlign: "center" },

  // ── Low-vision screens ──
  lvHeader: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 16, paddingTop: 44, backgroundColor: "#FFF",
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },
  lvTitle:    { fontSize: 16, fontWeight: "700", color: "#111827" },
  lvBody:     { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  lvQuestion: { fontSize: 20, fontWeight: "700", color: "#111827", textAlign: "center", marginBottom: 12 },
  lvSubtitle: { fontSize: 14, color: "#4B5563", textAlign: "center", lineHeight: 20, marginBottom: 32 },
  lvBtnRow:   { flexDirection: "row", gap: 24 },
  lvYesBtn: {
    width: 110, height: 110, borderRadius: 20,
    backgroundColor: "#16A34A", justifyContent: "center", alignItems: "center", gap: 6,
  },
  lvNoBtn: {
    width: 110, height: 110, borderRadius: 20,
    backgroundColor: "#DC2626", justifyContent: "center", alignItems: "center", gap: 6,
  },
  lvBtnTxt: { fontSize: 16, fontWeight: "700", color: "#FFF" },

  // ── Primary button ──
  primaryBtn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: 8, backgroundColor: "#1D4ED8",
    paddingVertical: 16, borderRadius: 14, marginTop: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
});
