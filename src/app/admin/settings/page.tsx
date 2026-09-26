import { cookies } from "next/headers";
import AdminLayout from "@/components/AdminLayout";
import prisma from "@/lib/db";
import { ADMIN_COOKIE, verifyToken } from "@/lib/auth";
import { ShieldCheck, UserCircle2, Lock } from "lucide-react";
import PasswordForm from "./PasswordForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = verifyToken((await cookies()).get(ADMIN_COOKIE)?.value);
  const admin = session ? await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, email: true, role: true, createdAt: true } }) : null;
  const [users, parcels, verified] = await Promise.all([prisma.user.count(), prisma.parcel.count(), prisma.parcel.count({ where: { isVerified: true } })]);

  const row = (label: string, value: string) => (
    <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0 text-sm">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm font-medium">Administrator account and platform security.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="flex items-center gap-2 font-black text-slate-900 mb-4"><UserCircle2 size={18} className="text-emerald-600" /> Administrator Profile</h2>
            {row("Name", admin?.name || "-")}
            {row("Email", admin?.email || "-")}
            {row("Role", "NLA Administrator")}
            {row("Account created", admin ? admin.createdAt.toISOString().slice(0, 10) : "-")}
          </section>
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="flex items-center gap-2 font-black text-slate-900 mb-4"><Lock size={18} className="text-emerald-600" /> Change Password</h2>
            <PasswordForm />
          </section>
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
            <h2 className="flex items-center gap-2 font-black text-slate-900 mb-4"><ShieldCheck size={18} className="text-emerald-600" /> Security Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
              <div>
                {row("Password storage", "bcrypt (cost 10)")}
                {row("Dashboard session", "HTTP-only cookie, 8 hours")}
                {row("Mobile session", "JWT bearer token, 7 days")}
              </div>
              <div>
                {row("Sensitive parcel fields", "AES-256-GCM at rest")}
                {row("Transaction ledger", "SHA-256 hash chain")}
                {row("Registry", `${users} users · ${parcels} parcels · ${verified} verified`)}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
