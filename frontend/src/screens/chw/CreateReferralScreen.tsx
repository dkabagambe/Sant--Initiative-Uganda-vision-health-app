import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { apiService } from "../../services/api";

export default function CreateReferralScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const [formData, setFormData] = useState({
    clientName: route.params?.clientName || "",
    clientPhone: "",
    clientAge: "",
    reason: "",
    referralType: "Eye Care",
    facilityName: "",
    facilityDistrict: "",
    facilitySubcounty: "",
    urgency: "normal",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!formData.clientName || !formData.clientPhone || !formData.reason) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const result = await apiService.createReferral({
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientAge: parseInt(formData.clientAge) || null,
        reason: formData.reason,
        urgency: formData.urgency,
        facilityName: formData.facilityName || null,
        facilityLocation: formData.facilityDistrict 
          ? `${formData.facilitySubcounty}, ${formData.facilityDistrict}` 
          : null,
        notes: formData.notes || null,
      });

      if (result.success) {
        Alert.alert(
          "Success",
          "Referral created successfully",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Referral</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Client Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.clientName}
              onChangeText={(text) => setFormData({ ...formData, clientName: text })}
              placeholder="Enter client name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Client Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client Phone *</Text>
            <TextInput
              style={styles.input}
              value={formData.clientPhone}
              onChangeText={(text) => setFormData({ ...formData, clientPhone: text })}
              placeholder="0700000000"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          {/* Client Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client Age</Text>
            <TextInput
              style={styles.input}
              value={formData.clientAge}
              onChangeText={(text) => setFormData({ ...formData, clientAge: text })}
              placeholder="Enter age"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          {/* Referral Reason */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Referral Reason *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.reason}
              onChangeText={(text) => setFormData({ ...formData, reason: text })}
              placeholder="Describe the reason for referral"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Referral Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Referral Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.referralType}
                onValueChange={(value) => setFormData({ ...formData, referralType: value })}
                style={styles.picker}
              >
                <Picker.Item label="Eye Care" value="Eye Care" />
                <Picker.Item label="NCD Screening" value="NCD Screening" />
                <Picker.Item label="General Health" value="General Health" />
                <Picker.Item label="Emergency" value="Emergency" />
              </Picker>
            </View>
          </View>

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
            <TextInput
              style={styles.input}
              value={formData.facilityDistrict}
              onChangeText={(text) => setFormData({ ...formData, facilityDistrict: text })}
              placeholder="Enter district"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Facility Subcounty */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facility Subcounty</Text>
            <TextInput
              style={styles.input}
              value={formData.facilitySubcounty}
              onChangeText={(text) => setFormData({ ...formData, facilitySubcounty: text })}
              placeholder="Enter subcounty"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Urgency */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Urgency</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.urgency}
                onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                style={styles.picker}
              >
                <Picker.Item label="Low" value="low" />
                <Picker.Item label="Medium" value="normal" />
                <Picker.Item label="High" value="high" />
                <Picker.Item label="Urgent" value="urgent" />
              </Picker>
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
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Creating..." : "Create Referral"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
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
    flex: 1,
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
