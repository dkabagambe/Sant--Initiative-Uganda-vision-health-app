import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  OutletRegistrationStep4: { step1Data: any; step2Data: any; step3Data: any };
  OutletDashboard: undefined;
  [key: string]: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProps = {
  key: string;
  name: string;
  params: {
    step1Data: any;
    step2Data: any;
    step3Data: any;
  };
};

interface FormData {
  shopFrontPhoto: boolean;
  ownerIdPhoto: boolean;
  agreeToTerms: boolean;
}

const OutletRegistrationStep4 = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { step1Data, step2Data, step3Data } = route.params || {};

  const [formData, setFormData] = useState<FormData>({
    shopFrontPhoto: false,
    ownerIdPhoto: false,
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const togglePhoto = (type: "shopFront" | "ownerId") => {
    if (type === "shopFront") {
      setFormData((prev) => ({
        ...prev,
        shopFrontPhoto: !prev.shopFrontPhoto,
      }));
    } else {
      setFormData((prev) => ({ ...prev, ownerIdPhoto: !prev.ownerIdPhoto }));
    }
  };

  const toggleTerms = () => {
    setFormData((prev) => ({ ...prev, agreeToTerms: !prev.agreeToTerms }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Submitting outlet registration:", {
        step1Data,
        step2Data,
        step3Data,
        formData,
      });

      // Navigate to dashboard after successful submission
      navigation.navigate("OutletDashboard");
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
          <Text style={styles.stepCounter}>Step 4 of 4</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: "100%" }]} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Required Documents</Text>
        <Text style={styles.subtitle}>
          Upload required documents for verification
        </Text>

        {/* Shop Front Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Front Photo *</Text>

          <TouchableOpacity
            style={[
              styles.uploadArea,
              formData.shopFrontPhoto && styles.uploadAreaSelected,
            ]}
            onPress={() => togglePhoto("shopFront")}
          >
            {formData.shopFrontPhoto ? (
              <View style={styles.uploadedState}>
                <View style={styles.uploadIcon}>
                  <Text style={styles.uploadIconText}>✓</Text>
                </View>
                <Text style={styles.uploadText}>Photo Uploaded</Text>
                <Text style={styles.uploadHint}>Tap to change photo</Text>
              </View>
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <Text style={styles.uploadIconText}>+</Text>
                </View>
                <Text style={styles.uploadText}>
                  Clear photo showing shop exterior
                </Text>
                <Text style={styles.uploadHint}>Tap to upload photo</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.uploadDescription}>
            Upload a clear photo of your shop front showing the business name
            and location.
          </Text>
        </View>

        {/* Owner National ID Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner National ID Photo *</Text>

          <TouchableOpacity
            style={[
              styles.uploadArea,
              formData.ownerIdPhoto && styles.uploadAreaSelected,
            ]}
            onPress={() => togglePhoto("ownerId")}
          >
            {formData.ownerIdPhoto ? (
              <View style={styles.uploadedState}>
                <View style={styles.uploadIcon}>
                  <Text style={styles.uploadIconText}>✓</Text>
                </View>
                <Text style={styles.uploadText}>Photo Uploaded</Text>
                <Text style={styles.uploadHint}>Tap to change photo</Text>
              </View>
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <Text style={styles.uploadIconText}>+</Text>
                </View>
                <Text style={styles.uploadText}>Clear photo of owner's ID</Text>
                <Text style={styles.uploadHint}>Tap to upload photo</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.uploadDescription}>
            Upload a clear photo of your National ID card (front side).
          </Text>
        </View>

        {/* Agreement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            By submitting this registration:
          </Text>

          <View style={styles.agreementList}>
            <View style={styles.agreementItem}>
              <Text style={styles.agreementBullet}>•</Text>
              <Text style={styles.agreementText}>
                I confirm all information provided is accurate
              </Text>
            </View>

            <View style={styles.agreementItem}>
              <Text style={styles.agreementBullet}>•</Text>
              <Text style={styles.agreementText}>
                I agree to Santé's partnership terms & conditions
              </Text>
            </View>

            <View style={styles.agreementItem}>
              <Text style={styles.agreementBullet}>•</Text>
              <Text style={styles.agreementText}>
                I agree to sell products at recommended prices
              </Text>
            </View>

            <View style={styles.agreementItem}>
              <Text style={styles.agreementBullet}>•</Text>
              <Text style={styles.agreementText}>
                I will maintain product quality standards
              </Text>
            </View>

            <View style={styles.agreementItem}>
              <Text style={styles.agreementBullet}>•</Text>
              <Text style={styles.agreementText}>
                I understand approval may take 24-48 hours
              </Text>
            </View>

            <View style={styles.agreementItem}>
              <Text style={styles.agreementBullet}>•</Text>
              <Text style={styles.agreementText}>
                I will complete required training before selling
              </Text>
            </View>
          </View>

          <View style={styles.termsCheckbox}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                formData.agreeToTerms && styles.checkboxChecked,
              ]}
              onPress={toggleTerms}
            >
              {formData.agreeToTerms && (
                <Text style={styles.checkboxCheck}>✓</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I have read and agree to all terms and conditions above
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!formData.agreeToTerms || isSubmitting) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!formData.agreeToTerms || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Registration</Text>
          )}
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButtonFull} onPress={handleBack}>
            <Text style={styles.backButtonFullText}>Previous</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Your registration will be reviewed within 24-48 hours. You'll receive
          an email notification once approved.
        </Text>
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
  uploadArea: {
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D1D6",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    minHeight: 200,
  },
  uploadAreaSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8E9",
  },
  uploadedState: {
    alignItems: "center",
  },
  uploadIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadIconText: {
    fontSize: 32,
    color: "#666",
    fontWeight: "300",
  },
  uploadText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  uploadHint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  uploadDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  agreementList: {
    marginBottom: 20,
  },
  agreementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  agreementBullet: {
    fontSize: 16,
    color: "#4CAF50",
    marginRight: 12,
    marginTop: 2,
  },
  agreementText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  termsCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D1D6",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkboxCheck: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  termsText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#C8E6C9",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  backButtonFull: {
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
  footerNote: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 20,
  },
});

export default OutletRegistrationStep4;
