"""
NLP Engine Service
Extracts skills from text using spaCy + keyword matching.
Falls back to keyword-only matching if spaCy is unavailable.
"""
import re
from typing import List, Set

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except Exception:
    SPACY_AVAILABLE = False
    nlp = None

# ─── Master Skill Database ────────────────────────────────────────────────────
SKILL_KEYWORDS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "golang",
    "ruby", "php", "swift", "kotlin", "scala", "rust", "r", "matlab", "perl",
    "dart", "lua", "bash", "shell", "powershell",

    # Web Frontend
    "react", "reactjs", "react.js", "angular", "angularjs", "vue", "vuejs",
    "html", "html5", "css", "css3", "sass", "less", "tailwind", "bootstrap",
    "jquery", "next.js", "nextjs", "nuxt", "gatsby", "svelte", "webpack",

    # Backend / Frameworks
    "flask", "django", "fastapi", "express", "expressjs", "node.js", "nodejs",
    "spring", "spring boot", "springboot", "laravel", "rails", "ruby on rails",
    "asp.net", "dotnet", ".net", "hibernate", "graphql", "rest", "restful", "grpc",

    # Databases
    "sql", "mysql", "postgresql", "postgres", "sqlite", "mongodb", "redis",
    "cassandra", "dynamodb", "elasticsearch", "oracle", "mssql", "mariadb",
    "firebase", "supabase", "nosql",

    # Cloud & DevOps
    "aws", "amazon web services", "azure", "gcp", "google cloud", "heroku",
    "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins",
    "ci/cd", "github actions", "gitlab ci", "circleci", "travis ci",
    "linux", "ubuntu", "centos", "nginx", "apache",

    # AI / ML
    "machine learning", "deep learning", "neural network", "nlp",
    "natural language processing", "computer vision", "tensorflow", "pytorch",
    "keras", "scikit-learn", "sklearn", "pandas", "numpy", "matplotlib",
    "seaborn", "opencv", "huggingface", "langchain", "openai", "llm",

    # Data & Analytics
    "data analysis", "data science", "data engineering", "etl", "spark", "hadoop",
    "kafka", "airflow", "tableau", "power bi", "looker", "bigquery", "snowflake",

    # Mobile
    "android", "ios", "react native", "flutter", "xamarin", "ionic",

    # Tools & Practices
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "trello",
    "agile", "scrum", "kanban", "tdd", "unit testing", "pytest", "jest",
    "selenium", "postman", "swagger", "linux", "unix",

    # Soft Skills
    "leadership", "communication", "teamwork", "problem solving", "critical thinking",
    "time management", "project management", "collaboration",
}


def normalize(text: str) -> str:
    """Lowercase and strip punctuation for comparison."""
    return re.sub(r"[^\w\s\.\+#]", " ", text.lower())


def extract_skills_from_text(text: str) -> Set[str]:
    """
    Extract skills from text using keyword matching.
    Also uses spaCy NER if available (to catch organization/product names).
    """
    found = set()
    normalized = normalize(text)

    # Keyword matching (multi-word first for accuracy)
    sorted_skills = sorted(SKILL_KEYWORDS, key=len, reverse=True)
    for skill in sorted_skills:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, normalized):
            found.add(skill)

    # spaCy NER — catch named tech entities not in our list
    if SPACY_AVAILABLE and nlp:
        doc = nlp(text[:10000])  # limit for performance
        for ent in doc.ents:
            if ent.label_ in ("ORG", "PRODUCT", "GPE"):
                candidate = ent.text.lower().strip()
                if 2 < len(candidate) < 30 and candidate in SKILL_KEYWORDS:
                    found.add(candidate)

    return found


def extract_skills_from_jd(jd_text: str) -> List[str]:
    """Extract required skills from a job description."""
    return sorted(list(extract_skills_from_text(jd_text)))


def extract_skills_from_resume(resume_text: str) -> List[str]:
    """Extract skills mentioned in a resume."""
    return sorted(list(extract_skills_from_text(resume_text)))


def compute_match(resume_skills: List[str], jd_skills: List[str]):
    """
    Compute match score, matched skills, and missing skills.

    Returns:
        dict with score (0-100), matched, missing, extra
    """
    resume_set = set(resume_skills)
    jd_set = set(jd_skills)

    matched = sorted(list(resume_set & jd_set))
    missing = sorted(list(jd_set - resume_set))
    extra = sorted(list(resume_set - jd_set))

    if not jd_set:
        score = 0.0
    else:
        score = (len(matched) / len(jd_set)) * 100

    return {
        "match_score": round(score, 1),
        "matched_skills": matched,
        "missing_skills": missing,
        "extra_skills": extra[:10],  # top 10 bonus skills
    }
