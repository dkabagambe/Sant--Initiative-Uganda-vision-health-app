import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";

type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string; role: string };
  Register: undefined;
  CHWRegistrationStep1: undefined;
  CHWRegistrationStep2: undefined;
  CHWRegistrationStep3: undefined;
  CHWRegistrationStep4: undefined;
  AppTabs: { role: string };
};

type CHWRegistrationStep4NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CHWRegistrationStep4"
>;

export default function CHWRegistrationStep4() {
  const navigation = useNavigation<CHWRegistrationStep4NavigationProp>();

  const [agreements, setAgreements] = useState({
    infoAccurate: false,
    dataProtection: false,
    serveIntegrity: false,
    confidentiality: false,
    approvalTime: false,
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePreviousPress = () => {
    navigation.navigate("CHWRegistrationStep3");
  };

  const handleSubmitPress = () => {
    // Navigate to appropriate screen after submission
    // For now, go back to login
    navigation.navigate("Login");
  };

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements({
      ...agreements,
      [key]: !agreements[key],
    });
  };

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

        {/* Form Title */}
        <Text style={styles.sectionTitle}>Required Documents</Text>

        {/* CHW Certificate */}
        <Text style={styles.documentLabel}>CHW Certificate (Optional)</Text>
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <Ionicons name="document-text-outline" size={24} color="#666" />
            <Text style={styles.documentTitle}>CHW training certificate</Text>
          </View>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.fileStatus}>No file chosen</Text>
        </View>

        {/* Recommendation Letter */}
        <Text style={[styles.documentLabel, styles.marginTop]}>
          Recommendation Letter (Optional)
        </Text>
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <Ionicons name="mail-outline" size={24} color="#666" />
            <Text style={styles.documentTitle}>From health facility or LC</Text>
          </View>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.fileStatus}>No file chosen</Text>
        </View>

        {/* Consent Section */}
        <View style={styles.consentSection}>
          <Text style={styles.consentTitle}>
            By submitting this registration:
          </Text>

          {/* Agreement Points */}
          <View style={styles.agreementRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleAgreement("infoAccurate")}
            >
              {agreements.infoAccurate && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              I confirm all information provided is accurate
            </Text>
          </View>

          <View style={styles.agreementRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleAgreement("dataProtection")}
            >
              {agreements.dataProtection && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              I agree to Santé's data protection policy
            </Text>
          </View>

          <View style={styles.agreementRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleAgreement("serveIntegrity")}
            >
              {agreements.serveIntegrity && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              I commit to serving my community with integrity
            </Text>
          </View>

          <View style={styles.agreementRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleAgreement("confidentiality")}
            >
              {agreements.confidentiality && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              I will maintain client confidentiality
            </Text>
          </View>

          <View style={styles.agreementRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleAgreement("approvalTime")}
            >
              {agreements.approvalTime && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              I understand approval may take 24-48 hours
            </Text>
          </View>
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
            style={styles.submitButton}
            onPress={handleSubmitPress}
          >
            <Text style={styles.submitButtonText}>Submit Registration</Text>
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
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 20,
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  marginTop: {
    marginTop: 24,
  },
  documentCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 12,
    fontWeight: "500",
  },
  uploadButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  uploadButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  fileStatus: {
    fontSize: 12,
    color: "#999999",
    marginTop: 8,
  },
  consentSection: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 20,
    marginTop: 30,
    marginBottom: 24,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 20,
  },
  agreementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#666666",
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerNote: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 32,
  },
});
