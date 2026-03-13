import Link from "next/link";

const LINKS = {
  Company: ["About us", "Careers", "Press", "Blog"],
  Courses: ["Browse all", "Categories", "Instructors", "Certificates"],
  Support: ["Help center", "Contact us", "Privacy policy", "Terms of service"],
  Community: ["Student forum", "Discord", "Affiliate program", "Become an instructor"],
};

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0F] border-t border-white/10 mt-20">
      <div className="border-b border-white/10 py-10 px-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 flex-wrap">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Stay in the loop</h3>
            <p className="text-white/40 text-sm">Get new courses, discounts and tips straight to your inbox.</p>
          </div>
          <div className="flex gap-3 flex-1 max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-[#13131A] border border-white/10 text-white placeholder-white/30 px-4 py-2.5 rounded-lg text-sm outline-none focus:border-indigo-500/50 transition"
            />
            <button className="bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-extrabold text-xl text-white mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
            LearnFlow
          </div>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            Expert-led video courses that get you hired. Learn at your own pace.
          </p>
          <div className="flex gap-3">
            {["X", "in", "YT", "ig"].map(function(s) {
              return (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/50 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30 transition"
                >
                  {s}
                </a>
              );
            })}
          </div>
        </div>

        {Object.entries(LINKS).map(function(entry) {
          var title = entry[0];
          var links = entry[1];
          return (
            <div key={title}>
              <h4 className="text-white text-sm font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map(function(link) {
                  return (
                    <li key={link}>
                      <Link href="#" className="text-white/40 text-sm hover:text-white transition">
                        {link}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 px-10 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} LearnFlow. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy policy", "Terms of service", "Cookie settings"].map(function(item) {
              return (
                <Link key={item} href="#" className="text-white/30 text-xs hover:text-white transition">
                  {item}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}