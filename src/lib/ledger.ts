import { sha256 } from "@/lib/encryption";

export const GENESIS_HASH = "0x" + "0".repeat(64);

interface LedgerFields {
  previousHash: string | null;
  blockNumber: number | null;
  upi: string;
  type: string;
  sellerName: string | null;
  buyerName: string | null;
  price: string | null;
  date: string;
}

/** Hash of one ledger record; each record includes the hash of the previous record of the same parcel. */
export function computeTxHash(t: LedgerFields): string {
  return "0x" + sha256([t.previousHash ?? GENESIS_HASH, t.blockNumber ?? 0, t.upi, t.type, t.sellerName ?? "", t.buyerName ?? "", t.price ?? "", t.date].join("|"));
}

export interface ChainCheck {
  valid: boolean;
  blocks: number;
  brokenAt?: number;
  reason?: string;
}

/** Verifies the hash chain of one parcel's transactions (oldest first). */
export function verifyChain(records: (LedgerFields & { txHash: string | null })[]): ChainCheck {
  let expectedPrevious = GENESIS_HASH;
  for (const r of records) {
    if ((r.previousHash ?? GENESIS_HASH) !== expectedPrevious) {
      return { valid: false, blocks: records.length, brokenAt: r.blockNumber ?? 0, reason: "Previous-hash link does not match the preceding record" };
    }
    // Records created with the SHA-256 ledger (66-character hashes) are recomputed and compared.
    if (r.txHash && r.txHash.length === 66 && computeTxHash(r) !== r.txHash) {
      return { valid: false, blocks: records.length, brokenAt: r.blockNumber ?? 0, reason: "Record content was modified after it was written" };
    }
    expectedPrevious = r.txHash ?? expectedPrevious;
  }
  return { valid: true, blocks: records.length };
}
