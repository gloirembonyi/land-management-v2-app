import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { certificateHash, protectField, revealParcel } from "@/lib/parcels";
import { nextCertificateId } from "@/lib/adminSession";

// Fields an owner (or buyer completing a transfer) may change; verification fields are admin-only.
const OWNER_FIELDS = ["status", "price", "ownerName", "userId", "ownerHistory", "imageUrl", "documents", "coordinates", "partners", "children", "use", "size", "location"] as const;
const VERIFICATION_STATUSES = ["Verified", "Rejected"];

export async function GET(request: Request, { params }: { params: Promise<{ upi: string }> }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { upi } = await params;
    const parcel = await prisma.parcel.findUnique({ where: { upi: decodeURIComponent(upi) } });
    if (!parcel) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }
    return NextResponse.json({ ...revealParcel(parcel), certificateHash: certificateHash(parcel) });
  } catch (error) {
    console.error("GET parcel error:", error);
    return NextResponse.json({ error: "Failed to fetch parcel" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ upi: string }> }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { upi: rawUpi } = await params;
    const upi = decodeURIComponent(rawUpi);
    const body = await request.json();

    const current = await prisma.parcel.findUnique({ where: { upi } });
    if (!current) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    // A completed transfer marks the parcel "Verified" again under its new owner; that is allowed
    // when the parcel already holds a certificate (it was verified before being sold).
    const isTransferCompletion =
      auth.role !== "ADMIN" && body.status === "Verified" && !!body.ownerName && !!current.certificateId && current.isVerified;
    const wantsVerification = !isTransferCompletion && (body.isVerified === true || VERIFICATION_STATUSES.includes(body.status));
    if (wantsVerification && auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only NLA administrators can verify parcels" }, { status: 403 });
    }

    const data: Record<string, unknown> = {};
    for (const f of OWNER_FIELDS) if (body[f] !== undefined) data[f] = body[f];
    if (data.partners !== undefined) data.partners = protectField(data.partners);
    if (data.children !== undefined) data.children = protectField(data.children);
    if (typeof data.ownerHistory === "object" && data.ownerHistory !== null) data.ownerHistory = JSON.stringify(data.ownerHistory);
    if (typeof data.coordinates === "object" && data.coordinates !== null) data.coordinates = JSON.stringify(data.coordinates);

    if (wantsVerification && auth.role === "ADMIN") {
      if (body.status === "Rejected") {
        data.status = "Rejected";
        data.isVerified = false;
      } else {
        data.status = "Verified";
        data.isVerified = true;
        data.verifiedAt = new Date();
        if (!current.certificateId) {
          data.certificateId = await nextCertificateId();
        }
      }
    } else if (isTransferCompletion) {
      data.status = "Verified";
      data.verifiedAt = new Date();
    }

    const parcel = await prisma.parcel.update({ where: { upi }, data });
    return NextResponse.json({ ...revealParcel(parcel), certificateHash: certificateHash(parcel) });
  } catch (error) {
    console.error("PATCH parcel error:", error);
    return NextResponse.json({ error: "Failed to update parcel" }, { status: 500 });
  }
}
