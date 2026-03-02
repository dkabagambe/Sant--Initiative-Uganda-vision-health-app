import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import RoleTabs from "../../components/RoleTabs";
import AppButton from "../../components/AppButton";
import { apiService } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

type RootStackParamList = {
  Login: undefined;
  RoleSelection: undefined;
  OTP: { phone: string; role: string };
  Register: undefined;
  CHWRegistrationStep1: undefined;
  OutletRegistrationStep1: undefined;
  VSLARegistrationStep1: undefined;
  AppTabs: { role: string };
};

type RoleLoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function RoleLoginScreen() {
  const [role, setRole] = useState<"CHW" | "Outlet" | "VSLA">("CHW");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const navigation = useNavigation<RoleLoginScreenNavigationProp>();
  const { language, setLanguage, t } = useLanguage();

  const handleRoleChange = (newRole: string) => {
    if (newRole === "CHW" || newRole === "Outlet" || newRole === "VSLA") {
      setRole(newRole);
    }
  };

  const handleSendOTP = async () => {
    setPhoneError(null);
    
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 9) {
      setPhoneError("Phone number must be 9 digits");
      return;
    }

    const fullPhone = `0${cleaned}`;
    setIsLoading(true);

    try {
      const result = await apiService.login(fullPhone);
      if (result.success) {
        Alert.alert(
          "OTP Sent", 
          "Please check your phone for the verification code.",
          [{ text: "OK", onPress: () => navigation.navigate("OTP", { phone: fullPhone, role }) }]
        );
      } else {
        const errorMsg = result.error || "Failed to send OTP";
        if (errorMsg.includes("blocked") || errorMsg.includes("fraudulent")) {
          Alert.alert("Number Blocked", "This phone number is temporarily blocked. Please contact support or use a different number.");
        } else if (result.code === "NOT_REGISTERED" || errorMsg.toLowerCase().includes("not registered")) {
          Alert.alert(
            "Not Registered",
            "This phone number is not registered. Please register first (CHW, Outlet, or VSLA), then you can log in with OTP.",
            [
              { text: "OK" },
              { text: "Register", onPress: () => navigation.navigate("RoleSelection") },
            ]
          );
        } else {
          Alert.alert("Error", errorMsg);
        }
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.error;
      const code = error?.response?.data?.code;
      if (code === "NOT_REGISTERED" || (errMsg && String(errMsg).toLowerCase().includes("not registered"))) {
        Alert.alert(
          "Not Registered",
          "This phone number is not registered. Please register first (CHW, Outlet, or VSLA), then you can log in with OTP.",
          [
            { text: "OK" },
            { text: "Register", onPress: () => navigation.navigate("RoleSelection") },
          ]
        );
      } else {
        Alert.alert("Error", errMsg || "Failed to connect to server. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate("RoleSelection");
  };

  const formatPhoneInput = (text: string) => {
    let digits = text.replace(/\D/g, "");
    if (digits.length > 9) {
      digits = digits.substring(0, 9);
    }
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.substring(0, 3)} ${digits.substring(3)}`;
    }
    setPhone(formatted);
    if (phoneError && text.length > 0) {
      setPhoneError(null);
    }
  };

  const handlePhoneSubmit = () => {
    handleSendOTP();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
        {/* Logo */}
        <View style={styles.logoBox}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{t("appTitle")}</Text>
        <Text style={styles.subtitle}>
          {t("appSubtitle")}
        </Text>

        {/* User Type Selection */}
        <RoleTabs value={role} onChange={handleRoleChange} />

        {/* Phone Number Section */}
        <Text style={styles.label}>{t("phoneNumber")}</Text>
        <View
          style={[styles.phoneRow, phoneError ? styles.phoneRowError : null]}
        >
          <View style={styles.phoneIconBox}>
            <Ionicons
              name="call-outline"
              size={18}
              color={phoneError ? "#EF4444" : "#666"}
            />
            <Text
              style={[
                styles.countryCode,
                phoneError ? styles.countryCodeError : null,
              ]}
            >
              +256
            </Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="700 123 456"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={formatPhoneInput}
            onSubmitEditing={handlePhoneSubmit}
            returnKeyType="done"
            maxLength={11}
            editable={!isLoading}
          />
        </View>

        {/* Error Message */}
        {phoneError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{phoneError}</Text>
          </View>
        )}

        <Text style={styles.helperText}>
          {t("enterPhone")}
        </Text>

        {/* Send OTP Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!phone.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendOTP}
          disabled={!phone.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>{t("sendOTP")}</Text>
          )}
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegisterPress}
        >
          <Text style={styles.registerButtonText}>
            {t("registerAsCHW")}
          </Text>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="eye-outline" size={16} color="#1E40AF" />
          <Text style={styles.infoText}>
            {t("forCHWDescription")}
          </Text>
        </View>

        {/* Offline Badge */}
        <View style={styles.offlineBadge}>
          <Ionicons name="cloud-offline-outline" size={14} color="#666" />
          <Text style={styles.offlineText}>{t("worksOffline")}</Text>
        </View>

        {/* Language Buttons */}
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[styles.langButton, language === "en" && styles.langButtonActive]}
            onPress={() => setLanguage("en")}
          >
            <Text style={[styles.langText, language === "en" && styles.langTextActive]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langButton, language === "lg" && styles.langButtonActive]}
            onPress={() => setLanguage("lg")}
          >
            <Text style={[styles.langText, language === "lg" && styles.langTextActive]}>
              Luganda
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Santé Initiative Uganda © 2026</Text>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF8",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  langButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  langButtonActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  langText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  langTextActive: {
    color: "#FFFFFF",
  },
  logoBox: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    color: "#666",
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  phoneRowError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  phoneIconBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderColor: "#EEE",
    backgroundColor: "#F3F4F6",
  },
  countryCode: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginLeft: 6,
  },
  countryCodeError: {
    color: "#EF4444",
  },
  phoneInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginLeft: 4,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2E7D32",
    marginBottom: 12,
  },
  registerButtonText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EAF2FF",
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 12,
    color: "#1E40AF",
    flex: 1,
    lineHeight: 16,
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  offlineText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
});
