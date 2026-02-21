import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";
import { useLanguage } from "../../context/LanguageContext";

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
          <Text style={styles.progressText}>{t("step")} 1 {t("of")} 7</Text>
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

          {/* District */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t("district")} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Kampala, Luweero, Wakiso"
              value={formData.district}
              onChangeText={(text) => handleInputChange("district", text)}
              placeholderTextColor="#999"
            />
          </View>

          {/* County/Municipality/Division */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("county")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterCounty")}
              value={formData.county}
              onChangeText={(text) => handleInputChange("county", text)}
              placeholderTextColor="#999"
            />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
  progressSection: {
    marginBottom: 20,
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
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: "#666666",
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
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
    padding: 14,
    fontSize: 16,
    color: "#1A1A1A",
  },
  inputHint: {
    fontSize: 14,
    color: "#666666",
    marginTop: 6,
    fontStyle: "italic",
  },
  sexButtons: {
    flexDirection: "row",
    gap: 12,
  },
  sexButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sexButtonActive: {
    backgroundColor: "#1A4D8F",
    borderColor: "#1A4D8F",
  },
  sexButtonText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  sexButtonTextActive: {
    color: "#FFFFFF",
  },
  nextButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#1A4D8F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  spacer: {
    height: 20,
  },
});
