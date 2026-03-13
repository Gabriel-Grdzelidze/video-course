"use client";
import { useState } from "react";

const TOPICS = [
  "All Courses",
  "Programming & Tech",
  "Design",
  "AI & ML",
  "Marketing",
  "Business",
  "Data Science",
];

export default function FilterBar() {
  const [activeTopic, setActiveTopic] = useState("All Courses");
  const [activeLevel, setActiveLevel] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [openDrop, setOpenDrop] = useState(null);

  const toggleDrop = (name) =>
    setOpenDrop((prev) => (prev === name ? null : name));

  return (
    <>
      {/* Category Tabs */}
      <div className="sticky top-16 z-40 bg-[#13131A] border-b border-white/10">
        <div className="flex overflow-x-auto px-10">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={`whitespace-nowrap px-5 py-4 text-sm border-b-2 transition-colors ${
                activeTopic === topic
                  ? "text-white border-indigo-500"
                  : "text-white/40 border-transparent hover:text-white"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3 px-10 py-4 border-b border-white/10 flex-wrap">
        <span className="text-sm text-white/40">Filter by:</span>

        {/* Budget Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDrop("price")}
            className="flex items-center gap-2 border border-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/5 transition"
          >
            Budget <span className="text-xs text-white/40">▼</span>
          </button>
          {openDrop === "price" && (
            <div className="absolute top-full mt-2 left-0 w-56 bg-[#1a1a24] border border-white/10 rounded-xl p-4 z-50">
              <p className="text-xs text-white/40 mb-2">Price range (USD)</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full bg-[#1C1C27] border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50"
                />
                <span className="text-white/40">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full bg-[#1C1C27] border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50"
                />
              </div>
              <button
                onClick={() => setOpenDrop(null)}
                className="w-full mt-3 bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium hover:opacity-85 transition"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Level Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDrop("level")}
            className="flex items-center gap-2 border border-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/5 transition"
          >
            {activeLevel || "Level"} <span className="text-xs text-white/40">▼</span>
          </button>
          {openDrop === "level" && (
            <div className="absolute top-full mt-2 left-0 w-44 bg-[#1a1a24] border border-white/10 rounded-xl p-2 z-50">
              {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { setActiveLevel(lvl); setOpenDrop(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    activeLevel === lvl
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Tags */}
        {activeLevel && (
          <span className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs">
            {activeLevel}
            <button onClick={() => setActiveLevel("")} className="ml-1 text-sm leading-none">×</button>
          </span>
        )}
        {(priceMin || priceMax) && (
          <span className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs">
            ${priceMin || "0"} – ${priceMax || "∞"}
            <button onClick={() => { setPriceMin(""); setPriceMax(""); }} className="ml-1 text-sm leading-none">×</button>
          </span>
        )}
      </div>
    </>
  );
}