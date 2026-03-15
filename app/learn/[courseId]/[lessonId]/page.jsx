"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Quiz from "../../../components/Quiz";

const mockCourse = {
  id: "react-nextjs-bootcamp",
  title: "React & Next.js 15 Bootcamp",
  instructor: "Marco Ricci",
  sections: [
    {
      id: "s1",
      title: "Getting Started",
      lessons: [
        { id: "l1", title: "Welcome to the Course", duration: "3:20" },
        { id: "l2", title: "What You'll Build", duration: "5:10" },
        { id: "l3", title: "Setting Up Your Environment", duration: "8:45" },
      ],
    },
    {
      id: "s2",
      title: "React Fundamentals",
      lessons: [
        { id: "l4", title: "JSX Deep Dive", duration: "12:30" },
        { id: "l5", title: "Components & Props", duration: "15:00" },
        { id: "l6", title: "State & useState", duration: "18:20" },
        { id: "l7", title: "useEffect Explained", duration: "14:55" },
      ],
    },
    {
      id: "s3",
      title: "Next.js 15 Core",
      lessons: [
        { id: "l8", title: "App Router Architecture", duration: "20:10" },
        { id: "l9", title: "Server vs Client Components", duration: "16:40" },
        { id: "l10", title: "Dynamic Routes", duration: "11:25" },
      ],
    },
    {
      id: "s4",
      title: "Section Quizzes",
      lessons: [
        { id: "q1", title: "📝 Quiz: React Basics", duration: "—", isQuiz: true },
        { id: "q2", title: "📝 Quiz: Next.js Core", duration: "—", isQuiz: true },
      ],
    },
  ],
};

const mockLesson = {
  l1: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Welcome! In this lesson we'll go over what the course covers and how to get the most out of it." },
  l2: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "A walkthrough of the final project you'll build by the end of this bootcamp." },
  l3: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "We'll install Node.js, VS Code extensions, and configure our dev environment." },
  l4: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Deep dive into JSX syntax, expressions, and how React compiles your code." },
  l5: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Understanding components and how to pass data with props." },
  l6: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Managing local component state with the useState hook." },
  l7: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Side effects, cleanup, and the dependency array explained clearly." },
  l8: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Understanding the new App Router and how it differs from Pages Router." },
  l9: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "When to use server vs client components and the performance implications." },
  l10: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Building dynamic routes with [slug] and [...params] patterns." },
};

export default function CoursePlayerPage() {
  const { courseId, lessonId } = useParams();

  const allLessons = mockCourse.sections.flatMap((s) => s.lessons);
  const [activeLessonId, setActiveLessonId] = useState(lessonId || allLessons[0].id);
  const [completed, setCompleted] = useState(new Set(["l1"]));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState(
    new Set(mockCourse.sections.map((s) => s.id))
  );

  const activeLesson = allLessons.find((l) => l.id === activeLessonId);
  const lessonData = mockLesson[activeLessonId];
  const isQuiz = activeLesson?.isQuiz;

  const currentIndex = allLessons.findIndex((l) => l.id === activeLessonId);
  const prevLesson = allLessons[currentIndex - 1];
  const nextLesson = allLessons[currentIndex + 1];

  const completedCount = completed.size;
  const progress = Math.round((completedCount / allLessons.length) * 100);

  const toggleSection = (id) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const markComplete = () => {
    setCompleted((prev) => new Set([...prev, activeLessonId]));
    if (nextLesson) setActiveLessonId(nextLesson.id);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", color: "#e0e0f0", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>

      <header style={{
        height: 56, background: "rgba(13,13,26,0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", padding: "0 1.25rem", gap: "1rem",
        position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)",
      }}>
        <Link href="/" style={{ color: "#6d63ff", fontWeight: 800, fontSize: "1.1rem", textDecoration: "none", letterSpacing: "-0.02em" }}>
          • LearnFlow
        </Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
        <span style={{ color: "#a0a0c0", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280 }}>
          {mockCourse.title}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 120, height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #6d63ff, #a78bfa)", borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
            <span style={{ color: "#a0a0c0", fontSize: "0.78rem" }}>{progress}%</span>
          </div>
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#a0a0c0", padding: "5px 10px", cursor: "pointer", fontSize: "0.78rem" }}
          >
            {sidebarOpen ? "Hide" : "Show"} Sidebar
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          {isQuiz ? (
            <div style={{ background: "#13132a", borderBottom: "1px solid rgba(255,255,255,0.06)", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📝</div>
                <p style={{ color: "#a0a0c0", fontSize: "0.9rem" }}>Test your knowledge for this section</p>
              </div>
            </div>
          ) : (
            <div style={{ width: "100%", aspectRatio: "16/9", background: "#08080f", maxHeight: "72vh" }}>
              <video
                key={activeLessonId}
                controls
                autoPlay
                style={{ width: "100%", height: "100%", display: "block" }}
                onEnded={() => setCompleted((prev) => new Set([...prev, activeLessonId]))}
              >
                <source src={lessonData?.videoUrl} type="video/mp4" />
              </video>
            </div>
          )}

          <div style={{ padding: "1.5rem 2rem", maxWidth: 860 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", margin: "0 0 0.35rem", letterSpacing: "-0.02em" }}>
                  {activeLesson?.title}
                </h1>
                <p style={{ color: "#7070a0", fontSize: "0.85rem", margin: 0 }}>
                  {mockCourse.instructor} · {activeLesson?.duration}
                </p>
              </div>
              <button
                onClick={markComplete}
                disabled={completed.has(activeLessonId)}
                style={{
                  background: completed.has(activeLessonId) ? "rgba(99,214,130,0.15)" : "#6d63ff",
                  border: completed.has(activeLessonId) ? "1px solid #63d682" : "none",
                  borderRadius: 10, color: completed.has(activeLessonId) ? "#63d682" : "#fff",
                  padding: "0.6rem 1.25rem", fontWeight: 600, fontSize: "0.85rem",
                  cursor: completed.has(activeLessonId) ? "default" : "pointer",
                  whiteSpace: "nowrap", transition: "all 0.2s", flexShrink: 0,
                }}
              >
                {completed.has(activeLessonId) ? "✓ Completed" : "Mark Complete"}
              </button>
            </div>

            {lessonData?.description && (
              <p style={{ color: "#9090b8", fontSize: "0.9rem", lineHeight: 1.7, marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {lessonData.description}
              </p>
            )}

            {isQuiz && <Quiz quizId={activeLessonId} />}

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                disabled={!prevLesson}
                onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
                  color: prevLesson ? "#d0d0e8" : "#404060", padding: "0.75rem",
                  cursor: prevLesson ? "pointer" : "not-allowed", fontSize: "0.85rem", fontWeight: 500,
                }}
              >
                ← {prevLesson?.title ?? "No previous lesson"}
              </button>
              <button
                disabled={!nextLesson}
                onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
                style={{
                  flex: 1, background: nextLesson ? "#6d63ff" : "rgba(255,255,255,0.04)",
                  border: nextLesson ? "none" : "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
                  color: nextLesson ? "#fff" : "#404060", padding: "0.75rem",
                  cursor: nextLesson ? "pointer" : "not-allowed", fontSize: "0.85rem", fontWeight: 600,
                }}
              >
                {nextLesson?.title ?? "Course Complete"} →
              </button>
            </div>
          </div>
        </main>

        {sidebarOpen && (
          <aside style={{ width: 320, borderLeft: "1px solid rgba(255,255,255,0.07)", background: "#0f0f20", overflowY: "auto", flexShrink: 0 }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ color: "#7070a0", fontSize: "0.75rem", margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Course Content
              </p>
              <p style={{ color: "#a0a0c0", fontSize: "0.82rem", margin: 0 }}>
                {completedCount} / {allLessons.length} lessons completed
              </p>
            </div>

            {mockCourse.sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.02)", border: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#c0c0d8",
                    padding: "0.85rem 1.25rem", textAlign: "left", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontSize: "0.82rem", fontWeight: 700,
                  }}
                >
                  <span>{section.title}</span>
                  <span style={{ color: "#505070", fontSize: "0.75rem" }}>
                    {expandedSections.has(section.id) ? "▲" : "▼"}
                  </span>
                </button>

                {expandedSections.has(section.id) &&
                  section.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLessonId;
                    const isDone = completed.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLessonId(lesson.id)}
                        style={{
                          width: "100%",
                          background: isActive ? "rgba(109,99,255,0.18)" : "transparent",
                          border: "none",
                          borderLeft: isActive ? "3px solid #6d63ff" : "3px solid transparent",
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                          color: isActive ? "#fff" : "#8888a8",
                          padding: "0.7rem 1.25rem 0.7rem 1rem",
                          textAlign: "left", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 10,
                          fontSize: "0.82rem", transition: "all 0.15s",
                        }}
                      >
                        <span style={{
                          width: 18, height: 18, borderRadius: "50%",
                          border: isDone ? "none" : "2px solid rgba(255,255,255,0.15)",
                          background: isDone ? "#63d682" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, fontSize: "0.65rem", color: "#0d0d1a", fontWeight: 900,
                        }}>
                          {isDone ? "✓" : ""}
                        </span>
                        <span style={{ flex: 1, lineHeight: 1.4 }}>{lesson.title}</span>
                        <span style={{ color: "#505070", fontSize: "0.72rem", flexShrink: 0 }}>
                          {lesson.duration}
                        </span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}