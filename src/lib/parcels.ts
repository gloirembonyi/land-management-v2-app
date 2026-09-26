import { decryptData, encryptData, sha256 } from "@/lib/encryption";

const SENSITIVE = ["partners", "children"] as const;

/** Stores co-owner / heir lists encrypted (AES-256-GCM). Accepts arrays, JSON strings or legacy payloads. */
export function protectField(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  const text = typeof value === "string" ? decryptData(value) : JSON.stringify(value);
  return encryptData(text);
}

/** Returns a parcel with its protected fields decrypted for an authorised caller. */
export function revealParcel<T extends object>(parcel: T): T {
  const out: Record<string, unknown> = { ...(parcel as Record<string, unknown>) };
  for (const f of SENSITIVE) {
    if (typeof out[f] === "string" && out[f]) {
      try {
        out[f] = decryptData(out[f] as string);
      } catch {
        out[f] = null;
      }
    }
  }
  return out as T;
}

/**
 * Fingerprint embedded in the certificate QR code. It binds the UPI, certificate number,
 * current owner and verification date, so a certificate stops verifying once ownership changes.
 */
export function certificateHash(p: { upi: string; certificateId: string | null; ownerName: string; verifiedAt: Date | null }): string | null {
  if (!p.certificateId) return null;
  return sha256(`${p.upi}|${p.certificateId}|${p.ownerName}|${p.verifiedAt ? p.verifiedAt.toISOString() : ""}`);
}
