import AsyncStorage from "@react-native-async-storage/async-storage";

export const OTPService = {
  generateOTP: async (
    phone: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const otpData = {
        otp,
        phone,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0,
      };

      await AsyncStorage.setItem(`otp_${phone}`, JSON.stringify(otpData));

      console.log(`[DEV] OTP for ${phone}: ${otp}`);

      return { success: true, message: `OTP sent to ${phone}` };
    } catch (error) {
      console.error("OTP generation error:", error);
      return { success: false, message: "Failed to send OTP" };
    }
  },

  verifyOTP: async (
    phone: string,
    userOTP: string,
  ): Promise<{
    success: boolean;
    message: string;
    token?: string;
  }> => {
    try {
      const storedData = await AsyncStorage.getItem(`otp_${phone}`);
      if (!storedData) {
        return { success: false, message: "No OTP request found" };
      }

      const otpData = JSON.parse(storedData);

      if (Date.now() > otpData.expiresAt) {
        await AsyncStorage.removeItem(`otp_${phone}`);
        return { success: false, message: "OTP has expired" };
      }

      if (otpData.attempts >= 3) {
        await AsyncStorage.removeItem(`otp_${phone}`);
        return { success: false, message: "Too many failed attempts" };
      }

      if (otpData.otp === userOTP) {
        await AsyncStorage.removeItem(`otp_${phone}`);
        const mockToken = `auth_token_${Date.now()}_${phone}`;
        await AsyncStorage.setItem("auth_token", mockToken);

        return { success: true, message: "OTP verified", token: mockToken };
      } else {
        otpData.attempts += 1;
        await AsyncStorage.setItem(`otp_${phone}`, JSON.stringify(otpData));

        const remainingAttempts = 3 - otpData.attempts;
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining` : "No attempts"}`,
        };
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      return { success: false, message: "Verification failed" };
    }
  },

  resendOTP: async (
    phone: string,
  ): Promise<{ success: boolean; message: string }> => {
    await AsyncStorage.removeItem(`otp_${phone}`);
    return OTPService.generateOTP(phone);
  },
};
