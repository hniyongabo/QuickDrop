"""
Shipment Controllers
"""
from flask import request
from app.common.decorators import handle_exceptions, log_request, role_required
from app.common.utils import success_response, error_response
from app.services.shipment_service import ShipmentService


class ShipmentController:
    """Controller for shipment tracking endpoints."""

    @staticmethod
    @handle_exceptions
    @log_request
    @role_required(['admin', 'customer'])
    def tracking(shipment_id: int):
        data = ShipmentService.get_tracking(shipment_id)
        if not data:
            return error_response('Shipment not found', 404)
        return success_response(data, 'Tracking details retrieved')

    @staticmethod
    @handle_exceptions
    @log_request
    @role_required(['admin', 'customer',  'courier'])
    def list_shipments():
        """
        List shipments (admin only).
        Query params: page, per_page, status
        """
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', type=str)

        data = ShipmentService.list_shipments(page=page, per_page=per_page, status=status)
        return success_response(data, 'Shipments retrieved successfully')

