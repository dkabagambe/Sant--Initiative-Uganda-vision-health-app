import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
  Alert,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";
import { useLanguage } from "../../context/LanguageContext";
import { getDistrictNames, getCountiesForDistrict, getSubCountiesForCounty, getParishesForSubCounty } from "../../data/ugandaLocations";
import { apiService } from "../../services/api";

export default function VisionScreen1() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { screeningData, updateScreeningData } = useScreening();
  const { t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  // Clear form data when screening context is reset
  useEffect(() => {
    if (Object.keys(screeningData).length === 0) {
      setFormData({
        fullName: "",
        age: "",
        phoneNumber: "",
        sex: "",
        district: "",
        county: "",
        subCounty: "",
        parish: "",
      });
    }
  }, [screeningData]);

  const loadUserData = async () => {
    try {
      const user = await apiService.getCurrentUser();
      if (user) setUserData(user);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    phoneNumber: "",
    sex: "",
    district: "",
    county: "",
    subCounty: "",
    parish: "",
  });

  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showCountyModal, setShowCountyModal] = useState(false);
  const [showSubCountyModal, setShowSubCountyModal] = useState(false);
  const [showParishModal, setShowParishModal] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");
  const [countySearch, setCountySearch] = useState("");
  const [subCountySearch, setSubCountySearch] = useState("");
  const [parishSearch, setParishSearch] = useState("");

  const allDistricts = useMemo(() => getDistrictNames(), []);

  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return allDistricts;
    return allDistricts.filter((d) =>
      d.toLowerCase().includes(districtSearch.toLowerCase())
    );
  }, [districtSearch, allDistricts]);

  const countiesForDistrict = useMemo(
    () => (formData.district ? getCountiesForDistrict(formData.district) : []),
    [formData.district]
  );

  const filteredCounties = useMemo(() => {
    if (!countySearch.trim()) return countiesForDistrict;
    return countiesForDistrict.filter((c) =>
      c.toLowerCase().includes(countySearch.toLowerCase())
    );
  }, [countySearch, countiesForDistrict]);

  const subCountiesForCounty = useMemo(
    () => (formData.county ? getSubCountiesForCounty(formData.county) : []),
    [formData.county]
  );

  const filteredSubCounties = useMemo(() => {
    if (!subCountySearch.trim()) return subCountiesForCounty;
    return subCountiesForCounty.filter((sc) =>
      sc.toLowerCase().includes(subCountySearch.toLowerCase())
    );
  }, [subCountySearch, subCountiesForCounty]);

  const parishesForSubCounty = useMemo(
    () => (formData.subCounty ? getParishesForSubCounty(formData.subCounty) : []),
    [formData.subCounty]
  );

  const filteredParishes = useMemo(() => {
    if (!parishSearch.trim()) return parishesForSubCounty;
    return parishesForSubCounty.filter((p) =>
      p.toLowerCase().includes(parishSearch.toLowerCase())
    );
  }, [parishSearch, parishesForSubCounty]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Cascade resets
      ...(field === "district" && value !== prev.district ? { county: "", subCounty: "", parish: "" } : {}),
      ...(field === "county" && value !== prev.county ? { subCounty: "", parish: "" } : {}),
      ...(field === "subCounty" && value !== prev.subCounty ? { parish: "" } : {}),
    }));
  };

  const handleNext = () => {
    if (
      !formData.fullName.trim() ||
      !formData.age.trim() ||
      !formData.sex ||
      !formData.district.trim()
    ) {
      Alert.alert(t("requiredFields"), t("pleaseFillRequired"));
      return;
    }

    // Save to context
    updateScreeningData({
      clientName: formData.fullName,
      clientPhone: formData.phoneNumber,
      clientAge: parseInt(formData.age),
      clientGender: formData.sex,
      clientVillage: formData.parish,
      district: formData.district,
      county: formData.county,
      subCounty: formData.subCounty,
      parish: formData.parish,
    });

    navigation.navigate(route.params?.nextScreen || "VisionScreen2");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top Header with Logo and Menu - Fixed at top */}
     
           {/* Top Header with Logo and Menu - Fixed at top */}
           <View style={styles.topHeader}>
             <View style={styles.headerLeft}>
               <View style={styles.logoBox}>
                 <Image
                   source={require("../../../assets/logo.png")}
                   style={styles.logo}
                   resizeMode="contain"
                 />
               </View>
             </View>
     
             <View style={styles.headerCenter}>
               <Text style={styles.headerTitle}>
                 {userData?.fullName || userData?.full_name || "Santé Initiative Uganda"}
               </Text>
               <Text style={styles.headerSubtitle}>
                 {userData?.district ? `VHT - ${userData.district} District` : ""}
               </Text>
             </View>
     
             <View style={styles.headerRight}>
               <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
                 <Ionicons name="menu" size={28} color="#1A4D8F" />
               </TouchableOpacity>
             </View>
           </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>{t("step")} 1 {t("of")} 6</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "16.67%" }]} />
          </View>
        </View>

        {/* Form Title */}
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>{t("clientInformation")}</Text>
          <Text style={styles.formSubtitle}>
            {t("enterBasicDetails")}
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t("fullName")} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterClientName")}
              value={formData.fullName}
              onChangeText={(text) => handleInputChange("fullName", text)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t("age")} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterAge")}
              value={formData.age}
              onChangeText={(text) => handleInputChange("age", text)}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHint}>
              {t("ageDeterminesTests")}
            </Text>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("phoneNumber")}</Text>
            <TextInput
              style={styles.input}
              placeholder="0700123456"
              value={formData.phoneNumber}
              onChangeText={(text) => handleInputChange("phoneNumber", text)}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          {/* Sex */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("sex")}</Text>
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
                  {t("male")}
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
                  {t("female")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* District - Searchable Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t("district")} <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setDistrictSearch("");
                setShowDistrictModal(true);
              }}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  !formData.district && styles.dropdownPlaceholder,
                ]}
              >
                {formData.district || "e.g., Kampala, Luweero, Wakiso"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* County - Dependent Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("county")}</Text>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                !formData.district && styles.dropdownDisabled,
              ]}
              onPress={() => {
                if (!formData.district) {
                  Alert.alert("Select District", "Please select a district first");
                  return;
                }
                setCountySearch("");
                setShowCountyModal(true);
              }}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  !formData.county && styles.dropdownPlaceholder,
                ]}
              >
                {formData.county || (formData.district ? "Select county" : "Select district first")}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Sub-County - Dependent Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("subCounty")}</Text>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                !formData.county && styles.dropdownDisabled,
              ]}
              onPress={() => {
                if (!formData.county) {
                  Alert.alert("Select County", "Please select a county first");
                  return;
                }
                setSubCountySearch("");
                setShowSubCountyModal(true);
              }}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  !formData.subCounty && styles.dropdownPlaceholder,
                ]}
              >
                {formData.subCounty || (formData.county ? "Select sub-county" : "Select county first")}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Parish - Dropdown if data exists, text input otherwise */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("parish")}</Text>
            {formData.subCounty && parishesForSubCounty.length === 0 ? (
              <TextInput
                style={styles.input}
                placeholder="Type parish name"
                value={formData.parish}
                onChangeText={(text) => handleInputChange("parish", text)}
                placeholderTextColor="#999"
              />
            ) : (
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  !formData.subCounty && styles.dropdownDisabled,
                ]}
                onPress={() => {
                  if (!formData.subCounty) {
                    Alert.alert("Select Sub-County", "Please select a sub-county first");
                    return;
                  }
                  setParishSearch("");
                  setShowParishModal(true);
                }}
              >
                <Text
                  style={[
                    styles.dropdownButtonText,
                    !formData.parish && styles.dropdownPlaceholder,
                  ]}
                >
                  {formData.parish || (formData.subCounty ? "Select parish" : "Select sub-county first")}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{t("next")}</Text>
        </TouchableOpacity>

        {/* Spacer for bottom tab bar */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* District Dropdown Modal */}
      <Modal visible={showDistrictModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    formData.district === item && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    handleInputChange("district", item);
                    setShowDistrictModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      formData.district === item && styles.modalItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {formData.district === item && (
                    <Ionicons name="checkmark" size={20} color="#2E7D32" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No districts found</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* County Dropdown Modal */}
      <Modal visible={showCountyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Counties in {formData.district}
              </Text>
              <TouchableOpacity onPress={() => setShowCountyModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    formData.county === item && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    handleInputChange("county", item);
                    setShowCountyModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      formData.county === item && styles.modalItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {formData.county === item && (
                    <Ionicons name="checkmark" size={20} color="#2E7D32" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No counties found</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Sub-County Dropdown Modal */}
      <Modal visible={showSubCountyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Sub-Counties in {formData.county}
              </Text>
              <TouchableOpacity onPress={() => setShowSubCountyModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            {subCountiesForCounty.length > 5 && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search sub-county..."
                  value={subCountySearch}
                  onChangeText={setSubCountySearch}
                  placeholderTextColor="#999"
                  autoFocus
                />
              </View>
            )}
            <FlatList
              data={filteredSubCounties}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    formData.subCounty === item && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    handleInputChange("subCounty", item);
                    setShowSubCountyModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      formData.subCounty === item && styles.modalItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {formData.subCounty === item && (
                    <Ionicons name="checkmark" size={20} color="#2E7D32" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No sub-counties found</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Parish Dropdown Modal */}
      <Modal visible={showParishModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Parishes in {formData.subCounty}
              </Text>
              <TouchableOpacity onPress={() => setShowParishModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            {parishesForSubCounty.length > 5 && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search parish..."
                  value={parishSearch}
                  onChangeText={setParishSearch}
                  placeholderTextColor="#999"
                  autoFocus
                />
              </View>
            )}
            <FlatList
              data={filteredParishes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    formData.parish === item && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    handleInputChange("parish", item);
                    setShowParishModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      formData.parish === item && styles.modalItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {formData.parish === item && (
                    <Ionicons name="checkmark" size={20} color="#2E7D32" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No parishes found</Text>
              }
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerLeft: {
    flex: 1,
  },
  logoBox: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  scrollView: {
    flex: 1,
    marginTop: StatusBar.currentHeight ? StatusBar.currentHeight + 120 : 150,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 120,
  },
  progressSection: {
    marginBottom: 24,
  },
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
  progressFill: {
    height: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 3,
  },
  formHeader: {
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A1A1A",
    minHeight: 48,
  },
  inputHint: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
    fontStyle: "italic",
  },
  sexButtons: {
    flexDirection: "row",
    gap: 12,
  },
  sexButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 48,
    justifyContent: "center",
  },
  sexButtonActive: {
    backgroundColor: "#1A4D8F",
    borderColor: "#1A4D8F",
  },
  sexButtonText: {
    fontSize: 15,
    color: "#666666",
    fontWeight: "500",
  },
  sexButtonTextActive: {
    color: "#FFFFFF",
  },
  nextButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
    minHeight: 52,
    shadowColor: "#1A4D8F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  spacer: {
    height: 20,
  },
  dropdownButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: "#1A1A1A",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#999",
  },
  dropdownDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
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
    color: "#1A1A1A",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalItemActive: {
    backgroundColor: "#F0FFF4",
  },
  modalItemText: {
    fontSize: 16,
    color: "#374151",
  },
  modalItemTextActive: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    padding: 24,
  },
});
