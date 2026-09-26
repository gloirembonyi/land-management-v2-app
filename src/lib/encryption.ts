import crypto from "crypto";

/**
 * Field-level encryption at rest for sensitive parcel data (co-owners, heirs).
 * AES-256-GCM with a random 12-byte IV per value; the output format is
 *   enc:v1:<iv base64>:<auth tag base64>:<ciphertext base64>
 * Values written by the earlier XOR/Base64 scheme are still readable (see legacyDecode).
 */

const PREFIX = "enc:v1:";
const LEGACY_KEY = "ubutaka-secure-key-2026";

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("ENCRYPTION_KEY environment variable is required in production");
  }
  // Derive a fixed-length 256-bit key from the configured secret.
  return crypto.createHash("sha256").update(secret || "ubutaka-dev-only-encryption-key").digest();
}

export const isEncrypted = (value: string) => typeof value === "string" && value.startsWith(PREFIX);

export const encryptData = (data: string): string => {
  if (!data || isEncrypted(data)) return data;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
};

function legacyDecode(value: string): string {
  const data = Buffer.from(value, "base64").toString("latin1");
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ LEGACY_KEY.charCodeAt(i % LEGACY_KEY.length));
  }
  return result;
}

export const decryptData = (value: string): string => {
  if (!value) return value;
  if (isEncrypted(value)) {
    const [ivB64, tagB64, dataB64] = value.slice(PREFIX.length).split(":");
    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
  }
  // Plain JSON (never encrypted) is returned as is; otherwise try the legacy scheme.
  const trimmed = value.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) return value;
  try {
    const decoded = legacyDecode(value);
    return decoded.trim().startsWith("[") || decoded.trim().startsWith("{") ? decoded : value;
  } catch {
    return value;
  }
};

export const encryptObject = (obj: Record<string, unknown>, fields: string[]): Record<string, unknown> => {
  const newObj = { ...obj };
  fields.forEach((field) => {
    if (newObj[field] && typeof newObj[field] === "string") newObj[field] = encryptData(newObj[field] as string);
  });
  return newObj;
};

export const decryptObject = (obj: Record<string, unknown>, fields: string[]): Record<string, unknown> => {
  const newObj = { ...obj };
  fields.forEach((field) => {
    if (newObj[field] && typeof newObj[field] === "string") {
      try {
        newObj[field] = decryptData(newObj[field] as string);
      } catch {
        /* leave value untouched if it cannot be decrypted */
      }
    }
  });
  return newObj;
};

/** SHA-256 hex digest used for the tamper-evident transaction chain and certificates. */
export const sha256 = (input: string) => crypto.createHash("sha256").update(input).digest("hex");
