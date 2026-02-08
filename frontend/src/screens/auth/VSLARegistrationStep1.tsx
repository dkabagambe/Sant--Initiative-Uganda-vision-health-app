import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Define navigation types
type RootStackParamList = {
  VSLARegistrationStep2: undefined;
  // Add other screens as needed
};

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  "VSLARegistrationStep2"
>;

// Progress Bar Component - Same as Step 2
const ProgressBar = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.stepsContainer}>
        {[...Array(totalSteps)].map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <View key={`step-${stepNumber}`} style={progressStyles.stepWrapper}>
              {/* Connecting Line */}
              {index > 0 && (
                <View
                  style={[
                    progressStyles.connectorLine,
                    isCompleted ? progressStyles.connectorLineActive : {},
                  ]}
                />
              )}
              {/* Step Circle */}
              <View
                style={[
                  progressStyles.stepCircle,
                  isCurrent && progressStyles.stepCircleActive,
                  isCompleted && progressStyles.stepCircleCompleted,
                ]}
              >
                {isCompleted ? (
                  <Text style={progressStyles.stepCheckmark}>✓</Text>
                ) : (
                  <Text
                    style={[
                      progressStyles.stepNumber,
                      isCurrent && progressStyles.stepNumberActive,
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Group type options
const GROUP_TYPES = [
  "VSLA (Village Savings & Loan Association)",
  "SACCO (Savings & Credit Cooperative)",
  "Women's Group",
  "Youth Group",
  "Farmers Group",
  "Other Community Group",
];

const VSLARegistrationStep1Screen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("");
  const [registrationStatus, setRegistrationStatus] =
    useState("Not Registered");
  const [yearFormed, setYearFormed] = useState("");

  // Dropdown state
  const [showDropdown, setShowDropdown] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({
    groupName: "",
    groupType: "",
    yearFormed: "",
  });

  // Validate form
  const validateForm = () => {
    const newErrors = {
      groupName: "",
      groupType: "",
      yearFormed: "",
    };
    let isValid = true;

    // Validate group name
    if (!groupName.trim()) {
      newErrors.groupName = "Group name is required";
      isValid = false;
    } else if (groupName.length < 3) {
      newErrors.groupName = "Group name must be at least 3 characters";
      isValid = false;
    }

    // Validate group type
    if (!groupType) {
      newErrors.groupType = "Please select a group type";
      isValid = false;
    }

    // Validate year formed
    if (!yearFormed.trim()) {
      newErrors.yearFormed = "Year formed is required";
      isValid = false;
    } else if (!/^\d{4}$/.test(yearFormed)) {
      newErrors.yearFormed = "Please enter a valid 4-digit year";
      isValid = false;
    } else {
      const year = parseInt(yearFormed);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        newErrors.yearFormed = `Year must be between 1900 and ${currentYear}`;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateForm()) {
      navigation.navigate("VSLARegistrationStep2");
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleYearFormedChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    setYearFormed(numericText);
    if (errors.yearFormed && numericText.length === 4) {
      setErrors({ ...errors, yearFormed: "" });
    }
  };

  const handleSelectGroupType = (type: string) => {
    setGroupType(type);
    setShowDropdown(false);
    if (errors.groupType) {
      setErrors({ ...errors, groupType: "" });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Header with Back Arrow and Title */}
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>VSLA/SACCO Registration</Text>
            <Text style={styles.stepText}>Step 1 of 4</Text>
          </View>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Progress Bar - Placed immediately under the header */}
        <ProgressBar currentStep={1} totalSteps={4} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Group Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Information</Text>

          {/* Group Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={[
                styles.input,
                errors.groupName && styles.inputError,
                !groupName && styles.placeholderInput,
              ]}
              placeholder="e.g., Bombo Women's VSLA"
              placeholderTextColor="#8E8E93"
              value={groupName}
              onChangeText={(text) => {
                setGroupName(text);
                if (errors.groupName) {
                  setErrors({ ...errors, groupName: "" });
                }
              }}
            />
            {errors.groupName ? (
              <Text style={styles.errorText}>{errors.groupName}</Text>
            ) : null}
          </View>

          {/* Group Type - DROPDOWN (like Figma) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Group Type</Text>

            {/* Dropdown Trigger */}
            <TouchableOpacity
              style={[
                styles.dropdownTrigger,
                errors.groupType && styles.inputError,
                showDropdown && styles.dropdownTriggerActive,
              ]}
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !groupType && styles.placeholderText,
                ]}
              >
                {groupType || "Select group type"}
              </Text>
              <Text
                style={[
                  styles.dropdownArrow,
                  showDropdown && styles.dropdownArrowActive,
                ]}
              >
                {showDropdown ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            {/* Dropdown Options Modal */}
            <Modal
              visible={showDropdown}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowDropdown(false)}
            >
              <TouchableOpacity
                style={styles.dropdownOverlay}
                activeOpacity={1}
                onPress={() => setShowDropdown(false)}
              >
                <View style={styles.dropdownOptionsContainer}>
                  <FlatList
                    data={GROUP_TYPES}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.dropdownOption,
                          groupType === item && styles.dropdownOptionSelected,
                        ]}
                        onPress={() => handleSelectGroupType(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.dropdownOptionContent}>
                          {/* Radio button indicator */}
                          <View style={styles.radioIndicator}>
                            <View
                              style={[
                                styles.radioOuter,
                                groupType === item && styles.radioOuterSelected,
                              ]}
                            >
                              {groupType === item && (
                                <View style={styles.radioInner} />
                              )}
                            </View>
                          </View>

                          <Text
                            style={[
                              styles.dropdownOptionText,
                              groupType === item &&
                                styles.dropdownOptionTextSelected,
                            ]}
                          >
                            {item}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />

                  {/* Done Button */}
                  <TouchableOpacity
                    style={styles.dropdownDoneButton}
                    onPress={() => setShowDropdown(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>

            {errors.groupType ? (
              <Text style={styles.errorText}>{errors.groupType}</Text>
            ) : null}
          </View>

          {/* Registration Status - Horizontal WITHOUT bullets */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registration Status</Text>
            <View style={styles.statusRow}>
              {["Registered", "In Process", "Not Registered"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOptionHorizontal,
                    registrationStatus === status &&
                      styles.statusOptionSelected,
                  ]}
                  onPress={() => setRegistrationStatus(status)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusText,
                      registrationStatus === status &&
                        styles.statusTextSelected,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Year Group Formed */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year Group Formed</Text>
            <TextInput
              style={[
                styles.input,
                errors.yearFormed && styles.inputError,
                !yearFormed && styles.placeholderInput,
              ]}
              placeholder="e.g., 2020"
              placeholderTextColor="#8E8E93"
              value={yearFormed}
              onChangeText={handleYearFormedChange}
              keyboardType="numeric"
              maxLength={4}
            />
            {errors.yearFormed ? (
              <Text style={styles.errorText}>{errors.yearFormed}</Text>
            ) : null}
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!groupName || !groupType || !yearFormed) &&
              styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={!groupName || !groupType || !yearFormed}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Progress Bar Styles - Same as Step 2
const progressStyles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 40,
    marginTop: 20,
    marginBottom: 20,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  stepWrapper: {
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  stepCircleActive: {
    backgroundColor: "#FF9800",
    borderColor: "#FF9800",
  },
  stepCircleCompleted: {
    backgroundColor: "#FF9800",
    borderColor: "#FF9800",
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#757575",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepCheckmark: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  connectorLine: {
    position: "absolute",
    height: 2,
    backgroundColor: "#E0E0E0",
    top: 13,
    left: "-50%",
    right: "50%",
    zIndex: 1,
  },
  connectorLineActive: {
    backgroundColor: "#4CAF50",
  },
});

// Main Component Styles - Updated header structure
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerContainer: {
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 32,
    paddingTop: 70,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 24,
    fontWeight: "300",
    color: "#333",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    fontWeight: "400",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    color: "#333333",
    height: 44,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  placeholderInput: {
    color: "#8E8E93",
  },

  // DROPDOWN STYLES (Like Figma)
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownTriggerActive: {
    borderColor: "#FF9800",
  },
  dropdownText: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  placeholderText: {
    color: "#8E8E93",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  dropdownArrowActive: {
    color: "#FF9800",
  },

  // Dropdown Options Modal
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  dropdownOptionsContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownOptionSelected: {
    backgroundColor: "#FFF9F0",
  },
  dropdownOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioIndicator: {
    marginRight: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#FF9800",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF9800",
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  dropdownOptionTextSelected: {
    color: "#FF9800",
    fontWeight: "500",
  },

  // Done Button in Dropdown
  dropdownDoneButton: {
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FF9800",
    borderRadius: 8,
    alignItems: "center",
  },
  dropdownDoneText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Registration Status Styles (Horizontal WITHOUT bullets)
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  statusOptionHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F9F9F9",
    flex: 1,
    marginHorizontal: 4,
    minHeight: 40,
    justifyContent: "center",
  },
  statusOptionSelected: {
    borderColor: "#FF9800",
    backgroundColor: "#FFF3E0",
  },
  statusText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "400",
  },
  statusTextSelected: {
    color: "#FF9800",
    fontWeight: "500",
  },

  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
    marginLeft: 4,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  nextButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#FFCC80",
    opacity: 0.7,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

export default VSLARegistrationStep1Screen;
