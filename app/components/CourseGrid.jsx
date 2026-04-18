"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_COURSES } from "../../lib/graphql/queries";   

const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);

const TOPIC_EMOJI= {
  Development: "⚛️",
  Design: "🎨",
  "AI & ML": "🤖",
  Marketing: "📈",
  "Data Science": "📊",
  Business: "💼",
  default: "📚",
};

export default function CourseGrid() {
  const [liked, setLiked] = useState(new Set());
  const { data, loading, error } = useQuery(GET_COURSES);

  const toggleLike = (e, id) => {
    e.preventDefault();
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) return (
    <div className="px-10 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[#13131A] border border-white/10 rounded-xl overflow-hidden animate-pulse">
            <div className="h-32 bg-white/5" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
              <div className="h-3 bg-white/10 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="px-10 py-8 text-red-400 text-sm">Failed to load courses.</div>
  );

  const courses = data?.getCourses ?? [];

  return (
    <div className="px-10 py-8">
      <p className="text-sm text-white/40 mb-6">
        <span className="text-white font-medium">{courses.length}</span> courses available
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {courses.map((course) => {
          const lessonCount = course.sections?.reduce(
            (acc, s) => acc + (s.lessons?.length ?? 0), 0
          ) ?? 0;
          const instructorName = course.instructor?.name ?? "Instructor";
          const emoji = TOPIC_EMOJI[course.topic] ?? TOPIC_EMOJI.default;
          const rating = course.rating?.average ?? 0;
          const reviewCount = course.rating?.count ?? 0;

          return (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="bg-[#13131A] border border-white/10 rounded-xl overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer no-underline block"
            >
              <div className="h-32 bg-indigo-950 flex items-center justify-center relative">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{emoji}</span>
                )}
                <button
                  onClick={(e) => toggleLike(e, course.id)}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-sm transition ${
                    liked.has(course.id) ? "text-red-400" : "text-white/50 hover:text-white"
                  }`}
                >
                  ♥
                </button>
              </div>
              <div className="p-4">
                <p className="font-semibold text-sm text-white leading-snug mb-1">{course.title}</p>
                <p className="text-xs text-white/40 mb-2">{instructorName} · {lessonCount} lessons</p>
                <div className="flex items-center gap-1 text-xs mb-3">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white font-medium">{rating.toFixed(1)}</span>
                  <span className="text-white/30">({fmt(reviewCount)})</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-xs text-white/30">From</p>
                  <p className="text-indigo-400 font-bold text-base">
                    {course.isFree ? "Free" : `$${course.price}`}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}