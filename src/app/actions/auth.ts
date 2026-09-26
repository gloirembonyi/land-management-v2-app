"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { ADMIN_COOKIE, checkPassword, hashPassword, signToken } from "@/lib/auth";

const SESSION_HOURS = 8;

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) {
    return { success: false, error: "Please enter your email and password" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Invalid credentials or not an admin" };
  }

  const { ok, needsRehash } = await checkPassword(password, user.password);
  if (!ok) {
    return { success: false, error: "Invalid credentials or not an admin" };
  }
  if (needsRehash) {
    // Upgrade accounts that still hold a plain-text password to a bcrypt hash.
    await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(password) } });
  }

  const token = signToken({ userId: user.id, email: user.email, role: "ADMIN" }, `${SESSION_HOURS}h`);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
  return { success: true };
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return { success: true };
}
