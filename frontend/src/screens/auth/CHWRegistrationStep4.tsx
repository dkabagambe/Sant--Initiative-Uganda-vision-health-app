import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import * as DocumentPicker from "expo-document-picker";
import { apiService } from "../../services/api";

type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string; role: string; formData?: any };
  Register: undefined;
  CHWRegistrationStep1: undefined;
  CHWRegistrationStep2: undefined;
  CHWRegistrationStep3: undefined;
  CHWRegistrationStep4: { formData: any; phone: string; otp: string };
  AppTabs: { role: string };
};

type CHWRegistrationStep4NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CHWRegistrationStep4"
>;

type CHWRegistrationStep4RouteProp = RouteProp<RootStackParamList, "CHWRegistrationStep4">;

interface SelectedFile {
  name: string;
  uri: string;
  size: number;
  mimeType: string;
  uploadedUrl?: string; // Server URL after upload
}

export default function CHWRegistrationStep4() {
  const navigation = useNavigation<CHWRegistrationStep4NavigationProp>();
  const route = useRoute<CHWRegistrationStep4RouteProp>();
  const { formData: registrationData, phone, otp: devOtp } = route.params || {};

  const [otpInput, setOtpInput] = useState(devOtp || "");
  const [agreements, setAgreements] = useState({
    infoAccurate: false,
    dataProtection: false,
    serveIntegrity: false,
    confidentiality: false,
    approvalTime: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState<
    "certificate" | "recommendation" | null
  >(null);

  const [selectedFiles, setSelectedFiles] = useState<{
    certificate: SelectedFile | null;
    recommendation: SelectedFile | null;
  }>({
    certificate: null,
    recommendation: null,
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePreviousPress = () => {
    navigation.navigate("CHWRegistrationStep3");
  };

  const pickDocument = async (type: "certificate" | "recommendation") => {
    try {
      setIsUploading(type);

      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        console.log("User cancelled document picker");
        setIsUploading(null);
        return;
      }

      const file = result.assets[0];

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size && file.size > maxSize) {
        Alert.alert("File Too Large", "Please select a file smaller than 5MB", [
          { text: "OK" },
        ]);
        setIsUploading(null);
        return;
      }

      // Upload file to server
      try {
        const uploadResult = await apiService.uploadFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/pdf",
        });

        if (uploadResult.success) {
          setSelectedFiles((prev) => ({
            ...prev,
            [type]: {
              name: file.name,
              uri: file.uri,
              size: file.size || 0,
              mimeType: file.mimeType || "application/pdf",
              uploadedUrl: uploadResult.data.url, // Store server URL
            },
          }));

          Alert.alert("File Uploaded", `${file.name} has been uploaded successfully`, [
            { text: "OK" },
          ]);
        } else {
          throw new Error("Upload failed");
        }
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        Alert.alert("Upload Failed", "Failed to upload file to server. Please try again.", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsUploading(null);
    }
  };

  const handleRemoveFile = (type: "certificate" | "recommendation") => {
    Alert.alert("Remove File", "Are you sure you want to remove this file?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setSelectedFiles((prev) => ({
            ...prev,
            [type]: null,
          }));
        },
      },
    ]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string | undefined) => {
    if (!mimeType) return "document";

    if (mimeType.includes("pdf")) return "document-text";
    if (mimeType.includes("image")) return "image";
    return "document";
  };

  const handleSubmitPress = async () => {
    if (!isFormValid()) {
      Alert.alert(
        "Required Agreements",
        "Please check all agreement boxes to continue",
        [{ text: "OK" }],
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const completeRegistrationData = {
        ...registrationData,
        role: "health_worker",
        trainingCertificate: selectedFiles.certificate?.uploadedUrl || null,
        recommendationLetter: selectedFiles.recommendation?.uploadedUrl || null,
      };

      // OTP not required for registration — backend skips verification when registrationData is present
      const result = await apiService.verifyOTP(phone, otpInput || "000000", completeRegistrationData);

      if (result.success) {
        Alert.alert(
          "🎉 Registration Successful!",
          "Your account has been created successfully. You can now login.",
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
        [{ text: "OK" }],
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements({
      ...agreements,
      [key]: !agreements[key],
    });
  };

  const isFormValid = () => {
    return Object.values(agreements).every((value) => value === true);
  };

  const allAgreementsChecked = isFormValid();

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
          <Text style={styles.stepText}>Step 4 of 4</Text>
          <View style={styles.stepProgress}>
            <View style={styles.stepCompleted} />
            <View style={styles.stepCompleted} />
            <View style={styles.stepCompleted} />
            <View style={styles.stepActive} />
          </View>
        </View>

        {/* OTP Verification */}
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

        {/* Form Title */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Required Documents</Text>
        <Text style={styles.sectionSubtitle}>
          Upload supporting documents (both optional)
        </Text>

        {/* CHW Certificate */}
        <Text style={styles.documentLabel}>CHW Certificate (Optional)</Text>
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentIconContainer}>
              <Ionicons name="document-text-outline" size={24} color="#666" />
            </View>
            <View style={styles.documentTextContainer}>
              <Text style={styles.documentTitle}>CHW training certificate</Text>
              <Text style={styles.documentDescription}>
                PDF, JPG, or PNG up to 5MB
              </Text>
            </View>
          </View>

          {selectedFiles.certificate ? (
            <View style={styles.selectedFileContainer}>
              <View style={styles.fileInfo}>
                <Ionicons
                  name={getFileIcon(selectedFiles.certificate.mimeType)}
                  size={20}
                  color={colors.primary}
                />
                <View style={styles.fileDetails}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFiles.certificate.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(selectedFiles.certificate.size)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFile("certificate")}
              >
                <Ionicons name="close-circle" size={24} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.uploadButton,
                isUploading === "certificate" && styles.uploadButtonDisabled,
              ]}
              onPress={() => pickDocument("certificate")}
              disabled={isUploading === "certificate"}
            >
              {isUploading === "certificate" ? (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#666" />
                  <Text style={[styles.uploadButtonText, { color: "#666" }]}>
                    Selecting File...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.uploadButtonText}>Choose File</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Recommendation Letter */}
        <Text style={[styles.documentLabel, { marginTop: 20 }]}>
          Recommendation Letter (Optional)
        </Text>
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentIconContainer}>
              <Ionicons name="mail-outline" size={24} color="#666" />
            </View>
            <View style={styles.documentTextContainer}>
              <Text style={styles.documentTitle}>
                From health facility or LC
              </Text>
              <Text style={styles.documentDescription}>
                PDF, JPG, or PNG up to 5MB
              </Text>
            </View>
          </View>

          {selectedFiles.recommendation ? (
            <View style={styles.selectedFileContainer}>
              <View style={styles.fileInfo}>
                <Ionicons
                  name={getFileIcon(selectedFiles.recommendation.mimeType)}
                  size={20}
                  color={colors.primary}
                />
                <View style={styles.fileDetails}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFiles.recommendation.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(selectedFiles.recommendation.size)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFile("recommendation")}
              >
                <Ionicons name="close-circle" size={24} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.uploadButton,
                isUploading === "recommendation" && styles.uploadButtonDisabled,
              ]}
              onPress={() => pickDocument("recommendation")}
              disabled={isUploading === "recommendation"}
            >
              {isUploading === "recommendation" ? (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#666" />
                  <Text style={[styles.uploadButtonText, { color: "#666" }]}>
                    Selecting File...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.uploadButtonText}>Choose File</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Consent Section */}
        <View style={styles.consentSection}>
          <Text style={styles.consentTitle}>
            By submitting this registration:
          </Text>

          {/* Agreement Points */}
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
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </View>
            <Text style={styles.agreementText}>
              I confirm all information provided is accurate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => toggleAgreement("dataProtection")}
          >
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  agreements.dataProtection && styles.checkboxChecked,
                ]}
              >
                {agreements.dataProtection && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </View>
            <Text style={styles.agreementText}>
              I agree to Santé's data protection policy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => toggleAgreement("serveIntegrity")}
          >
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  agreements.serveIntegrity && styles.checkboxChecked,
                ]}
              >
                {agreements.serveIntegrity && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </View>
            <Text style={styles.agreementText}>
              I commit to serving my community with integrity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => toggleAgreement("confidentiality")}
          >
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  agreements.confidentiality && styles.checkboxChecked,
                ]}
              >
                {agreements.confidentiality && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </View>
            <Text style={styles.agreementText}>
              I will maintain client confidentiality
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
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </View>
            <Text style={styles.agreementText}>
              I understand approval may take 24-48 hours
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.previousButton}
            onPress={handlePreviousPress}
            disabled={isSubmitting}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !allAgreementsChecked && styles.submitButtonDisabled,
              isSubmitting && styles.submitButtonSubmitting,
            ]}
            onPress={handleSubmitPress}
            disabled={!allAgreementsChecked || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.submitIcon}
                />
                <Text style={styles.submitButtonText}>Submit Registration</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <Text style={styles.footerNote}>Santé Initiative Uganda © 2026</Text>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 24,
  },
  otpInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 8,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 24,
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  documentCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  documentIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  documentTextContainer: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 12,
    color: "#666666",
  },
  uploadButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  uploadButtonDisabled: {
    borderColor: "#CCCCCC",
  },
  uploadButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  selectedFileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  selectedFileName: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  fileSize: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  consentSection: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 24,
    marginTop: 30,
    marginBottom: 24,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 20,
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
    borderColor: "#666666",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  agreementText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
    flex: 1,
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
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginLeft: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  submitButtonSubmitting: {
    backgroundColor: "#999999",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submitIcon: {
    marginRight: 8,
  },
  footerNote: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 32,
  },
});
