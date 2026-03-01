import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";
import { moderateScale } from "../../utils/responsive";
import { apiService } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CHWHeader from "../../components/CHWHeader";

const { width } = Dimensions.get("window");

export default function DistanceVisionTestScreen() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const [userData, setUserData] = useState<any>(null);
  const [line1Score, setLine1Score] = useState<number | null>(null);
  const [line2Score, setLine2Score] = useState<number | null>(null);
  const [testStage, setTestStage] = useState<"rightEye" | "leftEye">(
    "rightEye",
  );

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const parsedUserData = JSON.parse(userDataString);
        setUserData(parsedUserData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const saveOffline = async (data: any) => {
    try {
      const offlineQueue = await AsyncStorage.getItem("offlineScreenings");
      const queue = offlineQueue ? JSON.parse(offlineQueue) : [];
      queue.push({
        ...data,
        offlineId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem("offlineScreenings", JSON.stringify(queue));
      return true;
    } catch (error) {
      console.error("Failed to save offline:", error);
      return false;
    }
  };

  const handleScoreSelection = (line: 1 | 2, score: number) => {
    if (line === 1) {
      setLine1Score(score);
    } else {
      setLine2Score(score);
    }
  };

  const handleNextEye = async () => {
    if (line1Score === null || line2Score === null) {
      alert("Please select scores for both lines before proceeding.");
      return;
    }

    if (line1Score < 2 || line2Score < 4) {
      const eyeTested = testStage === "rightEye" ? "Right" : "Left";

      const referralData = {
        ...screeningData,
        distanceVisionResult: "failed",
        nearVisionResult: "not_tested",
        needsReferral: true,
        needsGlasses: false,
        referralReason: `${eyeTested} eye failed distance vision test. Line 1: ${line1Score}/3, Line 2: ${line2Score}/5`,
        referralUrgency: "normal",
        referralStep: "Step 5 - Distance Vision Test",
      };

      updateScreeningData(referralData);

      // Save screening record first, then navigate to referral form
      let savedScreeningId: string | null = null;
      try {
        const result = await apiService.createScreening(referralData);
        if (result.success) {
          savedScreeningId = result.data?.id || null;
        }
      } catch (error) {
        console.error("Failed to save screening, saving offline:", error);
        await saveOffline(referralData);
      }

      const reasonText = referralData.referralReason;

      // Navigate to pre-filled referral form (go up to root navigator)
      const referralParams = {
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
        notes: `Referred from Step 5 — Distance Vision Test.\n${eyeTested} eye failed. Line 1: ${line1Score}/3, Line 2: ${line2Score}/5.\nNear vision test NOT performed.`,
      };

      // Try root navigator (ScreeningStack -> CHWTabs -> Root)
      const root = navigation.getParent()?.getParent();
      if (root) {
        root.navigate("CreateReferralScreen", referralParams);
      } else {
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate("CreateReferralScreen", referralParams);
        } else {
          navigation.navigate("CreateReferralScreen" as any, referralParams);
        }
      }
      return;
    }

    if (testStage === "rightEye") {
      // Reset scores for left eye
      setLine1Score(null);
      setLine2Score(null);
      setTestStage("leftEye");
    } else {
      // Both eyes completed, navigate to next step
      navigation.navigate("VisionScreen6");
    }
  };

  const handleBack = () => {
    if (testStage === "leftEye") {
      setTestStage("rightEye");
    } else {
      navigation.goBack();
    }
  };

  // Render square block-style Tumbling E
  // The E is drawn as a View with 3 horizontal bars pointing in a direction
  const renderBlockE = (rotation: string, size: number) => {
    const barThickness = Math.round(size / 5);
    const barLength = size;
    const gap = barThickness;

    // Base E points RIGHT: 3 horizontal bars on the left side
    const baseE = (
      <View
        style={{ width: size, height: size, backgroundColor: "transparent" }}
      >
        {/* Vertical bar (spine) */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: barThickness,
            height: size,
            backgroundColor: "#111827",
          }}
        />
        {/* Top bar */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: barLength,
            height: barThickness,
            backgroundColor: "#111827",
          }}
        />
        {/* Middle bar */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: Math.round((size - barThickness) / 2),
            width: barLength,
            height: barThickness,
            backgroundColor: "#111827",
          }}
        />
        {/* Bottom bar */}
        <View
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: barLength,
            height: barThickness,
            backgroundColor: "#111827",
          }}
        />
      </View>
    );

    let rotationDeg = "0deg";
    switch (rotation) {
      case "right":
        rotationDeg = "0deg";
        break;
      case "down":
        rotationDeg = "90deg";
        break;
      case "left":
        rotationDeg = "180deg";
        break;
      case "up":
        rotationDeg = "270deg";
        break;
    }

    return (
      <View style={{ transform: [{ rotate: rotationDeg }] }}>{baseE}</View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top Header with Logo and Menu - Fixed at top */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {userData?.fullName || "Santé Initiative Uganda"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {userData?.district ? `VHT - ${userData.district} District` : ""}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="menu" size={28} color="#1A4D8F" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Step Title */}
        <Text style={styles.stepTitle}>Step 5: Distance Vision Test</Text>

        {/* Info Badge */}
        <View style={styles.infoBadge}>
          <Ionicons name="document-text" size={16} color="#1565C0" />
          <Text style={styles.infoBadgeText}>
            3-Meter E-Chart • Ages 6+ Only
          </Text>
        </View>

        {/* Prerequisites Section - Updated to match Figma */}
        <View style={styles.prerequisitesCard}>
          <Text style={styles.prerequisitesTitle}>
            ⚠️ Prerequisites Confirmed:
          </Text>
          <View style={styles.prerequisiteList}>
            <View style={styles.prerequisiteItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.prerequisiteText}>
                Torch Light Test - Passed
              </Text>
            </View>
            <View style={styles.prerequisiteItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.prerequisiteText}>
                Client Age - 88 years (≥6)
              </Text>
            </View>
            <View style={styles.prerequisiteItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.prerequisiteText}>
                Waited 2 minutes after torch test
              </Text>
            </View>
          </View>
        </View>

        {/* Testing Eye Section */}
        <View style={styles.testingSection}>
          <View style={styles.testingBadge}>
            <Text style={styles.testingBadgeText}>
              Testing:{" "}
              {testStage === "rightEye" ? "RIGHT EYE 👁️" : "LEFT EYE 👁️"}
            </Text>
          </View>

          {/* Test Setup Instructions */}
          <View style={styles.setupCard}>
            <View style={styles.setupHeader}>
              <Ionicons name="resize" size={20} color="#1565C0" />
              <Text style={styles.setupTitle}>Test Setup:</Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Stand <Text style={styles.boldText}>3 meters</Text> away from
                client
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Cover client's{" "}
                <Text style={styles.boldText}>
                  {testStage === "rightEye" ? "LEFT" : "RIGHT"} eye
                </Text>{" "}
                with hand or card
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Show E-chart at client's eye level
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                Ask:{" "}
                <Text style={styles.italicText}>
                  "Which way does the E point?"
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* E-Chart Display - Updated with rotated E's */}
        <View style={styles.eChartCard}>
          <Text style={styles.eChartTitle}>3-Meter E-Chart (Tumbling E)</Text>

          {/* Line 1 */}
          <View style={styles.eChartLine}>
            <Text style={styles.lineLabel}>Line 1: 6/60 (Largest)</Text>
            <View style={[styles.eContainer, { alignItems: "center" }]}>
              {renderBlockE("right", 80)}
              {renderBlockE("down", 80)}
              {renderBlockE("left", 80)}
            </View>
            <Text style={styles.lettersNote}>
              3 letters to read (Right, Down, Left)
            </Text>
          </View>

          {/* Line 2 */}
          <View style={styles.eChartLine}>
            <Text style={styles.lineLabel}>Line 2: 6/12 (Smaller)</Text>
            <View
              style={[
                styles.eContainer,
                styles.smallEContainer,
                { alignItems: "center" },
              ]}
            >
              {renderBlockE("right", 40)}
              {renderBlockE("up", 40)}
              {renderBlockE("down", 40)}
              {renderBlockE("left", 40)}
              {renderBlockE("right", 40)}
            </View>
            <Text style={styles.lettersNote}>
              5 letters to read (Right, Up, Down, Left, Right)
            </Text>
          </View>
        </View>

        {/* Scoring Section - Line 1 */}
        <View style={styles.scoringCard}>
          <Text style={styles.scoringTitle}>
            Line 1 (6/60) - How many correct?
          </Text>
          <Text style={styles.scoringSubtitle}>
            Total letters: 3 | Must read at least 2 to continue
          </Text>

          <View style={styles.scoreButtonsRow}>
            {[0, 1, 2, 3].map((score) => (
              <TouchableOpacity
                key={score}
                style={[
                  styles.scoreButton,
                  line1Score === score && styles.scoreButtonSelected,
                ]}
                onPress={() => handleScoreSelection(1, score)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.scoreButtonText,
                    line1Score === score && styles.scoreButtonTextSelected,
                  ]}
                >
                  {score}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Status for Line 1 */}
          {line1Score !== null && line1Score < 2 && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={18} color="#DC2626" />
              <Text style={styles.warningText}>
                ⚠️ Less than 2 correct = Automatic Fail
              </Text>
            </View>
          )}
          {line1Score !== null && line1Score >= 2 && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.successText}>
                ✓ 2 or more = Continue to Line 2
              </Text>
            </View>
          )}
        </View>

        {/* Scoring Section - Line 2 */}
        <View style={styles.scoringCard}>
          <Text style={styles.scoringTitle}>
            Line 2 (6/12) - How many correct?
          </Text>
          <Text style={styles.scoringSubtitle}>
            Total letters: 5 | Must read at least 4 to pass
          </Text>

          <View style={styles.scoreButtonsRowLarge}>
            {[0, 1, 2, 3, 4, 5].map((score) => (
              <TouchableOpacity
                key={score}
                style={[
                  styles.scoreButton,
                  line2Score === score && styles.scoreButtonSelected,
                ]}
                onPress={() => handleScoreSelection(2, score)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.scoreButtonText,
                    line2Score === score && styles.scoreButtonTextSelected,
                  ]}
                >
                  {score}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Status for Line 2 */}
          {line2Score !== null && line2Score < 4 && line2Score > 0 && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={18} color="#DC2626" />
              <Text style={styles.warningText}>⚠️ Less than 4 = Fail</Text>
            </View>
          )}
          {line2Score !== null && line2Score >= 4 && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.successText}>✓ 4 or more = Pass</Text>
            </View>
          )}
        </View>

        {/* Pass Criteria */}
        <View style={styles.passCriteriaCard}>
          <Text style={styles.passCriteriaText}>
            Pass Criteria: Must read ≥2 letters on line 6/60 AND ≥4 letters on
            line 6/12
          </Text>
        </View>

        {/* Bottom Navigation Buttons */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              (line1Score === null || line2Score === null) &&
                styles.nextButtonDisabled,
            ]}
            onPress={handleNextEye}
            disabled={line1Score === null || line2Score === null}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {testStage === "rightEye"
                ? "Next: Test Left Eye →"
                : "Complete Test"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 190 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 44,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerLeft: {
    flex: 1,
  },
  logoBox: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginLeft: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
    marginTop: 150,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120, // Extra padding for bottom nav and tab bar
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  infoBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1565C0",
    marginLeft: 8,
  },
  prerequisitesCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  prerequisitesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 8,
  },
  prerequisiteList: {
    marginTop: 4,
  },
  prerequisiteItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  prerequisiteText: {
    fontSize: 14,
    color: "#92400E",
    marginLeft: 8,
  },
  testingSection: {
    marginBottom: 16,
  },
  testingBadge: {
    backgroundColor: "#1565C0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 16,
  },
  testingBadgeText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  setupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  setupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  setupTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    backgroundColor: "#1565C0",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  instructionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  boldText: {
    fontWeight: "700",
    color: "#1565C0",
  },
  italicText: {
    fontStyle: "italic",
    color: "#4B5563",
  },
  eChartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#1F2937",
  },
  eChartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },
  eChartLine: {
    marginBottom: 24,
    alignItems: "center",
  },
  lineLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 16,
  },
  eContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  smallEContainer: {
    gap: 10,
    flexWrap: "wrap",
    paddingHorizontal: 12,
  },
  lettersNote: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },
  scoringCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scoringTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  scoringSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  scoreButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  scoreButtonsRowLarge: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 7,
    marginBottom: 8,
  },
  scoreButton: {
    flex: 1,
    minWidth: 44,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  scoreButtonSelected: {
    backgroundColor: "#E0F2FE",
    borderColor: "#1565C0",
  },
  scoreButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B7280",
  },
  scoreButtonTextSelected: {
    color: "#1565C0",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  warningText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
    marginLeft: 8,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 8,
  },
  passCriteriaCard: {
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  passCriteriaText: {
    fontSize: 14,
    color: "#1565C0",
    textAlign: "center",
  },
  spacer: {
    height: 20,
  },
  bottomNav: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666666",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#1565C0", // Updated to match Figma blue
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 12,
  },
  nextButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
