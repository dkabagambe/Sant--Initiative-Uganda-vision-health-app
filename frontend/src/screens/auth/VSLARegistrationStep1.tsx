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
  // Add other screens if needed
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const VSLARegistrationStep1 = () => {
  const navigation = useNavigation<NavigationProp>();
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("");
  const [registrationStatus, setRegistrationStatus] =
    useState("Not Registered");
  const [yearFormed, setYearFormed] = useState("");

  const handleNext = () => {
    navigation.navigate("VSLARegistrationStep2");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>VSLA/SACCO Registration</Text>
          <Text style={styles.step}>Step 1 of 4</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Bombo Women's VSLA"
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Group Type</Text>
            <View style={styles.selectContainer}>
              <Text style={styles.selectPlaceholder}>Select group type</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registration Status</Text>
            <View style={styles.radioGroup}>
              {["Registered", "In Process", "Not Registered"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.radioButton,
                    registrationStatus === status && styles.radioButtonSelected,
                  ]}
                  onPress={() => setRegistrationStatus(status)}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      registrationStatus === status &&
                        styles.radioCircleSelected,
                    ]}
                  >
                    {registrationStatus === status && (
                      <View style={styles.radioInnerCircle} />
                    )}
                  </View>
                  <Text style={styles.radioText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year Group Formed</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2020"
              value={yearFormed}
              onChangeText={setYearFormed}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 24 },
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
  radioGroup: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  radioButtonSelected: { borderColor: "#FF9800", backgroundColor: "#FFF3E0" },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#999",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: { borderColor: "#FF9800" },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF9800",
  },
  radioText: { fontSize: 14, color: "#333" },
  nextButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonText: { fontSize: 16, fontWeight: "600", color: "#FFF" },
});

export default VSLARegistrationStep1;
