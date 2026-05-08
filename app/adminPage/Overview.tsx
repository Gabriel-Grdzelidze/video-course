'use client';
import { useState, useEffect } from "react";

export default function Overview() {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { getUsers { id } getCourses { id title topic isPublished isFree instructor { name } } }`
      }),
    })
      .then(r => r.json())
      .then(({ data }) => {
        setUsers(data?.getUsers ?? []);
        setCourses(data?.getCourses ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  const published = courses.filter(c => c.isPublished).length;
  const free = courses.filter(c => c.isFree).length;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Platform Overview</h1>
        <p className="text-zinc-500 mt-1">Real-time performance and activity</p>
      </header>

      <div className="flex bg-white/[0.02] border border-white/[0.05] rounded-2xl mb-10 overflow-hidden backdrop-blur-md">
        <div className="flex-1 p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Users</p>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="w-[1px] h-10 bg-white/10 self-center" />
        <div className="flex-1 p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Courses</p>
          <p className="text-2xl font-bold text-white">{courses.length}</p>
        </div>
        <div className="w-[1px] h-10 bg-white/10 self-center" />
        <div className="flex-1 p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Published</p>
          <p className="text-2xl font-bold text-emerald-400">{published}</p>
        </div>
        <div className="w-[1px] h-10 bg-white/10 self-center" />
        <div className="flex-1 p-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Free Access</p>
          <p className="text-2xl font-bold text-indigo-400">{free}</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.08] flex justify-between items-center">
          <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
          <span className="text-xs text-zinc-500">Last 5 entries</span>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {courses.slice(0, 5).map((c) => (
            <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-1.5 h-1.5 rounded-full ${c.isPublished ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                <div>
                  <p className="text-sm font-medium text-zinc-200">{c.title}</p>
                  <p className="text-xs text-zinc-500">{c.instructor?.name || 'Admin'}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[11px] bg-white/[0.05] text-zinc-400 px-2 py-0.5 rounded uppercase font-bold tracking-tight">{c.topic}</span>
                <span className={`text-xs font-bold w-12 text-right ${c.isFree ? 'text-indigo-400' : 'text-zinc-500'}`}>
                  {c.isFree ? 'FREE' : 'PAID'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}