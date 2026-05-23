import React from "react";

const chip = {
  matched: { background: "#e6f4ea", color: "#1e6e35", border: "0.5px solid #a8d5b5" },
  missing: { background: "#fde8e8", color: "#9e2a2b", border: "0.5px solid #f0a8a8" },
  extra: { background: "#f0f0f0", color: "#555", border: "0.5px solid #ddd" },
};

export default function SkillChips({ skills = [], type = "matched", label }) {
  if (!skills.length) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>
          {label}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {skills.map((s) => (
          <span key={s} style={{ ...chip[type], padding: "3px 10px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
