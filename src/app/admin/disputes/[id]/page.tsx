import Link from "next/link";
import { notFound } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import prisma from "@/lib/db";
import { recordDisputeDecision, setDisputeStatus } from "@/app/actions/cases";
import { ArrowLeft, MapPin, Calendar, UserCheck, MessageSquareQuote, Paperclip, GitBranch, Gavel, History } from "lucide-react";

export const dynamic = "force-dynamic";

type Entry = Record<string, string | number | undefined>;
const parse = (v: string | null): Entry[] => {
  if (!v) return [];
  try {
    const x = JSON.parse(v);
    return Array.isArray(x) ? x : [x];
  } catch {
    return [{ text: v }];
  }
};

const STEPS = ["Investigation", "Mediation", "Resolved"];

export default async function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dispute = await prisma.dispute.findUnique({ where: { id } });
  if (!dispute) notFound();

  const [parcel, abunzi, reporter, history] = await Promise.all([
    prisma.parcel.findUnique({ where: { upi: dispute.upi } }),
    dispute.assignedAbunziId ? prisma.user.findUnique({ where: { id: dispute.assignedAbunziId }, select: { name: true, village: true } }) : null,
    dispute.reportedById ? prisma.user.findUnique({ where: { id: dispute.reportedById }, select: { name: true } }) : null,
    prisma.transaction.findMany({ where: { upi: dispute.upi }, orderBy: { createdAt: "asc" } }),
  ]);
  const statements = parse(dispute.statements);
  const evidence = parse(dispute.evidence);
  const family = parse(dispute.familyTree);
  const decisions = parse(dispute.decisions);
  const stepIndex = Math.max(0, STEPS.indexOf(dispute.status));

  const card = "bg-white rounded-2xl border border-slate-200 shadow-sm p-6";
  const h = "flex items-center gap-2 font-black text-slate-900 mb-4";
  const empty = (t: string) => <p className="text-sm text-slate-400 italic">{t}</p>;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/admin/disputes" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600">
          <ArrowLeft size={16} /> All disputes
        </Link>

        <header className={card}>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">{dispute.type}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case #{dispute.id.slice(-6).toUpperCase()}</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{dispute.description}</h1>
          <div className="flex flex-wrap gap-6 mt-4 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" />
              {dispute.location} · UPI <b className="text-slate-700">{dispute.upi}</b>
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={16} className="text-emerald-600" />
              Opened {dispute.dateOpened}
            </span>
            <span className="flex items-center gap-2">
              <UserCheck size={16} className="text-emerald-600" />
              Mediator: <b className="text-slate-700">{abunzi ? `${abunzi.name} (Abunzi, ${abunzi.village})` : "Not yet assigned"}</b>
            </span>
          </div>
          <div className="mt-6 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex-1 h-2 rounded-full ${i <= stepIndex ? "bg-emerald-500" : "bg-slate-100"}`} />
                <span className={`text-[11px] font-black uppercase tracking-wider ${i <= stepIndex ? "text-emerald-600" : "text-slate-300"}`}>{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {STEPS.filter((s) => s !== dispute.status).map((s) => (
              <form key={s} action={setDisputeStatus.bind(null, dispute.id, s)}>
                <button
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest ${
                    s === "Resolved" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Move to {s}
                </button>
              </form>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className={`${card} lg:col-span-2`}>
            <h2 className={h}>
              <MessageSquareQuote size={18} className="text-emerald-600" /> Statements of the Parties
            </h2>
            {statements.length ? (
              <ul className="space-y-3">
                {statements.map((s, i) => (
                  <li key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      {s.party || s.sender || "Party"} {s.date ? `· ${s.date}` : ""}
                    </p>
                    <p className="text-sm text-slate-700 mt-1">{s.text || s.statement || s.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              empty("No statements recorded yet.")
            )}
          </section>

          <section className={card}>
            <h2 className={h}>
              <UserCheck size={18} className="text-emerald-600" /> Parties & Parcel
            </h2>
            <p className="text-sm font-bold text-slate-800">{dispute.parties}</p>
            <p className="text-xs text-slate-400 mt-1">Reported by {reporter?.name || "citizen"}</p>
            {parcel && (
              <div className="mt-4 text-sm space-y-1 text-slate-600">
                <p><b>Owner:</b> {parcel.ownerName}</p>
                <p><b>Size / use:</b> {parcel.size} · {parcel.use}</p>
                <p><b>Status:</b> {parcel.status}</p>
                <p><b>Certificate:</b> {parcel.certificateId || "Not issued"}</p>
                <Link href={`/admin/parcels/${encodeURIComponent(parcel.upi)}`} className="inline-block mt-2 text-emerald-600 font-bold">
                  Open parcel record →
                </Link>
              </div>
            )}
          </section>

          <section className={card}>
            <h2 className={h}>
              <Paperclip size={18} className="text-emerald-600" /> Evidence
            </h2>
            {evidence.length ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {evidence.map((e, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{e.name || e.text}</span>
                    <span className="text-[10px] font-black text-slate-400">{e.type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              empty("No evidence attached.")
            )}
          </section>

          <section className={card}>
            <h2 className={h}>
              <GitBranch size={18} className="text-emerald-600" /> Family Tree (Heirs)
            </h2>
            {family.length ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {family.map((f, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{f.name}</span>
                    <span className="text-slate-400">{f.relation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              empty("Not applicable to this case.")
            )}
          </section>

          <section className={card}>
            <h2 className={h}>
              <Gavel size={18} className="text-emerald-600" /> Decisions
            </h2>
            {decisions.length ? (
              <ul className="space-y-3">
                {decisions.map((d, i) => (
                  <li key={i} className="text-sm">
                    <p className="text-slate-700">{d.decision || d.text}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {d.by} {d.date ? `· ${d.date}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              empty("No decision recorded yet.")
            )}
            <form action={recordDisputeDecision.bind(null, dispute.id)} className="mt-4 space-y-2">
              <textarea
                name="decision"
                rows={3}
                placeholder="Record an NLA note or decision..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              />
              <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest">Save</button>
            </form>
          </section>

          <section id="history" className={`${card} lg:col-span-3`}>
            <h2 className={h}>
              <History size={18} className="text-emerald-600" /> Transaction History of Parcel {dispute.upi}
            </h2>
            {history.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-slate-400">
                    <th className="py-2">Block</th>
                    <th>Type</th>
                    <th>Seller</th>
                    <th>Buyer</th>
                    <th>Status</th>
                    <th>Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((t) => (
                    <tr key={t.id} className="border-t border-slate-100 text-slate-700">
                      <td className="py-2 font-bold">#{t.blockNumber}</td>
                      <td>{t.type}</td>
                      <td>{t.sellerName}</td>
                      <td>{t.buyerName}</td>
                      <td>{t.status}</td>
                      <td className="font-mono text-[11px] text-slate-400">{t.txHash?.slice(0, 18)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              empty("No transactions have been recorded for this parcel.")
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
