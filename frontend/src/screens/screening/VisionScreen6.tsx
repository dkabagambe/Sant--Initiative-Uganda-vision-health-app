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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const [canRead, setCanRead] = useState<boolean | null>(null);
  const [showRecording, setShowRecording] = useState(false);

  const handleTestComplete = (passed: boolean) => {
    setCanRead(passed);
    if (!passed && clientAge >= 40) {
      // Immediately proceed to glasses selection for presbyopia (age 40+)
      onComplete(false);
    } else {
      setShowRecording(true);
    }
  };

  if (showRecording) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>VHT Eye Screening</Text>
              <Text style={styles.headerStep}>Step 6 of 6</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${(6 / 6) * 100}%` }]}
              />
            </View>
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
                <Text style={styles.infoValue}>{clientAge} years</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.recordQuestion}>Near Vision Test - Pass?</Text>
            <View style={styles.recordButtons}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  canRead === true && styles.recordButtonSelected,
                ]}
                onPress={() => onComplete(true)}
              >
                <Text
                  style={[
                    styles.recordButtonText,
                    canRead === true && styles.recordButtonTextSelected,
                  ]}
                >
                  ✓ Yes - Pass
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  canRead === false && styles.recordButtonSelectedRed,
                ]}
                onPress={() => {
                  onComplete(false);
                  if (canRead === false && clientAge < 40 && onRefer) {
                    onRefer();
                  }
                }}
              >
                <Text
                  style={[
                    styles.recordButtonText,
                    canRead === false && styles.recordButtonTextSelectedRed,
                  ]}
                >
                  ✗ No - Fail
                </Text>
              </TouchableOpacity>
            </View>

            {canRead === false && (
              <View style={styles.referralAlert}>
                {clientAge >= 40 ? (
                  <>
                    <Text style={styles.referralTitle}>
                      👓 Presbyopia Pathway (Age 40+)
                    </Text>
                    <Text style={styles.referralText}>
                      This is likely{" "}
                      <Text style={styles.boldText}>presbyopia</Text> - normal
                      age-related vision change. Clicking "No - Fail" will take
                      you to reading glasses selection.
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.referralTitle}>
                      🏥 Referral Required (Age 6-39)
                    </Text>
                    <Text style={styles.referralText}>
                      Near vision problems in people under 40 are{" "}
                      <Text style={styles.boldText}>not normal</Text>. Clicking
                      "No - Fail" will automatically open a pre-filled referral
                      form for comprehensive eye examination.
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.recordingBottomContainer}>
          <TouchableOpacity
            style={styles.recordingBottomButton}
            onPress={() => {
              if (canRead === false && clientAge < 40 && onRefer) {
                onRefer();
              } else {
                onComplete(false);
              }
            }}
          >
            <Text style={styles.recordingBottomButtonText}>
              Complete & Save
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>VHT Eye Screening</Text>
            <Text style={styles.headerStep}>Step 6 of 6</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${(6 / 6) * 100}%` }]}
            />
          </View>
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

            {/* N48 - Largest */}
            <View style={styles.chartRow}>
              <Text style={styles.chartRowLabel}>N48 (Largest)</Text>
              <Text style={styles.chartRowTextLarge}>The quick brown</Text>
            </View>

            {/* N24 */}
            <View style={styles.chartRow}>
              <Text style={styles.chartRowLabel}>N24</Text>
              <Text style={styles.chartRowTextMedium}>The quick brown fox</Text>
            </View>

            {/* N12 */}
            <View style={styles.chartRow}>
              <Text style={styles.chartRowLabel}>N12</Text>
              <Text style={styles.chartRowTextSmall}>
                The quick brown fox jumps
              </Text>
            </View>

            {/* N8 - Target */}
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

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.bottomButton,
            canRead === null && styles.bottomButtonDisabled,
          ]}
          onPress={() => {
            if (canRead !== null) {
              handleTestComplete(canRead);
            }
          }}
          disabled={canRead === null}
          activeOpacity={0.8}
        >
          <Text style={styles.bottomButtonText}>
            Complete Test & Record Result
          </Text>
        </TouchableOpacity>
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
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  headerStep: {
    fontSize: 14,
    color: "#6B7280",
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
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
    fontSize: 24,
    fontWeight: "400",
    color: "#111827",
    lineHeight: 32,
  },
  chartRowTextMedium: {
    fontSize: 18,
    fontWeight: "400",
    color: "#111827",
    lineHeight: 28,
  },
  chartRowTextSmall: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111827",
    lineHeight: 24,
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
    fontSize: 14,
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
    height: 80,
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
    paddingBottom: 100,
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
  referralText: {
    fontSize: 12,
  },
  recordingBottomContainer: {
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
  recordingBottomButton: {
    backgroundColor: "#9333EA", // Purple-600
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  recordingBottomButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
