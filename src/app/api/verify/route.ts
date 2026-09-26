import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { certificateHash } from "@/lib/parcels";
import { verifyChain } from "@/lib/ledger";

/**
 * Public certificate verification used by the QR scanner.
 * GET /api/verify?upi=...&certId=...&hash=...
 * A certificate is authentic when it exists, belongs to the parcel, and its fingerprint matches the
 * current registry record (owner, certificate number and verification date).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const upi = searchParams.get("upi");
    const certId = searchParams.get("certId");
    const hash = searchParams.get("hash");

    if (!upi) {
      return NextResponse.json({ authentic: false, reason: "The QR code does not contain a parcel UPI" }, { status: 400 });
    }

    const parcel = await prisma.parcel.findUnique({ where: { upi } });
    if (!parcel) {
      return NextResponse.json({ authentic: false, reason: "No parcel with this UPI exists in the registry" }, { status: 404 });
    }

    const expected = certificateHash(parcel);
    const reasons: string[] = [];
    if (!parcel.isVerified || !parcel.certificateId) reasons.push("The parcel has not been verified by the National Land Authority");
    if (certId && parcel.certificateId && certId !== parcel.certificateId) reasons.push("The certificate number does not match the registry");
    if (hash && expected && hash !== expected) reasons.push("The certificate is outdated or has been altered (ownership may have changed)");

    const transactions = await prisma.transaction.findMany({ where: { upi }, orderBy: { createdAt: "asc" } });
    const chain = verifyChain(transactions);
    if (!chain.valid) reasons.push("The parcel's transaction history failed the integrity check");

    const openDisputes = await prisma.dispute.count({ where: { upi, NOT: { status: { in: ["Resolved", "RESOLVED"] } } } });

    return NextResponse.json({
      authentic: reasons.length === 0,
      reasons,
      parcel: {
        upi: parcel.upi,
        ownerName: parcel.ownerName,
        size: parcel.size,
        use: parcel.use,
        location: parcel.location,
        district: parcel.district,
        status: parcel.status,
        certificateId: parcel.certificateId,
        verifiedAt: parcel.verifiedAt,
      },
      ledger: chain,
      openDisputes,
    });
  } catch (error) {
    console.error("GET verify error:", error);
    return NextResponse.json({ authentic: false, reason: "Verification service error" }, { status: 500 });
  }
}
