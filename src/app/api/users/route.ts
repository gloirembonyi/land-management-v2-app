import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, requireAuth } from "@/lib/auth";
import { validateNationalId } from "@/lib/nida";
import { userSelect } from "@/lib/users";


export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const nationalId = searchParams.get("nationalId");
    const role = searchParams.get("role");
    const users = await prisma.user.findMany({
      where: { ...(nationalId ? { nationalId } : {}), ...(role ? { role } : {}) },
      select: userSelect,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    const err = error as Error;
    console.error("GET users error:", err);
    return NextResponse.json({ error: "Failed to fetch users", details: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAuth(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (!body.email || !body.password || !body.name || !body.nationalId) {
      return NextResponse.json({ error: "Missing required fields: email, password, name, nationalId" }, { status: 400 });
    }
    const nida = validateNationalId(body.nationalId);
    if (!nida.valid) {
      return NextResponse.json({ error: nida.error }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: String(body.email).trim().toLowerCase(),
        password: await hashPassword(body.password),
        nationalId: nida.nationalId,
        isVerified: body.isVerified || false,
        avatar: body.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(body.name)}`,
        role: body.role || "USER",
      },
      select: userSelect,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("POST user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
