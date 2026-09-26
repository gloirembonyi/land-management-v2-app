import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const reportedById = searchParams.get("reportedById");
    const anomalies = await prisma.anomalyReport.findMany({
      where: reportedById ? { reportedById } : {},
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(anomalies);
  } catch (error) {
    console.error("GET anomalies error:", error);
    return NextResponse.json({ error: "Failed to fetch anomalies" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (!body.type || !body.description) {
      return NextResponse.json({ error: "Anomaly type and description are required" }, { status: 400 });
    }
    const anomaly = await prisma.anomalyReport.create({
      data: {
        upi: body.upi || null,
        type: body.type,
        description: body.description,
        imageUrl: body.imageUrl || null,
        location: body.location || null,
        latitude: typeof body.latitude === "number" ? body.latitude : null,
        longitude: typeof body.longitude === "number" ? body.longitude : null,
        reportedById: auth.userId,
        status: "PENDING",
      },
    });
    return NextResponse.json(anomaly, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error("POST anomaly error:", err);
    return NextResponse.json({ error: "Failed to create anomaly report", details: err.message }, { status: 500 });
  }
}
