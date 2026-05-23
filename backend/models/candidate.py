from datetime import datetime
import mongoengine as me


class Candidate(me.Document):
    name = me.StringField(required=True, max_length=100)
    email = me.StringField(max_length=120)
    role = me.StringField(max_length=150)
    resume_filename = me.StringField(max_length=255)
    resume_text = me.StringField(required=True)
    job_description = me.StringField(required=True)
    match_score = me.FloatField(default=0.0)
    matched_skills = me.ListField(me.StringField(), default=list)
    missing_skills = me.ListField(me.StringField(), default=list)
    extra_skills = me.ListField(me.StringField(), default=list)
    experience_relevance = me.StringField(max_length=20, default="Medium")
    education_fit = me.StringField(max_length=20, default="Adequate")
    recommendation = me.StringField(max_length=20, default="Consider")
    ai_summary = me.StringField()
    decision_reason = me.StringField()
    skill_insights = me.ListField(me.StringField(), default=list)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "candidates",
        "indexes": [
            "match_score",
            "recommendation",
            "role",
            "created_at",
        ],
    }

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "resume_filename": self.resume_filename,
            "match_score": round(self.match_score, 1),
            "matched_skills": self.matched_skills,
            "missing_skills": self.missing_skills,
            "extra_skills": self.extra_skills,
            "experience_relevance": self.experience_relevance,
            "education_fit": self.education_fit,
            "recommendation": self.recommendation,
            "ai_summary": self.ai_summary,
            "decision_reason": self.decision_reason,
            "skill_insights": self.skill_insights,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Candidate {self.name} - {self.match_score}%>"
