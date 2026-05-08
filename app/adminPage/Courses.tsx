'use client';
import { useState, useEffect } from "react";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { getCourses { id title topic level isPublished } }`
      }),
    })
      .then(r => r.json())
      .then(res => setCourses(res.data?.getCourses || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white tracking-tight">Curriculum Overview</h2>
        <p className="text-zinc-500 text-xs mt-1">Total Modules: {courses.length}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <p className="text-zinc-600 text-xs animate-pulse">Fetching catalog...</p>
        ) : courses.map(c => (
          <div key={c.id} className="flex items-center justify-between px-8 py-6 bg-[#080810] border border-white/[0.05] rounded-2xl hover:bg-white/[0.01] transition-all group">
            <div className="flex items-center gap-6">
              <div className="text-zinc-800 text-xl font-black italic group-hover:text-indigo-500/20 transition-colors">#</div>
              <div>
                <p className="text-sm font-bold text-zinc-200 mb-1">{c.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{c.topic}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{c.level}</span>
                </div>
              </div>
            </div>
            <div className={`text-[9px] font-black px-3 py-1 rounded-full border ${c.isPublished ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-zinc-800/50 border-white/5 text-zinc-600'}`}>
              {c.isPublished ? 'LIVE' : 'DRAFT'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}