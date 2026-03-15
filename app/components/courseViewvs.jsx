"use client";

import { useState } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockReviews = [
  {
    id: "r1",
    user: "Alex M.",
    avatar: "A",
    rating: 5,
    comment: "Absolutely the best Next.js course out there. Marco explains everything so clearly and the projects are actually useful.",
    date: "Mar 10, 2026",
    likes: 24,
    liked: false,
  },
  {
    id: "r2",
    user: "Sara K.",
    avatar: "S",
    rating: 4,
    comment: "Great content overall. Would love a bit more depth on the App Router section but everything else is top notch.",
    date: "Feb 28, 2026",
    likes: 11,
    liked: false,
  },
  {
    id: "r3",
    user: "James P.",
    avatar: "J",
    rating: 5,
    comment: "I went from zero to deploying a full-stack app in 3 weeks. Worth every penny.",
    date: "Feb 14, 2026",
    likes: 38,
    liked: true,
  },
];

// ─── Star Component ───────────────────────────────────────────────────────────
function Stars({ value, onChange, readonly = false, size = 22 }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: size,
            cursor: readonly ? "default" : "pointer",
            color: star <= active ? "#f5a623" : "rgba(255,255,255,0.15)",
            transition: "color 0.1s",
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Average Rating Bar ───────────────────────────────────────────────────────
function RatingBreakdown({ reviews }) {
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const counts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  return (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
      {/* Big average */}
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <div style={{ fontSize: "3.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
          {avg}
        </div>
        <Stars value={Math.round(avg)} readonly size={18} />
        <div style={{ color: "#7070a0", fontSize: "0.78rem", marginTop: 4 }}>
          {reviews.length} reviews
        </div>
      </div>

      {/* Bars */}
      <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 6 }}>
        {counts.map(({ star, count }) => {
          const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
          return (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#f5a623", fontSize: "0.8rem", width: 14, textAlign: "right" }}>
                {star}
              </span>
              <span style={{ color: "#f5a623", fontSize: "0.75rem" }}>★</span>
              <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #f5a623, #f7c948)", borderRadius: 99, transition: "width 0.5s ease" }} />
              </div>
              <span style={{ color: "#7070a0", fontSize: "0.75rem", width: 28 }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CourseReviews({ courseId }) {
  const [reviews, setReviews] = useState(mockReviews);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!newRating) return setError("Please select a star rating.");
    if (newComment.trim().length < 10) return setError("Comment must be at least 10 characters.");

    const review = {
      id: `r${Date.now()}`,
      user: "You",
      avatar: "Y",
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      likes: 0,
      liked: false,
    };

    setReviews((prev) => [review, ...prev]);
    setNewRating(0);
    setNewComment("");
    setError("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const toggleLike = (id) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
          : r
      )
    );
  };

  const avatarColors = {
    A: "#6d63ff", S: "#e05aff", J: "#3ecfcf", Y: "#f5a623",
  };

  return (
    <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <h2 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.75rem", letterSpacing: "-0.02em" }}>
        Student Reviews
      </h2>

      {/* Rating breakdown */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.5rem", marginBottom: "2rem" }}>
        <RatingBreakdown reviews={reviews} />
      </div>

      {/* Write a review */}
      <div style={{ background: "rgba(109,99,255,0.07)", border: "1px solid rgba(109,99,255,0.2)", borderRadius: 14, padding: "1.5rem", marginBottom: "2rem" }}>
        <h3 style={{ color: "#c0c0e0", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 1rem" }}>
          Leave a Review
        </h3>

        <div style={{ marginBottom: "1rem" }}>
          <p style={{ color: "#7070a0", fontSize: "0.8rem", margin: "0 0 6px" }}>Your rating</p>
          <Stars value={newRating} onChange={setNewRating} size={28} />
        </div>

        <textarea
          value={newComment}
          onChange={(e) => { setNewComment(e.target.value); setError(""); }}
          placeholder="Share your experience with this course..."
          rows={4}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: error ? "1px solid #ff5a5a" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            color: "#e0e0f0",
            padding: "0.75rem 1rem",
            fontSize: "0.88rem",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            lineHeight: 1.6,
            boxSizing: "border-box",
            transition: "border 0.2s",
          }}
        />

        {error && (
          <p style={{ color: "#ff5a5a", fontSize: "0.8rem", margin: "0.4rem 0 0" }}>{error}</p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.85rem", flexWrap: "wrap", gap: 8 }}>
          <span style={{ color: "#505070", fontSize: "0.78rem" }}>
            {newComment.length} / 500
          </span>
          <button
            onClick={handleSubmit}
            style={{
              background: "#6d63ff",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              padding: "0.65rem 1.5rem",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
          >
            Submit Review
          </button>
        </div>

        {submitted && (
          <p style={{ color: "#63d682", fontSize: "0.82rem", marginTop: "0.75rem", fontWeight: 600 }}>
            ✓ Review submitted — thank you!
          </p>
        )}
      </div>

      {/* Review list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {reviews.map((r) => (
          <div
            key={r.id}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: "1.25rem 1.5rem",
              transition: "border 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: avatarColors[r.avatar] || "#6d63ff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: "0.9rem", flexShrink: 0,
                }}>
                  {r.avatar}
                </div>
                <div>
                  <p style={{ color: "#e0e0f0", fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>{r.user}</p>
                  <p style={{ color: "#505070", fontSize: "0.75rem", margin: 0 }}>{r.date}</p>
                </div>
              </div>
              <Stars value={r.rating} readonly size={16} />
            </div>

            <p style={{ color: "#9090b8", fontSize: "0.88rem", lineHeight: 1.7, margin: "0.85rem 0 0" }}>
              {r.comment}
            </p>

            {/* Like button */}
            <button
              onClick={() => toggleLike(r.id)}
              style={{
                marginTop: "0.85rem",
                background: r.liked ? "rgba(109,99,255,0.2)" : "rgba(255,255,255,0.04)",
                border: r.liked ? "1px solid rgba(109,99,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                color: r.liked ? "#a78bfa" : "#606080",
                padding: "0.35rem 0.85rem",
                fontSize: "0.8rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
                fontWeight: r.liked ? 700 : 400,
              }}
            >
              👍 {r.likes} {r.likes === 1 ? "like" : "likes"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}