"""
Courier Service Layer
Business logic for courier operations using existing schema
"""
from flask import current_app
from datetime import datetime
from app import db
from app.models.delivery_model import Courier, Shipment, Order, Address
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_, and_


class CourierService:
    """Courier service for business logic"""
    
    @staticmethod
    def get_courier_by_id(courier_id):
        """
        Get courier by ID
        
        Args:
            courier_id (int): Courier ID
        
        Returns:
            Courier: Courier object or None
        """
        try:
            courier = Courier.query.filter_by(courier_id=courier_id).first()
            return courier
        except Exception as e:
            current_app.logger.error(f'Error fetching courier: {str(e)}')
            return None
    
    @staticmethod
    def get_courier_current_task(courier_id):
        """
        Get current active shipment for a courier
        
        Args:
            courier_id (int): Courier ID
        
        Returns:
            Shipment: Current shipment or None
        """
        try:
            shipment = Shipment.query.filter(
                Shipment.courier_id == courier_id,
                Shipment.status.in_(['assigned', 'picked_up', 'in_transit'])
            ).order_by(Shipment.shipment_id.asc()).first()
            
            return shipment
        except Exception as e:
            current_app.logger.error(f'Error fetching current task: {str(e)}')
            return None
    
    @staticmethod
    def get_courier_upcoming_tasks(courier_id, limit=10):
        """
        Get upcoming assigned shipments for a courier
        
        Args:
            courier_id (int): Courier ID
            limit (int): Maximum number of tasks to return
        
        Returns:
            list: List of upcoming shipments
        """
        try:
            shipments = Shipment.query.filter(
                Shipment.courier_id == courier_id,
                Shipment.status == 'assigned'
            ).order_by(Shipment.shipment_id.asc()).limit(limit).all()
            
            return shipments
        except Exception as e:
            current_app.logger.error(f'Error fetching upcoming tasks: {str(e)}')
            return []
    
    @staticmethod
    def get_courier_task_history(courier_id, page=1, per_page=20):
        """
        Get courier's completed and failed shipments
        
        Args:
            courier_id (int): Courier ID
            page (int): Page number
            per_page (int): Items per page
        
        Returns:
            dict: Paginated task history
        """
        try:
            query = Shipment.query.filter(
                Shipment.courier_id == courier_id,
                or_(
                    Shipment.status == 'delivered',
                    Shipment.status == 'failed'
                )
            ).order_by(Shipment.shipment_id.desc())
            
            paginated = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'shipments': [shipment.to_dict_detailed() for shipment in paginated.items],
                'total': paginated.total,
                'page': page,
                'per_page': per_page,
                'pages': paginated.pages,
                'has_next': paginated.has_next,
                'has_prev': paginated.has_prev
            }
        except Exception as e:
            current_app.logger.error(f'Error fetching task history: {str(e)}')
            return None
    
    @staticmethod
    def confirm_pickup(shipment_id, courier_id):
        """
        Confirm package pickup by courier
        
        Args:
            shipment_id (int): Shipment ID
            courier_id (int): Courier ID
        
        Returns:
            tuple: (shipment, error)
        """
        try:
            shipment = Shipment.query.filter_by(
                shipment_id=shipment_id,
                courier_id=courier_id
            ).first()
            
            if not shipment:
                return None, {'message': 'Shipment not found or not assigned to you'}
            
            if shipment.status != 'assigned':
                return None, {'message': f'Cannot confirm pickup. Current status: {shipment.status}'}
            
            # Update shipment status
            shipment.status = 'picked_up'
            shipment.picked_at = datetime.utcnow()
            
            # Update order status
            if shipment.order:
                shipment.order.status = 'picked_up'
            
            db.session.commit()
            
            current_app.logger.info(f'Pickup confirmed for shipment {shipment.shipment_id}')
            return shipment, None
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'Error confirming pickup: {str(e)}')
            return None, {'message': 'Failed to confirm pickup', 'error': str(e)}
    
    @staticmethod
    def start_delivery(shipment_id, courier_id):
        """
        Mark shipment as in transit
        
        Args:
            shipment_id (int): Shipment ID
            courier_id (int): Courier ID
        
        Returns:
            tuple: (shipment, error)
        """
        try:
            shipment = Shipment.query.filter_by(
                shipment_id=shipment_id,
                courier_id=courier_id
            ).first()
            
            if not shipment:
                return None, {'message': 'Shipment not found or not assigned to you'}
            
            if shipment.status != 'picked_up':
                return None, {'message': f'Cannot start delivery. Current status: {shipment.status}'}
            
            shipment.status = 'in_transit'
            
            # Update order status
            if shipment.order:
                shipment.order.status = 'in_transit'
            
            db.session.commit()
            
            current_app.logger.info(f'Delivery started for shipment {shipment.shipment_id}')
            return shipment, None
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'Error starting delivery: {str(e)}')
            return None, {'message': 'Failed to start delivery', 'error': str(e)}
    
    @staticmethod
    def complete_delivery(shipment_id, courier_id):
        """
        Mark shipment as delivered
        
        Args:
            shipment_id (int): Shipment ID
            courier_id (int): Courier ID
        
        Returns:
            tuple: (shipment, error)
        """
        try:
            shipment = Shipment.query.filter_by(
                shipment_id=shipment_id,
                courier_id=courier_id
            ).first()
            
            if not shipment:
                return None, {'message': 'Shipment not found or not assigned to you'}
            
            if shipment.status not in ['picked_up', 'in_transit']:
                return None, {'message': f'Cannot complete delivery. Current status: {shipment.status}'}
            
            shipment.status = 'delivered'
            shipment.delivered_at = datetime.utcnow()
            
            # Update order status
            if shipment.order:
                shipment.order.status = 'delivered'
            
            db.session.commit()
            
            current_app.logger.info(f'Delivery completed for shipment {shipment.shipment_id}')
            return shipment, None
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'Error completing delivery: {str(e)}')
            return None, {'message': 'Failed to complete delivery', 'error': str(e)}
    
    @staticmethod
    def update_courier_status(courier_id, status):
        """
        Update courier status (active, inactive, offshift, banned)
        
        Args:
            courier_id (int): Courier ID
            status (str): New status
        
        Returns:
            tuple: (courier, error)
        """
        try:
            valid_statuses = ['active', 'inactive', 'offshift', 'banned']
            if status not in valid_statuses:
                return None, {'message': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}
            
            courier = Courier.query.filter_by(courier_id=courier_id).first()
            
            if not courier:
                return None, {'message': 'Courier not found'}
            
            courier.status = status
            db.session.commit()
            
            current_app.logger.info(f'Courier status updated: {courier_id} - {status}')
            return courier, None
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'Error updating courier status: {str(e)}')
            return None, {'message': 'Failed to update status', 'error': str(e)}
    
    @staticmethod
    def get_shipment_details(shipment_id, courier_id):
        """
        Get detailed information about a specific shipment
        
        Args:
            shipment_id (int): Shipment ID
            courier_id (int): Courier ID
        
        Returns:
            Shipment: Shipment object or None
        """
        try:
            shipment = Shipment.query.filter_by(
                shipment_id=shipment_id,
                courier_id=courier_id
            ).first()
            
            return shipment
        except Exception as e:
            current_app.logger.error(f'Error fetching shipment details: {str(e)}')
            return None
    
    @staticmethod
    def get_courier_statistics(courier_id):
        """
        Get statistics for a courier
        
        Args:
            courier_id (int): Courier ID
        
        Returns:
            dict: Courier statistics
        """
        try:
            total_deliveries = Shipment.query.filter_by(
                courier_id=courier_id,
                status='delivered'
            ).count()
            
            pending_deliveries = Shipment.query.filter(
                Shipment.courier_id == courier_id,
                Shipment.status.in_(['assigned', 'picked_up', 'in_transit'])
            ).count()
            
            failed_deliveries = Shipment.query.filter_by(
                courier_id=courier_id,
                status='failed'
            ).count()
            
            # Get courier info
            courier = Courier.query.filter_by(courier_id=courier_id).first()
            
            return {
                'total_completed': total_deliveries,
                'pending': pending_deliveries,
                'failed': failed_deliveries,
                'courier_status': courier.status if courier else None,
                'courier_name': courier.name if courier else None
            }
        except Exception as e:
            current_app.logger.error(f'Error fetching courier statistics: {str(e)}')
            return None
    
    @staticmethod
    def assign_shipment_to_courier(shipment_id, courier_id):
        """
        Assign a shipment to a courier (for admin/dispatcher use)
        
        Args:
            shipment_id (int): Shipment ID
            courier_id (int): Courier ID
        
        Returns:
            tuple: (shipment, error)
        """
        try:
            shipment = Shipment.query.filter_by(shipment_id=shipment_id).first()
            
            if not shipment:
                return None, {'message': 'Shipment not found'}
            
            if shipment.status != 'unassigned':
                return None, {'message': f'Shipment is already {shipment.status}'}
            
            courier = Courier.query.filter_by(courier_id=courier_id).first()
            
            if not courier:
                return None, {'message': 'Courier not found'}
            
            if courier.status != 'active':
                return None, {'message': f'Courier is not active (status: {courier.status})'}
            
            # Assign the shipment
            shipment.courier_id = courier_id
            shipment.status = 'assigned'
            
            # Update order status
            if shipment.order:
                shipment.order.status = 'assigned'
            
            db.session.commit()
            
            current_app.logger.info(f'Shipment {shipment_id} assigned to courier {courier_id}')
            return shipment, None
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'Error assigning shipment: {str(e)}')
            return None, {'message': 'Failed to assign shipment', 'error': str(e)}
    
    @staticmethod
    def get_all_available_couriers():
        """
        Get all active couriers
        
        Returns:
            list: List of active couriers
        """
        try:
            couriers = Courier.query.filter_by(status='active').all()
            return couriers
        except Exception as e:
            current_app.logger.error(f'Error fetching available couriers: {str(e)}')
            return []
        