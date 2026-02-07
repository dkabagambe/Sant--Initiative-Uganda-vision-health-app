import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// Update RootStackParamList to include AppTabs
type RootStackParamList = {
  OTP: { phone: string; role: string };
  AppTabs: { role: string };
  Login: undefined;
};

type OTPScreenRouteProp = RouteProp<RootStackParamList, "OTP">;
type OTPScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "OTP"
>;

// Simple validation for 4-digit OTP
const Validation = {
  validateOTP: (otp: string): { isValid: boolean; message?: string } => {
    if (!otp) return { isValid: false, message: "OTP is required" };
    if (otp.length !== 4)
      return { isValid: false, message: "OTP must be 4 digits" };
    if (!/^\d+$/.test(otp))
      return { isValid: false, message: "OTP must contain only numbers" };
    return { isValid: true };
  },
};

// Simple OTP verification
const OTPService = {
  verifyOTP: async (
    phone: string,
    userOTP: string,
  ): Promise<{
    success: boolean;
    message: string;
    token?: string;
  }> => {
    try {
      console.log(`Verifying OTP ${userOTP} for ${phone}`);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo, always succeed with any 4-digit code
      return {
        success: true,
        message: "OTP verified successfully",
        token: `demo_token_${Date.now()}`,
      };
    } catch (error) {
      console.error("OTP verification error:", error);
      return { success: false, message: "Verification failed" };
    }
  },

  resendOTP: async (
    phone: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`Resending OTP to ${phone}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, message: "New OTP sent via SMS" };
    } catch (error) {
      return { success: false, message: "Failed to resend OTP" };
    }
  },
};

export default function OTPScreen() {
  const route = useRoute<OTPScreenRouteProp>();
  const navigation = useNavigation<OTPScreenNavigationProp>();
  const { phone, role } = route.params;

  // Change to 4-digit OTP
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create refs for 4 OTP input fields
  const inputRefs = useRef<(TextInput | null)[]>(Array(4).fill(null));

  // Format phone for display as shown in design
  const formattedPhone = `+256 ${phone.substring(0, 3)} ${phone.substring(3, 6)} ${phone.substring(6)}`;

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, canResend]);

  // Handle OTP digit input (4-digit)
  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user types
    if (errorMessage) {
      setErrorMessage(null);
    }

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if last digit entered
    if (value && index === 3) {
      inputRefs.current[index]?.blur();
      setTimeout(() => handleVerifyOTP(), 100);
    }
  };

  // Handle backspace
  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move focus to previous input
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpString = otp.join("");

    // Validate OTP format (4 digits)
    const validation = Validation.validateOTP(otpString);
    if (!validation.isValid) {
      setErrorMessage(validation.message || "Invalid OTP");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await OTPService.verifyOTP(phone, otpString);

      if (result.success) {
        // Navigate directly to AppTabs with the role
        navigation.navigate("AppTabs", { role: role });
      } else {
        setErrorMessage(result.message);

        // If no attempts left, clear OTP
        if (
          result.message.includes("No attempts") ||
          result.message.includes("expired")
        ) {
          setOtp(["", "", "", ""]);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (error) {
      setErrorMessage("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setErrorMessage(null);

    try {
      const result = await OTPService.resendOTP(phone);

      if (result.success) {
        Alert.alert(
          "OTP Resent",
          "A new OTP has been sent to your phone via SMS.",
        );

        // Reset OTP fields and countdown
        setOtp(["", "", "", ""]);
        setCountdown(60);
        setCanResend(false);
        inputRefs.current[0]?.focus();
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  // Go back to login (Change Phone Number)
  const handleChangePhone = () => {
    navigation.goBack();
  };

  // Handle focus on OTP input
  const handleOtpFocus = (index: number) => {
    // Clear from current position onward
    const newOtp = [...otp];
    let shouldClear = false;

    for (let i = index; i < 4; i++) {
      if (shouldClear || newOtp[i]) {
        newOtp[i] = "";
        shouldClear = true;
      }
    }

    if (shouldClear) {
      setOtp(newOtp);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
        <Text style={styles.title}>Santé Initiative Uganda</Text>
        <Text style={styles.subtitle}>
          Bringing vision health services closer to communities
        </Text>

        {/* OTP Sent Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.otpSentText}>OTP sent to {formattedPhone}</Text>
          <Text style={styles.instructionText}>
            Enter the 4-digit code sent via SMS
          </Text>
        </View>

        {/* OTP Input Label */}
        <Text style={styles.otpLabel}>Enter OTP</Text>

        {/* 4-Digit OTP Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={`otp-input-${index}`}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : styles.otpBoxEmpty,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => handleOtpFocus(index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              editable={!loading}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Verify & Login Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otp.join("").length !== 4 || loading) &&
                styles.verifyButtonDisabled,
            ]}
            onPress={handleVerifyOTP}
            disabled={otp.join("").length !== 4 || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify & Login</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Resend OTP Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.resendButton,
              (!canResend || resendLoading) && styles.resendButtonDisabled,
            ]}
            onPress={handleResendOTP}
            disabled={!canResend || resendLoading}
          >
            {resendLoading ? (
              <ActivityIndicator size="small" color="#1E40AF" />
            ) : (
              <Text style={styles.resendButtonText}>
                {canResend ? "Resend OTP" : `Resend OTP (${countdown}s)`}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Change Phone Number Link */}
        <TouchableOpacity
          style={styles.changePhoneContainer}
          onPress={handleChangePhone}
        >
          <Text style={styles.changePhoneText}>Change Phone Number</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <Text style={styles.offlineText}>Works offline for screening</Text>
        </View>

        {/* Language Switch */}
        <View style={styles.languageRow}>
          <TouchableOpacity style={styles.langActive}>
            <Text style={styles.langActiveText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.langInactive}>
            <Text style={styles.langInactiveText}>Luganda</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Santé Initiative Uganda © 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF8",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginTop: 4,
    marginBottom: 32,
    lineHeight: 20,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  otpSentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    fontSize: 24,
    fontWeight: "600",
    borderWidth: 2,
  },
  otpBoxEmpty: {
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    color: "#333",
  },
  otpBoxFilled: {
    borderColor: "#1E40AF",
    backgroundColor: "#fff",
    color: "#1E40AF",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginLeft: 6,
    fontWeight: "500",
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#1E40AF",
  },
  resendButtonDisabled: {
    borderColor: "#93C5FD",
  },
  resendButtonText: {
    color: "#1E40AF",
    fontSize: 16,
    fontWeight: "600",
  },
  changePhoneContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  changePhoneText: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  divider: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  offlineText: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  langActive: {
    backgroundColor: "#1E40AF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  langActiveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  langInactive: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  langInactiveText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  footerText: {
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 12,
  },
});
