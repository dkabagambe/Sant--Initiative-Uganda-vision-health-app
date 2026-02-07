import React, { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  OutletRegistrationStep2: { step1Data: any };
  OutletRegistrationStep3: { step1Data: any; step2Data: any };
  [key: string]: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProps = {
  key: string;
  name: string;
  params: {
    step1Data: any;
  };
};

interface FormData {
  primaryPhoneNumber: string;
  alternatePhoneNumber: string;
  email: string;
  district: string;
  countyMunicipality: string;
  subcountyDivision: string;
  parishWard: string;
  villageCellStreet: string;
  physicalAddress: string;
  nearestLandmark: string;
}

const OutletRegistrationStep2 = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const step1Data = route.params?.step1Data;

  const [formData, setFormData] = useState<FormData>({
    primaryPhoneNumber: "",
    alternatePhoneNumber: "",
    email: "",
    district: "",
    countyMunicipality: "",
    subcountyDivision: "",
    parishWard: "",
    villageCellStreet: "",
    physicalAddress: "",
    nearestLandmark: "",
  });

  const [districts, setDistricts] = useState<string[]>(["Select District"]);

  // Mock districts data
  useEffect(() => {
    setDistricts([
      "Select District",
      "Kampala",
      "Wakiso",
      "Mukono",
      "Mpigi",
      "Jinja",
      "Iganga",
      "Mbale",
      "Soroti",
      "Gulu",
      "Lira",
      "Arua",
      "Kitgum",
      "Mbarara",
      "Kabale",
      "Fort Portal",
      "Hoima",
      "Masaka",
      "Kalangala",
      "Rakai",
      "Lyantonde",
    ]);
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    navigation.navigate("OutletRegistrationStep3", {
      step1Data: step1Data,
      step2Data: formData,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>Outlet Registration</Text>
          <Text style={styles.stepCounter}>Step 2 of 4</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: "50%" }]} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Contact Information</Text>
        <Text style={styles.subtitle}>
          Provide your contact and location details
        </Text>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          {/* Primary Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Phone Number *</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCodeText}>+256</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="700 123 456"
                value={formData.primaryPhoneNumber}
                onChangeText={(text) =>
                  handleChange("primaryPhoneNumber", text)
                }
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>
            <Text style={styles.hintText}>This will be your login number</Text>
          </View>

          {/* Alternate Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alternate Phone (Optional)</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCodeText}>+256</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="700 123 456"
                value={formData.alternatePhoneNumber}
                onChangeText={(text) =>
                  handleChange("alternatePhoneNumber", text)
                }
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="nakato.pharmacy@example.com"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Location Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Information</Text>

          {/* District */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>District *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.district}
                onValueChange={(value) => handleChange("district", value)}
                style={styles.picker}
              >
                {districts.map((district, index) => (
                  <Picker.Item key={index} label={district} value={district} />
                ))}
              </Picker>
            </View>
          </View>

          {/* County/Municipality */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>County/Municipality</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Kampala Central"
              value={formData.countyMunicipality}
              onChangeText={(text) => handleChange("countyMunicipality", text)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Sub-county/Division */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sub-county/Division</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Nakasero Division"
              value={formData.subcountyDivision}
              onChangeText={(text) => handleChange("subcountyDivision", text)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Parish/Ward */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parish/Ward</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Kololo Ward"
              value={formData.parishWard}
              onChangeText={(text) => handleChange("parishWard", text)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Village/Cell/Street */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Village/Cell/Street</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Acacia Avenue"
              value={formData.villageCellStreet}
              onChangeText={(text) => handleChange("villageCellStreet", text)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Physical Address/Building */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Physical Address/Building</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="e.g., Plot 12, Bombo Road"
              value={formData.physicalAddress}
              onChangeText={(text) => handleChange("physicalAddress", text)}
              placeholderTextColor="#999"
              multiline
            />
          </View>

          {/* Nearest Landmark */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nearest Landmark</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Near Luweero Town Council"
              value={formData.nearestLandmark}
              onChangeText={(text) => handleChange("nearestLandmark", text)}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButtonFull} onPress={handleBack}>
            <Text style={styles.backButtonFullText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
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
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D1D6",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  countryCodeContainer: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    borderRightWidth: 1,
    borderRightColor: "#D1D1D6",
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    fontSize: 16,
    color: "#1A1A1A",
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
    fontSize: 13,
    marginTop: 5,
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 15,
  },
  backButtonFull: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D1D6",
  },
  backButtonFullText: {
    color: "#333",
    fontSize: 17,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
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

export default OutletRegistrationStep2;
