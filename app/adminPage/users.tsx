'use client';
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_ALL_USERS } from "../../lib/graphql/queries";

export default function Users() {
  const [search, setSearch] = useState("");
  const { data, loading } = useQuery(GET_ALL_USERS);
  const users = (data?.getUsers ?? []).filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", margin: 0 }}>All Users</h2>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
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
                <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Name</th>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Email</th>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "0.75rem 1rem", color: "#e0e0f0", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "#6d63ff", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
                    }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    {u.name}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#606080" }}>{u.email}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#404060", fontSize: "0.72rem", fontFamily: "monospace" }}>{u.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}