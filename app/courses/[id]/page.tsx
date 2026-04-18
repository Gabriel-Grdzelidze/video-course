'use client'
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { gql } from "@apollo/client";
import { ENROLL_USER } from "../../../lib/graphql/mutations";
import { IS_ENROLLED } from "../../../lib/graphql/queries"; // ← add this
const GET_COURSE = gql`
  query GetCourseById($id: ID!) {
    getCourseById(id: $id) {
      id
      title
      slug
      description
      thumbnail
      topic
      level
      price
      isFree
      isPublished
      tags
      rating {
        average
        count
      }
    }
    getSectionsByCourse(courseId: $id) {
      id
      title
      order
      lessons {
        id
        title
        duration
        order
        isFree
        isQuiz
      }
    }
  }
`;

const TOPIC_COLORS: Record<string, string> = {
  Development: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  Design: "bg-pink-500/15 text-pink-300 border-pink-500/25",
  "AI & ML": "bg-purple-500/15 text-purple-300 border-purple-500/25",
  Marketing: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  Business: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  "Data Science": "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  Video: "bg-red-500/15 text-red-300 border-red-500/25",
};

interface Lesson {
  id: string;
  title: string;
  duration?: number;
  order: number;
  isFree: boolean;
  isQuiz: boolean;
}
interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  topic: string;
  level: string;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  tags: string[];
  rating?: { average: number; count: number };
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [enrolling, setEnrolling] = useState(false);

  const { data, loading } = useQuery(GET_COURSE, { variables: { id } });
  const { data: enrollData, refetch: refetchEnroll } = useQuery(IS_ENROLLED, {
    variables: { userId, courseId: id },
    skip: !userId,
  });
  const [enrollUser] = useMutation(ENROLL_USER);

  const course: Course | undefined = data?.getCourseById;
  const sections: Section[] = (data?.getSectionsByCourse ?? [])
    .slice()
    .sort((a: Section, b: Section) => a.order - b.order);
  const isEnrolled: boolean = enrollData?.isEnrolled ?? false;

  const totalLessons = sections.reduce(
    (acc: number, s: Section) => acc + s.lessons.length,
    0
  );
  const totalMins = sections.reduce(
    (acc: number, s: Section) =>
      acc +
      s.lessons.reduce((a: number, l: Lesson) => a + (l.duration ?? 0), 0),
    0
  );

  const toggleSection = (sId: string) =>
    setExpandedSections((prev) => {
      const s = new Set(prev);
      s.has(sId) ? s.delete(sId) : s.add(sId);
      return s;
    });

  const handleEnroll = async () => {
    if (!userId) {
      router.push("/authentication");
      return;
    }
    setEnrolling(true);
    try {
      await enrollUser({
        variables: {
          userId,
          courseId: id,
          paidAmount: course.isFree ? 0 : course.price,
        },
      });
      refetchEnroll();
    } finally {
      setEnrolling(false);
    }
  };
  if (loading) return <CourseSkeleton />;
  if (!course)
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white/40">
        Course not found
      </div>
    );

  const topicColor =
    TOPIC_COLORS[course.topic] ?? "bg-white/5 text-white/50 border-white/10";
  const rating = course.rating?.average?.toFixed(1);
  const ratingCount = course.rating?.count ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── hero ── */}
      <div className="border-b border-white/[0.06] bg-[#0d0d14]">
        <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-[1fr_320px] gap-12 items-start">
          {/* left */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`text-[11px] font-semibold border px-2.5 py-1 rounded-full ${topicColor}`}
              >
                {course.topic}
              </span>
              <span className="text-white/25 text-[12px]">·</span>
              <span className="text-white/40 text-[12px]">{course.level}</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight leading-snug mb-4">
              {course.title}
            </h1>
            <p className="text-white/55 text-[15px] leading-relaxed mb-6 max-w-2xl">
              {course.description}
            </p>

            {/* meta row */}
            <div className="flex items-center gap-5 text-[13px] text-white/40">
              {ratingCount > 0 && (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-semibold">{rating}</span>
                  <span className="text-white/30">({ratingCount} reviews)</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                {totalLessons} lessons
              </span>
              {totalMins > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {Math.floor(totalMins / 60)}h {totalMins % 60}m
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                {sections.length} sections
              </span>
            </div>

            {/* tags */}
            {course.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {course.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[12px] bg-white/5 border border-white/10 text-white/40 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* right — enroll card */}
          <div className="sticky top-20 bg-[#12121a] border border-white/[0.07] rounded-2xl overflow-hidden">
            {/* thumbnail */}
            <div className="aspect-video bg-[#1e1e2e] flex items-center justify-center overflow-hidden">
              {course.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  className="text-white/15"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              )}
            </div>

            <div className="p-6">
              {/* price */}
              <div className="mb-5">
                {course.isFree ? (
                  <span className="text-3xl font-bold text-emerald-400">
                    Free
                  </span>
                ) : (
                  <span className="text-3xl font-bold">${course.price}</span>
                )}
              </div>

              {/* enroll button */}
              {isEnrolled ? (
                <button
                  onClick={() => router.push(`/learn/${id}`)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3.5 rounded-xl transition-colors"
                >
                  Go to course →
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-colors"
                >
                  {enrolling
                    ? "Enrolling…"
                    : course.isFree
                    ? "Enroll for free"
                    : `Enroll — $${course.price}`}
                </button>
              )}

              {!userId && (
                <p className="text-center text-white/30 text-[12px] mt-3">
                  <button
                    onClick={() => router.push("/authentication")}
                    className="text-indigo-400 hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Sign in
                  </button>{" "}
                  to enroll
                </p>
              )}

              {/* course includes */}
              <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-col gap-2.5">
                <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
                  This course includes
                </p>
                {[
                  { icon: "▶", label: `${totalLessons} on-demand lessons` },
                  { icon: "∞", label: "Full lifetime access" },
                  { icon: "📱", label: "Access on all devices" },
                  { icon: "🏆", label: "Certificate of completion" },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 text-[13px] text-white/50"
                  >
                    <span className="text-[11px]">{icon}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── curriculum ── */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            Course curriculum
          </h2>

          {sections.length === 0 ? (
            <p className="text-white/30 text-sm">No content yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sections.map((section, sIdx) => {
                const isExpanded = expandedSections.has(section.id);
                const freeLessons = section.lessons.filter(
                  (l) => l.isFree
                ).length;
                const sectionMins = section.lessons.reduce(
                  (a, l) => a + (l.duration ?? 0),
                  0
                );

                return (
                  <div
                    key={section.id}
                    className="bg-[#12121a] border border-white/[0.07] rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer bg-transparent border-none hover:bg-white/[0.02] transition-colors"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className={`text-white/30 transition-transform shrink-0 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                      <span className="text-[11px] font-bold text-white/25 w-5 shrink-0">
                        {sIdx + 1}
                      </span>
                      <span className="flex-1 font-semibold text-sm">
                        {section.title}
                      </span>
                      <div className="flex items-center gap-3 text-[12px] text-white/30 shrink-0">
                        {freeLessons > 0 && (
                          <span className="text-emerald-400">
                            {freeLessons} free
                          </span>
                        )}
                        <span>{section.lessons.length} lessons</span>
                        {sectionMins > 0 && (
                          <span>
                            {Math.floor(sectionMins / 60)}h {sectionMins % 60}m
                          </span>
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/[0.05]">
                        {section.lessons
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((lesson, lIdx) => {
                            const mins = lesson.duration
                              ? Math.floor(lesson.duration / 60)
                              : null;
                            const secs = lesson.duration
                              ? lesson.duration % 60
                              : null;

                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 px-5 py-3 border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                              >
                                <span className="text-[11px] text-white/20 w-5 text-center shrink-0">
                                  {lIdx + 1}
                                </span>

                                {lesson.isQuiz ? (
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-amber-400 shrink-0"
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                  </svg>
                                ) : lesson.isFree ? (
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-emerald-400 shrink-0"
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                    <polygon points="10 8 16 12 10 16 10 8" />
                                  </svg>
                                ) : (
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-white/20 shrink-0"
                                  >
                                    <rect
                                      x="3"
                                      y="11"
                                      width="18"
                                      height="11"
                                      rx="2"
                                    />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                  </svg>
                                )}

                                <span className="flex-1 text-sm text-white/70">
                                  {lesson.title}
                                </span>

                                <div className="flex items-center gap-2 shrink-0">
                                  {lesson.isFree && (
                                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                                      Preview
                                    </span>
                                  )}
                                  {lesson.isQuiz && (
                                    <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                                      Quiz
                                    </span>
                                  )}
                                  {mins !== null && (
                                    <span className="text-[12px] text-white/25">
                                      {mins}:{String(secs).padStart(2, "0")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] animate-pulse">
      <div className="border-b border-white/[0.06] bg-[#0d0d14]">
        <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-[1fr_320px] gap-12">
          <div className="flex flex-col gap-4">
            <div className="h-5 w-32 bg-[#12121a] rounded-full" />
            <div className="h-9 w-3/4 bg-[#12121a] rounded-xl" />
            <div className="h-4 w-full bg-[#12121a] rounded-lg" />
            <div className="h-4 w-2/3 bg-[#12121a] rounded-lg" />
          </div>
          <div className="h-80 bg-[#12121a] rounded-2xl" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-8 py-10 flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-[#12121a] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
