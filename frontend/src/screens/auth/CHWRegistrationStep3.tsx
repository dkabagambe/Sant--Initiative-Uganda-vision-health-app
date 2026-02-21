import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { apiService } from "../../services/api";

type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string; role: string; formData?: any };
  Register: undefined;
  CHWRegistrationStep1: undefined;
  CHWRegistrationStep2: { step1Data?: any };
  CHWRegistrationStep3: { step1Data?: any; step2Data?: any };
  CHWRegistrationStep4: { formData: any; phone: string; otp: string };
  AppTabs: { role: string };
};

type CHWRegistrationStep3NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CHWRegistrationStep3"
>;

type CHWRegistrationStep3RouteProp = RouteProp<
  RootStackParamList,
  "CHWRegistrationStep3"
>;

export default function CHWRegistrationStep3() {
  const navigation = useNavigation<CHWRegistrationStep3NavigationProp>();
  const route = useRoute<CHWRegistrationStep3RouteProp>();
  const step1Data = route.params?.step1Data || {};
  const step2Data = route.params?.step2Data || {};

  const [formData, setFormData] = useState({
    healthFacility: "",
    yearsExperience: "",
    languages: [] as string[],
  });

  // Dropdown state
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePreviousPress = () => {
    navigation.navigate("CHWRegistrationStep2");
  };

  const handleNextPress = async () => {
    if (!isFormValid()) return;

    // Combine all form data
    const completeFormData = {
      ...step1Data,
      ...step2Data,
      ...formData,
    };

    // Request OTP
    try {
      const phone = step2Data.phoneNumber || "";
      const result = await apiService.login(phone);
      
      if (result.success) {
        // Navigate to step 4 with all data and OTP info
        navigation.navigate("CHWRegistrationStep4", {
          formData: completeFormData,
          phone,
          otp: result.otp || "", // Dev mode shows OTP
        });
      } else {
        Alert.alert("Error", "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send OTP. Please check your connection.");
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const toggleLanguage = (language: string) => {
    const currentLanguages = [...formData.languages];
    if (currentLanguages.includes(language)) {
      // Remove language if already selected
      const index = currentLanguages.indexOf(language);
      currentLanguages.splice(index, 1);
    } else {
      // Add language if not selected
      currentLanguages.push(language);
    }
    setFormData({
      ...formData,
      languages: currentLanguages,
    });
  };

  const selectExperience = (experience: string) => {
    updateFormData("yearsExperience", experience);
    setExperienceModalVisible(false);
  };

  const isFormValid = () => {
    return formData.languages.length > 0; // At least one language required
  };

  const experienceOptions = [
    "Less than 1 year",
    "1-2 years",
    "3-5 years",
    "6-10 years",
    "More than 10 years",
  ];

  const languageOptions = [
    "English",
    "Luganda",
    "Runyankole",
    "Lusoga",
    "Acholi",
    "Luo",
    "Ateso",
  ];

  const renderExperienceItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.experienceItem,
        formData.yearsExperience === item && styles.experienceItemSelected,
      ]}
      onPress={() => selectExperience(item)}
    >
      <Text
        style={[
          styles.experienceItemText,
          formData.yearsExperience === item &&
            styles.experienceItemTextSelected,
        ]}
      >
        {item}
      </Text>
      {formData.yearsExperience === item && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.screenContainer}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHW Registration</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 3 of 4</Text>
          <View style={styles.stepProgress}>
            <View style={styles.stepCompleted} />
            <View style={styles.stepCompleted} />
            <View style={styles.stepActive} />
            <View style={styles.stepInactive} />
          </View>
        </View>

        {/* Form Title */}
        <Text style={styles.sectionTitle}>Professional Information</Text>

        {/* Associated Health Facility */}
        <Text style={styles.label}>Associated Health Facility</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Luweero Health Center IV"
            value={formData.healthFacility}
            onChangeText={(text) => updateFormData("healthFacility", text)}
          />
        </View>

        {/* Years of CHW Experience */}
        <Text style={styles.label}>Years of CHW Experience</Text>
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={() => setExperienceModalVisible(true)}
        >
          <Text
            style={
              formData.yearsExperience
                ? styles.dropdownText
                : styles.dropdownPlaceholder
            }
          >
            {formData.yearsExperience || "Select experience"}
          </Text>
          <Ionicons
            name={experienceModalVisible ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {/* Languages Spoken */}
        <Text style={styles.label}>
          Languages Spoken <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <Text style={styles.helperText}>
          Select all languages you can communicate in
        </Text>

        <View style={styles.languageContainer}>
          {languageOptions.map((language) => (
            <TouchableOpacity
              key={language}
              style={[
                styles.languageButton,
                formData.languages.includes(language) &&
                  styles.languageButtonSelected,
              ]}
              onPress={() => toggleLanguage(language)}
            >
              <Text
                style={[
                  styles.languageText,
                  formData.languages.includes(language) &&
                    styles.languageTextSelected,
                ]}
              >
                {language}
              </Text>
              {formData.languages.includes(language) && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={colors.primary}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.previousButton}
            onPress={handlePreviousPress}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              !isFormValid() && styles.nextButtonDisabled,
            ]}
            onPress={handleNextPress}
            disabled={!isFormValid()}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
              style={styles.nextIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <Text style={styles.footerNote}>Fields marked with * are required</Text>
      </ScrollView>

      {/* Experience Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={experienceModalVisible}
        onRequestClose={() => setExperienceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Experience</Text>
              <TouchableOpacity
                onPress={() => setExperienceModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Experience List */}
            <FlatList
              data={experienceOptions}
              renderItem={renderExperienceItem}
              keyExtractor={(item) => item}
              style={styles.experienceList}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepIndicator: {
    marginBottom: 24,
  },
  stepText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
    fontWeight: "500",
  },
  stepProgress: {
    flexDirection: "row",
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  stepCompleted: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  stepActive: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  stepInactive: {
    flex: 1,
    backgroundColor: "#E0E0E0",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: colors.primary,
  },
  helperText: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: "#333333",
  },
  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 30,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333333",
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#999999",
  },
  languageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  languageButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F0F9F0",
  },
  languageText: {
    fontSize: 14,
    color: "#666666",
  },
  languageTextSelected: {
    color: colors.primary,
    fontWeight: "500",
  },
  checkIcon: {
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  previousButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 12,
  },
  previousButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginLeft: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  nextIcon: {
    marginLeft: 8,
  },
  footerNote: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  modalCloseButton: {
    padding: 4,
  },
  experienceList: {
    paddingHorizontal: 20,
  },
  experienceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  experienceItemSelected: {
    backgroundColor: "#F0F9F0",
  },
  experienceItemText: {
    fontSize: 16,
    color: "#333333",
  },
  experienceItemTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
});
