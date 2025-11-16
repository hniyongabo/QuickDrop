from flask import Blueprint, request, jsonify
from middleware.jwt_auth import jwt_auth
from middleware.role_guard import require_role

router = Blueprint("protected", __name__)


@router.get("/me")
@jwt_auth
def me():
    return {
        "id": request.user["id"],
        "email": request.user["email"],
        "role": request.user["role"]
    }


@router.get("/admin-only")
@jwt_auth
@require_role("admin")
def admin_only():
    return {"secret": "only admins can see this"}


@router.get("/user-only")
@jwt_auth
@require_role("user")
def user_only():
    return {"secret": "only users with role user can see this"}
