"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/auth";
import { validateNationalId } from "@/lib/nida";
import { requireAdminSession } from "@/lib/adminSession";

const ROLES = ["USER", "NOTARY", "ABUNZI", "ADMIN"];

interface UserInput {
  name: string;
  email: string;
  password?: string;
  nationalId: string;
  role?: string;
  isVerified?: boolean;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

export async function createUser(data: UserInput) {
  try {
    await requireAdminSession();
    const nida = validateNationalId(data.nationalId);
    if (!nida.valid) return { success: false, error: nida.error };
    if (!data.password || data.password.length < 8) return { success: false, error: "Password must be at least 8 characters" };

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.trim().toLowerCase(),
        password: await hashPassword(data.password),
        nationalId: nida.nationalId,
        role: data.role && ROLES.includes(data.role) ? data.role : "USER",
        isVerified: data.isVerified || false,
        district: data.district || null,
        sector: data.sector || null,
        cell: data.cell || null,
        village: data.village || null,
        avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(data.name)}`,
      },
      select: { id: true, name: true, email: true, role: true },
    });
    revalidatePath("/admin/users");
    return { success: true, user };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateUser(id: string, data: Partial<UserInput>) {
  try {
    await requireAdminSession();
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email?.trim().toLowerCase(),
        role: data.role && ROLES.includes(data.role) ? data.role : undefined,
        isVerified: data.isVerified,
        district: data.district || null,
        sector: data.sector || null,
        cell: data.cell || null,
        village: data.village || null,
        ...(data.password ? { password: await hashPassword(data.password) } : {}),
      },
      select: { id: true, name: true, email: true, role: true },
    });
    revalidatePath("/admin/users");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await requireAdminSession();
    if (session.userId === id) return { success: false, error: "You cannot delete your own account" };
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: (error as Error).message };
  }
}
