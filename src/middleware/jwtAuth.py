from flask import request, jsonify
import jwt
from config import config
from db.inMemoryUserStore import find_user_by_id

def jwt_auth(f):
    def wrapper(*args, **kwargs):
        try:
            auth = request.headers.get("Authorization")
            if not auth or not auth.startswith("Bearer "):
                return jsonify({"error": "Missing or invalid authorization header"}), 401

            token = auth[7:]
            payload = jwt.decode(token, config["jwtSecret"], algorithms=["HS256"])

            user = find_user_by_id(payload["sub"])
            if not user:
                return jsonify({"error": "Invalid token (user not found)"}), 401

            request.user = {
                "id": user["id"],
                "email": user["email"],
                "role": user["role"]
            }

            return f(*args, **kwargs)
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

    wrapper.__name__ = f.__name__
    return wrapper
