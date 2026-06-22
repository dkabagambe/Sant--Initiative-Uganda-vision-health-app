import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";

const educationPoints = [
  {
    id: "importance",
    title: "Eye Health Importance",
    content: "Explain that eye health is important for learning, working and carrying out daily activities",
    icon: "eye",
  },
  {
    id: "early-detection",
    title: "Early Detection",
    content: "Explain that detecting eye problems early can prevent blindness",
    icon: "heart",
  },
  {
    id: "chronic-diseases",
    title: "Link to Chronic Diseases",
    content: "Explain that eye problems may be linked to diabetes and hypertension",
    icon: "medical",
  },
  {
    id: "age40",
    title: "Age 40+ Vision Changes",
    content: "Explain that people aged 40+ years may develop difficulty seeing near objects",
    icon: "alert-circle",
  },
  {
    id: "handwashing",
    title: "Hand Hygiene",
    content: "Advise household members to wash hands with soap and clean water always before touching eyes",
    icon: "water",
  },
  {
    id: "face-washing",
    title: "Face Hygiene",
    content: "Advise washing faces with clean water",
    icon: "water",
  },
  {
    id: "vitamin-a",
    title: "Vitamin A Foods",
    content:
      "Promote Vitamin A rich foods: green vegetables, mangoes, pawpaw, pumpkin, carrots, eggs, etc",
    icon: "leaf",
  },
  {
    id: "breastfeeding",
    title: "Breastfeeding",
    content: "Promote exclusive breastfeeding for the first six months",
    icon: "heart",
  },
  {
    id: "annual-exams",
    title: "Regular Eye Exams",
    content: "Advise annual eye examinations",
    icon: "checkmark-circle",
  },
  {
    id: "seek-care",
    title: "Seek Care Early",
    content: "Advise seeking care early when eye problems occur",
    icon: "alert-circle",
  },
  {
    id: "avoid-remedies",
    title: "Avoid Traditional Remedies",
    content: "Advise avoiding traditional eye medicines / herbs",
    icon: "close-circle",
  },
  {
    id: "eye-safety",
    title: "Eye Safety",
    content:
      "Advise protecting eyes from injuries, chemicals, smoke and dust",
    icon: "shield",
  },
];

export default function VHTScreeningStep3() {
  const navigation = useNavigation<any>();
  const { updateScreeningData } = useScreening();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [discussed, setDiscussed] = useState<Set<string>>(new Set());

  const toggleDiscussed = (id: string) => {
    const newDiscussed = new Set(discussed);
    if (newDiscussed.has(id)) {
      newDiscussed.delete(id);
    } else {
      newDiscussed.add(id);
    }
    setDiscussed(newDiscussed);
  };

  const allDiscussed = discussed.size === educationPoints.length;

  const handleContinue = () => {
    if (allDiscussed) {
      updateScreeningData({ educationProvided: true });
      navigation.navigate("VisionScreen1", { nextScreen: "VHTScreeningStep4" });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#7C3AED" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 3: Eye Health Education</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionCard}>
          <Ionicons name="school" size={24} color="#7C3AED" />
          <Text style={styles.instructionText}>
            Provide all education points before starting screening tests
          </Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(discussed.size / educationPoints.length) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {discussed.size}/{educationPoints.length} topics discussed
          </Text>
        </View>

        <View style={styles.section}>
          {educationPoints.map((point) => (
            <TouchableOpacity
              key={point.id}
              style={[
                styles.educationCard,
                expandedId === point.id && styles.educationCardExpanded,
              ]}
              onPress={() => setExpandedId(expandedId === point.id ? null : point.id)}
            >
              <View style={styles.educationHeader}>
                <View style={styles.educationTitleSection}>
                  <View
                    style={[
                      styles.iconCircle,
                      discussed.has(point.id) && styles.iconCircleDiscussed,
                    ]}
                  >
                    <Ionicons
                      name={point.icon as any}
                      size={16}
                      color={discussed.has(point.id) ? "#FFF" : "#7C3AED"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.educationTitle}>{point.title}</Text>
                    <Text style={styles.educationPreview}>{point.content}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleDiscussed(point.id);
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      discussed.has(point.id) && styles.checkboxChecked,
                    ]}
                  >
                    {discussed.has(point.id) && (
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              {expandedId === point.id && (
                <View style={styles.educationContent}>
                  <Text style={styles.educationText}>{point.content}</Text>
                  <TouchableOpacity
                    style={[
                      styles.discussButton,
                      discussed.has(point.id) && styles.discussButtonDiscussed,
                    ]}
                    onPress={() => toggleDiscussed(point.id)}
                  >
                    <Ionicons
                      name={
                        discussed.has(point.id)
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={20}
                      color={discussed.has(point.id) ? "#FFF" : "#7C3AED"}
                    />
                    <Text
                      style={[
                        styles.discussButtonText,
                        discussed.has(point.id) && styles.discussButtonTextDiscussed,
                      ]}
                    >
                      {discussed.has(point.id)
                        ? "Discussed ✓"
                        : "Mark as Discussed"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {allDiscussed && (
          <View style={styles.completionCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.completionText}>
              Great! You've covered all education points. Ready to proceed with screening.
            </Text>
          </View>
        )}

        {allDiscussed && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward-circle" size={22} color="#FFF" />
            <Text style={styles.continueButtonText}>Continue to Key Questions</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 24 }]}>
        <TouchableOpacity
          style={[styles.button, !allDiscussed && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!allDiscussed}
          activeOpacity={allDiscussed ? 0.7 : 1}
        >
          <Text style={[styles.buttonText, !allDiscussed && styles.buttonTextDisabled]}>
            {allDiscussed ? "Proceed to Key Questions" : "Discuss all topics first"}
          </Text>
          {allDiscussed && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
        </TouchableOpacity>
      </View>
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
    backgroundColor: "#F3E8FF",
    borderLeftWidth: 4,
    borderLeftColor: "#7C3AED",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: "#5B21B6",
    flex: 1,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7C3AED",
  },
  progressText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  educationCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E5E7EB",
    overflow: "hidden",
  },
  educationCardExpanded: {
    borderLeftColor: "#7C3AED",
  },
  educationHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    justifyContent: "space-between",
  },
  educationTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleDiscussed: {
    backgroundColor: "#7C3AED",
  },
  educationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  educationPreview: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  educationContent: {
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  educationText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 12,
  },
  discussButton: {
    borderWidth: 2,
    borderColor: "#7C3AED",
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  discussButtonDiscussed: {
    backgroundColor: "#7C3AED",
  },
  discussButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
  },
  discussButtonTextDiscussed: {
    color: "#FFF",
  },
  completionCard: {
    backgroundColor: "#DCFCE7",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  completionText: {
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
