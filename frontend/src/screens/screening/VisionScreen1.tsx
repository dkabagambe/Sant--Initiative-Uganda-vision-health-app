import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

export default function VisionScreen1() {
  const navigation = useNavigation<any>();

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    phoneNumber: "",
    sex: "",
    district: "",
  });

  const districts = [
    "Select district",
    "Luweero",
    "Kampala",
    "Wakiso",
    "Mukono",
    "Masaka",
    "Mbarara",
    "Gulu",
    "Lira",
    "Mbale",
    "Jinja",
    "Others",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    // Basic validation
    if (
      !formData.fullName.trim() ||
      !formData.age.trim() ||
      !formData.sex ||
      formData.district === "Select district"
    ) {
      alert("Please fill in all required fields");
      return;
    }
    navigation.navigate("VisionScreen2");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A4D8F" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>VHT Eye Screening</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Info Section */}
        {/* <View style={styles.userSection}>
          <Text style={styles.organization}>Santé Initiative Uganda</Text>
          <Text style={styles.userName}>Jane Nambi</Text>
          <Text style={styles.userRole}>CHW - Luweero</Text>
        </View> */}

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>Step 1 of 6</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "16.67%" }]} />
          </View>
        </View>

        {/* Form Title */}
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Client Information</Text>
          <Text style={styles.formSubtitle}>
            Enter basic details to start VHT screening
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter client name"
              value={formData.fullName}
              onChangeText={(text) => handleInputChange("fullName", text)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Age (years) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter age"
              value={formData.age}
              onChangeText={(text) => handleInputChange("age", text)}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHint}>
              Age determines which tests to perform
            </Text>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 0700123456"
              value={formData.phoneNumber}
              onChangeText={(text) => handleInputChange("phoneNumber", text)}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          {/* Sex */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sex</Text>
            <View style={styles.sexButtons}>
              <TouchableOpacity
                style={[
                  styles.sexButton,
                  formData.sex === "male" && styles.sexButtonActive,
                ]}
                onPress={() => handleInputChange("sex", "male")}
              >
                <Text
                  style={[
                    styles.sexButtonText,
                    formData.sex === "male" && styles.sexButtonTextActive,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sexButton,
                  formData.sex === "female" && styles.sexButtonActive,
                ]}
                onPress={() => handleInputChange("sex", "female")}
              >
                <Text
                  style={[
                    styles.sexButtonText,
                    formData.sex === "female" && styles.sexButtonTextActive,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* District */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              District <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.district}
                onValueChange={(value) => handleInputChange("district", value)}
                style={styles.picker}
                dropdownIconColor="#1A4D8F"
              >
                {districts.map((district, index) => (
                  <Picker.Item
                    key={index}
                    label={district}
                    value={district}
                    color={index === 0 ? "#999" : "#000"}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>

        {/* Spacer for bottom tab bar */}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
  },
  headerLeft: { flex: 1 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1A1A1A" },
  headerRight: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 90 }, // 90px for tab bar
  userSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  organization: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  userRole: { fontSize: 16, color: "#666666" },
  progressSection: { marginBottom: 20 },
  progressText: {
    fontSize: 16,
    color: "#1A4D8F",
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#1A4D8F", borderRadius: 3 },
  formHeader: { marginBottom: 24 },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  formSubtitle: { fontSize: 16, color: "#666666" },
  formContainer: { marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, color: "#1A1A1A", fontWeight: "600", marginBottom: 8 },
  required: { color: "#EF4444" },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#1A1A1A",
  },
  inputHint: {
    fontSize: 14,
    color: "#666666",
    marginTop: 6,
    fontStyle: "italic",
  },
  sexButtons: { flexDirection: "row", gap: 12 },
  sexButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sexButtonActive: { backgroundColor: "#1A4D8F", borderColor: "#1A4D8F" },
  sexButtonText: { fontSize: 16, color: "#666666", fontWeight: "500" },
  sexButtonTextActive: { color: "#FFFFFF" },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { height: 50 },
  nextButton: {
    backgroundColor: "#1A4D8F",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  nextButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  spacer: { height: 20 },
});
