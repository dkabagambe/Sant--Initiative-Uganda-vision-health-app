import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function DistanceVisionTestScreen() {
  const navigation = useNavigation<any>();
  const [line1Score, setLine1Score] = useState<number | null>(null);
  const [line2Score, setLine2Score] = useState<number | null>(null);
  const [testStage, setTestStage] = useState<"rightEye" | "leftEye">(
    "rightEye",
  );

  const handleScoreSelection = (line: 1 | 2, score: number) => {
    if (line === 1) {
      setLine1Score(score);
    } else {
      setLine2Score(score);
    }
  };

  const handleNextEye = () => {
    if (line1Score === null || line2Score === null) {
      alert("Please select scores for both lines before proceeding.");
      return;
    }

    if (line1Score < 2 || line2Score < 4) {
      alert(
        `Right Eye Test Failed. Line 1: ${line1Score}/3, Line 2: ${line2Score}/5. Automatic referral required.`,
      );
      // In a real app, you would navigate to a referral screen
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.screenTitle}>VHT Eye Screening</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>Step 5 of 6</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "83.33%" }]} />
            </View>
          </View>
        </View>

        {/* Step Title */}
        <Text style={styles.stepTitle}>Step 5: Distance Vision Test</Text>

        {/* Test Info Badge */}
        <View style={styles.infoBadge}>
          <Ionicons name="document-text" size={16} color="#1A4D8F" />
          <Text style={styles.infoBadgeText}>
            3-Meter E-Chart • Ages 6+ Only
          </Text>
        </View>

        {/* Prerequisites Section */}
        <View style={styles.prerequisitesCard}>
          <View style={styles.prerequisitesHeader}>
            <Ionicons name="warning" size={20} color="#EAB308" />
            <Text style={styles.prerequisitesTitle}>
              Prerequisites Confirmed:
            </Text>
          </View>

          <View style={styles.prerequisiteItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.prerequisiteText}>
              Torch Light Test - Passed
            </Text>
          </View>

          <View style={styles.prerequisiteItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.prerequisiteText}>
              Client Age - 88 years (≥6)
            </Text>
          </View>

          <View style={styles.prerequisiteItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.prerequisiteText}>
              Waited 2 minutes after torch test
            </Text>
          </View>
        </View>

        {/* Testing Eye Section */}
        <View style={styles.testingSection}>
          <View style={styles.testingHeader}>
            <Ionicons name="eye" size={24} color="#1A4D8F" />
            <Text style={styles.testingTitle}>
              Testing:{" "}
              {testStage === "rightEye" ? "RIGHT EYE 👁️" : "LEFT EYE 👁️"}
            </Text>
          </View>

          {/* Test Setup Instructions */}
          <View style={styles.setupCard}>
            <View style={styles.setupHeader}>
              <Ionicons name="resize" size={20} color="#1A4D8F" />
              <Text style={styles.setupTitle}>Test Setup:</Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Stand 3 meters away from client
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Cover client's {testStage === "rightEye" ? "LEFT" : "RIGHT"} eye
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
                Ask: "Which way does the E point?"
              </Text>
            </View>
          </View>
        </View>

        {/* E-Chart Display */}
        <View style={styles.eChartCard}>
          <Text style={styles.eChartTitle}>3-Meter E-Chart</Text>

          {/* Line 1 */}
          <View style={styles.eChartLine}>
            <Text style={styles.lineLabel}>Line 1: 6/60 (Largest)</Text>
            <View style={styles.lettersContainer}>
              <View style={styles.letterBox}>
                <Text style={styles.letterText1}>E</Text>
              </View>
              <View style={styles.letterBox}>
                <Text style={styles.letterText1}>F</Text>
              </View>
              <View style={styles.letterBox}>
                <Text style={styles.letterText1}>P</Text>
              </View>
            </View>
            <Text style={styles.lettersNote}>3 letters to read</Text>
          </View>

          {/* Line 2 */}
          <View style={styles.eChartLine}>
            <Text style={styles.lineLabel}>Line 2: 6/12 (Smaller)</Text>
            <View style={styles.lettersContainer}>
              <View style={styles.letterBox}>
                <Text style={styles.letterText}>E</Text>
              </View>
              <View style={styles.letterBox}>
                <Text style={styles.letterText}>F</Text>
              </View>
              <View style={styles.letterBox}>
                <Text style={styles.letterText}>P</Text>
              </View>
              <View style={styles.letterBox}>
                <Text style={styles.letterText}>T</Text>
              </View>
              <View style={styles.letterBox}>
                <Text style={styles.letterText}>O</Text>
              </View>
            </View>
            <Text style={styles.lettersNote}>5 letters to read</Text>
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

          {/* Warning for Line 1 */}
          {line1Score !== null && line1Score < 2 && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={18} color="#DC2626" />
              <Text style={styles.warningText}>
                Less than 2 correct = Automatic Fail
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

          <View style={styles.scoreButtonsRow}>
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
        </View>

        {/* Pass Criteria */}
        <View style={styles.passCriteriaCard}>
          <Text style={styles.passCriteriaText}>
            Pass Criteria: Must read ≥2 letters on line 6/60 AND ≥4 letters on
            line 6/12
          </Text>
        </View>

        {/* Spacer for bottom buttons */}
        <View style={styles.spacer} />
      </ScrollView>

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
          style={styles.nextButton}
          onPress={handleNextEye}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {testStage === "rightEye"
              ? "Next: Test Left Eye →"
              : "Complete Test"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { icon: "home-outline", label: "Home" },
          { icon: "eye-outline", label: "Screen" },
          { icon: "cube-outline", label: "Stock" },
          { icon: "cash-outline", label: "Payments" },
          { icon: "share-social-outline", label: "Referrals" },
        ].map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon as any}
              size={22}
              color={index === 1 ? "#1A4D8F" : "#6B7280"}
            />
            <Text
              style={[styles.tabLabel, index === 1 && styles.tabLabelActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  userHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  organization: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A4D8F",
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  progressSection: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A4D8F",
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
    backgroundColor: "#1A4D8F",
    borderRadius: 3,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  infoBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A4D8F",
    marginLeft: 8,
  },
  prerequisitesCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  prerequisitesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  prerequisitesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9A3412",
    marginLeft: 8,
  },
  prerequisiteItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  prerequisiteText: {
    fontSize: 16,
    color: "#9A3412",
    fontWeight: "500",
    marginLeft: 12,
    flex: 1,
  },
  testingSection: {
    marginBottom: 24,
  },
  testingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  testingTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 12,
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
    width: 32,
    height: 32,
    backgroundColor: "#1A4D8F",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  instructionNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  instructionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  eChartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  eChartTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  eChartLine: {
    marginBottom: 24,
    alignItems: "center",
  },
  lineLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A4D8F",
    marginBottom: 16,
  },
  lettersContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    gap: 12,
  },
  letterBox: {
    width: 50,
    height: 50,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  letterText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  letterText1: {
    fontSize: 44,
    fontWeight: "700",
    color: "#111827",
  },
  lettersNote: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  scoringCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
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
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  scoreButton: {
    width: 60,
    height: 60,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  scoreButtonSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#1A4D8F",
  },
  scoreButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6B7280",
  },
  scoreButtonTextSelected: {
    color: "#1A4D8F",
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
    flex: 1,
  },
  passCriteriaCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 75,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  passCriteriaText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A4D8F",
    textAlign: "center",
  },
  spacer: {
    height: 20,
  },
  bottomNav: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: "#1A4D8F",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 12,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#1A4D8F",
    fontWeight: "700",
  },
});
