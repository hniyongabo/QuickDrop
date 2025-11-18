"""
Payment Routes
"""
from flask import Blueprint
from app.controllers.payment_controller import PaymentController

payment_bp = Blueprint('payment', __name__)


@payment_bp.route('', methods=['GET'])
def list_payments():
    """
    List payments (admin only)
    ---
    tags:
      - Payments
    security:
      - Bearer: []
    parameters:
      - in: query
        name: page
        type: integer
        default: 1
      - in: query
        name: per_page
        type: integer
        default: 20
      - in: query
        name: status
        type: string
        enum: [pending, paid, failed, refunded]
    responses:
      200:
        description: Paginated list of payments
      403:
        description: Forbidden
    """
    return PaymentController.list_payments()


@payment_bp.route('/<int:payment_id>', methods=['GET'])
def get_payment(payment_id: int):
    """
    Get payment by ID (admin only)
    ---
    tags:
      - Payments
    security:
      - Bearer: []
    parameters:
      - in: path
        name: payment_id
        required: true
        type: integer
    responses:
      200:
        description: Payment found
      404:
        description: Not found
    """
    return PaymentController.get_payment(payment_id)


