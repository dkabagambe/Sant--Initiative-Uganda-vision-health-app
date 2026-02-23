import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";

type RootStackParamList = {
  OutletRegistrationStep1: undefined;
  OutletRegistrationStep2: { step1Data: any };
  [key: string]: any;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

  const [showBusinessTypeModal, setShowBusinessTypeModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  const businessTypes = [
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
    if (isFormValid()) {
      navigation.navigate("OutletRegistrationStep2", { step1Data: formData });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isFormValid = () => {
    return (
      formData.businessName.trim() !== "" &&
      formData.businessType.trim() !== "" &&
      formData.businessRegNumber.trim() !== "" &&
      formData.licenseNumber.trim() !== "" &&
      formData.tinNumber.trim() !== "" &&
      formData.yearEstablished.trim() !== "" &&
      formData.ownerFullName.trim() !== "" &&
      formData.ownerNationalId.trim() !== ""
    );
  };

  const selectBusinessType = (type: string) => {
    handleChange("businessType", type);
    setShowBusinessTypeModal(false);
  };

  const selectYear = (year: string) => {
    handleChange("yearEstablished", year);
    setShowYearModal(false);
  };

  const renderBusinessTypeItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        formData.businessType === item && styles.modalItemSelected,
      ]}
      onPress={() => selectBusinessType(item)}
    >
      <Text
        style={[
          styles.modalItemText,
          formData.businessType === item && styles.modalItemTextSelected,
        ]}
      >
        {item}
      </Text>
      {formData.businessType === item && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const renderYearItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        formData.yearEstablished === item && styles.modalItemSelected,
      ]}
      onPress={() => selectYear(item)}
    >
      <Text
        style={[
          styles.modalItemText,
          formData.yearEstablished === item && styles.modalItemTextSelected,
        ]}
      >
        {item}
      </Text>
      {formData.yearEstablished === item && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
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
          <Text style={styles.stepText}>Step 1 of 4</Text>
          <View style={styles.stepProgress}>
            <View style={styles.stepActive} />
            <View style={styles.stepInactive} />
            <View style={styles.stepInactive} />
            <View style={styles.stepInactive} />
          </View>
        </View>

        {/* Form Title */}
        <Text style={styles.sectionTitle}>Business Information</Text>
        <Text style={styles.subtitle}>Fill in your business details</Text>

        {/* Business Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          {/* Business Name */}
          <Text style={styles.label}>Business Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Nakato's Pharmacy"
            value={formData.businessName}
            onChangeText={(text) => handleChange("businessName", text)}
            placeholderTextColor="#999"
          />

          {/* Business Type */}
          <Text style={styles.label}>Business Type *</Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setShowBusinessTypeModal(true)}
          >
            <Text
              style={
                formData.businessType
                  ? styles.dropdownText
                  : styles.dropdownPlaceholder
              }
            >
              {formData.businessType || "Select business type"}
            </Text>
            <Ionicons
              name={showBusinessTypeModal ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {/* Business Registration Number */}
          <Text style={styles.label}>Business Registration Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 12345678"
            value={formData.businessRegNumber}
            onChangeText={(text) => handleChange("businessRegNumber", text)}
            placeholderTextColor="#999"
          />

          {/* License Number */}
          <Text style={styles.label}>License Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 12345678"
            value={formData.licenseNumber}
            onChangeText={(text) => handleChange("licenseNumber", text)}
            placeholderTextColor="#999"
          />

          {/* TIN Number */}
          <Text style={styles.label}>TIN Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1234567890"
            value={formData.tinNumber}
            onChangeText={(text) => handleChange("tinNumber", text)}
            placeholderTextColor="#999"
          />

          {/* Year Established */}
          <Text style={styles.label}>Year Established *</Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setShowYearModal(true)}
          >
            <Text
              style={
                formData.yearEstablished
                  ? styles.dropdownText
                  : styles.dropdownPlaceholder
              }
            >
              {formData.yearEstablished || "Select year"}
            </Text>
            <Ionicons
              name={showYearModal ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Owner Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner Information</Text>

          {/* Owner Full Name */}
          <Text style={styles.label}>Owner Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Grace Nakato"
            value={formData.ownerFullName}
            onChangeText={(text) => handleChange("ownerFullName", text)}
            placeholderTextColor="#999"
          />

          {/* Owner National ID */}
          <Text style={styles.label}>Owner National ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="CM12345678901234"
            value={formData.ownerNationalId}
            onChangeText={(text) => handleChange("ownerNationalId", text)}
            placeholderTextColor="#999"
            maxLength={16}
          />
          <Text style={styles.hintText}>Format: CM followed by 14 digits</Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isFormValid() && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!isFormValid()}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
            style={styles.nextIcon}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Business Type Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBusinessTypeModal}
        onRequestClose={() => setShowBusinessTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Business Type</Text>
              <TouchableOpacity
                onPress={() => setShowBusinessTypeModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={businessTypes}
              renderItem={renderBusinessTypeItem}
              keyExtractor={(item) => item}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Year Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showYearModal}
        onRequestClose={() => setShowYearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Year</Text>
              <TouchableOpacity
                onPress={() => setShowYearModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={years}
              renderItem={renderYearItem}
              keyExtractor={(item) => item}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 12 : 60,
    paddingBottom: 14,
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
  stepActive: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  stepInactive: {
    flex: 1,
    backgroundColor: "#E0E0E0",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 24,
  },
  section: {
    marginBottom: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 16,
    fontSize: 16,
    color: "#333333",
    marginBottom: 20,
  },
  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333333",
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#999999",
  },
  hintText: {
    color: "#666666",
    fontSize: 12,
    marginTop: -15,
    marginBottom: 20,
    fontStyle: "italic",
  },
  nextButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  nextIcon: {
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    paddingHorizontal: 20,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  modalItemSelected: {
    backgroundColor: "#F0F9F0",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333333",
  },
  modalItemTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
});

export default OutletRegistrationStep1;
