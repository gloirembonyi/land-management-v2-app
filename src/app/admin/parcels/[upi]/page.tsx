import AdminLayout from "@/components/AdminLayout";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import Image from "next/image";
import { 
  MapPin, 
  Maximize2, 
  User, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock,
  ArrowLeft,
  Search,
  Download
} from "lucide-react";
import Link from "next/link";
import { verifyParcel } from "@/app/actions/parcels";
import { revalidatePath } from "next/cache";
import { Parcel } from "@/types";

async function getParcel(upi: string): Promise<Parcel | null> {
  const parcel = await prisma.parcel.findUnique({
    where: { upi: decodeURIComponent(upi) },
  });
  return parcel as unknown as Parcel;
}

export default async function ParcelDetailPage({ params }: { params: Promise<{ upi: string }> }) {
  const { upi } = await params;
  const parcel = await getParcel(upi);

  if (!parcel) {
    notFound();
  }

  // Parse JSON data safe
  const coordinates = parcel.coordinates ? JSON.parse(parcel.coordinates) : null;
  const documents = parcel.documents ? JSON.parse(parcel.documents) : [
    { name: "National ID Copy", status: "Verified", icon: "badge" },
    { name: "Sale Agreement", status: "Verified", icon: "gavel" },
    { name: "Tax Clearance", status: "Verified", icon: "receipt" }
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-10">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Link 
            href="/admin/parcels" 
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            Back to Registry
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header / Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="relative h-64">
                  <Image 
                    src={parcel.imageUrl || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"} 
                    alt={parcel.upi} 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div>
                      <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                        {parcel.district} District
                      </span>
                      <h1 className="text-3xl font-black text-white tracking-tight uppercase">{parcel.upi}</h1>
                      <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                        <MapPin size={16} />
                        {parcel.location}
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl backdrop-blur-md border font-black text-xs uppercase tracking-widest ${
                      parcel.isVerified 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {parcel.status}
                    </div>
                  </div>
               </div>

               <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Areal Size</p>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Maximize2 size={16} className="text-emerald-600" />
                      <span className="font-bold">{parcel.size}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Land Use</p>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Search size={16} className="text-blue-600" />
                      <span className="font-bold">{parcel.use}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission</p>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Calendar size={16} className="text-purple-600" />
                      <span className="font-bold">{new Date(parcel.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified</p>
                    <div className="flex items-center gap-2 text-slate-900">
                      {parcel.isVerified ? (
                        <>
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span className="font-bold">Yes</span>
                        </>
                      ) : (
                        <>
                          <Clock size={16} className="text-amber-600" />
                          <span className="font-bold">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
               </div>
            </div>

            {/* Geographical Map - Mock */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                    <MapPin size={18} className="text-emerald-600" />
                    Geographical Boundaries
                  </h3>
                  <button className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-widest flex items-center gap-1 transition-all">
                    Full GIS View
                  </button>
               </div>
               <div className="h-80 bg-slate-50 relative">
                  {/* Mock Map Image */}
                  <Image 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200"
                    alt="Map"
                    fill
                    className="object-cover opacity-60 mix-blend-multiply"
                  />
                  {/* Mock Polygon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-4 border-emerald-500 bg-emerald-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                       <span className="text-emerald-700 font-black text-xl drop-shadow-sm uppercase">{parcel.upi}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-200 text-[10px] font-medium text-slate-500">
                    <p>WGS84 EPSG:4326</p>
                    <p className="font-bold text-slate-800">Coordinates: {coordinates ? 'Attached' : 'System Generated'}</p>
                  </div>
               </div>
            </div>

            {/* Document Queue */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100">
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    Legal Documentation
                  </h3>
               </div>
               <div className="divide-y divide-slate-100">
                  {documents.map((doc: any, i: number) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">PDF • 2.4 MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                          Valid
                        </span>
                        <button className="text-slate-300 hover:text-emerald-600 transition-colors">
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Owner Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                <User size={18} className="text-purple-600" />
                Registered Owner
              </h3>
              <div className="flex flex-col items-center text-center">
                 <div className="w-24 h-24 rounded-full border-4 border-slate-50 overflow-hidden mb-4 shadow-inner relative">
                    <Image 
                        src={`https://ui-avatars.com/api/?name=${parcel.ownerName}&background=random&size=200`} 
                        alt={parcel.ownerName} 
                        fill
                        className="object-cover"
                      />
                 </div>
                 <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{parcel.ownerName}</h4>
                 <p className="text-sm font-medium text-slate-500 mb-6">Citizen (Verified)</p>
                 
                 <div className="w-full space-y-4">
                    <div className="flex justify-between items-center text-left bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">National ID</p>
                        <p className="text-sm font-bold text-slate-700">1 1990 8 0000000 0 00</p>
                      </div>
                      <ShieldCheck size={20} className="text-emerald-500" />
                    </div>
                    <div className="flex justify-between items-center text-left bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile</p>
                        <p className="text-sm font-bold text-slate-700">+250 788 000 000</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                 </div>
              </div>
            </div>

            {/* Verification Status Card */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
               {/* Decorative Gradient */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full -mr-16 -mt-16" />
               
               <h3 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2 relative z-10">
                 <ShieldCheck size={18} className="text-emerald-400" />
                 Verification 
               </h3>

               {parcel.isVerified ? (
                 <div className="space-y-6 relative z-10">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                      <p className="text-emerald-400 text-xs font-bold mb-1">E-TITLE CERTIFICATE ISSUED</p>
                      <p className="text-2xl font-black tracking-tight">{parcel.certificateId}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium text-slate-400">
                        <span>Verified By</span>
                        <span className="text-white">Admin Console</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium text-slate-400">
                        <span>Date Issued</span>
                         <span className="text-white">{parcel.verifiedAt ? new Date(parcel.verifiedAt).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>
                    <button className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors uppercase tracking-widest text-xs">
                       <Download size={18} />
                       Download Title
                    </button>
                 </div>
               ) : (
                 <div className="space-y-6 relative z-10">
                    <p className="text-slate-400 text-sm leading-relaxed">
                      This parcel is pending legal verification. Please review all documents and boundary coordinates before issuing the digital title certificate.
                    </p>
                    
                    <form action={async () => {
                        "use server";
                        await verifyParcel(parcel.upi);
                      }}>
                       <button 
                        type="submit"
                        className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all uppercase tracking-widest text-xs shadow-lg shadow-emerald-900/40"
                       >
                          Verify & Issue E-Title
                       </button>
                    </form>
                    
                    <button className="w-full bg-slate-800 text-slate-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors uppercase tracking-widest text-xs border border-slate-700">
                       Request Fixes
                    </button>
                 </div>
               )}
            </div>
            
            {/* Action History Mock */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
               <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                 <Clock size={18} className="text-slate-400" />
                 Registry History
               </h3>
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="w-px h-full bg-slate-100 relative">
                        <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-emerald-500" />
                     </div>
                     <div className="pb-4">
                        <p className="text-xs font-black text-slate-900 uppercase">Parcel Registered</p>
                        <p className="text-[10px] text-slate-500">{parcel.createdAt.toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="flex gap-4 font-medium opacity-40">
                     <div className="w-px h-full bg-slate-100 relative">
                        <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-slate-300" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Document Review</p>
                        <p className="text-[10px] text-slate-500">In Queue</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
