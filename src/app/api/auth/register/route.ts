import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, signToken, type Role } from "@/lib/auth";
import { validateNationalId } from "@/lib/nida";

// Roles a person may choose when creating an account; ADMIN accounts are created by administrators only.
const SELF_SERVICE_ROLES: Role[] = ["USER", "NOTARY", "ABUNZI"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role: Role = SELF_SERVICE_ROLES.includes(body.role) ? body.role : "USER";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const nida = validateNationalId(body.nationalId);
    if (!nida.valid) {
      return NextResponse.json({ error: nida.error }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { nationalId: nida.nationalId }] },
    });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email or national ID already exists" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        nationalId: nida.nationalId,
        isVerified: false,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(name)}`,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          nationalId: user.nationalId,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST register error:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
