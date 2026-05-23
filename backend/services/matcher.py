"""
Matcher Service
Combines local NLP matching with optional Gemini/Claude AI scoring.
Falls back to pure NLP scoring if no provider key is configured or an API call fails.
"""
import json
import os
import urllib.error
import urllib.request

try:
    import anthropic
except ImportError:
    anthropic = None

from services.nlp_engine import (
    extract_skills_from_jd,
    extract_skills_from_resume,
    compute_match,
)


def analyze_with_ai(resume_text: str, jd_text: str, role: str = "") -> dict:
    """
    Full analysis pipeline:
    1. Run local NLP matching
    2. Enhance with Gemini if GEMINI_API_KEY is available
    3. Enhance with Claude if ANTHROPIC_API_KEY is available
    4. Return local NLP fallback if external AI is unavailable
    """
    jd_skills = extract_skills_from_jd(jd_text)
    resume_skills = extract_skills_from_resume(resume_text)
    nlp_result = compute_match(resume_skills, jd_skills)

    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if gemini_key and len(gemini_key) > 10:
        try:
            return analyze_with_gemini(resume_text, jd_text, role, nlp_result, gemini_key)
        except Exception as e:
            print(f"[Matcher] Gemini API failed, using next fallback: {e}")

    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
    if anthropic_key and len(anthropic_key) > 10 and "xxxxxxxx" not in anthropic_key:
        try:
            return analyze_with_claude(resume_text, jd_text, role, nlp_result, anthropic_key)
        except Exception as e:
            print(f"[Matcher] Claude API failed, using NLP fallback: {e}")

    return fallback_result(nlp_result, jd_skills)


def fallback_result(nlp_result: dict, jd_skills: list) -> dict:
    score = nlp_result["match_score"]
    if score >= 70:
        recommendation = "Shortlist"
    elif score >= 45:
        recommendation = "Consider"
    else:
        recommendation = "Reject"

    return {
        **nlp_result,
        "experience_relevance": "Medium",
        "education_fit": "Adequate",
        "recommendation": recommendation,
        "decision_reason": build_fallback_decision_reason(nlp_result, recommendation),
        "skill_insights": build_fallback_skill_insights(nlp_result),
        "ai_summary": (
            f"Based on keyword analysis, the candidate matches "
            f"{len(nlp_result['matched_skills'])} of {len(jd_skills)} required skills "
            f"({score:.0f}% match). "
            + (
                f"Missing: {', '.join(nlp_result['missing_skills'][:3])}."
                if nlp_result["missing_skills"]
                else "All key skills present."
            )
        ),
    }


def build_fallback_decision_reason(nlp_result: dict, recommendation: str) -> str:
    matched_count = len(nlp_result["matched_skills"])
    missing_count = len(nlp_result["missing_skills"])
    if recommendation == "Shortlist":
        return f"Shortlist because the candidate covers most required skills, with {matched_count} key skills matched and only {missing_count} notable gaps."
    if recommendation == "Consider":
        return f"Consider because the candidate has useful overlap with the role, but {missing_count} missing skills should be reviewed before accepting."
    return f"Reject for now because the candidate is missing too many required skills for the role, with only {matched_count} key skills matched."


def build_fallback_skill_insights(nlp_result: dict) -> list:
    insights = []
    for skill in nlp_result["matched_skills"][:4]:
        insights.append(f"Matched: {skill} - The resume mentions {skill}, so this requirement is covered.")
    for skill in nlp_result["missing_skills"][:4]:
        insights.append(f"Missing: {skill} - The job description asks for {skill}, but it was not found clearly in the resume.")
    return insights[:6]


def build_prompt(resume_text: str, jd_text: str, role: str, nlp_result: dict) -> str:
    return f"""You are an expert HR AI. Analyze the resume against the job description.
Local NLP already found these:
- Matched skills: {nlp_result['matched_skills']}
- Missing skills: {nlp_result['missing_skills']}
- NLP Match Score: {nlp_result['match_score']}%

JOB ROLE: {role or 'Not specified'}
JOB DESCRIPTION: {jd_text[:1500]}

RESUME: {resume_text[:2000]}

Return ONLY valid JSON. Use double quotes for every key and string. Do not use markdown.
Use this exact shape, replacing the example values with your analysis:
{{
  "matchScore": 75,
  "matchedSkills": {json.dumps(nlp_result['matched_skills'])},
  "missingSkills": {json.dumps(nlp_result['missing_skills'])},
  "extraSkills": {json.dumps(nlp_result['extra_skills'])},
  "experienceRelevance": "Medium",
  "educationFit": "Adequate",
  "recommendation": "Consider",
  "summary": "Two sentence professional summary of candidate fit.",
  "decisionReason": "One concise paragraph explaining why to accept, consider, or reject.",
  "skillInsights": [
    "Matched: python - Resume shows Python experience relevant to backend work.",
    "Missing: redis - The job description asks for Redis but the resume does not show clear Redis experience."
  ]
}}"""


def clean_json_response(raw: str) -> dict:
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1:
        cleaned = cleaned[start:end + 1]
    return json.loads(cleaned)


def normalize_ai_result(data: dict, nlp_result: dict) -> dict:
    return {
        "match_score": float(data.get("matchScore", nlp_result["match_score"])),
        "matched_skills": data.get("matchedSkills", nlp_result["matched_skills"]),
        "missing_skills": data.get("missingSkills", nlp_result["missing_skills"]),
        "extra_skills": data.get("extraSkills", nlp_result["extra_skills"]),
        "experience_relevance": data.get("experienceRelevance", "Medium"),
        "education_fit": data.get("educationFit", "Adequate"),
        "recommendation": data.get("recommendation", "Consider"),
        "ai_summary": data.get("summary", ""),
        "decision_reason": data.get("decisionReason", ""),
        "skill_insights": normalize_skill_insights(data.get("skillInsights", []), nlp_result),
    }


def normalize_skill_insights(insights, nlp_result: dict) -> list:
    if not isinstance(insights, list):
        return build_fallback_skill_insights(nlp_result)

    normalized = []
    for item in insights:
        if isinstance(item, dict):
            skill = str(item.get("skill", "")).strip()
            reason = str(item.get("reason", "")).strip()
            status = str(item.get("status", "")).strip().title()
            if skill and reason:
                normalized.append(f"{status or 'Skill'}: {skill} - {reason}")
        else:
            value = str(item).strip()
            if value:
                normalized.append(value)

    return normalized[:6] or build_fallback_skill_insights(nlp_result)


def analyze_with_gemini(
    resume_text: str,
    jd_text: str,
    role: str,
    nlp_result: dict,
    api_key: str,
) -> dict:
    """Call Gemini API for holistic resume analysis."""
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": build_prompt(resume_text, jd_text, role, nlp_result)}],
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048,
            "responseMimeType": "application/json",
        },
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Gemini HTTP {e.code}: {detail}") from e

    raw = body["candidates"][0]["content"]["parts"][0]["text"]
    data = clean_json_response(raw)
    return normalize_ai_result(data, nlp_result)


def analyze_with_claude(
    resume_text: str,
    jd_text: str,
    role: str,
    nlp_result: dict,
    api_key: str,
) -> dict:
    """Call Claude API for holistic resume analysis."""
    if anthropic is None:
        raise RuntimeError("anthropic package is not installed")

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1200,
        messages=[{"role": "user", "content": build_prompt(resume_text, jd_text, role, nlp_result)}],
    )

    raw = response.content[0].text
    data = clean_json_response(raw)
    return normalize_ai_result(data, nlp_result)
