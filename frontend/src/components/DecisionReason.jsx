import React from "react";

function insightColor(text) {
  const value = String(text || "").toLowerCase();
  if (value.startsWith("missing")) return { border: "#f0a8a8", bg: "#fff7f7" };
  if (value.startsWith("bonus")) return { border: "#ddd", bg: "#fafafa" };
  return { border: "#a8d5b5", bg: "#f7fff9" };
}

export default function DecisionReason({ candidate }) {
  const insights = candidate.skill_insights || [];
  if (!candidate.decision_reason && !insights.length) return null;

  return (
    <div style={{ marginTop: 14, background: "#fffdf7", border: "0.5px solid #e5dcc5", borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
        Why {candidate.recommendation}
      </div>

      {candidate.decision_reason && (
        <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6, marginBottom: insights.length ? 10 : 0 }}>
          {candidate.decision_reason}
        </div>
      )}

      {insights.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {insights.map((item, index) => {
            const colors = insightColor(item);
            return (
              <div key={`${item}-${index}`} style={{ background: colors.bg, borderLeft: `3px solid ${colors.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 12, color: "#555", lineHeight: 1.5 }}>
                {item}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
