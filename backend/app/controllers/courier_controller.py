"""
Courier Controllers
Handle HTTP requests and responses for courier endpoints
"""
from flask import request, current_app
from flask_jwt_extended import get_jwt_identity, get_jwt
from app.services.courier_service import CourierService
from app.common.utils import success_response, error_response
from app.common.decorators import handle_exceptions, log_request


class CourierController:
    """Courier controller for handling HTTP requests"""
    
    @staticmethod
    @handle_exceptions
    @log_request
    def get_current_task():
        """
        Get courier's current active shipment
        ---
        tags:
          - Courier
        security:
          - Bearer: []
        responses:
          200:
            description: Current task retrieved successfully
          404:
            description: No active task found
        """
        # For now, get courier_id from JWT identity
        # In production, you'd link User to Courier table
        courier_id = request.args.get('courier_id', type=int)
        
        if not courier_id:
            return error_response('courier_id query parameter required', 400)
        
        shipment = CourierService.get_courier_current_task(courier_id)
        
        if not shipment:
            return success_response(None, 'No active task found')
        
        return success_response(
            shipment.to_dict_detailed(),
            'Current task retrieved successfully'
        )
    
    @staticmethod
    @handle_exceptions
    @log_request
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
        courier_id = request.args.get('courier_id', type=int)
        
        if not courier_id:
            return error_response('courier_id query parameter required', 400)
        
        limit = request.args.get('limit', 10, type=int)
        if limit < 1 or limit > 50:
            limit = 10
        
        shipments = CourierService.get_courier_upcoming_tasks(courier_id, limit)
        
        return success_response(
            {
                'tasks': [shipment.to_dict_detailed() for shipment in shipments],
                'count': len(shipments)
            },
            'Upcoming tasks retrieved successfully'
        )
    
    @staticmethod
    @handle_exceptions
    @log_request
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
        courier_id = request.args.get('courier_id', type=int)
        
        if not courier_id:
            return error_response('courier_id query parameter required', 400)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Validate pagination
        if page < 1:
            page = 1
        if per_page < 1 or per_page > 100:
            per_page = 20
        
        result = CourierService.get_courier_task_history(courier_id, page, per_page)
        
        if result is None:
            return error_response('Failed to retrieve task history', 500)
        
        return success_response(result, 'Task history retrieved successfully')
    
    @staticmethod
    @handle_exceptions
    @log_request
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
        data = request.get_json()
        
        if not data or 'courier_id' not in data:
            return error_response('courier_id is required', 400)
        
        courier_id = data['courier_id']
        
        shipment, error = CourierService.confirm_pickup(shipment_id, courier_id)
        
        if error:
            status_code = 404 if 'not found' in error.get('message', '').lower() else 400
            return error_response(error.get('message'), status_code)
        
        return success_response(
            shipment.to_dict_detailed(),
            'Pickup confirmed successfully'
        )
    
    @staticmethod
    @handle_exceptions
    @log_request
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
        data = request.get_json()
        
        if not data or 'courier_id' not in data:
            return error_response('courier_id is required', 400)
        
        courier_id = data['courier_id']
        
        shipment, error = CourierService.start_delivery(shipment_id, courier_id)
        
        if error:
            status_code = 404 if 'not found' in error.get('message', '').lower() else 400
            return error_response(error.get('message'), status_code)
        
        return success_response(
            shipment.to_dict_detailed(),
            'Delivery started successfully'
        )
    
    @staticmethod
    @handle_exceptions
    @log_request
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
        data = request.get_json()
        
        if not data or 'courier_id' not in data:
            return error_response('courier_id is required', 400)
        
        courier_id = data['courier_id']
        
        shipment, error = CourierService.complete_delivery(shipment_id, courier_id)
        
        if error:
            status_code = 404 if 'not found' in error.get('message', '').lower() else 400
            return error_response(error.get('message'), status_code)
        
        return success_response(
            shipment.to_dict_detailed(),
            'Delivery completed successfully'
        )
    
    @staticmethod
    @handle_exceptions
    @log_request
    def update_status():
        """
        Update courier status (active, inactive, offshift, banned)
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
        data = request.get_json()
        
        if not data or 'courier_id' not in data or 'status' not in data:
            return error_response('courier_id and status are required', 400)
        
        courier_id = data['courier_id']
        status = data['status']
        
        courier, error = CourierService.update_courier_status(courier_id, status)
        
        if error:
            return error_response(error.get('message'), 400)
        
        return success_response(
            courier.to_dict(),
            'Status updated successfully'
        )
    
    @staticmethod
    @handle_exceptions
    @log_request
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
        courier_id = request.args.get('courier_id', type=int)
        
        if not courier_id:
            return error_response('courier_id query parameter required', 400)
        
        courier = CourierService.get_courier_by_id(courier_id)
        
        if not courier:
            return error_response('Courier not found', 404)
        
        return success_response(
            courier.to_dict(),
            'Status retrieved successfully'
        )
    
    @staticmethod
    @handle_exceptions
    @log_request
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
        courier_id = request.args.get('courier_id', type=int)
        
        if not courier_id:
            return error_response('courier_id query parameter required', 400)
        
        shipment = CourierService.get_shipment_details(shipment_id, courier_id)
        
        if not shipment:
            return error_response('Shipment not found or not assigned to you', 404)
        
        return success_response(
            shipment.to_dict_detailed(),
            'Shipment details retrieved successfully'
        )
    
    @staticmethod
    @handle_exceptions
    @log_request
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
        courier_id = request.args.get('courier_id', type=int)
        
        if not courier_id:
            return error_response('courier_id query parameter required', 400)
        
        stats = CourierService.get_courier_statistics(courier_id)
        
        if stats is None:
            return error_response('Failed to retrieve statistics', 500)
        
        return success_response(stats, 'Statistics retrieved successfully')
    
    @staticmethod
    @handle_exceptions
    @log_request
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
        data = request.get_json()
        
        if not data or 'shipment_id' not in data or 'courier_id' not in data:
            return error_response('shipment_id and courier_id are required', 400)
        
        shipment_id = data['shipment_id']
        courier_id = data['courier_id']
        
        shipment, error = CourierService.assign_shipment_to_courier(shipment_id, courier_id)
        
        if error:
            status_code = 404 if 'not found' in error.get('message', '').lower() else 400
            return error_response(error.get('message'), status_code)
        
        return success_response(
            shipment.to_dict_detailed(),
            'Shipment assigned successfully'
        )
    
    @staticmethod
    @handle_exceptions
    @log_request
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
        couriers = CourierService.get_all_available_couriers()
        
        return success_response(
            {
                'couriers': [courier.to_dict() for courier in couriers],
                'count': len(couriers)
            },
            'Couriers retrieved successfully'
        )
    