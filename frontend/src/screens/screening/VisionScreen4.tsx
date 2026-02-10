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
  const [currentSubStep, setCurrentSubStep] = useState<1 | 2 | 3 | 4 | 4.5>(1);
  const [abnormalSigns, setAbnormalSigns] = useState<string[]>([]);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);

  // Abnormal signs options from Figma
  const abnormalSignOptions = [
    { id: "redness", label: "Redness", icon: "🔴" },
    { id: "discharge", label: "Discharge/Pus", icon: "💧" },
    { id: "white_pupil", label: "White Pupil", icon: "⚪" },
    { id: "injury", label: "Eye Injury", icon: "🩹" },
    { id: "swelling", label: "Swelling", icon: "🌊" },
    { id: "cloudiness", label: "Cloudiness", icon: "☁️" },
    { id: "growth", label: "Growth/Lump", icon: "📈" },
    { id: "squint", label: "Squint/Turned Eye", icon: "↔️" },
  ];

  const handleAbnormalSignToggle = (id: string) => {
    if (id === "none") {
      // If "No Abnormal Signs" is selected, clear all other signs
      setAbnormalSigns(["none"]);
    } else {
      // Remove "none" if it exists
      const newSigns = abnormalSigns.filter((sign) => sign !== "none");

      if (newSigns.includes(id)) {
        // Remove the sign if already selected
        setAbnormalSigns(newSigns.filter((sign) => sign !== id));
      } else {
        // Add the sign
        setAbnormalSigns([...newSigns, id]);
      }
    }
  };

  const handleTestComplete = (passed: boolean) => {
    setTestPassed(passed);

    if (!passed) {
      Alert.alert(
        "Referral Required",
        "A referral has been automatically generated for the health facility. Do NOT proceed with other vision tests.",
        [
          {
            text: "OK",
            onPress: () => {
              // Stay on this screen - don't proceed to next test
              // In a real app, you would navigate to referral screen
            },
            style: "default",
          },
        ],
      );
    } else {
      // Move to transition step (4.5)
      setCurrentSubStep(4.5);
    }
  };

  const handleContinueToDistanceVision = () => {
    // Navigate to Step 5 (Distance Vision Test)
    navigation.navigate("VisionScreen5");
  };

  const handleGoBack = () => {
    if (currentSubStep === 2) {
      setCurrentSubStep(1);
    } else if (currentSubStep === 3) {
      setCurrentSubStep(2);
    } else if (currentSubStep === 4) {
      setCurrentSubStep(3);
    } else if (currentSubStep === 4.5) {
      setCurrentSubStep(4);
    } else {
      navigation.goBack();
    }
  };

  const renderSubStep1 = () => (
    <View style={styles.contentContainer}>
      <View style={styles.gradientCard}>
        <Ionicons name="bulb-outline" size={28} color="#D97706" />
        <Text style={styles.gradientTitle}>
          Step 4: Simple Eye Check with Torch Light
        </Text>
        <Text style={styles.gradientSubtitle}>
          Test for: All Ages (Children & Adults)
        </Text>
      </View>

      <View style={styles.purposeCard}>
        <Text style={styles.purposeTitle}>📋 Purpose of This Test:</Text>
        <View style={styles.purposeList}>
          <View style={styles.purposeItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.purposeText}>
              Check for visible eye problems
            </Text>
          </View>
          <View style={styles.purposeItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.purposeText}>
              Look for signs of infection or injury
            </Text>
          </View>
          <View style={styles.purposeItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.purposeText}>
              Identify abnormalities that need referral
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSubStep2 = () => (
    <View style={styles.contentContainer}>
      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>🔦 Torch Light Instructions</Text>

        <View style={styles.instructionStep}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>1️⃣</Text>
            <Text style={styles.stepTitle}>Get Your Torch Ready</Text>
          </View>
          <Text style={styles.stepDescription}>
            Use a small hand-held torch (flashlight)
          </Text>
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color="#DC2626" />
            <Text style={styles.warningText}>
              ⚠️ DO NOT USE PHONE FLASHLIGHT
            </Text>
          </View>
        </View>

        <View style={styles.instructionStep}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>2️⃣</Text>
            <Text style={styles.stepTitle}>Look at Each Eye</Text>
          </View>
          <Text style={styles.stepDescription}>Check both eyes for:</Text>
          <View style={styles.checkList}>
            <Text style={styles.checkItem}>• Redness</Text>
            <Text style={styles.checkItem}>• Discharge or pus</Text>
            <Text style={styles.checkItem}>• Swelling</Text>
            <Text style={styles.checkItem}>• Cloudiness or white spots</Text>
          </View>
        </View>

        <View style={styles.instructionStep}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>3️⃣</Text>
            <Text style={styles.stepTitle}>Shine Torch from Side</Text>
          </View>
          <Text style={styles.stepDescription}>
            Move torch slowly across the eye from the side
          </Text>
          <View style={styles.noteBox}>
            <Ionicons name="timer-outline" size={20} color="#1A4D8F" />
            <Text style={styles.noteText}>⏱️ Maximum 5 seconds per eye</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSubStep3 = () => (
    <View style={styles.contentContainer}>
      <View style={styles.abnormalitiesCard}>
        <Text style={styles.abnormalitiesTitle}>
          Did you see any abnormal signs?
        </Text>
        <Text style={styles.abnormalitiesSubtitle}>Select all that apply:</Text>

        <View style={styles.signsGrid}>
          {abnormalSignOptions.map((sign) => (
            <TouchableOpacity
              key={sign.id}
              style={[
                styles.signButton,
                abnormalSigns.includes(sign.id) && styles.signButtonSelected,
              ]}
              onPress={() => handleAbnormalSignToggle(sign.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.signIcon}>{sign.icon}</Text>
              <Text
                style={[
                  styles.signLabel,
                  abnormalSigns.includes(sign.id) && styles.signLabelSelected,
                ]}
              >
                {sign.label}
              </Text>
              {abnormalSigns.includes(sign.id) && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#DC2626"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.normalButton,
            abnormalSigns.includes("none") && styles.normalButtonSelected,
          ]}
          onPress={() => handleAbnormalSignToggle("none")}
          activeOpacity={0.7}
        >
          <Text style={styles.normalIcon}>✅</Text>
          <Text style={styles.normalText}>
            No Abnormal Signs - Eyes Look Normal
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reminderBox}>
        <Text style={styles.reminderText}>
          <Text style={styles.bold}>Remember:</Text> If you see any abnormal
          signs, you must refer the client to a health facility. Do not proceed
          with other vision tests.
        </Text>
      </View>
    </View>
  );

  const renderSubStep4 = () => {
    const hasAbnormalSigns =
      abnormalSigns.length > 0 && !abnormalSigns.includes("none");

    return (
      <View style={styles.contentContainer}>
        <View
          style={[
            styles.resultCard,
            hasAbnormalSigns ? styles.resultCardFail : styles.resultCardPass,
          ]}
        >
          {hasAbnormalSigns ? (
            <>
              <Ionicons name="warning-outline" size={32} color="#DC2626" />
              <Text style={styles.resultTitleFail}>
                ❌ Torch Light Test - Failed
              </Text>
              <Text style={styles.resultSubtitle}>
                Abnormal signs detected - referral required
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              <Text style={styles.resultTitlePass}>
                ✅ Torch Light Test - Passed
              </Text>
              <Text style={styles.resultSubtitle}>
                Eyes look normal - no abnormal signs detected
              </Text>
            </>
          )}
        </View>

        <View style={styles.recordCard}>
          <Text style={styles.recordTitle}>
            📝 Record Result in VHT Register:
          </Text>

          <View style={styles.testInfoBox}>
            <Text style={styles.infoLabel}>Test Name:</Text>
            <Text style={styles.infoValue}>Eye Exam with Torch Light</Text>
          </View>

          {hasAbnormalSigns && (
            <View style={styles.abnormalBox}>
              <Text style={styles.abnormalTitle}>Abnormal Signs Found:</Text>
              <Text style={styles.abnormalList}>
                {abnormalSignOptions
                  .filter((opt) => abnormalSigns.includes(opt.id))
                  .map((opt) => opt.label)
                  .join(", ")}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.passQuestion}>
            Eye Exam with Torch Light - Pass?
          </Text>

          <View style={styles.passButtons}>
            <TouchableOpacity
              style={[styles.passButton, styles.passButtonYes]}
              onPress={() => handleTestComplete(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.passButtonEmoji}>✓</Text>
              <Text style={styles.passButtonText}>Yes - Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.passButton, styles.passButtonNo]}
              onPress={() => handleTestComplete(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.passButtonEmoji}>✗</Text>
              <Text style={styles.passButtonText}>No - Fail</Text>
            </TouchableOpacity>
          </View>

          {hasAbnormalSigns && (
            <View style={styles.referralWarning}>
              <Text style={styles.warningTitle}>
                ⚠️ Automatic Referral Required
              </Text>
              <Text style={styles.warningText}>
                Clicking "No - Fail" will automatically generate a referral to a
                health facility. Do NOT proceed with other vision tests.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSubStep4_5 = () => (
    <View style={styles.contentContainer}>
      <View style={styles.passedCard}>
        <View style={styles.passedIcon}>
          <Ionicons name="checkmark-circle" size={40} color="#10B981" />
        </View>
        <Text style={styles.passedTitle}>Torch Test Passed ✅</Text>
        <Text style={styles.passedSubtitle}>No abnormal signs detected</Text>
      </View>

      <View style={styles.waitCard}>
        <Text style={styles.waitTitle}>⏱️ Next Step:</Text>
        <View style={styles.waitInfo}>
          <Ionicons name="timer" size={24} color="#1A4D8F" />
          <Text style={styles.waitText}>
            Wait <Text style={styles.waitHighlight}>2 minutes</Text> before
            testing distance vision
          </Text>
        </View>
        <Text style={styles.waitNote}>
          This allows the client's eyes to adjust before the next test
        </Text>
      </View>
    </View>
  );

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
          <Ionicons name="arrow-back" size={24} color="#1A4D8F" />
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
        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentSubStep === 4.5 ? "Step 4.5 of 6" : "Step 4 of 6"}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: currentSubStep === 4.5 ? "75%" : "66.67%" },
              ]}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Conditional Content */}
        {currentSubStep === 1 && renderSubStep1()}
        {currentSubStep === 2 && renderSubStep2()}
        {currentSubStep === 3 && renderSubStep3()}
        {currentSubStep === 4 && renderSubStep4()}
        {currentSubStep === 4.5 && renderSubStep4_5()}

        {/* Spacer for bottom buttons */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        {currentSubStep === 1 ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setCurrentSubStep(2)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Begin Torch Light Test</Text>
          </TouchableOpacity>
        ) : currentSubStep === 2 ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setCurrentSubStep(3)}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                I Have Completed the Test
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentSubStep(1)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#1A4D8F" />
              <Text style={styles.secondaryButtonText}>
                Back to Instructions
              </Text>
            </TouchableOpacity>
          </>
        ) : currentSubStep === 3 ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              abnormalSigns.length === 0 && styles.disabledButton,
            ]}
            onPress={() => setCurrentSubStep(4)}
            disabled={abnormalSigns.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Continue to Record Result
            </Text>
          </TouchableOpacity>
        ) : currentSubStep === 4 ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              testPassed === false && styles.disabledButton,
            ]}
            onPress={() => {
              if (testPassed === true) {
                setCurrentSubStep(4.5);
              }
            }}
            disabled={testPassed === false}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {testPassed === false
                ? "Referral Generated"
                : "Continue to Next Step"}
            </Text>
          </TouchableOpacity>
        ) : (
          /* SubStep 4.5 */
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinueToDistanceVision}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonText}>
              Continue to Distance Vision Test
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
            active: currentSubStep !== 4.5,
          },
          { icon: "cube-outline", label: "Stock" },
          { icon: "cash-outline", label: "Payments" },
          {
            icon: "share-social-outline",
            label: "Referrals",
            active: testPassed === false,
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
              color={tab.active ? "#1A4D8F" : "#666666"}
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

const { width } = Dimensions.get("window");

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
    borderBottomColor: "#E8EAED",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
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
    color: "#1A4D8F",
    letterSpacing: -0.3,
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
    fontWeight: "700",
    color: "#1A4D8F",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E8EAED",
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
    backgroundColor: "#E8EAED",
    marginVertical: 20,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 20,
  },

  /* SubStep 1 Styles */
  gradientCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F59E0B",
    padding: 20,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  gradientTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  gradientSubtitle: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  purposeCard: {
    backgroundColor: "#DBEAFE",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#60A5FA",
    padding: 24,
  },
  purposeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A4D8F",
    marginBottom: 16,
  },
  purposeList: {
    gap: 12,
  },
  purposeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 18,
    color: "#1A4D8F",
    fontWeight: "700",
    marginRight: 12,
    marginTop: 2,
  },
  purposeText: {
    flex: 1,
    fontSize: 16,
    color: "#1A4D8F",
    lineHeight: 22,
    fontWeight: "500",
  },

  /* SubStep 2 Styles */
  instructionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#1A4D8F",
    padding: 24,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  instructionStep: {
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 20,
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
  },
  stepDescription: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 12,
    fontWeight: "500",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  warningText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
    marginLeft: 8,
    flex: 1,
  },
  checkList: {
    paddingLeft: 8,
  },
  checkItem: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 6,
    fontWeight: "500",
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7DD3FC",
  },
  noteText: {
    fontSize: 14,
    color: "#0369A1",
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },

  /* SubStep 3 Styles */
  abnormalitiesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8EAED",
    padding: 24,
    marginBottom: 20,
  },
  abnormalitiesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  abnormalitiesSubtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "500",
  },
  signsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  signButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E8EAED",
  },
  signButtonSelected: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  signIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  signLabel: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  signLabelSelected: {
    color: "#DC2626",
    fontWeight: "600",
  },
  checkIcon: {
    marginLeft: 8,
  },
  normalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E8EAED",
    marginTop: 12,
  },
  normalButtonSelected: {
    backgroundColor: "#D1FAE5",
    borderColor: "#A7F3D0",
  },
  normalIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  normalText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  reminderBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 16,
  },
  reminderText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
    fontWeight: "500",
  },
  bold: {
    fontWeight: "700",
  },

  /* SubStep 4 Styles */
  resultCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
  },
  resultCardPass: {
    backgroundColor: "#D1FAE5",
    borderColor: "#A7F3D0",
  },
  resultCardFail: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  resultTitlePass: {
    fontSize: 22,
    fontWeight: "800",
    color: "#065F46",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  resultTitleFail: {
    fontSize: 22,
    fontWeight: "800",
    color: "#DC2626",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  resultSubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    fontWeight: "500",
  },
  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8EAED",
    padding: 24,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 20,
    textAlign: "center",
  },
  testInfoBox: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  abnormalBox: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  abnormalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 8,
  },
  abnormalList: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "500",
  },
  passQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
    textAlign: "center",
  },
  passButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  passButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
  },
  passButtonYes: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },
  passButtonNo: {
    backgroundColor: "#FEE2E2",
    borderColor: "#DC2626",
  },
  passButtonEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  passButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  referralWarning: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FCA5A5",
    padding: 16,
    marginTop: 20,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
    marginBottom: 8,
  },

  /* SubStep 4.5 Styles */
  passedCard: {
    backgroundColor: "#D1FAE5",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#A7F3D0",
  },
  passedIcon: {
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
  waitCard: {
    backgroundColor: "#DBEAFE",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#60A5FA",
    padding: 24,
  },
  waitTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A4D8F",
    marginBottom: 16,
  },
  waitInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#7DD3FC",
  },
  waitText: {
    fontSize: 17,
    color: "#1A4D8F",
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
  },
  waitHighlight: {
    color: "#1A4D8F",
    fontWeight: "700",
  },
  waitNote: {
    fontSize: 15,
    color: "#1A4D8F",
    lineHeight: 22,
    fontWeight: "500",
  },

  /* Bottom Actions */
  bottomActions: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8EAED",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: "#1A4D8F",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#1A4D8F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#0D3A6F",
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonIcon: {
    marginRight: 8,
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
    borderColor: "#6B7280",
  },
  spacer: {
    height: 20,
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
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8EAED",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  tabLabelActive: {
    color: "#1A4D8F",
    fontWeight: "700",
  },
});
