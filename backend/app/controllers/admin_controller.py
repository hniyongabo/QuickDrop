"""
Admin Controllers
Handles admin dashboard endpoints.
"""
from flask import request
from app.services.admin_service import AdminService
from app.common.utils import success_response
from app.common.decorators import handle_exceptions, log_request, role_required


class AdminController:
    """Controller for admin analytics and dashboard."""

    @staticmethod
    @handle_exceptions
    @log_request
    @role_required(['admin'])
    def dashboard():
        days = request.args.get('days', 7, type=int)
        active_since_hours = request.args.get('active_since_hours', 24, type=int)
        if days < 1:
            days = 7
        if active_since_hours < 1:
            active_since_hours = 24
        data = AdminService.get_dashboard(days=days, active_since_hours=active_since_hours)
        return success_response(data, 'Dashboard data retrieved successfully')


