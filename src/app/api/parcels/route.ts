import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { certificateHash, protectField, revealParcel } from "@/lib/parcels";

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const ownerName = searchParams.get("ownerName");
    const status = searchParams.get("status");

    const whereClause: Record<string, unknown> = {};
    if (ownerName) whereClause.ownerName = { equals: ownerName, mode: "insensitive" };
    if (status) whereClause.status = { equals: status, mode: "insensitive" };

    const parcels = await prisma.parcel.findMany({ where: whereClause, orderBy: { createdAt: "desc" } });
    return NextResponse.json(parcels.map((p) => ({ ...revealParcel(p), certificateHash: certificateHash(p) })));
  } catch (error) {
    const err = error as Error;
    console.error("GET parcels error:", err);
    return NextResponse.json({ error: "Failed to fetch parcels", details: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (!body.upi || !body.size || !body.use || !body.district) {
      return NextResponse.json({ error: "UPI, size, land use and district are required" }, { status: 400 });
    }
    const existing = await prisma.parcel.findUnique({ where: { upi: body.upi } });
    if (existing) {
      return NextResponse.json({ error: "A parcel with this UPI is already registered" }, { status: 409 });
    }

    const parcel = await prisma.parcel.create({
      data: {
        upi: body.upi,
        size: body.size,
        use: body.use,
        district: body.district,
        sector: body.sector || null,
        cell: body.cell || null,
        village: body.village || null,
        location: body.location,
        status: "Pending Verification",
        ownerName: body.ownerName,
        imageUrl: body.imageUrl,
        price: body.price || null,
        coordinates: body.coordinates ? (typeof body.coordinates === "string" ? body.coordinates : JSON.stringify(body.coordinates)) : null,
        documents: body.documents ? JSON.stringify(body.documents) : null,
        partners: protectField(body.partners),
        children: protectField(body.children),
        userId: body.userId || auth.userId,
      },
    });
    return NextResponse.json(revealParcel(parcel), { status: 201 });
  } catch (error) {
    console.error("POST parcel error:", error);
    return NextResponse.json({ error: "Failed to create parcel" }, { status: 500 });
  }
}
