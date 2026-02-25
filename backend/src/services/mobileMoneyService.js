const axios = require("axios");

const normalizePhone = (phoneNumber) => {
  if (!phoneNumber) return "";
  if (phoneNumber.startsWith("+")) return phoneNumber;
  if (phoneNumber.startsWith("0")) return `+256${phoneNumber.slice(1)}`;
  return `+256${phoneNumber}`;
};

exports.initiateCollection = async ({
  provider,
  amount,
  currency = "UGX",
  phoneNumber,
  externalReference,
  payerMessage,
}) => {
  const normalizedProvider = (provider || "mtn").toLowerCase();
  const formattedPhone = normalizePhone(phoneNumber);

  // Development fallback when provider credentials are missing.
  if (
    !process.env.MTN_MOMO_BASE_URL &&
    !process.env.AIRTEL_MONEY_BASE_URL
  ) {
    return {
      success: true,
      provider: normalizedProvider,
      providerReference: externalReference,
      providerStatus: "PENDING",
      mode: "mock",
    };
  }

  try {
    if (normalizedProvider === "mtn") {
      const baseUrl = process.env.MTN_MOMO_BASE_URL;
      const apiKey = process.env.MTN_MOMO_API_KEY;
      const token = process.env.MTN_MOMO_ACCESS_TOKEN;
      if (!baseUrl || !apiKey || !token) {
        throw new Error("MTN MoMo credentials are incomplete");
      }

      await axios.post(
        `${baseUrl}/collection/v1_0/requesttopay`,
        {
          amount: String(amount),
          currency,
          externalId: externalReference,
          payer: { partyIdType: "MSISDN", partyId: formattedPhone.replace("+", "") },
          payerMessage: payerMessage || "Santé Initiative payment request",
          payeeNote: "Vision health payment",
        },
        {
          headers: {
            "X-Reference-Id": externalReference,
            "X-Target-Environment": process.env.MTN_MOMO_ENV || "sandbox",
            "Ocp-Apim-Subscription-Key": apiKey,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return {
        success: true,
        provider: "mtn",
        providerReference: externalReference,
        providerStatus: "PENDING",
        mode: "live",
      };
    }

    if (normalizedProvider === "airtel") {
      const baseUrl = process.env.AIRTEL_MONEY_BASE_URL;
      const token = process.env.AIRTEL_MONEY_ACCESS_TOKEN;
      const clientId = process.env.AIRTEL_MONEY_CLIENT_ID;
      if (!baseUrl || !token || !clientId) {
        throw new Error("Airtel Money credentials are incomplete");
      }

      await axios.post(
        `${baseUrl}/merchant/v1/payments/`,
        {
          reference: externalReference,
          subscriber: {
            country: "UG",
            currency,
            msisdn: formattedPhone.replace("+", ""),
          },
          transaction: {
            amount: String(amount),
            country: "UG",
            currency,
            id: externalReference,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Country": "UG",
            "X-Currency": currency,
            "Content-Type": "application/json",
            "X-Client-Id": clientId,
          },
        },
      );

      return {
        success: true,
        provider: "airtel",
        providerReference: externalReference,
        providerStatus: "PENDING",
        mode: "live",
      };
    }

    throw new Error(`Unsupported provider: ${provider}`);
  } catch (error) {
    return {
      success: false,
      provider: normalizedProvider,
      error: error.message || "Failed to initiate collection",
    };
  }
};

