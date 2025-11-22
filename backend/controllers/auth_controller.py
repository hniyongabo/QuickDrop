from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import User, Customer, Courier
from utils.database import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user (customer, courier, or admin)"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['email', 'password', 'role', 'name', 'phone', 'address']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400

        # Validate role
        if data['role'] not in ['customer', 'courier', 'admin']:
            return jsonify({'error': 'Invalid role'}), 400

        # Create user account
        user = User(
            email=data['email'],
            role=data['role']
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.flush()  # Get user.id without committing

        # Create role-specific profile
        if data['role'] == 'customer':
            customer = Customer(
                user_id=user.id,
                name=data['name'],
                phone=data['phone'],
                address=data['address'],
                secondary_phone=data.get('secondary_phone'),
                city=data.get('city')
            )
            db.session.add(customer)

        elif data['role'] == 'courier':
            # Validate courier-specific fields
            courier_required = ['vehicle_model', 'license_plate', 'driver_license_num', 'id_card_num']
            for field in courier_required:
                if field not in data:
                    return jsonify({'error': f'{field} is required for courier registration'}), 400

            # Check for duplicate courier identifiers
            if Courier.query.filter_by(license_plate=data['license_plate']).first():
                return jsonify({'error': 'License plate already registered'}), 400
            if Courier.query.filter_by(driver_license_num=data['driver_license_num']).first():
                return jsonify({'error': 'Driver license number already registered'}), 400
            if Courier.query.filter_by(id_card_num=data['id_card_num']).first():
                return jsonify({'error': 'ID card number already registered'}), 400

            courier = Courier(
                user_id=user.id,
                name=data['name'],
                phone=data['phone'],
                address=data['address'],
                vehicle_model=data['vehicle_model'],
                license_plate=data['license_plate'],
                driver_license_num=data['driver_license_num'],
                id_card_num=data['id_card_num'],
                experience=data.get('experience', 0),
                motivation=data.get('motivation')
            )
            db.session.add(courier)

        db.session.commit()

        # Create access token (identity must be string)
        access_token = create_access_token(identity=str(user.id))

        # Get user data and flatten profile
        user_dict = user.to_dict()
        if 'profile' in user_dict:
            profile = user_dict.pop('profile')
            user_dict.update(profile)

        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': user_dict
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    try:
        data = request.get_json()

        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400

        user = User.query.filter_by(email=data['email']).first()

        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401

        if not user.is_active:
            return jsonify({'error': 'Account is deactivated. Please contact support.'}), 403

        # Create access token (identity must be string)
        access_token = create_access_token(identity=str(user.id))

        # Get user data and flatten profile
        user_dict = user.to_dict()
        if 'profile' in user_dict:
            profile = user_dict.pop('profile')
            user_dict.update(profile)

        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user_dict
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
