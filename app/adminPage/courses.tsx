'use client';
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_COURSES } from "../../lib/graphql/queries";

export default function Courses() {
  const [search, setSearch] = useState("");
  const { data, loading } = useQuery(GET_COURSES);
  const courses = (data?.getCourses ?? []).filter((c: any) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", margin: 0 }}>All Courses</h2>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search courses..."
          style={{
            background: "#13131f", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "0.5rem 1rem", color: "#fff",
            fontSize: "0.83rem", outline: "none", width: 220,
          }}
        />
      </div>

      {loading ? (
        <p style={{ color: "#505070" }}>Loading...</p>
      ) : (
        <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#505070" }}>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Title</th>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Topic</th>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Instructor</th>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Price</th>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Status</th>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c: any) => (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "0.75rem 1rem", color: "#e0e0f0", maxWidth: 200 }}>{c.title}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#606080" }}>{c.topic}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#606080" }}>{c.instructor?.name ?? "—"}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#6d63ff", fontWeight: 600 }}>
                    {c.isFree ? "Free" : `$${c.price}`}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{
                      background: c.isPublished ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.07)",
                      color: c.isPublished ? "#4ade80" : "#606080",
                      borderRadius: 6, padding: "2px 10px", fontSize: "0.75rem"
                    }}>
                      {c.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#f59e0b" }}>
                    {c.rating?.average ? `★ ${c.rating.average.toFixed(1)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}