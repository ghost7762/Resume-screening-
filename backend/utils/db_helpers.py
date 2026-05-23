"""
Database Helper Utilities
Provides utilities for checking database connection status and handling errors.
"""
from functools import wraps
from flask import current_app, jsonify
from mongoengine.errors import NotUniqueError, ValidationError, OperationError


def check_db_connection():
    """
    Check if MongoDB is connected.
    Returns: tuple (is_connected: bool, error_message: str or None)
    """
    if not hasattr(current_app, 'mongo_connected'):
        return False, "Database status unknown"
    
    if not current_app.mongo_connected:
        error = getattr(current_app, 'mongo_error', 'Unknown database error')
        return False, str(error)
    
    return True, None


def require_db_connection(f):
    """
    Decorator to check database connection before executing endpoint.
    Returns 503 Service Unavailable if DB is not connected.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        is_connected, error = check_db_connection()
        if not is_connected:
            return jsonify({
                "error": "Database connection failed",
                "details": error,
                "message": "The service is temporarily unavailable. Please try again later."
            }), 503
        return f(*args, **kwargs)
    return decorated_function


def handle_db_errors(f):
    """
    Decorator to catch and handle common MongoDB errors.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except NotUniqueError as e:
            return jsonify({
                "error": "Duplicate entry",
                "message": "This record already exists in the database"
            }), 409
        except ValidationError as e:
            return jsonify({
                "error": "Validation failed",
                "message": str(e)
            }), 400
        except OperationError as e:
            return jsonify({
                "error": "Database operation failed",
                "message": str(e)
            }), 500
        except Exception as e:
            return jsonify({
                "error": "Unexpected error",
                "message": "An unexpected error occurred"
            }), 500
    return decorated_function
