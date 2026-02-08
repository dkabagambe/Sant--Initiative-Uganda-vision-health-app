// This service might be redundant now because we are using the apiService for OTP.
// But if it exists, we can update it to use the API.

import { apiService } from "./api";

export const otpService = {
  async sendOTP(phoneNumber: string) {
    return apiService.login(phoneNumber);
  },

  async verifyOTP(phoneNumber: string, otp: string, name?: string) {
    return apiService.verifyOTP(phoneNumber, otp, name);
  },
};
