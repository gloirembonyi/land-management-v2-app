import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { userSelect } from "@/lib/users";
import { validateNationalId } from "@/lib/nida";

const PROFILE_FIELDS = ["name", "avatar", "idPictureUrl", "biometricRegistered", "digitalSignature", "profileCompleted", "district", "sector", "cell", "village"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { id } = await params;
    if (auth.userId !== id && auth.role !== "ADMIN") {
      return NextResponse.json({ error: "You can only update your own profile" }, { status: 403 });
    }

    const data: Record<string, unknown> = {};
    for (const f of PROFILE_FIELDS) if (body[f] !== undefined && body[f] !== "") data[f] = body[f];
    if (body.nationalId) {
      const nida = validateNationalId(body.nationalId);
      if (!nida.valid) return NextResponse.json({ error: nida.error }, { status: 400 });
      data.nationalId = nida.nationalId;
    }
    // Completing the profile (ID photo, signature, biometrics, village) verifies the account;
    // administrators can also verify or suspend accounts explicitly.
    if (body.profileCompleted === true) data.isVerified = true;
    if (auth.role === "ADMIN") {
      if (body.isVerified !== undefined) data.isVerified = body.isVerified;
      if (body.role) data.role = body.role;
    }

    const user = await prisma.user.update({ where: { id }, data, select: userSelect });
    return NextResponse.json(user);
  } catch (error) {
    console.error("PATCH user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("GET user error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
