/**
 * VisionScreen5 – Step 5: SANTÉ INITIATIVE Distance Vision Test
 * ──────────────────────────────────────────────────────────────
 * Protocol reference: org.peekvision.public.android (package name only,
 * not affiliated with or endorsed by Peek Vision Ltd).
 *
 *  DISPLAY   : WHITE background (#FFFFFF), BLACK tumbling-E (#000000).
 *  DISTANCE  : 2 metres. Calibration screen sets brightness to max first.
 *  LEVELS    : 6/60 → 6/36 → 6/24 → 6/18 → 6/12 → 6/9 → 6/6
 *              3 letters per level; ≥2/3 correct → advance to smaller.
 *  LOW VISION: Fail 6/60 → retest at 1 m → Count Fingers → Hand
 *              Movement → Light Perception → No Light Perception.
 *  INPUT     : PanGestureHandler swipe (≥80 dp) OR arrow-button tap.
 *  FEEDBACK  : expo-haptics vibration + expo-av beep + 500 ms flash.
 *  SPEECH    : expo-speech "Which way do the legs point?" on each new E.
 *  BRIGHTNESS: expo-brightness sets to 1.0 on calibration screen entry.
 *  EYES      : RIGHT first (cover LEFT) → interstitial → LEFT (cover RIGHT).
 *  RESULTS   : Snellen + LogMAR table, saved to ScreeningContext.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Dimensions,
  Image, ScrollView, Animated,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Audio }        from "expo-av";
import * as Brightness  from "expo-brightness";
import * as Haptics     from "expo-haptics";
import * as Speech      from "expo-speech";
import { useScreening }   from "../../context/ScreeningContext";
import { apiService }     from "../../services/api";
import AsyncStorage       from "@react-native-async-storage/async-storage";
import TumblingE, { EDirection, physicalDp } from "../../components/TumblingE";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Acuity ladder (letter heights at 2 m) ───────────────────────────────────
// h_mm = 5 × MAR × 2000 mm / 3438
interface AcuityLevel { snellen: string; logmar: number; mm: number; }
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
const PASS_THRESHOLD    = 2;   // ≥ 2 / 3
const SWIPE_MIN_DP      = 80;  // px to count as a swipe

// ─── Types ────────────────────────────────────────────────────────────────────
type Eye  = "right" | "left";
type Phase =
  | "calibration"
  | "instructions"
  | "testing"
  | "low_vision"
  | "eye_result"
  | "switch_eye"
  | "final_result";
type LowVisionStep = "retest_1m" | "count_fingers" | "hand_movement" | "light_perception";

interface EyeResult {
  snellen:  string;
  logmar:   number;
  levelIdx: number;   // index in LEVELS; -1 = below 6/60
  cf?:  boolean;      // count fingers
  hm?:  boolean;      // hand movement
  lp?:  boolean;      // light perception
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DIRS: EDirection[] = ["right", "down", "left", "up"];

function nextRandom(exclude?: EDirection): EDirection {
  let d: EDirection;
  do { d = DIRS[Math.floor(Math.random() * 4)]; } while (d === exclude);
  return d;
}

function eSizeDp(lv: AcuityLevel): number {
  return Math.min(physicalDp(lv.mm), SCREEN_W * 0.85);
}

function needsReferral(r: EyeResult | null): boolean {
  if (!r) return true;
  if (r.levelIdx < 0) return true;
  return r.levelIdx < 3;  // worse than 6/18 → refer
}

// ─── Sound helpers ────────────────────────────────────────────────────────────
async function loadSound(
  asset: number,
  ref: React.MutableRefObject<Audio.Sound | null>
): Promise<void> {
  try {
    const { sound } = await Audio.Sound.createAsync(asset);
    ref.current = sound;
  } catch (_) {}
}
async function playSound(ref: React.MutableRefObject<Audio.Sound | null>) {
  try {
    if (!ref.current) return;
    await ref.current.setPositionAsync(0);
    await ref.current.playAsync();
  } catch (_) {}
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VisionScreen5() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const [userData, setUserData] = useState<any>(null);

  // ── Phase / eye ──────────────────────────────────────────────────────────
  const [phase,      setPhase]      = useState<Phase>("calibration");
  const [currentEye, setCurrentEye] = useState<Eye>("right");
  const [eyeResults, setEyeResults] = useState<Record<Eye, EyeResult | null>>({
    right: null, left: null,
  });

  // ── Level / letter ───────────────────────────────────────────────────────
  const [levelIdx,  setLevelIdx]  = useState(0);
  const [direction, setDirection] = useState<EDirection>(() => nextRandom());
  const [answers,   setAnswers]   = useState<boolean[]>([]);

  // ── Low-vision ───────────────────────────────────────────────────────────
  const [lvStep,      setLvStep]      = useState<LowVisionStep>("retest_1m");
  const [lv1mAnswers, setLv1mAnswers] = useState<boolean[]>([]);
  // Fixed random sequence for 1 m re-test (generated once)
  const lv1mDirs = useRef<EDirection[]>([nextRandom(), nextRandom(), nextRandom()]);

  // ── Feedback ─────────────────────────────────────────────────────────────
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  // ── Animation ────────────────────────────────────────────────────────────
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ── Sounds ───────────────────────────────────────────────────────────────
  const correctSnd = useRef<Audio.Sound | null>(null);
  const wrongSnd   = useRef<Audio.Sound | null>(null);

  // ── Swipe debounce ────────────────────────────────────────────────────────
  const swipeLock = useRef(false);

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    apiService.getCurrentUser().then(u => { if (u) setUserData(u); }).catch(() => {});

    loadSound(require("../../../assets/sounds/correct.wav"), correctSnd);
    loadSound(require("../../../assets/sounds/wrong.wav"),   wrongSnd);

    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(() => {});

    return () => {
      correctSnd.current?.unloadAsync().catch(() => {});
      wrongSnd.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // ── Max brightness on calibration entry; restore on unmount ─────────────
  useEffect(() => {
    let originalBrightness = 0.5;
    if (phase !== "calibration") return;
    Brightness.requestPermissionsAsync()
      .then(({ granted }) => {
        if (!granted) return;
        // Save original before overriding
        Brightness.getBrightnessAsync()
          .then(b => { originalBrightness = b; })
          .catch(() => {});
        Brightness.setBrightnessAsync(1.0).catch(() => {});
      })
      .catch(() => {});
    return () => {
      // Restore brightness when leaving calibration or unmounting
      Brightness.setBrightnessAsync(originalBrightness).catch(() => {});
    };
  }, [phase]);

  // ── Animate E transition ─────────────────────────────────────────────────
  const animateChange = useCallback((fn: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0,    duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.82, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      fn();
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 170, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 170, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, scaleAnim]);

  // ── Speech ────────────────────────────────────────────────────────────────
  const speakPrompt = useCallback(() => {
    Speech.speak("Which way do the legs point?", {
      language: "en-UG",
      rate: 0.9,
      onError: () => {},
    });
  }, []);

  // ── Haptic + sound + flash ────────────────────────────────────────────────
  const triggerFeedback = useCallback(async (correct: boolean) => {
    try {
      await (correct
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
    } catch (_) {}
    await playSound(correct ? correctSnd : wrongSnd);
    setFeedback(correct ? "correct" : "wrong");
    setTimeout(() => setFeedback(null), 500);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // finishEye — saves result and goes to eye_result phase
  // ─────────────────────────────────────────────────────────────────────────
  const finishEye = useCallback(
    (eye: Eye, passedIdx: number, extras?: Partial<EyeResult>) => {
      const result: EyeResult =
        passedIdx < 0
          ? { snellen: "< 6/60", logmar: 1.30, levelIdx: -1, ...extras }
          : { ...LEVELS[passedIdx], levelIdx: passedIdx, ...extras };
      setEyeResults(prev => ({ ...prev, [eye]: result }));
      setPhase("eye_result");
    },
    []
  );

  // ─────────────────────────────────────────────────────────────────────────
  // recordAnswer — main input handler (swipe or tap)
  // ─────────────────────────────────────────────────────────────────────────
  const recordAnswer = useCallback(
    async (answered: EDirection) => {
      if (swipeLock.current) return;
      swipeLock.current = true;
      setTimeout(() => { swipeLock.current = false; }, 600);

      const correct    = answered === direction;
      const newAnswers = [...answers, correct];

      await triggerFeedback(correct);

      if (newAnswers.length < LETTERS_PER_LEVEL) {
        const nextDir = nextRandom(direction);
        animateChange(() => {
          setAnswers(newAnswers);
          setDirection(nextDir);
        });
        setTimeout(speakPrompt, 250);
        return;
      }

      // Level complete
      const nCorrect = newAnswers.filter(Boolean).length;
      const passed   = nCorrect >= PASS_THRESHOLD;

      if (passed) {
        const nextIdx = levelIdx + 1;
        if (nextIdx >= LEVELS.length) {
          finishEye(currentEye, levelIdx);
        } else {
          animateChange(() => {
            setLevelIdx(nextIdx);
            setAnswers([]);
            setDirection(nextRandom());
          });
          setTimeout(speakPrompt, 250);
        }
      } else {
        if (levelIdx === 0) {
          // Failed 6/60 → low-vision ladder
          setPhase("low_vision");
          setLvStep("retest_1m");
          setLv1mAnswers([]);
          lv1mDirs.current = [nextRandom(), nextRandom(), nextRandom()];
        } else {
          finishEye(currentEye, levelIdx - 1);
        }
      }
    },
    [answers, direction, levelIdx, currentEye, triggerFeedback, animateChange, speakPrompt, finishEye]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // record1mAnswer — used in low_vision retest_1m
  // ─────────────────────────────────────────────────────────────────────────
  const record1mAnswer = useCallback(
    async (answered: EDirection) => {
      if (swipeLock.current) return;
      swipeLock.current = true;
      setTimeout(() => { swipeLock.current = false; }, 600);

      const dir     = lv1mDirs.current[lv1mAnswers.length] ?? "right";
      const correct = answered === dir;
      const updated = [...lv1mAnswers, correct];

      await triggerFeedback(correct);
      setLv1mAnswers(updated);

      if (updated.length < LETTERS_PER_LEVEL) return;

      if (updated.filter(Boolean).length >= PASS_THRESHOLD) {
        finishEye(currentEye, 0);
      } else {
        setLvStep("count_fingers");
      }
    },
    [lv1mAnswers, currentEye, triggerFeedback, finishEye]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation helpers
  // ─────────────────────────────────────────────────────────────────────────
  const handleEyeResultNext = useCallback(() => {
    if (currentEye === "right") setPhase("switch_eye");
    else setPhase("final_result");
  }, [currentEye]);

  const beginLeftEye = useCallback(() => {
    setCurrentEye("left");
    setLevelIdx(0);
    setAnswers([]);
    setDirection(nextRandom());
    setLvStep("retest_1m");
    setLv1mAnswers([]);
    lv1mDirs.current = [nextRandom(), nextRandom(), nextRandom()];
    setPhase("instructions");
  }, []);

  const beginTest = useCallback(() => {
    setLevelIdx(0);
    setAnswers([]);
    setDirection(nextRandom());
    setPhase("testing");
    setTimeout(speakPrompt, 400);
  }, [speakPrompt]);

  // ─────────────────────────────────────────────────────────────────────────
  // Save + navigate away
  // ─────────────────────────────────────────────────────────────────────────
  const handleFinish = useCallback(async () => {
    const r = eyeResults.right;
    const l = eyeResults.left;
    const rRef = needsReferral(r);
    const lRef = needsReferral(l);
    const anyRef = rRef || lRef;
    const rightStr = r?.snellen ?? "not_tested";
    const leftStr  = l?.snellen ?? "not_tested";

    const updates = {
      distanceVisionRight:  `${rightStr} (LogMAR ${r?.logmar?.toFixed(2) ?? "—"})`,
      distanceVisionLeft:   `${leftStr} (LogMAR ${l?.logmar?.toFixed(2) ?? "—"})`,
      distanceVisionResult: anyRef ? "failed" : "passed",
      needsReferral:  anyRef,
      referralReason: anyRef
        ? `Failed distance vision (Step 5 SANTÉ INITIATIVE). R: ${rightStr}  L: ${leftStr}`
        : "",
      referralUrgency: "normal",
      referralStep:    "Step 5 - Distance Vision Test",
    };
    updateScreeningData(updates);

    if (!anyRef) {
      navigation.navigate("VisionScreen6");
      return;
    }

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
      clientName:    screeningData.clientName   || "",
      clientPhone:   screeningData.clientPhone  || "",
      clientAge:     screeningData.clientAge    || "",
      clientSex:     screeningData.clientGender || "",
      district:      screeningData.district     || "",
      county:        screeningData.county       || "",
      subCounty:     screeningData.subCounty    || "",
      parish:        screeningData.parish       || "",
      reason:        updates.referralReason,
      urgency:       "normal",
      notes:         `Step 5 SANTÉ INITIATIVE Vision. R: ${rightStr}  L: ${leftStr}`,
    };
    const root = navigation.getParent()?.getParent();
    if (root) root.navigate("CreateReferralScreen", params);
    else navigation.navigate("CreateReferralScreen" as any, params);
  }, [eyeResults, screeningData, updateScreeningData, navigation]);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived testing values
  // ─────────────────────────────────────────────────────────────────────────
  const eyeLabel  = currentEye === "right" ? "RIGHT" : "LEFT";
  const coverEye  = currentEye === "right" ? "LEFT"  : "RIGHT";
  const level     = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
  const eSize     = eSizeDp(level);
  const correct   = answers.filter(Boolean).length;
  const wrong     = answers.filter(r => !r).length;
  const remaining = LETTERS_PER_LEVEL - answers.length - 1;
  const canPass   = correct + remaining + 1 >= PASS_THRESHOLD;

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: Calibration
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "calibration") {
    return (
      <SafeAreaView style={s.page}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />
        <ScrollView contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>

          <Text style={s.pageTitle}>Distance Vision Test — SANTÉ INITIATIVE</Text>

          <View style={s.calCard}>
            <Text style={s.calTitle}>📱 SANTÉ INITIATIVE Calibration</Text>
            <CalRow icon="sunny"        color="#F59E0B" title="Max Brightness">
              Screen brightness has been set to maximum automatically.{"\n"}
              On iOS, also check Control Centre brightness is full.
            </CalRow>
            <CalRow icon="expand"       color="#3B82F6" title="2 Metres Distance">
              Mark 2 metres on the floor with your foot.{"\n"}
              Client stands at the mark; you hold the phone facing them.
            </CalRow>
            <CalRow icon="eye-off"      color="#EF4444" title="Cover Fellow Eye">
              Cover the eye NOT being tested with the palm — gently.
            </CalRow>
            <CalRow icon="partly-sunny" color="#10B981" title="Lighting">
              Avoid direct sunlight on screen. Indoor light or shade is ideal.
            </CalRow>
          </View>

          {/* Black-E-on-white preview to confirm rendering */}
          <View style={s.previewCard}>
            <Text style={s.previewLabel}>E preview — confirm it is black and sharp</Text>
            <View style={s.previewEWrap}>
              <TumblingE
                direction="right"
                size={Math.min(physicalDp(29.1), SCREEN_W * 0.55)}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text style={s.previewCaption}>
              Black E, white background. If grey or blurry, wipe the screen.
            </Text>
          </View>

          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => setPhase("instructions")}
          >
            <Ionicons name="checkmark-circle" size={18} color="#FFF" />
            <Text style={s.primaryBtnTxt}>Setup Complete — Begin →</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: Instructions
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "instructions") {
    return (
      <SafeAreaView style={s.page}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />
        <ScrollView contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>

          <View style={[s.eyeBanner, { backgroundColor: currentEye === "right" ? "#1565C0" : "#7C3AED" }]}>
            <Ionicons name="eye" size={16} color="#FFF" />
            <Text style={s.eyeBannerTxt}>
              {currentEye === "right" ? "1st:" : "2nd:"} Testing {eyeLabel} EYE
            </Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Setup</Text>
            <SetupRow n="1" text="Stand exactly 2 metres from the client" />
            <SetupRow n="2" text={`Ask client to cover their ${coverEye} eye with their palm`} />
            <SetupRow n="3" text={`Say: "I'll show you a letter. Tell me which way the legs point — Up, Down, Left, or Right."`} />
            <SetupRow n="4" text="Swipe the letter OR tap the arrow buttons to record the answer." />
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Direction Reference</Text>
            <View style={s.dirRow}>
              {(["right","down","left","up"] as EDirection[]).map(d => (
                <View key={d} style={s.dirItem}>
                  <View style={s.dirEWrap}>
                    <TumblingE direction={d} size={36} color="#000000" backgroundColor="#FFFFFF" />
                  </View>
                  <Text style={s.dirLabel}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Acuity Levels  (≥2/3 correct to advance)</Text>
            {LEVELS.map((lv, i) => (
              <View key={lv.snellen} style={s.ladderRow}>
                <Text style={s.ladderSnellen}>{lv.snellen}</Text>
                <Text style={s.ladderLogmar}>LogMAR {lv.logmar.toFixed(2)}</Text>
                <TumblingE direction="right" size={Math.max(8, 48 - i * 5)} color="#000000" backgroundColor="#FFFFFF" />
              </View>
            ))}
          </View>

          <View style={s.infoBox}>
            <Ionicons name="volume-high" size={15} color="#1565C0" />
            <Text style={s.infoTxt}>
              Audio + haptic feedback plays after each answer. Keep volume on.
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
  // PHASE: Testing
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "testing") {
    return (
      <GestureHandlerRootView style={s.testRoot}>
        <SafeAreaView style={s.testRoot}>
          <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

          {/* Testing banner — always visible at top */}
          <View style={[s.testingBanner, { backgroundColor: currentEye === "right" ? "#1565C0" : "#7C3AED" }]}>
            <Ionicons name="eye" size={15} color="#FFF" />
            <Text style={s.testingBannerTxt}>
              TESTING {eyeLabel} EYE — Cover {coverEye} EYE
            </Text>
          </View>

          {/* Top bar */}
          <View style={s.testBar}>
            <View style={[s.eyePill, { backgroundColor: currentEye === "right" ? "#1565C0" : "#7C3AED" }]}>
              <Text style={s.eyePillTxt}>{eyeLabel}</Text>
            </View>
            <View style={s.levelInfo}>
              <Text style={s.levelBig}>{level.snellen}</Text>
              <Text style={s.levelSub}>LogMAR {level.logmar.toFixed(2)}</Text>
            </View>
            <View style={s.dots}>
              {Array.from({ length: LETTERS_PER_LEVEL }).map((_, i) => {
                const done = i < answers.length;
                const cur  = i === answers.length;
                return (
                  <View key={i} style={[
                    s.dot,
                    done && answers[i]  && s.dotGreen,
                    done && !answers[i] && s.dotRed,
                    cur                 && s.dotBlue,
                    !done && !cur       && s.dotGrey,
                  ]} />
                );
              })}
            </View>
          </View>

          {/* Score bar */}
          <View style={s.scoreBar}>
            <Text style={[s.scorePart, { color: "#16A34A" }]}>✓ {correct} correct</Text>
            <Text style={[s.scorePart, { color: "#6B7280" }]}>  need ≥{PASS_THRESHOLD}  </Text>
            <Text style={[s.scorePart, { color: "#DC2626" }]}>✗ {wrong} wrong</Text>
          </View>

          {/* E canvas — WHITE background, swipe-enabled */}
          <PanGestureHandler
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state !== State.END) return;
              const { translationX: dx, translationY: dy } = nativeEvent;
              const adx = Math.abs(dx), ady = Math.abs(dy);
              if (adx < SWIPE_MIN_DP && ady < SWIPE_MIN_DP) return;
              const swiped: EDirection =
                adx >= ady ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
              recordAnswer(swiped);
            }}
          >
            <View style={s.eCanvas}>
              {feedback !== null && (
                <View style={[
                  s.feedbackOverlay,
                  feedback === "correct" ? s.feedbackGreen : s.feedbackRed,
                ]}>
                  <Text style={s.feedbackIcon}>{feedback === "correct" ? "✓" : "✗"}</Text>
                </View>
              )}
              <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                <TumblingE
                  key={`${direction}-${answers.length}-${levelIdx}`}
                  direction={direction}
                  size={eSize}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              </Animated.View>
              {answers.length === 0 && (
                <Text style={s.swipeHint}>← Swipe or tap arrows →</Text>
              )}
            </View>
          </PanGestureHandler>

          <Text style={s.prompt}>"Which way do the legs point?"</Text>

          {/* Arrow buttons */}
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

          {!canPass && answers.length > 0 && (
            <View style={s.earlyFail}>
              <Ionicons name="alert-circle" size={13} color="#DC2626" />
              <Text style={s.earlyFailTxt}>Cannot reach {PASS_THRESHOLD} — moving to result</Text>
            </View>
          )}
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: Low Vision
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "low_vision") {

    if (lvStep === "retest_1m") {
      const lvDone = lv1mAnswers.length;
      const lvDir  = lv1mDirs.current[lvDone] ?? "right";
      const lvSize = Math.min(physicalDp(29.1), SCREEN_W * 0.85);

      return (
        <GestureHandlerRootView style={s.testRoot}>
          <SafeAreaView style={s.testRoot}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
            <View style={s.testBar}>
              <View style={[s.eyePill, { backgroundColor: "#B45309" }]}>
                <Text style={s.eyePillTxt}>{eyeLabel}</Text>
              </View>
              <Text style={s.levelBig}>6/60 @ 1 m</Text>
              <View style={s.dots}>
                {Array.from({ length: LETTERS_PER_LEVEL }).map((_, i) => (
                  <View key={i} style={[
                    s.dot,
                    i < lvDone && lv1mAnswers[i]  && s.dotGreen,
                    i < lvDone && !lv1mAnswers[i] && s.dotRed,
                    i === lvDone                  && s.dotBlue,
                    i > lvDone                    && s.dotGrey,
                  ]} />
                ))}
              </View>
            </View>
            <View style={s.lvBanner}>
              <Ionicons name="alert-circle" size={14} color="#92400E" />
              <Text style={s.lvBannerTxt}>Failed 6/60 at 2 m — retesting at 1 metre</Text>
            </View>
            <PanGestureHandler
              onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state !== State.END) return;
                const { translationX: dx, translationY: dy } = nativeEvent;
                const adx = Math.abs(dx), ady = Math.abs(dy);
                if (adx < SWIPE_MIN_DP && ady < SWIPE_MIN_DP) return;
                const swiped: EDirection =
                  adx >= ady ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
                record1mAnswer(swiped);
              }}
            >
              <View style={s.eCanvas}>
                <TumblingE
                  key={`lv1m-${lvDone}`}
                  direction={lvDir}
                  size={lvSize}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              </View>
            </PanGestureHandler>
            <Text style={s.prompt}>"Which way do the legs point?"</Text>
            <View style={s.arrowGrid}>
              <View style={s.arrowRow}>
                <ArrowBtn dir="up"    onPress={() => record1mAnswer("up")} />
              </View>
              <View style={s.arrowRow}>
                <ArrowBtn dir="left"  onPress={() => record1mAnswer("left")} />
                <CantSeeBtn           onPress={() => record1mAnswer(nextRandom(lvDir))} />
                <ArrowBtn dir="right" onPress={() => record1mAnswer("right")} />
              </View>
              <View style={s.arrowRow}>
                <ArrowBtn dir="down"  onPress={() => record1mAnswer("down")} />
              </View>
            </View>
          </SafeAreaView>
        </GestureHandlerRootView>
      );
    }

    // CF / HM / LP yes-no cards
    type LvCfg = { icon: string; color: string; title: string; instruction: string; onYes: () => void; onNo: () => void; };
    const lvCards: Record<Exclude<LowVisionStep,"retest_1m">, LvCfg> = {
      count_fingers: {
        icon: "✋", color: "#7C3AED",
        title: "Count Fingers (CF)",
        instruction: `Hold up 2–4 fingers at ~50 cm. Ask: "How many fingers am I holding up?"`,
        onYes: () => finishEye(currentEye, -1, { cf: true }),
        onNo:  () => setLvStep("hand_movement"),
      },
      hand_movement: {
        icon: "🖐", color: "#1D4ED8",
        title: "Hand Movement (HM)",
        instruction: `Wave your hand slowly 30 cm in front of the eye. Ask: "Is my hand moving?"`,
        onYes: () => finishEye(currentEye, -1, { cf: false, hm: true }),
        onNo:  () => setLvStep("light_perception"),
      },
      light_perception: {
        icon: "🔦", color: "#D97706",
        title: "Light Perception (LP)",
        instruction: `Cover the room and shine a torch. Ask: "Can you see any light at all?"`,
        onYes: () => finishEye(currentEye, -1, { cf: false, hm: false, lp: true }),
        onNo:  () => finishEye(currentEye, -1, { cf: false, hm: false, lp: false }),
      },
    };

    const cfg = lvCards[lvStep as Exclude<LowVisionStep,"retest_1m">];

    return (
      <SafeAreaView style={s.page}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />
        <View style={s.lvScreen}>
          <View style={[s.lvIconCircle, { backgroundColor: cfg.color + "20" }]}>
            <Text style={s.lvIconTxt}>{cfg.icon}</Text>
          </View>
          <Text style={s.lvTitle}>{cfg.title}</Text>
          <Text style={s.lvInstruction}>{cfg.instruction}</Text>
          <View style={s.lvBtnRow}>
            <TouchableOpacity style={[s.lvBtn, s.lvYes]} onPress={cfg.onYes}>
              <Ionicons name="checkmark" size={30} color="#FFF" />
              <Text style={s.lvBtnTxt}>YES</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.lvBtn, s.lvNo]} onPress={cfg.onNo}>
              <Ionicons name="close" size={30} color="#FFF" />
              <Text style={s.lvBtnTxt}>NO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: Eye result
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "eye_result") {
    const rec   = eyeResults[currentEye];
    const refer = needsReferral(rec);
    const below = rec?.levelIdx === -1;

    return (
      <SafeAreaView style={s.page}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />
        <ScrollView contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>

          <View style={[s.resultCard, refer ? s.cardFail : s.cardPass]}>
            <Text style={s.resultEyeLbl}>
              {eyeLabel} EYE — {refer ? "❌ REFER" : "✅ PASS"}
            </Text>
            <Text style={s.resultSnellen}>{rec?.snellen ?? "—"}</Text>
            {!below && (
              <Text style={s.resultLogmar}>LogMAR {rec?.logmar?.toFixed(2) ?? "—"}</Text>
            )}
            {below && (
              <View style={s.lvChipRow}>
                {rec?.cf  !== undefined && <LvChip label="Count Fingers" val={rec.cf}  />}
                {rec?.hm  !== undefined && <LvChip label="Hand Movement" val={rec.hm}  />}
                {rec?.lp  !== undefined && <LvChip label="Light Percep." val={rec.lp}  />}
              </View>
            )}
          </View>

          <View style={s.actionCard}>
            <Ionicons
              name={refer ? "alert-circle" : "checkmark-circle"}
              size={22}
              color={refer ? "#DC2626" : "#16A34A"}
            />
            <Text style={s.actionTxt}>
              {refer
                ? `${eyeLabel} eye needs referral.${currentEye === "right" ? "\nContinue to test LEFT eye before completing referral." : ""}`
                : currentEye === "right"
                  ? "Right eye passed ✓. Now test the LEFT eye."
                  : "Both eyes done. Proceed to near vision test."}
            </Text>
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, {
              backgroundColor: currentEye === "right" ? "#1565C0" : (refer ? "#DC2626" : "#16A34A"),
            }]}
            onPress={handleEyeResultNext}
          >
            <Text style={s.primaryBtnTxt}>
              {currentEye === "right" ? "Test LEFT Eye →" : "View Final Results →"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: Switch-eye interstitial
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "switch_eye") {
    return (
      <SafeAreaView style={s.switchPage}>
        <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
        <View style={s.switchBody}>
          <View style={s.switchIconCircle}>
            <Ionicons name="eye" size={48} color="#FFF" />
          </View>
          <Text style={s.switchTitle}>Right Eye Done ✓</Text>
          <Text style={s.switchSub}>
            Now ask the client to cover their{"\n"}
            <Text style={s.switchHL}>RIGHT EYE</Text>
            {"\n"}and look with the LEFT eye only.
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
    const rRef   = needsReferral(r);
    const lRef   = needsReferral(l);
    const anyRef = rRef || lRef;

    return (
      <SafeAreaView style={s.page}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <Header userData={userData} navigation={navigation} />
        <ScrollView contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>

          <Text style={s.pageTitle}>SANTÉ INITIATIVE — Distance Vision Results</Text>

          {/* Results table */}
          <View style={s.tableCard}>
            <View style={s.tableHead}>
              {["Eye","Snellen","LogMAR","Result"].map(h => (
                <Text key={h} style={[s.tableCell, s.tableHdrTxt]}>{h}</Text>
              ))}
            </View>
            <ResultRow eye="RIGHT" rec={r} refer={rRef} color="#1565C0" />
            <ResultRow eye="LEFT"  rec={l} refer={lRef} color="#7C3AED" />
          </View>

          <View style={[s.actionCard, anyRef && s.actionRed]}>
            <Ionicons
              name={anyRef ? "alert-circle" : "checkmark-circle"}
              size={22}
              color={anyRef ? "#DC2626" : "#16A34A"}
            />
            <Text style={[s.actionTxt, anyRef && { color: "#DC2626" }]}>
              {anyRef
                ? "One or both eyes failed. Refer to a health facility."
                : "Both eyes passed! Proceed to Step 6: Near Vision Test."}
            </Text>
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: anyRef ? "#DC2626" : "#1565C0" }]}
            onPress={handleFinish}
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
        <Image source={require("../../../assets/logo.png")} style={s.logo} resizeMode="contain" />
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

function CalRow({
  icon, color, title, children,
}: { icon: string; color: string; title: string; children: React.ReactNode }) {
  return (
    <View style={s.calRow}>
      <View style={[s.calIconWrap, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.calRowTitle}>{title}</Text>
        <Text style={s.calRowBody}>{children}</Text>
      </View>
    </View>
  );
}

function ArrowBtn({ dir, onPress }: { dir: EDirection; onPress: () => void }) {
  const icon =
    dir === "up"   ? "arrow-up"   :
    dir === "down" ? "arrow-down" :
    dir === "left" ? "arrow-back" : "arrow-forward";
  return (
    <TouchableOpacity style={s.arrowBtn} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon as any} size={32} color="#1565C0" />
      <Text style={s.arrowLbl}>{dir.charAt(0).toUpperCase() + dir.slice(1)}</Text>
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
  eye, rec, refer, color,
}: { eye: string; rec: EyeResult | null; refer: boolean; color: string }) {
  return (
    <View style={[s.tableRow, refer && s.tableRowRed]}>
      <Text style={[s.tableCell, { color, fontWeight: "700" }]}>{eye}</Text>
      <Text style={s.tableCell}>{rec?.snellen ?? "—"}</Text>
      <Text style={s.tableCell}>
        {rec?.levelIdx === -1 ? "—" : (rec?.logmar?.toFixed(2) ?? "—")}
      </Text>
      <Text style={[s.tableCell, { color: refer ? "#DC2626" : "#16A34A", fontWeight: "700" }]}>
        {refer ? "REFER" : "PASS"}
      </Text>
    </View>
  );
}

function LvChip({ label, val }: { label: string; val: boolean }) {
  return (
    <View style={[s.lvChip, { backgroundColor: val ? "#D1FAE5" : "#FEE2E2" }]}>
      <Text style={[s.lvChipTxt, { color: val ? "#065F46" : "#991B1B" }]}>
        {label}: {val ? "Yes ✓" : "No ✗"}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page:      { flex: 1, backgroundColor: "#F9FAFB" },
  scrollPad: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 16 },

  header: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF",
    paddingHorizontal: 14, paddingVertical: 10, paddingTop: 44,
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB", elevation: 2,
  },
  logoBox:   { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  logo:      { width: 36, height: 36 },
  headerMid: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  headerSub:   { fontSize: 11, color: "#6B7280", marginTop: 1 },
  menuBtn:     { width: 40, alignItems: "flex-end" },

  calCard: {
    backgroundColor: "#FFF", borderRadius: 14, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: "#E5E7EB", elevation: 1,
  },
  calTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 14 },
  calRow:   { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  calIconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  calRowTitle: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 2 },
  calRowBody:  { fontSize: 13, color: "#4B5563", lineHeight: 18 },

  previewCard: {
    backgroundColor: "#FFF", borderRadius: 14, padding: 18, marginBottom: 20,
    borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center",
  },
  previewLabel:   { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 12 },
  previewEWrap:   {
    borderWidth: 2, borderColor: "#E5E7EB", borderRadius: 12,
    padding: 16, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center", marginBottom: 10,
  },
  previewCaption: { fontSize: 12, color: "#6B7280", textAlign: "center" },

  eyeBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24,
    alignSelf: "center", marginBottom: 18,
  },
  eyeBannerTxt: { fontSize: 16, fontWeight: "700", color: "#FFF" },

  card: {
    backgroundColor: "#FFF", borderRadius: 14, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: "#E5E7EB", elevation: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 12 },

  dirRow:  { flexDirection: "row", justifyContent: "space-around", paddingVertical: 4 },
  dirItem: { alignItems: "center", gap: 4 },
  dirEWrap: {
    backgroundColor: "#FFFFFF", borderRadius: 8, padding: 6,
    borderWidth: 1, borderColor: "#D1D5DB", elevation: 1,
  },
  dirLabel: { fontSize: 11, fontWeight: "700", color: "#374151" },

  ladderRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  ladderSnellen: { fontSize: 13, fontWeight: "700", color: "#111827", width: 48 },
  ladderLogmar:  { fontSize: 11, color: "#6B7280", flex: 1 },

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
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: 8, backgroundColor: "#1565C0",
    paddingVertical: 16, borderRadius: 14, marginTop: 4,
  },
  primaryBtnTxt: { fontSize: 16, fontWeight: "700", color: "#FFF" },

  // ── Testing ───────────────────────────────────────────────────────────────
  testRoot: { flex: 1, backgroundColor: "#FFFFFF" },

  testingBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 10, paddingHorizontal: 16,
  },
  testingBannerTxt: { fontSize: 14, fontWeight: "800", color: "#FFF", letterSpacing: 0.4 },

  testBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 10, paddingTop: 14,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },

  eyePill:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  eyePillTxt: { fontSize: 11, fontWeight: "700", color: "#FFF" },

  levelInfo: { alignItems: "center" },
  levelBig:  { fontSize: 14, fontWeight: "700", color: "#111827" },
  levelSub:  { fontSize: 10, color: "#6B7280" },

  dots:     { flexDirection: "row", gap: 6 },
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
  scorePart: { fontSize: 13, fontWeight: "600" },

  eCanvas: {
    flex: 1,
    backgroundColor: "#FFFFFF",   // ← WHITE: black E always visible
    justifyContent: "center",
    alignItems: "center",
  },

  feedbackOverlay: {
    position: "absolute", zIndex: 10,
    width: 90, height: 90, borderRadius: 45,
    justifyContent: "center", alignItems: "center", opacity: 0.90,
  },
  feedbackGreen: { backgroundColor: "#16A34A" },
  feedbackRed:   { backgroundColor: "#DC2626" },
  feedbackIcon:  { fontSize: 40, fontWeight: "700", color: "#FFF" },

  swipeHint: {
    position: "absolute", bottom: 16,
    fontSize: 12, color: "#9CA3AF", fontStyle: "italic",
  },

  prompt: {
    textAlign: "center", fontSize: 14, color: "#4B5563",
    fontStyle: "italic", paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },

  arrowGrid: { paddingHorizontal: 12, paddingBottom: 10, backgroundColor: "#FFFFFF" },
  arrowRow:  { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },

  arrowBtn: {
    width: 80, height: 80, borderRadius: 16,
    borderWidth: 2, borderColor: "#BFDBFE", backgroundColor: "#EFF6FF",
    justifyContent: "center", alignItems: "center", gap: 4,
  },
  arrowLbl: { fontSize: 11, fontWeight: "700", color: "#1565C0" },

  cantBtn: {
    width: 80, height: 80, borderRadius: 16,
    borderWidth: 2, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB",
    justifyContent: "center", alignItems: "center", gap: 4,
  },
  cantLbl: { fontSize: 10, fontWeight: "600", color: "#9CA3AF", textAlign: "center" },

  earlyFail: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA",
    padding: 8, margin: 10, borderRadius: 8,
  },
  earlyFailTxt: { flex: 1, fontSize: 12, color: "#DC2626" },

  // ── Low-vision ────────────────────────────────────────────────────────────
  lvBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEF3C7", borderBottomWidth: 1, borderBottomColor: "#FDE68A",
    padding: 10,
  },
  lvBannerTxt: { fontSize: 12, color: "#92400E", flex: 1 },

  lvScreen: {
    flex: 1, justifyContent: "center", alignItems: "center",
    paddingHorizontal: 28, paddingBottom: 40,
  },
  lvIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: "center", alignItems: "center", marginBottom: 20,
  },
  lvIconTxt:     { fontSize: 48 },
  lvTitle:       { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 10, textAlign: "center" },
  lvInstruction: { fontSize: 15, color: "#374151", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  lvBtnRow:      { flexDirection: "row", gap: 24 },
  lvBtn:         { width: 120, height: 120, borderRadius: 24, justifyContent: "center", alignItems: "center", gap: 8 },
  lvYes:         { backgroundColor: "#16A34A" },
  lvNo:          { backgroundColor: "#DC2626" },
  lvBtnTxt:      { fontSize: 17, fontWeight: "700", color: "#FFF" },

  lvChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  lvChip:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  lvChipTxt: { fontSize: 12, fontWeight: "600" },

  // ── Eye / final result ────────────────────────────────────────────────────
  resultCard:    { borderRadius: 14, padding: 20, marginBottom: 16, borderWidth: 2 },
  cardPass:      { backgroundColor: "#F0FDF4", borderColor: "#16A34A" },
  cardFail:      { backgroundColor: "#FEF2F2", borderColor: "#DC2626" },
  resultEyeLbl:  { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  resultSnellen: { fontSize: 38, fontWeight: "800", color: "#111827" },
  resultLogmar:  { fontSize: 14, color: "#6B7280", marginTop: 4 },

  actionCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  actionRed: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
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

  // ── Switch-eye ────────────────────────────────────────────────────────────
  switchPage:       { flex: 1, backgroundColor: "#1565C0" },
  switchBody:       { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  switchIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", marginBottom: 24,
  },
  switchTitle: { fontSize: 26, fontWeight: "800", color: "#FFF", marginBottom: 16 },
  switchSub:   { fontSize: 18, color: "#DBEAFE", textAlign: "center", lineHeight: 28, marginBottom: 32 },
  switchHL:    { fontWeight: "800", color: "#FFF" },
  switchBtn:   {
    backgroundColor: "#FFF", paddingVertical: 16, paddingHorizontal: 40,
    borderRadius: 14, alignItems: "center",
  },
  switchBtnTxt: { fontSize: 17, fontWeight: "700", color: "#1565C0" },
});
