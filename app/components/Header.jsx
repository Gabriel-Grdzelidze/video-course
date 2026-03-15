export default function Header() {
    return (
      <header className="sticky top-0 z-50 flex items-center justify-between px-10 h-16 bg-[#0A0A0F]/95 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 font-extrabold text-xl text-white">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          LearnFlow
        </div>
        <div className="flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder="Search for a course..."
            className="w-full bg-[#13131A] border border-white/10 text-white placeholder-white/30 px-4 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50 transition"
          />
        </div>
        <nav className="flex items-center gap-6">
          <a href="#" className="text-sm text-white/50 hover:text-white transition">Orders</a>
          <button className="border border-indigo-500 text-indigo-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 hover:text-white transition">
            <a href="/auth">Become a member</a>
          </button>
        </nav>
      </header>
    );
  }