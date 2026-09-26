import AdminLayout from "@/components/AdminLayout";
import prisma from "@/lib/db";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  User,
  DollarSign,
  Hash,
  Calendar,
  TrendingUp,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getTransaction(id: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });
    return transaction;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return null;
  }
}

async function getParcelDetails(upi: string) {
  try {
    const parcel = await prisma.parcel.findUnique({
      where: { upi },
    });
    return parcel;
  } catch (error) {
    console.error("Error fetching parcel:", error);
    return null;
  }
}

export default async function TransactionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transaction = await getTransaction(id);

  if (!transaction) {
    notFound();
  }

  const parcel = await getParcelDetails(transaction.upi);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/transactions"
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Transaction Details
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              View comprehensive transaction information
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <div
          className={`p-6 rounded-2xl border-2 ${
            transaction.status === "completed"
              ? "bg-emerald-50 border-emerald-200"
              : transaction.status === "action_required"
              ? "bg-red-50 border-red-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {transaction.status === "completed" ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : transaction.status === "action_required" ? (
                <AlertCircle className="w-8 h-8 text-red-600" />
              ) : (
                <Clock className="w-8 h-8 text-amber-600" />
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                  {transaction.title}
                </h2>
                <p className="text-sm text-slate-600 font-medium">
                  Current Step: {transaction.step}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                  transaction.status === "completed"
                    ? "bg-emerald-600 text-white"
                    : transaction.status === "action_required"
                    ? "bg-red-600 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                {transaction.status.replace("_", " ")}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-slate-600">
                Progress
              </span>
              <span className="text-xs font-black text-slate-600">
                {transaction.progress}%
              </span>
            </div>
            <div className="h-3 w-full bg-white rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  transaction.status === "completed"
                    ? "bg-emerald-600"
                    : transaction.status === "action_required"
                    ? "bg-red-600"
                    : "bg-amber-600"
                }`}
                style={{ width: `${transaction.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transaction Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Hash className="w-5 h-5 text-emerald-600" />
              Transaction Information
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-start py-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Transaction ID
                </span>
                <span className="text-sm font-mono text-slate-900 font-bold break-all text-right">
                  {transaction.id}
                </span>
              </div>

              <div className="flex justify-between items-start py-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Type
                </span>
                <span className="text-sm font-bold text-slate-900 uppercase">
                  {transaction.type}
                </span>
              </div>

              <div className="flex justify-between items-start py-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Created
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {transaction.date}
                </span>
              </div>

              {transaction.price && (
                <div className="flex justify-between items-start py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Price
                  </span>
                  <span className="text-lg font-black text-emerald-600">
                    {transaction.price} RWF
                  </span>
                </div>
              )}

              {transaction.gasFee && (
                <div className="flex justify-between items-start py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Gas Fee
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {transaction.gasFee}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Parties Involved */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Parties Involved
            </h3>

            <div className="space-y-3">
              {transaction.sellerName && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                    Seller
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {transaction.sellerName}
                  </p>
                </div>
              )}

              {transaction.buyerName && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                    Buyer
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {transaction.buyerName}
                  </p>
                </div>
              )}

              {!transaction.sellerName && !transaction.buyerName && (
                <p className="text-sm text-slate-500 italic text-center py-4">
                  No party information available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Blockchain Information */}
        {(transaction.txHash || transaction.blockNumber) && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-emerald-400" />
              Blockchain Information
            </h3>

            <div className="space-y-3">
              {transaction.txHash && (
                <div className="flex justify-between items-start py-3 border-b border-slate-700">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Transaction Hash
                  </span>
                  <span className="text-sm font-mono text-emerald-400 font-bold break-all text-right max-w-md">
                    {transaction.txHash}
                  </span>
                </div>
              )}

              {transaction.blockNumber && (
                <div className="flex justify-between items-start py-3 border-b border-slate-700">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Block Number
                  </span>
                  <span className="text-sm font-bold text-white">
                    {transaction.blockNumber}
                  </span>
                </div>
              )}

              {transaction.previousHash && (
                <div className="flex justify-between items-start py-3">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Previous Hash
                  </span>
                  <span className="text-sm font-mono text-slate-300 font-medium break-all text-right max-w-md">
                    {transaction.previousHash}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Parcel Information */}
        {parcel && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Associated Parcel: {transaction.upi}
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                    Owner
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {parcel.ownerName}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                    Size
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {parcel.size}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                    Land Use
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {parcel.use}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                    District
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {parcel.district}
                  </p>
                </div>

                {parcel.sector && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                      Sector
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {parcel.sector}
                    </p>
                  </div>
                )}

                {parcel.cell && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                      Cell
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {parcel.cell}
                    </p>
                  </div>
                )}

                {parcel.village && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                      Village
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {parcel.village}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {parcel.status}
                  </p>
                </div>

                {parcel.price && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                      Listed Price
                    </p>
                    <p className="text-sm font-bold text-emerald-600">
                      {parcel.price} RWF
                    </p>
                  </div>
                )}
              </div>

              {parcel.imageUrl && (
                <div className="mt-6">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                    Parcel Image
                  </p>
                  <img
                    src={parcel.imageUrl}
                    alt={`Parcel ${parcel.upi}`}
                    className="w-full h-64 object-cover rounded-xl border-2 border-slate-200"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
