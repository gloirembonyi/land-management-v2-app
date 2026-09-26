/**
 * Validation of Rwandan national identification numbers (16 digits).
 * Structure: 1 (nationality: 1 = Rwandan citizen) · YYYY (birth year) ·
 * 7/8 (sex: 8 = male, 7 = female) · 7-digit birth-order sequence · 1 issue digit · 2-digit check.
 */
export interface NidaResult {
  valid: boolean;
  nationalId: string;
  birthYear?: number;
  sex?: "Male" | "Female";
  error?: string;
}

const LEGACY_KEY = "ubutaka-secure-key-2026";

/** Older app versions sent the ID XOR/Base64-encoded; recover the digits if so. */
function decodeLegacy(value: string): string {
  try {
    const data = Buffer.from(value, "base64").toString("latin1");
    let out = "";
    for (let i = 0; i < data.length; i++) out += String.fromCharCode(data.charCodeAt(i) ^ LEGACY_KEY.charCodeAt(i % LEGACY_KEY.length));
    return out;
  } catch {
    return value;
  }
}

export function normalizeNationalId(raw: unknown): string {
  const value = String(raw ?? "").replace(/\s+/g, "");
  if (/^\d{16}$/.test(value)) return value;
  const decoded = decodeLegacy(value).replace(/\s+/g, "");
  return /^\d{16}$/.test(decoded) ? decoded : value;
}

export function validateNationalId(raw: unknown): NidaResult {
  const nationalId = normalizeNationalId(raw);
  if (!/^\d{16}$/.test(nationalId)) {
    return { valid: false, nationalId, error: "National ID must contain exactly 16 digits" };
  }
  if (nationalId[0] !== "1") {
    return { valid: false, nationalId, error: "National ID must start with 1 (Rwandan citizen)" };
  }
  const birthYear = Number(nationalId.slice(1, 5));
  const thisYear = new Date().getFullYear();
  if (birthYear < 1900 || birthYear > thisYear - 16) {
    return { valid: false, nationalId, error: "National ID contains an invalid year of birth" };
  }
  const sexDigit = nationalId[5];
  if (sexDigit !== "7" && sexDigit !== "8") {
    return { valid: false, nationalId, error: "National ID contains an invalid sex digit" };
  }
  return { valid: true, nationalId, birthYear, sex: sexDigit === "8" ? "Male" : "Female" };
}
