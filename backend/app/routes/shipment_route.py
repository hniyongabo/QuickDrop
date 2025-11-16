"""
Shipment Routes
"""
from flask import Blueprint
from app.controllers.shipment_controller import ShipmentController

shipment_bp = Blueprint('shipment', __name__)


@shipment_bp.route('', methods=['GET'])
def list_shipments():
    """
    List shipments (admin only)
    ---
    tags:
      - Shipments
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
        enum: [unassigned, assigned, picked_up, in_transit, delivered, failed]
    responses:
      200:
        description: Paginated list of shipments
      403:
        description: Forbidden
    """
    return ShipmentController.list_shipments()


@shipment_bp.route('/<int:shipment_id>/tracking', methods=['GET'])
def tracking(shipment_id: int):
    """
    Get tracking details for a shipment
    ---
    tags:
      - Shipments
    parameters:
      - in: path
        name: shipment_id
        required: true
        type: integer
    responses:
      200:
        description: Tracking details
      404:
        description: Shipment not found
    """
    return ShipmentController.tracking(shipment_id)


