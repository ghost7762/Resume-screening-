"""
AI Resume Screening System - Flask Backend
Run: python app.py
"""
import os
from urllib.parse import urlsplit, urlunsplit
from flask import Flask, jsonify
from dotenv import load_dotenv
import mongoengine as me
from pymongo.errors import ConfigurationError, ServerSelectionTimeoutError, ConnectionFailure, PyMongoError

from extensions import jwt, cors
from config import config

load_dotenv()


def mask_mongodb_uri(uri: str) -> str:
    """Hide credentials in logs while keeping enough host info for debugging."""
    try:
        parts = urlsplit(uri)
        if "@" not in parts.netloc:
            return uri
        host = parts.netloc.rsplit("@", 1)[1]
        return urlunsplit((parts.scheme, f"***:***@{host}", parts.path, parts.query, parts.fragment))
    except Exception:
        return "***"


def create_app(config_name: str = "default") -> Flask:
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    try:
        mongodb_uri = app.config.get("MONGODB_URI")
        if not mongodb_uri:
            raise ValueError("MONGODB_URI not found in configuration. Check your .env file.")

        print("\n[DB] Attempting to connect to MongoDB...")
        print(f"[DB] Connection URI: {mask_mongodb_uri(mongodb_uri)}")

        me.connect(
            host=mongodb_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
            retryWrites=True,
        )
        me.get_connection().admin.command("ping")
        print("[DB] MongoDB connection established successfully.\n")
        app.mongo_connected = True

    except (ConfigurationError, ServerSelectionTimeoutError, ConnectionFailure, PyMongoError) as e:
        print(f"[DB] MongoDB connection failed: {str(e)}")
        print("[DB] Make sure:")
        print("[DB]    1. MongoDB Atlas cluster is running")
        print("[DB]    2. MONGODB_URI in .env is correct")
        print("[DB]    3. IP whitelist includes your current IP on MongoDB Atlas")
        print("[DB]    4. Database user has correct permissions\n")
        app.mongo_connected = False
        app.mongo_error = str(e)
    except ValueError as e:
        print(f"[DB] Configuration error: {str(e)}\n")
        app.mongo_connected = False
        app.mongo_error = str(e)

    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    from routes.resume import resume_bp, candidates_bp
    from routes.auth import auth_bp

    app.register_blueprint(resume_bp)
    app.register_blueprint(candidates_bp)
    app.register_blueprint(auth_bp)

    @app.route("/api/health")
    def health():
        db_status = "Connected" if app.mongo_connected else "Disconnected"
        response = {
            "status": "ok" if app.mongo_connected else "degraded",
            "message": "AI Resume Screening API is running",
            "database": db_status,
        }
        if not app.mongo_connected and hasattr(app, "mongo_error"):
            response["db_error"] = app.mongo_error
        status_code = 200 if app.mongo_connected else 503
        return jsonify(response), status_code

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    env = os.getenv("FLASK_ENV", "development")
    app = create_app(env)
    port = int(os.getenv("PORT", 5000))
    print(f"\nBackend running at http://localhost:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=(env == "development"))
