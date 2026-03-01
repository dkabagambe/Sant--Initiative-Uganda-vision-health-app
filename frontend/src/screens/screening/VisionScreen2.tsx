import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../../context/LanguageContext";
import { apiService } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PreScreeningQuestionsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
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

  const [answers, setAnswers] = useState<Array<"Yes" | "No" | null>>([
    null,
    null,
    null,
    null,
  ]);

  const questions = [
    t("q1DifficultyFar"),
    t("q2DifficultyReading"),
    t("q3VisionChanges"),
    t("q4EyePain"),
  ];

  const handleAnswerSelect = (questionIndex: number, answer: "Yes" | "No") => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    // Check if all questions are answered
    if (answers.some(answer => answer === null)) {
      alert(t("answerAllQuestions"));
      return;
    }
    // Navigate to next screen
    navigation.navigate("VisionScreen3");
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
      >
        {/* Main Content Container */}
        <View style={styles.contentContainer}>
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <Text style={styles.screenTitle}>{t("vhtEyeScreening")}</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{t("step")} 2 {t("of")} 6</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "33%" }]} />
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Questions Header */}
          <View style={styles.questionsHeader}>
            <Text style={styles.questionsTitle}>
              📋 {t("preScreeningQuestions")}
            </Text>
            <Text style={styles.questionsSubtitle}>
              {t("askTheseQuestions")}
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
                      {t("yes")}
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
                      {t("no")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
        {/* Bottom Navigation Buttons */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>{t("back")}</Text>
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
            <Text style={styles.nextButtonText}>{t("next")}</Text>
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
    backgroundColor: "#F8FAFC",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44,
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
  scrollView: {
    flex: 1,
    marginTop: StatusBar.currentHeight ? StatusBar.currentHeight + 120 : 150,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 16,
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
});
