import React from "react";
import SkillChips from "./SkillChips";
import DecisionReason from "./DecisionReason";

const recStyle = {
  Shortlist: { background: "#e6f4ea", color: "#1e6e35" },
  Consider: { background: "#fef3c7", color: "#92400e" },
  Reject: { background: "#fde8e8", color: "#9e2a2b" },
};

function scoreColor(score) {
  if (score >= 75) return "#1e6e35";
  if (score >= 50) return "#92400e";
  return "#9e2a2b";
}

function barColor(score) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function ScoreCard({ candidate, rank }) {
  const badge = recStyle[candidate.recommendation] || { background: "#f0f0f0", color: "#555" };

  return (
    <div style={{ background: "#fff", border: "0.5px solid #e0ddd8", borderRadius: 10, padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{candidate.name}</div>
          <div style={{ fontSize: 11, color: "#777", fontFamily: "'DM Mono', monospace" }}>
            {candidate.role || "General Role"} {rank != null && `- Rank #${rank + 1}`}
          </div>
        </div>
        <span style={{ ...badge, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
          {candidate.recommendation}
        </span>
      </div>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 52, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: scoreColor(candidate.match_score) }}>
          {Math.round(candidate.match_score)}%
        </div>
        <div style={{ fontSize: 11, color: "#777" }}>Match Score</div>
        <div style={{ background: "#f0ede8", borderRadius: 4, height: 8, marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${candidate.match_score}%`, background: barColor(candidate.match_score), borderRadius: 4, transition: "width 1s ease" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "#f5f4f0", borderRadius: 8, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{candidate.matched_skills?.length || 0}</div>
          <div style={{ fontSize: 11, color: "#777" }}>Skills matched</div>
        </div>
        <div style={{ background: "#f5f4f0", borderRadius: 8, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{candidate.missing_skills?.length || 0}</div>
          <div style={{ fontSize: 11, color: "#777" }}>Skill gaps</div>
        </div>
      </div>

      <SkillChips skills={candidate.matched_skills} type="matched" label="Matched Skills" />
      <SkillChips skills={candidate.missing_skills} type="missing" label="Missing Skills" />
      <SkillChips skills={candidate.extra_skills} type="extra" label="Bonus Skills" />

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <div style={{ background: "#f5f4f0", borderRadius: 8, padding: "8px 12px", flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{candidate.experience_relevance}</div>
          <div style={{ fontSize: 10, color: "#777" }}>Experience</div>
        </div>
        <div style={{ background: "#f5f4f0", borderRadius: 8, padding: "8px 12px", flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{candidate.education_fit}</div>
          <div style={{ fontSize: 10, color: "#777" }}>Education</div>
        </div>
      </div>

      {candidate.ai_summary && (
        <div style={{ marginTop: 14, background: "#f5f4f0", borderRadius: 8, padding: 12, fontSize: 13, color: "#555", lineHeight: 1.6, borderLeft: "3px solid #1a1a2e" }}>
          {candidate.ai_summary}
        </div>
      )}

      <DecisionReason candidate={candidate} />
    </div>
  );
}
