'use client'
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { gql } from "@apollo/client";
import { MARK_LESSON_COMPLETE, UPDATE_PROGRESS } from "../../../lib/graphql/mutations";
import { GET_PROGRESS } from "../../../lib/graphql/queries";

const GET_LEARN_DATA = gql`
  query GetLearnData($id: ID!) {
    getCourseById(id: $id) {
      id title slug thumbnail topic level
    }
    getSectionsByCourse(courseId: $id) {
      id title order
      lessons {
  id title videoUrl subtitleUrl duration order isFree isQuiz description
}
    }
  }
`;

const IS_ENROLLED = gql`
  query IsEnrolled($userId: ID!, $courseId: ID!) {
    isEnrolled(userId: $userId, courseId: $courseId)
  }
`;

interface Lesson {
  id: string; title: string; videoUrl?: string;
  duration?: number; order: number; isFree: boolean;
  isQuiz: boolean; description?: string;
  subtitleUrl?: string;
}
interface Section {
  id: string; title: string; order: number; lessons: Lesson[];
}
interface Course {
  id: string; title: string; slug: string;
  thumbnail?: string; topic: string; level: string;
}

export default function LearnPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const { data, loading } = useQuery<{ getCourseById: Course; getSectionsByCourse: Section[] }>(GET_LEARN_DATA, { variables: { id }, skip: !id });
  const { data: enrollData } = useQuery<{ isEnrolled: boolean }>(IS_ENROLLED, {
    variables: { userId, courseId: id },
    skip: !userId,
  });
  const { data: progressData, refetch: refetchProgress } = useQuery<{ getProgress: { completedLessons: string[]; completionPercentage: number; lastWatchedLesson?: string } }>(GET_PROGRESS, {
    variables: { userId, courseId: id },
    skip: !userId,
  });

  const [markLessonComplete] = useMutation(MARK_LESSON_COMPLETE, {
    fetchPolicy: "no-cache",
  });
  const [updateProgress] = useMutation(UPDATE_PROGRESS, {
    fetchPolicy: "no-cache",
  });

  const course: Course | undefined = data?.getCourseById;
  const sections: Section[] = (data?.getSectionsByCourse ?? [])
    .slice().sort((a: Section, b: Section) => a.order - b.order);
  const isEnrolled: boolean = enrollData?.isEnrolled ?? false;
  const completedLessons: string[] = progressData?.getProgress?.completedLessons ?? [];
  const completionPct: number = progressData?.getProgress?.completionPercentage ?? 0;

  const allLessons = sections.flatMap(s =>
    (s.lessons ?? []).filter(Boolean).slice().sort((a, b) => a.order - b.order)
  );

  // set first lesson on load
  useEffect(() => {
    if (allLessons.length > 0 && !activeLesson) {
      const lastWatched = progressData?.getProgress?.lastWatchedLesson;
      const lesson = lastWatched
        ? allLessons.find(l => l.id === lastWatched) ?? allLessons[0]
        : allLessons[0];
      setActiveLesson(lesson);
      // expand section containing this lesson
      sections.forEach(s => {
        if (s.lessons.find(l => l.id === lesson.id)) {
          setExpandedSections(prev => new Set([...prev, s.id]));
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, progressData]);

  // redirect if not enrolled
  useEffect(() => {
    if (!loading && userId && enrollData && !isEnrolled) {
      router.push(`/courses/${id}`);
    }
  }, [enrollData, isEnrolled, loading, userId, id, router]);

  const toggleSection = (sId: string) =>
    setExpandedSections(prev => {
      const s = new Set(prev);
      s.has(sId) ? s.delete(sId) : s.add(sId);
      return s;
    });

    const handleSelectLesson = async (lesson: Lesson) => {
      setActiveLesson(lesson);
      sections.forEach(s => {
        if (s.lessons.find(l => l.id === lesson.id)) {
          setExpandedSections(prev => new Set([...prev, s.id]));
        }
      });
      if (userId) {
        try {
          await updateProgress({ 
            variables: { userId, courseId: id, lessonId: lesson.id },
            
          });
        } catch (e) {
          // ignore
        }
        refetchProgress();
      }
    };
    const handleMarkComplete = async () => {
      if (!activeLesson || !userId) return;
      try {
        await markLessonComplete({ 
          variables: { userId, courseId: id, lessonId: activeLesson.id },
        
        });
      } catch (e) {
        // ignore
      }
      refetchProgress();
      const idx = allLessons.findIndex(l => l.id === activeLesson.id);
      if (idx < allLessons.length - 1) {
        handleSelectLesson(allLessons[idx + 1]);
      }
    };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (progressTimer.current) clearTimeout(progressTimer.current);
    progressTimer.current = setTimeout(async () => {
      if (userId && activeLesson) {
        await updateProgress({
          variables: {
            userId, courseId: id, lessonId: activeLesson.id,
            seconds: Math.floor(video.currentTime),
          }
        });
      }
    }, 5000);
  };

  const isCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  const activeIndex = allLessons.findIndex(l => l.id === activeLesson?.id);
  const nextLesson = activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : null;
  const prevLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;

  if (loading) return <LearnSkeleton />;
  if (!course) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white/40">
      Course not found
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">

      {/* ── top bar ── */}
      <div className="sticky top-0 z-40 flex items-center gap-4 px-4 h-14 border-b border-white/[0.07] bg-[#0a0a0f]/95 backdrop-blur-md shrink-0">
        <button
          onClick={() => router.push(`/courses/${id}`)}
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition bg-transparent border-none cursor-pointer shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M5 12l7 7M5 12l7-7"/></svg>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{course.title}</p>
          {activeLesson && (
            <p className="text-[11px] text-white/35 truncate">{activeLesson.title}</p>
          )}
        </div>

        {/* progress bar */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <span className="text-[12px] text-white/40">{Math.round(completionPct)}%</span>
        </div>

        <button
          onClick={() => setSidebarOpen(p => !p)}
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-[13px] transition bg-transparent border-none cursor-pointer shrink-0"
          title="Toggle sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M15 3v18"/>
          </svg>
        </button>
      </div>

      {/* ── main area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── video + content ── */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {/* video player */}
          <div className="w-full bg-black aspect-video">
            {activeLesson?.videoUrl ? (
              <video
              key={activeLesson.id}
              src={activeLesson.videoUrl}
              controls
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              crossOrigin="anonymous"
            >
              {activeLesson.subtitleUrl && (
                <track
                  kind="subtitles"
                  src={activeLesson.subtitleUrl}
                  srcLang="en"
                  label="English"
                  default
                />
              )}
            </video>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10">
                  <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
                </svg>
                <p className="text-white/25 text-sm">No video for this lesson</p>
              </div>
            )}
          </div>

          {/* lesson info */}
          <div className="max-w-3xl mx-auto w-full px-8 py-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/30 text-[12px]">
                    Lesson {activeIndex + 1} of {allLessons.length}
                  </span>
                  {activeLesson && isCompleted(activeLesson.id) && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      Completed
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold tracking-tight">{activeLesson?.title}</h1>
              </div>

              {activeLesson && !isCompleted(activeLesson.id) && (
                <button
                  onClick={handleMarkComplete}
                  className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Mark complete
                </button>
              )}
            </div>

            {activeLesson?.description && (
              <p className="text-white/55 text-[15px] leading-relaxed mb-8">{activeLesson.description}</p>
            )}

            {/* prev / next */}
            <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
              <button
                onClick={() => prevLesson && handleSelectLesson(prevLesson)}
                disabled={!prevLesson}
                className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition bg-transparent border-none cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M5 12l7 7M5 12l7-7"/></svg>
                {prevLesson?.title ?? "Previous"}
              </button>
              <button
                onClick={() => nextLesson && handleSelectLesson(nextLesson)}
                disabled={!nextLesson}
                className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition bg-transparent border-none cursor-pointer"
              >
                {nextLesson?.title ?? "Next"}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── sidebar ── */}
        {sidebarOpen && (
          <div className="w-80 shrink-0 border-l border-white/[0.07] flex flex-col overflow-hidden bg-[#0d0d14]">
            {/* sidebar header */}
            <div className="px-5 py-4 border-b border-white/[0.07] shrink-0">
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">Course content</p>
              <p className="text-[12px] text-white/25">{allLessons.length} lessons · {Math.round(completionPct)}% complete</p>
            </div>

            {/* sections */}
            <div className="flex-1 overflow-y-auto">
              {sections.map((section, sIdx) => {
                const isExpanded = expandedSections.has(section.id);
                const sectionCompleted = section.lessons.filter(l => isCompleted(l.id)).length;

                return (
                  <div key={section.id} className="border-b border-white/[0.05]">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.02] transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className={`text-white/25 transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                      >
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-white/70 truncate">{sIdx + 1}. {section.title}</p>
                        <p className="text-[11px] text-white/25 mt-0.5">{sectionCompleted}/{section.lessons.length} completed</p>
                      </div>
                    </button>

                    {isExpanded && (
                      <div>
                        {section.lessons
                          .slice().sort((a, b) => a.order - b.order)
                          .map((lesson) => {
                            const isActive = activeLesson?.id === lesson.id;
                            const done = isCompleted(lesson.id);
                            const mins = lesson.duration ? Math.floor(lesson.duration / 60) : null;
                            const secs = lesson.duration ? lesson.duration % 60 : null;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleSelectLesson(lesson)}
                                className={`w-full flex items-start gap-3 px-5 py-3 text-left transition-colors border-none cursor-pointer ${
                                  isActive
                                    ? "bg-indigo-600/15 border-l-2 border-indigo-500"
                                    : "hover:bg-white/[0.02] border-l-2 border-transparent"
                                }`}
                              >
                                {/* completion circle */}
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  done
                                    ? "bg-emerald-500 border-emerald-500"
                                    : isActive
                                    ? "border-indigo-400"
                                    : "border-white/20"
                                }`}>
                                  {done && (
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                  )}
                                  {isActive && !done && (
                                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className={`text-[13px] leading-snug ${isActive ? "text-white font-medium" : "text-white/60"}`}>
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {lesson.isQuiz && (
                                      <span className="text-[10px] text-amber-400">Quiz</span>
                                    )}
                                    {mins !== null && (
                                      <span className="text-[11px] text-white/25">
                                        {mins}:{String(secs).padStart(2, "0")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LearnSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] animate-pulse flex flex-col">
      <div className="h-14 bg-[#12121a] border-b border-white/[0.07]" />
      <div className="flex flex-1">
        <div className="flex-1 flex flex-col">
          <div className="aspect-video bg-[#12121a]" />
          <div className="max-w-3xl mx-auto w-full px-8 py-8 flex flex-col gap-4">
            <div className="h-6 w-64 bg-[#12121a] rounded-lg" />
            <div className="h-4 w-full bg-[#12121a] rounded-lg" />
            <div className="h-4 w-3/4 bg-[#12121a] rounded-lg" />
          </div>
        </div>
        <div className="w-80 bg-[#0d0d14] border-l border-white/[0.07]" />
      </div>
    </div>
  );
}