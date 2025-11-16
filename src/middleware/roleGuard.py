from flask import request, jsonify
from functools import wraps

def require_role(required_role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not hasattr(request, "user"):
                return jsonify({"error": "Unauthenticated"}), 401

            if request.user.get("role") != required_role:
                return jsonify({"error": "Forbidden: insufficient role"}), 403

            return f(*args, **kwargs)
        return wrapper
    return decorator

