import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { apiService } from "../../services/api";
import { getDistrictNames } from "../../data/ugandaLocations";
import AppHeader from "../../components/AppHeader";

export default function CreateReferralScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [userData, setUserData] = useState<any>(null);

  // Accept pre-filled data from screening flow
  const fromScreening = route.params?.fromScreening || false;
  const screeningId = route.params?.screeningId || null;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setUserData(user);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const [formData, setFormData] = useState({
    clientName: route.params?.clientName || "",
    clientPhone: route.params?.clientPhone || "",
    clientAge: route.params?.clientAge?.toString() || "",
    clientSex: route.params?.clientSex || "",
    clientDistrict: route.params?.district || "",
    reason: route.params?.reason || "",
    facilityName: "",
    facilityDistrict: "",
    urgency: route.params?.urgency || "normal",
    notes: route.params?.notes || "",
  });

  const [loading, setLoading] = useState(false);

  // Client district dropdown
  const [showClientDistrictModal, setShowClientDistrictModal] = useState(false);
  const [clientDistrictSearch, setClientDistrictSearch] = useState("");

  // Facility district dropdown
  const [showFacilityDistrictModal, setShowFacilityDistrictModal] = useState(false);
  const [facilityDistrictSearch, setFacilityDistrictSearch] = useState("");

  // Sex picker
  const [showSexModal, setShowSexModal] = useState(false);
  const sexOptions = ["Male", "Female"];

  const allDistricts = useMemo(() => getDistrictNames(), []);
  const filteredClientDistricts = useMemo(() => {
    if (!clientDistrictSearch.trim()) return allDistricts;
    return allDistricts.filter((d) => d.toLowerCase().includes(clientDistrictSearch.toLowerCase()));
  }, [clientDistrictSearch, allDistricts]);
  const filteredFacilityDistricts = useMemo(() => {
    if (!facilityDistrictSearch.trim()) return allDistricts;
    return allDistricts.filter((d) => d.toLowerCase().includes(facilityDistrictSearch.toLowerCase()));
  }, [facilityDistrictSearch, allDistricts]);

  const handleSubmit = async () => {
    if (!formData.clientName || !formData.reason) {
      Alert.alert("Error", "Please fill in client name and reason for referral");
      return;
    }

    try {
      setLoading(true);
      const result = await apiService.createReferral({
        screeningId: screeningId || undefined,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone || null,
        clientAge: parseInt(formData.clientAge) || null,
        clientGender: formData.clientSex || null,
        clientDistrict: formData.clientDistrict || null,
        reason: formData.reason,
        urgency: formData.urgency,
        facilityName: formData.facilityName || null,
        facilityLocation: formData.facilityDistrict || null,
        notes: formData.notes || null,
      });

      if (result.success) {
        Alert.alert(
          "Success",
          fromScreening
            ? "Referral created successfully. Screening ended — client must visit the health facility."
            : "Referral created successfully",
          [
            {
              text: "OK",
              onPress: () => {
                if (fromScreening) {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "AppTabs" }],
                  });
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", result.error || "Failed to create referral");
      }
    } catch (error) {
      console.error("Create referral error:", error);
      Alert.alert("Error", "Failed to create referral");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (fromScreening) {
      Alert.alert(
        "Cancel Referral?",
        "Going back will cancel this referral. The screening has already been saved.",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Cancel Referral",
            style: "destructive",
            onPress: () => {
              navigation.reset({ index: 0, routes: [{ name: "AppTabs" }] });
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <AppHeader 
        userName={userData?.full_name}
        userRole={userData?.role}
        district={userData?.district}
      />

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.titleSection}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>
            {fromScreening ? "Referral from Screening" : "Create Referral"}
          </Text>
        </View>
        
        <View style={styles.form}>

          {/* Pre-filled banner when from screening */}
          {fromScreening && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={20} color="#92400E" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.warningTitle}>Referral Required</Text>
                <Text style={styles.warningText}>
                  Client details are pre-filled from the screening. Add the referral facility details below.
                </Text>
              </View>
            </View>
          )}

          {/* ===== SECTION: Client Information ===== */}
          <Text style={styles.sectionTitle}>Client Information</Text>

          {/* Client Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={[styles.input, fromScreening && styles.readOnlyInput]}
              value={formData.clientName}
              onChangeText={(text) => setFormData({ ...formData, clientName: text })}
              placeholder="Enter client name"
              placeholderTextColor="#9CA3AF"
              editable={!fromScreening}
            />
          </View>

          {/* Client Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={[styles.input, fromScreening && styles.readOnlyInput]}
              value={formData.clientAge}
              onChangeText={(text) => setFormData({ ...formData, clientAge: text })}
              placeholder="Enter age"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              editable={!fromScreening}
            />
          </View>

          {/* Client Sex */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sex</Text>
            {fromScreening ? (
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={formData.clientSex}
                editable={false}
              />
            ) : (
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowSexModal(true)}
              >
                <Text style={formData.clientSex ? styles.dropdownButtonText : styles.dropdownPlaceholderText}>
                  {formData.clientSex || "Select sex"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* Client District */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>District</Text>
            {fromScreening ? (
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={formData.clientDistrict}
                editable={false}
              />
            ) : (
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => { setClientDistrictSearch(""); setShowClientDistrictModal(true); }}
              >
                <Text style={formData.clientDistrict ? styles.dropdownButtonText : styles.dropdownPlaceholderText}>
                  {formData.clientDistrict || "Select district"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* Client Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, fromScreening && styles.readOnlyInput]}
              value={formData.clientPhone}
              onChangeText={(text) => setFormData({ ...formData, clientPhone: text })}
              placeholder="0700000000"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              editable={!fromScreening}
            />
          </View>

          {/* ===== SECTION: Reason for Referral ===== */}
          <Text style={styles.sectionTitle}>Reason for Referral</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason *</Text>
            <TextInput
              style={[styles.input, styles.textArea, fromScreening && styles.readOnlyInput]}
              value={formData.reason}
              onChangeText={(text) => setFormData({ ...formData, reason: text })}
              placeholder="Describe the reason for referral"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              editable={!fromScreening}
            />
          </View>

          {/* ===== SECTION: Referral Facility ===== */}
          <Text style={styles.sectionTitle}>Referral Facility Details</Text>

          {/* Facility Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facility Name</Text>
            <TextInput
              style={styles.input}
              value={formData.facilityName}
              onChangeText={(text) => setFormData({ ...formData, facilityName: text })}
              placeholder="e.g., Luweero Hospital Eye Clinic"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Facility District */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facility District</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => { setFacilityDistrictSearch(""); setShowFacilityDistrictModal(true); }}
            >
              <Text style={formData.facilityDistrict ? styles.dropdownButtonText : styles.dropdownPlaceholderText}>
                {formData.facilityDistrict || "Select district"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Urgency */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Urgency</Text>
            <View style={styles.urgencyRow}>
              {[
                { value: "low", label: "Low", color: "#6B7280", bg: "#F3F4F6" },
                { value: "normal", label: "Medium", color: "#D97706", bg: "#FEF3C7" },
                { value: "high", label: "High", color: "#DC2626", bg: "#FEE2E2" },
                { value: "urgent", label: "Urgent", color: "#FFFFFF", bg: "#DC2626" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.urgencyButton,
                    formData.urgency === opt.value && { backgroundColor: opt.bg, borderColor: opt.value === "urgent" ? "#DC2626" : opt.color },
                  ]}
                  onPress={() => setFormData({ ...formData, urgency: opt.value })}
                >
                  <Text
                    style={[
                      styles.urgencyText,
                      formData.urgency === opt.value && { color: opt.color, fontWeight: "700" },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Additional Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Any additional information..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleBack}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.submitButtonText}>
                {loading ? "Creating..." : "Create Referral"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sex Selection Modal */}
      <Modal visible={showSexModal} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSexModal(false)}>
          <View style={styles.modalContentSmall}>
            <Text style={styles.modalTitle}>Select Sex</Text>
            {sexOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.modalItem, formData.clientSex === opt && styles.modalItemActive]}
                onPress={() => { setFormData({ ...formData, clientSex: opt }); setShowSexModal(false); }}
              >
                <Text style={[styles.modalItemText, formData.clientSex === opt && styles.modalItemTextActive]}>{opt}</Text>
                {formData.clientSex === opt && <Ionicons name="checkmark" size={20} color="#2E7D32" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Client District Modal */}
      <Modal visible={showClientDistrictModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Client District</Text>
              <TouchableOpacity onPress={() => setShowClientDistrictModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput style={styles.searchInput} placeholder="Search district..." value={clientDistrictSearch} onChangeText={setClientDistrictSearch} placeholderTextColor="#999" autoFocus />
            </View>
            <FlatList
              data={filteredClientDistricts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, formData.clientDistrict === item && styles.modalItemActive]}
                  onPress={() => { setFormData({ ...formData, clientDistrict: item }); setShowClientDistrictModal(false); }}
                >
                  <Text style={[styles.modalItemText, formData.clientDistrict === item && styles.modalItemTextActive]}>{item}</Text>
                  {formData.clientDistrict === item && <Ionicons name="checkmark" size={20} color="#2E7D32" />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No districts found</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* Facility District Modal */}
      <Modal visible={showFacilityDistrictModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Facility District</Text>
              <TouchableOpacity onPress={() => setShowFacilityDistrictModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput style={styles.searchInput} placeholder="Search district..." value={facilityDistrictSearch} onChangeText={setFacilityDistrictSearch} placeholderTextColor="#999" autoFocus />
            </View>
            <FlatList
              data={filteredFacilityDistricts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, formData.facilityDistrict === item && styles.modalItemActive]}
                  onPress={() => { setFormData({ ...formData, facilityDistrict: item }); setShowFacilityDistrictModal(false); }}
                >
                  <Text style={[styles.modalItemText, formData.facilityDistrict === item && styles.modalItemTextActive]}>{item}</Text>
                  {formData.facilityDistrict === item && <Ionicons name="checkmark" size={20} color="#2E7D32" />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No districts found</Text>}
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
    backgroundColor: "#F9FAFB",
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  warningBanner: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 14,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  readOnlyInput: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  urgencyRow: {
    flexDirection: "row",
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#111827",
  },
  dropdownPlaceholderText: {
    fontSize: 16,
    color: "#9CA3AF",
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
  modalContentSmall: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 40,
    marginTop: "auto",
    marginBottom: "auto",
    padding: 8,
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
    color: "#111827",
    padding: 12,
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
    backgroundColor: "#F0F9F0",
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
