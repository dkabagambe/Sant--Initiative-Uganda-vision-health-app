import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Define navigation types
type RootStackParamList = {
  VSLARegistrationStep2: undefined;
  VSLARegistrationStep4: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Define types for ProgressBar props
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const VSLARegistrationStep3 = () => {
  const navigation = useNavigation<NavigationProp>();
  const [totalMembers, setTotalMembers] = useState("");
  const [femaleMembers, setFemaleMembers] = useState("");
  const [maleMembers, setMaleMembers] = useState("");
  const [meetingFrequency, setMeetingFrequency] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [benefits, setBenefits] = useState([
    {
      id: 1,
      title: "Free vision screening training for group leaders",
      checked: false,
    },
    {
      id: 2,
      title: "Digital tools for inventory & payment tracking",
      checked: false,
    },
  ]);

  const meetingFrequencies = [
    "Select frequency",
    "Weekly",
    "Bi-weekly (Every 2 weeks)",
    "Monthly",
    "Quarterly",
  ];

  const handlePrevious = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    navigation.navigate("VSLARegistrationStep4");
  };

  const toggleBenefit = (id: number) => {
    setBenefits(
      benefits.map((benefit) =>
        benefit.id === id ? { ...benefit, checked: !benefit.checked } : benefit,
      ),
    );
  };

  const handleSelectFrequency = (frequency: string) => {
    setMeetingFrequency(frequency === "Select frequency" ? "" : frequency);
    setIsDropdownVisible(false);
  };

  // Progress bar component with proper TypeScript typing
  const ProgressBar: React.FC<ProgressBarProps> = ({
    currentStep,
    totalSteps,
  }) => {
    return (
      <View style={styles.progressBarContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isActive = step <= currentStep;
          return (
            <React.Fragment key={step}>
              <View
                style={[styles.progressStep, isActive && styles.activeStep]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    isActive && styles.activeStepNumber,
                  ]}
                >
                  {step}
                </Text>
              </View>
              {step < totalSteps && (
                <View
                  style={[styles.progressLine, isActive && styles.activeLine]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const renderFrequencyItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSelectFrequency(item)}
    >
      <Text
        style={[
          styles.dropdownItemText,
          item === "Select frequency" && styles.dropdownPlaceholderText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with exact style */}
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>VSLA/SACCO Registration</Text>
            <Text style={styles.step}>Step 3 of 4</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressWrapper}>
          <ProgressBar currentStep={3} totalSteps={4} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership Information</Text>

          {/* Total Number of Members - Alone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Number of Members</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 25"
              value={totalMembers}
              onChangeText={setTotalMembers}
              keyboardType="numeric"
            />
          </View>

          {/* Female and Male Members in horizontal row */}
          <View style={styles.genderRow}>
            <View style={styles.genderInputGroup}>
              <Text style={styles.label}>Female Members</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 20"
                value={femaleMembers}
                onChangeText={setFemaleMembers}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.genderInputGroup}>
              <Text style={styles.label}>Male Members</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 5"
                value={maleMembers}
                onChangeText={setMaleMembers}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Meeting Frequency Dropdown with Arrow */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meeting Frequency</Text>
            <TouchableOpacity
              style={styles.selectContainer}
              onPress={() => setIsDropdownVisible(true)}
            >
              <View style={styles.selectInnerContainer}>
                <Text
                  style={
                    meetingFrequency
                      ? styles.selectedFrequency
                      : styles.selectPlaceholder
                  }
                >
                  {meetingFrequency || "Select frequency"}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, styles.benefitsSection]}>
          <Text style={styles.sectionTitle}>
            Partnership Benefits for VSLAs
          </Text>

          {benefits.map((benefit) => (
            <TouchableOpacity
              key={benefit.id}
              style={styles.benefitItem}
              onPress={() => toggleBenefit(benefit.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  !benefit.checked && styles.uncheckedBox,
                ]}
              >
                {benefit.checked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.benefitText}>{benefit.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.previousButton]}
            onPress={handlePrevious}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Meeting Frequency Dropdown Modal */}
      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <FlatList
              data={meetingFrequencies}
              renderItem={renderFrequencyItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // Exact header style as requested
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingTop: 70,
    width: "100%",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
  },
  step: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  // Progress Bar Styles
  progressWrapper: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  activeStep: {
    backgroundColor: "#FF9800",
    borderColor: "#FF9800",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  activeStepNumber: {
    color: "#FFF",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#DDD",
    marginHorizontal: 8,
  },
  activeLine: {
    backgroundColor: "#FF9800",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  genderInputGroup: {
    flex: 1,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFF",
  },
  selectInnerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectPlaceholder: {
    fontSize: 16,
    color: "#999",
    flex: 1,
  },
  selectedFrequency: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#4CAF50",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uncheckedBox: {
    backgroundColor: "#FFF",
  },
  checkmark: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  benefitText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  previousButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  nextButton: {
    backgroundColor: "#FF9800",
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  // Dropdown Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    width: "80%",
    maxHeight: 300,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownList: {
    borderRadius: 8,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownPlaceholderText: {
    color: "#999",
  },
});

export default VSLARegistrationStep3;
