export const Validation = {
  validatePhone: (phone: string): { isValid: boolean; message?: string } => {
    let cleaned = phone.replace(/\D/g, "");

    if (!cleaned)
      return { isValid: false, message: "Phone number is required" };

    // Remove leading 0 if present (convert 0700123456 to 700123456)
    if (cleaned.startsWith("0") && cleaned.length === 10) {
      cleaned = cleaned.substring(1);
    }

    // Remove country code if present (convert 256700123456 to 700123456)
    if (cleaned.startsWith("256") && cleaned.length === 12) {
      cleaned = cleaned.substring(3);
    }

    if (cleaned.length !== 9)
      return { isValid: false, message: "Phone number must be 9 digits (e.g., 700123456)" };

    const prefix = cleaned.substring(0, 2);
    const validPrefixes = [
      "70",
      "71",
      "72",
      "73",
      "74",
      "75",
      "76",
      "77",
      "78",
      "79",
      "20",
      "39",
    ];

    if (!validPrefixes.includes(prefix)) {
      return { isValid: false, message: "Invalid Ugandan mobile number" };
    }

    return { isValid: true };
  },

  validateOTP: (otp: string): { isValid: boolean; message?: string } => {
    if (!otp) return { isValid: false, message: "OTP is required" };
    if (otp.length !== 6)
      return { isValid: false, message: "OTP must be 6 digits" };
    if (!/^\d+$/.test(otp))
      return { isValid: false, message: "OTP must contain only numbers" };

    return { isValid: true };
  },
};
