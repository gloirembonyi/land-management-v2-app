import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request, ["NOTARY"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { id } = await params;
    const certify = body.status === "CERTIFIED" || body.isCertified === true;
    const document = await prisma.landDocument.update({
      where: { id },
      data: {
        status: certify ? "CERTIFIED" : body.status || undefined,
        isCertified: certify ? true : body.isCertified,
      },
    });
    return NextResponse.json(document);
  } catch (error) {
    console.error("PATCH document error:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}
