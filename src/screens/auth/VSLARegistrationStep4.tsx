import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Define navigation types
type RootStackParamList = {
  VSLARegistrationStep3: undefined;
  Login: undefined; // Changed from AppTabs to Login
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const VSLARegistrationStep4 = () => {
  const navigation = useNavigation<NavigationProp>();

  const handlePrevious = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log("VSLA Registration Submitted");

    // Show success message
    Alert.alert(
      "Registration Submitted",
      "Your VSLA/SACCO registration has been submitted successfully. You will receive a confirmation within 24-48 hours.",
      [
        {
          text: "OK",
          onPress: () => {
            // Navigate back to the login/home screen
            navigation.navigate("Login");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>VSLA/SACCO Registration</Text>
          <Text style={styles.step}>Step 4 of 4</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>

          <View style={styles.documentItem}>
            <Text style={styles.documentLabel}>Group Photo *</Text>
            <Text style={styles.documentDescription}>
              Photo of group members together
            </Text>
            <TouchableOpacity style={styles.fileButton}>
              <Text style={styles.fileButtonText}>Choose File</Text>
            </TouchableOpacity>
            <Text style={styles.noFileText}>No file chosen</Text>
          </View>

          {[
            "Registration Certificate (Optional)",
            "Group Constitution (Optional)",
            "LC Recommendation Letter (Optional)",
          ].map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <Text style={styles.documentLabel}>{doc}</Text>
              <TouchableOpacity style={styles.fileButton}>
                <Text style={styles.fileButtonText}>Choose File</Text>
              </TouchableOpacity>
              <Text style={styles.noFileText}>No file chosen</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, styles.agreementSection]}>
          <Text style={styles.agreementTitle}>
            By submitting this registration:
          </Text>

          {[
            "We confirm all information provided is accurate",
            "We agree to Santé's partnership terms & conditions",
            "We will maintain accurate member records",
            "We commit to transparent financial management",
            "We understand approval may take 24-48 hours",
            "Leadership will complete required training",
          ].map((item, index) => (
            <View key={index} style={styles.agreementItem}>
              <View style={styles.bullet} />
              <Text style={styles.agreementText}>{item}</Text>
            </View>
          ))}
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
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 32 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
  },
  step: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 4 },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  agreementSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  documentItem: { marginBottom: 20 },
  documentLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  documentDescription: { fontSize: 14, color: "#666", marginBottom: 8 },
  fileButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  fileButtonText: { fontSize: 14, fontWeight: "600", color: "#FFF" },
  noFileText: { fontSize: 14, color: "#999", marginTop: 4 },
  agreementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  agreementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#333",
    marginTop: 6,
    marginRight: 8,
  },
  agreementText: { fontSize: 14, color: "#333", flex: 1 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
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
  submitButton: { backgroundColor: "#4CAF50" },
  previousButtonText: { fontSize: 16, fontWeight: "600", color: "#666" },
  submitButtonText: { fontSize: 16, fontWeight: "600", color: "#FFF" },
});

export default VSLARegistrationStep4;
