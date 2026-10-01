import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../../context/LanguageContext";
import { apiService } from "../../services/api";
import { FormNavBar } from "../../components/FormNavBar";
import { KeyboardAwareFormLayout } from "../../components/KeyboardAwareFormLayout";

export default function PreScreeningQuestionsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await apiService.getCurrentUser();
      if (user) setUserData(user);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const [answers, setAnswers] = useState<Array<"Yes" | "No" | null>>([
    null, null, null, null,
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
    if (answers.some((answer) => answer === null)) {
      alert(t("answerAllQuestions"));
      return;
    }
    navigation.navigate("VisionScreen3");
  };

  const allAnswered = answers.every((a) => a !== null);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {userData?.fullName || userData?.full_name || "Santé Initiative Uganda"}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {userData?.district ? `VHT · ${userData.district} District` : ""}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="menu" size={28} color="#1A4D8F" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAwareFormLayout
        footer={
          <FormNavBar
            onPrev={() => navigation.goBack()}
            onNext={handleNext}
            nextDisabled={!allAnswered}
            nextLabel={
              allAnswered
                ? "Next →"
                : `Answer all (${answers.filter((a) => a !== null).length}/${answers.length})`
            }
          />
        }
      >
        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.screenTitle}>{t("vhtEyeScreening")}</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{t("step")} 2 {t("of")} 6</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "33%" }]} />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Questions header */}
        <View>
          <Text style={styles.questionsTitle}>📋 {t("preScreeningQuestions")}</Text>
          <Text style={styles.questionsSubtitle}>{t("askTheseQuestions")}</Text>
        </View>

        {/* Questions */}
        {questions.map((question, index) => (
          <View key={index} style={styles.questionItem}>
            <Text style={styles.questionText}>{question}</Text>
            <View style={styles.answerButtons}>
              <TouchableOpacity
                style={[
                  styles.answerButton,
                  answers[index] === "Yes" && styles.answerButtonSelected,
                ]}
                onPress={() => handleAnswerSelect(index, "Yes")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={answers[index] === "Yes" ? "checkmark" : "remove-outline"}
                  size={20}
                  color={answers[index] === "Yes" ? "#1A4D8F" : "#666666"}
                />
                <Text
                  style={[
                    styles.answerButtonText,
                    answers[index] === "Yes" && styles.answerButtonTextSelected,
                  ]}
                >
                  {t("yes")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.answerButton,
                  answers[index] === "No" && styles.answerButtonSelected,
                ]}
                onPress={() => handleAnswerSelect(index, "No")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={answers[index] === "No" ? "close" : "remove-outline"}
                  size={20}
                  color={answers[index] === "No" ? "#1A4D8F" : "#666666"}
                />
                <Text
                  style={[
                    styles.answerButtonText,
                    answers[index] === "No" && styles.answerButtonTextSelected,
                  ]}
                >
                  {t("no")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </KeyboardAwareFormLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  /* Header */
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: 72,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerLeft: { width: 44, alignItems: "flex-start", justifyContent: "center" },
  logo: { width: 38, height: 38 },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  headerSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  headerRight: { width: 44, alignItems: "flex-end", justifyContent: "center" },

  /* Progress */
  progressSection: { marginBottom: 4 },
  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 10,
    textAlign: "center",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: { fontSize: 14, fontWeight: "600", color: "#1A4D8F" },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginLeft: 12,
  },
  progressFill: { height: "100%", backgroundColor: "#2E7D32", borderRadius: 3 },
  divider: { height: 1, backgroundColor: "#E5E7EB" },

  /* Questions */
  questionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0439ac",
    marginBottom: 6,
  },
  questionsSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  questionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  questionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 14,
    lineHeight: 22,
  },
  answerButtons: { flexDirection: "row", gap: 12 },
  answerButton: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 8,
  },
  answerButtonSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2E7D32",
  },
  answerButtonText: { fontSize: 15, fontWeight: "600", color: "#666666" },
  answerButtonTextSelected: { color: "#1A4D8F" },
});
