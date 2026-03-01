/**
 * Normalize Ugandan phone number for API calls.
 * Converts "700123456", "0780123456", "256700123456" to "256700123456"
 */
export function normalizePhoneForApi(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  // Already has country code
  if (digits.startsWith("256")) return digits;
  // Local format 0780... or 700...
  if (digits.startsWith("0")) return "256" + digits.slice(1);
  return "256" + digits;
}
