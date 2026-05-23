"""
Local JSON fallback store for demo/development when MongoDB is unavailable.
"""
import json
import os
import uuid
from datetime import datetime
from threading import Lock

_LOCK = Lock()


def _store_path(app):
    base_dir = os.path.dirname(os.path.dirname(__file__))
    instance_dir = os.path.join(base_dir, "instance")
    os.makedirs(instance_dir, exist_ok=True)
    return os.path.join(instance_dir, "candidates.json")


def _read(app):
    path = _store_path(app)
    if not os.path.exists(path):
        return []

    with open(path, "r", encoding="utf-8") as file:
        try:
            data = json.load(file)
        except json.JSONDecodeError:
            return []

    return data if isinstance(data, list) else []


def _write(app, candidates):
    path = _store_path(app)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(candidates, file, indent=2)


def create_candidate(app, payload):
    with _LOCK:
        candidates = _read(app)
        candidate = {
            "id": uuid.uuid4().hex,
            "name": payload.get("name", "Unknown Candidate"),
            "email": payload.get("email", ""),
            "role": payload.get("role", ""),
            "resume_filename": payload.get("resume_filename"),
            "match_score": round(float(payload.get("match_score", 0)), 1),
            "matched_skills": payload.get("matched_skills", []),
            "missing_skills": payload.get("missing_skills", []),
            "extra_skills": payload.get("extra_skills", []),
            "experience_relevance": payload.get("experience_relevance", "Medium"),
            "education_fit": payload.get("education_fit", "Adequate"),
            "recommendation": payload.get("recommendation", "Consider"),
            "ai_summary": payload.get("ai_summary", ""),
            "decision_reason": payload.get("decision_reason", ""),
            "skill_insights": payload.get("skill_insights", []),
            "created_at": datetime.utcnow().isoformat(),
        }
        candidates.append(candidate)
        _write(app, candidates)
        return candidate


def list_candidates(app, role_filter=None, recommendation_filter=None):
    candidates = _read(app)
    if role_filter:
        needle = role_filter.lower()
        candidates = [c for c in candidates if needle in c.get("role", "").lower()]
    if recommendation_filter:
        candidates = [c for c in candidates if c.get("recommendation") == recommendation_filter]

    return sorted(candidates, key=lambda c: c.get("match_score", 0), reverse=True)


def get_candidate(app, candidate_id):
    for candidate in _read(app):
        if candidate.get("id") == candidate_id:
            return candidate
    return None


def delete_candidate(app, candidate_id):
    with _LOCK:
        candidates = _read(app)
        remaining = [c for c in candidates if c.get("id") != candidate_id]
        if len(remaining) == len(candidates):
            return False
        _write(app, remaining)
        return True


def get_stats(app):
    candidates = _read(app)
    scores = [float(c.get("match_score", 0)) for c in candidates]
    return {
        "total_candidates": len(candidates),
        "shortlisted": len([c for c in candidates if c.get("recommendation") == "Shortlist"]),
        "considered": len([c for c in candidates if c.get("recommendation") == "Consider"]),
        "rejected": len([c for c in candidates if c.get("recommendation") == "Reject"]),
        "average_score": round(sum(scores) / len(scores), 1) if scores else 0,
        "top_score": round(max(scores), 1) if scores else 0,
    }
