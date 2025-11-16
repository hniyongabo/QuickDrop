from flask import Blueprint, request, jsonify
import bcrypt
import jwt
import uuid

from config import config
from db.inMemoryUserStore import create_user, find_user_by_email

auth = Blueprint("auth", __name__)


@auth.post("/signup")
def signup():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "user")

        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400

        existing = find_user_by_email(email)
        if existing:
            return jsonify({"error": "User already exists"}), 409

        salt = bcrypt.gensalt(rounds=config["bcryptSaltRounds"])
        password_hash = bcrypt.hashpw(password.encode(), salt).decode()

        user = create_user({
            "id": str(uuid.uuid4()),
            "email": email,
            "passwordHash": password_hash,
            "role": "admin" if role == "admin" else "user"
        })

        return jsonify({"id": user["id"], "email": user["email"], "role": user["role"]}), 201

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error"}), 500


@auth.post("/login")
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400

        user = find_user_by_email(email)
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        if not bcrypt.checkpw(password.encode(), user["passwordHash"].encode()):
            return jsonify({"error": "Invalid credentials"}), 401

        payload = {
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"]
        }

        token = jwt.encode(payload, config["jwtSecret"], algorithm="HS256")

        return jsonify({
            "accessToken": token,
            "tokenType": "Bearer",
            "expiresIn": config["jwtExpiresIn"]
        })

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error"}), 500
