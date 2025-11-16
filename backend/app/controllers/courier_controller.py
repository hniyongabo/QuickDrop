"""
Courier Controllers
"""
from flask import request
from flask_jwt_extended import get_jwt_identity
from app.common.decorators import handle_exceptions, log_request, role_required
from app.common.utils import success_response, error_response
from app.services.courier_service import CourierService
from app.services.user_service import UserService


class CourierController:
    """Controller for courier dashboard endpoints."""

    @staticmethod
    @handle_exceptions
    @log_request
    @role_required(['courier'])
    def dashboard():
        user_id = get_jwt_identity()
        try:
            user_id_int = int(user_id)
        except (TypeError, ValueError):
            return error_response('Invalid token identity', 401)
        user = UserService.get_user_by_id(user_id_int)
        if not user:
            return error_response('User not found', 404)

        data = CourierService.get_dashboard_for_user(email=user.email)
        return success_response(data, 'Courier dashboard retrieved successfully')


