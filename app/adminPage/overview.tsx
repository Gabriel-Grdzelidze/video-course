'use client';
import { useQuery } from "@apollo/client/react";
import { GET_ALL_USERS, GET_COURSES} from "../../lib/graphql/queries";

export default function Overview() {
  const { data: usersData } = useQuery(GET_ALL_USERS);
  const { data: coursesData } = useQuery(GET_COURSES);

  const users = usersData?.getUsers ?? [];
  const courses = coursesData?.getCourses ?? [];
  const published = courses.filter((c: any) => c.isPublished).length;
  const free = courses.filter((c: any) => c.isFree).length;

  const stats = [
    { label: "Total Users", value: users.length, icon: "👥", color: "#6d63ff" },
    { label: "Total Courses", value: courses.length, icon: "🎬", color: "#22d3ee" },
    { label: "Published", value: published, icon: "✅", color: "#4ade80" },
    { label: "Free Courses", value: free, icon: "🎁", color: "#f59e0b" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", color: "#fff" }}>
        Platform Overview
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "#13131f", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "1.25rem",
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "#606080", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "#a0a0c0" }}>
        Recent Courses
      </h3>
      <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#505070" }}>
              <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Title</th>
              <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Topic</th>
              <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Instructor</th>
              <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {courses.slice(0, 5).map((c: any) => (
              <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#e0e0f0" }}>{c.title}</td>
                <td style={{ padding: "0.75rem 1rem", color: "#606080" }}>{c.topic}</td>
                <td style={{ padding: "0.75rem 1rem", color: "#606080" }}>{c.instructor?.name ?? "—"}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{
                    background: c.isPublished ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.07)",
                    color: c.isPublished ? "#4ade80" : "#606080",
                    borderRadius: 6, padding: "2px 10px", fontSize: "0.75rem"
                  }}>
                    {c.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}