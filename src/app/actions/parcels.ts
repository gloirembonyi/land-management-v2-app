"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { nextCertificateId, requireAdminSession } from "@/lib/adminSession";

export async function verifyParcel(upi: string) {
  try {
    await requireAdminSession();
    const current = await prisma.parcel.findUnique({ where: { upi } });
    if (!current) return { success: false, error: "Parcel not found" };
    const certificateId = current.certificateId || (await nextCertificateId());

    await prisma.parcel.update({
      where: { upi },
      data: { status: "Verified", isVerified: true, verifiedAt: new Date(), certificateId },
    });

    revalidatePath("/admin/parcels");
    revalidatePath(`/admin/parcels/${encodeURIComponent(upi)}`);
    return { success: true, certificateId };
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function rejectParcel(upi: string) {
  try {
    await requireAdminSession();
    await prisma.parcel.update({ where: { upi }, data: { status: "Rejected", isVerified: false } });
    revalidatePath("/admin/parcels");
    revalidatePath(`/admin/parcels/${encodeURIComponent(upi)}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
