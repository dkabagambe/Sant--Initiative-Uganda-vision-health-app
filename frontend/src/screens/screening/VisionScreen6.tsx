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
import AsyncStorage from "@react-native-async-storage/async-storage";
import CHWHeader from "../../components/CHWHeader";
import {
  moderateScale,
  fontSize as responsiveFontSize,
} from "../../utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

interface VisionScreen6Props {
  clientAge: number;
  onComplete: (passed: boolean) => void;
  onRefer?: () => void;
}

export default function VisionScreen6({
  clientAge,
  onComplete,
  onRefer,
}: VisionScreen6Props) {
  const navigation = useNavigation<any>();
  const [canRead, setCanRead] = useState<boolean | null>(null);
  const [showRecording, setShowRecording] = useState(false);
  const [userData, setUserData] = useState<any>(null);

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

  const handleTestComplete = (passed: boolean) => {
    console.log("VisionScreen6 - Test completed:", passed);
    console.log("VisionScreen6 - Client age:", clientAge);
    setCanRead(passed);
    setShowRecording(true);
    console.log("VisionScreen6 - Should show recording screen now");
  };

  if (showRecording) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

        {/* Top Header with Logo and Menu - Fixed at top */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <Image
                source={require("../../assets/logo.png")}
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
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.recordingContent}
        >
          {/* Result Card */}
          <View
            style={[
              styles.resultCard,
              canRead ? styles.passedCard : styles.failedCard,
            ]}
          >
            <View style={styles.resultHeader}>
              <Ionicons
                name={canRead ? "checkmark-circle" : "alert-circle"}
                size={32}
                color={canRead ? "#10B981" : "#F59E0B"}
              />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultTitle}>
                  {canRead
                    ? "✅ Near Vision Test - Passed"
                    : "⚠️ Near Vision Test - Failed"}
                </Text>
                <Text style={styles.resultSubtitle}>
                  {canRead
                    ? "Client can read close up clearly"
                    : "Client has difficulty reading - needs assessment"}
                </Text>
              </View>
            </View>
          </View>

          {/* Recording Card */}
          <View style={styles.recordingCard}>
            <Text style={styles.recordingTitle}>
              📝 Record Result in VHT Register:
            </Text>

            <View style={styles.recordInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Test Name:</Text>
                <Text style={styles.infoValue}>Near Vision (N8 at 40cm)</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Both Eyes:</Text>
                <Text style={styles.infoValue}>Tested Together</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Client Age:</Text>
                <Text style={styles.infoValue}>
                  {clientAge > 0 ? `${clientAge} years` : "Not available"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Result:</Text>
                <Text
                  style={[
                    styles.infoValue,
                    canRead ? styles.passText : styles.failText,
                  ]}
                >
                  {canRead ? "PASS" : "FAIL"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {!canRead && clientAge >= 40 && (
              <View style={styles.presbyopiaNote}>
                <Ionicons name="information-circle" size={20} color="#2E7D32" />
                <Text style={styles.presbyopiaText}>
                  Age 40+ with near vision difficulty = Presbyopia (normal
                  aging). Will proceed to reading glasses selection.
                </Text>
              </View>
            )}

            {!canRead && clientAge < 40 && clientAge > 0 && (
              <View style={styles.referralNote}>
                <Ionicons name="warning" size={20} color="#DC2626" />
                <Text style={styles.referralText}>
                  Near vision problem in person under 40 is abnormal. Will
                  generate referral for eye examination.
                </Text>
              </View>
            )}

            {/* Navigation Button Inside Card */}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                console.log(
                  "Button pressed - canRead:",
                  canRead,
                  "age:",
                  clientAge,
                );
                onComplete(canRead === true);
              }}
            >
              <Text style={styles.nextButtonText}>
                {canRead === true
                  ? "✅ Complete Screening"
                  : clientAge >= 40
                    ? "👓 Select Reading Glasses"
                    : "🏥 Create Referral"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Button - ALWAYS VISIBLE */}
        <View style={styles.recordingBottomContainer}>
          <TouchableOpacity
            style={styles.recordingBottomButton}
            onPress={() => {
              console.log(
                "VisionScreen6 Button pressed - canRead:",
                canRead,
                "clientAge:",
                clientAge,
              );
              onComplete(canRead === true);
            }}
          >
            <Text style={styles.recordingBottomButtonText}>
              {canRead === true
                ? "✅ Complete Screening"
                : clientAge >= 40
                  ? "👓 Select Reading Glasses"
                  : "🏥 Create Referral"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top Header with Logo and Menu - Fixed at top */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Image
              source={require("../../assets/logo.png")}
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

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Step Title Card */}
          <View style={styles.titleCard}>
            <View style={styles.titleContent}>
              <Ionicons name="eye" size={28} color="#9333EA" />
              <View style={styles.titleTextContainer}>
                <Text style={styles.stepTitle}>Step 6: Near Vision Test</Text>
                <Text style={styles.stepSubtitle}>
                  Reading Test • Ages 6+ Only
                </Text>
              </View>
            </View>
          </View>

          {/* Prerequisites Card */}
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
                  Distance Vision Test - Passed
                </Text>
              </View>
              <View style={styles.prerequisiteItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.prerequisiteText}>
                  Client Age - {clientAge} years (≥6)
                </Text>
              </View>
            </View>
          </View>

          {/* Test Instructions Card */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>📖 Test Instructions:</Text>

            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>
                  Test <Text style={styles.boldText}>both eyes together</Text>{" "}
                  (no covering)
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                  Hold chart at <Text style={styles.boldText}>40 cm</Text>{" "}
                  (about arm's length)
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>
                  Ask client to read <Text style={styles.boldText}>N8 row</Text>{" "}
                  (smallest line)
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>4</Text>
                </View>
                <Text style={styles.instructionText}>
                  Make sure there is{" "}
                  <Text style={styles.boldText}>good lighting</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* N8 Reading Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Near Vision Chart (40cm)</Text>

            {/* N48 - Largest sentence row */}
            <View style={styles.chartRow}>
              <Text style={styles.chartRowLabel}>N48 (Largest)</Text>
              <Text style={styles.chartRowTextLarge}>The quick brown</Text>
            </View>

            {/* N24 - Middle sentence row */}
            <View style={styles.chartRow}>
              <Text style={styles.chartRowLabel}>N24</Text>
              <Text style={styles.chartRowTextMedium}>The quick brown fox</Text>
            </View>

            {/* N12 - Smallest sentence row */}
            <View style={styles.chartRow}>
              <Text style={styles.chartRowLabel}>N12</Text>
              <Text style={styles.chartRowTextSmall}>
                The quick brown fox jumps
              </Text>
            </View>

            {/* N8 - Target sentence row */}
            <View style={styles.targetRow}>
              <Text style={styles.targetRowLabel}>⭐ N8 ROW (TEST THIS)</Text>
              <Text style={styles.targetRowText}>
                The quick brown fox jumps over the lazy dog
              </Text>
            </View>
          </View>

          {/* Client Instructions */}
          <View style={styles.clientInstructionsCard}>
            <Text style={styles.clientInstructionsTitle}>
              📝 Ask the Client:
            </Text>
            <Text style={styles.clientInstructionsText}>
              "Please read the purple highlighted line (N8 row) out loud."
            </Text>
          </View>

          {/* Test Result Buttons */}
          <View style={styles.testButtonsCard}>
            <Text style={styles.testButtonsTitle}>
              Can client read N8 row clearly?
            </Text>
            <View style={styles.testButtonsContainer}>
              <TouchableOpacity
                style={styles.passButton}
                onPress={() => handleTestComplete(true)}
              >
                <Text style={styles.passButtonIcon}>✓</Text>
                <Text style={styles.passButtonText}>Yes - Pass</Text>
                <Text style={styles.passButtonSubtext}>Can read clearly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.failButton}
                onPress={() => handleTestComplete(false)}
              >
                <Text style={styles.failButtonIcon}>✗</Text>
                <Text style={styles.failButtonText}>No - Fail</Text>
                <Text style={styles.failButtonSubtext}>Cannot read</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pathway Information */}
          <View style={styles.pathwayContainer}>
            <View style={styles.pathwayItemGreen}>
              <Text style={styles.pathwayText}>
                <Text style={styles.boldText}>If Pass:</Text> End visit - No
                glasses needed
              </Text>
            </View>

            <View style={styles.pathwayItemBlue}>
              <Text style={styles.pathwayText}>
                <Text style={styles.boldText}>If Fail & Age 40+:</Text>{" "}
                Presbyopia - Proceed to reading glasses selection
              </Text>
            </View>

            <View style={styles.pathwayItemRed}>
              <Text style={styles.pathwayText}>
                <Text style={styles.boldText}>If Fail & Age 6-39:</Text>{" "}
                Abnormal - Refer to health facility
              </Text>
            </View>
          </View>

          {/* Spacer for bottom button */}
          <View style={styles.spacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    flex: 1,
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
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
    marginTop: 100,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  // Step Title Card
  titleCard: {
    backgroundColor: "#FAF5FF", // Purple-50 equivalent
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#9333EA", // Purple-600
  },
  titleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#374151",
  },
  // Prerequisites Card
  prerequisitesCard: {
    backgroundColor: "#FEF3C7", // Amber-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#F59E0B", // Amber-500
  },
  prerequisitesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E", // Amber-900
    marginBottom: 12,
  },
  prerequisiteList: {
    gap: 8,
  },
  prerequisiteItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  prerequisiteText: {
    fontSize: 14,
    color: "#92400E",
    marginLeft: 8,
  },
  // Instructions Card
  instructionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#C084FC", // Purple-400
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9333EA", // Purple-600
    marginBottom: 16,
    textAlign: "center",
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  instructionNumber: {
    width: 28,
    height: 28,
    backgroundColor: "#9333EA", // Purple-600
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  instructionText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: "700",
    color: "#9333EA", // Purple-600
  },
  // Chart Card
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#1F2937",
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },
  chartRow: {
    marginBottom: 16,
  },
  chartRowLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  chartRowTextLarge: {
    // N48 - biggest and bold
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 32,
  },
  chartRowTextMedium: {
    // N24 - middle size
    fontSize: 18,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 28,
  },
  chartRowTextSmall: {
    // N12 - smallest and lighter
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    lineHeight: 20,
  },
  targetRow: {
    backgroundColor: "#FAF5FF", // Purple-50
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: "#C084FC", // Purple-400
  },
  targetRowLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9333EA", // Purple-600
    marginBottom: 8,
    textAlign: "center",
  },
  targetRowText: {
    // N8 should be the smallest line on the chart, but still comfortably readable
    fontSize: 13,
    fontWeight: "400",
    color: "#111827",
    lineHeight: 20,
    textAlign: "center",
  },
  // Client Instructions
  clientInstructionsCard: {
    backgroundColor: "#E0F2FE", // Blue-50
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BAE6FD", // Blue-200
  },
  clientInstructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF", // Blue-800
    marginBottom: 8,
  },
  clientInstructionsText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#1E40AF", // Blue-800
  },
  // Test Buttons
  testButtonsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  testButtonsTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  testButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  passButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10B981", // Green-500
    backgroundColor: "#F0FDF4", // Green-50
  },
  passButtonIcon: {
    fontSize: 32,
    fontWeight: "700",
    color: "#10B981", // Green-600
    marginBottom: 4,
  },
  passButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981", // Green-600
  },
  passButtonSubtext: {
    fontSize: 12,
    fontWeight: "400",
    color: "#10B981", // Green-600
    marginTop: 2,
  },
  failButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DC2626", // Red-600
    backgroundColor: "#FEF2F2", // Red-50
  },
  failButtonIcon: {
    fontSize: 32,
    fontWeight: "700",
    color: "#DC2626", // Red-600
    marginBottom: 4,
  },
  failButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626", // Red-600
  },
  failButtonSubtext: {
    fontSize: 12,
    fontWeight: "400",
    color: "#DC2626", // Red-600
    marginTop: 2,
  },
  // Pathway Information
  pathwayContainer: {
    gap: 8,
    marginBottom: 24,
  },
  pathwayItemGreen: {
    backgroundColor: "#F0FDF4", // Green-50
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0", // Green-200
  },
  pathwayItemBlue: {
    backgroundColor: "#E0F2FE", // Blue-50
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BAE6FD", // Blue-200
  },
  pathwayItemRed: {
    backgroundColor: "#FEF2F2", // Red-50
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA", // Red-200
  },
  pathwayText: {
    fontSize: 12,
    color: "#111827",
  },
  spacer: {
    height: 120,
  },
  // Bottom Container
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomButton: {
    backgroundColor: "#9333EA", // Purple-600
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  bottomButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  bottomButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Recording Screen Styles
  recordingContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  resultCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  passedCard: {
    backgroundColor: "#F0FDF4", // Green-50
    borderWidth: 2,
    borderColor: "#10B981", // Green-500
  },
  failedCard: {
    backgroundColor: "#FEF3C7", // Amber-100
    borderWidth: 2,
    borderColor: "#F59E0B", // Amber-500
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 16,
    color: "#374151",
  },
  recordingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recordingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  recordInfo: {
    gap: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  recordQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  recordButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  recordButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  recordButtonSelected: {
    borderColor: "#10B981", // Green-500
    backgroundColor: "#F0FDF4", // Green-50
  },
  recordButtonSelectedRed: {
    borderColor: "#DC2626", // Red-600
    backgroundColor: "#FEF2F2", // Red-50
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  recordButtonTextSelected: {
    color: "#10B981", // Green-600
  },
  recordButtonTextSelectedRed: {
    color: "#DC2626", // Red-600
  },
  passText: {
    color: "#10B981",
    fontWeight: "700",
  },
  failText: {
    color: "#DC2626",
    fontWeight: "700",
  },
  presbyopiaNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  presbyopiaText: {
    flex: 1,
    fontSize: 12,
    color: "#2E7D32",
    lineHeight: 18,
  },
  referralNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  referralText: {
    flex: 1,
    fontSize: 12,
    color: "#DC2626",
    lineHeight: 18,
  },
  referralAlert: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
  },
  referralTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  recordingBottomContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  recordingBottomButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  recordingBottomButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  nextButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
