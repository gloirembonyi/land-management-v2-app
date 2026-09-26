import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkPassword, hashPassword, signToken, verifyToken, type Role } from "@/lib/auth";

const publicUser = (user: { id: string; name: string; email: string; nationalId: string; role: string; isVerified: boolean; avatar: string | null }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  nationalId: user.nationalId,
  role: user.role,
  isVerified: user.isVerified,
  avatar: user.avatar,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, biometricToken } = body;

    let user;

    if (biometricToken) {
      // Biometric login: the device unlocked its securely stored session token.
      const session = verifyToken(biometricToken);
      if (!session) {
        return NextResponse.json({ error: "Invalid or expired biometric session" }, { status: 401 });
      }
      user = await prisma.user.findUnique({ where: { id: session.userId } });
    } else {
      if (!email || !password) {
        return NextResponse.json({ error: "Please provide email and password" }, { status: 400 });
      }

      user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
      if (!user) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const { ok, needsRehash } = await checkPassword(password, user.password);
      if (!ok) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      if (needsRehash) {
        await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(password) } });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role as Role });
    return NextResponse.json({ user: publicUser(user), token });
  } catch (error) {
    console.error("POST login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
