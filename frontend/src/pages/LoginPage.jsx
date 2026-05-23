import React, { useState } from "react";
import { login } from "../utils/api";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim()) return setError("Username is required.");
    if (!password) return setError("Password is required.");

    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.username);
      if (onLogin) onLogin(data.username);
    } catch (e) {
      setError(e.response?.data?.error || "Login failed. Check your admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    card: { background: "#fff", border: "0.5px solid #e0ddd8", borderRadius: 10, padding: "1.5rem", maxWidth: 420 },
    label: { fontSize: 11, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "block", fontFamily: "'DM Mono', monospace" },
    input: { width: "100%", border: "0.5px solid #d8d4cc", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "'Syne', sans-serif", background: "#f9f8f4", color: "#1a1a1a", outline: "none", boxSizing: "border-box" },
    btn: { width: "100%", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", background: "#1a1a2e", color: "#fff", fontFamily: "'Syne', sans-serif" },
    linkButton: { border: "none", background: "transparent", color: "#555", fontSize: 12, cursor: "pointer", fontFamily: "'Syne', sans-serif", padding: 0 },
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", alignItems: "start" }}>
      <form onSubmit={submit} style={s.card}>
        <span style={s.label}>Admin Access</span>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>Sign in to dashboard</div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.5, marginBottom: 18 }}>
          Use your admin credentials to view candidate rankings, delete records, and export screening results.
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={s.label} htmlFor="username">Username</label>
          <input
            id="username"
            style={s.input}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder="admin"
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={s.label} htmlFor="password">Password</label>
          <input
            id="password"
            style={s.input}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter password"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
            />
            Show password
          </label>
        </div>

        {error && (
          <div style={{ background: "#fde8e8", color: "#9e2a2b", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div style={{ background: "#fff", border: "0.5px solid #e0ddd8", borderRadius: 10, padding: "1.25rem" }}>
        <span style={s.label}>Default Demo Login</span>
        <div style={{ display: "grid", gap: 8, fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#555" }}>
          <div>Username: admin</div>
          <div>Password: admin123</div>
        </div>
        <button
          type="button"
          style={{ ...s.linkButton, marginTop: 14 }}
          onClick={() => {
            setUsername("admin");
            setPassword("admin123");
            setError("");
          }}
        >
          Fill demo credentials
        </button>
      </div>
    </div>
  );
}
