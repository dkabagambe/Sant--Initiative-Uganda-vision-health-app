import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";

export default function VHTScreeningStep4() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const [referralReasons, setReferralReasons] = useState<string[]>([]);
  const [shouldRefer, setShouldRefer] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState<Set<string>>(
    new Set()
  );
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({});

  const clientAge = screeningData.clientAge || 0;

  // Determine which questions to show based on age
  const isChild = clientAge >= 0 && clientAge <= 5;
  const isYoungAdult = clientAge >= 6 && clientAge <= 39;
  const isAdult = clientAge >= 40;

  const questions = [
    ...(isChild
      ? [
          {
            id: "eye-concerns",
            question: "Does the child have any eye concerns?",
            yesAction: "REFER",
            yesMessage: "Refer to health facility immediately",
            section: "Child Vision Assessment",
          },
          {
            id: "follows-movement",
            question: "Does the child follow faces and movement?",
            noAction: "REFER",
            noMessage: "Refer to health facility immediately",
            section: "Child Vision Assessment",
          },
        ]
      : []),
    ...(isYoungAdult || isAdult
      ? [
          {
            id: "severe-pain",
            question: "Does client have severe eye pain, discomfort or itching?",
            yesAction: "REFER",
            yesMessage: "Refer to health facility immediately",
            section: "Red Flag Assessment",
          },
          {
            id: "vision-loss",
            question: "Has client experienced sudden loss of vision or severe headache lasting several hours?",
            yesAction: "REFER",
            yesMessage: "Refer to health facility immediately",
            section: "Red Flag Assessment",
          },
          {
            id: "chronic-disease",
            question: "Does client have diabetes or hypertension?",
            yesAction: "REFER_EDUCATE",
            yesMessage: "Educate on annual eye checkups and refer",
            section: "Chronic Disease Assessment",
          },
        ]
      : []),
    ...(isAdult
      ? [
          {
            id: "blindness-history",
            question: "Is there a family history of blindness?",
            yesAction: "REFER_EDUCATE",
            yesMessage: "Educate on glaucoma risk and encourage regular checks",
            section: "Glaucoma Risk Assessment",
          },
        ]
      : []),
  ];

  const handleAnswer = (questionId: string, answer: "yes" | "no") => {
    const question = questions.find((q) => q.id === questionId);
    const newAnswered = new Set(questionsAnswered);
    newAnswered.add(questionId);
    setQuestionsAnswered(newAnswered);
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    let newReasons = referralReasons.filter((reason) => reason !== question?.yesMessage && reason !== question?.noMessage);
    let shouldReferNow = false;

    if (question) {
      if (
        answer === "yes" &&
        (question.yesAction === "REFER" || question.yesAction === "REFER_EDUCATE")
      ) {
        shouldReferNow = true;
        newReasons.push(question.yesMessage);
      } else if (
        answer === "no" &&
        question.noAction === "REFER"
      ) {
        shouldReferNow = true;
        newReasons.push(question.noMessage);
      }
    }

    setReferralReasons(newReasons);
    setShouldRefer(shouldReferNow);

    updateScreeningData({
      hasEyeConcerns: newAnswers["eye-concerns"] === "yes",
      followsMovement:
        newAnswers["follows-movement"] === undefined
          ? undefined
          : newAnswers["follows-movement"] === "yes",
      hasSevereEyePain: newAnswers["severe-pain"] === "yes",
      hasSuddenVisionLoss: newAnswers["vision-loss"] === "yes",
      hasDiabetesHypertension: newAnswers["chronic-disease"] === "yes",
      familyHistoryBlindness: newAnswers["blindness-history"] === "yes",
      referralReasonsFromQuestions: newReasons,
    });

    if (shouldReferNow) {
      Alert.alert(
        "Referral Required",
        question?.yesMessage || question?.noMessage || "",
        [
          {
            text: "OK",
            onPress: () => {
              updateScreeningData({
                needsReferral: true,
                referralReason: question?.yesMessage || question?.noMessage || "",
                referralReasonsFromQuestions: newReasons,
              });
              navigation.navigate("VHTReferral");
            },
          },
        ]
      );
    }
  };

  const allQuestionsAnswered = questionsAnswered.size === questions.length;

  const handleContinue = () => {
    if (allQuestionsAnswered && !shouldRefer) {
      updateScreeningData({
        referralReasonsFromQuestions: referralReasons,
      });
      navigation.navigate("VHTScreeningStep5");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#DC2626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 4: Key Questions</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionCard}>
          <Ionicons name="alert-circle" size={24} color="#DC2626" />
          <Text style={styles.instructionText}>
            Ask these questions before starting vision tests. Some answers require immediate referral.
          </Text>
        </View>

        <View style={styles.ageCard}>
          <Text style={styles.ageText}>Client Age: {clientAge} years</Text>
          {isChild && (
            <Text style={styles.ageCategory}>Assessing: Child (0-5 years)</Text>
          )}
          {isYoungAdult && (
            <Text style={styles.ageCategory}>Assessing: Young Adult (6-39 years)</Text>
          )}
          {isAdult && (
            <Text style={styles.ageCategory}>Assessing: Adult (40+ years)</Text>
          )}
        </View>

        {questions.map((question, index) => {
          const isAnswered = questionsAnswered.has(question.id);
          return (
            <View key={question.id} style={styles.questionSection}>
              {index === 0 && (
                <Text style={styles.sectionLabel}>{question.section}</Text>
              )}
              {index > 0 &&
                questions[index - 1].section !== question.section && (
                  <Text style={styles.sectionLabel}>{question.section}</Text>
                )}

              <View style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionText}>{question.question}</Text>
                  {isAnswered && (
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  )}
                </View>

                <View style={styles.answerButtons}>
                  <TouchableOpacity
                    style={[styles.answerButton, styles.yesButton]}
                    onPress={() => handleAnswer(question.id, "yes")}
                    disabled={isAnswered}
                  >
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={isAnswered ? "#999" : "#DC2626"}
                    />
                    <Text
                      style={[
                        styles.answerButtonText,
                        isAnswered && styles.answerButtonTextDisabled,
                      ]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.answerButton, styles.noButton]}
                    onPress={() => handleAnswer(question.id, "no")}
                    disabled={isAnswered}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color={isAnswered ? "#999" : "#10B981"}
                    />
                    <Text
                      style={[
                        styles.answerButtonText,
                        isAnswered && styles.answerButtonTextDisabled,
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {allQuestionsAnswered && !shouldRefer && (
          <View style={styles.proceedCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.proceedText}>
              All questions answered. Client can proceed to screening tests.
            </Text>
          </View>
        )}

        {allQuestionsAnswered && !shouldRefer && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward-circle" size={22} color="#FFF" />
            <Text style={styles.continueButtonText}>Continue to Prepare Screening Area</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {!shouldRefer && (
        <View style={[styles.footer, { paddingBottom: 24 }]}>
          <TouchableOpacity
            style={[styles.button, !allQuestionsAnswered && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!allQuestionsAnswered}
            activeOpacity={allQuestionsAnswered ? 0.7 : 1}
          >
            <Text style={[styles.buttonText, !allQuestionsAnswered && styles.buttonTextDisabled]}>
              {allQuestionsAnswered
                ? "Proceed to Setup Screening Area"
                : `Answer remaining questions (${questions.length - questionsAnswered.size})`}
            </Text>
            {allQuestionsAnswered && (
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  instructionCard: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: "#7F1D1D",
    flex: 1,
    lineHeight: 20,
  },
  ageCard: {
    backgroundColor: "#F0F9FF",
    borderLeftWidth: 4,
    borderLeftColor: "#0891B2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  ageText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0C4A6E",
    marginBottom: 4,
  },
  ageCategory: {
    fontSize: 13,
    color: "#0C4A6E",
  },
  questionSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#F3F4F6",
  },
  questionCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    lineHeight: 21,
  },
  answerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
  },
  yesButton: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  noButton: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  answerButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  answerButtonTextDisabled: {
    color: "#999",
  },
  proceedCard: {
    backgroundColor: "#DCFCE7",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
    gap: 12,
  },
  proceedText: {
    fontSize: 14,
    color: "#065F46",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  button: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonTextDisabled: {
    color: "#9CA3AF",
  },
  continueButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
