export const Validation = {
  validatePhone: (phone: string): { isValid: boolean; message?: string } => {
    const cleaned = phone.replace(/\D/g, "");

    if (!cleaned)
      return { isValid: false, message: "Phone number is required" };
    if (cleaned.length !== 9)
      return { isValid: false, message: "Phone number must be 9 digits" };

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
