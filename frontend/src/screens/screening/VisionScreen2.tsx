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

export default function PreScreeningQuestionsScreen() {
  const navigation = useNavigation<any>();

  const [answers, setAnswers] = useState<Array<"Yes" | "No" | null>>([
    null,
    null,
    null,
    null,
  ]);

  const questions = [
    "Q1. Do you have difficulty seeing far away objects?",
    "Q2. Do you have difficulty reading small print?",
    "Q3. Have you noticed any changes in your vision recently?",
    "Q4. Do you experience eye pain or discomfort?",
  ];

  const handleAnswerSelect = (questionIndex: number, answer: "Yes" | "No") => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    // Navigate to next screen
    navigation.navigate("VisionScreen3");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top Header with User Info */}
      {/* <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.organization}>Santé Initiative Uganda</Text>
          <Text style={styles.userName}>Jane Nambi</Text>
          <Text style={styles.userRole}>CHW - Luweero</Text>
        </View>
      </View> */}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content Container */}
        <View style={styles.contentContainer}>
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <Text style={styles.screenTitle}>VHT Eye Screening</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>Step 2 of 6</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "33%" }]} />
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Questions Header */}
          <View style={styles.questionsHeader}>
            <Text style={styles.questionsTitle}>Pre-Screening Questions</Text>
            <Text style={styles.questionsSubtitle}>
              Ask these questions before examination
            </Text>
          </View>

          {/* Questions List */}
          <View style={styles.questionsList}>
            {questions.map((question, index) => (
              <View key={index} style={styles.questionItem}>
                <Text style={styles.questionText}>{question}</Text>

                <View style={styles.answerButtons}>
                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      styles.yesButton,
                      answers[index] === "Yes" && styles.answerButtonSelected,
                    ]}
                    onPress={() => handleAnswerSelect(index, "Yes")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        answers[index] === "Yes"
                          ? "checkmark"
                          : "remove-outline"
                      }
                      size={20}
                      color={answers[index] === "Yes" ? "#1A4D8F" : "#666666"}
                    />
                    <Text
                      style={[
                        styles.answerButtonText,
                        answers[index] === "Yes" &&
                          styles.answerButtonTextSelected,
                      ]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      styles.noButton,
                      answers[index] === "No" && styles.answerButtonSelected,
                    ]}
                    onPress={() => handleAnswerSelect(index, "No")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        answers[index] === "No" ? "close" : "remove-outline"
                      }
                      size={20}
                      color={answers[index] === "No" ? "#1A4D8F" : "#666666"}
                    />
                    <Text
                      style={[
                        styles.answerButtonText,
                        answers[index] === "No" &&
                          styles.answerButtonTextSelected,
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
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
          style={[
            styles.nextButton,
            // Enable this to require all answers before proceeding:
            // answers.every(a => a !== null) ? {} : styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
          // disabled={!answers.every(a => a !== null)}
        >
          <Text style={styles.nextButtonText}>Next</Text>
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
              size={24}
              color={index === 1 ? "#1A4D8F" : "#666666"}
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
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerContent: {
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
    paddingTop: 70,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80,
  },
  progressSection: {
    marginBottom: 16,
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
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
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
    backgroundColor: "#2E7D32",
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  questionsHeader: {
    marginBottom: 28,
  },
  questionsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0439ac",
    marginBottom: 8,
  },
  questionsSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
  },
  questionsList: {
    gap: 20,
  },
  questionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  answerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  answerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 8,
  },
  yesButton: {
    // Specific styles for Yes button if needed
  },
  noButton: {
    // Specific styles for No button if needed
  },
  answerButtonSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2E7D32",
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },
  answerButtonTextSelected: {
    color: "#1A4D8F",
  },
  bottomNav: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
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
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#1A4D8F",
    fontWeight: "600",
  },
});
