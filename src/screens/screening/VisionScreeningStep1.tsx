import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  VisionScreeningStep1: undefined;
  VisionScreeningStep2: undefined;
  CHWDashboard: undefined;
};

type ScreeningScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "VisionScreeningStep1"
>;

interface DropdownProps {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const Dropdown = ({
  label,
  value,
  placeholder,
  options,
  onSelect,
  disabled = false,
}: DropdownProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setShowModal(false);
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, disabled && styles.dropdownDisabled]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.modalOption}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={styles.modalOptionText}>{option.label}</Text>
                  {value === option.value && (
                    <Ionicons name="checkmark" size={20} color="#1E40AF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function VisionScreeningStep1() {
  const navigation = useNavigation<ScreeningScreenNavigationProp>();

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [parish, setParish] = useState("");
  const [village, setVillage] = useState("");

  const districts = [
    { label: "Luweero", value: "luweero" },
    { label: "Kampala", value: "kampala" },
    { label: "Wakiso", value: "wakiso" },
    { label: "Mukono", value: "mukono" },
    { label: "Masaka", value: "masaka" },
    { label: "Mbarara", value: "mbarara" },
    { label: "Gulu", value: "gulu" },
    { label: "Lira", value: "lira" },
    { label: "Mbale", value: "mbale" },
    { label: "Jinja", value: "jinja" },
  ];

  const counties = [
    { label: "Luweero County", value: "luweero_county" },
    { label: "Bamunanika County", value: "bamunanika" },
    { label: "Katikamu County", value: "katikamu" },
    { label: "Nakaseke County", value: "nakaseke" },
  ];

  const subCounties = [
    { label: "Luweero Town Council", value: "luweero_tc" },
    { label: "Bombo Town Council", value: "bombo_tc" },
    { label: "Kikyusa", value: "kikyusa" },
    { label: "Wobulenzi", value: "wobulenzi" },
  ];

  const parishes = [
    { label: "Central Ward", value: "central" },
    { label: "Kasana Ward", value: "kasana" },
    { label: "Kawempe Ward", value: "kawempe" },
    { label: "Nakasero Ward", value: "nakasero" },
  ];

  const villages = [
    { label: "Kasana Village", value: "kasana_village" },
    { label: "Kawempe Village", value: "kawempe_village" },
    { label: "Nakasero Village", value: "nakasero_village" },
    { label: "Bombo Village", value: "bombo_village" },
  ];

  const handleNext = () => {
    if (!fullName.trim() || !age.trim() || !phoneNumber.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    navigation.navigate("VisionScreeningStep2");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.organization}>Santé Initiative Uganda</Text>
                <Text style={styles.userName}>Jane Nambi</Text>
                <Text style={styles.userRole}>CHW - Luweero</Text>
              </View>
              <TouchableOpacity style={styles.menuButton}>
                <Ionicons name="menu" size={30} color="#1E40AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Screening Header */}
          <View style={styles.screeningHeader}>
            <Text style={styles.screeningTitle}>Vision Screening</Text>
            <View style={styles.stepIndicator}>
              <View style={styles.activeStep}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.inactiveStep}>
                <Text style={styles.inactiveStepNumber}>2</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.inactiveStep}>
                <Text style={styles.inactiveStepNumber}>3</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.inactiveStep}>
                <Text style={styles.inactiveStepNumber}>4</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.inactiveStep}>
                <Text style={styles.inactiveStepNumber}>5</Text>
              </View>
            </View>
            <Text style={styles.stepText}>Step 1 of 5</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Client Information</Text>
            <Text style={styles.formSubtitle}>
              Enter basic details to start screening
            </Text>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter client name"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Age */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 0700123456"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* District Dropdown */}
            <Dropdown
              label="District"
              value={district}
              placeholder="Select district"
              options={districts}
              onSelect={setDistrict}
            />

            {/* County/Sub-County Dropdown */}
            <Dropdown
              label="County/Sub-County"
              value={county}
              placeholder="Select county/sub-county"
              options={counties}
              onSelect={setCounty}
              disabled={!district}
            />

            {/* Sub-County/Parish Dropdown */}
            <Dropdown
              label="Sub-County/Parish"
              value={subCounty}
              placeholder="Select sub-county/parish"
              options={subCounties}
              onSelect={setSubCounty}
              disabled={!county}
            />

            {/* Parish/Ward Dropdown */}
            <Dropdown
              label="Parish/Ward"
              value={parish}
              placeholder="Select parish/ward"
              options={parishes}
              onSelect={setParish}
              disabled={!subCounty}
            />

            {/* Village Dropdown */}
            <Dropdown
              label="Village"
              value={village}
              placeholder="Select village"
              options={villages}
              onSelect={setVillage}
              disabled={!parish}
            />

            {/* Next Button */}
            <TouchableOpacity
              style={[
                styles.nextButton,
                (!fullName || !age || !phoneNumber) &&
                  styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!fullName || !age || !phoneNumber}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Spacer for bottom navigation */}
          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF8",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  organization: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 15,
    color: "#6B7280",
  },
  menuButton: {
    padding: 6,
    marginTop: -4,
  },
  screeningHeader: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  screeningTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  activeStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  inactiveStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveStepNumber: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  stepText: {
    textAlign: "center",
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#374151",
    backgroundColor: "#FFFFFF",
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  dropdownDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  dropdownText: {
    fontSize: 16,
    color: "#374151",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  nextButton: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 24,
  },
  nextButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginRight: 8,
  },
  spacer: {
    height: 40,
  },
});
