import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const toText = (v: unknown) => (v === undefined || v === null ? undefined : typeof v === "string" ? v : JSON.stringify(v));

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { id } = await params;

    const current = await prisma.dispute.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }
    const isMediator = auth.role === "ABUNZI" || auth.role === "ADMIN";
    if (!isMediator && current.reportedById !== auth.userId) {
      return NextResponse.json({ error: "You are not a party to this dispute" }, { status: 403 });
    }
    if (body.status && body.status !== current.status && ["Mediation", "Resolved"].includes(body.status) && !isMediator) {
      return NextResponse.json({ error: "Only the Abunzi mediator can change the status of a dispute" }, { status: 403 });
    }

    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        status: body.status || undefined,
        description: body.description || undefined,
        parties: body.parties || undefined,
        location: body.location || undefined,
        statements: toText(body.statements),
        evidence: toText(body.evidence),
        decisions: toText(body.decisions),
        familyTree: toText(body.familyTree),
        // An Abunzi who opens an unassigned case takes responsibility for it.
        assignedAbunziId: current.assignedAbunziId || (auth.role === "ABUNZI" ? auth.userId : undefined),
      },
    });
    return NextResponse.json(dispute);
  } catch (error) {
    const err = error as Error;
    console.error("PATCH dispute error:", err);
    return NextResponse.json({ error: "Failed to update dispute", details: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return PATCH(request, ctx);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }
    return NextResponse.json(dispute);
  } catch (error) {
    console.error("GET dispute error:", error);
    return NextResponse.json({ error: "Failed to fetch dispute" }, { status: 500 });
  }
}
