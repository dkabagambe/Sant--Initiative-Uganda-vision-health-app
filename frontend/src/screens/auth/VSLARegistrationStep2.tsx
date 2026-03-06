import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { getDistrictNames, getCountiesForDistrict, getSubCountiesForCounty, getParishesForSubCounty } from "../../data/ugandaLocations";

// Define navigation types
type RootStackParamList = {
  VSLARegistrationStep1: undefined;
  VSLARegistrationStep2: { step1Data: any };
  VSLARegistrationStep3: { step1Data: any; step2Data: any };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type VSLAStep2RouteProp = RouteProp<RootStackParamList, "VSLARegistrationStep2">;

// Progress Bar Component - Updated for Figma design
const ProgressBar = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.stepsContainer}>
        {[...Array(totalSteps)].map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <View key={`step-${stepNumber}`} style={progressStyles.stepWrapper}>
              {/* Connecting Line */}
              {index > 0 && (
                <View
                  style={[
                    progressStyles.connectorLine,
                    isCompleted ? progressStyles.connectorLineActive : {},
                  ]}
                />
              )}
              {/* Step Circle */}
              <View
                style={[
                  progressStyles.stepCircle,
                  isCurrent && progressStyles.stepCircleActive,
                  isCompleted && progressStyles.stepCircleCompleted,
                ]}
              >
                {isCompleted ? (
                  <Text style={progressStyles.stepCheckmark}>1</Text>
                ) : (
                  <Text
                    style={[
                      progressStyles.stepNumber,
                      isCurrent && progressStyles.stepNumberActive,
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const VSLARegistrationStep2 = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VSLAStep2RouteProp>();
  const step1Data = route.params?.step1Data || {};

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

  // Dropdown state
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
    return allDistricts.filter((d) => d.toLowerCase().includes(districtSearch.toLowerCase()));
  }, [districtSearch, allDistricts]);
  const countiesForDistrict = useMemo(
    () => (district ? getCountiesForDistrict(district) : []),
    [district]
  );
  const filteredCounties = useMemo(() => {
    if (!countySearch.trim()) return countiesForDistrict;
    return countiesForDistrict.filter((c) => c.toLowerCase().includes(countySearch.toLowerCase()));
  }, [countySearch, countiesForDistrict]);

  const subCountiesForCounty = useMemo(
    () => (county ? getSubCountiesForCounty(county) : []),
    [county]
  );
  const filteredSubCounties = useMemo(() => {
    if (!subCountySearch.trim()) return subCountiesForCounty;
    return subCountiesForCounty.filter((sc) => sc.toLowerCase().includes(subCountySearch.toLowerCase()));
  }, [subCountySearch, subCountiesForCounty]);

  const parishesForSubCounty = useMemo(
    () => (subcounty ? getParishesForSubCounty(subcounty) : []),
    [subcounty]
  );
  const filteredParishes = useMemo(() => {
    if (!parishSearch.trim()) return parishesForSubCounty;
    return parishesForSubCounty.filter((p) => p.toLowerCase().includes(parishSearch.toLowerCase()));
  }, [parishSearch, parishesForSubCounty]);
  const [parish, setParish] = useState("");
  const [village, setVillage] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");

  const handlePrevious = () => {
    navigation.goBack();
  };

  const validateForm = () => {
    // Validate required fields
    if (!chairperson.name || !chairperson.phone || !chairperson.nationalId) {
      Alert.alert("Missing Information", "Please fill in all Chairperson details");
      return false;
    }
    if (!primaryContact) {
      Alert.alert("Missing Information", "Primary contact phone number is required");
      return false;
    }
    if (!district) {
      Alert.alert("Missing Information", "District is required");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }

    const step2Data = {
      chairperson,
      treasurer,
      secretary,
      phoneNumber: primaryContact, // Use phoneNumber for consistency
      primaryContact,
      alternatePhone,
      email,
      district,
      county,
      subcounty,
      parish,
    };
    navigation.navigate("VSLARegistrationStep3", { step1Data, step2Data });
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
  ) => {
    console.log(`renderPersonSection: ${title}, showNationalId: ${showNationalId}, person:`, person);
    return (
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
          placeholder="National ID"
          value={person.nationalId}
          onChangeText={(text) => setPerson({ ...person, nationalId: text })}
        />
      )}
    </View>
  );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Header with Back Arrow and Title */}
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handlePrevious} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>VSLA/SACCO Registration</Text>
            <Text style={styles.stepText}>Step 2 of 4</Text>
          </View>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Progress Bar - Placed immediately under the header */}
        <ProgressBar currentStep={2} totalSteps={4} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => { setDistrictSearch(""); setShowDistrictModal(true); }}
            >
              <Text style={district ? styles.dropdownText : styles.dropdownPlaceholder}>
                {district || "Select District"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>County/Municipality</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, !district && { backgroundColor: "#F3F4F6" }]}
              onPress={() => {
                if (!district) return;
                setCountySearch("");
                setShowCountyModal(true);
              }}
            >
              <Text style={county ? styles.dropdownText : styles.dropdownPlaceholder}>
                {county || "e.g., Luweero County"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sub-county/Division</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, !county && { backgroundColor: "#F3F4F6" }]}
              onPress={() => {
                if (!county) return;
                setSubCountySearch("");
                setShowSubCountyModal(true);
              }}
            >
              <Text style={subcounty ? styles.dropdownText : styles.dropdownPlaceholder}>
                {subcounty || "e.g., Wobulenzi Sub-County"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parish/Ward</Text>
            {subcounty && parishesForSubCounty.length === 0 ? (
              <TextInput
                style={styles.input}
                placeholder="e.g., Bombo Parish"
                value={parish}
                onChangeText={setParish}
              />
            ) : (
              <TouchableOpacity
                style={[styles.dropdownButton, !subcounty && { backgroundColor: "#F3F4F6" }]}
                onPress={() => {
                  if (!subcounty) return;
                  setParishSearch("");
                  setShowParishModal(true);
                }}
              >
                <Text style={parish ? styles.dropdownText : styles.dropdownPlaceholder}>
                  {parish || "e.g., Bombo Parish"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            )}
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

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Previous and Next Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.previousButton]}
            onPress={handlePrevious}
            activeOpacity={0.8}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* District Modal */}
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
              <TextInput style={styles.searchInput} placeholder="Search district..." value={districtSearch} onChangeText={setDistrictSearch} placeholderTextColor="#999" autoFocus />
            </View>
            <FlatList
              data={filteredDistricts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, district === item && styles.modalItemActive]}
                  onPress={() => { setDistrict(item); setCounty(""); setSubcounty(""); setParish(""); setShowDistrictModal(false); }}
                >
                  <Text style={[styles.modalItemText, district === item && styles.modalItemTextActive]}>{item}</Text>
                  {district === item && <Ionicons name="checkmark" size={20} color="#FF9800" />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No districts found</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* County Modal */}
      <Modal visible={showCountyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Counties in {district}</Text>
              <TouchableOpacity onPress={() => setShowCountyModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, county === item && styles.modalItemActive]}
                  onPress={() => { setCounty(item); setSubcounty(""); setParish(""); setShowCountyModal(false); }}
                >
                  <Text style={[styles.modalItemText, county === item && styles.modalItemTextActive]}>{item}</Text>
                  {county === item && <Ionicons name="checkmark" size={20} color="#FF9800" />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No counties found</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* Sub-County Modal */}
      <Modal visible={showSubCountyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sub-Counties in {county}</Text>
              <TouchableOpacity onPress={() => setShowSubCountyModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, subcounty === item && styles.modalItemActive]}
                  onPress={() => { setSubcounty(item); setParish(""); setShowSubCountyModal(false); }}
                >
                  <Text style={[styles.modalItemText, subcounty === item && styles.modalItemTextActive]}>{item}</Text>
                  {subcounty === item && <Ionicons name="checkmark" size={20} color="#FF9800" />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No sub-counties found</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* Parish Modal */}
      <Modal visible={showParishModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Parishes in {subcounty}</Text>
              <TouchableOpacity onPress={() => setShowParishModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, parish === item && styles.modalItemActive]}
                  onPress={() => { setParish(item); setShowParishModal(false); }}
                >
                  <Text style={[styles.modalItemText, parish === item && styles.modalItemTextActive]}>{item}</Text>
                  {parish === item && <Ionicons name="checkmark" size={20} color="#FF9800" />}
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

// Progress Bar Styles - Updated for better positioning and colors
const progressStyles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 40,
    marginTop: 20,
    marginBottom: 20,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  stepWrapper: {
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  stepCircleActive: {
    backgroundColor: "#FF9800",
    borderColor: "#FF9800",
  },
  stepCircleCompleted: {
    backgroundColor: "#FF9800",
    borderColor: "#FF9800",
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#757575",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepCheckmark: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  connectorLine: {
    position: "absolute",
    height: 2,
    backgroundColor: "#E0E0E0",
    top: 13, // Center of circle (28/2 = 14)
    left: "-50%",
    right: "50%",
    zIndex: 1,
  },
  connectorLineActive: {
    backgroundColor: "#4CAF50", // Green line for completed connections
  },
});

// Main Component Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerContainer: {
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 32,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 16 : 70,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 24,
    fontWeight: "300",
    color: "#333",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    fontWeight: "400",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 24,
  },
  personSection: {
    marginBottom: 24,
  },
  personTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    color: "#333333",
    height: 40,
    marginBottom: 12,
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  countryCode: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    minWidth: 70,
    height: 40,
  },
  countryCodeText: {
    fontSize: 14,
    color: "#333333",
    textAlign: "center",
  },
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginBottom: 0,
    height: 40,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    height: 40,
    justifyContent: "center",
  },
  selectPlaceholder: {
    fontSize: 14,
    color: "#8E8E93",
  },
  hintText: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
    marginTop: 4,
    marginBottom: 8,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  previousButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  nextButton: {
    backgroundColor: "#FF9800",
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    height: 40,
  },
  dropdownText: {
    fontSize: 14,
    color: "#333333",
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: "#999",
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
    color: "#333",
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
    backgroundColor: "#FFF8E1",
  },
  modalItemText: {
    fontSize: 16,
    color: "#374151",
  },
  modalItemTextActive: {
    color: "#FF9800",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    padding: 24,
  },
});

export default VSLARegistrationStep2;
