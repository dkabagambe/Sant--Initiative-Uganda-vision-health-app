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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";

type RootStackParamList = {
  OutletRegistrationStep2: { step1Data: any };
  OutletRegistrationStep3: { step1Data: any; step2Data: any };
  OutletRegistrationStep4: { step1Data: any; step2Data: any; step3Data: any };
  [key: string]: any;
};

type OutletRegistrationStep3NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "OutletRegistrationStep3"
>;

type OutletRegistrationStep3RouteProp = RouteProp<
  RootStackParamList,
  "OutletRegistrationStep3"
>;

interface FormData {
  operatingHours: string;
  currentlySellingGlasses: boolean;
}

const OutletRegistrationStep3 = () => {
  const navigation = useNavigation<OutletRegistrationStep3NavigationProp>();
  const route = useRoute<OutletRegistrationStep3RouteProp>();
  const { step1Data, step2Data } = route.params || {};

  const [formData, setFormData] = useState<FormData>({
    operatingHours: "",
    currentlySellingGlasses: false,
  });

  const [operatingHoursModalVisible, setOperatingHoursModalVisible] =
    useState(false);

  const operatingHoursOptions = [
    "Mon-Fri 8AM-6PM, Sat 9AM-4PM",
    "Mon-Sat 8AM-8PM, Sun 10AM-4PM",
    "Mon-Sun 7AM-9PM",
    "Mon-Fri 9AM-5PM",
    "24/7 Operation",
    "Custom hours",
  ];

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    navigation.navigate("OutletRegistrationStep4", {
      step1Data,
      step2Data,
      step3Data: formData,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const selectOperatingHours = (hours: string) => {
    handleChange("operatingHours", hours);
    setOperatingHoursModalVisible(false);
  };

  const renderOperatingHoursItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        formData.operatingHours === item && styles.modalItemSelected,
      ]}
      onPress={() => selectOperatingHours(item)}
    >
      <Text
        style={[
          styles.modalItemText,
          formData.operatingHours === item && styles.modalItemTextSelected,
        ]}
      >
        {item}
      </Text>
      {formData.operatingHours === item && (
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
          <Text style={styles.stepText}>Step 3 of 4</Text>
          <View style={styles.stepProgress}>
            <View style={styles.stepCompleted} />
            <View style={styles.stepCompleted} />
            <View style={styles.stepActive} />
            <View style={styles.stepInactive} />
          </View>
        </View>

        {/* Form Title */}
        <Text style={styles.sectionTitle}>Business Details</Text>
        <Text style={styles.subtitle}>
          Tell us more about your business operations
        </Text>

        {/* Business Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          {/* Operating Hours */}
          <Text style={styles.label}>Operating Hours</Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setOperatingHoursModalVisible(true)}
          >
            <Text
              style={
                formData.operatingHours
                  ? styles.dropdownText
                  : styles.dropdownPlaceholder
              }
            >
              {formData.operatingHours || "Select operating hours"}
            </Text>
            <Ionicons
              name={operatingHoursModalVisible ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {/* Currently Selling Reading Glasses? */}
          <Text style={styles.label}>Currently Selling Reading Glasses?</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioOption,
                formData.currentlySellingGlasses && styles.radioOptionSelected,
              ]}
              onPress={() => handleChange("currentlySellingGlasses", true)}
            >
              <View
                style={[
                  styles.radioCircle,
                  formData.currentlySellingGlasses &&
                    styles.radioCircleSelected,
                ]}
              >
                {formData.currentlySellingGlasses && (
                  <View style={styles.radioInnerCircle} />
                )}
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  formData.currentlySellingGlasses && styles.radioLabelSelected,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioOption,
                formData.currentlySellingGlasses === false &&
                  styles.radioOptionSelected,
              ]}
              onPress={() => handleChange("currentlySellingGlasses", false)}
            >
              <View
                style={[
                  styles.radioCircle,
                  formData.currentlySellingGlasses === false &&
                    styles.radioCircleSelected,
                ]}
              >
                {formData.currentlySellingGlasses === false && (
                  <View style={styles.radioInnerCircle} />
                )}
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  formData.currentlySellingGlasses === false &&
                    styles.radioLabelSelected,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Partnership Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partnership Benefits</Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>
                Quality reading glasses at wholesale prices
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>
                Training on vision screening basics
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>
                Marketing materials and branding support
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>
                Flexible stock replenishment
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>
                Digital inventory management tools
              </Text>
            </View>
          </View>

          <Text style={styles.partnershipNote}>
            By partnering with Santé, you'll receive exclusive benefits to help
            grow your business and support community eye health.
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.previousButton} onPress={handleBack}>
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
              style={styles.nextIcon}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Operating Hours Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={operatingHoursModalVisible}
        onRequestClose={() => setOperatingHoursModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Operating Hours</Text>
              <TouchableOpacity
                onPress={() => setOperatingHoursModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={operatingHoursOptions}
              renderItem={renderOperatingHoursItem}
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
  stepCompleted: {
    flex: 1,
    backgroundColor: colors.primary,
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
    marginBottom: 12,
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
  radioGroup: {
    flexDirection: "row",
    gap: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    backgroundColor: "#FFFFFF",
    minWidth: 120,
  },
  radioOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F0F9F0",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  radioLabelSelected: {
    color: colors.primary,
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: "#333333",
    lineHeight: 22,
  },
  partnershipNote: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    fontStyle: "italic",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
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
  nextButton: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginLeft: 12,
    flexDirection: "row",
    justifyContent: "center",
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

export default OutletRegistrationStep3;
