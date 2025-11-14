"""
Courier Routes
Define URL patterns for courier endpoints
"""
from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.courier_controller import CourierController

# Create blueprint
courier_bp = Blueprint('courier', __name__)


# Dashboard and task management routes
@courier_bp.route('/current-task', methods=['GET'])
@jwt_required()
def get_current_task():
    """
    Get courier's current active shipment
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    parameters:
      - in: query
        name: courier_id
        type: integer
        required: true
        description: Courier ID
    responses:
      200:
        description: Current task retrieved successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
      403:
        description: Access denied
    """
    return CourierController.get_current_task()


@courier_bp.route('/upcoming-tasks', methods=['GET'])
@jwt_required()
def get_upcoming_tasks():
    """
    Get courier's upcoming assigned shipments
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    parameters:
      - in: query
        name: courier_id
        type: integer
        required: true
        description: Courier ID
      - in: query
        name: limit
        type: integer
        default: 10
        description: Maximum number of tasks to return
    responses:
      200:
        description: Upcoming tasks retrieved successfully
    """
    return CourierController.get_upcoming_tasks()


@courier_bp.route('/task-history', methods=['GET'])
@jwt_required()
def get_task_history():
    """
    Get courier's completed and failed task history
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    parameters:
      - in: query
        name: courier_id
        type: integer
        required: true
        description: Courier ID
      - in: query
        name: page
        type: integer
        default: 1
        description: Page number
      - in: query
        name: per_page
        type: integer
        default: 20
        description: Items per page
    responses:
      200:
        description: Task history retrieved successfully
    """
    return CourierController.get_task_history()


# Shipment action routes
@courier_bp.route('/shipments/<int:shipment_id>/pickup', methods=['POST'])
@jwt_required()
def confirm_pickup(shipment_id):
    """
    Confirm package pickup
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    parameters:
      - in: path
        name: shipment_id
        required: true
        type: integer
        description: Shipment ID
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - courier_id
          properties:
            courier_id:
              type: integer
              description: Courier ID
    responses:
      200:
        description: Pickup confirmed successfully
      404:
        description: Shipment not found
      400:
        description: Invalid status transition
    """
    return CourierController.confirm_pickup(shipment_id)


@courier_bp.route('/shipments/<int:shipment_id>/start', methods=['POST'])
@jwt_required()
def start_delivery(shipment_id):
    """
    Start delivery (mark as in transit)
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    parameters:
      - in: path
        name: shipment_id
        required: true
        type: integer
        description: Shipment ID
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - courier_id
          properties:
            courier_id:
              type: integer
              description: Courier ID
    responses:
      200:
        description: Delivery started successfully
      404:
        description: Shipment not found
      400:
        description: Invalid status transition
    """
    return CourierController.start_delivery(shipment_id)


@courier_bp.route('/shipments/<int:shipment_id>/complete', methods=['POST'])
@jwt_required()
def complete_delivery(shipment_id):
    """
    Complete delivery
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    parameters:
      - in: path
        name: shipment_id
        required: true
        type: integer
        description: Shipment ID
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - courier_id
          properties:
            courier_id:
              type: integer
              description: Courier ID
    responses:
      200:
        description: Delivery completed successfully
      404:
        description: Shipment not found
      400:
        description: Invalid status transition
    """
    return CourierController.complete_delivery(shipment_id)


@courier_bp.route('/shipments/<int:shipment_id>', methods=['GET'])
@jwt_required()
def get_shipment_details(shipment_id):
    """
    Get detailed information about a specific shipment
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    parameters:
      - in: path
        name: shipment_id
        required: true
        type: integer
        description: Shipment ID
      - in: query
        name: courier_id
        type: integer
        required: true
        description: Courier ID
    responses:
      200:
        description: Shipment details retrieved successfully
      404:
        description: Shipment not found
    """
    return CourierController.get_shipment_details(shipment_id)


# Status management routes
@courier_bp.route('/status', methods=['PUT', 'PATCH'])
@jwt_required()
def update_status():
    """
    Update courier status
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - courier_id
            - status
          properties:
            courier_id:
              type: integer
              description: Courier ID
            status:
              type: string
              enum: [active, inactive, offshift, banned]
              example: active
    responses:
      200:
        description: Status updated successfully
      400:
        description: Invalid input data
    """
    return CourierController.update_status()


@courier_bp.route('/status', methods=['GET'])
@jwt_required()
def get_status():
    """
    Get courier current status
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    parameters:
      - in: query
        name: courier_id
        type: integer
        required: true
        description: Courier ID
    responses:
      200:
        description: Status retrieved successfully
      404:
        description: Courier not found
    """
    return CourierController.get_status()


@courier_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_statistics():
    """
    Get courier statistics
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    parameters:
      - in: query
        name: courier_id
        type: integer
        required: true
        description: Courier ID
    responses:
      200:
        description: Statistics retrieved successfully
    """
    return CourierController.get_statistics()


# Admin/Dispatcher routes
@courier_bp.route('/assign', methods=['POST'])
@jwt_required()
def assign_shipment():
    """
    Assign a shipment to a courier (admin/dispatcher only)
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - shipment_id
            - courier_id
          properties:
            shipment_id:
              type: integer
              description: Shipment ID
            courier_id:
              type: integer
              description: Courier ID
    responses:
      200:
        description: Shipment assigned successfully
      400:
        description: Invalid request
      404:
        description: Shipment or courier not found
    """
    return CourierController.assign_shipment()


@courier_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_couriers():
    """
    Get all active couriers
    ---
    tags:
      - Courier
    security:
      - Bearer: []
    responses:
      200:
        description: Couriers retrieved successfully
    """
    return CourierController.get_all_couriers()
