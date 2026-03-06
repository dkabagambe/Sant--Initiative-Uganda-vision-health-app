import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { getDistrictNames, getCountiesForDistrict, getSubCountiesForCounty, getParishesForSubCounty } from "../../data/ugandaLocations";

type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string; role: string; formData?: any };
  Register: undefined;
  CHWRegistrationStep1: undefined;
  CHWRegistrationStep2: { step1Data?: any };
  CHWRegistrationStep3: { step1Data?: any; step2Data?: any };
  CHWRegistrationStep4: { formData: any; phone: string };
  AppTabs: { role: string };
};

type CHWRegistrationStep2NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CHWRegistrationStep2"
>;

type CHWRegistrationStep2RouteProp = RouteProp<
  RootStackParamList,
  "CHWRegistrationStep2"
>;

export default function CHWRegistrationStep2() {
  const navigation = useNavigation<CHWRegistrationStep2NavigationProp>();
  const route = useRoute<CHWRegistrationStep2RouteProp>();
  const step1Data = route.params?.step1Data || {};

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
    () => (formData.county ? getSubCountiesForCounty(formData.county) : []),
    [formData.county]
  );
  const filteredSubCounties = useMemo(() => {
    if (!subCountySearch.trim()) return subCountiesForCounty;
    return subCountiesForCounty.filter((sc) => sc.toLowerCase().includes(subCountySearch.toLowerCase()));
  }, [subCountySearch, subCountiesForCounty]);

  const parishesForSubCounty = useMemo(
    () => (formData.subCounty ? getParishesForSubCounty(formData.subCounty) : []),
    [formData.subCounty]
  );
  const filteredParishes = useMemo(() => {
    if (!parishSearch.trim()) return parishesForSubCounty;
    return parishesForSubCounty.filter((p) => p.toLowerCase().includes(parishSearch.toLowerCase()));
  }, [parishSearch, parishesForSubCounty]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePreviousPress = () => {
    navigation.navigate("CHWRegistrationStep1");
  };

  const handleNextPress = () => {
    if (isFormValid()) {
      navigation.navigate("CHWRegistrationStep3", { 
        step1Data, 
        step2Data: formData 
      });
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "district" && value !== prev.district ? { county: "", subCounty: "", parish: "" } : {}),
      ...(field === "county" && value !== prev.county ? { subCounty: "", parish: "" } : {}),
      ...(field === "subCounty" && value !== prev.subCounty ? { parish: "" } : {}),
    }));
  };

  const isFormValid = () => {
    return (
      formData.phoneNumber.trim() !== "" && formData.district.trim() !== ""
    );
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
          <Text
            style={formData.county ? styles.dropdownText : styles.dropdownPlaceholder}
          >
            {formData.county || (formData.district ? "Select County" : "Select district first")}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {/* Sub-county/Division */}
        <Text style={styles.label}>Sub-county/Division</Text>
        <TouchableOpacity
          style={[styles.dropdownContainer, !formData.county && { backgroundColor: "#F3F4F6" }]}
          onPress={() => {
            if (!formData.county) return;
            setSubCountySearch("");
            setSubCountyModalVisible(true);
          }}
        >
          <Text style={formData.subCounty ? styles.dropdownText : styles.dropdownPlaceholder}>
            {formData.subCounty || (formData.county ? "Select Sub-county" : "Select county first")}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {/* Parish/Ward */}
        <Text style={styles.label}>Parish/Ward</Text>
        {formData.subCounty && parishesForSubCounty.length === 0 ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type parish name"
              value={formData.parish}
              onChangeText={(text) => updateFormData("parish", text)}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.dropdownContainer, !formData.subCounty && { backgroundColor: "#F3F4F6" }]}
            onPress={() => {
              if (!formData.subCounty) return;
              setParishSearch("");
              setParishModalVisible(true);
            }}
          >
            <Text style={formData.parish ? styles.dropdownText : styles.dropdownPlaceholder}>
              {formData.parish || (formData.subCounty ? "Select Parish" : "Select sub-county first")}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        )}

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
              <TextInput
                style={styles.searchInput}
                placeholder="Search district..."
                value={districtSearch}
                onChangeText={setDistrictSearch}
                placeholderTextColor="#999"
                autoFocus
              />
            </View>
            <FlatList
              data={filteredDistricts}
              keyExtractor={(item) => item}
              style={styles.districtList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.districtItem, formData.district === item && styles.districtItemSelected]}
                  onPress={() => { updateFormData("district", item); setDistrictModalVisible(false); }}
                >
                  <Text style={[styles.districtItemText, formData.district === item && styles.districtItemTextSelected]}>{item}</Text>
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
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search county..."
                  value={countySearch}
                  onChangeText={setCountySearch}
                  placeholderTextColor="#999"
                  autoFocus
                />
              </View>
            )}
            <FlatList
              data={filteredCounties}
              keyExtractor={(item) => item}
              style={styles.districtList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.districtItem, formData.county === item && styles.districtItemSelected]}
                  onPress={() => { updateFormData("county", item); setCountyModalVisible(false); }}
                >
                  <Text style={[styles.districtItemText, formData.county === item && styles.districtItemTextSelected]}>{item}</Text>
                  {formData.county === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
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
              <Text style={styles.modalTitle}>Sub-Counties in {formData.county}</Text>
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
              style={styles.districtList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.districtItem, formData.subCounty === item && styles.districtItemSelected]}
                  onPress={() => { updateFormData("subCounty", item); setSubCountyModalVisible(false); }}
                >
                  <Text style={[styles.districtItemText, formData.subCounty === item && styles.districtItemTextSelected]}>{item}</Text>
                  {formData.subCounty === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
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
              <Text style={styles.modalTitle}>Parishes in {formData.subCounty}</Text>
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
              style={styles.districtList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.districtItem, formData.parish === item && styles.districtItemSelected]}
                  onPress={() => { updateFormData("parish", item); setParishModalVisible(false); }}
                >
                  <Text style={[styles.districtItemText, formData.parish === item && styles.districtItemTextSelected]}>{item}</Text>
                  {formData.parish === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No parishes found</Text>}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 8 : 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    minHeight: 70,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
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
    marginBottom: 18,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: "#EEEEEE",
    justifyContent: "center",
  },
  countryCodeText: {
    fontSize: 15,
    color: "#333333",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
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
