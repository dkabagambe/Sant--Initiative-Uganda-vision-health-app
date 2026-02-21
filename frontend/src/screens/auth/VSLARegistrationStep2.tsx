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
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Define navigation types
type RootStackParamList = {
  VSLARegistrationStep1: undefined;
  VSLARegistrationStep2: { step1Data: any };
  VSLARegistrationStep3: { step1Data: any; step2Data: any };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type VSLAStep2RouteProp = RouteProp<RootStackParamList, "VSLARegistrationStep2">;

// Progress Bar Component - Updated for Figma design
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
                  <Text style={progressStyles.stepCheckmark}>1</Text>
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

const VSLARegistrationStep2 = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VSLAStep2RouteProp>();
  const step1Data = route.params?.step1Data || {};

  // Leadership Information State
  const [chairperson, setChairperson] = useState({
    name: "",
    phone: "",
    nationalId: "",
  });
  const [treasurer, setTreasurer] = useState({ name: "", phone: "" });
  const [secretary, setSecretary] = useState({ name: "", phone: "" });

  // Group Contact Information State
  const [primaryContact, setPrimaryContact] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [email, setEmail] = useState("");

  // Location Information State
  const [district, setDistrict] = useState("");
  const [county, setCounty] = useState("");
  const [subcounty, setSubcounty] = useState("");
  const [parish, setParish] = useState("");
  const [village, setVillage] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");

  const handlePrevious = () => {
    navigation.goBack();
  };

  const validateForm = () => {
    // Validate required fields
    if (!chairperson.name || !chairperson.phone || !chairperson.nationalId) {
      Alert.alert("Missing Information", "Please fill in all Chairperson details");
      return false;
    }
    if (!primaryContact) {
      Alert.alert("Missing Information", "Primary contact phone number is required");
      return false;
    }
    if (!district) {
      Alert.alert("Missing Information", "District is required");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }

    const step2Data = {
      chairperson,
      treasurer,
      secretary,
      phoneNumber: primaryContact, // Use phoneNumber for consistency
      primaryContact,
      alternatePhone,
      email,
      district,
      county,
      subcounty,
      parish,
    };
    navigation.navigate("VSLARegistrationStep3", { step1Data, step2Data });
  };

  const renderPhoneInput = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
  ) => (
    <View style={styles.phoneInputContainer}>
      <View style={styles.countryCode}>
        <Text style={styles.countryCodeText}>+256</Text>
      </View>
      <TextInput
        style={[styles.input, styles.phoneInput]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType="phone-pad"
      />
    </View>
  );

  const renderPersonSection = (
    title: string,
    person: any,
    setPerson: any,
    showNationalId = false,
  ) => (
    <View style={styles.personSection}>
      <Text style={styles.personTitle}>{title}</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={person.name}
        onChangeText={(text) => setPerson({ ...person, name: text })}
      />
      {renderPhoneInput(
        person.phone,
        (text) => setPerson({ ...person, phone: text }),
        "700 123 456",
      )}
      {showNationalId && (
        <TextInput
          style={styles.input}
          placeholder="National ID (Optional)"
          value={person.nationalId}
          onChangeText={(text) => setPerson({ ...person, nationalId: text })}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Header with Back Arrow and Title */}
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handlePrevious} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>VSLA/SACCO Registration</Text>
            <Text style={styles.stepText}>Step 2 of 4</Text>
          </View>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Progress Bar - Placed immediately under the header */}
        <ProgressBar currentStep={2} totalSteps={4} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Leadership Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leadership Information</Text>

          {renderPersonSection(
            "Chairperson *",
            chairperson,
            setChairperson,
            true,
          )}
          {renderPersonSection("Treasurer", treasurer, setTreasurer)}
          {renderPersonSection("Secretary", secretary, setSecretary)}
        </View>

        {/* Group Contact Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Contact Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Contact Number *</Text>
            {renderPhoneInput(primaryContact, setPrimaryContact, "700 123 456")}
            <Text style={styles.hintText}>
              This will be the group's login number
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alternate Phone (Optional)</Text>
            {renderPhoneInput(alternatePhone, setAlternatePhone, "700 123 456")}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="bombovsla@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Location Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>District *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Luweero"
              value={district}
              onChangeText={setDistrict}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>County/Municipality</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Luweero County"
              value={county}
              onChangeText={setCounty}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sub-county/Division</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Wobulenzi Sub-County"
              value={subcounty}
              onChangeText={setSubcounty}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parish/Ward</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Bombo Parish"
              value={parish}
              onChangeText={setParish}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Village/Cell</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Bombo Village"
              value={village}
              onChangeText={setVillage}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meeting Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Under the big tree near Health Center"
              value={meetingLocation}
              onChangeText={setMeetingLocation}
            />
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Previous and Next Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.previousButton]}
            onPress={handlePrevious}
            activeOpacity={0.8}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Progress Bar Styles - Updated for better positioning and colors
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
    top: 13, // Center of circle (28/2 = 14)
    left: "-50%",
    right: "50%",
    zIndex: 1,
  },
  connectorLineActive: {
    backgroundColor: "#4CAF50", // Green line for completed connections
  },
});

// Main Component Styles
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 24,
  },
  personSection: {
    marginBottom: 24,
  },
  personTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 20,
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
    height: 40,
    marginBottom: 12,
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  countryCode: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    minWidth: 70,
    height: 40,
  },
  countryCodeText: {
    fontSize: 14,
    color: "#333333",
    textAlign: "center",
  },
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginBottom: 0,
    height: 40,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    height: 40,
    justifyContent: "center",
  },
  selectPlaceholder: {
    fontSize: 14,
    color: "#8E8E93",
  },
  hintText: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
    marginTop: 4,
    marginBottom: 8,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  previousButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  nextButton: {
    backgroundColor: "#FF9800",
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

export default VSLARegistrationStep2;
