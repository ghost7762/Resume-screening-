import React from "react";

const techStack = [
  { layer: "Frontend", tech: "React 18 + Axios", color: "#e8f0fe" },
  { layer: "Backend", tech: "Python Flask + JWT", color: "#e6f4ea" },
  { layer: "NLP Engine", tech: "spaCy + keyword matching", color: "#fef3c7" },
  { layer: "AI Scoring", tech: "Claude API optional", color: "#ede9fe" },
  { layer: "Resume Parsing", tech: "PyPDF2 + python-docx", color: "#fde8e8" },
  { layer: "Database", tech: "MongoDB + MongoEngine", color: "#f0f0f0" },
];

const steps = [
  ["Input Layer", "PDF, DOCX, TXT upload or pasted resume text with a job description."],
  ["Parser Service", "PyPDF2 and python-docx extract plain text from uploaded files."],
  ["NLP Engine", "Skill keywords and optional spaCy named entity recognition identify candidate and role skills."],
  ["AI Scorer", "Claude can add holistic scoring when an Anthropic API key is configured."],
  ["Dashboard", "Candidates are ranked by match score with skill gaps, summaries, and CSV export."],
  ["Database", "MongoDB stores candidate records, scores, skills, and recommendations."],
];

export default function AboutPage() {
  const s = {
    card: { background: "#fff", border: "0.5px solid #e0ddd8", borderRadius: 10, padding: "1.25rem", marginBottom: "1rem" },
    label: { fontSize: 11, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, display: "block", fontFamily: "'DM Mono', monospace" },
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={s.card}>
        <span style={s.label}>System Architecture</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map(([title, desc], index) => (
            <div key={title}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0" }}>
                <div style={{ width: 34, height: 34, background: "#f5f4f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>{index + 1}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#777", marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
              {index < steps.length - 1 && <div style={{ marginLeft: 17, width: 2, height: 14, background: "#e0ddd8" }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <span style={s.label}>Scoring Formula</span>
        <div style={{ background: "#f5f4f0", borderRadius: 8, padding: "14px 16px", fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#1a1a1a", marginBottom: 10 }}>
          Match % = (Matched Skills / Total JD Skills) x 100
        </div>
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>
          The fallback score is deterministic keyword matching. When Claude is configured, the system can adjust the final recommendation using experience relevance, education fit, and the overall resume context.
        </div>
      </div>

      <div style={s.card}>
        <span style={s.label}>Tech Stack</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
          {techStack.map((item) => (
            <div key={item.layer} style={{ background: item.color, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: "#777", fontFamily: "'DM Mono', monospace" }}>{item.layer}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{item.tech}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <span style={s.label}>Viva Explanation</span>
        <div style={{ background: "#f5f4f0", borderLeft: "3px solid #1a1a2e", borderRadius: 8, padding: "14px 16px", fontSize: 13, color: "#444", lineHeight: 1.7, fontStyle: "italic" }}>
          "The system uses NLP and keyword matching to extract skills from uploaded resumes. It compares those skills against the job description, calculates a match score, highlights missing skills, and ranks candidates for faster HR shortlisting."
        </div>
      </div>

      <div style={s.card}>
        <span style={s.label}>API Endpoints</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            ["POST", "/api/resume/upload", "Upload and analyze a resume file"],
            ["POST", "/api/resume/analyze-text", "Analyze from pasted text"],
            ["GET", "/api/candidates", "Get all candidates ranked by score"],
            ["GET", "/api/candidates/:id", "Get one candidate"],
            ["DELETE", "/api/candidates/:id", "Delete a candidate"],
            ["GET", "/api/stats", "Dashboard statistics"],
            ["POST", "/api/auth/login", "Admin authentication"],
          ].map(([method, path, desc]) => (
            <div key={path} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, flexWrap: "wrap" }}>
              <span style={{ background: method === "POST" ? "#e8f0fe" : method === "DELETE" ? "#fde8e8" : "#e6f4ea", color: method === "POST" ? "#1a56b0" : method === "DELETE" ? "#9e2a2b" : "#1e6e35", padding: "2px 8px", borderRadius: 4, fontFamily: "'DM Mono', monospace", fontWeight: 600, minWidth: 50, textAlign: "center" }}>{method}</span>
              <code style={{ fontFamily: "'DM Mono', monospace", color: "#1a1a2e", fontSize: 12 }}>{path}</code>
              <span style={{ color: "#777" }}>- {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
