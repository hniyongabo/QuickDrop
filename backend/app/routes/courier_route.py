"""
Courier Routes
"""
from flask import Blueprint
from app.controllers.courier_controller import CourierController

courier_bp = Blueprint('courier', __name__)


@courier_bp.route('/dashboard', methods=['GET'])
def dashboard():
    """
    Courier dashboard data
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    responses:
      200:
        description: Dashboard data for courier
    """
    return CourierController.dashboard()


