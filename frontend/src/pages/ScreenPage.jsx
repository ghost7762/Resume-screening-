import React, { useState } from "react";
import ScoreCard from "../components/ScoreCard";
import { analyzeText, uploadFile } from "../utils/api";

const SAMPLE_JD =
  "We are looking for a Backend Developer with expertise in Python, Django, REST APIs, PostgreSQL, Docker, AWS, Git, Redis, CI/CD pipelines, and Agile methodology. Strong problem-solving skills required.";

const SAMPLE_RESUMES = [
  {
    name: "Aryan Mehta",
    email: "aryan.mehta@email.com",
    role: "Backend Developer",
    resume:
      "Backend engineer with 3 years of experience building production services. Skilled in Python, Django, REST APIs, PostgreSQL, Docker, AWS, Git, Redis, CI/CD, Agile, and problem solving. Also familiar with Flask and MySQL.",
  },
  {
    name: "Nisha Rao",
    email: "nisha.rao@email.com",
    role: "Backend Developer",
    resume:
      "Software developer with strong Python and Flask experience. Built REST APIs, used PostgreSQL for reporting systems, worked with Git, and collaborated in Agile teams. Has basic Docker knowledge and exposure to JavaScript.",
  },
  {
    name: "Kabir Sen",
    email: "kabir.sen@email.com",
    role: "Backend Developer",
    resume:
      "Junior developer focused on frontend projects using React, HTML, CSS, and JavaScript. Completed coursework in Python and Git, with some teamwork and communication experience.",
  },
  {
    name: "Maya Kapoor",
    email: "maya.kapoor@email.com",
    role: "Backend Developer",
    resume:
      "DevOps-oriented engineer experienced with Docker, AWS, Git, Jenkins, Linux, and CI/CD release workflows. Has supported backend teams but has limited Python and database development experience.",
  },
  {
    name: "Rohan Iyer",
    email: "rohan.iyer@email.com",
    role: "Backend Developer",
    resume:
      "Data analyst with SQL, Tableau, Power BI, Excel reporting, data analysis, and stakeholder communication experience. Interested in backend engineering but no production API experience yet.",
  },
];

const getRandomSample = (previousIndex) => {
  if (SAMPLE_RESUMES.length === 1) return { ...SAMPLE_RESUMES[0], jd: SAMPLE_JD };

  let nextIndex = Math.floor(Math.random() * SAMPLE_RESUMES.length);
  if (nextIndex === previousIndex) {
    nextIndex = (nextIndex + 1) % SAMPLE_RESUMES.length;
  }

  return {
    index: nextIndex,
    sample: { ...SAMPLE_RESUMES[nextIndex], jd: SAMPLE_JD },
  };
};

export default function ScreenPage({ onCandidateAdded }) {
  const [mode, setMode] = useState("text");
  const [form, setForm] = useState({ name: "", email: "", role: "", jd: "", resume: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [sampleIndex, setSampleIndex] = useState(null);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const loadSample = () => {
    const { index, sample } = getRandomSample(sampleIndex);
    setSampleIndex(index);
    setMode("text");
    setForm({ name: sample.name, email: sample.email, role: sample.role, jd: sample.jd, resume: sample.resume });
    setFile(null);
    setError("");
    setResult(null);
  };

  const analyze = async () => {
    setError("");
    if (!form.name.trim()) return setError("Candidate name is required.");
    if (!form.jd.trim()) return setError("Job description is required.");
    if (mode === "text" && !form.resume.trim()) return setError("Resume text is required.");
    if (mode === "file" && !file) return setError("Please select a resume file.");

    setLoading(true);
    setResult(null);
    try {
      let data;
      if (mode === "text") {
        data = await analyzeText({
          name: form.name,
          email: form.email,
          role: form.role,
          job_description: form.jd,
          resume_text: form.resume,
        });
      } else {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("name", form.name);
        fd.append("email", form.email);
        fd.append("role", form.role);
        fd.append("job_description", form.jd);
        data = await uploadFile(fd);
      }
      setResult(data.candidate);
      if (onCandidateAdded) onCandidateAdded(data.candidate);
    } catch (e) {
      const detail = e.response?.data?.details || e.response?.data?.message;
      setError(e.response?.data?.error || detail || "Analysis failed. Check that the backend and MongoDB are running.");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    card: { background: "#fff", border: "0.5px solid #e0ddd8", borderRadius: 10, padding: "1.25rem", marginBottom: "1rem" },
    label: { fontSize: 11, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "block", fontFamily: "'DM Mono', monospace" },
    input: { width: "100%", border: "0.5px solid #d8d4cc", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "'Syne', sans-serif", background: "#f9f8f4", color: "#1a1a1a", outline: "none" },
    textarea: { width: "100%", border: "0.5px solid #d8d4cc", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "'Syne', sans-serif", background: "#f9f8f4", color: "#1a1a1a", resize: "vertical", outline: "none", lineHeight: 1.5 },
    btn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "0.5px solid #ccc", background: "#fff", color: "#1a1a1a", fontFamily: "'Syne', sans-serif" },
    btnPrimary: { background: "#1a1a2e", color: "#fff", border: "none" },
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem", alignItems: "start" }}>
      <div>
        <div style={{ display: "flex", gap: 4, background: "#ebe9e3", borderRadius: 10, padding: 4, marginBottom: "1rem" }}>
          {["text", "file"].map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              style={{ flex: 1, padding: "8px", textAlign: "center", fontSize: 13, fontWeight: 500, borderRadius: 7, cursor: "pointer", border: "none", background: mode === item ? "#fff" : "transparent", color: mode === item ? "#1a1a1a" : "#777", fontFamily: "'Syne', sans-serif" }}
            >
              {item === "text" ? "Paste Text" : "Upload File"}
            </button>
          ))}
        </div>

        <div style={s.card}>
          <span style={s.label}>Candidate Info</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginBottom: 8 }}>
            <input style={s.input} placeholder="Full name *" value={form.name} onChange={set("name")} />
            <input style={s.input} placeholder="Email (optional)" value={form.email} onChange={set("email")} />
          </div>
          <input style={s.input} placeholder="Role applying for" value={form.role} onChange={set("role")} />
        </div>

        <div style={s.card}>
          <span style={s.label}>Job Description *</span>
          <textarea style={s.textarea} rows={5} placeholder="Paste the job description: skills, requirements, responsibilities..." value={form.jd} onChange={set("jd")} />
        </div>

        <div style={s.card}>
          <span style={s.label}>{mode === "text" ? "Resume Text *" : "Upload Resume (PDF / DOCX / TXT)"}</span>
          {mode === "text" ? (
            <textarea style={s.textarea} rows={7} placeholder="Paste resume content: experience, skills, education, projects..." value={form.resume} onChange={set("resume")} />
          ) : (
            <div>
              <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={(event) => setFile(event.target.files[0])} style={{ fontSize: 13, color: "#555" }} />
              {file && <div style={{ fontSize: 12, color: "#777", marginTop: 8, fontFamily: "'DM Mono', monospace" }}>Selected: {file.name}</div>}
            </div>
          )}
        </div>

        {error && <div style={{ background: "#fde8e8", color: "#9e2a2b", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: "1rem", lineHeight: 1.5 }}>{error}</div>}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={{ ...s.btn, ...s.btnPrimary, opacity: loading ? 0.75 : 1 }} onClick={analyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
          <button style={s.btn} onClick={loadSample} disabled={loading}>Generate Sample</button>
        </div>
      </div>

      <div>
        {loading && (
          <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 10, color: "#777" }}>
            <div style={{ width: 16, height: 16, border: "2px solid #ddd", borderTopColor: "#777", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
            <span style={{ fontSize: 13 }}>Analyzing with the NLP engine...</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
        {result && <ScoreCard candidate={result} />}
        {!loading && !result && (
          <div style={{ ...s.card, textAlign: "center", padding: "3rem 1rem", color: "#999" }}>
            <div style={{ fontWeight: 700, color: "#666", marginBottom: 4 }}>No analysis yet</div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>Fill in the job description and resume, then run the screening.</div>
          </div>
        )}
      </div>
    </div>
  );
}
