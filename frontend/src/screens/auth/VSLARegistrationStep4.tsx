import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as DocumentPicker from "expo-document-picker";
import { apiService } from "../../services/api";
import { normalizePhoneForApi } from "../../utils/phoneUtils";

// Define navigation types
type RootStackParamList = {
  VSLARegistrationStep3: undefined;
  VSLARegistrationStep4: { formData: any; phone: string };
  AppTabs: { role: string };
  Login: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type VSLAStep4RouteProp = RouteProp<RootStackParamList, "VSLARegistrationStep4">;

// Define types for ProgressBar props
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

interface SelectedFile {
  name: string;
  uri: string;
  type: string;
}

interface Document {
  id: number;
  label: string;
  description: string;
  required: boolean;
  file: SelectedFile | null;
}

type DocumentPickerResult =
  | {
      type: "success" | "cancel";
      name?: string;
      uri?: string;
      size?: number;
      mimeType?: string;
    }
  | {
      type: "cancel";
    };

const VSLARegistrationStep4 = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VSLAStep4RouteProp>();
  const { formData: registrationData, phone } = route.params || {};
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      label: "Group Photo",
      description: "Photo of group members together",
      required: true,
      file: null,
    },
    {
      id: 2,
      label: "Registration Certificate (Optional)",
      description: "If group is officially registered",
      required: false,
      file: null,
    },
    {
      id: 3,
      label: "Group Constitution (Optional)",
      description: "Group rules and regulations",
      required: false,
      file: null,
    },
    {
      id: 4,
      label: "LC Recommendation Letter (Optional)",
      description: "From Local Council chairperson",
      required: false,
      file: null,
    },
  ]);

  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Agreement checkboxes state
  const [agreements, setAgreements] = useState({
    infoAccurate: false,
    partnershipTerms: false,
    memberRecords: false,
    financialManagement: false,
    approvalTime: false,
    leadershipTraining: false,
  });

  const handlePrevious = () => {
    navigation.goBack();
  };

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  
  const pickDocument = async (id: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const maxSize = 5 * 1024 * 1024;
      if (file.size && file.size > maxSize) {
        Alert.alert("File Too Large", "Please select a file smaller than 5MB", [
          { text: "OK" },
        ]);
        return;
      }

      updateDocumentFile(id, {
        name: file.name,
        uri: file.uri,
        type: file.mimeType || "application/pdf",
      });

      Alert.alert("File Selected", `${file.name} selected. It will be uploaded when you submit.`, [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick file. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const updateDocumentFile = (id: number, fileData: SelectedFile) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, file: fileData } : doc)),
    );
  };

  const removeFile = (id: number) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, file: null } : doc)),
    );
    clearError(id);
  };

  const clearError = (id: number) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors: { [key: number]: string } = {};
    let isValid = true;

    documents.forEach((doc) => {
      if (doc.required && !doc.file) {
        newErrors[doc.id] = `${doc.label} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Missing Documents", "Please upload all required documents");
      return;
    }

    // Check if all agreements are checked
    const allAgreementsChecked = Object.values(agreements).every(checked => checked);
    if (!allAgreementsChecked) {
      Alert.alert("Agreements Required", "Please check all agreement boxes to submit the registration");
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationDocuments: Record<string, string> = {};

      // Upload files one by one like Outlet
      for (const doc of documents) {
        if (doc.file) {
          const uploadResult = await apiService.uploadFile({
            uri: doc.file.uri,
            name: doc.file.name,
            type: doc.file.type,
          });
          
          if (uploadResult.success && uploadResult.data?.url) {
            registrationDocuments[`document_${doc.id}`] = uploadResult.data.url;
          } else {
            throw new Error(`Failed to upload ${doc.label}`);
          }
        }
      }
      
      console.log("Successfully uploaded all VSLA documents");

      const completeRegistrationData = {
        ...registrationData,
        role: "vsla",
        groupName: registrationData?.groupName,
        chairperson: registrationData?.chairperson,
        registrationDocuments,
        village: registrationData?.village,
      };

      const normalizedPhone = normalizePhoneForApi(phone);
      if (!normalizedPhone) {
        Alert.alert("Error", "Invalid phone number");
        setIsSubmitting(false);
        return;
      }

      // OTP not sent on registration; backend skips verification when registrationData present
      const result = await apiService.verifyOTP(normalizedPhone, "000000", completeRegistrationData);

      if (result.success) {
        Alert.alert(
          "🎉 Registration Successful!",
          "Your VSLA/SACCO has been registered successfully. You can now login.",
          [
            {
              text: "Go to Login",
              onPress: () => navigation.navigate("Login"),
            },
          ],
        );
      } else {
        Alert.alert("Registration Failed", result.error || "Please try again");
      }
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert(
        "Submission Failed",
        (error as Error)?.message || "There was an error submitting your registration. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress bar component
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

  const handleFilePick = (id: number) => {
    console.log(`handleFilePick called for document id: ${id}`);
    // Use the same document picker for all files including Group Photo
    console.log(`Using pickDocument for document id: ${id}`);
    pickDocument(id);
  };

  const getFileName = (uri: string, fallback: string) => {
    // Extract filename from URI or use fallback
    const parts = uri.split("/");
    return parts[parts.length - 1] || fallback;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with exact style */}
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>VSLA/SACCO Registration</Text>
            <Text style={styles.step}>Step 4 of 4</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressWrapper}>
          <ProgressBar currentStep={4} totalSteps={4} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>

          {documents.map((doc) => (
            <View key={doc.id} style={styles.documentItem}>
              <Text style={styles.documentLabel}>
                {doc.label}{" "}
                {doc.required && <Text style={styles.requiredStar}>*</Text>}
              </Text>
              <Text style={styles.documentDescription}>{doc.description}</Text>

              {doc.file ? (
                <View style={styles.filePreviewContainer}>
                  {doc.id === 1 && (
                    <View style={styles.imagePreviewContainer}>
                      <Image 
                        source={{ uri: doc.file.uri }} 
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.imageRemoveButton}
                        onPress={() => removeFile(doc.id)}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileIcon}>
                      {doc.id === 1 ? "🖼️" : "📄"}
                    </Text>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {getFileName(doc.file.uri, doc.file.name)}
                    </Text>
                    {doc.id !== 1 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFile(doc.id)}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.fileButton, styles.changeButton]}
                    onPress={() => handleFilePick(doc.id)}
                  >
                    <Text style={styles.fileButtonText}>Change File</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.fileRow}>
                  <TouchableOpacity
                    style={styles.fileButton}
                    onPress={() => handleFilePick(doc.id)}
                  >
                    <Text style={styles.fileButtonText}>Choose File</Text>
                  </TouchableOpacity>
                  <Text style={styles.noFileText}>No file chosen</Text>
                </View>
              )}

              {errors[doc.id] && (
                <Text style={styles.errorText}>{errors[doc.id]}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={[styles.section, styles.agreementSection]}>
          <Text style={styles.agreementTitle}>
            By submitting this registration:
          </Text>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => toggleAgreement("infoAccurate")}
          >
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  agreements.infoAccurate && styles.checkboxChecked,
                ]}
              >
                {agreements.infoAccurate && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </View>
            <Text style={styles.agreementText}>
              We confirm all information provided is accurate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => toggleAgreement("partnershipTerms")}
          >
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  agreements.partnershipTerms && styles.checkboxChecked,
                ]}
              >
                {agreements.partnershipTerms && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </View>
            <Text style={styles.agreementText}>
              We agree to Santé's partnership terms & conditions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => toggleAgreement("memberRecords")}
          >
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  agreements.memberRecords && styles.checkboxChecked,
                ]}
              >
                {agreements.memberRecords && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </View>
            <Text style={styles.agreementText}>
              We will maintain accurate member records
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => toggleAgreement("financialManagement")}
          >
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  agreements.financialManagement && styles.checkboxChecked,
                ]}
              >
                {agreements.financialManagement && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </View>
            <Text style={styles.agreementText}>
              We commit to transparent financial management
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => toggleAgreement("approvalTime")}
          >
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  agreements.approvalTime && styles.checkboxChecked,
                ]}
              >
                {agreements.approvalTime && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </View>
            <Text style={styles.agreementText}>
              We understand approval may take 24-48 hours
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => toggleAgreement("leadershipTraining")}
          >
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  agreements.leadershipTraining && styles.checkboxChecked,
                ]}
              >
                {agreements.leadershipTraining && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </View>
            <Text style={styles.agreementText}>
              Leadership will complete required training
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.previousButton]}
            onPress={handlePrevious}
            disabled={isSubmitting}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Uploading & Submitting..." : "Submit Registration"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
  },
  // Exact header style as requested
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 16 : 70,
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
  },
  agreementSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  documentItem: {
    marginBottom: 24,
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  requiredStar: {
    color: "#FF0000",
    fontSize: 16,
  },
  documentDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filePreviewContainer: {
    marginTop: 4,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fileIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "bold",
  },
  fileButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#FF9800",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changeButton: {
    alignSelf: "flex-start",
  },
  fileButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF9800",
  },
  noFileText: {
    fontSize: 14,
    color: "#999",
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
  },
  agreementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  agreementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bullet: {
    fontSize: 14,
    color: "#333",
    marginRight: 8,
    width: 16,
  },
  agreementText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  agreementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#DDD",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkmark: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
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
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  submitButtonDisabled: {
    backgroundColor: "#9E9E9E",
    opacity: 0.8,
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});

export default VSLARegistrationStep4;
