"""
Payment Controllers
"""
from flask import request
from app.common.decorators import handle_exceptions, log_request, role_required
from app.common.utils import success_response, error_response
from app.services.payment_service import PaymentService


class PaymentController:
    """Controller for payment endpoints."""

    @staticmethod
    @handle_exceptions
    @log_request
    @role_required(['admin'])
    def list_payments():
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', type=str)
        data = PaymentService.list_payments(page=page, per_page=per_page, status=status)
        return success_response(data, 'Payments retrieved successfully')

    @staticmethod
    @handle_exceptions
    @log_request
    @role_required(['admin'])
    def get_payment(payment_id: int):
        data = PaymentService.get_payment(payment_id)
        if not data:
            return error_response('Payment not found', 404)
        return success_response(data, 'Payment retrieved successfully')


