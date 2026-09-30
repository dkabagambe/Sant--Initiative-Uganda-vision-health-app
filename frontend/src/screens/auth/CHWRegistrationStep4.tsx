import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import * as DocumentPicker from "expo-document-picker";
import { apiService } from "../../services/api";
import { normalizePhoneForApi } from "../../utils/phoneUtils";
import { KeyboardAwareFormLayout } from "../../components/KeyboardAwareFormLayout";
import { FormNavBar } from "../../components/FormNavBar";

type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string; role: string; formData?: any };
  Register: undefined;
  CHWRegistrationStep1: undefined;
  CHWRegistrationStep2: undefined;
  CHWRegistrationStep3: undefined;
  CHWRegistrationStep4: { formData: any; phone: string };
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
  uploadedUrl?: string;
}

export default function CHWRegistrationStep4() {
  const navigation = useNavigation<CHWRegistrationStep4NavigationProp>();
  const route = useRoute<CHWRegistrationStep4RouteProp>();
  const { formData: registrationData, phone } = route.params || {};

  const [agreements, setAgreements] = useState({
    infoAccurate: false,
    dataProtection: false,
    serveIntegrity: false,
    confidentiality: false,
    approvalTime: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState<"certificate" | "recommendation" | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<{
    certificate: SelectedFile | null;
    recommendation: SelectedFile | null;
  }>({ certificate: null, recommendation: null });

  const handleBackPress = () => navigation.goBack();
  const handlePreviousPress = () => navigation.navigate("CHWRegistrationStep3");

  const pickDocument = async (type: "certificate" | "recommendation") => {
    try {
      setIsUploading(type);

      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) { setIsUploading(null); return; }

      const file = result.assets[0];
      const maxSize = 15 * 1024 * 1024;
      if (file.size && file.size > maxSize) {
        Alert.alert("File Too Large", "Please select a file smaller than 15MB", [{ text: "OK" }]);
        setIsUploading(null);
        return;
      }

      try {
        const uploadResult = await apiService.uploadCHWFile({
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
              uploadedUrl: uploadResult.data.url,
            },
          }));
          Alert.alert("File Uploaded", `${file.name} has been uploaded successfully`, [{ text: "OK" }]);
        } else {
          throw new Error("Upload failed");
        }
      } catch {
        Alert.alert("Upload Failed", "Failed to upload file to server. Please try again.", [{ text: "OK" }]);
      }
    } catch {
      Alert.alert("Error", "Failed to pick document. Please try again.", [{ text: "OK" }]);
    } finally {
      setIsUploading(null);
    }
  };

  const handleRemoveFile = (type: "certificate" | "recommendation") => {
    Alert.alert("Remove File", "Are you sure you want to remove this file?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setSelectedFiles((prev) => ({ ...prev, [type]: null })) },
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
      Alert.alert("Required Agreements", "Please check all agreement boxes to continue", [{ text: "OK" }]);
      return;
    }

    setIsSubmitting(true);
    try {
      const completeRegistrationData = {
        ...registrationData,
        role: "health_worker",
        trainingCertificate: selectedFiles.certificate?.uploadedUrl || null,
        recommendationLetter: selectedFiles.recommendation?.uploadedUrl || null,
        village: registrationData?.village,
      };

      const normalizedPhone = normalizePhoneForApi(phone);
      if (!normalizedPhone) {
        Alert.alert("Error", "Invalid phone number");
        setIsSubmitting(false);
        return;
      }

      const result = await apiService.verifyOTP(normalizedPhone, "000000", completeRegistrationData);

      if (result.success) {
        Alert.alert(
          "🎉 Registration Successful!",
          "Your account has been created successfully. You can now login.",
          [{ text: "Go to Login", onPress: () => navigation.navigate("Login") }],
        );
      } else {
        Alert.alert("Registration Failed", result.error || "Please try again");
      }
    } catch {
      Alert.alert("Submission Failed", "There was an error submitting your registration. Please check your connection and try again.", [{ text: "OK" }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements({ ...agreements, [key]: !agreements[key] });
  };

  const isFormValid = () => Object.values(agreements).every((v) => v === true);
  const allAgreementsChecked = isFormValid();

  const DocumentCard = ({
    type,
    title,
    iconName,
  }: {
    type: "certificate" | "recommendation";
    title: string;
    iconName: string;
  }) => {
    const file = selectedFiles[type];
    return (
      <View style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <Ionicons name={iconName as any} size={24} color="#666" />
          </View>
          <View style={styles.documentTextContainer}>
            <Text style={styles.documentTitle}>{title}</Text>
            <Text style={styles.documentDescription}>PDF, JPG, or PNG up to 15MB</Text>
          </View>
        </View>
        {file ? (
          <View style={styles.selectedFileContainer}>
            <View style={styles.fileInfo}>
              <Ionicons name={getFileIcon(file.mimeType) as any} size={20} color={colors.primary} />
              <View style={styles.fileDetails}>
                <Text style={styles.selectedFileName} numberOfLines={1}>{file.name}</Text>
                <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveFile(type)}>
              <Ionicons name="close-circle" size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.uploadButton, isUploading === type && styles.uploadButtonDisabled]}
            onPress={() => pickDocument(type)}
            disabled={isUploading === type}
          >
            <Ionicons
              name={isUploading === type ? "cloud-upload" : "cloud-upload-outline"}
              size={20}
              color={isUploading === type ? "#666" : colors.primary}
            />
            <Text style={[styles.uploadButtonText, isUploading === type && { color: "#666" }]}>
              {isUploading === type ? "Uploading..." : "Choose File"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHW Registration</Text>
      </View>

      <KeyboardAwareFormLayout
        footer={
          <FormNavBar
            onNext={handleSubmitPress}
            onPrev={handlePreviousPress}
            nextLabel="Submit Registration"
            nextDisabled={!allAgreementsChecked || isSubmitting}
            nextLoading={isSubmitting}
            prevDisabled={isSubmitting}
          />
        }
      >
        <View style={styles.container}>
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

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Required Documents</Text>
          <Text style={styles.sectionSubtitle}>Upload supporting documents (both optional)</Text>

          <Text style={styles.documentLabel}>CHW Certificate (Optional)</Text>
          <DocumentCard type="certificate" title="CHW training certificate" iconName="document-text-outline" />

          <Text style={[styles.documentLabel, { marginTop: 20 }]}>Recommendation Letter (Optional)</Text>
          <DocumentCard type="recommendation" title="From health facility or LC" iconName="mail-outline" />

          {/* Consent Section */}
          <View style={styles.consentSection}>
            <Text style={styles.consentTitle}>By submitting this registration:</Text>

            {(
              [
                { key: "infoAccurate", label: "I confirm all information provided is accurate" },
                { key: "dataProtection", label: "I agree to Santé's data protection policy" },
                { key: "serveIntegrity", label: "I commit to serving my community with integrity" },
                { key: "confidentiality", label: "I will maintain client confidentiality" },
                { key: "approvalTime", label: "I understand approval may take 24-48 hours" },
              ] as { key: keyof typeof agreements; label: string }[]
            ).map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={styles.agreementRow}
                onPress={() => toggleAgreement(key)}
              >
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, agreements[key] && styles.checkboxChecked]}>
                    {agreements[key] && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                </View>
                <Text style={styles.agreementText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.footerNote}>Santé Initiative Uganda © 2026</Text>
        </View>
      </KeyboardAwareFormLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 12 : 60,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#000000" },
  container: { paddingHorizontal: 20, paddingTop: 20 },
  stepIndicator: { marginBottom: 24 },
  stepText: { fontSize: 14, color: "#666666", marginBottom: 8, fontWeight: "500" },
  stepProgress: {
    flexDirection: "row",
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  stepCompleted: { flex: 1, backgroundColor: colors.primary },
  stepActive: { flex: 1, backgroundColor: colors.primary },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: "#000000", marginBottom: 24 },
  sectionSubtitle: { fontSize: 14, color: "#666666", marginBottom: 24 },
  documentLabel: { fontSize: 14, fontWeight: "600", color: "#333333", marginBottom: 12 },
  documentCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 8,
  },
  documentHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 20 },
  documentIconContainer: { marginRight: 12, marginTop: 2 },
  documentTextContainer: { flex: 1 },
  documentTitle: { fontSize: 16, fontWeight: "600", color: "#333333", marginBottom: 4 },
  documentDescription: { fontSize: 12, color: "#666666" },
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
  },
  uploadButtonDisabled: { borderColor: "#CCCCCC" },
  uploadButtonText: { color: colors.primary, fontSize: 16, fontWeight: "600", marginLeft: 8 },
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
  fileInfo: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 },
  fileDetails: { marginLeft: 12, flex: 1 },
  selectedFileName: { fontSize: 14, color: "#333333", fontWeight: "500" },
  fileSize: { fontSize: 12, color: "#666666", marginTop: 2 },
  removeButton: { padding: 4 },
  consentSection: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 24,
    marginTop: 30,
    marginBottom: 24,
  },
  consentTitle: { fontSize: 18, fontWeight: "700", color: "#000000", marginBottom: 20 },
  agreementRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  checkboxContainer: { marginRight: 12, marginTop: 2 },
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
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  agreementText: { fontSize: 14, color: "#333333", lineHeight: 20, flex: 1 },
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
  previousButtonText: { color: colors.primary, fontSize: 16, fontWeight: "600" },
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
  submitButtonDisabled: { backgroundColor: "#CCCCCC" },
  submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  submitIcon: { marginRight: 8 },
  footerNote: { fontSize: 12, color: "#999999", textAlign: "center", marginTop: 30, marginBottom: 32 },
});
