"use client";

import { useState } from "react";
import Overview from "../../components/dashboard/Overview";
import Users from "../../components/dashboard/Users";
import Courses from "../../components/dashboard/Courses";

const NAV = [
  { id: "overview", label: "Overview", icon: "▦" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "courses", label: "Courses", icon: "🎬" },
];

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", color: "#e0e0f0", fontFamily: "'Inter', sans-serif", display: "flex" }}>

      <aside style={{
        width: 220, flexShrink: 0, background: "#0f0f20",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ color: "#6d63ff", fontWeight: 800, fontSize: "1.1rem", margin: 0, letterSpacing: "-0.02em" }}>• LearnFlow</p>
          <p style={{ color: "#505070", fontSize: "0.72rem", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin Panel</p>
        </div>

        <nav style={{ padding: "1rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                background: active === item.id ? "rgba(109,99,255,0.18)" : "transparent",
                border: "none",
                borderLeft: active === item.id ? "3px solid #6d63ff" : "3px solid transparent",
                borderRadius: active === item.id ? "0 8px 8px 0" : "8px",
                color: active === item.id ? "#fff" : "#606080",
                padding: "0.65rem 1rem",
                textAlign: "left", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                fontSize: "0.85rem", fontWeight: active === item.id ? 700 : 400,
                transition: "all 0.15s",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ color: "#505070", fontSize: "0.75rem", margin: 0 }}>Logged in as</p>
          <p style={{ color: "#a0a0c0", fontSize: "0.82rem", fontWeight: 600, margin: "2px 0 0" }}>Admin</p>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem" }}>
        {active === "overview" && <Overview />}
        {active === "users" && <Users />}
        {active === "courses" && <Courses />}
      </main>
    </div>
  );
}