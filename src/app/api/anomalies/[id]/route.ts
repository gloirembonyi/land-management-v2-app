import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const STATUSES = ["PENDING", "INVESTIGATING", "RESOLVED", "DISMISSED"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: `Status must be one of ${STATUSES.join(", ")}` }, { status: 400 });
    }
    const anomaly = await prisma.anomalyReport.update({ where: { id }, data: { status: body.status } });
    return NextResponse.json(anomaly);
  } catch (error) {
    console.error("PATCH anomaly error:", error);
    return NextResponse.json({ error: "Failed to update anomaly report" }, { status: 500 });
  }
}
