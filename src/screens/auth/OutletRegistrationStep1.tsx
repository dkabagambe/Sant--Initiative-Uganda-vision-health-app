import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  OutletRegistrationStep1: undefined;
  OutletRegistrationStep2: { step1Data: any };
  [key: string]: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface FormData {
  businessName: string;
  businessType: string;
  businessRegNumber: string;
  licenseNumber: string;
  tinNumber: string;
  yearEstablished: string;
  ownerFullName: string;
  ownerNationalId: string;
}

const OutletRegistrationStep1 = () => {
  const navigation = useNavigation<NavigationProp>();

  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    businessType: "",
    businessRegNumber: "",
    licenseNumber: "",
    tinNumber: "",
    yearEstablished: new Date().getFullYear().toString(),
    ownerFullName: "",
    ownerNationalId: "",
  });

  const businessTypes = [
    "Select business type",
    "Pharmacy",
    "Optical Shop",
    "General Store",
    "Supermarket",
    "Clinic",
    "Hospital",
    "Other Retail",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) =>
    (1980 + i).toString(),
  ).reverse();

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    navigation.navigate("OutletRegistrationStep2", { step1Data: formData });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>Outlet Registration</Text>
          <Text style={styles.stepCounter}>Step 1 of 4</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: "25%" }]} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Business Information</Text>
        <Text style={styles.subtitle}>Fill in your business details</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Nakato's Pharmacy"
              value={formData.businessName}
              onChangeText={(text) => handleChange("businessName", text)}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.businessType}
                onValueChange={(value) => handleChange("businessType", value)}
                style={styles.picker}
              >
                {businessTypes.map((type, index) => (
                  <Picker.Item key={index} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Registration Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 12345678"
              value={formData.businessRegNumber}
              onChangeText={(text) => handleChange("businessRegNumber", text)}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>License Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 12345678"
              value={formData.licenseNumber}
              onChangeText={(text) => handleChange("licenseNumber", text)}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TIN Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1234567890"
              value={formData.tinNumber}
              onChangeText={(text) => handleChange("tinNumber", text)}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year Established</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.yearEstablished}
                onValueChange={(value) =>
                  handleChange("yearEstablished", value)
                }
                style={styles.picker}
              >
                <Picker.Item label="Select year" value="" />
                {years.map((year) => (
                  <Picker.Item key={year} label={year} value={year} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Owner Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Grace Nakato"
              value={formData.ownerFullName}
              onChangeText={(text) => handleChange("ownerFullName", text)}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Owner National ID</Text>
            <TextInput
              style={styles.input}
              placeholder="CM12345678901234"
              value={formData.ownerNationalId}
              onChangeText={(text) => handleChange("ownerNationalId", text)}
              placeholderTextColor="#999"
            />
            <Text style={styles.hintText}>
              Format: CM followed by 14 digits
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  stepCounter: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#E0E0E0",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  section: {
    marginBottom: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D1D6",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    fontSize: 16,
    color: "#1A1A1A",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D1D6",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  picker: {
    height: Platform.OS === "ios" ? 140 : 50,
  },
  hintText: {
    color: "#666",
    fontSize: 12,
    marginTop: 5,
    fontStyle: "italic",
  },
  nextButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default OutletRegistrationStep1;
