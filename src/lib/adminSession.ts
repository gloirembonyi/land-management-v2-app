import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyToken, type SessionUser } from "@/lib/auth";
import prisma from "@/lib/db";

/** Returns the signed-in administrator, or throws if the dashboard session is missing or invalid. */
export async function requireAdminSession(): Promise<SessionUser> {
  const session = verifyToken((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!session || session.role !== "ADMIN") throw new Error("Administrator session required");
  return session;
}

/** Next certificate number in the form CERT-<year>-<4 digits>, unique across the registry. */
export async function nextCertificateId(): Promise<string> {
  const year = new Date().getFullYear();
  let n = (await prisma.parcel.count({ where: { certificateId: { not: null } } })) + 1;
  let id = `CERT-${year}-${String(n).padStart(4, "0")}`;
  while (await prisma.parcel.findUnique({ where: { certificateId: id } })) id = `CERT-${year}-${String(++n).padStart(4, "0")}`;
  return id;
}
