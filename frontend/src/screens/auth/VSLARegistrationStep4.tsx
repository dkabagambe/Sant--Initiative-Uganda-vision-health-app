import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { apiService } from "../../services/api";

// Define navigation types
type RootStackParamList = {
  VSLARegistrationStep3: undefined;
  VSLARegistrationStep4: { formData: any; phone: string; otp: string };
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

interface DocumentFile {
  name: string;
  uri: string;
  size?: number;
  type: string;
}

interface Document {
  id: number;
  label: string;
  description: string;
  required: boolean;
  file: DocumentFile | null;
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
  const { formData: registrationData, phone, otp: devOtp } = route.params || {};

  const [otpInput, setOtpInput] = useState(devOtp || "");
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

  const handlePrevious = () => {
    navigation.goBack();
  };

  const pickImage = async (id: number) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photo library.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileData: DocumentFile = {
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          uri: asset.uri,
          type: asset.type || "image",
        };

        updateDocumentFile(id, fileData);
        clearError(id);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const pickDocument = async (id: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      console.log("Document picker result:", result);

      // Check if document was selected (not cancelled)
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileData: DocumentFile = {
          name: asset.name || `document_${Date.now()}`,
          uri: asset.uri || "",
          type: asset.mimeType || "document",
        };

        updateDocumentFile(id, fileData);
        clearError(id);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to select document");
    }
  };

  const updateDocumentFile = (id: number, fileData: DocumentFile) => {
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

    documents.forEach((doc) => {
      if (doc.required && !doc.file) {
        newErrors[doc.id] = `${doc.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (!otpInput || otpInput.length !== 6) {
      Alert.alert("OTP Required", "Please enter the 6-digit OTP sent to your phone");
      return;
    }

    // Validate required documents
    if (!validateForm()) {
      Alert.alert("Missing Documents", "Please upload all required documents");
      return;
    }

    try {
      // Collect document file names
      const documentFiles = documents.reduce((acc, doc) => {
        if (doc.file) {
          acc[`document_${doc.id}`] = doc.file.name;
        }
        return acc;
      }, {} as Record<string, string>);

      const completeRegistrationData = {
        ...registrationData,
        role: "vsla",
        ...documentFiles, // Include document file names
      };

      const result = await apiService.verifyOTP(phone, otpInput, completeRegistrationData);

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
        "There was an error submitting your registration. Please check your connection and try again.",
      );
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
    if (id === 1) {
      pickImage(id);
    } else {
      pickDocument(id);
    }
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

        {/* OTP Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verify Phone Number</Text>
          <Text style={styles.sectionSubtitle}>
            Enter the 6-digit code sent to {phone}
          </Text>
          <TextInput
            style={styles.otpInput}
            placeholder="Enter 6-digit OTP"
            value={otpInput}
            onChangeText={setOtpInput}
            keyboardType="number-pad"
            maxLength={6}
          />
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
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileIcon}>
                      {doc.id === 1 ? "🖼️" : "📄"}
                    </Text>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {getFileName(doc.file.uri, doc.file.name)}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFile(doc.id)}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
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

          <View style={styles.agreementItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.agreementText}>
              We confirm all information provided is accurate
            </Text>
          </View>
          <View style={styles.agreementItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.agreementText}>
              We agree to Santé's partnership terms & conditions
            </Text>
          </View>
          <View style={styles.agreementItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.agreementText}>
              We will maintain accurate member records
            </Text>
          </View>
          <View style={styles.agreementItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.agreementText}>
              We commit to transparent financial management
            </Text>
          </View>
          <View style={styles.agreementItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.agreementText}>
              We understand approval may take 24-48 hours
            </Text>
          </View>
          <View style={styles.agreementItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.agreementText}>
              Leadership will complete required training
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.previousButton]}
            onPress={handlePrevious}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Registration</Text>
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
  otpInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
  submitButton: {
    backgroundColor: "#4CAF50",
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
