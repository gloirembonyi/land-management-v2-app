import AdminLayout from "@/components/AdminLayout";
import prisma from "@/lib/db";
import Link from "next/link";
import { 
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { Transaction } from "@/types";

export const dynamic = "force-dynamic";

async function getTransactions() {
  return await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transaction Ledger</h1>
            <p className="text-slate-500 text-sm font-medium">Monitor and process all land-related financial movements.</p>
          </div>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/30">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">UPI Target</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {transactions.map((tx: Transaction) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{tx.title}</p>
                        <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">{tx.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-emerald-600 font-bold">{tx.upi}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[100px]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-slate-400">{tx.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${tx.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 mt-1 truncate">{tx.step}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        tx.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                        tx.status === 'action_required' ? "bg-red-50 text-red-600" :
                        "bg-amber-50 text-amber-600"
                      }`}>
                        {tx.status === 'completed' ? <CheckCircle2 size={12} /> : 
                         tx.status === 'action_required' ? <AlertCircle size={12} /> : 
                         <Clock size={12} />}
                        {tx.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      {tx.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/transactions/${tx.id}`}
                        className="text-slate-400 hover:text-emerald-600 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-1 ml-auto"
                      >
                        View
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
