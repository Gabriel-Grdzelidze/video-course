'use client'
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isInstructor = (session?.user as { role?: string })?.role === "instructor";
  const profileHref = isInstructor ? "/instructor/me" : "/profile";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/courses?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-10 h-16 bg-[#0A0A0F]/95 border-b border-white/10 backdrop-blur-md">

      {/* logo */}
      <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-white shrink-0">
        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
        LearnFlow
      </Link>

      {/* search */}
      <div className="flex-1 max-w-md mx-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search for a course..."
          className="w-full bg-[#13131A] border border-white/10 text-white placeholder-white/30 px-4 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50 transition"
        />
      </div>

      {/* nav */}
      <nav className="flex items-center gap-6">
        <Link href="/orders" className="text-sm text-white/50 hover:text-white transition">
          Orders
        </Link>

        {session ? (
          <div className="relative" ref={dropdownRef}>
            {/* trigger */}
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              className="flex items-center gap-2 text-sm font-medium text-white border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer bg-transparent"
            >
              <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] font-bold shrink-0">
                {initials}
              </span>
              <span className="max-w-[120px] truncate">{session.user?.name}</span>
              {isInstructor && (
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 px-1.5 py-0.5 rounded-md">
                  PRO
                </span>
              )}
              <svg
                className={`w-3.5 h-3.5 text-white/35 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#13131A] border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">

                {/* user info */}
                <div className="px-4 py-3 border-b border-white/[0.07]">
                  <p className="text-sm font-semibold text-white truncate">{session.user?.name}</p>
                  <p className="text-[12px] text-white/35 truncate">{session.user?.email}</p>
                </div>

                {/* links */}
                <div className="py-1">
                  <DropdownLink href={profileHref} icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  }>
                    My profile
                  </DropdownLink>

                  <DropdownLink href="/learn" icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  }>
                    My learning
                  </DropdownLink>

                  {isInstructor && (
                    <>
                      <div className="mx-3 my-1 border-t border-white/[0.07]" />
                      <DropdownLink href="/instructor/me" icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      } accent>
                        Instructor dashboard
                      </DropdownLink>
                      <DropdownLink href="/addcourse" icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      } accent>
                        New course
                      </DropdownLink>
                    </>
                  )}
                </div>

                {/* sign out */}
                <div className="border-t border-white/[0.07] py-1">
                  <button
                    onClick={() => { setDropdownOpen(false); signOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/8 transition cursor-pointer bg-transparent"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/authentication"
            className="border border-indigo-500 text-indigo-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 hover:text-white transition"
          >
            Become a member
          </Link>
        )}
      </nav>
    </header>
  );
}

function DropdownLink({
  href, icon, children, accent = false,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 text-sm transition
        ${accent ? "text-indigo-300 hover:bg-indigo-500/8" : "text-white/70 hover:text-white hover:bg-white/5"}`}
    >
      <span className={accent ? "text-indigo-400" : "text-white/35"}>{icon}</span>
      {children}
    </Link>
  );
}