import React, { useState, useEffect, useCallback } from "react";
import { getCandidates, getStats, deleteCandidate } from "../utils/api";
import SkillChips from "../components/SkillChips";
import DecisionReason from "../components/DecisionReason";

const recStyle = {
  Shortlist: { background: "#e6f4ea", color: "#1e6e35" },
  Consider: { background: "#fef3c7", color: "#92400e" },
  Reject: { background: "#fde8e8", color: "#9e2a2b" },
};

function barColor(score) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function scoreColor(score) {
  if (score >= 75) return "#1e6e35";
  if (score >= 50) return "#92400e";
  return "#9e2a2b";
}

function csvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function DashboardPage({ refresh }) {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [candidateData, statsData] = await Promise.all([getCandidates(), getStats()]);
      setCandidates(candidateData.candidates || []);
      setStats(statsData);
    } catch (e) {
      setCandidates([]);
      setStats(null);
      setError(e.response?.data?.error || e.response?.data?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  const filtered = filter === "All" ? candidates : candidates.filter((candidate) => candidate.recommendation === filter);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    await deleteCandidate(id);
    if (selected?.id === id) setSelected(null);
    load();
  };

  const exportCsv = () => {
    const header = ["Name", "Email", "Role", "Match Score", "Recommendation", "Matched Skills", "Missing Skills", "Screened At"];
    const rows = filtered.map((candidate) => [
      candidate.name,
      candidate.email,
      candidate.role,
      candidate.match_score,
      candidate.recommendation,
      candidate.matched_skills?.join("; "),
      candidate.missing_skills?.join("; "),
      candidate.created_at,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "candidate-screening-results.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const s = {
    card: { background: "#fff", border: "0.5px solid #e0ddd8", borderRadius: 10, padding: "1.25rem" },
    label: { fontSize: 11, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "block", fontFamily: "'DM Mono', monospace" },
    statCard: { background: "#fff", border: "0.5px solid #e0ddd8", borderRadius: 10, padding: 12, textAlign: "center" },
    smallButton: { padding: "7px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: "0.5px solid #ddd", background: "#fff", color: "#555", fontFamily: "'Syne', sans-serif" },
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#777", padding: "2rem 0" }}>
      <div style={{ width: 16, height: 16, border: "2px solid #ddd", borderTopColor: "#777", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      <span style={{ fontSize: 13 }}>Loading dashboard...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ ...s.card, color: "#9e2a2b", lineHeight: 1.6 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Dashboard unavailable</div>
      <div style={{ fontSize: 13 }}>{error}</div>
      <button onClick={load} style={{ ...s.smallButton, marginTop: 14 }}>Try Again</button>
    </div>
  );

  if (!candidates.length) return (
    <div style={{ ...s.card, textAlign: "center", padding: "3rem 1rem", color: "#999" }}>
      <div style={{ fontWeight: 700, color: "#666", marginBottom: 4 }}>No candidates screened yet</div>
      <div style={{ fontSize: 13 }}>Go to Screen Candidates to analyze resumes. Results will appear here ranked.</div>
    </div>
  );

  return (
    <div>
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: "1rem" }}>
          {[
            { label: "Total Screened", value: stats.total_candidates },
            { label: "Avg Match", value: `${stats.average_score}%` },
            { label: "Shortlisted", value: stats.shortlisted },
            { label: "Top Score", value: `${stats.top_score}%` },
          ].map((item) => (
            <div key={item.label} style={s.statCard}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#1a1a1a" }}>{item.value}</div>
              <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 4, marginBottom: "1rem", flexWrap: "wrap" }}>
        {["All", "Shortlist", "Consider", "Reject"].map((item) => (
          <button key={item} onClick={() => setFilter(item)} style={{ ...s.smallButton, background: filter === item ? "#1a1a2e" : "#fff", color: filter === item ? "#fff" : "#555" }}>
            {item}
          </button>
        ))}
        <button onClick={exportCsv} style={{ ...s.smallButton, marginLeft: "auto" }}>Export CSV</button>
        <button onClick={load} style={s.smallButton}>Refresh</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
        <div>
          <span style={s.label}>Candidate Rankings ({filtered.length})</span>
          <div style={{ maxHeight: 560, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((candidate, index) => {
              const isSelected = selected?.id === candidate.id;
              const badge = recStyle[candidate.recommendation] || { background: "#f0f0f0", color: "#555" };
              return (
                <div key={candidate.id} onClick={() => setSelected(candidate)} style={{ background: "#fff", border: `0.5px solid ${isSelected ? "#1a1a2e" : "#e0ddd8"}`, borderRadius: 10, padding: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ background: "#f5f4f0", color: "#555", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>#{index + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{candidate.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(candidate.match_score), fontFamily: "'DM Mono', monospace" }}>{Math.round(candidate.match_score)}%</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 5, fontFamily: "'DM Mono', monospace" }}>{candidate.role || "General Role"}</div>
                    <div style={{ background: "#f0ede8", borderRadius: 3, height: 5, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${candidate.match_score}%`, background: barColor(candidate.match_score), borderRadius: 3 }} />
                    </div>
                  </div>
                  <span style={{ ...badge, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{candidate.recommendation}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          {selected ? (
            <div style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.name}</div>
                  <div style={{ fontSize: 11, color: "#999", fontFamily: "'DM Mono', monospace" }}>{selected.email || "No email"} - {selected.role || "General Role"}</div>
                </div>
                <button onClick={() => handleDelete(selected.id)} style={{ fontSize: 11, color: "#9e2a2b", background: "#fde8e8", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}>Delete</button>
              </div>
              <div style={{ fontSize: 44, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: scoreColor(selected.match_score) }}>{Math.round(selected.match_score)}%</div>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 12 }}>match score</div>
              <div style={{ background: "#f0ede8", borderRadius: 4, height: 8, marginBottom: 14, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${selected.match_score}%`, background: barColor(selected.match_score), borderRadius: 4, transition: "width 1s" }} />
              </div>
              <SkillChips skills={selected.matched_skills} type="matched" label="Matched Skills" />
              <SkillChips skills={selected.missing_skills} type="missing" label="Missing Skills" />
              <SkillChips skills={selected.extra_skills} type="extra" label="Bonus Skills" />
              {selected.ai_summary && <div style={{ marginTop: 10, background: "#f5f4f0", borderRadius: 8, padding: 12, fontSize: 13, color: "#555", lineHeight: 1.6, borderLeft: "3px solid #1a1a2e" }}>{selected.ai_summary}</div>}
              <DecisionReason candidate={selected} />
              <div style={{ fontSize: 11, color: "#999", marginTop: 10, fontFamily: "'DM Mono', monospace" }}>
                Screened: {new Date(selected.created_at).toLocaleString()}
              </div>
            </div>
          ) : (
            <div style={{ ...s.card, textAlign: "center", padding: "2rem", color: "#999" }}>
              <div style={{ fontSize: 13 }}>Select a candidate to view details.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
