"use client";

import React, { useState } from "react";
import { 
  CheckCircle2,
  XCircle,
  Mail,
  Edit2,
  Trash2,
  Plus,
  X,
  Shield,
  User as UserIcon,
  Scale
} from "lucide-react";
import { User } from "@/types";
import Image from "next/image";
import { createUser, updateUser, deleteUser } from "@/app/actions/users";

interface UserTableProps {
  initialUsers: User[];
}

export default function UserTable({ initialUsers }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> & { password?: string }>({
    name: "",
    email: "",
    nationalId: "",
    role: "USER",
    isVerified: false
  });

  const handleOpenCreate = () => {
    setCurrentUser({
      name: "",
      email: "",
      nationalId: "",
      role: "USER",
      isVerified: false
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const result = await deleteUser(id);
      if (result.success) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert("Failed to delete user: " + result.error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentUser.id) {
      const result = await updateUser(currentUser.id, currentUser as Parameters<typeof updateUser>[1]);
      if (result.success) {
        setUsers(users.map(u => u.id === currentUser.id ? (result.user as unknown as User) : u));
        setIsModalOpen(false);
      } else {
        alert("Failed to update user: " + result.error);
      }
    } else {
      const result = await createUser(currentUser as Parameters<typeof createUser>[0]);
      if (result.success) {
        setUsers([result.user as unknown as User, ...users]);
        setIsModalOpen(false);
      } else {
        alert("Failed to create user: " + result.error);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1"><Shield size={10} /> ADMIN</span>;
      case "NOTARY":
        return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1"><Shield size={10} /> NOTARY</span>;
      case "ABUNZI":
        return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1"><Scale size={10} /> ABUNZI</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1"><UserIcon size={10} /> CITIZEN</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">User Directory</h2>
        <button 
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-2"
        >
          <Plus size={16} /> Add New User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/30">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">National ID</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                      <Image 
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                        alt={user.name} 
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Mail size={10} /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-[11px] font-mono bg-slate-50 px-2 py-0.5 rounded text-slate-500">{user.nationalId}</code>
                </td>
                <td className="px-6 py-4">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user.isVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {user.isVerified ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {user.isVerified ? "Verified" : "Pending"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600">
              <h2 className="text-lg font-black text-white">{isEditing ? "Edit User" : "Add New User"}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={currentUser.name}
                  onChange={e => setCurrentUser({...currentUser, name: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={currentUser.email}
                  onChange={e => setCurrentUser({...currentUser, email: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">National ID (NIDA)</label>
                <input 
                  type="text" 
                  value={currentUser.nationalId}
                  onChange={e => setCurrentUser({...currentUser, nationalId: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{isEditing ? "New Password (optional)" : "Password"}</label>
                <input 
                  type="password" 
                  value={currentUser.password || ""}
                  onChange={e => setCurrentUser({...currentUser, password: e.target.value})}
                  required={!isEditing}
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">User Role</label>
                  <select 
                    value={currentUser.role}
                    onChange={e => setCurrentUser({...currentUser, role: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                  >
                    <option value="USER">Citizen</option>
                    <option value="NOTARY">Notary</option>
                    <option value="ABUNZI">Abunzi</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Status</label>
                  <div className="flex items-center h-[42px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={currentUser.isVerified}
                        onChange={e => setCurrentUser({...currentUser, isVerified: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-3 text-sm font-bold text-slate-700">{currentUser.isVerified ? "Verified" : "Pending"}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">District</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Gasabo"
                    value={currentUser.district || ""}
                    onChange={e => setCurrentUser({...currentUser, district: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Sector</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Kimironko"
                    value={currentUser.sector || ""}
                    onChange={e => setCurrentUser({...currentUser, sector: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Cell</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Nyagatovu"
                    value={currentUser.cell || ""}
                    onChange={e => setCurrentUser({...currentUser, cell: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Village</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Isangano"
                    value={currentUser.village || ""}
                    onChange={e => setCurrentUser({...currentUser, village: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all transform active:scale-95"
              >
                {isEditing ? "Update User" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
