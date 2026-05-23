import React, { useEffect, useState } from "react";
import ScreenPage from "./pages/ScreenPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import { getCurrentUser } from "./utils/api";

const tabs = ["Screen Candidates", "Dashboard", "How It Works"];

export default function App() {
  const [active, setActive] = useState(0);
  const [refreshDash, setRefreshDash] = useState(0);
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [checkingAuth, setCheckingAuth] = useState(() => Boolean(localStorage.getItem("token")));

  const handleCandidateAdded = () => setRefreshDash((r) => r + 1);
  const isLoggedIn = Boolean(username && localStorage.getItem("token"));
  const title = active === 1 && !isLoggedIn ? "Admin Login" : tabs[active];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getCurrentUser()
      .then((user) => {
        const nextUsername = user.username || localStorage.getItem("username") || "admin";
        localStorage.setItem("username", nextUsername);
        setUsername(nextUsername);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setUsername("");
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername("");
    setActive(0);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0" }}>
      <div style={{ background: "#fff", borderBottom: "0.5px solid #e0ddd8", padding: "0 2rem" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, minHeight: 64, flexWrap: "wrap", padding: "8px 0" }}>
          <div style={{ width: 32, height: 32, background: "#1a1a2e", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="16" height="16" rx="3" fill="white" opacity="0.15" />
              <path d="M5 7h10M5 10h7M5 13h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="15" cy="13" r="3" fill="#6ee7b7" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>ResumeScreen AI</div>
            <div style={{ fontSize: 10, color: "#888", fontFamily: "'DM Mono', monospace" }}>NLP-powered candidate ranking</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActive(i)}
                style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: active === i ? "#f5f4f0" : "transparent", color: active === i ? "#1a1a1a" : "#777", fontFamily: "'Syne', sans-serif" }}
              >
                {tab}
              </button>
            ))}
          </div>
          {isLoggedIn && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#666", fontFamily: "'DM Mono', monospace" }}>
              <span>{username}</span>
              <button
                onClick={handleLogout}
                style={{ padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer", border: "0.5px solid #ddd", background: "#fff", color: "#555", fontFamily: "'Syne', sans-serif" }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "1.5rem 2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>{title}</h1>
          <p style={{ fontSize: 13, color: "#777", marginTop: 4, lineHeight: 1.5 }}>
            {active === 0 && "Paste or upload a resume and job description to get an AI-powered match score."}
            {active === 1 && isLoggedIn && "All screened candidates ranked by match score. Select any candidate to view full details."}
            {active === 1 && !isLoggedIn && "Sign in to manage screened candidates and export results."}
            {active === 2 && "System architecture, scoring formula, and tech stack explained."}
          </p>
        </div>

        {active === 0 && <ScreenPage onCandidateAdded={handleCandidateAdded} />}
        {active === 1 && checkingAuth && <div style={{ fontSize: 13, color: "#777" }}>Checking admin session...</div>}
        {active === 1 && !checkingAuth && !isLoggedIn && <LoginPage onLogin={(user) => setUsername(user)} />}
        {active === 1 && !checkingAuth && isLoggedIn && <DashboardPage refresh={refreshDash} />}
        {active === 2 && <AboutPage />}
      </main>
    </div>
  );
}
