
import AdminLayout from "@/components/AdminLayout";
import prisma from "@/lib/db";
import { 
  AlertCircle,
  MapPin,
  Calendar,
  Camera,
  ExternalLink
} from "lucide-react";
import Image from "next/image";
import { setAnomalyStatus } from "@/app/actions/cases";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border border-amber-100",
  INVESTIGATING: "bg-blue-50 text-blue-600 border border-blue-100",
  RESOLVED: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  DISMISSED: "bg-slate-100 text-slate-500 border border-slate-200",
};

export const dynamic = "force-dynamic";

async function getAnomalies() {
  return await prisma.anomalyReport.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function AnomaliesPage() {
  const anomalies = await getAnomalies();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Anomaly Reports</h1>
            <p className="text-slate-500 text-sm font-medium">Citizen-reported issues including illegal construction and encroachment.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {anomalies.map((anomaly: any) => (
            <div key={anomaly.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-amber-200 transition-all group flex flex-col">
              {anomaly.imageUrl && (
                <div className="relative h-48 w-full bg-slate-100">
                  <Image 
                    src={anomaly.imageUrl} 
                    alt="Evidence" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
                    <Camera size={16} className="text-amber-600" />
                  </div>
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_STYLE[anomaly.status] || STATUS_STYLE.PENDING}`}>
                    {anomaly.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">
                    #{anomaly.id.slice(-6)}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{anomaly.type}</h3>
                <p className="text-slate-600 text-sm mb-6 flex-1">{anomaly.description}</p>
                
                <div className="space-y-3 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                    <MapPin size={14} className="text-emerald-600" />
                    {anomaly.location || 'Unknown Location'}
                    {anomaly.latitude != null && <span className="text-slate-400">({anomaly.latitude.toFixed(4)}, {anomaly.longitude?.toFixed(4)})</span>}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                    <Calendar size={14} className="text-emerald-600" />
                    Reported: {new Date(anomaly.createdAt).toLocaleDateString("en-GB")}{anomaly.upi ? ` · UPI ${anomaly.upi}` : ""}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  {anomaly.status === "PENDING" && (
                    <form action={setAnomalyStatus.bind(null, anomaly.id, "INVESTIGATING")} className="flex-1">
                      <button className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                        Start Investigation
                      </button>
                    </form>
                  )}
                  {anomaly.status === "INVESTIGATING" && (
                    <>
                      <form action={setAnomalyStatus.bind(null, anomaly.id, "RESOLVED")} className="flex-1">
                        <button className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">
                          Mark Resolved
                        </button>
                      </form>
                      <form action={setAnomalyStatus.bind(null, anomaly.id, "DISMISSED")}>
                        <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                          Dismiss
                        </button>
                      </form>
                    </>
                  )}
                  {(anomaly.status === "RESOLVED" || anomaly.status === "DISMISSED") && (
                    <form action={setAnomalyStatus.bind(null, anomaly.id, "INVESTIGATING")} className="flex-1">
                      <button className="w-full bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Reopen
                      </button>
                    </form>
                  )}
                  {anomaly.latitude != null && anomaly.longitude != null && (
                    <a
                      href={`https://www.google.com/maps?q=${anomaly.latitude},${anomaly.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-12 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 hover:text-emerald-600 transition-all"
                      title="Open reported location on the map"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {anomalies.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <AlertCircle size={48} className="text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-400 uppercase tracking-tight">No anomalies reported</h3>
              <p className="text-slate-400 text-sm">Everything seems to be in order.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
