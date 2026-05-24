
import React, { useEffect, useState } from "react";
import api from "../services/api";
export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, billing: 0 });
  useEffect(() => {
    const load = async () => {
      try {
        const [p, d, a, b] = await Promise.all([api.get("/patients"), api.get("/doctors"), api.get("/appointments"), api.get("/billing")]);
        setStats({ patients: p.data.length, doctors: d.data.length, appointments: a.data.length, billing: b.data.length });
      } catch(e) { console.error(e); }
    };
    load();
  }, []);
  const cards = [
    { label: "Total Patients", value: stats.patients, color: "#6366f1" },
    { label: "Total Doctors", value: stats.doctors, color: "#0ea5e9" },
    { label: "Appointments", value: stats.appointments, color: "#10b981" },
    { label: "Billing Records", value: stats.billing, color: "#f59e0b" },
  ];
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>Dashboard Overview</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 30 }}>
        {cards.map(card => (
          <div key={card.label} style={{ background: "#1e293b", borderRadius: 12, padding: 24, borderLeft: "4px solid " + card.color }}>
            <div style={{ fontSize: 36, fontWeight: "bold", color: card.color }}>{card.value}</div>
            <div style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#1e293b", borderRadius: 12, padding: 30, textAlign: "center" }}>
        <p style={{ color: "#475569", fontSize: 15 }}>Charts and analytics coming soon.</p>
      </div>
    </div>
  );
}
