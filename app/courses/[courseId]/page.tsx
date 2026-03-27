'use client'
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import {
  CREATE_SECTION, UPDATE_SECTION, DELETE_SECTION,
  CREATE_LESSON, DELETE_LESSON,
  PUBLISH_COURSE, UNPUBLISH_COURSE, UPDATE_COURSE,
} from "../../../lib/graphql/mutations";

// ── queries ───────────────────────────────────────────────────────────────────
const GET_COURSE_EDITOR = gql`
  query GetCourseEditor($id: ID!) {
    getCourseById(id: $id) {
      id title slug description thumbnail topic level price isFree isPublished
      rating { average count }
    }
    getSectionsByCourse(courseId: $id) {
      id title order
      lessons { id title duration order isFree isQuiz videoUrl }
    }
  }
`;

const TOPICS = ["Development", "Design", "AI & ML", "Marketing", "Business", "Data Science", "Video"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

// ── types ─────────────────────────────────────────────────────────────────────
interface Lesson {
  id: string; title: string; duration?: number; order: number;
  isFree: boolean; isQuiz: boolean; videoUrl?: string;
}
interface Section {
  id: string; title: string; order: number; lessons: Lesson[];
}
interface Course {
  id: string; title: string; slug: string; description: string;
  thumbnail?: string; topic: string; level: string;
  price: number; isFree: boolean; isPublished: boolean;
  rating?: { average: number; count: number };
}

// ── component ─────────────────────────────────────────────────────────────────
export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, loading, refetch } = useQuery(GET_COURSE_EDITOR, { variables: { id } });

  const [createSection] = useMutation(CREATE_SECTION);
  const [updateSection] = useMutation(UPDATE_SECTION);
  const [deleteSection] = useMutation(DELETE_SECTION);
  const [createLesson] = useMutation(CREATE_LESSON);
  const [deleteLesson] = useMutation(DELETE_LESSON);
  const [publishCourse] = useMutation(PUBLISH_COURSE);
  const [unpublishCourse] = useMutation(UNPUBLISH_COURSE);
  const [updateCourse] = useMutation(UPDATE_COURSE);

  const [activeTab, setActiveTab] = useState<"content" | "settings">("content");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", videoUrl: "", duration: "", isFree: false, isQuiz: false });
  const [settingsForm, setSettingsForm] = useState<Partial<Course>>({});
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  const course: Course | undefined = data?.getCourseById;
  const sections: Section[] = data?.getSectionsByCourse ?? [];

  // init settings form from course
  const settings = {
    title: settingsForm.title ?? course?.title ?? "",
    description: settingsForm.description ?? course?.description ?? "",
    topic: settingsForm.topic ?? course?.topic ?? "",
    level: settingsForm.level ?? course?.level ?? "",
    price: settingsForm.price ?? course?.price ?? 0,
  };

  const toggleSection = (id: string) =>
    setExpandedSections((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  // ── section ops ──────────────────────────────────────────────────────────
  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    await createSection({ variables: { title: newSectionTitle.trim(), order: sections.length, courseId: id } });
    setNewSectionTitle(""); setAddingSection(false);
    refetch();
  };

  const handleUpdateSection = async (sectionId: string) => {
    if (!editingSectionTitle.trim()) return;
    await updateSection({ variables: { id: sectionId, title: editingSectionTitle.trim() } });
    setEditingSectionId(null);
    refetch();
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section and all its lessons?")) return;
    await deleteSection({ variables: { id: sectionId } });
    refetch();
  };

  // ── lesson ops ────────────────────────────────────────────────────────────
  const handleAddLesson = async (sectionId: string, lessonCount: number) => {
    if (!lessonForm.title.trim()) return;
    await createLesson({
      variables: {
        title: lessonForm.title.trim(),
        videoUrl: lessonForm.videoUrl || null,
        duration: lessonForm.duration ? parseInt(lessonForm.duration) : null,
        order: lessonCount,
        isFree: lessonForm.isFree,
        isQuiz: lessonForm.isQuiz,
        courseId: id,
        sectionId,
      },
    });
    setLessonForm({ title: "", videoUrl: "", duration: "", isFree: false, isQuiz: false });
    setAddingLessonTo(null);
    refetch();
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    await deleteLesson({ variables: { id: lessonId } });
    refetch();
  };

  // ── publish ───────────────────────────────────────────────────────────────
  const handleTogglePublish = async () => {
    setPublishLoading(true);
    if (course?.isPublished) {
      await unpublishCourse({ variables: { id } });
    } else {
      await publishCourse({ variables: { id } });
    }
    setPublishLoading(false);
    refetch();
  };

  // ── settings save ─────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    await updateCourse({
      variables: {
        id,
        title: settings.title,
        description: settings.description,
        topic: settings.topic,
        level: settings.level,
        price: parseFloat(String(settings.price)) || 0,
        isFree: parseFloat(String(settings.price)) === 0,
      },
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
    refetch();
  };

  if (loading) return <EditorSkeleton />;
  if (!course) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white/40">
      Course not found
    </div>
  );

  const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* ── top bar ── */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-8 py-3.5 border-b border-white/[0.07] bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/instructor/me")}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition bg-transparent border-none cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M5 12l7 7M5 12l7-7"/>
            </svg>
            Dashboard
          </button>
          <span className="text-white/15">/</span>
          <span className="text-sm font-medium truncate max-w-xs">{course.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full border
            ${course.isPublished
              ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/20"
              : "bg-white/5 text-white/30 border-white/10"}`}>
            {course.isPublished ? "● Live" : "○ Draft"}
          </span>
          <button
            onClick={handleTogglePublish}
            disabled={publishLoading}
            className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-colors cursor-pointer disabled:opacity-50
              ${course.isPublished
                ? "bg-transparent border-white/10 text-white/50 hover:border-red-500/40 hover:text-red-400"
                : "bg-indigo-600 hover:bg-indigo-500 border-transparent text-white"}`}
          >
            {publishLoading ? "…" : course.isPublished ? "Unpublish" : "Publish course"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* ── tabs ── */}
        <div className="flex border-b border-white/[0.07] mb-8">
          {(["content", "settings"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 -mb-px text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer capitalize
                ${activeTab === tab ? "border-indigo-500 text-white" : "border-transparent text-white/35 hover:text-white/60"}`}>
              {tab === "content" ? `Course content · ${totalLessons} lessons` : "Settings"}
            </button>
          ))}
        </div>

        {/* ══ CONTENT TAB ══════════════════════════════════════════════════ */}
        {activeTab === "content" && (
          <div className="flex flex-col gap-3">

            {sections.map((section, sIdx) => {
              const isExpanded = expandedSections.has(section.id);
              const isEditing = editingSectionId === section.id;

              return (
                <div key={section.id} className="bg-[#12121a] border border-white/[0.07] rounded-2xl overflow-hidden">

                  {/* section header */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    <button onClick={() => toggleSection(section.id)}
                      className={`text-white/30 hover:text-white transition-transform duration-200 cursor-pointer bg-transparent border-none ${isExpanded ? "rotate-90" : ""}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                    </button>

                    <span className="text-[11px] font-bold text-white/25 uppercase tracking-widest w-6 shrink-0">
                      {sIdx + 1}
                    </span>

                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          autoFocus
                          value={editingSectionTitle}
                          onChange={(e) => setEditingSectionTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleUpdateSection(section.id); if (e.key === "Escape") setEditingSectionId(null); }}
                          className="flex-1 bg-[#1e1e2e] border border-indigo-500/50 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
                        />
                        <button onClick={() => handleUpdateSection(section.id)}
                          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium cursor-pointer bg-transparent border-none">Save</button>
                        <button onClick={() => setEditingSectionId(null)}
                          className="text-white/30 hover:text-white text-sm cursor-pointer bg-transparent border-none">Cancel</button>
                      </div>
                    ) : (
                      <span className="flex-1 font-semibold text-sm">{section.title}</span>
                    )}

                    <span className="text-[12px] text-white/25 shrink-0">{section.lessons.length} lessons</span>

                    <div className="flex items-center gap-1 ml-2">
                      <IconBtn onClick={() => { setEditingSectionId(section.id); setEditingSectionTitle(section.title); }} title="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </IconBtn>
                      <IconBtn onClick={() => handleDeleteSection(section.id)} title="Delete" danger>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      </IconBtn>
                    </div>
                  </div>

                  {/* lessons */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.05]">
                      {section.lessons.length === 0 && addingLessonTo !== section.id && (
                        <p className="text-white/25 text-[13px] text-center py-5">No lessons yet</p>
                      )}

                      {section.lessons.map((lesson, lIdx) => (
                        <LessonRow
                          key={lesson.id}
                          lesson={lesson}
                          index={lIdx}
                          onDelete={() => handleDeleteLesson(lesson.id)}
                        />
                      ))}

                      {/* add lesson form */}
                      {addingLessonTo === section.id ? (
                        <div className="px-5 py-4 bg-[#16161f] border-t border-white/[0.05]">
                          <p className="text-[12px] font-semibold text-white/40 uppercase tracking-widest mb-3">New lesson</p>
                          <div className="flex flex-col gap-3">
                            <input
                              autoFocus
                              value={lessonForm.title}
                              onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                              placeholder="Lesson title *"
                              className="bg-[#1e1e2e] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                value={lessonForm.videoUrl}
                                onChange={(e) => setLessonForm((f) => ({ ...f, videoUrl: e.target.value }))}
                                placeholder="Video URL (optional)"
                                className="bg-[#1e1e2e] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
                              />
                              <input
                                type="number"
                                value={lessonForm.duration}
                                onChange={(e) => setLessonForm((f) => ({ ...f, duration: e.target.value }))}
                                placeholder="Duration (seconds)"
                                className="bg-[#1e1e2e] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              <Toggle
                                checked={lessonForm.isFree}
                                onChange={(v) => setLessonForm((f) => ({ ...f, isFree: v }))}
                                label="Free preview"
                              />
                              <Toggle
                                checked={lessonForm.isQuiz}
                                onChange={(v) => setLessonForm((f) => ({ ...f, isQuiz: v }))}
                                label="Quiz lesson"
                              />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleAddLesson(section.id, section.lessons.length)}
                                disabled={!lessonForm.title.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2 rounded-xl transition-colors cursor-pointer"
                              >
                                Add lesson
                              </button>
                              <button
                                onClick={() => { setAddingLessonTo(null); setLessonForm({ title: "", videoUrl: "", duration: "", isFree: false, isQuiz: false }); }}
                                className="text-white/35 hover:text-white text-sm px-4 py-2 cursor-pointer bg-transparent border-none"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 py-3 border-t border-white/[0.04]">
                          <button
                            onClick={() => { setAddingLessonTo(section.id); toggleSection(section.id) || setExpandedSections((p) => new Set([...p, section.id])); }}
                            className="flex items-center gap-2 text-[13px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer bg-transparent border-none transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add lesson
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* add section */}
            {addingSection ? (
              <div className="bg-[#12121a] border border-indigo-500/30 rounded-2xl px-5 py-4 flex items-center gap-3">
                <input
                  autoFocus
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddSection(); if (e.key === "Escape") setAddingSection(false); }}
                  placeholder="Section title…"
                  className="flex-1 bg-[#1e1e2e] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button onClick={handleAddSection} disabled={!newSectionTitle.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer">
                  Add
                </button>
                <button onClick={() => setAddingSection(false)}
                  className="text-white/35 hover:text-white text-sm cursor-pointer bg-transparent border-none">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSection(true)}
                className="flex items-center justify-center gap-2 w-full bg-transparent border-2 border-dashed border-white/[0.08] hover:border-indigo-500/40 hover:bg-indigo-500/5 text-white/35 hover:text-indigo-400 font-medium text-sm py-4 rounded-2xl transition-all cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add section
              </button>
            )}
          </div>
        )}

        {/* ══ SETTINGS TAB ═════════════════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-[1fr_320px] gap-6">
            <div className="flex flex-col gap-5">

              <Field label="Course title *">
                <input value={settings.title}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, title: e.target.value }))}
                  className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors" />
              </Field>

              <Field label="Description *">
                <textarea value={settings.description}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, description: e.target.value }))}
                  rows={5}
                  className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors resize-y min-h-[120px]" />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Topic *">
                  <select value={settings.topic}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, topic: e.target.value }))}
                    className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
                    {TOPICS.map((t) => <option key={t} value={t} className="bg-[#1a1a26]">{t}</option>)}
                  </select>
                </Field>
                <Field label="Level *">
                  <select value={settings.level}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, level: e.target.value }))}
                    className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
                    {LEVELS.map((l) => <option key={l} value={l} className="bg-[#1a1a26]">{l}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Price ($)">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 font-semibold pointer-events-none">$</span>
                  <input type="number" min="0" step="0.01"
                    value={settings.price}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-[#1a1a26] border border-white/[0.08] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors" />
                </div>
              </Field>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSaveSettings}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer">
                  {settingsSaved
                    ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
                    : "Save changes"}
                </button>
              </div>
            </div>

            {/* course card preview */}
            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-semibold text-white/40 uppercase tracking-widest">Preview</p>
              <div className="bg-[#12121a] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="aspect-video bg-[#1e1e2e] flex items-center justify-center">
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 truncate">{settings.title || course.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] text-white/30">{settings.topic || course.topic}</span>
                    <span className="text-white/15">·</span>
                    <span className="text-[11px] text-white/30">{settings.level || course.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-400 font-bold text-sm">
                      {parseFloat(String(settings.price)) === 0 ? "Free" : `$${settings.price}`}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border
                      ${course.isPublished ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/25 border-white/8"}`}>
                      {course.isPublished ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── lesson row ────────────────────────────────────────────────────────────────
function LessonRow({ lesson, index, onDelete }: { lesson: Lesson; index: number; onDelete: () => void }) {
  const mins = lesson.duration ? Math.floor(lesson.duration / 60) : null;

  return (
    <div className="group flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] border-t border-white/[0.04] transition-colors">
      <span className="text-[11px] font-bold text-white/20 w-5 shrink-0 text-center">{index + 1}</span>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        {lesson.isQuiz ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400 shrink-0">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/25 shrink-0">
            <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
        )}
        <span className="text-sm truncate">{lesson.title}</span>
        {lesson.isFree && (
          <span className="shrink-0 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
            Free
          </span>
        )}
      </div>

      {mins !== null && (
        <span className="text-[12px] text-white/25 shrink-0">{mins}m</span>
      )}

      <button onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/25 hover:text-red-400 cursor-pointer bg-transparent border-none ml-1">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
      </button>
    </div>
  );
}

// ── small helpers ─────────────────────────────────────────────────────────────
function IconBtn({ onClick, children, title, danger = false }: { onClick: () => void; children: React.ReactNode; title: string; danger?: boolean }) {
  return (
    <button onClick={onClick} title={title}
      className={`p-1.5 rounded-lg transition-colors cursor-pointer bg-transparent border-none
        ${danger ? "text-white/20 hover:text-red-400 hover:bg-red-500/10" : "text-white/20 hover:text-white hover:bg-white/8"}`}>
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-white/55 tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-8 h-4.5 rounded-full relative transition-colors cursor-pointer
          ${checked ? "bg-indigo-500" : "bg-white/15"}`}
        style={{ width: 32, height: 18 }}
      >
        <span
          className="absolute top-0.5 transition-transform rounded-full bg-white"
          style={{ width: 14, height: 14, left: 2, transform: checked ? "translateX(14px)" : "translateX(0)" }}
        />
      </div>
      <span className="text-[13px] text-white/50">{label}</span>
    </label>
  );
}

function EditorSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-8 py-8 flex flex-col gap-4 animate-pulse">
        <div className="h-12 bg-[#12121a] rounded-2xl" />
        <div className="h-8 bg-[#12121a] rounded-xl w-48" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#12121a] rounded-2xl" />)}
      </div>
    </div>
  );
}