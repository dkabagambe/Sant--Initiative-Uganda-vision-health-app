import React, { useState, useMemo } from "react";
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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { getDistrictNames, getCountiesForDistrict, getSubCountiesForCounty, getParishesForSubCounty } from "../../data/ugandaLocations";

type RootStackParamList = {
  OutletRegistrationStep1: undefined;
  OutletRegistrationStep2: { step1Data: any };
  OutletRegistrationStep3: { step1Data: any; step2Data: any };
  [key: string]: any;
};

type OutletRegistrationStep2NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "OutletRegistrationStep2"
>;

type OutletRegistrationStep2RouteProp = RouteProp<
  RootStackParamList,
  "OutletRegistrationStep2"
>;

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
  const navigation = useNavigation<OutletRegistrationStep2NavigationProp>();
  const route = useRoute<OutletRegistrationStep2RouteProp>();
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

  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [countyModalVisible, setCountyModalVisible] = useState(false);
  const [subCountyModalVisible, setSubCountyModalVisible] = useState(false);
  const [parishModalVisible, setParishModalVisible] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");
  const [countySearch, setCountySearch] = useState("");
  const [subCountySearch, setSubCountySearch] = useState("");
  const [parishSearch, setParishSearch] = useState("");

  const allDistricts = useMemo(() => getDistrictNames(), []);
  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return allDistricts;
    return allDistricts.filter((d) => d.toLowerCase().includes(districtSearch.toLowerCase()));
  }, [districtSearch, allDistricts]);

  const countiesForDistrict = useMemo(
    () => (formData.district ? getCountiesForDistrict(formData.district) : []),
    [formData.district]
  );
  const filteredCounties = useMemo(() => {
    if (!countySearch.trim()) return countiesForDistrict;
    return countiesForDistrict.filter((c) => c.toLowerCase().includes(countySearch.toLowerCase()));
  }, [countySearch, countiesForDistrict]);

  const subCountiesForCounty = useMemo(
    () => (formData.countyMunicipality ? getSubCountiesForCounty(formData.countyMunicipality) : []),
    [formData.countyMunicipality]
  );
  const filteredSubCounties = useMemo(() => {
    if (!subCountySearch.trim()) return subCountiesForCounty;
    return subCountiesForCounty.filter((sc) => sc.toLowerCase().includes(subCountySearch.toLowerCase()));
  }, [subCountySearch, subCountiesForCounty]);

  const parishesForSubCounty = useMemo(
    () => (formData.subcountyDivision ? getParishesForSubCounty(formData.subcountyDivision) : []),
    [formData.subcountyDivision]
  );
  const filteredParishes = useMemo(() => {
    if (!parishSearch.trim()) return parishesForSubCounty;
    return parishesForSubCounty.filter((p) => p.toLowerCase().includes(parishSearch.toLowerCase()));
  }, [parishSearch, parishesForSubCounty]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "district" && value !== prev.district ? { countyMunicipality: "", subcountyDivision: "", parishWard: "" } : {}),
      ...(field === "countyMunicipality" && value !== prev.countyMunicipality ? { subcountyDivision: "", parishWard: "" } : {}),
      ...(field === "subcountyDivision" && value !== prev.subcountyDivision ? { parishWard: "" } : {}),
    }));
  };

  const handleNext = () => {
    if (isFormValid()) {
      navigation.navigate("OutletRegistrationStep3", {
        step1Data: step1Data,
        step2Data: formData,
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isFormValid = () => {
    return (
      formData.primaryPhoneNumber.trim() !== "" &&
      formData.district.trim() !== ""
    );
  };

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
        <Text style={styles.subtitle}>
          Provide your contact and location details
        </Text>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          {/* Primary Phone Number */}
          <Text style={styles.label}>Primary Phone Number *</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryCodeText}>+256</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="700 123 456"
              value={formData.primaryPhoneNumber}
              onChangeText={(text) => handleChange("primaryPhoneNumber", text)}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>
          <Text style={styles.hintText}>This will be your login number</Text>

          {/* Alternate Phone Number */}
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

          {/* Email */}
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

        {/* Location Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Information</Text>

          {/* District */}
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

          {/* County/Municipality Dropdown */}
          <Text style={styles.label}>County/Municipality</Text>
          <TouchableOpacity
            style={[styles.dropdownContainer, !formData.district && { backgroundColor: "#F3F4F6" }]}
            onPress={() => {
              if (!formData.district) return;
              setCountySearch("");
              setCountyModalVisible(true);
            }}
          >
            <Text style={formData.countyMunicipality ? styles.dropdownText : styles.dropdownPlaceholder}>
              {formData.countyMunicipality || (formData.district ? "Select County" : "Select district first")}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Sub-county/Division */}
          <Text style={styles.label}>Sub-county/Division</Text>
          <TouchableOpacity
            style={[styles.dropdownContainer, !formData.countyMunicipality && { backgroundColor: "#F3F4F6" }]}
            onPress={() => {
              if (!formData.countyMunicipality) return;
              setSubCountySearch("");
              setSubCountyModalVisible(true);
            }}
          >
            <Text style={formData.subcountyDivision ? styles.dropdownText : styles.dropdownPlaceholder}>
              {formData.subcountyDivision || (formData.countyMunicipality ? "Select Sub-county" : "Select county first")}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Parish/Ward */}
          <Text style={styles.label}>Parish/Ward</Text>
          {formData.subcountyDivision && parishesForSubCounty.length === 0 ? (
            <TextInput
              style={styles.input}
              placeholder="Type parish name"
              value={formData.parishWard}
              onChangeText={(text) => handleChange("parishWard", text)}
              placeholderTextColor="#999"
            />
          ) : (
            <TouchableOpacity
              style={[styles.dropdownContainer, !formData.subcountyDivision && { backgroundColor: "#F3F4F6" }]}
              onPress={() => {
                if (!formData.subcountyDivision) return;
                setParishSearch("");
                setParishModalVisible(true);
              }}
            >
              <Text style={formData.parishWard ? styles.dropdownText : styles.dropdownPlaceholder}>
                {formData.parishWard || (formData.subcountyDivision ? "Select Parish" : "Select sub-county first")}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          )}

          {/* Village/Cell/Street */}
          <Text style={styles.label}>Village/Cell/Street</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Acacia Avenue"
            value={formData.villageCellStreet}
            onChangeText={(text) => handleChange("villageCellStreet", text)}
            placeholderTextColor="#999"
          />

          {/* Physical Address/Building */}
          <Text style={styles.label}>Physical Address/Building</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., Plot 12, Bombo Road"
            value={formData.physicalAddress}
            onChangeText={(text) => handleChange("physicalAddress", text)}
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />

          {/* Nearest Landmark */}
          <Text style={styles.label}>Nearest Landmark</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Near Luweero Town Council"
            value={formData.nearestLandmark}
            onChangeText={(text) => handleChange("nearestLandmark", text)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.previousButton} onPress={handleBack}>
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>

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
        </View>
      </ScrollView>

      {/* District Selection Modal */}
      <Modal animationType="slide" transparent visible={districtModalVisible} onRequestClose={() => setDistrictModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity onPress={() => setDistrictModalVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput style={styles.searchInput} placeholder="Search district..." value={districtSearch} onChangeText={setDistrictSearch} placeholderTextColor="#999" autoFocus />
            </View>
            <FlatList
              data={filteredDistricts}
              keyExtractor={(item) => item}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, formData.district === item && styles.modalItemSelected]}
                  onPress={() => { handleChange("district", item); setDistrictModalVisible(false); }}
                >
                  <Text style={[styles.modalItemText, formData.district === item && styles.modalItemTextSelected]}>{item}</Text>
                  {formData.district === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No districts found</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* County Selection Modal */}
      <Modal animationType="slide" transparent visible={countyModalVisible} onRequestClose={() => setCountyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Counties in {formData.district}</Text>
              <TouchableOpacity onPress={() => setCountyModalVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {countiesForDistrict.length > 5 && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput style={styles.searchInput} placeholder="Search county..." value={countySearch} onChangeText={setCountySearch} placeholderTextColor="#999" autoFocus />
              </View>
            )}
            <FlatList
              data={filteredCounties}
              keyExtractor={(item) => item}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, formData.countyMunicipality === item && styles.modalItemSelected]}
                  onPress={() => { handleChange("countyMunicipality", item); setCountyModalVisible(false); }}
                >
                  <Text style={[styles.modalItemText, formData.countyMunicipality === item && styles.modalItemTextSelected]}>{item}</Text>
                  {formData.countyMunicipality === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No counties found</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* Sub-County Selection Modal */}
      <Modal animationType="slide" transparent visible={subCountyModalVisible} onRequestClose={() => setSubCountyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sub-Counties in {formData.countyMunicipality}</Text>
              <TouchableOpacity onPress={() => setSubCountyModalVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {subCountiesForCounty.length > 5 && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput style={styles.searchInput} placeholder="Search sub-county..." value={subCountySearch} onChangeText={setSubCountySearch} placeholderTextColor="#999" autoFocus />
              </View>
            )}
            <FlatList
              data={filteredSubCounties}
              keyExtractor={(item) => item}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, formData.subcountyDivision === item && styles.modalItemSelected]}
                  onPress={() => { handleChange("subcountyDivision", item); setSubCountyModalVisible(false); }}
                >
                  <Text style={[styles.modalItemText, formData.subcountyDivision === item && styles.modalItemTextSelected]}>{item}</Text>
                  {formData.subcountyDivision === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No sub-counties found</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* Parish Selection Modal */}
      <Modal animationType="slide" transparent visible={parishModalVisible} onRequestClose={() => setParishModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Parishes in {formData.subcountyDivision}</Text>
              <TouchableOpacity onPress={() => setParishModalVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {parishesForSubCounty.length > 5 && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput style={styles.searchInput} placeholder="Search parish..." value={parishSearch} onChangeText={setParishSearch} placeholderTextColor="#999" autoFocus />
              </View>
            )}
            <FlatList
              data={filteredParishes}
              keyExtractor={(item) => item}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, formData.parishWard === item && styles.modalItemSelected]}
                  onPress={() => { handleChange("parishWard", item); setParishModalVisible(false); }}
                >
                  <Text style={[styles.modalItemText, formData.parishWard === item && styles.modalItemTextSelected]}>{item}</Text>
                  {formData.parishWard === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No parishes found</Text>}
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
    paddingBottom: 60,
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
    fontSize: 20,
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
  phoneInputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  countryCodeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: "#EEEEEE",
    justifyContent: "center",
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#333333",
  },
  hintText: {
    color: "#666666",
    fontSize: 12,
    marginBottom: 20,
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
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
    backgroundColor: colors.primaryDark,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    margin: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    padding: 24,
  },
});

export default OutletRegistrationStep2;
