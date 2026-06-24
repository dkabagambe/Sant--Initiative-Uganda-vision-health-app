/**
 * Normalize Ugandan phone number for API calls.
 * Returns canonical local format: 0XXXXXXXXX
 */
export function normalizePhoneForApi(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  let national = digits;
  if (national.startsWith("256")) national = national.slice(3);
  if (national.startsWith("0")) national = national.slice(1);
  if (national.length !== 9) return "";
  return `0${national}`;
}
