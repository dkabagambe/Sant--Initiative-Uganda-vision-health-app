import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";

type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string; role: string };
  Register: undefined;
  CHWRegistrationStep1: undefined;
  CHWRegistrationStep2: undefined;
  CHWRegistrationStep3: undefined;
  CHWRegistrationStep4: undefined;
  AppTabs: { role: string };
};

type CHWRegistrationStep2NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CHWRegistrationStep2"
>;

export default function CHWRegistrationStep2() {
  const navigation = useNavigation<CHWRegistrationStep2NavigationProp>();

  const [formData, setFormData] = useState({
    phoneNumber: "",
    alternatePhone: "",
    email: "",
    district: "",
    county: "",
    subCounty: "",
    parish: "",
    village: "",
  });

  // District dropdown state
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  // Sample districts in Uganda
  const districts = [
    "Kampala",
    "Wakiso",
    "Mukono",
    "Luweero",
    "Masaka",
    "Mbarara",
    "Gulu",
    "Lira",
    "Jinja",
    "Mbale",
    "Soroti",
    "Arua",
    "Fort Portal",
    "Hoima",
    "Kabale",
    "Mityana",
    "Mubende",
    "Ntungamo",
    "Rukungiri",
    "Tororo",
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePreviousPress = () => {
    navigation.navigate("CHWRegistrationStep1");
  };

  const handleNextPress = () => {
    if (isFormValid()) {
      navigation.navigate("CHWRegistrationStep3");
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const selectDistrict = (district: string) => {
    updateFormData("district", district);
    setDistrictModalVisible(false);
  };

  const isFormValid = () => {
    return (
      formData.phoneNumber.trim() !== "" && formData.district.trim() !== ""
    );
  };

  const renderDistrictItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.districtItem,
        formData.district === item && styles.districtItemSelected,
      ]}
      onPress={() => selectDistrict(item)}
    >
      <Text
        style={[
          styles.districtItemText,
          formData.district === item && styles.districtItemTextSelected,
        ]}
      >
        {item}
      </Text>
      {formData.district === item && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.screenContainer}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHW Registration</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 2 of 4</Text>
          <View style={styles.stepProgress}>
            <View style={styles.stepCompleted} />
            <View style={styles.stepActive} />
            <View style={styles.stepInactive} />
            <View style={styles.stepInactive} />
          </View>
        </View>

        {/* Form Title */}
        <Text style={styles.sectionTitle}>Contact Information</Text>

        {/* Phone Number */}
        <Text style={styles.label}>Phone Number *</Text>
        <View style={styles.phoneContainer}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+256</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="700 123 456"
            keyboardType="phone-pad"
            value={formData.phoneNumber}
            onChangeText={(text) => updateFormData("phoneNumber", text)}
          />
        </View>
        <Text style={styles.helperText}>This will be your login number</Text>

        {/* Alternate Phone */}
        <Text style={styles.label}>Alternate Phone (Optional)</Text>
        <View style={styles.phoneContainer}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+256</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="700 123 456"
            keyboardType="phone-pad"
            value={formData.alternatePhone}
            onChangeText={(text) => updateFormData("alternatePhone", text)}
          />
        </View>

        {/* Email */}
        <Text style={styles.label}>Email (Optional)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="jane.nambi@example.com"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => updateFormData("email", text)}
          />
        </View>

        {/* Location Information */}
        <Text style={[styles.sectionTitle, styles.locationTitle]}>
          Location Information
        </Text>

        {/* District Dropdown */}
        <Text style={styles.label}>District *</Text>
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={() => setDistrictModalVisible(true)}
        >
          <Text
            style={
              formData.district
                ? styles.dropdownText
                : styles.dropdownPlaceholder
            }
          >
            {formData.district || "Select District"}
          </Text>
          <Ionicons
            name={districtModalVisible ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {/* County/Municipality */}
        <Text style={styles.label}>County/Municipality</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Luweero County"
            value={formData.county}
            onChangeText={(text) => updateFormData("county", text)}
          />
        </View>

        {/* Sub-county/Division */}
        <Text style={styles.label}>Sub-county/Division</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Wobulenzi Sub-County"
            value={formData.subCounty}
            onChangeText={(text) => updateFormData("subCounty", text)}
          />
        </View>

        {/* Parish/Ward */}
        <Text style={styles.label}>Parish/Ward</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Bombo Parish"
            value={formData.parish}
            onChangeText={(text) => updateFormData("parish", text)}
          />
        </View>

        {/* Village/Cell */}
        <Text style={styles.label}>Village/Cell</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Bombo Village"
            value={formData.village}
            onChangeText={(text) => updateFormData("village", text)}
          />
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.previousButton}
            onPress={handlePreviousPress}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              !isFormValid() && styles.nextButtonDisabled,
            ]}
            onPress={handleNextPress}
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
        </View>

        {/* Footer Note */}
        <Text style={styles.footerNote}>Fields marked with * are required</Text>
      </ScrollView>

      {/* District Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={districtModalVisible}
        onRequestClose={() => setDistrictModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity
                onPress={() => setDistrictModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* District List */}
            <FlatList
              data={districts.sort()}
              renderItem={renderDistrictItem}
              keyExtractor={(item) => item}
              style={styles.districtList}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    marginBottom: 20,
  },
  locationTitle: {
    marginTop: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: "#EEEEEE",
    justifyContent: "center",
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333333",
  },
  phoneInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#333333",
  },
  helperText: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: "#333333",
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
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginLeft: 12,
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
  footerNote: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 32,
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
    maxHeight: "70%",
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
  districtList: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  districtItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  districtItemSelected: {
    backgroundColor: "#F0F9F0",
  },
  districtItemText: {
    fontSize: 16,
    color: "#333333",
  },
  districtItemTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
});
