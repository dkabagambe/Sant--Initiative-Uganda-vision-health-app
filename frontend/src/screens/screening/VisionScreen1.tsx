import React, { useState, useMemo } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";
import { useLanguage } from "../../context/LanguageContext";
import { getDistrictNames, getCountiesForDistrict } from "../../data/ugandaLocations";

export default function VisionScreen1() {
  const navigation = useNavigation<any>();
  const { updateScreeningData } = useScreening();
  const { t } = useLanguage();

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
  const [districtSearch, setDistrictSearch] = useState("");
  const [countySearch, setCountySearch] = useState("");

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset county when district changes
      ...(field === "district" && value !== prev.district ? { county: "" } : {}),
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

    navigation.navigate("VisionScreen2");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A4D8F" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t("vhtEyeScreening")}</Text>
        </View>

        <View style={styles.headerRight} />
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

          {/* Sub-county/Division/Town Council */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("subCounty")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterSubCounty")}
              value={formData.subCounty}
              onChangeText={(text) => handleInputChange("subCounty", text)}
              placeholderTextColor="#999"
            />
          </View>

          {/* Parish/Ward */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("parish")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterParish")}
              value={formData.parish}
              onChangeText={(text) => handleInputChange("parish", text)}
              placeholderTextColor="#999"
            />
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
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
          ? StatusBar.currentHeight + 10
          : 44
        : 44,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 2,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerRight: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
