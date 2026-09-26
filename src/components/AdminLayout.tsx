"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";
import NextImage from "next/image";
import { 
  LayoutDashboard, 
  Users, 
  Map as MapIcon, 
  Receipt, 
  AlertTriangle, 
  AlertCircle,
  Settings, 
  LogOut,
  Menu,
  Search,
  Bell
} from "lucide-react";
import { LucideIcon } from "lucide-react";

const SidebarItem = ({ icon: Icon, label, href, active }: { icon: LucideIcon, label: string, href: string, active: boolean }) => (
  <Link href={href}>
    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
      active 
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
        : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"
    }`}>
      <Icon size={18} />
      <span className="font-bold text-sm">{label}</span>
    </div>
  </Link>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/admin/parcels?q=${encodeURIComponent(q)}`);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: MapIcon, label: "Parcels", href: "/admin/parcels" },
    { icon: Receipt, label: "Transactions", href: "/admin/transactions" },
    { icon: AlertTriangle, label: "Disputes", href: "/admin/disputes" },
    { icon: AlertCircle, label: "Anomalies", href: "/admin/anomalies" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-200">
              U
            </div>
            <span className="text-xl font-black tracking-tight text-emerald-900">Ubutaka</span>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <SidebarItem 
                key={item.href} 
                {...item} 
                active={pathname === item.href} 
              />
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <SidebarItem icon={Settings} label="Settings" href="/admin/settings" active={pathname === "/admin/settings"} />
            <button type="button" onClick={handleLogout} className="mt-1 w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer font-semibold text-sm">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
              title="Toggle Sidebar"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search parcels by UPI, owner or district..." 
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-xs font-medium"
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">Admin User</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Manager</p>
              </div>
              <div className="w-8 h-8 bg-slate-200 rounded-lg overflow-hidden shadow-sm relative ring-2 ring-white">
                <NextImage 
                  src="https://ui-avatars.com/api/?name=Admin+User&background=059669&color=fff" 
                  alt="Avatar" 
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {children}
        </div>
      </main>

      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        ></div>
      )}
    </div>
  );
}

