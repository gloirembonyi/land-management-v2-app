"use client";

import { useState } from "react";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { changePassword } from "@/app/actions/settings";

export default function PasswordForm() {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const form = e.currentTarget;
    const result = await changePassword(new FormData(form));
    setPending(false);
    setMessage(result.success ? { ok: true, text: "Password updated successfully." } : { ok: false, text: result.error || "Could not update password." });
    if (result.success) form.reset();
  }

  const input = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500";
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {[["current", "Current password"], ["next", "New password"], ["confirm", "Confirm new password"]].map(([name, label]) => (
        <label key={name} className="block">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
          <input name={name} type="password" required className={`${input} mt-1`} />
        </label>
      ))}
      {message && (
        <p className={`text-sm font-semibold ${message.ok ? "text-emerald-600" : "text-red-600"} flex items-center gap-2`}>
          {message.ok && <CheckCircle2 size={16} />} {message.text}
        </p>
      )}
      <button disabled={pending} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-sm font-bold">
        <KeyRound size={16} /> {pending ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}
