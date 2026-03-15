"use client";
import { useState } from "react";
import Link from "next/link";

const COURSES = [
  { id: 1, name: "React & Next.js 15 Bootcamp", instructor: "Marco Ricci", topic: "Development", price: 89, rating: 4.9, reviews: 2100, lessons: 48, emoji: "⚛️" },
  { id: 2, name: "Figma UI/UX Mastery 2025", instructor: "Sara Nkosi", topic: "Design", price: 74, rating: 4.8, reviews: 1400, lessons: 36, emoji: "🎨" },
  { id: 3, name: "AI Engineering with Python", instructor: "Lena Hoffmann", topic: "AI & ML", price: 119, rating: 5.0, reviews: 892, lessons: 55, emoji: "🤖" },
  { id: 4, name: "Growth Marketing & SEO", instructor: "James Park", topic: "Marketing", price: 59, rating: 4.7, reviews: 1800, lessons: 28, emoji: "📈" },
  { id: 5, name: "Python for Data Science", instructor: "Aiko Tanaka", topic: "Data Science", price: 99, rating: 4.6, reviews: 640, lessons: 62, emoji: "📊" },
  { id: 6, name: "Node.js & REST APIs", instructor: "Priya Mehta", topic: "Development", price: 79, rating: 4.8, reviews: 980, lessons: 40, emoji: "🌐" },
  { id: 7, name: "Business Strategy 101", instructor: "Theo Baumann", topic: "Business", price: 39, rating: 4.3, reviews: 430, lessons: 18, emoji: "💼" },
  { id: 8, name: "Brand Identity Design", instructor: "Carlos Lima", topic: "Design", price: 49, rating: 4.5, reviews: 310, lessons: 22, emoji: "✏️" },
];

const toSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);

export default function CourseGrid() {
  const [liked, setLiked] = useState(new Set());

  const toggleLike = (e, id) => {
    e.preventDefault();
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="px-10 py-8">
      <p className="text-sm text-white/40 mb-6">
        <span className="text-white font-medium">{COURSES.length}</span> courses available
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {COURSES.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${toSlug(course.name)}`}
            className="bg-[#13131A] border border-white/10 rounded-xl overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer no-underline block"
          >
            <div className="h-32 bg-indigo-950 flex items-center justify-center relative">
              <span className="text-4xl">{course.emoji}</span>
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
              <p className="font-semibold text-sm text-white leading-snug mb-1">{course.name}</p>
              <p className="text-xs text-white/40 mb-2">{course.instructor} · {course.lessons} lessons</p>
              <div className="flex items-center gap-1 text-xs mb-3">
                <span className="text-yellow-400">★</span>
                <span className="text-white font-medium">{course.rating}</span>
                <span className="text-white/30">({fmt(course.reviews)})</span>
              </div>
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-white/30">From</p>
                <p className="text-indigo-400 font-bold text-base">${course.price}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}