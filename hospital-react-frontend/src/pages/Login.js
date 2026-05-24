import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError("Please enter both fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      } else {
        setError("Invalid credentials.");
      }
    } catch {
      setError("Invalid username or password.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a" }}>
      {/* Left Panel */}
      <div style={{ width: 380, background: "#1e3a5f", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ fontSize: 52 }}>??</div>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: "bold", marginTop: 16 }}>MediCare Pro</h1>
        <p style={{ color: "#93c5fd", fontSize: 13, textAlign: "center", marginTop: 8 }}>Hospital Management System</p>
        <div style={{ marginTop: 40, width: "100%" }}>
          {["Patient Records & History", "Doctor Scheduling", "Appointment Management",
            "Billing & Invoicing", "Real-time Analytics"].map(f => (
            <p key={f} style={{ color: "#bfdbfe", fontSize: 13, marginBottom: 12 }}>?  {f}</p>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 360 }}>
          <h2 style={{ fontSize: 30, fontWeight: "bold", color: "#f1f5f9", marginBottom: 8 }}>Welcome Back</h2>
          <p style={{ color: "#64748b", marginBottom: 32 }}>Sign in to your account</p>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: "bold", display: "block", marginBottom: 6 }}>USERNAME</label>
              <input value={username} onChange={e => { setUsername(e.target.value); setError(""); }}
                placeholder="Enter your username" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: "bold", display: "block", marginBottom: 6 }}>PASSWORD</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password" />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-primary"
              style={{ width: "100%", padding: "13px", fontSize: 15, marginTop: 16 }} disabled={loading}>
              {loading ? "Signing in..." : "Sign In ?"}
            </button>
          </form>
          <p style={{ color: "#334155", fontSize: 11, textAlign: "center", marginTop: 16 }}>Default: admin / 1234</p>
        </div>
      </div>
    </div>
  );
}
