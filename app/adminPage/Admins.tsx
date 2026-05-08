'use client';
import { useState, useEffect } from "react";

export default function Admins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  const fetchAdmins = () => {
    setLoading(true);
    fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: `query { 
          getAdmins { 
            id 
            user { 
              name 
              email 
            } 
          } 
        }`
      }),
    })
      .then(r => r.json())
      .then(res => {
        if (res.errors) {
          console.error("Backend Error:", res.errors[0].message);
        }
        setAdmins(res.data?.getAdmins || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Authority & Permissions</h2>
          <p className="text-zinc-500 text-xs mt-1">Manage users with system override access</p>
        </div>

        <div className="flex items-center gap-2 bg-[#0a0a15] border border-white/5 p-1.5 rounded-xl w-full md:w-auto">
          <input 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search user email..."
            className="bg-transparent border-none text-xs px-3 py-1 text-zinc-300 focus:ring-0 w-full md:w-64"
          />
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black px-4 py-2 rounded-lg transition-all active:scale-95 uppercase">
            Grant Access
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white/[0.02] border border-white/[0.05] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : admins.length > 0 ? (
          admins.map(a => (
            <div key={a.id} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl group transition-all hover:border-indigo-500/30">
              <div className="flex items-center gap-5">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                <div>
                  <p className="text-sm font-bold text-zinc-100">
                    {a.user?.name || a.name || "System Admin"}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-medium tracking-tight">
                    {a.user?.email || a.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                 <span className="text-[9px] font-black text-indigo-500/40 uppercase tracking-widest bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/10">
                   Elevated
                 </span>
                 <button className="text-[10px] text-zinc-600 font-black hover:text-red-500 transition-colors uppercase tracking-tighter">
                   Revoke
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 border-2 border-dashed border-white/[0.02] rounded-3xl text-center">
            <p className="text-zinc-600 text-xs font-medium">No administrators found in registry.</p>
          </div>
        )}
      </div>
    </div>
  );
}