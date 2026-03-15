"use client";

import { useQuery } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GET_COURSE } from "@/graphql/queries";
import CourseReviews from "@/components/CourseReviews";

// ─── Star display ─────────────────────────────────────────────────────────────
function Stars({ value = 0, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            fontSize: size,
            color: s <= Math.round(value) ? "#f5a623" : "rgba(255,255,255,0.15)",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

// ─── Level badge ──────────────────────────────────────────────────────────────
function LevelBadge({ level }) {
  const colors = {
    beginner: { bg: "rgba(99,214,130,0.12)", color: "#63d682", border: "rgba(99,214,130,0.3)" },
    intermediate: { bg: "rgba(245,166,35,0.12)", color: "#f5a623", border: "rgba(245,166,35,0.3)" },
    advanced: { bg: "rgba(255,90,90,0.12)", color: "#ff7070", border: "rgba(255,90,90,0.3)" },
  };
  const style = colors[level?.toLowerCase()] || colors.beginner;
  return (
    <span style={{
      background: style.bg, color: style.color,
      border: `1px solid ${style.border}`,
      borderRadius: 6, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700,
      textTransform: "capitalize",
    }}>
      {level}
    </span>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 18, radius = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }} />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_COURSE, {
    variables: { slug: courseId },
    skip: !courseId,
  });

  const course = data?.getCourse;

  // ── Handle enroll click (swap with real payment/auth flow) ──
  const handleEnroll = () => {
    // TODO: check auth → redirect to checkout or /learn/[slug]/first-lesson
    router.push(`/learn/${course?.slug}`);
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0d0d1a", color: "#e0e0f0", fontFamily: "'Inter', sans-serif" }}>

        {/* ── Navbar ── */}
        <header style={{
          height: 56, background: "rgba(13,13,26,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", padding: "0 1.5rem",
          position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)",
        }}>
          <Link href="/" style={{ color: "#6d63ff", fontWeight: 800, fontSize: "1.1rem", textDecoration: "none" }}>
            • LearnFlow
          </Link>
          <span style={{ color: "rgba(255,255,255,0.15)", margin: "0 0.6rem" }}>/</span>
          <span style={{ color: "#a0a0c0", fontSize: "0.85rem" }}>
            {loading ? "Loading..." : course?.title ?? "Course"}
          </span>
        </header>

        {/* ── Error ── */}
        {error && (
          <div style={{ maxWidth: 860, margin: "3rem auto", padding: "0 1.5rem" }}>
            <div style={{ background: "rgba(255,90,90,0.1)", border: "1px solid rgba(255,90,90,0.3)", borderRadius: 12, padding: "1.25rem 1.5rem", color: "#ff7070" }}>
              Failed to load course. Please try again.
            </div>
          </div>
        )}

        {/* ── Hero ── */}
        <div style={{ background: "linear-gradient(180deg, #13132a 0%, #0d0d1a 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "3rem 1.5rem 2.5rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: "3rem", alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* Left: info */}
            <div style={{ flex: 1, minWidth: 280 }}>
              {/* Topic + level */}
              <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
                {loading ? <Skeleton w={80} h={24} radius={6} /> : (
                  <>
                    <span style={{ background: "rgba(109,99,255,0.15)", color: "#a78bfa", border: "1px solid rgba(109,99,255,0.3)", borderRadius: 6, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
                      {course?.topic}
                    </span>
                    <LevelBadge level={course?.level} />
                  </>
                )}
              </div>

              {/* Title */}
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1rem" }}>
                  <Skeleton h={36} radius={8} />
                  <Skeleton w="70%" h={36} radius={8} />
                </div>
              ) : (
                <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, color: "#fff", margin: "0 0 1rem", lineHeight: 1.2, letterSpacing: "-0.03em" }}>
                  {course?.title}
                </h1>
              )}

              {/* Description */}
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.25rem" }}>
                  <Skeleton h={16} /><Skeleton h={16} /><Skeleton w="80%" h={16} />
                </div>
              ) : (
                <p style={{ color: "#8888b0", fontSize: "0.95rem", lineHeight: 1.7, margin: "0 0 1.25rem" }}>
                  {course?.description}
                </p>
              )}

              {/* Rating row */}
              {loading ? <Skeleton w={200} h={20} /> : course?.rating && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Stars value={course.rating.average} />
                  <span style={{ color: "#f5a623", fontWeight: 700, fontSize: "0.9rem" }}>
                    {course.rating.average?.toFixed(1)}
                  </span>
                  <span style={{ color: "#505070", fontSize: "0.82rem" }}>
                    ({course.rating.count?.toLocaleString()} ratings)
                  </span>
                </div>
              )}

              {/* Tags */}
              {!loading && course?.tags?.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "1rem" }}>
                  {course.tags.map((tag) => (
                    <span key={tag} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 99, padding: "2px 10px", fontSize: "0.72rem", color: "#7070a0" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: enroll card */}
            <div style={{
              width: 300, flexShrink: 0,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, overflow: "hidden",
              position: "sticky", top: 72,
            }}>
              {/* Thumbnail */}
              <div style={{ width: "100%", aspectRatio: "16/9", background: "#1a1a35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                {loading ? (
                  <Skeleton w="100%" h="100%" radius={0} />
                ) : course?.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : "🎬"}
              </div>

              <div style={{ padding: "1.25rem" }}>
                {/* Price */}
                {loading ? <Skeleton w={100} h={32} radius={6} /> : (
                  <div style={{ marginBottom: "1rem" }}>
                    {course?.isFree ? (
                      <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#63d682" }}>Free</span>
                    ) : (
                      <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff" }}>
                        ${course?.price}
                      </span>
                    )}
                  </div>
                )}

                {/* Enroll button */}
                <button
                  onClick={handleEnroll}
                  disabled={loading}
                  style={{
                    width: "100%", background: loading ? "rgba(109,99,255,0.3)" : "#6d63ff",
                    border: "none", borderRadius: 12, color: "#fff",
                    padding: "0.85rem", fontWeight: 700, fontSize: "1rem",
                    cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s",
                    marginBottom: "0.75rem",
                  }}
                >
                  {course?.isFree ? "Enroll for Free" : "Enroll Now"}
                </button>

                <p style={{ color: "#505070", fontSize: "0.75rem", textAlign: "center", margin: 0 }}>
                  30-day money-back guarantee
                </p>

                {/* Quick facts */}
                {!loading && (
                  <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem" }}>
                    {[
                      ["🎯", "Level", course?.level],
                      ["📚", "Topic", course?.topic],
                      ["⭐", "Rating", `${course?.rating?.average?.toFixed(1)} / 5`],
                    ].map(([icon, label, val]) => val && (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span style={{ color: "#505070" }}>{icon} {label}</span>
                        <span style={{ color: "#c0c0d8", fontWeight: 600, textTransform: "capitalize" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
          <div style={{ maxWidth: 760 }}>

            {/* What you'll learn */}
            <section style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ color: "#fff", fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                What you'll learn
              </h2>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...Array(4)].map((_, i) => <Skeleton key={i} h={16} w={`${75 + i * 5}%`} />)}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.65rem" }}>
                  {(course?.tags ?? []).map((tag) => (
                    <div key={tag} style={{ display: "flex", alignItems: "center", gap: 8, color: "#9090b8", fontSize: "0.88rem" }}>
                      <span style={{ color: "#63d682", fontWeight: 900, fontSize: "0.8rem" }}>✓</span>
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Description */}
            <section style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ color: "#fff", fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                Course Description
              </h2>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...Array(5)].map((_, i) => <Skeleton key={i} h={15} w={i === 4 ? "60%" : "100%"} />)}
                </div>
              ) : (
                <p style={{ color: "#8888b0", fontSize: "0.92rem", lineHeight: 1.85, margin: 0 }}>
                  {course?.description}
                </p>
              )}
            </section>

            {/* Reviews */}
            <CourseReviews courseId={courseId} />
          </div>
        </div>
      </div>
    </>
  );
}