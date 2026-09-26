import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// Allowed workflow moves: current status -> next statuses.
const TRANSITIONS: Record<string, string[]> = {
  PENDING_SELLER_APPROVAL: ["PENDING_PAYMENT", "CANCELLED"],
  PENDING_PAYMENT: ["PENDING_NOTARY", "CANCELLED"],
  PENDING_NOTARY: ["PENDING_SELLER", "CANCELLED"],
  PENDING_SELLER: ["COMPLETED", "CANCELLED"],
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { id } = await params;

    const current = await prisma.transaction.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (body.status && body.status !== current.status) {
      const allowed = TRANSITIONS[current.status] ?? [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json({ error: `Cannot move a transaction from ${current.status} to ${body.status}` }, { status: 409 });
      }
      if (body.status === "PENDING_SELLER" && auth.role !== "NOTARY" && auth.role !== "ADMIN") {
        return NextResponse.json({ error: "Only a notary can certify a land transfer" }, { status: 403 });
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: { status: body.status, step: body.step, progress: body.progress },
    });
    return NextResponse.json(transaction);
  } catch (error) {
    console.error("PATCH transaction error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const current = await prisma.transaction.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    // Only offers that were never accepted can be withdrawn; accepted steps stay on the ledger.
    if (current.status !== "PENDING_SELLER_APPROVAL" && auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Only pending offers can be removed" }, { status: 409 });
    }
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("DELETE transaction error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
