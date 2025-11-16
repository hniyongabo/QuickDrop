"""
Admin Routes
"""
from flask import Blueprint
from app.controllers.admin_controller import AdminController

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/dashboard', methods=['GET'])
def dashboard():
    """
    Admin dashboard data
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - in: query
        name: days
        type: integer
        default: 7
        description: Number of days for analytics windows.
      - in: query
        name: active_since_hours
        type: integer
        default: 24
        description: Window for computing active users.
    responses:
      200:
        description: Dashboard data assembled successfully
    """
    return AdminController.dashboard()


