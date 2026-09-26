"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

import { login } from "@/app/actions/auth";

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await login(formData);
      if (result.success) {
        router.push("/admin");
      } else {
        setError(result.error || "Login failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl text-white font-bold text-3xl mb-4 shadow-xl shadow-emerald-200">
            U
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Admin Portal</h1>
          <p className="text-slate-500 font-medium">Secure access to Ubutaka management system.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-shake">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ubutaka.gov.rw"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-70 shadow-lg shadow-slate-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Connect Now
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">
              System restricted to authorized personnel only.
              <br />
              All actions are logged and strictly monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
