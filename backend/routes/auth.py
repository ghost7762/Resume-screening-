"""
Auth Routes
Simple admin authentication using JWT.
"""
import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Body: { "username": "admin", "password": "admin123" }
    Returns JWT access token.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    username = data.get("username", "")
    password = data.get("password", "")

    admin_user = os.getenv("ADMIN_USERNAME", "admin")
    admin_pass = os.getenv("ADMIN_PASSWORD", "admin123")

    if username == admin_user and password == admin_pass:
        token = create_access_token(identity=username)
        return jsonify({
            "success": True,
            "access_token": token,
            "username": username,
        })

    return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """GET /api/auth/me — returns current user info (requires token)."""
    current_user = get_jwt_identity()
    return jsonify({"username": current_user, "role": "admin"})
