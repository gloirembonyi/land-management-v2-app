import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-red-50 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Transaction Not Found
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            The transaction you're looking for doesn't exist or has been removed.
          </p>
        </div>

        <Link
          href="/admin/transactions"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Transactions
        </Link>
      </div>
    </div>
  );
}
