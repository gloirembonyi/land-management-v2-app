import AdminLayout from "@/components/AdminLayout";
import prisma from "@/lib/db";
import { 
  ExternalLink
} from "lucide-react";
import { Parcel } from "@/types";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getParcels(q?: string): Promise<Parcel[]> {
  const parcels = await prisma.parcel.findMany({
    where: q
      ? {
          OR: [
            { upi: { contains: q, mode: "insensitive" } },
            { ownerName: { contains: q, mode: "insensitive" } },
            { district: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
  });
  return parcels as unknown as Parcel[];
}

export default async function ParcelsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const parcels = await getParcels(q?.trim() || undefined);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Parcel Registry</h1>
            <p className="text-slate-500 text-sm font-medium">
              {q ? `${parcels.length} result(s) for "${q}"` : "Manage and verify land parcels across districts."}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {parcels.map((parcel: Parcel) => (
            <div key={parcel.upi} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
              <div className="relative h-48">
                <Image 
                  src={parcel.imageUrl || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"} 
                  alt={parcel.upi} 
                  fill
                  className="w-full h-full object-cover" 
                />
                <div className={`absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black shadow-sm border uppercase tracking-wider ${
                  parcel.isVerified ? 'text-emerald-600 border-emerald-100' : 'text-amber-600 border-amber-100'
                }`}>
                  {parcel.status}
                </div>
                {parcel.isVerified && (
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Verified Title
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{parcel.upi}</h3>
                    <p className="text-sm font-medium text-slate-500">{parcel.location}, {parcel.district}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Size</p>
                    <p className="text-sm font-bold text-slate-700">{parcel.size}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Use</p>
                    <p className="text-sm font-bold text-slate-700">{parcel.use}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative">
                        <Image 
                          src={`https://ui-avatars.com/api/?name=${parcel.ownerName}&background=random`} 
                          alt={parcel.ownerName} 
                          fill
                          className="object-cover"
                        />
                     </div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{parcel.ownerName}</span>
                  </div>
                  <a 
                    href={`/admin/parcels/${encodeURIComponent(parcel.upi)}`}
                    className={`font-bold text-xs uppercase tracking-widest flex items-center gap-1 transition-all ${
                      parcel.isVerified ? 'text-slate-400 hover:text-slate-600' : 'text-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    {parcel.isVerified ? 'View Record' : 'Verify Parcel'}
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
