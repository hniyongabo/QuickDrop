"""
User Routes
Define URL patterns for user endpoints
"""
from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.user_controller import UserController

# Create blueprint
user_bp = Blueprint('user', __name__)


# Public routes
@user_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    ---
    tags:
      - Users
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - email
            - password
            - phone
          properties:
            name:
              type: string
              example: John Doe
            email:
              type: string
              example: john.doe@example.com
            password:
              type: string
              example: SecurePass123
            phone:
              type: string
              example: +1234567890
            role:
              type: string
              example: user
              enum: [user, admin, driver]
            address:
              type: string
              example: 123 Main St, City, Country
    responses:
      201:
        description: User created successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
      400:
        description: Invalid input data
    """
    return UserController.create_user()


@user_bp.route('/login', methods=['POST'])
def login():
    """
    User login
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: john.doe@example.com
            password:
              type: string
              example: SecurePass123
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
              properties:
                user:
                  type: object
                access_token:
                  type: string
                refresh_token:
                  type: string
      401:
        description: Invalid credentials
    """
    return UserController.login()


# Protected routes
@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Current user retrieved successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
      401:
        description: Unauthorized
    """
    return UserController.get_current_user()


@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_users():
    """
    Get all users with pagination
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
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
      - in: query
        name: role
        type: string
        description: Filter by role
        enum: [user, admin, driver]
    responses:
      200:
        description: Users retrieved successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
              properties:
                users:
                  type: array
                  items:
                    type: object
                total:
                  type: integer
                page:
                  type: integer
                per_page:
                  type: integer
                pages:
                  type: integer
    """
    return UserController.get_all_users()


@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """
    Get user by ID
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
        required: true
        type: integer
        description: User ID
    responses:
      200:
        description: User retrieved successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
      404:
        description: User not found
    """
    return UserController.get_user(user_id)


@user_bp.route('/<int:user_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_user(user_id):
    """
    Update user information
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
        required: true
        type: integer
        description: User ID
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            email:
              type: string
            password:
              type: string
            phone:
              type: string
            role:
              type: string
              enum: [user, admin, driver]
            address:
              type: string
    responses:
      200:
        description: User updated successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
      404:
        description: User not found
      400:
        description: Invalid input data
    """
    return UserController.update_user(user_id)


@user_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    Delete (deactivate) a user
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
        required: true
        type: integer
        description: User ID
    responses:
      200:
        description: User deleted successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
      404:
        description: User not found
    """
    return UserController.delete_user(user_id)

