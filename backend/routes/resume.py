"""
Resume Routes
Handles resume upload, text-based analysis, and candidate CRUD.
"""
import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from mongoengine.errors import OperationError
from pymongo.errors import PyMongoError
from werkzeug.utils import secure_filename

from models.candidate import Candidate
from services.parser import parse_resume
from services.matcher import analyze_with_ai
from utils.db_helpers import handle_db_errors
from utils.local_store import (
    create_candidate,
    delete_candidate as delete_local_candidate,
    get_candidate as get_local_candidate,
    get_stats as get_local_stats,
    list_candidates,
)

resume_bp = Blueprint("resume", __name__, url_prefix="/api/resume")
candidates_bp = Blueprint("candidates", __name__, url_prefix="/api")


def allowed_file(filename: str) -> bool:
    allowed = current_app.config.get("ALLOWED_EXTENSIONS", {"pdf", "docx", "txt"})
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed


def build_candidate_payload(name, email, role, resume_text, jd_text, result, filename=None):
    return {
        "name": name,
        "email": email,
        "role": role,
        "resume_filename": filename,
        "resume_text": resume_text[:10000],
        "job_description": jd_text[:5000],
        "match_score": result["match_score"],
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "extra_skills": result["extra_skills"],
        "experience_relevance": result.get("experience_relevance", "Medium"),
        "education_fit": result.get("education_fit", "Adequate"),
        "recommendation": result.get("recommendation", "Consider"),
        "ai_summary": result.get("ai_summary", ""),
        "decision_reason": result.get("decision_reason", ""),
        "skill_insights": result.get("skill_insights", []),
    }


def mark_mongo_unavailable(error):
    current_app.mongo_connected = False
    current_app.mongo_error = str(error)


def save_candidate(payload):
    if not current_app.mongo_connected:
        return create_candidate(current_app, payload)

    try:
        candidate = Candidate(**payload)
        candidate.save()
        return candidate.to_dict()
    except (OperationError, PyMongoError) as error:
        mark_mongo_unavailable(error)
        return create_candidate(current_app, payload)


@resume_bp.route("/upload", methods=["POST"])
@handle_db_errors
def upload_resume():
    """
    POST /api/resume/upload
    Form fields: file (required), name, email, role, job_description
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Use PDF, DOCX, or TXT."}), 400

    name = request.form.get("name", "Unknown Candidate")
    email = request.form.get("email", "")
    role = request.form.get("role", "")
    jd_text = request.form.get("job_description", "")

    if not jd_text:
        return jsonify({"error": "Job description is required"}), 400

    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    try:
        resume_text = parse_resume(filepath)
    except Exception as e:
        os.remove(filepath)
        return jsonify({"error": f"Could not parse file: {str(e)}"}), 422

    try:
        result = analyze_with_ai(resume_text, jd_text, role)
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

    payload = build_candidate_payload(name, email, role, resume_text, jd_text, result, filename)
    candidate = save_candidate(payload)
    return jsonify({"success": True, "candidate": candidate}), 201


@resume_bp.route("/analyze-text", methods=["POST"])
@handle_db_errors
def analyze_text():
    """
    POST /api/resume/analyze-text
    JSON body: { name, email, role, resume_text, job_description }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    name = data.get("name", "Unknown Candidate")
    email = data.get("email", "")
    role = data.get("role", "")
    resume_text = data.get("resume_text", "").strip()
    jd_text = data.get("job_description", "").strip()

    if not resume_text:
        return jsonify({"error": "resume_text is required"}), 400
    if not jd_text:
        return jsonify({"error": "job_description is required"}), 400

    try:
        result = analyze_with_ai(resume_text, jd_text, role)
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

    payload = build_candidate_payload(name, email, role, resume_text, jd_text, result)
    candidate = save_candidate(payload)
    return jsonify({"success": True, "candidate": candidate}), 201


@candidates_bp.route("/candidates", methods=["GET"])
@handle_db_errors
def get_candidates():
    """GET /api/candidates - returns all candidates sorted by match score."""
    role_filter = request.args.get("role")
    rec_filter = request.args.get("recommendation")

    if current_app.mongo_connected:
        try:
            query = Candidate.objects()
            if role_filter:
                query = query.filter(role__icontains=role_filter)
            if rec_filter:
                query = query.filter(recommendation=rec_filter)

            candidates = query.order_by("-match_score")
            return jsonify({
                "total": candidates.count(),
                "candidates": [c.to_dict() for c in candidates],
            })
        except (OperationError, PyMongoError) as error:
            mark_mongo_unavailable(error)

    candidates = list_candidates(current_app, role_filter, rec_filter)
    return jsonify({"total": len(candidates), "candidates": candidates})


@candidates_bp.route("/candidates/<candidate_id>", methods=["GET"])
@handle_db_errors
def get_candidate(candidate_id):
    """GET /api/candidates/:id"""
    if current_app.mongo_connected:
        try:
            candidate = Candidate.objects.get(id=candidate_id)
            return jsonify(candidate.to_dict())
        except Candidate.DoesNotExist:
            return jsonify({"error": "Candidate not found"}), 404
        except (OperationError, PyMongoError) as error:
            mark_mongo_unavailable(error)

    candidate = get_local_candidate(current_app, candidate_id)
    if candidate:
        return jsonify(candidate)
    return jsonify({"error": "Candidate not found"}), 404


@candidates_bp.route("/candidates/<candidate_id>", methods=["DELETE"])
@handle_db_errors
def delete_candidate(candidate_id):
    """DELETE /api/candidates/:id"""
    if current_app.mongo_connected:
        try:
            candidate = Candidate.objects.get(id=candidate_id)
            candidate.delete()
            return jsonify({"success": True, "message": f"Candidate {candidate_id} deleted"})
        except Candidate.DoesNotExist:
            return jsonify({"error": "Candidate not found"}), 404
        except (OperationError, PyMongoError) as error:
            mark_mongo_unavailable(error)

    if delete_local_candidate(current_app, candidate_id):
        return jsonify({"success": True, "message": f"Candidate {candidate_id} deleted"})
    return jsonify({"error": "Candidate not found"}), 404


@candidates_bp.route("/stats", methods=["GET"])
@handle_db_errors
def get_stats():
    """GET /api/stats - dashboard statistics."""
    if current_app.mongo_connected:
        try:
            total = Candidate.objects.count()
            shortlisted = Candidate.objects(recommendation="Shortlist").count()
            considered = Candidate.objects(recommendation="Consider").count()
            rejected = Candidate.objects(recommendation="Reject").count()

            candidates = Candidate.objects.only("match_score")
            scores = [c.match_score for c in candidates]
            avg_score = round(sum(scores) / len(scores), 1) if scores else 0
            top_score = round(max(scores), 1) if scores else 0

            return jsonify({
                "total_candidates": total,
                "shortlisted": shortlisted,
                "considered": considered,
                "rejected": rejected,
                "average_score": avg_score,
                "top_score": top_score,
            })
        except (OperationError, PyMongoError) as error:
            mark_mongo_unavailable(error)

    return jsonify(get_local_stats(current_app))
