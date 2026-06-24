/**
 * Canonical Ugandan mobile: 0XXXXXXXXX (10 digits, leading 0).
 * Accepts 0700123456, 256700123456, +256700123456, 700123456, etc.
 */
const getNationalDigits = (phoneNumber) => {
  const digits = String(phoneNumber || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("256")) return digits.slice(3);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
};

const toCanonicalPhone = (phoneNumber) => {
  const national = getNationalDigits(phoneNumber);
  if (national.length !== 9) return "";
  return `0${national}`;
};

/** All common stored/login variants for the same subscriber number */
const phoneLookupVariants = (phoneNumber) => {
  const national = getNationalDigits(phoneNumber);
  if (national.length !== 9) return [];

  const canonical = `0${national}`;
  const set = new Set([
    canonical,
    national,
    `256${national}`,
    `+256${national}`,
    `256 ${national}`,
    `+256 ${national}`,
  ]);

  return Array.from(set);
};

const phonesMatch = (a, b) => {
  const na = getNationalDigits(a);
  const nb = getNationalDigits(b);
  return na.length === 9 && nb.length === 9 && na === nb;
};

module.exports = {
  getNationalDigits,
  toCanonicalPhone,
  phoneLookupVariants,
  phonesMatch,
};
