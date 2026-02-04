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
  VSLARegistrationStep1: undefined;
  VSLARegistrationStep3: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const VSLARegistrationStep2 = () => {
  const navigation = useNavigation<NavigationProp>();

  // Leadership Information State
  const [chairperson, setChairperson] = useState({
    name: "",
    phone: "",
    nationalId: "",
  });
  const [treasurer, setTreasurer] = useState({ name: "", phone: "" });
  const [secretary, setSecretary] = useState({ name: "", phone: "" });

  // Group Contact Information State
  const [primaryContact, setPrimaryContact] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [email, setEmail] = useState("");

  // Location Information State
  const [district, setDistrict] = useState("");
  const [county, setCounty] = useState("");
  const [subcounty, setSubcounty] = useState("");
  const [parish, setParish] = useState("");
  const [village, setVillage] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");

  const handlePrevious = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    navigation.navigate("VSLARegistrationStep3");
  };

  const renderPhoneInput = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
  ) => (
    <View style={styles.phoneInputContainer}>
      <View style={styles.countryCode}>
        <Text style={styles.countryCodeText}>+256</Text>
      </View>
      <TextInput
        style={[styles.input, styles.phoneInput]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType="phone-pad"
      />
    </View>
  );

  const renderPersonSection = (
    title: string,
    person: any,
    setPerson: any,
    showNationalId = false,
  ) => (
    <View style={styles.personSection}>
      <Text style={styles.personTitle}>{title}</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={person.name}
        onChangeText={(text) => setPerson({ ...person, name: text })}
      />
      {renderPhoneInput(
        person.phone,
        (text) => setPerson({ ...person, phone: text }),
        "700 123 456",
      )}
      {showNationalId && (
        <TextInput
          style={styles.input}
          placeholder="National ID (Optional)"
          value={person.nationalId}
          onChangeText={(text) => setPerson({ ...person, nationalId: text })}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>VSLA/SACCO Registration</Text>
          <Text style={styles.step}>Step 2 of 4</Text>
        </View>

        {/* Leadership Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leadership Information</Text>

          {renderPersonSection(
            "Chairperson *",
            chairperson,
            setChairperson,
            true,
          )}
          {renderPersonSection("Treasurer", treasurer, setTreasurer)}
          {renderPersonSection("Secretary", secretary, setSecretary)}
        </View>

        {/* Group Contact Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Contact Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Contact Number *</Text>
            {renderPhoneInput(primaryContact, setPrimaryContact, "700 123 456")}
            <Text style={styles.hintText}>
              This will be the group's login number
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alternate Phone (Optional)</Text>
            {renderPhoneInput(alternatePhone, setAlternatePhone, "700 123 456")}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="bombovsla@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Location Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>District *</Text>
            <View style={styles.selectContainer}>
              <Text style={styles.selectPlaceholder}>Select District</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>County/Municipality</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Luweero County"
              value={county}
              onChangeText={setCounty}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sub-county/Division</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Wobulenzi Sub-County"
              value={subcounty}
              onChangeText={setSubcounty}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parish/Ward</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Bombo Parish"
              value={parish}
              onChangeText={setParish}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Village/Cell</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Bombo Village"
              value={village}
              onChangeText={setVillage}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meeting Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Under the big tree near Health Center"
              value={meetingLocation}
              onChangeText={setMeetingLocation}
            />
          </View>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 8,
  },
  personSection: { marginBottom: 24 },
  personTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
    marginBottom: 12,
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  countryCode: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    minWidth: 70,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginBottom: 0,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFF",
  },
  selectPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  hintText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
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
  nextButton: {
    backgroundColor: "#FF9800",
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});

export default VSLARegistrationStep2;
