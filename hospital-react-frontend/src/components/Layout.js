import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "?" },
  { path: "/patients", label: "Patients", icon: "??" },
  { path: "/doctors", label: "Doctors", icon: "??" },
  { path: "/appointments", label: "Appointments", icon: "??" },
  { path: "/billing", label: "Billing", icon: "??" },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Bar */}
      <div style={{ background: "#1e293b", height: 60, display: "flex", alignItems: "center",
        padding: "0 30px", borderBottom: "1px solid #334155", justifyContent: "space-between" }}>
        <span style={{ fontSize: 18, fontWeight: "bold", color: "#f1f5f9" }}>?? MediCare Pro</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>Welcome, Admin</span>
          <button className="btn btn-dark" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "#1e293b", borderRight: "1px solid #334155",
          padding: "30px 16px", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 10, color: "#475569", fontWeight: "bold",
            padding: "0 0 8px 8px", marginBottom: 8 }}>NAVIGATION</div>
          {navItems.map(item => (
            <button key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: location.pathname === item.path ? "#6366f1" : "transparent",
                color: location.pathname === item.path ? "#fff" : "#94a3b8",
                border: "none", borderRadius: 8, padding: "11px 16px",
                fontSize: 13, fontWeight: location.pathname === item.path ? "bold" : "normal",
                textAlign: "left", cursor: "pointer", marginBottom: 4,
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { if(location.pathname !== item.path) e.target.style.background = "#263348"; e.target.style.color = "#e2e8f0"; }}
              onMouseLeave={e => { if(location.pathname !== item.path) { e.target.style.background = "transparent"; e.target.style.color = "#94a3b8"; }}}
            >
              {item.icon}  {item.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={handleLogout}
            style={{ background: "transparent", color: "#94a3b8", border: "none",
              borderRadius: 8, padding: "11px 16px", fontSize: 13, textAlign: "left", cursor: "pointer" }}
            onMouseEnter={e => { e.target.style.background = "#263348"; e.target.style.color = "#f1f5f9"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#94a3b8"; }}>
            ? Logout
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto", background: "#0f172a", padding: 30 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
