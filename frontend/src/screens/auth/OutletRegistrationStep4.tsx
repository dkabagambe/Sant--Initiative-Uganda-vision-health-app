import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { apiService } from "../../services/api";
import { normalizePhoneForApi } from "../../utils/phoneUtils";

type RootStackParamList = {
  OutletRegistrationStep3: { step1Data: any; step2Data: any };
  OutletRegistrationStep4: { formData: any; phone: string };
  AppTabs: { role: string };
  [key: string]: any;
};

type OutletRegistrationStep4NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "OutletRegistrationStep4"
>;

type OutletRegistrationStep4RouteProp = RouteProp<
  RootStackParamList,
  "OutletRegistrationStep4"
>;

interface SelectedFile {
  name: string;
  uri: string;
  type: string;
}

const OutletRegistrationStep4 = () => {
  const navigation = useNavigation<OutletRegistrationStep4NavigationProp>();
  const route = useRoute<OutletRegistrationStep4RouteProp>();
  const { formData: registrationData, phone } = route.params || {};
  const [agreements, setAgreements] = useState({
    infoAccurate: false,
    partnershipTerms: false,
    sellAtRecommendedPrices: false,
    maintainQualityStandards: false,
    approvalTime: false,
    completeTraining: false,
  });

  const [selectedFiles, setSelectedFiles] = useState<{
    shopFront: SelectedFile | null;
    ownerId: SelectedFile | null;
  }>({
    shopFront: null,
    ownerId: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePreviousPress = () => {
    navigation.goBack();
  };

  const pickImage = async (type: keyof typeof selectedFiles, useCamera: boolean) => {
    try {
      const libStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const camStatus = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : { status: "granted" as const };

      if (!useCamera && libStatus.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need gallery access to choose photos.",
          [{ text: "OK" }],
        );
        return;
      }
      if (useCamera && camStatus.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera access to take a clear photo.",
          [{ text: "OK" }],
        );
        return;
      }

      // Shop front: wide crop so more of the building is visible; ID: portrait for document
      const aspect = type === "shopFront" ? [3, 2] : [3, 4];

      const launchOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect,
        quality: 1,
        base64: false,
        presentationStyle: 'fullScreen',
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(launchOptions)
        : await ImagePicker.launchImageLibraryAsync(launchOptions);

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        if (asset.fileSize && asset.fileSize > 15 * 1024 * 1024) {
          Alert.alert(
            "File Too Large",
            "Please select an image smaller than 15MB for clear business photos",
            [{ text: "OK" }],
          );
          return;
        }

        const mimeType = asset.mimeType || "image/jpeg";
        const fileName = asset.fileName || `photo_${type}_${Date.now()}.jpg`;

        setSelectedFiles((prev) => ({
          ...prev,
          [type]: {
            name: fileName,
            uri: asset.uri,
            type: mimeType,
          },
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to capture image. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const pickDocument = async (type: keyof typeof selectedFiles) => {
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

      setSelectedFiles((prev) => ({
        ...prev,
        [type]: {
          name: file.name,
          uri: file.uri,
          type: file.mimeType || "application/pdf",
        },
      }));

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

  const removeFile = (type: keyof typeof selectedFiles) => {
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

  const handleSubmitPress = async () => {
    if (!isFormValid()) {
      Alert.alert(
        "Required Agreements",
        "Please check all agreement boxes to continue",
        [{ text: "OK" }],
      );
      return;
    }

    if (!selectedFiles.shopFront || !selectedFiles.ownerId) {
      Alert.alert("Documents Required", "Please upload both Shop Front photo and Owner National ID photo.");
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      let shopFrontUrl: string | null = null;
      let ownerIdUrl: string | null = null;

      if (selectedFiles.shopFront) {
        const uploadResult = await apiService.uploadOutletFile({
          uri: selectedFiles.shopFront.uri,
          name: selectedFiles.shopFront.name,
          type: selectedFiles.shopFront.type,
        });
        if (uploadResult.success && uploadResult.data?.url) {
          shopFrontUrl = uploadResult.data.url;
        } else {
          throw new Error("Failed to upload shop front photo");
        }
      }

      if (selectedFiles.ownerId) {
        const uploadResult = await apiService.uploadOutletFile({
          uri: selectedFiles.ownerId.uri,
          name: selectedFiles.ownerId.name,
          type: selectedFiles.ownerId.type,
        });
        if (uploadResult.success && uploadResult.data?.url) {
          ownerIdUrl = uploadResult.data.url;
        } else {
          throw new Error("Failed to upload owner ID photo");
        }
      }

      setIsUploading(false);

      const completeRegistrationData = {
        ...registrationData,
        role: "outlet",
        shopFrontImage: shopFrontUrl,
        ownerIdImage: ownerIdUrl,
        ownerFullName: registrationData?.ownerFullName,
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
          "Your outlet has been registered successfully. You can now login.",
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
        [{ text: "OK" }],
      );
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
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
    <SafeAreaView style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Outlet Registration</Text>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
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

        {/* Form Title */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Required Documents</Text>

        {/* Shop Front Photo */}
        <Text style={styles.documentLabel}>Shop Front Photo *</Text>
        <Text style={styles.documentHint}>
          Take or choose a photo showing the full shop front (signboard and entrance). You will then crop to a wide frame—include as much of the shop as possible so the crop area is clear.
        </Text>
        <View style={styles.documentCard}>
          {selectedFiles.shopFront ? (
            <View style={styles.photoPreviewContainer}>
              <Image
                source={{ uri: selectedFiles.shopFront.uri }}
                style={styles.photoPreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removeFile("shopFront")}
              >
                <Ionicons name="close-circle" size={28} color="#DC2626" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.uploadButton, { marginTop: 12 }]}
                onPress={() => pickImage("shopFront", false)}
              >
                <Text style={styles.uploadButtonText}>Replace photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.imageButtonRow}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => pickImage("shopFront", true)}
                >
                  <Ionicons name="camera" size={22} color={colors.primary} />
                  <Text style={styles.uploadButtonText}>Take photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadButton, styles.uploadButtonSecondary]}
                  onPress={() => pickImage("shopFront", false)}
                >
                  <Ionicons name="images-outline" size={22} color={colors.primary} />
                  <Text style={[styles.uploadButtonText, { color: colors.primary }]}>Gallery</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cropHint}>After selecting, crop to show the shop front clearly (wide frame).</Text>
            </>
          )}
        </View>

        {/* Owner National ID Photo */}
        <Text style={styles.documentLabel}>Owner National ID Photo *</Text>
        <Text style={styles.documentHint}>
          Take or choose a photo of the National ID card. You will then crop so the face, full name and ID number are clearly visible in the frame.
        </Text>
        <View style={styles.documentCard}>
          {selectedFiles.ownerId ? (
            <View style={styles.photoPreviewContainer}>
              <Image
                source={{ uri: selectedFiles.ownerId.uri }}
                style={styles.photoPreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removeFile("ownerId")}
              >
                <Ionicons name="close-circle" size={28} color="#DC2626" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.uploadButton, { marginTop: 12 }]}
                onPress={() => pickImage("ownerId", false)}
              >
                <Text style={styles.uploadButtonText}>Replace photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.imageButtonRow}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => pickImage("ownerId", true)}
                >
                  <Ionicons name="camera" size={22} color={colors.primary} />
                  <Text style={styles.uploadButtonText}>Take photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadButton, styles.uploadButtonSecondary]}
                  onPress={() => pickImage("ownerId", false)}
                >
                  <Ionicons name="images-outline" size={22} color={colors.primary} />
                  <Text style={[styles.uploadButtonText, { color: colors.primary }]}>Gallery</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cropHint}>After selecting, crop so the ID (face, name, number) is clear and readable.</Text>
            </>
          )}
        </View>

        {/* Consent Section */}
        <View style={styles.consentSection}>
          <Text style={styles.consentTitle}>
            By submitting this registration:
          </Text>

          {/* Agreement Points - EXACTLY matching Figma */}
          <View style={styles.agreementList}>
            <View style={styles.agreementItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.agreementText}>
                I confirm all information provided is accurate
              </Text>
            </View>

            <View style={styles.agreementItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.agreementText}>
                I agree to Santé's partnership terms & conditions
              </Text>
            </View>

            <View style={styles.agreementItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.agreementText}>
                I agree to sell products at recommended prices
              </Text>
            </View>

            <View style={styles.agreementItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.agreementText}>
                I will maintain product quality standards
              </Text>
            </View>

            <View style={styles.agreementItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.agreementText}>
                I understand approval may take 24-48 hours
              </Text>
            </View>

            <View style={styles.agreementItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.agreementText}>
                I will complete required training before selling
              </Text>
            </View>
          </View>

          {/* Checkboxes for each agreement point */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.agreementCheckboxRow}
              onPress={() => toggleAgreement("infoAccurate")}
            >
              <View style={styles.checkboxWrapper}>
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
              <Text style={styles.agreementCheckboxText}>
                I confirm all information provided is accurate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.agreementCheckboxRow}
              onPress={() => toggleAgreement("partnershipTerms")}
            >
              <View style={styles.checkboxWrapper}>
                <View
                  style={[
                    styles.checkbox,
                    agreements.partnershipTerms && styles.checkboxChecked,
                  ]}
                >
                  {agreements.partnershipTerms && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </View>
              <Text style={styles.agreementCheckboxText}>
                I agree to Santé's partnership terms & conditions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.agreementCheckboxRow}
              onPress={() => toggleAgreement("sellAtRecommendedPrices")}
            >
              <View style={styles.checkboxWrapper}>
                <View
                  style={[
                    styles.checkbox,
                    agreements.sellAtRecommendedPrices &&
                      styles.checkboxChecked,
                  ]}
                >
                  {agreements.sellAtRecommendedPrices && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </View>
              <Text style={styles.agreementCheckboxText}>
                I agree to sell products at recommended prices
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.agreementCheckboxRow}
              onPress={() => toggleAgreement("maintainQualityStandards")}
            >
              <View style={styles.checkboxWrapper}>
                <View
                  style={[
                    styles.checkbox,
                    agreements.maintainQualityStandards &&
                      styles.checkboxChecked,
                  ]}
                >
                  {agreements.maintainQualityStandards && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </View>
              <Text style={styles.agreementCheckboxText}>
                I will maintain product quality standards
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.agreementCheckboxRow}
              onPress={() => toggleAgreement("approvalTime")}
            >
              <View style={styles.checkboxWrapper}>
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
              <Text style={styles.agreementCheckboxText}>
                I understand approval may take 24-48 hours
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.agreementCheckboxRow}
              onPress={() => toggleAgreement("completeTraining")}
            >
              <View style={styles.checkboxWrapper}>
                <View
                  style={[
                    styles.checkbox,
                    agreements.completeTraining && styles.checkboxChecked,
                  ]}
                >
                  {agreements.completeTraining && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </View>
              <Text style={styles.agreementCheckboxText}>
                I will complete required training before selling
              </Text>
            </TouchableOpacity>
          </View>
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
              (!allAgreementsChecked || isSubmitting) &&
                styles.submitButtonDisabled,
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
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 12 : 60,
    paddingBottom: 14,
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
  contentContainer: {
    paddingBottom: 40,
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
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: -16,
    marginBottom: 12,
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  documentHint: {
    fontSize: 13,
    color: "#444",
    marginBottom: 12,
    lineHeight: 20,
  },
  imageButtonRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  uploadButtonSecondary: {
    backgroundColor: "#F0F4FF",
    borderColor: colors.primary,
  },
  cropHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 12,
    fontStyle: "italic",
  },
  documentCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  uploadButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  fileStatus: {
    fontSize: 12,
    color: "#999999",
    marginTop: 8,
  },
  photoPreviewContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 14,
    padding: 2,
  },
  consentSection: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 20,
  },
  agreementList: {
    marginBottom: 24,
    paddingLeft: 8,
  },
  agreementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: "#333333",
    marginRight: 12,
    marginTop: 2,
  },
  agreementText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
    flex: 1,
  },
  checkboxContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 20,
  },
  agreementCheckboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkboxWrapper: {
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
  agreementCheckboxText: {
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
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submitIcon: {
    marginRight: 8,
  },
});

export default OutletRegistrationStep4;
