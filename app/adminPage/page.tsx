"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Overview from "./Overview";
import Users from "./Users";
import Courses from "./Courses";
import Admins from "./Admins";

const NAV = [
  { id: "overview", label: "Dashboard", sub: "Statistics" },
  { id: "users", label: "Members", sub: "User Management" },
  { id: "courses", label: "Curriculum", sub: "Content List" },
  { id: "admins", label: "Authority", sub: "Admin Access" },
];

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if ((session?.user as any)?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 font-bold text-sm tracking-widest uppercase mb-2">Unauthorized</p>
          <p className="text-zinc-500 text-xs">This area is restricted to system administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] text-zinc-400 flex font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#080810] border-r border-white/[0.03] flex flex-col sticky top-0 h-screen">
        <div className="px-8 py-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)]" />
            <span className="text-white font-black tracking-tighter text-xl">FLOW</span>
          </div>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] ml-1">Central Command</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`
                w-full group flex flex-col items-start px-4 py-3 rounded-xl transition-all duration-200
                ${active === item.id 
                  ? "bg-white/[0.03] border border-white/[0.05]" 
                  : "hover:bg-white/[0.01] border border-transparent"
                }
              `}
            >
              <span className={`text-sm font-bold transition-colors ${active === item.id ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"}`}>
                {item.label}
              </span>
              <span className="text-[10px] text-zinc-600 font-medium">{item.sub}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/[0.02] border border-white/[0.03] rounded-2xl p-4">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Current Session</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-indigo-500/20 uppercase">
                {session?.user?.name?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-zinc-200 truncate">{session?.user?.name}</p>
                <p className="text-[10px] text-zinc-600 truncate">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-12 py-16">
          
          {/* Transition wrapper */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            {active === "overview" && <Overview />}
            {active === "users" && <Users />}
            {active === "courses" && <Courses />}
            {active === "admins" && <Admins />}
          </div>

        </div>
      </main>
    </div>
  );
}