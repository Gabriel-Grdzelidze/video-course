"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { CREATE_COURSE } from "../../lib/graphql/mutations";

// ── constants matching your schema enums ─────────────────────────────────────
const TOPICS = ["Development", "Design", "AI & ML", "Marketing", "Business", "Data Science", "Video"];
const LEVELS = [
  { value: "Beginner", desc: "No prior knowledge required" },
  { value: "Intermediate", desc: "Some experience needed" },
  { value: "Advanced", desc: "Expert-level content" },
];
const PRICE_PRESETS = [0, 29, 49, 79, 99, 119];

function toSlug(str: string) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewCoursePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    topic: "",
    level: "",
    price: "0",
    isFree: true,
  });

  const [createCourse, { loading }] = useMutation(CREATE_COURSE);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((f) => {
        const next = { ...f, [key]: value };
        if (key === "title" && !slugEdited) next.slug = toSlug(value);
        return next;
      });
    };

  const setPrice = (val: string) => {
    const num = parseFloat(val) || 0;
    setForm((f) => ({ ...f, price: val, isFree: num === 0 }));
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const { url } = await res.json();
      setForm((f) => ({ ...f, thumbnail: url }));
    } catch {
      const r2 = new FileReader();
      r2.onload = (e) => setForm((f) => ({ ...f, thumbnail: e.target?.result as string }));
      r2.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags((p) => [...p, t]);
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title || !form.slug || !form.description || !form.topic || !form.level) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      const { data } = await createCourse({
        variables: {
          title: form.title,
          slug: form.slug,
          description: form.description,
          thumbnail: form.thumbnail || null,
          price: parseFloat(form.price) || 0,
          isFree: form.isFree,
          topic: form.topic,
          level: form.level,
          tags,
        },
      });
      router.push(`/instructor/courses/${data.createCourse.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const step1Valid = !!(form.title && form.description && form.topic && form.level);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* header */}
      <header className="sticky top-0 z-40 flex items-center gap-5 px-8 py-4 border-b border-white/[0.07] bg-[#0a0a0f]/80 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium border border-white/10 px-3 py-1.5 rounded-lg transition-colors bg-transparent cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold">• LearnFlow</span>
          <span className="text-white/25">/</span>
          <span className="text-white/40">New Course</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10 pb-24">

        {/* heading */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight mb-2">Create a new course</h1>
          <p className="text-white/40 text-[15px]">Fill in the details to publish your course to LearnFlow students.</p>
        </div>

        {/* step tabs */}
        <div className="flex border-b border-white/[0.07] mb-8">
          {[{ n: 1, label: "Course details" }, { n: 2, label: "Pricing & review" }].map(({ n, label }) => (
            <button
              key={n}
              type="button"
              onClick={() => { if (n === 2 && !step1Valid) return; setStep(n as 1 | 2); }}
              className={`flex items-center gap-2.5 px-5 py-3 -mb-px text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer
                ${step === n ? "border-indigo-500 text-white" : "border-transparent text-white/35 hover:text-white/60"}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors
                ${step === n ? "bg-indigo-500 text-white" : "bg-white/8 text-white/35"}`}>
                {n}
              </span>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="grid grid-cols-[1fr_360px] gap-8">

              {/* left col */}
              <div className="flex flex-col gap-6">

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-white/65 tracking-wide">
                    Course title <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    value={form.title} onChange={set("title")}
                    placeholder="e.g. React & Next.js 15 Bootcamp"
                    maxLength={120} required
                    className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  <span className="text-[11px] text-white/25 text-right">{form.title.length}/120</span>
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-white/65 tracking-wide">
                    URL slug <span className="text-indigo-400">*</span>
                    <span className="ml-2 font-normal text-white/25 text-[12px]">auto-generated</span>
                  </label>
                  <div className="flex items-center bg-[#1a1a26] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                    <span className="px-4 py-2.5 text-white/20 text-sm border-r border-white/[0.08] select-none shrink-0">/courses/</span>
                    <input
                      value={form.slug}
                      onChange={(e) => { setSlugEdited(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
                      placeholder="my-course-slug"
                      className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-white/65 tracking-wide">
                    Description <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    value={form.description} onChange={set("description")}
                    placeholder="What will students learn? What topics are covered?"
                    rows={5} required
                    className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors resize-y min-h-[120px]"
                  />
                </div>

                {/* Topic + Level selects */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "topic" as const, label: "Topic", options: TOPICS },
                    { key: "level" as const, label: "Level", options: LEVELS.map((l) => l.value) },
                  ].map(({ key, label, options }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-white/65 tracking-wide">
                        {label} <span className="text-indigo-400">*</span>
                      </label>
                      <select
                        value={form[key]} onChange={set(key)} required
                        className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                      >
                        <option value="" className="bg-[#1a1a26]">Select {label.toLowerCase()}</option>
                        {options.map((o) => <option key={o} value={o} className="bg-[#1a1a26]">{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-white/65 tracking-wide">
                    Tags <span className="text-white/25 font-normal">(up to 8, press Enter or Add)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="e.g. react, typescript…"
                      className="flex-1 bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
                    />
                    <button type="button" onClick={addTag}
                      className="bg-[#1a1a26] hover:bg-white/8 border border-white/[0.08] rounded-xl px-5 py-2.5 text-sm font-semibold text-white/60 hover:text-white transition-colors cursor-pointer">
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tags.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1.5 bg-indigo-500/12 border border-indigo-500/25 text-indigo-300 rounded-full px-3 py-1 text-[12px] font-medium">
                          {t}
                          <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))}
                            className="text-indigo-300/50 hover:text-indigo-200 cursor-pointer bg-transparent border-none text-sm leading-none">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* right col */}
              <div className="flex flex-col gap-6">

                {/* Thumbnail drop zone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-white/65 tracking-wide">
                    Thumbnail <span className="text-white/25 font-normal">(16:9)</span>
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={`relative aspect-video rounded-2xl overflow-hidden cursor-pointer border-2 transition-all flex items-center justify-center group
                      ${dragOver ? "border-indigo-500 bg-indigo-500/8" : preview ? "border-white/10" : "border-dashed border-white/10 bg-[#1a1a26] hover:border-white/20"}`}
                  >
                    {preview ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-sm font-semibold">Click to replace</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-6 text-center">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/25">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <p className="text-sm font-medium text-white/60">
                          {uploading ? "Uploading…" : "Drag & drop or click"}
                        </p>
                        <p className="text-[12px] text-white/25">PNG, JPG, WEBP</p>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  </div>
                </div>

                {/* Level cards */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-white/65 tracking-wide">Level</label>
                  <div className="flex flex-col gap-2">
                    {LEVELS.map((l) => (
                      <button
                        key={l.value} type="button"
                        onClick={() => setForm((f) => ({ ...f, level: l.value }))}
                        className={`flex flex-col gap-0.5 items-start px-4 py-3 rounded-xl border text-left transition-all cursor-pointer
                          ${form.level === l.value ? "border-indigo-500 bg-indigo-500/8" : "border-white/[0.07] bg-[#1a1a26] hover:border-white/18"}`}
                      >
                        <span className="text-[13px] font-semibold">{l.value}</span>
                        <span className="text-[12px] text-white/35">{l.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-6">

              {/* Pricing */}
              <div className="bg-[#12121a] border border-white/[0.07] rounded-2xl p-7">
                <h2 className="text-[17px] font-bold tracking-tight mb-1">Pricing</h2>
                <p className="text-white/35 text-sm mb-6">Set a price or make the course free</p>

                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 font-semibold pointer-events-none">$</span>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.price} onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#1a1a26] border border-white/[0.08] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {PRICE_PRESETS.map((p) => (
                      <button key={p} type="button" onClick={() => setPrice(p.toString())}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer
                          ${form.price === p.toString()
                            ? "bg-indigo-500/18 border-indigo-500 text-indigo-300"
                            : "bg-transparent border-white/10 text-white/35 hover:border-white/22 hover:text-white/60"}`}>
                        {p === 0 ? "Free" : `$${p}`}
                      </button>
                    ))}
                  </div>

                  {form.isFree && (
                    <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-emerald-400 text-[13px] font-medium">This course will be free for all students</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#12121a] border border-white/[0.07] rounded-2xl p-7">
                <h2 className="text-[17px] font-bold tracking-tight mb-1">Review</h2>
                <p className="text-white/35 text-sm mb-6">Double-check everything before creating</p>
                <div className="flex flex-col">
                  {[
                    { label: "Title", value: form.title },
                    { label: "Slug", value: form.slug ? `/courses/${form.slug}` : "" },
                    { label: "Topic", value: form.topic },
                    { label: "Level", value: form.level },
                    { label: "Price", value: form.isFree ? "Free" : `$${form.price}` },
                    { label: "Tags", value: tags.length ? tags.join(", ") : "—" },
                    { label: "Thumbnail", value: form.thumbnail ? "✓ Uploaded" : "⚠ Not uploaded" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start py-2.5 border-b border-white/[0.05] gap-4 last:border-0">
                      <span className="text-[13px] text-white/35 font-medium shrink-0">{label}</span>
                      <span className={`text-[13px] text-right break-all max-w-[200px]
                        ${value?.startsWith("⚠") ? "text-amber-400" : value?.startsWith("✓") ? "text-emerald-400" : "text-white/75"}`}>
                        {value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* error */}
          {error && (
            <div className="flex items-center gap-2.5 mt-6 bg-red-500/8 border border-red-500/22 text-red-300 rounded-xl px-4 py-3 text-[13px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* footer */}
          <div className="mt-10 pt-6 border-t border-white/[0.06]">
            {step === 1 ? (
              <div className="flex justify-end">
                <button type="button" disabled={!step1Valid} onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-35 disabled:cursor-not-allowed text-white font-semibold text-sm px-7 py-3 rounded-xl transition-colors cursor-pointer">
                  Continue
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-2 bg-transparent border border-white/10 hover:border-white/22 text-white/45 hover:text-white font-medium text-sm px-6 py-3 rounded-xl transition-colors cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M5 12l7 7M5 12l7-7"/></svg>
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-7 py-3 rounded-xl transition-colors cursor-pointer">
                  {loading && (
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  )}
                  {loading ? "Creating…" : "Create course"}
                </button>
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}