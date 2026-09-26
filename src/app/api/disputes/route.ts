import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const reportedById = searchParams.get("reportedById");
    const district = searchParams.get("district");
    const assignedAbunziId = searchParams.get("assignedAbunziId");

    const disputes = await prisma.dispute.findMany({
      where: {
        ...(reportedById ? { reportedById } : {}),
        ...(assignedAbunziId ? { assignedAbunziId } : {}),
        ...(district ? { district: { equals: district, mode: "insensitive" } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(disputes);
  } catch (error) {
    console.error("GET disputes error:", error);
    return NextResponse.json({ error: "Failed to fetch disputes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (!body.upi || !body.type || !body.description) {
      return NextResponse.json({ error: "UPI, dispute type and description are required" }, { status: 400 });
    }

    // Route the case to a verified Abunzi mediator of the same village, then cell, then sector.
    let assignedAbunziId: string | null = null;
    for (const level of ["village", "cell", "sector"] as const) {
      if (!body[level]) continue;
      const abunzi = await prisma.user.findFirst({ where: { role: "ABUNZI", isVerified: true, [level]: body[level] } });
      if (abunzi) {
        assignedAbunziId = abunzi.id;
        break;
      }
    }

    const dispute = await prisma.dispute.create({
      data: {
        upi: body.upi,
        type: body.type,
        status: "Investigation",
        dateOpened: body.dateOpened || new Date().toISOString().slice(0, 10),
        parties: body.parties || "",
        description: body.description,
        location: body.location || "",
        district: body.district || null,
        sector: body.sector || null,
        cell: body.cell || null,
        village: body.village || null,
        assignedAbunziId,
        reportedById: auth.userId,
      },
    });
    return NextResponse.json(dispute, { status: 201 });
  } catch (error) {
    console.error("POST dispute error:", error);
    return NextResponse.json({ error: "Failed to create dispute" }, { status: 500 });
  }
}
