import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { apiService, User } from "../../services/api";
import { getDistrictNames, getCountiesForDistrict, getSubCountiesForCounty, getParishesForSubCounty } from "../../data/ugandaLocations";
import CHWHeader from "../../components/CHWHeader";

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const user = await apiService.getCurrentUser();
      if (user) {
        setFormData({
          fullName: user.fullName || "",
          age: "", // Age not in User interface
          phoneNumber: user.phoneNumber || "",
          sex: "", // Gender not in User interface
          district: user.district || "",
          county: "", // County not in User interface
          subCounty: "", // SubCounty not in User interface
          parish: user.village || "",
        });
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "district" && value !== prev.district ? { county: "", subCounty: "", parish: "" } : {}),
      ...(field === "county" && value !== prev.county ? { subCounty: "", parish: "" } : {}),
      ...(field === "subCounty" && value !== prev.subCounty ? { parish: "" } : {}),
    }));
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert("Validation Error", "Full name is required");
      return;
    }
    if (!formData.sex) {
      Alert.alert("Validation Error", "Sex is required");
      return;
    }
    if (!formData.district) {
      Alert.alert("Validation Error", "District is required");
      return;
    }

    setSaving(true);
    try {
      const result = await apiService.updateUserProfile({
        full_name: formData.fullName,
        age: formData.age ? parseInt(formData.age) : null,
        sex: formData.sex,
        district: formData.district,
        county: formData.county,
        sub_county: formData.subCounty,
        parish: formData.parish,
      });
      
      if (result.success) {
        // Update local storage
        const user = await apiService.getCurrentUser();
        if (!user) {
          throw new Error("User not found");
        }
        
        const updatedUser: User = {
          id: user.id,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          district: formData.district,
          village: formData.parish,
          role: user.role,
          profile_image: user.profile_image,
        };
        
        await apiService.storeUserData(updatedUser, user.id);
        
        Alert.alert("Success", "Profile updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1E40AF" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <CHWHeader />

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => handleInputChange("fullName", text)}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              onChangeText={(text) => handleInputChange("age", text)}
              placeholder="Enter your age"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.phoneNumber}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.helperText}>Phone number cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sex *</Text>
            <View style={styles.sexRow}>
              <TouchableOpacity
                style={[styles.sexButton, formData.sex === "Male" && styles.sexButtonActive]}
                onPress={() => handleInputChange("sex", "Male")}
              >
                <Ionicons
                  name={formData.sex === "Male" ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={formData.sex === "Male" ? "#1E40AF" : "#9CA3AF"}
                />
                <Text style={[styles.sexText, formData.sex === "Male" && styles.sexTextActive]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sexButton, formData.sex === "Female" && styles.sexButtonActive]}
                onPress={() => handleInputChange("sex", "Female")}
              >
                <Ionicons
                  name={formData.sex === "Female" ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={formData.sex === "Female" ? "#1E40AF" : "#9CA3AF"}
                />
                <Text style={[styles.sexText, formData.sex === "Female" && styles.sexTextActive]}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>District *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowDistrictModal(true)}
            >
              <Text style={[styles.dropdownText, !formData.district && styles.placeholderText]}>
                {formData.district || "Select district"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>County</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, !formData.district && styles.disabledInput]}
              onPress={() => formData.district && setShowCountyModal(true)}
              disabled={!formData.district}
            >
              <Text style={[styles.dropdownText, !formData.county && styles.placeholderText]}>
                {formData.county || "Select county"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sub-County</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, !formData.county && styles.disabledInput]}
              onPress={() => formData.county && setShowSubCountyModal(true)}
              disabled={!formData.county}
            >
              <Text style={[styles.dropdownText, !formData.subCounty && styles.placeholderText]}>
                {formData.subCounty || "Select sub-county"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parish/Village</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, !formData.subCounty && styles.disabledInput]}
              onPress={() => formData.subCounty && setShowParishModal(true)}
              disabled={!formData.subCounty}
            >
              <Text style={[styles.dropdownText, !formData.parish && styles.placeholderText]}>
                {formData.parish || "Select parish/village"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* District Modal */}
        <Modal visible={showDistrictModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select District</Text>
                <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search district..."
                value={districtSearch}
                onChangeText={setDistrictSearch}
              />
              <FlatList
                data={filteredDistricts}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      handleInputChange("district", item);
                      setShowDistrictModal(false);
                      setDistrictSearch("");
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* County Modal */}
        <Modal visible={showCountyModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select County</Text>
                <TouchableOpacity onPress={() => setShowCountyModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search county..."
                value={countySearch}
                onChangeText={setCountySearch}
              />
              <FlatList
                data={filteredCounties}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      handleInputChange("county", item);
                      setShowCountyModal(false);
                      setCountySearch("");
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Sub-County Modal */}
        <Modal visible={showSubCountyModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Sub-County</Text>
                <TouchableOpacity onPress={() => setShowSubCountyModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search sub-county..."
                value={subCountySearch}
                onChangeText={setSubCountySearch}
              />
              <FlatList
                data={filteredSubCounties}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      handleInputChange("subCounty", item);
                      setShowSubCountyModal(false);
                      setSubCountySearch("");
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Parish Modal */}
        <Modal visible={showParishModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Parish/Village</Text>
                <TouchableOpacity onPress={() => setShowParishModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search parish/village..."
                value={parishSearch}
                onChangeText={setParishSearch}
              />
              <FlatList
                data={filteredParishes}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      handleInputChange("parish", item);
                      setShowParishModal(false);
                      setParishSearch("");
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF8",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  placeholder: {
    width: 24,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sexRow: {
    flexDirection: "row",
    gap: 12,
  },
  sexButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  sexButtonActive: {
    borderColor: "#1E40AF",
    backgroundColor: "#EFF6FF",
  },
  sexText: {
    fontSize: 15,
    color: "#6B7280",
    marginLeft: 8,
  },
  sexTextActive: {
    color: "#1E40AF",
    fontWeight: "600",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    fontSize: 16,
    color: "#1F2937",
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  searchInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    fontSize: 16,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalItemText: {
    fontSize: 16,
    color: "#1F2937",
  },
});
