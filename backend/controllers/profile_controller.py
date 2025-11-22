from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Customer, Courier
from utils.database import db

profile_bp = Blueprint('profile', __name__, url_prefix='/api')

@profile_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        user_dict = user.to_dict()

        # Flatten profile data for easier frontend access
        if 'profile' in user_dict:
            profile = user_dict.pop('profile')
            user_dict.update(profile)

        return jsonify(user_dict), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@profile_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        # Update email if provided
        if 'email' in data:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Email already in use'}), 400
            user.email = data['email']

        # Update role-specific profile
        if user.role == 'customer' and user.customer:
            if 'name' in data:
                user.customer.name = data['name']
            if 'phone' in data:
                user.customer.phone = data['phone']
            if 'address' in data:
                user.customer.address = data['address']
            if 'secondary_phone' in data:
                user.customer.secondary_phone = data['secondary_phone']
            if 'city' in data:
                user.customer.city = data['city']

        elif user.role == 'courier' and user.courier:
            if 'name' in data:
                user.courier.name = data['name']
            if 'phone' in data:
                user.courier.phone = data['phone']
            if 'address' in data:
                user.courier.address = data['address']
            if 'vehicle_model' in data:
                user.courier.vehicle_model = data['vehicle_model']
            if 'license_plate' in data:
                # Check if license plate is already taken
                existing = Courier.query.filter_by(license_plate=data['license_plate']).first()
                if existing and existing.id != user.courier.id:
                    return jsonify({'error': 'License plate already in use'}), 400
                user.courier.license_plate = data['license_plate']
            if 'experience' in data:
                user.courier.experience = data['experience']
            if 'motivation' in data:
                user.courier.motivation = data['motivation']
            if 'is_available' in data:
                user.courier.is_available = data['is_available']

        db.session.commit()

        # Get user data and flatten profile
        user_dict = user.to_dict()
        if 'profile' in user_dict:
            profile = user_dict.pop('profile')
            user_dict.update(profile)

        return jsonify({
            'message': 'Profile updated successfully',
            'user': user_dict
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@profile_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current password and new password are required'}), 400

        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401

        user.set_password(data['new_password'])
        db.session.commit()

        return jsonify({'message': 'Password updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
