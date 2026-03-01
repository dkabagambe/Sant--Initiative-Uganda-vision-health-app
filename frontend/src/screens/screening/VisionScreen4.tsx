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
import { apiService } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CHWHeader from "../../components/CHWHeader";

export default function TorchLightStepScreen() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const [userData, setUserData] = useState<any>(null);
  const [currentSubStep, setCurrentSubStep] = useState<1 | 2 | 3 | 4 | 4.5>(1);
  const [abnormalSigns, setAbnormalSigns] = useState<string[]>([]);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(120); // 2 minutes = 120 seconds
  const [isWaiting, setIsWaiting] = useState(false);

  const clientAge = Number(screeningData.clientAge) || 0;

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

  // Countdown timer effect
  useEffect(() => {
    if (isWaiting && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isWaiting && countdown === 0) {
      // Auto-proceed to distance vision after 2 minutes
      handleContinueToDistanceVision();
    }
  }, [isWaiting, countdown]);

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

  const handleTestComplete = async (passed: boolean) => {
    setTestPassed(passed);

    if (!passed) {
      // Abnormal signs detected - STOP and REFER immediately
      // Get human-readable labels for the abnormal signs
      const abnormalLabels = abnormalSignOptions
        .filter((opt) => abnormalSigns.includes(opt.id))
        .map((opt) => opt.label);
      const reasonText = `Torch Light Test Failed — Abnormal signs: ${abnormalLabels.join(", ")}`;

      const referralData = {
        ...screeningData,
        torchTestPassed: false,
        torchTestAbnormalSigns: abnormalLabels.join(", "),
        distanceVisionResult: "not_tested",
        nearVisionResult: "not_tested",
        needsReferral: true,
        needsGlasses: false,
        referralReason: reasonText,
        referralUrgency: "high",
        referralStep: "Step 4 - Torch Light Test"
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
        urgency: "high",
        notes: `Referred from Step 4 — Torch Light Test.\nAbnormal signs: ${abnormalLabels.join(", ")}.\nDO NOT proceed with other vision tests.`,
      };

      // Try root navigator (ScreeningStack -> CHWTabs -> Root)
      const root = navigation.getParent()?.getParent();
      if (root) {
        root.navigate("CreateReferralScreen", referralParams);
      } else {
        // Fallback: try one level up
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate("CreateReferralScreen", referralParams);
        } else {
          navigation.navigate("CreateReferralScreen" as any, referralParams);
        }
      }
    } else {
      // No abnormal signs - check age
      updateScreeningData({
        torchTestPassed: true,
        torchTestAbnormalSigns: "none"
      });

      if (clientAge < 6) {
        // Children under 6: END screening after torch test
        // Save screening data first
        const screeningComplete = {
          ...screeningData,
          torchTestPassed: true,
          torchTestAbnormalSigns: "none",
          needsReferral: false,
          needsGlasses: false,
          notes: `Child under 6 years old - only torch test performed. No abnormal signs detected.`
        };

        try {
          const result = await apiService.createScreening(screeningComplete);
          
          Alert.alert(
            "✅ Screening Complete",
            `Child is ${clientAge} years old. Only torch light test is required for children under 6.\n\nNo abnormal signs detected. Screening saved successfully.`,
            [
              {
                text: "OK",
                onPress: () => {
                  updateScreeningData({});
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "AppTabs" }],
                  });
                },
              },
            ],
          );
        } catch (error) {
          // Save offline if API fails
          console.error("Failed to save screening:", error);
          Alert.alert(
            "✅ Screening Complete (Saved Offline)",
            `Child is ${clientAge} years old. Screening saved locally and will sync when online.`,
            [
              {
                text: "OK",
                onPress: () => {
                  updateScreeningData({});
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "AppTabs" }],
                  });
                },
              },
            ],
          );
        }
      } else {
        // Age 6+: Show 2-minute wait, then continue
        setIsWaiting(true);
        setCurrentSubStep(4.5);
      }
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
                ⚠️ Referral Required
              </Text>
              <Text style={styles.warningText}>
                Clicking "No - Fail" will open the referral form with client details pre-filled. Do NOT proceed with other vision tests.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSubStep4_5 = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    
    return (
      <View style={styles.contentContainer}>
        <View style={styles.passedCard}>
          <View style={styles.passedIcon}>
            <Ionicons name="checkmark-circle" size={40} color="#10B981" />
          </View>
          <Text style={styles.passedTitle}>Torch Test Passed ✅</Text>
          <Text style={styles.passedSubtitle}>No abnormal signs detected</Text>
        </View>

        <View style={styles.waitCard}>
          <Text style={styles.waitTitle}>⏱️ 2-Minute Wait Required</Text>
          <Text style={styles.waitSubtitle}>Allowing eyes to adjust before distance vision test</Text>
          
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
            <Text style={styles.countdownLabel}>Time Remaining</Text>
          </View>

          <View style={styles.waitInfo}>
            <Ionicons name="information-circle" size={20} color="#2E7D32" />
            <Text style={styles.waitNote}>
              The test will automatically continue when the timer reaches 0:00
            </Text>
          </View>

          {countdown > 0 && (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleContinueToDistanceVision}
            >
              <Text style={styles.skipButtonText}>Skip Wait (Not Recommended)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

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
            {userData?.full_name || "Santé Initiative Uganda"}
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
              testPassed === null && styles.disabledButton,
            ]}
            onPress={() => {
              if (testPassed === true) {
                setCurrentSubStep(4.5);
              }
            }}
            disabled={testPassed === null || testPassed === false}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Continue to Next Step
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
        <View style={{ height: 190 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
  headerRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 40,
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
    backgroundColor: "#2E7D32",
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  primaryButton: {
    backgroundColor: "#2E7D32",
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

  countdownContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 32,
    marginVertical: 24,
    borderWidth: 2,
    borderColor: "#BFDBFE",
  },
  countdownText: {
    fontSize: 56,
    fontWeight: "700",
    color: "#1E40AF",
    fontFamily: "monospace",
  },
  countdownLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    fontWeight: "500",
  },
  waitSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  skipButtonText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
