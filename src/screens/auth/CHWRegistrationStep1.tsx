import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";

// UPDATE THIS TYPE - Add CHWRegistrationStep2
type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string; role: string };
  Register: undefined;
  CHWRegistrationStep1: undefined;
  CHWRegistrationStep2: undefined;
  CHWRegistrationStep3: undefined;
  AppTabs: { role: string };
};

type CHWRegistrationStep1NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CHWRegistrationStep1"
>;

export default function CHWRegistrationStep1() {
  const navigation = useNavigation<CHWRegistrationStep1NavigationProp>();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    nationalId: "",
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  // In handleNextPress function:
  const handleNextPress = () => {
    // REMOVE THE IF CONDITION - just navigate
    navigation.navigate("CHWRegistrationStep2");
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

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
          <Text style={styles.stepText}>Step 1 of 4</Text>
          <View style={styles.stepProgress}>
            <View style={styles.stepActive} />
            <View style={styles.stepInactive} />
            <View style={styles.stepInactive} />
            <View style={styles.stepInactive} />
          </View>
        </View>

        {/* Form Title */}
        <Text style={styles.formTitle}>Personal Information</Text>

        {/* First Name */}
        <Text style={styles.label}>First Name *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Jane"
            value={formData.firstName}
            onChangeText={(text) => updateFormData("firstName", text)}
          />
        </View>

        {/* Last Name */}
        <Text style={styles.label}>Last Name *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nambi"
            value={formData.lastName}
            onChangeText={(text) => updateFormData("lastName", text)}
          />
        </View>

        {/* Gender */}
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderOption,
              formData.gender === "Female" && styles.genderOptionSelected,
            ]}
            onPress={() => updateFormData("gender", "Female")}
          >
            <View style={styles.genderRadio}>
              {formData.gender === "Female" && (
                <View style={styles.genderRadioSelected} />
              )}
            </View>
            <Text
              style={[
                styles.genderText,
                formData.gender === "Female" && styles.genderTextSelected,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderOption,
              formData.gender === "Male" && styles.genderOptionSelected,
            ]}
            onPress={() => updateFormData("gender", "Male")}
          >
            <View style={styles.genderRadio}>
              {formData.gender === "Male" && (
                <View style={styles.genderRadioSelected} />
              )}
            </View>
            <Text
              style={[
                styles.genderText,
                formData.gender === "Male" && styles.genderTextSelected,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderOption,
              formData.gender === "Other" && styles.genderOptionSelected,
            ]}
            onPress={() => updateFormData("gender", "Other")}
          >
            <View style={styles.genderRadio}>
              {formData.gender === "Other" && (
                <View style={styles.genderRadioSelected} />
              )}
            </View>
            <Text
              style={[
                styles.genderText,
                formData.gender === "Other" && styles.genderTextSelected,
              ]}
            >
              Other
            </Text>
          </TouchableOpacity>
        </View>

        {/* National ID Number */}
        <Text style={styles.label}>National ID Number *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="CM12345678901234"
            value={formData.nationalId}
            onChangeText={(text) => updateFormData("nationalId", text)}
            maxLength={16}
          />
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton} // REMOVE the conditional style
          onPress={handleNextPress} // REMOVE the disabled prop
        ></TouchableOpacity>

        {/* Footer Note */}
        <Text style={styles.footerNote}>Fields marked with * are required</Text>
      </ScrollView>
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
  stepActive: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  stepInactive: {
    flex: 1,
    backgroundColor: "#E0E0E0",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
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
  genderContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 12,
  },
  genderOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F0F9F0",
  },
  genderRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  genderRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  genderText: {
    fontSize: 16,
    color: "#666666",
  },
  genderTextSelected: {
    color: colors.primary,
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
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
});
