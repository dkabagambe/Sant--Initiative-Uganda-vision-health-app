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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

type RootStackParamList = {
  OutletRegistrationStep3: { step1Data: any; step2Data: any };
  OutletRegistrationStep4: { step1Data: any; step2Data: any; step3Data: any };
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
  const { step1Data, step2Data, step3Data } = route.params || {};

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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePreviousPress = () => {
    navigation.navigate("OutletRegistrationStep3", {
      step1Data,
      step2Data,
    });
  };

  const pickImage = async (type: keyof typeof selectedFiles) => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload photos.",
          [{ text: "OK" }],
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size (5MB limit)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert(
            "File Too Large",
            "Please select an image smaller than 5MB",
            [{ text: "OK" }],
          );
          return;
        }

        const file: SelectedFile = {
          name: asset.fileName || `photo_${type}_${Date.now()}.jpg`,
          uri: asset.uri,
          type: asset.type || "image",
        };

        setSelectedFiles((prev) => ({
          ...prev,
          [type]: file,
        }));

        Alert.alert("Photo Selected", "Photo has been uploaded successfully", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.", [
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

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // Check file size (5MB limit)
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

      Alert.alert("File Selected", `${file.name} has been uploaded`, [
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
      Alert.alert(
        "Required Photos",
        "Please upload both Shop Front Photo and Owner National ID Photo",
        [{ text: "OK" }],
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for submission
      const formData = new FormData();

      // Add all previous steps data
      formData.append("step1Data", JSON.stringify(step1Data));
      formData.append("step2Data", JSON.stringify(step2Data));
      formData.append("step3Data", JSON.stringify(step3Data));
      formData.append("agreements", JSON.stringify(agreements));

      // Add files if they exist
      if (selectedFiles.shopFront) {
        const file = selectedFiles.shopFront;
        formData.append("shopFront", {
          uri: file.uri,
          type: file.type,
          name: file.name,
        } as any);
      }

      if (selectedFiles.ownerId) {
        const file = selectedFiles.ownerId;
        formData.append("ownerId", {
          uri: file.uri,
          type: file.type,
          name: file.name,
        } as any);
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success - navigate to home page
      Alert.alert(
        "🎉 Registration Submitted Successfully!",
        "Your outlet registration has been received. Our team will review your application within 24-48 hours. You'll receive an SMS notification once approved.",
        [
          {
            onPress: () => navigation.navigate("Login"),
          },
        ],
      );
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
        <Text style={styles.sectionTitle}>Required Documents</Text>

        {/* Shop Front Photo */}
        <Text style={styles.documentLabel}>Shop Front Photo *</Text>
        <Text style={styles.documentHint}>
          Clear photo showing shop exterior
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
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickImage("shopFront")}
              >
                <Ionicons
                  name="camera-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.uploadButtonText}>Choose File</Text>
              </TouchableOpacity>
              <Text style={styles.fileStatus}>No file chosen</Text>
            </>
          )}
        </View>

        {/* Owner National ID Photo */}
        <Text style={styles.documentLabel}>Owner National ID Photo *</Text>
        <Text style={styles.documentHint}>Clear photo of owner's ID</Text>
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
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickImage("ownerId")}
              >
                <Ionicons
                  name="camera-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.uploadButtonText}>Choose File</Text>
              </TouchableOpacity>
              <Text style={styles.fileStatus}>No file chosen</Text>
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
  documentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  documentHint: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 12,
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
