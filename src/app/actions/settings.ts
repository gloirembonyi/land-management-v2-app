"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { ADMIN_COOKIE, checkPassword, hashPassword, verifyToken } from "@/lib/auth";

export async function changePassword(formData: FormData) {
  const session = verifyToken((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!session) return { success: false, error: "Your session has expired. Please log in again." };

  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  const confirm = String(formData.get("confirm") || "");
  if (next.length < 8) return { success: false, error: "The new password must be at least 8 characters." };
  if (next !== confirm) return { success: false, error: "The new passwords do not match." };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { success: false, error: "Account not found." };
  const { ok } = await checkPassword(current, user.password);
  if (!ok) return { success: false, error: "The current password is incorrect." };

  await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(next) } });
  return { success: true };
}
