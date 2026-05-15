"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const GET_COURSE_FOR_EDIT = gql`
  query GetCourseForEdit($id: ID!) {
    getCourseById(id: $id) {
      id
      title
      description
      thumbnail
      price
      isFree
      topic
      level
      isPublished
    }
    getSectionsByCourse(courseId: $id) {
      id
      title
      order
      lessons {
        id
        title
        videoUrl
        order
      }
    }
  }
`;

const CREATE_SECTION = gql`
  mutation CreateSection($title: String!, $order: Int!, $courseId: ID!) {
    createSection(title: $title, order: $order, courseId: $courseId) {
      id
      title
      order
    }
  }
`;

const DELETE_SECTION = gql`
  mutation DeleteSection($id: ID!) {
    deleteSection(id: $id)
  }
`;

const CREATE_LESSON = gql`
  mutation CreateLesson(
    $title: String!
    $videoUrl: String
    $order: Int!
    $courseId: ID!
    $sectionId: ID!
  ) {
    createLesson(
      title: $title
      videoUrl: $videoUrl
      order: $order
      courseId: $courseId
      sectionId: $sectionId
    ) {
      id
      title
      videoUrl
      order
    }
  }
`;

const DELETE_LESSON = gql`
  mutation DeleteLesson($id: ID!) {
    deleteLesson(id: $id)
  }
`;

const UPDATE_LESSON = gql`
  mutation UpdateLesson($id: ID!, $title: String, $videoUrl: String, $subtitleUrl: String) {
    updateLesson(id: $id, title: $title, videoUrl: $videoUrl, subtitleUrl: $subtitleUrl) {
      id
      title
      videoUrl
      subtitleUrl
    }
  }
`;

const UPDATE_COURSE = gql`
  mutation UpdateCourse(
    $id: ID!
    $title: String
    $description: String
    $thumbnail: String
    $price: Float
    $isFree: Boolean
    $topic: String
    $level: String
    $isPublished: Boolean
  ) {
    updateCourse(
      id: $id
      title: $title
      description: $description
      thumbnail: $thumbnail
      price: $price
      isFree: $isFree
      topic: $topic
      level: $level
      isPublished: $isPublished
    ) {
      id
      title
      isPublished
    }
  }
`;

export default function InstructorEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState<Record<string, "processing" | "completed" | "error">>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: 0,
    isFree: false,
    topic: "Development",
    level: "Beginner",
    isPublished: false,
  });

  const { data, loading, refetch } = useQuery<{ getCourseById: typeof form; getSectionsByCourse: any[] }>(GET_COURSE_FOR_EDIT, {
    variables: { id },
    fetchPolicy: "network-only",
  });

  const [updateCourse] = useMutation(UPDATE_COURSE);
  const [createSection] = useMutation(CREATE_SECTION);
  const [deleteSection] = useMutation(DELETE_SECTION);
  const [createLesson] = useMutation(CREATE_LESSON);
  const [deleteLesson] = useMutation(DELETE_LESSON);
  const [updateLesson] = useMutation(UPDATE_LESSON);

  useEffect(() => {
    if (data?.getCourseById) {
      const course = data.getCourseById;
      setForm({
        title: course.title || "",
        description: course.description || "",
        thumbnail: course.thumbnail || "",
        price: course.price || 0,
        isFree: course.isFree || false,
        topic: course.topic || "Development",
        level: course.level || "Beginner",
        isPublished: course.isPublished || false,
      });
    }
    if (data?.getSectionsByCourse) {
      setSections(
        [...data.getSectionsByCourse].sort((a: any, b: any) => a.order - b.order)
      );
    }
  }, [data]);

  const handleFileUpload = async (
    file: File,
    type: "thumbnail" | "video",
    lessonId?: string,
    sectionId?: string,
  ) => {
    if (!file) return;
    setUploading(lessonId || "thumbnail");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const { uploadUrl, fileUrl } = await res.json();
      await fetch(uploadUrl, { method: "PUT", body: file });

      if (type === "thumbnail") {
        setForm((prev) => ({ ...prev, thumbnail: fileUrl }));
      } else if (type === "video" && lessonId && sectionId) {
        if (!lessonId.startsWith("new-")) {
          await updateLesson({ variables: { id: lessonId, videoUrl: fileUrl } });
          await refetch();
        
          setTranscribing((prev) => ({ ...prev, [lessonId]: "processing" }));

          fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoUrl: fileUrl, lessonId }),
          }).then(r => r.json()).then(({ transcriptId }) => {
            if (!transcriptId) {
              setTranscribing((prev) => ({ ...prev, [lessonId]: "error" }));
              return;
            }
            console.log("Transcription started:", transcriptId);
            const poll = setInterval(async () => {
              const res = await fetch(`/api/transcribe?transcriptId=${transcriptId}`).then(r => r.json());
              console.log("Transcription status:", res.status);
              if (res.status === "completed" && res.vtt) {
                clearInterval(poll);
                const blob = new Blob([res.vtt], { type: "text/vtt" });
                const uploadRes = await fetch("/api/upload", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ fileName: `${lessonId}.vtt`, fileType: "text/vtt" }),
                }).then(r => r.json());
                await fetch(uploadRes.uploadUrl, { method: "PUT", body: blob });
                await updateLesson({ variables: { id: lessonId, subtitleUrl: uploadRes.fileUrl } });
                console.log("Subtitles saved:", uploadRes.fileUrl);
                
                setTranscribing((prev) => ({ ...prev, [lessonId]: "completed" }));
                setTimeout(() => {
                  setTranscribing((prev) => {
                    const copy = { ...prev };
                    delete copy[lessonId];
                    return copy;
                  });
                }, 4000);

              } else if (res.status === "error") {
                clearInterval(poll);
                console.error("Transcription failed");
                setTranscribing((prev) => ({ ...prev, [lessonId]: "error" }));
              }
            }, 10000);
          }).catch(() => {
            setTranscribing((prev) => ({ ...prev, [lessonId]: "error" }));
          });
        } else {
          setSections((prev) =>
            prev.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    lessons: s.lessons.map((l: any) =>
                      l.id === lessonId ? { ...l, videoUrl: fileUrl } : l
                    ),
                  }
                : s
            )
          );
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(null);
    }
  };

  const handleAddSection = async () => {
    const title = `Section ${sections.length + 1}`;
    try {
      const result = await createSection({
        variables: { title, order: sections.length + 1, courseId: id },
      });
      setSections((prev) => [...prev, { ...(result.data as any).createSection, lessons: [] }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteSection({ variables: { id: sectionId } });
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title } : s))
    );
  };

  const handleAddLesson = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    const order = (section?.lessons?.length || 0) + 1;
    try {
      const result = await createLesson({
        variables: {
          title: `Lesson ${order}`,
          order,
          courseId: id,
          sectionId,
        },
      });
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, lessons: [...(s.lessons || []), (result.data as any).createLesson] }
            : s
        )
      );
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteLesson = async (lessonId: string, sectionId: string) => {
    try {
      await deleteLesson({ variables: { id: lessonId } });
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, lessons: s.lessons.filter((l: any) => l.id !== lessonId) }
            : s
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLessonTitle = async (lessonId: string, sectionId: string, title: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.map((l: any) =>
                l.id === lessonId ? { ...l, title } : l
              ),
            }
          : s
      )
    );
  };

  const handleSaveLessonTitle = async (lessonId: string, title: string) => {
    try {
      await updateLesson({ variables: { id: lessonId, title } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateCourse({
        variables: {
          id,
          title: form.title,
          description: form.description,
          thumbnail: form.thumbnail,
          price: parseFloat(form.price.toString()),
          isFree: form.isFree,
          topic: form.topic,
          level: form.level,
          isPublished: form.isPublished,
        },
      });
      router.push(`/instructor/me`);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-indigo-500 font-mono">
        LOADING_DATA...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {previewVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
          onClick={() => setPreviewVideo(null)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold uppercase tracking-widest text-white/50">Preview</span>
              <button onClick={() => setPreviewVideo(null)} className="text-white/50 hover:text-white text-2xl">✕</button>
            </div>
            <video src={previewVideo} controls autoPlay className="w-full rounded-2xl bg-black" />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-[#12121a] p-6 rounded-2xl border border-white/5">
          <div>
            <h1 className="text-2xl font-bold">Course Management</h1>
            <p className="text-white/40 text-sm">Editing ID: {id}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-medium"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all text-sm font-bold shadow-lg shadow-indigo-500/20"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#12121a] border border-white/5 p-8 rounded-3xl space-y-6">
              <h2 className="text-xl font-semibold border-b border-white/5 pb-4">General Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase text-white/30 font-bold ml-1">Title</label>
                  <input
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase text-white/30 font-bold ml-1">Description</label>
                  <textarea
                    rows={4}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none resize-none"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase text-white/30 font-bold ml-1 block mb-2">Topic</label>
                    <select
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none"
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    >
                      <option>Development</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Business</option>
                      <option>Music</option>
                      <option>Photography</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase text-white/30 font-bold ml-1 block mb-2">Level</label>
                    <select
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none"
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#12121a] border border-white/5 p-8 rounded-3xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-xl font-semibold">Curriculum</h2>
                <button
                  onClick={handleAddSection}
                  className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 hover:bg-indigo-500/20 transition-all text-xs font-bold"
                >
                  + New Section
                </button>
              </div>

              {sections.length === 0 && (
                <div className="text-center py-12 text-white/20 text-sm">
                  No sections yet. Click "+ New Section" to get started.
                </div>
              )}

              <div className="space-y-6">
                {sections.map((section) => (
                  <div key={section.id} className="border border-white/10 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 bg-white/5 px-5 py-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 shrink-0">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <input
                        className="flex-1 bg-transparent outline-none font-semibold text-sm"
                        value={section.title}
                        onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                        onBlur={async (e) => {}}
                      />
                      <button
                        onClick={() => handleAddLesson(section.id)}
                        className="text-[10px] text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 rounded-lg hover:bg-indigo-500/20 font-bold uppercase"
                      >
                        + Lesson
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-white/20 hover:text-red-500 transition-colors ml-1"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>

                    <div className="divide-y divide-white/5">
                      {(!section.lessons || section.lessons.length === 0) && (
                        <div className="px-5 py-4 text-white/20 text-xs text-center">
                          No lessons. Click "+ Lesson" to add one.
                        </div>
                      )}
                      {section.lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="px-5 py-4 bg-[#0a0a0f]">
                          <div className="flex items-center gap-3 mb-3">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 shrink-0">
                              <circle cx="12" cy="12" r="10" />
                              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                            </svg>
                            <input
                              className="flex-1 bg-transparent outline-none text-sm"
                              value={lesson.title}
                              onChange={(e) => handleUpdateLessonTitle(lesson.id, section.id, e.target.value)}
                              onBlur={(e) => handleSaveLessonTitle(lesson.id, e.target.value)}
                            />
                            <button
                              onClick={() => handleDeleteLesson(lesson.id, section.id)}
                              className="text-white/20 hover:text-red-500 transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center gap-3 pl-5">
                            <label className="cursor-pointer text-[10px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 font-bold uppercase tracking-widest">
                              {uploading === lesson.id ? "Uploading..." : lesson.videoUrl ? "Change Video" : "Upload Video"}
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) await handleFileUpload(file, "video", lesson.id, section.id);
                                }}
                              />
                            </label>
                            {lesson.videoUrl && (
                              <>
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                  Video Ready
                                </span>
                                <button
                                  onClick={() => setPreviewVideo(lesson.videoUrl)}
                                  className="text-[10px] text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 font-bold uppercase"
                                >
                                  Preview
                                </button>
                              </>
                            )}

                            {transcribing[lesson.id] === "processing" && (
                              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1 ml-auto animate-pulse">
                                <svg className="animate-spin h-3 w-3 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Transcribing Audio...
                              </span>
                            )}
                            {transcribing[lesson.id] === "completed" && (
                              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1 ml-auto">
                                ✓ Captions Generated
                              </span>
                            )}
                            {transcribing[lesson.id] === "error" && (
                              <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-1 ml-auto">
                                ✕ Transcription Failed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#12121a] border border-white/5 p-8 rounded-3xl space-y-6">
              <h2 className="text-xl font-semibold border-b border-white/5 pb-4">Settings</h2>
              <div>
                <label className="text-[11px] uppercase text-white/30 font-bold ml-1 block mb-3">Thumbnail</label>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#0a0a0f] border border-white/10 group">
                  {form.thumbnail ? (
                    <img src={form.thumbnail} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">No Image</div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold uppercase">
                    Replace
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await handleFileUpload(file, "thumbnail");
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center bg-[#0a0a0f] p-4 rounded-xl border border-white/5">
                  <span className="text-sm font-medium">Published</span>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-indigo-500"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  />
                </div>
                <div className="flex justify-between items-center bg-[#0a0a0f] p-4 rounded-xl border border-white/5">
                  <span className="text-sm font-medium">Free Course</span>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-emerald-500"
                    checked={form.isFree}
                    onChange={(e) =>
                      setForm({ ...form, isFree: e.target.checked, price: e.target.checked ? 0 : form.price })
                    }
                  />
                </div>
                {!form.isFree && (
                  <div className="bg-[#0a0a0f] p-4 rounded-xl border border-white/5">
                    <label className="text-[10px] text-white/30 uppercase block mb-1">Price (USD)</label>
                    <input
                      type="number"
                      className="bg-transparent border-none text-xl font-bold w-full outline-none"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}