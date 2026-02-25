const crypto = require("crypto");

const getHeaderValue = (headers, keys = []) => {
  for (const key of keys) {
    const value = headers[key.toLowerCase()];
    if (value) return String(value);
  }
  return "";
};

const safeEqual = (a, b) => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

const statusToInternal = (providerStatus = "") => {
  const normalized = String(providerStatus).toLowerCase();
  if (
    ["success", "successful", "completed", "approved", "ts", "paid"].includes(
      normalized,
    )
  ) {
    return "completed";
  }
  if (
    ["failed", "rejected", "cancelled", "error", "failed_ts", "declined"].includes(
      normalized,
    )
  ) {
    return "failed";
  }
  return "pending";
};

exports.validateWebhookSignature = (provider, req) => {
  const normalizedProvider = (provider || "").toLowerCase();
  const rawPayload = req.rawBody || JSON.stringify(req.body || {});
  const headers = req.headers || {};

  const envByProvider = {
    mtn: process.env.MTN_MOMO_WEBHOOK_SECRET,
    airtel: process.env.AIRTEL_MONEY_WEBHOOK_SECRET,
  };
  const secret = envByProvider[normalizedProvider];

  const signatureHeadersByProvider = {
    mtn: ["x-signature", "x-momo-signature", "x-mtn-signature"],
    airtel: ["x-signature", "x-airtel-signature", "x-callback-signature"],
  };
  const receivedSignature = getHeaderValue(
    headers,
    signatureHeadersByProvider[normalizedProvider] || ["x-signature"],
  );

  // In production, reject if secret or signature is missing.
  if (process.env.NODE_ENV === "production") {
    if (!secret) {
      return { valid: false, reason: "Missing webhook secret configuration" };
    }
    if (!receivedSignature) {
      return { valid: false, reason: "Missing webhook signature header" };
    }
  }

  // In non-production, allow missing secret/signature (useful for sandbox/dev).
  if (!secret || !receivedSignature) {
    return {
      valid: true,
      reason: "Signature skipped in non-production",
      skipped: true,
    };
  }

  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawPayload)
    .digest("hex");

  const normalizedReceived = receivedSignature.replace(/^sha256=/i, "").trim();
  const valid = safeEqual(computed, normalizedReceived);
  return { valid, reason: valid ? "OK" : "Invalid signature" };
};

exports.mapProviderCallback = (provider, payload = {}) => {
  const normalizedProvider = (provider || "").toLowerCase();

  if (normalizedProvider === "mtn") {
    const reference =
      payload.externalId ||
      payload.external_id ||
      payload.referenceId ||
      payload.reference_id ||
      payload.financialTransactionId ||
      payload.id ||
      payload.reference;
    const providerStatus =
      payload.status ||
      payload.result ||
      payload.resultCode ||
      payload.reason;
    return {
      reference,
      providerStatus: providerStatus || "PENDING",
      internalStatus: statusToInternal(providerStatus || "PENDING"),
      failureReason: payload.reason || payload.message || null,
    };
  }

  if (normalizedProvider === "airtel") {
    const reference =
      payload.reference ||
      payload.txn_id ||
      payload.transaction_id ||
      payload.transactionId ||
      payload?.data?.transaction?.id ||
      payload?.data?.transaction?.reference ||
      payload.id;
    const providerStatus =
      payload.status ||
      payload.payment_status ||
      payload?.data?.status ||
      payload?.data?.transaction?.status ||
      payload?.status?.code;
    const reason =
      payload.reason ||
      payload.message ||
      payload?.status?.message ||
      payload?.data?.message ||
      null;
    return {
      reference,
      providerStatus: providerStatus || "PENDING",
      internalStatus: statusToInternal(providerStatus || "PENDING"),
      failureReason: reason,
    };
  }

  // Generic fallback
  const reference =
    payload.reference ||
    payload.externalId ||
    payload.external_id ||
    payload.transactionId ||
    payload.transaction_id ||
    payload.id;
  const providerStatus =
    payload.status || payload.result || payload.paymentStatus || "PENDING";

  return {
    reference,
    providerStatus,
    internalStatus: statusToInternal(providerStatus),
    failureReason: payload.reason || payload.message || null,
  };
};

