import AdminLayout from "@/components/AdminLayout";
import prisma from "@/lib/db";
import { User } from "@/types";
import UserTable from "@/components/UserTable";

export const dynamic = "force-dynamic";

async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  
  // Transform prisma model to match our UI User type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return users.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    nationalId: u.nationalId,
    avatar: u.avatar,
    role: u.role,
    isVerified: u.isVerified,
    district: u.district,
    sector: u.sector,
    cell: u.cell,
    village: u.village,
    createdAt: u.createdAt.toISOString()
  }));
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-500 text-sm font-medium">Manage citizens, Abunzi committee members, and staff.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{users.length} Active Accounts</span>
            </div>
          </div>
        </header>

        <UserTable initialUsers={users} />
      </div>
    </AdminLayout>
  );
}
