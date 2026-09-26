import AdminLayout from "@/components/AdminLayout";
import prisma from "@/lib/db";
import { 
  MessageCircle,
  MapPin,
  Calendar
} from "lucide-react";
import { Dispute } from "@/types";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getDisputes() {
  return await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function DisputesPage() {
  const disputes = await getDisputes();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dispute Resolution</h1>
            <p className="text-slate-500 text-sm font-medium">Mediate and resolve land conflicts and ownership issues.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {disputes.map((dispute: Dispute) => (
            <div key={dispute.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-emerald-200 transition-all group p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      dispute.type === 'Ownership' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                      dispute.type === 'Boundary' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {dispute.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      dispute.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : dispute.status === 'Mediation' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {dispute.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">{dispute.description}</h3>
                  
                  <div className="flex flex-wrap items-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                      <MapPin size={16} className="text-emerald-600" />
                      {dispute.location} (UPI: <span className="font-bold text-slate-700">{dispute.upi}</span>)
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                      <Calendar size={16} className="text-emerald-600" />
                      Opened: <span className="font-bold text-slate-700">{dispute.dateOpened}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {dispute.parties.split(',').map((party: string, i: number) => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 overflow-hidden shadow-sm relative">
                          <Image 
                            src={`https://ui-avatars.com/api/?name=${party.trim()}&background=random`} 
                            alt={party.trim()} 
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Active Parties</p>
                  </div>
                </div>

                <div className="lg:w-48 flex flex-col gap-3 lg:border-l lg:border-slate-50 lg:pl-6 justify-center">
                  <Link href={`/admin/disputes/${dispute.id}`} className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                    <MessageCircle size={16} />
                    Mediate
                  </Link>
                  <Link href={`/admin/disputes/${dispute.id}#history`} className="w-full text-center bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                    History
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
