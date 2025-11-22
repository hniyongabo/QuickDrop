from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Customer, Courier, Order
from utils.database import db
from datetime import datetime, timedelta

order_bp = Blueprint('order', __name__, url_prefix='/api')

@order_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new delivery order"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user or user.role != 'customer':
            return jsonify({'error': 'Only customers can create orders'}), 403

        if not user.customer:
            return jsonify({'error': 'Customer profile not found'}), 404

        data = request.get_json()

        # Validate required fields
        required_fields = [
            'pickup_address', 'pickup_contact_name', 'pickup_contact_phone',
            'delivery_address', 'delivery_contact_name', 'delivery_contact_phone',
            'parcel_type', 'delivery_fee'
        ]
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        # Create order
        order = Order(
            sender_id=user.customer.id,
            pickup_address=data['pickup_address'],
            pickup_contact_name=data['pickup_contact_name'],
            pickup_contact_phone=data['pickup_contact_phone'],
            pickup_latitude=data.get('pickup_latitude'),
            pickup_longitude=data.get('pickup_longitude'),
            delivery_address=data['delivery_address'],
            delivery_contact_name=data['delivery_contact_name'],
            delivery_contact_phone=data['delivery_contact_phone'],
            delivery_latitude=data.get('delivery_latitude'),
            delivery_longitude=data.get('delivery_longitude'),
            parcel_type=data['parcel_type'],
            parcel_description=data.get('parcel_description'),
            parcel_weight=data.get('parcel_weight'),
            parcel_value=data.get('parcel_value'),
            delivery_type=data.get('delivery_type', 'standard'),
            delivery_fee=data['delivery_fee'],
            payment_method=data.get('payment_method'),
            special_instructions=data.get('special_instructions'),
            status='pending'
        )

        # Generate order number
        order.order_number = order.generate_order_number()

        # Set estimated delivery time (example: 2 hours from now)
        order.estimated_delivery_time = datetime.utcnow() + timedelta(hours=2)

        # If courier_id provided, assign courier directly
        if data.get('courier_id'):
            courier = Courier.query.get(data['courier_id'])
            if courier and courier.is_verified and courier.is_available:
                order.courier_id = courier.id
                order.status = 'courier_assigned'

        db.session.add(order)
        db.session.commit()

        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@order_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    """Get orders for the current user"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get orders based on user role
        if user.role == 'customer' and user.customer:
            orders = Order.query.filter_by(sender_id=user.customer.id).order_by(Order.created_at.desc()).all()
        elif user.role == 'courier' and user.courier:
            orders = Order.query.filter_by(courier_id=user.courier.id).order_by(Order.created_at.desc()).all()
        elif user.role == 'admin':
            # Admin can see all orders
            orders = Order.query.order_by(Order.created_at.desc()).all()
        else:
            return jsonify({'error': 'No profile found'}), 404

        return jsonify({
            'orders': [order.to_dict(include_details=False) for order in orders]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@order_bp.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get a specific order by ID"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        # Check if user has permission to view this order
        can_view = False
        if user.role == 'admin':
            can_view = True
        elif user.role == 'customer' and user.customer and order.sender_id == user.customer.id:
            can_view = True
        elif user.role == 'courier' and user.courier and order.courier_id == user.courier.id:
            can_view = True

        if not can_view:
            return jsonify({'error': 'Unauthorized to view this order'}), 403

        return jsonify(order.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@order_bp.route('/orders/track/<order_number>', methods=['GET'])
def track_order(order_number):
    """Track an order by order number (public endpoint)"""
    try:
        order = Order.query.filter_by(order_number=order_number).first()

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        return jsonify(order.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@order_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    """Update order status (for couriers and admins)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user or user.role not in ['courier', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403

        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        # Courier can only update their own orders
        if user.role == 'courier' and user.courier and order.courier_id != user.courier.id:
            return jsonify({'error': 'Unauthorized to update this order'}), 403

        data = request.get_json()

        if 'status' in data:
            valid_statuses = [
                'pending', 'courier_assigned', 'en_route_to_pickup',
                'picked_up', 'in_transit', 'delivered', 'completed',
                'cancelled', 'failed'
            ]
            if data['status'] not in valid_statuses:
                return jsonify({'error': 'Invalid status'}), 400

            order.status = data['status']

            # Update timestamps based on status
            if data['status'] == 'picked_up' and not order.actual_pickup_time:
                order.actual_pickup_time = datetime.utcnow()
            elif data['status'] == 'delivered' and not order.actual_delivery_time:
                order.actual_delivery_time = datetime.utcnow()

        if 'courier_notes' in data:
            order.courier_notes = data['courier_notes']

        db.session.commit()

        return jsonify({
            'message': 'Order status updated successfully',
            'order': order.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@order_bp.route('/orders/<int:order_id>/assign', methods=['POST'])
@jwt_required()
def assign_courier(order_id):
    """Assign a courier to an order (admin or auto-assignment)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        data = request.get_json()
        courier_id = data.get('courier_id')

        if courier_id:
            # Manual assignment (admin)
            if user.role != 'admin':
                return jsonify({'error': 'Only admins can manually assign couriers'}), 403

            courier = Courier.query.get(courier_id)
            if not courier:
                return jsonify({'error': 'Courier not found'}), 404

            if not courier.is_verified:
                return jsonify({'error': 'Courier is not verified'}), 400

            if not courier.is_available:
                return jsonify({'error': 'Courier is not available'}), 400

        else:
            # Auto-assignment: find available courier
            courier = Courier.query.filter_by(
                is_verified=True,
                is_available=True
            ).order_by(Courier.rating.desc()).first()

            if not courier:
                return jsonify({'error': 'No available couriers found'}), 404

        order.courier_id = courier.id
        order.status = 'courier_assigned'

        db.session.commit()

        return jsonify({
            'message': 'Courier assigned successfully',
            'order': order.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@order_bp.route('/couriers/online', methods=['GET'])
@jwt_required()
def get_online_couriers():
    """Get all online and available couriers"""
    try:
        couriers = Courier.query.filter_by(
            is_verified=True,
            is_available=True
        ).order_by(Courier.rating.desc()).all()

        return jsonify({
            'couriers': [c.to_dict() for c in couriers]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@order_bp.route('/couriers/<int:courier_id>', methods=['GET'])
@jwt_required()
def get_courier_profile(courier_id):
    """Get courier profile by ID"""
    try:
        courier = Courier.query.get(courier_id)
        if not courier:
            return jsonify({'error': 'Courier not found'}), 404

        return jsonify(courier.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@order_bp.route('/orders/pending', methods=['GET'])
@jwt_required()
def get_pending_orders():
    """Get all pending orders (for couriers to view and accept)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user or user.role != 'courier':
            return jsonify({'error': 'Only couriers can view pending orders'}), 403

        orders = Order.query.filter_by(status='pending').order_by(Order.created_at.desc()).all()

        return jsonify({
            'orders': [order.to_dict() for order in orders]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@order_bp.route('/orders/<int:order_id>/accept', methods=['POST'])
@jwt_required()
def accept_order(order_id):
    """Courier accepts an order"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user or user.role != 'courier':
            return jsonify({'error': 'Only couriers can accept orders'}), 403

        if not user.courier:
            return jsonify({'error': 'Courier profile not found'}), 404

        if not user.courier.is_verified:
            return jsonify({'error': 'Courier is not verified'}), 400

        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        if order.status != 'pending':
            return jsonify({'error': 'Order is not available for acceptance'}), 400

        if order.courier_id:
            return jsonify({'error': 'Order already has a courier assigned'}), 400

        order.courier_id = user.courier.id
        order.status = 'courier_assigned'

        db.session.commit()

        return jsonify({
            'message': 'Order accepted successfully',
            'order': order.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@order_bp.route('/orders/<int:order_id>/rate', methods=['POST'])
@jwt_required()
def rate_order(order_id):
    """Rate a completed order (customers only)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user or user.role != 'customer':
            return jsonify({'error': 'Only customers can rate orders'}), 403

        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        if order.sender_id != user.customer.id:
            return jsonify({'error': 'Unauthorized to rate this order'}), 403

        if order.status not in ['delivered', 'completed']:
            return jsonify({'error': 'Can only rate completed orders'}), 400

        data = request.get_json()

        if 'rating' not in data:
            return jsonify({'error': 'Rating is required'}), 400

        rating = int(data['rating'])
        if rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400

        order.customer_rating = rating
        order.customer_feedback = data.get('feedback')
        order.status = 'completed'

        # Update courier rating
        if order.courier:
            courier = order.courier
            total_ratings = Order.query.filter(
                Order.courier_id == courier.id,
                Order.customer_rating.isnot(None)
            ).count()

            if total_ratings > 0:
                avg_rating = db.session.query(
                    db.func.avg(Order.customer_rating)
                ).filter(
                    Order.courier_id == courier.id,
                    Order.customer_rating.isnot(None)
                ).scalar()

                courier.rating = round(avg_rating, 2)
                courier.total_deliveries = total_ratings

        db.session.commit()

        return jsonify({
            'message': 'Order rated successfully',
            'order': order.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
