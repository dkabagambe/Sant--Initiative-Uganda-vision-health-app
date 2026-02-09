import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function TorchLightStepScreen() {
  const navigation = useNavigation<any>();
  const [screenState, setScreenState] = useState<
    "instructions" | "test" | "abnormalities" | "result" | "passed"
  >("instructions");
  const [selectedAbnormalities, setSelectedAbnormalities] = useState<string[]>([
    "Redness",
    "Discharge/Pus",
    "Eye Injury",
    "Swelling",
    "Growth/Lump",
  ]);
  const [testResult, setTestResult] = useState<"pass" | "fail" | null>(null);

  const testPurposes = [
    "Check for visible eye problems",
    "Look for signs of infection or injury",
    "Identify abnormalities that need referral",
  ];

  const instructions = [
    {
      number: "1",
      title: "Get Your Torch Ready",
      description: "Use a small hand-held torch (flashlight)",
      warning: "DO NOT USE PHONE FLASHLIGHT",
    },
    {
      number: "2",
      title: "Look at Each Eye",
      description: "Check both eyes for:",
      items: [
        "Redness",
        "Discharge or pus",
        "Swelling",
        "Cloudiness or white spots",
      ],
    },
    {
      number: "3",
      title: "Shine Torch from Side",
      description: "Move torch slowly across the eye from the side",
      note: "Maximum 5 seconds per eye",
    },
  ];

  const abnormalities = [
    "Redness",
    "Discharge/Pus",
    "White Pupil",
    "Eye Injury",
    "Swelling",
    "Cloudiness",
    "Growth/Lump",
    "Squint/Turned Eye",
  ];

  const handleStartTest = () => {
    setScreenState("test");
  };

  const handleBackToInstructions = () => {
    setScreenState("instructions");
  };

  const handleTestCompleted = () => {
    setScreenState("abnormalities");
  };

  const handleAbnormalityToggle = (abnormality: string) => {
    setSelectedAbnormalities((prev) => {
      if (prev.includes(abnormality)) {
        return prev.filter((item) => item !== abnormality);
      } else {
        return [...prev, abnormality];
      }
    });
  };

  const handleNoAbnormalSigns = () => {
    setSelectedAbnormalities([]);
    // Directly go to passed state if no abnormalities
    setTimeout(() => {
      setScreenState("passed");
    }, 300);
  };

  const handleContinueToResults = () => {
    if (selectedAbnormalities.length === 0) {
      setScreenState("passed");
    } else {
      setScreenState("result");
    }
  };

  const handleTestResult = (result: "pass" | "fail") => {
    setTestResult(result);

    if (result === "fail") {
      Alert.alert(
        "Referral Required",
        "A referral has been automatically generated for the health facility. Do NOT proceed with other vision tests.",
        [
          {
            text: "Generate Referral",
            onPress: () => {
              // Generate referral logic here
              setTimeout(() => {
                // Stay on this screen with referral generated
                // In real app, you would navigate to referral screen
              }, 500);
            },
            style: "default",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
    } else if (result === "pass") {
      setScreenState("passed");
    }
  };

  const handleContinueToStep5 = () => {
    // Navigate to Step 5
    navigation.navigate("VisionScreen5");
  };

  const handleGoBack = () => {
    if (screenState === "test") {
      setScreenState("instructions");
    } else if (screenState === "abnormalities") {
      setScreenState("test");
    } else if (screenState === "result" || screenState === "passed") {
      setScreenState("abnormalities");
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>VHT Eye Screening</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Section - Always Visible */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {screenState === "passed" ? "Step 4.5 of 6" : "Step 4 of 6"}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: screenState === "passed" ? "75%" : "66.67%" },
              ]}
            />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Conditional Content */}
        {screenState === "instructions" ? (
          /* State 1: Initial Instructions */
          <View style={styles.contentContainer}>
            {/* Test Title */}
            <View style={styles.testTitleContainer}>
              <Text style={styles.testTitle}>
                Step 4: Simple Eye Check with Torch Light
              </Text>
              <View style={styles.testAgeBadge}>
                <Ionicons name="people" size={18} color="#FFFFFF" />
                <Text style={styles.testAgeText}>
                  Test for: All Ages (Children & Adults)
                </Text>
              </View>
            </View>

            {/* Purpose Section */}
            <View style={styles.purposeSection}>
              <Text style={styles.purposeTitle}>Purpose of This Test:</Text>
              <View style={styles.purposeList}>
                {testPurposes.map((purpose, index) => (
                  <View key={index} style={styles.purposeItem}>
                    <View style={styles.purposeBullet}>
                      <Text style={styles.bulletText}>•</Text>
                    </View>
                    <Text style={styles.purposeText}>{purpose}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : screenState === "test" ? (
          /* State 2: Detailed Instructions */
          <View style={styles.contentContainer}>
            <View style={styles.instructionsTitleContainer}>
              <Ionicons name="flashlight" size={32} color="#1A4D8F" />
              <Text style={styles.instructionsMainTitle}>
                Torch Light Instructions
              </Text>
            </View>

            <View style={styles.detailedInstructions}>
              {instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionCard}>
                  <View style={styles.instructionHeaderRow}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>
                        {instruction.number}
                      </Text>
                    </View>
                    <Text style={styles.instructionCardTitle}>
                      {instruction.title}
                    </Text>
                  </View>

                  <Text style={styles.instructionCardDescription}>
                    {instruction.description}
                  </Text>

                  {instruction.warning && (
                    <View style={styles.warningBox}>
                      <Ionicons name="warning" size={20} color="#DC2626" />
                      <Text style={styles.warningText}>
                        {instruction.warning}
                      </Text>
                    </View>
                  )}

                  {instruction.note && (
                    <View style={styles.noteBox}>
                      <Ionicons
                        name="timer-outline"
                        size={20}
                        color="#1A4D8F"
                      />
                      <Text style={styles.noteText}>{instruction.note}</Text>
                    </View>
                  )}

                  {instruction.items && (
                    <View style={styles.itemsList}>
                      {instruction.items.map((item, itemIndex) => (
                        <View key={itemIndex} style={styles.listItem}>
                          <View style={styles.listBullet}>
                            <Text style={styles.listBulletText}>•</Text>
                          </View>
                          <Text style={styles.listItemText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.safetyReminder}>
              <Ionicons name="shield-checkmark" size={22} color="#10B981" />
              <Text style={styles.safetyText}>
                Important: Maintain safe distance. Do not touch the client's
                eyes.
              </Text>
            </View>
          </View>
        ) : screenState === "abnormalities" ? (
          /* State 3: Abnormalities Checklist */
          <View style={styles.contentContainer}>
            <Text style={styles.abnormalitiesTitle}>
              Did you see any abnormal signs?
            </Text>
            <Text style={styles.abnormalitiesSubtitle}>
              Select all that apply:
            </Text>

            <View style={styles.checklistGrid}>
              {abnormalities.map((abnormality, index) => (
                <View key={index} style={styles.checklistRow}>
                  <TouchableOpacity
                    style={styles.checkboxEmojiContainer}
                    onPress={() => handleAbnormalityToggle(abnormality)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.checkboxEmoji}>
                      {selectedAbnormalities.includes(abnormality) ? "☑️" : "☐"}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.checklistText,
                      selectedAbnormalities.includes(abnormality) &&
                        styles.checklistTextSelected,
                    ]}
                  >
                    {abnormality}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.normalButton}
              onPress={handleNoAbnormalSigns}
              activeOpacity={0.8}
            >
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.normalButtonText}>
                No Abnormal Signs - Eyes Look Normal
              </Text>
            </TouchableOpacity>
          </View>
        ) : screenState === "result" ? (
          /* State 4: Failure Result */
          <View style={styles.contentContainer}>
            {/* User Info */}

            {/* Error Message */}
            <View style={styles.errorMessageBox}>
              <Ionicons name="warning" size={28} color="#DC2626" />
              <Text style={styles.errorMessageTitle}>
                Torch Light Test - Failed
              </Text>
              <Text style={styles.errorMessageText}>
                Abnormal signs detected - referral required
              </Text>
            </View>

            {/* Record Result */}
            <View style={styles.resultSection}>
              <Text style={styles.resultTitle}>
                Record Result in VHT Register:
              </Text>
              <View style={styles.testNameBox}>
                <Text style={styles.testNameLabel}>Test Name:</Text>
                <Text style={styles.testNameText}>
                  Eye Exam with Torch Light
                </Text>
              </View>

              <View style={styles.abnormalSignsBox}>
                <Text style={styles.abnormalSignsTitle}>
                  Abnormal Signs Found:
                </Text>
                <View style={styles.abnormalSignsList}>
                  {selectedAbnormalities.map((sign, index) => (
                    <Text key={index} style={styles.abnormalSignItem}>
                      {sign}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            {/* Pass/Fail Question */}
            <View style={styles.passFailSection}>
              <Text style={styles.passFailQuestion}>
                Eye Exam with Torch Light - Pass?
              </Text>

              <View style={styles.passFailButtons}>
                <TouchableOpacity
                  style={[styles.passFailButton, styles.passButton]}
                  onPress={() => handleTestResult("pass")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.passFailEmoji}>✔️</Text>
                  <Text style={styles.passFailText}>Yes - Pass</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.passFailButton, styles.failButton]}
                  onPress={() => handleTestResult("fail")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.passFailEmoji}>❌</Text>
                  <Text style={styles.passFailText}>No - Fail</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Referral Warning */}
            <View style={styles.referralWarning}>
              <Ionicons name="medical" size={20} color="#DC2626" />
              <Text style={styles.referralWarningText}>
                Clicking "No - Fail" will automatically generate a referral to a
                health facility. Do NOT proceed with other vision tests.
              </Text>
            </View>
          </View>
        ) : (
          /* State 5: Passed Result */
          <View style={styles.contentContainer}>
            {/* Passed Message */}
            <View style={styles.passedMessageBox}>
              <View style={styles.passedIconContainer}>
                <Ionicons name="checkmark-circle" size={40} color="#10B981" />
              </View>
              <Text style={styles.passedTitle}>Torch Test Passed ✔️</Text>
              <Text style={styles.passedSubtitle}>
                No abnormal signs detected
              </Text>
            </View>

            {/* Next Step */}
            <View style={styles.nextStepSection}>
              <Text style={styles.nextStepTitle}>Next Step:</Text>
              <View style={styles.waitTimeBox}>
                <Ionicons name="timer" size={24} color="#1A4D8F" />
                <Text style={styles.waitTimeText}>
                  Wait <Text style={styles.waitTimeHighlight}>2 minutes</Text>{" "}
                  before testing distance vision
                </Text>
              </View>
              <Text style={styles.waitDescription}>
                This allows the client's eyes to adjust before the next test
              </Text>
            </View>

            {/* Instructions for Waiting */}
            <View style={styles.waitingInstructions}>
              <Text style={styles.waitingInstructionsTitle}>
                While waiting:
              </Text>
              <View style={styles.waitingList}>
                <View style={styles.waitingItem}>
                  <Text style={styles.waitingBullet}>•</Text>
                  <Text style={styles.waitingText}>
                    Keep client comfortable
                  </Text>
                </View>
                <View style={styles.waitingItem}>
                  <Text style={styles.waitingBullet}>•</Text>
                  <Text style={styles.waitingText}>Avoid bright lights</Text>
                </View>
                <View style={styles.waitingItem}>
                  <Text style={styles.waitingBullet}>•</Text>
                  <Text style={styles.waitingText}>
                    Prepare distance vision chart
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        {screenState === "instructions" ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartTest}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="flashlight" size={24} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                Begin Torch Light Test
              </Text>
            </View>
          </TouchableOpacity>
        ) : screenState === "test" ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleTestCompleted}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                I Have Completed the Test
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBackToInstructions}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#1A4D8F" />
              <Text style={styles.secondaryButtonText}>
                Back to Instructions
              </Text>
            </TouchableOpacity>
          </>
        ) : screenState === "abnormalities" ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinueToResults}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Continue to Record Result
            </Text>
          </TouchableOpacity>
        ) : screenState === "result" ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              testResult === "fail" && styles.disabledButton,
            ]}
            onPress={() => {
              if (testResult === "pass") {
                setScreenState("passed");
              }
            }}
            disabled={testResult === "fail"}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {testResult === "fail"
                ? "Referral Generated"
                : "Continue to Next Step"}
            </Text>
          </TouchableOpacity>
        ) : (
          /* Passed State */
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinueToStep5}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>
              Continue to Distance Vision Test{" "}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { icon: "home-outline", label: "Home" },
          {
            icon: "eye-outline",
            label: "Screen",
            active: screenState !== "passed",
          },
          { icon: "cube-outline", label: "Stock" },
          { icon: "cash-outline", label: "Payments" },
          {
            icon: "share-social-outline",
            label: "Referrals",
            active: screenState === "result" && testResult === "fail",
          },
        ].map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon as any}
              size={22}
              color={tab.active ? "#1A4D8F" : "#6B7280"}
            />
            <Text
              style={[styles.tabLabel, tab.active && styles.tabLabelActive]}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A4D8F",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1A4D8F",
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 20,
  },

  /* State 1: Initial Instructions */
  testTitleContainer: {
    marginBottom: 28,
  },
  testTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 32,
  },
  testAgeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A4D8F",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  testAgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  purposeSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  purposeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  purposeList: {
    gap: 12,
  },
  purposeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  purposeBullet: {
    width: 24,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 20,
    color: "#1A4D8F",
    fontWeight: "700",
  },
  purposeText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    fontWeight: "500",
  },

  /* State 2: Detailed Instructions */
  instructionsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  instructionsMainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginLeft: 12,
  },
  detailedInstructions: {
    gap: 20,
    marginBottom: 24,
  },
  instructionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  instructionNumber: {
    width: 36,
    height: 36,
    backgroundColor: "#1A4D8F",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  instructionNumberText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  instructionCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  instructionCardDescription: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 16,
  },
  warningText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
    marginLeft: 12,
    flex: 1,
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 16,
  },
  noteText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A4D8F",
    marginLeft: 12,
    flex: 1,
  },
  itemsList: {
    paddingLeft: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  listBullet: {
    width: 24,
  },
  listBulletText: {
    fontSize: 18,
    color: "#1A4D8F",
    fontWeight: "700",
  },
  listItemText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  safetyReminder: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  safetyText: {
    flex: 1,
    fontSize: 15,
    color: "#065F46",
    fontWeight: "500",
    marginLeft: 12,
    lineHeight: 22,
  },

  /* State 3: Abnormalities Checklist */
  abnormalitiesTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  abnormalitiesSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
  },
  checklistGrid: {
    gap: 12,
    marginBottom: 24,
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  checkboxEmojiContainer: {
    marginRight: 16,
  },
  checkboxEmoji: {
    fontSize: 20,
  },
  checklistText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  checklistTextSelected: {
    color: "#1A4D8F",
    fontWeight: "600",
  },
  normalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  checkmark: {
    fontSize: 18,
    color: "#10B981",
    marginRight: 12,
    fontWeight: "bold",
  },
  normalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
    flex: 1,
  },

  /* State 4: Failure Result */
  userInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  organization: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A4D8F",
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorMessageBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorMessageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 12,
    marginBottom: 4,
  },
  errorMessageText: {
    fontSize: 16,
    color: "#DC2626",
    fontWeight: "500",
    textAlign: "center",
  },
  resultSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  testNameBox: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  testNameLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  testNameText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  abnormalSignsBox: {
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  abnormalSignsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 12,
  },
  abnormalSignsList: {
    gap: 8,
  },
  abnormalSignItem: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
  passFailSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  passFailQuestion: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  passFailButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  passFailButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 2,
  },
  passButton: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },
  failButton: {
    backgroundColor: "#FEF2F2",
    borderColor: "#DC2626",
  },
  passFailEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  passFailText: {
    fontSize: 16,
    fontWeight: "600",
  },
  referralWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF2F2",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  referralWarningText: {
    flex: 1,
    fontSize: 14,
    color: "#991B1B",
    fontWeight: "500",
    marginLeft: 12,
    lineHeight: 20,
  },

  /* State 5: Passed Result */
  passedMessageBox: {
    backgroundColor: "#D1FAE5",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  passedIconContainer: {
    marginBottom: 16,
  },
  passedTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 8,
    textAlign: "center",
  },
  passedSubtitle: {
    fontSize: 18,
    color: "#065F46",
    fontWeight: "500",
    textAlign: "center",
  },
  nextStepSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  nextStepTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  waitTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  waitTimeText: {
    fontSize: 17,
    color: "#1A4D8F",
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
  },
  waitTimeHighlight: {
    color: "#1A4D8F",
    fontWeight: "700",
  },
  waitDescription: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  waitingInstructions: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  waitingInstructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  waitingList: {
    gap: 8,
  },
  waitingItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  waitingBullet: {
    fontSize: 18,
    color: "#1A4D8F",
    fontWeight: "700",
    marginRight: 12,
  },
  waitingText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },

  /* Bottom Action Buttons */
  bottomActions: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
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
  primaryButton: {
    backgroundColor: "#1A4D8F",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#1A4D8F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A4D8F",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },

  /* Tab Bar */
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
