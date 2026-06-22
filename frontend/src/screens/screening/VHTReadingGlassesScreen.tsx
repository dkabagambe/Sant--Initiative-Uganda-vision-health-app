import React, { useState } from "react";
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

const glassPowers = [
  { power: "+1.00", label: "+1.00 (Weakest)", disabled: false },
  { power: "+1.50", label: "+1.50", disabled: false },
  { power: "+2.00", label: "+2.00", disabled: false },
  { power: "+2.50", label: "+2.50", disabled: false },
  { power: "+3.00", label: "+3.00 (Strongest)", disabled: false },
];

const frames = [
  { id: "metal", label: "Metal Frame (Durable)" },
  { id: "plastic", label: "Plastic Frame (Comfortable)" },
  { id: "halfrim", label: "Half-Rim Frame (Lightweight)" },
];

const educationPoints = [
  {
    id: "near-only",
    title: "Reading Glasses for Near Work Only",
    content:
      "Explain that reading glasses are only for near work (reading, sewing, sorting rice, threading needles)",
  },
  {
    id: "remove-distance",
    title: "Remove for Distance Viewing",
    content:
      "Advise removing glasses when walking or viewing distant objects",
  },
  {
    id: "lighting",
    title: "Use Adequate Lighting",
    content:
      "Advise using adequate lighting during near work to reduce eye strain",
  },
  {
    id: "no-damage",
    title: "Glasses Do Not Damage Eyes",
    content:
      "Reassure client that reading glasses do not damage the eyes - a common misconception",
  },
  {
    id: "hold-frame",
    title: "Hold by the Frame",
    content:
      "Teach client to hold glasses by the frame, not the lenses, to avoid damage",
  },
  {
    id: "two-hands",
    title: "Use Two Hands When Removing",
    content:
      "Teach client to use two hands when removing glasses to prevent breaking",
  },
  {
    id: "clean",
    title: "Clean with Water and Cloth",
    content:
      "Teach client to clean lenses with water and clean cloth only - no harsh materials",
  },
  {
    id: "store",
    title: "Store in Case",
    content:
      "Teach client to store glasses folded inside a protective case when not in use",
  },
];

export default function VHTReadingGlassesScreen() {
  const navigation = useNavigation<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const [step, setStep] = useState(1);
  const [selectedPower, setSelectedPower] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [caseProvided, setCaseProvided] = useState(false);
  const [educationProvided, setEducationProvided] = useState<Set<string>>(
    new Set()
  );

  const handleSelectPower = (power: string) => {
    Alert.alert(
      "Power Selection",
      `Client can see N8 line clearly with ${power}?`,
      [
        {
          text: "Yes, clear vision",
          onPress: () => {
            setSelectedPower(power);
            setStep(2);
          },
        },
        {
          text: "Try next power",
          onPress: () => {
            const currentIndex = glassPowers.findIndex((g) => g.power === power);
            if (currentIndex < glassPowers.length - 1) {
              handleSelectPower(glassPowers[currentIndex + 1].power);
            } else {
              Alert.alert(
                "Max Power",
                "Already at maximum power (+3.00). Use this power."
              );
              setSelectedPower("+3.00");
              setStep(2);
            }
          },
        },
      ]
    );
  };

  const toggleEducation = (id: string) => {
    const newSet = new Set(educationProvided);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setEducationProvided(newSet);
  };

  const allEducationProvided =
    educationProvided.size === educationPoints.length;

  const handleComplete = () => {
    if (selectedPower && selectedFrame && caseProvided && allEducationProvided) {
      updateScreeningData({
        glassesDispensed: true,
        glassesPower: selectedPower,
        selectedGlassesPower: selectedPower,
        glassesFrameType: selectedFrame,
        selectedFrameType: selectedFrame,
        glassesEducationProvided: true,
      });

      navigation.navigate("ScreeningComplete", {
        glassesDispensed: true,
        glassesPower: selectedPower,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#0891B2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispense Reading Glasses</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View
              style={[
                styles.progressCircle,
                step >= 1 && styles.progressCircleActive,
              ]}
            >
              <Text style={styles.progressText}>1</Text>
            </View>
            <Text style={styles.progressLabel}>Power</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View
              style={[
                styles.progressCircle,
                step >= 2 && styles.progressCircleActive,
              ]}
            >
              <Text style={styles.progressText}>2</Text>
            </View>
            <Text style={styles.progressLabel}>Frame</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View
              style={[
                styles.progressCircle,
                step >= 3 && styles.progressCircleActive,
              ]}
            >
              <Text style={styles.progressText}>3</Text>
            </View>
            <Text style={styles.progressLabel}>Educate</Text>
          </View>
        </View>

        {step === 1 && (
          <>
            <View style={styles.instructionCard}>
              <Ionicons name="information-circle" size={24} color="#0891B2" />
              <Text style={styles.instructionText}>
                Select the lowest power that allows the client to see the N8 line clearly
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fitting Process</Text>
              <View style={styles.fitProcess}>
                <View style={styles.fitStep}>
                  <Ionicons name="radio-button-on" size={20} color="#0891B2" />
                  <Text style={styles.fitText}>
                    Start with +1.00 sample glasses
                  </Text>
                </View>
                <View style={styles.fitStep}>
                  <Ionicons name="arrow-down" size={20} color="#0891B2" />
                  <Text style={styles.fitText}>
                    Ask if N8 line can be seen clearly
                  </Text>
                </View>
                <View style={styles.fitStep}>
                  <Ionicons name="arrow-down" size={20} color="#0891B2" />
                  <Text style={styles.fitText}>
                    If not, try +1.50, +2.00, +2.50, +3.00 sequentially
                  </Text>
                </View>
                <View style={styles.fitStep}>
                  <Ionicons name="arrow-down" size={20} color="#0891B2" />
                  <Text style={styles.fitText}>
                    Select lowest power with clear vision
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Glass Power</Text>
              <View style={styles.powersList}>
                {glassPowers.map((item) => (
                  <TouchableOpacity
                    key={item.power}
                    style={[
                      styles.powerButton,
                      selectedPower === item.power &&
                        styles.powerButtonSelected,
                    ]}
                    onPress={() => handleSelectPower(item.power)}
                  >
                    <Ionicons
                      name={
                        selectedPower === item.power
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={20}
                      color={
                        selectedPower === item.power ? "#0891B2" : "#D1D5DB"
                      }
                    />
                    <Text
                      style={[
                        styles.powerButtonText,
                        selectedPower === item.power &&
                          styles.powerButtonTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {step === 2 && selectedPower && (
          <>
            <View style={styles.selectionCard}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.selectionText}>
                Power Selected: {selectedPower}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Frame Style</Text>
              <Text style={styles.sectionSubtitle}>
                Help client choose a comfortable frame
              </Text>
              <View style={styles.framesList}>
                {frames.map((frame) => (
                  <TouchableOpacity
                    key={frame.id}
                    style={[
                      styles.frameButton,
                      selectedFrame === frame.id &&
                        styles.frameButtonSelected,
                    ]}
                    onPress={() => setSelectedFrame(frame.id)}
                  >
                    <Ionicons
                      name={
                        selectedFrame === frame.id
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={20}
                      color={
                        selectedFrame === frame.id ? "#0891B2" : "#D1D5DB"
                      }
                    />
                    <Text
                      style={[
                        styles.frameButtonText,
                        selectedFrame === frame.id &&
                          styles.frameButtonTextSelected,
                      ]}
                    >
                      {frame.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Case Provided</Text>
              <TouchableOpacity
                style={styles.checkboxSection}
                onPress={() => setCaseProvided(!caseProvided)}
              >
                <View
                  style={[
                    styles.checkbox,
                    caseProvided && styles.checkboxChecked,
                  ]}
                >
                  {caseProvided && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  Glasses case has been provided
                </Text>
              </TouchableOpacity>
            </View>

            {selectedFrame && caseProvided && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => setStep(3)}
              >
                <Text style={styles.nextButtonText}>
                  Proceed to Education
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </>
        )}

        {step === 3 && selectedPower && selectedFrame && (
          <>
            <View style={styles.instructionCard}>
              <Ionicons name="school" size={24} color="#7C3AED" />
              <Text style={styles.instructionText}>
                Educate client on proper use and care of reading glasses
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education Checklist</Text>
              <Text style={styles.sectionSubtitle}>
                Mark as you provide each point:
              </Text>

              {educationPoints.map((point) => (
                <TouchableOpacity
                  key={point.id}
                  style={[
                    styles.educationCard,
                    educationProvided.has(point.id) &&
                      styles.educationCardEducated,
                  ]}
                  onPress={() => toggleEducation(point.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      educationProvided.has(point.id) &&
                        styles.checkboxEducated,
                    ]}
                  >
                    {educationProvided.has(point.id) && (
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eduTitle}>{point.title}</Text>
                    <Text style={styles.eduContent}>{point.content}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {allEducationProvided && (
              <View style={styles.completionCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={32}
                  color="#10B981"
                />
                <Text style={styles.completionText}>
                  All education provided. Ready to complete dispensing.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {step === 1 && selectedPower && (
        <View style={[styles.footer, { paddingBottom: 24 }]}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setStep(2)}
          >
            <Text style={styles.nextButtonText}>Proceed to Frame Selection</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && allEducationProvided && (
        <View style={[styles.footer, { paddingBottom: 24 }]}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>
              Complete Glasses Dispensing
            </Text>
            <Ionicons name="checkmark" size={20} color="#FFF" />
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  progressStep: {
    alignItems: "center",
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  progressCircleActive: {
    backgroundColor: "#0891B2",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  progressLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
    marginTop: 18,
  },
  instructionCard: {
    backgroundColor: "#F0F9FF",
    borderLeftWidth: 4,
    borderLeftColor: "#0891B2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: "#0C4A6E",
    flex: 1,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  fitProcess: {
    gap: 12,
  },
  fitStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  fitText: {
    fontSize: 13,
    color: "#4B5563",
    flex: 1,
    lineHeight: 18,
  },
  powersList: {
    gap: 10,
  },
  powerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  powerButtonSelected: {
    borderColor: "#0891B2",
    backgroundColor: "#F0F9FF",
  },
  powerButtonText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  powerButtonTextSelected: {
    color: "#0C4A6E",
    fontWeight: "600",
  },
  selectionCard: {
    backgroundColor: "#DCFCE7",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
  },
  framesList: {
    gap: 10,
  },
  frameButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  frameButtonSelected: {
    borderColor: "#0891B2",
    backgroundColor: "#F0F9FF",
  },
  frameButtonText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  frameButtonTextSelected: {
    color: "#0C4A6E",
    fontWeight: "600",
  },
  checkboxSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 12,
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
    backgroundColor: "#0891B2",
    borderColor: "#0891B2",
  },
  checkboxEducated: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  educationCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E5E7EB",
  },
  educationCardEducated: {
    borderLeftColor: "#7C3AED",
  },
  eduTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  eduContent: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
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
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  nextButton: {
    backgroundColor: "#0891B2",
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  completeButton: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  completeButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
