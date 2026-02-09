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
import { useNavigation } from "@react-navigation/native";

export default function NearVisionTestScreen() {
  const navigation = useNavigation<any>();
  const [testResult, setTestResult] = useState<"pass" | "fail" | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<
    "40plus" | "6to39" | null
  >(null);

  const handleTestResult = (result: "pass" | "fail") => {
    setTestResult(result);
  };

  const handleAgeGroupSelection = (group: "40plus" | "6to39") => {
    setSelectedAgeGroup(group);
  };

  const handleComplete = () => {
    if (testResult === "pass") {
      // End visit - No glasses needed
      navigation.navigate("ScreeningComplete");
    } else if (testResult === "fail" && selectedAgeGroup) {
      // Navigate based on age group
      if (selectedAgeGroup === "40plus") {
        navigation.navigate("ReadingGlassesSelection");
      } else {
        // Age 6-39: Refer to health facility
        navigation.navigate("ReferralScreen");
      }
    } else {
      alert("Please complete all selections before proceeding.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top Header with User Info */}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.screenTitle}>VHT Eye Screening</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>Step 6 of 6</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "100%" }]} />
            </View>
          </View>
        </View>

        {/* Step Title */}
        <Text style={styles.stepTitle}>Step 6: Near Vision Test</Text>

        {/* Test Info Badge */}
        <View style={styles.infoBadge}>
          <Ionicons name="book" size={16} color="#1A4D8F" />
          <Text style={styles.infoBadgeText}>Reading Test • Ages 6+ Only</Text>
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
              Distance Vision Test - Passed
            </Text>
          </View>

          <View style={styles.prerequisiteItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.prerequisiteText}>
              Client Age - 88 years (≥6)
            </Text>
          </View>
        </View>

        {/* Test Instructions */}
        <View style={styles.instructionsCard}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="book" size={20} color="#1A4D8F" />
            <Text style={styles.instructionsTitle}>Test Instructions:</Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Test both eyes together (no covering)
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Hold chart at 40 cm (about arm's length)
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Ask client to read N8 row (smallest line)
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>4</Text>
            </View>
            <Text style={styles.instructionText}>
              Make sure there is good lighting
            </Text>
          </View>
        </View>

        {/* Near Vision Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Near Vision Chart (40cm)</Text>

          {/* N48 Line */}
          <View style={styles.chartLine}>
            <Text style={styles.chartLineLabel}>N48 (Largest)</Text>
            <Text style={styles.chartLineText}>The quick brown</Text>
          </View>

          {/* N24 Line */}
          <View style={styles.chartLine}>
            <Text style={styles.chartLineLabel}>N24</Text>
            <Text style={styles.chartLineText}>The quick brown fox</Text>
          </View>

          {/* N12 Line */}
          <View style={styles.chartLine}>
            <Text style={styles.chartLineLabel}>N12</Text>
            <Text style={styles.chartLineText}>The quick brown fox jumps</Text>
          </View>

          {/* N8 Line - Highlighted */}
          <View style={styles.highlightedLine}>
            <View style={styles.highlightedLabelRow}>
              <Ionicons name="star" size={20} color="#9333EA" />
              <Text style={styles.highlightedLabel}>N8 ROW (TEST THIS)</Text>
            </View>
            <Text style={styles.highlightedText}>
              The quick brown fox jumps over the lazy dog
            </Text>
          </View>
        </View>

        {/* Client Question */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Ionicons name="chatbubble" size={20} color="#1A4D8F" />
            <Text style={styles.questionTitle}>Ask the Client:</Text>
          </View>
          <Text style={styles.questionText}>
            "Please read the purple highlighted line (N8 row) out loud."
          </Text>
        </View>

        {/* Test Result Question */}
        <View style={styles.resultCard}>
          <Text style={styles.resultQuestion}>
            Can client read N8 row clearly?
          </Text>

          <View style={styles.resultButtons}>
            {/* Pass Button */}
            <TouchableOpacity
              style={[
                styles.resultButton,
                styles.passButton,
                testResult === "pass" && styles.resultButtonSelected,
              ]}
              onPress={() => handleTestResult("pass")}
              activeOpacity={0.7}
            >
              <View style={styles.resultButtonContent}>
                <Text style={styles.resultEmoji}>✓</Text>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultButtonLabel}>Yes - Pass</Text>
                  <Text style={styles.resultButtonSubtitle}>
                    Can read clearly
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Fail Button */}
            <TouchableOpacity
              style={[
                styles.resultButton,
                styles.failButton,
                testResult === "fail" && styles.resultButtonSelected,
              ]}
              onPress={() => handleTestResult("fail")}
              activeOpacity={0.7}
            >
              <View style={styles.resultButtonContent}>
                <Text style={styles.resultEmoji}>✗</Text>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultButtonLabel}>No - Fail</Text>
                  <Text style={styles.resultButtonSubtitle}>Cannot read</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Outcome Instructions - Based on Result */}
        {testResult === "pass" ? (
          <View style={styles.outcomeCard}>
            <Text style={styles.outcomeTitle}>If Pass:</Text>
            <View style={styles.outcomeItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.outcomeText}>
                End visit - No glasses needed
              </Text>
            </View>
          </View>
        ) : testResult === "fail" ? (
          <View style={styles.outcomeCard}>
            <Text style={styles.outcomeTitle}>If Fail:</Text>

            {/* Age Group Selection */}
            <Text style={styles.ageGroupTitle}>Select Client Age Group:</Text>
            <View style={styles.ageGroupButtons}>
              <TouchableOpacity
                style={[
                  styles.ageGroupButton,
                  selectedAgeGroup === "40plus" &&
                    styles.ageGroupButtonSelected,
                ]}
                onPress={() => handleAgeGroupSelection("40plus")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.ageGroupButtonText,
                    selectedAgeGroup === "40plus" &&
                      styles.ageGroupButtonTextSelected,
                  ]}
                >
                  Age 40+
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.ageGroupButton,
                  selectedAgeGroup === "6to39" && styles.ageGroupButtonSelected,
                ]}
                onPress={() => handleAgeGroupSelection("6to39")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.ageGroupButtonText,
                    selectedAgeGroup === "6to39" &&
                      styles.ageGroupButtonTextSelected,
                  ]}
                >
                  Age 6-39
                </Text>
              </TouchableOpacity>
            </View>

            {/* Outcome Based on Age Group */}
            {selectedAgeGroup === "40plus" && (
              <View style={styles.outcomeItem}>
                <Ionicons name="glasses" size={20} color="#1A4D8F" />
                <Text style={styles.outcomeText}>
                  Presbyopia - Proceed to reading glasses selection
                </Text>
              </View>
            )}

            {selectedAgeGroup === "6to39" && (
              <View style={styles.outcomeItem}>
                <Ionicons name="medical" size={20} color="#DC2626" />
                <Text style={styles.outcomeText}>
                  Abnormal - Refer to health facility
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Spacer for bottom buttons */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Navigation Buttons */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {testResult === "pass" ? "Complete Visit" : "Continue"}
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
    paddingBottom: 140,
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
  instructionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  instructionsTitle: {
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
  chartCard: {
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
  chartTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  chartLine: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  chartLineLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  chartLineText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  highlightedLine: {
    backgroundColor: "#FAF5FF",
    borderRadius: 10,
    padding: 20,
    borderWidth: 2,
    borderColor: "#9333EA",
  },
  highlightedLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  highlightedLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9333EA",
    marginLeft: 8,
  },
  highlightedText: {
    fontSize: 16,
    color: "#9333EA",
    fontWeight: "600",
    lineHeight: 24,
  },
  questionCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0C4A6E",
    marginLeft: 8,
  },
  questionText: {
    fontSize: 16,
    color: "#0C4A6E",
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: 22,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  resultQuestion: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  resultButtons: {
    gap: 16,
  },
  resultButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
  },
  resultButtonSelected: {
    backgroundColor: "#F8FAFC",
  },
  passButton: {
    borderColor: "#10B981",
  },
  failButton: {
    borderColor: "#DC2626",
  },
  resultButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultButtonLabel: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  resultButtonSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  outcomeCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  outcomeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  outcomeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  outcomeText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    marginLeft: 12,
    flex: 1,
  },
  ageGroupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    marginTop: 8,
  },
  ageGroupButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  ageGroupButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  ageGroupButtonSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#1A4D8F",
  },
  ageGroupButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  ageGroupButtonTextSelected: {
    color: "#1A4D8F",
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
