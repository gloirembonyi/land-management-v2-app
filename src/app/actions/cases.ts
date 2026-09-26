"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/adminSession";

const ANOMALY_STATUSES = ["PENDING", "INVESTIGATING", "RESOLVED", "DISMISSED"];
const DISPUTE_STATUSES = ["Investigation", "Mediation", "Resolved"];

export async function setAnomalyStatus(id: string, status: string): Promise<void> {
  await requireAdminSession();
  if (!ANOMALY_STATUSES.includes(status)) throw new Error("Invalid anomaly status");
  await prisma.anomalyReport.update({ where: { id }, data: { status } });
  revalidatePath("/admin/anomalies");
  revalidatePath("/admin");
}

export async function setDisputeStatus(id: string, status: string): Promise<void> {
  await requireAdminSession();
  if (!DISPUTE_STATUSES.includes(status)) throw new Error("Invalid dispute status");
  await prisma.dispute.update({ where: { id }, data: { status } });
  revalidatePath("/admin/disputes");
  revalidatePath(`/admin/disputes/${id}`);
  revalidatePath("/admin");
}

export async function recordDisputeDecision(id: string, formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const text = String(formData.get("decision") || "").trim();
  if (!text) return;
  const dispute = await prisma.dispute.findUnique({ where: { id } });
  if (!dispute) throw new Error("Dispute not found");
  const admin = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } });
  let decisions: unknown[] = [];
  try { decisions = dispute.decisions ? JSON.parse(dispute.decisions) : []; } catch { decisions = []; }
  decisions.push({ decision: text, date: new Date().toISOString().slice(0, 10), by: `${admin?.name || "NLA Administrator"} (NLA)` });
  await prisma.dispute.update({ where: { id }, data: { decisions: JSON.stringify(decisions) } });
  revalidatePath(`/admin/disputes/${id}`);
}
