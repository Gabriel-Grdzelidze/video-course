'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_COURSE_FOR_EDIT = gql`
  query GetCourseForEdit($id: ID!) {
    getCourseById(id: $id) {
      id title description thumbnail price isFree topic level isPublished
    }
    getSectionsByCourse(courseId: $id) {
      id title order
      lessons {
        id title videoUrl order
      }
    }
  }
`;

const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $title: String, $description: String, $thumbnail: String, $price: Float, $isFree: Boolean, $isPublished: Boolean, $lessons: [LessonInput]) {
    updateCourse(id: $id, title: $title, description: $description, thumbnail: $thumbnail, price: $price, isFree: $isFree, isPublished: $isPublished, lessons: $lessons) {
      id
    }
  }
`;

export default function InstructorEditPage() {
  const { id } = useParams();
  const router = useRouter();
  
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

  const [lessons, setLessons] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data, loading } = useQuery(GET_COURSE_FOR_EDIT, { 
    variables: { id },
    fetchPolicy: "network-only" 
  });
  
  const [updateCourse] = useMutation(UPDATE_COURSE);

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

      if (data.getSectionsByCourse) {
        const flattenedLessons = data.getSectionsByCourse
          .flatMap((section: any) => section.lessons)
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            videoUrl: l.videoUrl,
            order: l.order
          }))
          .sort((a: any, b: any) => a.order - b.order);
        setLessons(flattenedLessons);
      }
    }
  }, [data]);

  const handleFileUpload = async (file: File, type: 'thumbnail' | 'video', index?: number) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      
      const { uploadUrl, fileUrl } = await res.json();
      await fetch(uploadUrl, { method: "PUT", body: file });
      
      if (type === 'thumbnail') {
        setForm(prev => ({ ...prev, thumbnail: fileUrl }));
      } else if (type === 'video' && index !== undefined) {
        const updated = [...lessons];
        updated[index] = { ...updated[index], videoUrl: fileUrl };
        setLessons(updated);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const addLesson = () => {
    setLessons([...lessons, { title: "", videoUrl: "", order: lessons.length + 1 }]);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const updateLessonTitle = (index: number, title: string) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], title };
    setLessons(updated);
  };

  const handleSubmit = async () => {
    try {
      await updateCourse({
        variables: {
          id,
          ...form,
          lessons: lessons.map((l, i) => ({
            title: l.title,
            videoUrl: l.videoUrl,
            order: i + 1
          })),
          price: parseFloat(form.price.toString()),
        },
      });
      router.push(`/instructor/me`);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-indigo-500 font-mono">LOADING_DATA...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-[#12121a] p-6 rounded-2xl border border-white/5">
          <div>
            <h1 className="text-2xl font-bold">Course Management</h1>
            <p className="text-white/40 text-sm">Editing ID: {id}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => router.back()} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-medium">Discard</button>
            <button onClick={handleSubmit} disabled={uploading} className="px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all text-sm font-bold shadow-lg shadow-indigo-500/20">
              {uploading ? "Uploading..." : "Save Changes"}
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
                  <input className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-[11px] uppercase text-white/30 font-bold ml-1">Description</label>
                  <textarea rows={4} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="bg-[#12121a] border border-white/5 p-8 rounded-3xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-xl font-semibold">Curriculum</h2>
                <button onClick={addLesson} className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 hover:bg-indigo-500/20 transition-all text-xs font-bold">+ New Lesson</button>
              </div>
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div key={index} className="bg-[#0a0a0f] border border-white/10 p-5 rounded-2xl group transition-all hover:border-indigo-500/30">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-white/20 font-mono text-sm">#{index + 1}</span>
                      <input className="flex-1 bg-transparent border-none outline-none text-sm font-semibold" placeholder="Lesson Name" value={lesson.title} onChange={(e) => updateLessonTitle(index, e.target.value)} />
                      <button onClick={() => removeLesson(index)} className="text-white/20 hover:text-red-500 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-4 pl-10">
                      <label className="cursor-pointer text-[10px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 font-bold uppercase tracking-widest">
                        {lesson.videoUrl ? "Change Video" : "Select Video"}
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0], 'video', index)} />
                      </label>
                      {lesson.videoUrl && <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/> Video Ready</span>}
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
                  {form.thumbnail ? <img src={form.thumbnail} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">No Image</div>}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold uppercase">
                    Replace
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0], 'thumbnail')} />
                  </label>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center bg-[#0a0a0f] p-4 rounded-xl border border-white/5">
                  <span className="text-sm font-medium">Published</span>
                  <input type="checkbox" className="w-5 h-5 accent-indigo-500" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                </div>
                <div className="flex justify-between items-center bg-[#0a0a0f] p-4 rounded-xl border border-white/5">
                  <span className="text-sm font-medium">Free Course</span>
                  <input type="checkbox" className="w-5 h-5 accent-emerald-500" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked, price: e.target.checked ? 0 : form.price })} />
                </div>
                {!form.isFree && (
                  <div className="bg-[#0a0a0f] p-4 rounded-xl border border-white/5">
                    <label className="text-[10px] text-white/30 uppercase block mb-1">Price (USD)</label>
                    <input type="number" className="bg-transparent border-none text-xl font-bold w-full outline-none" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
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