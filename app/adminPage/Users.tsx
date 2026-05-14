'use client';
import { useState, useEffect } from "react";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"students" | "instructors">("students");

  useEffect(() => {
    const fetchUsers = fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: `query { getUsers { id name email avatar } }` }),
    }).then(r => r.json()).then(res => {
      console.log("users raw:", JSON.stringify(res.data?.getUsers));
      setUsers(res.data?.getUsers || []);
    });

    const fetchInstructors = fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: `query { getInstructors { id isApproved user { id name email avatar } } }` }),
    }).then(r => r.json()).then(res => {
      console.log("instructors raw:", JSON.stringify(res.data?.getInstructors));
      const list = (res.data?.getInstructors || []).filter((i: any) => i?.user);
      setInstructors(list);
    });

    Promise.all([fetchUsers, fetchInstructors]).finally(() => setLoading(false));
  }, []);

  const instructorUserIds = new Set(instructors.map((i: any) => i?.user?.id).filter(Boolean));
  const list = tab === "students"
    ? users.filter(u => !instructorUserIds.has(u.id))
    : instructors;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Platform Members</h2>
        <p className="text-zinc-500 text-xs mt-1">Manage all registered accounts</p>
      </div>

      <div className="flex gap-2 mb-4">
        {(["students", "instructors"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              tab === t
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "text-zinc-500 border border-white/5 hover:text-zinc-300"
            }`}
          >
            {t} ({t === "students" ? users.filter(u => !instructorUserIds.has(u.id)).length : instructors.length})
          </button>
        ))}
      </div>

      <div className="bg-[#080810] border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-2 px-8 py-4 border-b border-white/[0.05] bg-white/[0.02] text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
          <span>Member Details</span>
          <span className="text-right">{tab === "instructors" ? "Status" : "Database ID"}</span>
        </div>

        {loading ? (
          <div className="p-20 text-center text-zinc-600 text-xs animate-pulse">Loading...</div>
        ) : list.length > 0 ? (
          list.map((item) => {
            if (!item) return null;
            const user = tab === "students" ? item : item?.user;
            if (!user) return null;
            return (
              <div key={item.id} className="grid grid-cols-2 px-8 py-5 items-center border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-xs font-bold text-zinc-400 overflow-hidden">
                    {user.avatar
                      ? <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                      : user.name?.[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-200">{user.name}</span>
                    <span className="text-xs text-zinc-500">{user.email}</span>
                  </div>
                </div>
                <div className="text-right">
                  {tab === "instructors" ? (
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${
                      item.isApproved
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}>
                      {item.isApproved ? "Approved" : "Pending"}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-zinc-700">{item.id}</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-20 text-center text-zinc-600 text-sm">No {tab} found.</div>
        )}
      </div>
    </div>
  );
}