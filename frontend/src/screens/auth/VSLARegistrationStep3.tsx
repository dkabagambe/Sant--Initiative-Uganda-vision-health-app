import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Define navigation types
type RootStackParamList = {
  VSLARegistrationStep2: undefined;
  VSLARegistrationStep4: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const VSLARegistrationStep3 = () => {
  const navigation = useNavigation<NavigationProp>();
  const [totalMembers, setTotalMembers] = useState("");
  const [femaleMembers, setFemaleMembers] = useState("");
  const [maleMembers, setMaleMembers] = useState("");
  const [meetingFrequency, setMeetingFrequency] = useState("");
  const [benefits, setBenefits] = useState([
    "Bulk purchase discounts on reading glasses",
    "Earn revenue from selling glasses to members & community",
    "Support hire-purchase arrangements for members",
    "Free vision screening training for group leaders",
    "Digital tools for inventory & payment tracking",
  ]);

  const handlePrevious = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    navigation.navigate("VSLARegistrationStep4");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>VSLA/SACCO Registration</Text>
          <Text style={styles.step}>Step 3 of 4</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership Information</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Number of Members</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 25"
                value={totalMembers}
                onChangeText={setTotalMembers}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Female Members</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 20"
                value={femaleMembers}
                onChangeText={setFemaleMembers}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Male Members</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 5"
                value={maleMembers}
                onChangeText={setMaleMembers}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meeting Frequency</Text>
            <View style={styles.selectContainer}>
              <Text style={styles.selectPlaceholder}>Select frequency</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.benefitsSection]}>
          <Text style={styles.sectionTitle}>
            Partnership Benefits for VSLAs
          </Text>

          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.checkbox}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
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
            style={[styles.button, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
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
  benefitsSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  inputRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  inputGroup: { flex: 1 },
  label: { fontSize: 16, fontWeight: "500", color: "#333", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFF",
  },
  selectPlaceholder: { fontSize: 16, color: "#999" },
  benefitItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  benefitText: { fontSize: 14, color: "#333", flex: 1 },
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
  nextButton: { backgroundColor: "#FF9800" },
  previousButtonText: { fontSize: 16, fontWeight: "600", color: "#666" },
  nextButtonText: { fontSize: 16, fontWeight: "600", color: "#FFF" },
});

export default VSLARegistrationStep3;
