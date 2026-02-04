import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  OutletRegistrationStep3: { step1Data: any; step2Data: any };
  OutletRegistrationStep4: { step1Data: any; step2Data: any; step3Data: any };
  [key: string]: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProps = {
  key: string;
  name: string;
  params: {
    step1Data: any;
    step2Data: any;
  };
};

interface FormData {
  operatingHours: string;
  currentlySellingGlasses: boolean;
}

const OutletRegistrationStep3 = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { step1Data, step2Data } = route.params || {};

  const [formData, setFormData] = useState<FormData>({
    operatingHours: "",
    currentlySellingGlasses: false,
  });

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    navigation.navigate("OutletRegistrationStep4", {
      step1Data,
      step2Data,
      step3Data: formData,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>Outlet Registration</Text>
          <Text style={styles.stepCounter}>Step 3 of 4</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: "75%" }]} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Business Details</Text>
        <Text style={styles.subtitle}>
          Tell us more about your business operations
        </Text>

        {/* Business Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          {/* Operating Hours */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Operating Hours</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Mon-Sat 8AM-6PM"
              value={formData.operatingHours}
              onChangeText={(text) => handleChange("operatingHours", text)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Currently Selling Reading Glasses? */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Currently Selling Reading Glasses?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  formData.currentlySellingGlasses &&
                    styles.radioOptionSelected,
                ]}
                onPress={() => handleChange("currentlySellingGlasses", true)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    formData.currentlySellingGlasses &&
                      styles.radioCircleSelected,
                  ]}
                >
                  {formData.currentlySellingGlasses && (
                    <View style={styles.radioInnerCircle} />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    formData.currentlySellingGlasses &&
                      styles.radioLabelSelected,
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioOption,
                  !formData.currentlySellingGlasses &&
                    styles.radioOptionSelected,
                ]}
                onPress={() => handleChange("currentlySellingGlasses", false)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    !formData.currentlySellingGlasses &&
                      styles.radioCircleSelected,
                  ]}
                >
                  {!formData.currentlySellingGlasses && (
                    <View style={styles.radioInnerCircle} />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    !formData.currentlySellingGlasses &&
                      styles.radioLabelSelected,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Partnership Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partnership Benefits</Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>✓</Text>
              </View>
              <Text style={styles.benefitText}>
                Quality reading glasses at wholesale prices
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>✓</Text>
              </View>
              <Text style={styles.benefitText}>
                Training on vision screening basics
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>✓</Text>
              </View>
              <Text style={styles.benefitText}>
                Marketing materials and branding support
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>✓</Text>
              </View>
              <Text style={styles.benefitText}>
                Flexible stock replenishment
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>✓</Text>
              </View>
              <Text style={styles.benefitText}>
                Digital inventory management tools
              </Text>
            </View>
          </View>

          <Text style={styles.partnershipNote}>
            By partnering with Santé, you'll receive exclusive benefits to help
            grow your business and support community eye health.
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButtonFull} onPress={handleBack}>
            <Text style={styles.backButtonFullText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  stepCounter: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#E0E0E0",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  section: {
    marginBottom: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D1D6",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    fontSize: 16,
    color: "#1A1A1A",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    backgroundColor: "#FFFFFF",
    minWidth: 120,
  },
  radioOptionSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8E9",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D1D6",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#4CAF50",
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  radioLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  radioLabelSelected: {
    color: "#4CAF50",
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  benefitIconText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  partnershipNote: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontStyle: "italic",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 15,
  },
  backButtonFull: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D1D6",
  },
  backButtonFullText: {
    color: "#333",
    fontSize: 17,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default OutletRegistrationStep3;
