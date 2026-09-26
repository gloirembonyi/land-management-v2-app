import AdminLayout from "@/components/AdminLayout";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
import { 
  Users, 
  Map as MapIcon, 
  Receipt, 
  AlertTriangle, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  ExternalLink
} from "lucide-react";

import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  title: string;
  upi: string;
  status: string;
  createdAt: Date;
}

interface Dispute {
  id: string;
  description: string | null;
  upi: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  note: string;
  color: "emerald" | "blue" | "amber" | "rose";
}

const StatCard = ({ title, value, icon: Icon, note, color }: StatCardProps) => {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50 shadow-emerald-100",
    blue: "text-blue-600 bg-blue-50 shadow-blue-100",
    amber: "text-amber-600 bg-amber-50 shadow-amber-100",
    rose: "text-rose-600 bg-rose-50 shadow-rose-100",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]} transition-transform group-hover:scale-110`}>
          <Icon size={20} />
        </div>
        <div className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500">
          <ArrowUpRight size={12} />
          {note}
        </div>
      </div>
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 tabular-nums">{value}</h3>
    </div>
  );
};

export default async function AdminDashboard() {
  let userCount = 0;
  let parcelCount = 0;
  let transactionCount = 0;
  let disputeCount = 0;
  let recentTransactions: Transaction[] = [];
  let recentDisputes: Dispute[] = [];
  let pendingParcels = 0;
  let newUsers = 0, newTransactions = 0, newDisputes = 0;
  let pendingAnomalies: { id: string; type: string; description: string; location: string | null }[] = [];
  let dbError = null;

  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const openDispute = { NOT: { status: { in: ["Resolved", "RESOLVED"] } } };
    [userCount, parcelCount, transactionCount, disputeCount, recentTransactions, recentDisputes, pendingParcels, newUsers, newTransactions, newDisputes, pendingAnomalies] = await Promise.all([
      prisma.user.count(),
      prisma.parcel.count(),
      prisma.transaction.count(),
      prisma.dispute.count({ where: openDispute }),
      prisma.transaction.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      prisma.dispute.findMany({ take: 3, orderBy: { createdAt: "desc" }, where: openDispute }),
      prisma.parcel.count({ where: { status: "Pending Verification" } }),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.transaction.count({ where: { createdAt: { gte: since } } }),
      prisma.dispute.count({ where: { createdAt: { gte: since } } }),
      prisma.anomalyReport.findMany({ take: 3, orderBy: { createdAt: "desc" }, where: { status: "PENDING" }, select: { id: true, type: true, description: true, location: true } }),
    ]);
  } catch (error) {
    console.error("Database connection error:", error);
    dbError = "Unable to connect to database. Please check your connection.";
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
              <p className="text-slate-500 text-sm font-medium">Real-time overview of the national land registry.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live System Status</span>
            </div>
          </div>
        </header>

        {dbError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-bold text-red-900">{dbError}</p>
                <p className="text-xs text-red-700 mt-1">Data shown below may be incomplete or outdated.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={userCount.toLocaleString()} icon={Users} note={`${newUsers} new in 30 days`} color="emerald" />
          <StatCard title="Registered Land" value={parcelCount.toLocaleString()} icon={MapIcon} note={`${pendingParcels} awaiting verification`} color="blue" />
          <StatCard title="Transactions" value={transactionCount.toLocaleString()} icon={Receipt} note={`${newTransactions} in 30 days`} color="amber" />
          <StatCard title="Open Disputes" value={disputeCount.toLocaleString()} icon={AlertTriangle} note={`${newDisputes} reported in 30 days`} color="rose" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={18} />
                Recent Activity
              </h2>
              <Link href="/admin/transactions" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                View All <ExternalLink size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx: Transaction) => (
                  <div key={tx.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                          <Receipt size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{tx.title}</p>
                          <p className="text-xs text-slate-500">UPI: {tx.upi}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
                          tx.status.startsWith('PENDING') ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tx.status}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                          <Clock size={10} /> {new Date(tx.createdAt).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <p className="text-slate-400 text-sm">No recent activity found.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="text-rose-500" size={18} />
                Critical Alerts
              </h2>
              <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                {recentDisputes.length + pendingAnomalies.length} OPEN
              </span>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto">
              {recentDisputes.length + pendingAnomalies.length > 0 ? (
                <>
                {recentDisputes.map((dispute: Dispute) => (
                  <Link href={`/admin/disputes/${dispute.id}`} key={dispute.id} className="flex gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100 hover:border-rose-200 transition-colors group">
                    <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-110 transition-transform">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-rose-900 uppercase tracking-tight">Open Dispute · {dispute.upi}</h4>
                      <p className="text-[11px] text-rose-700 font-medium leading-normal mt-0.5 line-clamp-2">
                        {dispute.description || `New dispute raised for UPI ${dispute.upi}`}
                      </p>
                    </div>
                  </Link>
                ))}
                {pendingAnomalies.map((a) => (
                  <Link href="/admin/anomalies" key={a.id} className="flex gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors group">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-tight">Anomaly · {a.type}</h4>
                      <p className="text-[11px] text-amber-700 font-medium leading-normal mt-0.5 line-clamp-2">{a.description}</p>
                    </div>
                  </Link>
                ))}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-60">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
                    <AlertTriangle size={24} />
                  </div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">No critical alerts</p>
                </div>
              )}
            </div>
            {recentDisputes.length + pendingAnomalies.length > 0 && (
              <div className="mt-auto p-4 border-t border-slate-50 bg-slate-50/30">
                <Link href="/admin/disputes" className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  Open Dispute Queue <ExternalLink size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

