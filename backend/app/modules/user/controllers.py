"""
User Controllers
Handle HTTP requests and responses for user endpoints
"""
from flask import request, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity
from app.modules.user.services import UserService
from app.common.utils import success_response, error_response
from app.common.decorators import handle_exceptions, log_request


class UserController:
    """User controller for handling HTTP requests"""
    
    @staticmethod
    @handle_exceptions
    @log_request
    def create_user():
        """
        Create a new user
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
          400:
            description: Invalid input data
        """
        data = request.get_json()
        
        user, error = UserService.create_user(data)
        
        if error:
            return error_response(
                error.get('message', 'Failed to create user'),
                400,
                error.get('errors')
            )
        
        return success_response(
            user.to_dict(),
            'User created successfully',
            201
        )
    
    @staticmethod
    @handle_exceptions
    @log_request
    def get_user(user_id):
        """
        Get user by ID
        ---
        tags:
          - Users
        parameters:
          - in: path
            name: user_id
            required: true
            type: integer
            description: User ID
        responses:
          200:
            description: User retrieved successfully
          404:
            description: User not found
        """
        user = UserService.get_user_by_id(user_id)
        
        if not user:
            return error_response('User not found', 404)
        
        return success_response(user.to_dict(), 'User retrieved successfully')
    
    @staticmethod
    @handle_exceptions
    @log_request
    def get_all_users():
        """
        Get all users with pagination
        ---
        tags:
          - Users
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
        """
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        role = request.args.get('role', None, type=str)
        
        # Validate pagination parameters
        if page < 1:
            page = 1
        if per_page < 1 or per_page > 100:
            per_page = 20
        
        result = UserService.get_all_users(page=page, per_page=per_page, role=role)
        
        if result is None:
            return error_response('Failed to retrieve users', 500)
        
        return success_response(result, 'Users retrieved successfully')
    
    @staticmethod
    @handle_exceptions
    @log_request
    def update_user(user_id):
        """
        Update user information
        ---
        tags:
          - Users
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
          404:
            description: User not found
          400:
            description: Invalid input data
        """
        data = request.get_json()
        
        user, error = UserService.update_user(user_id, data)
        
        if error:
            status_code = 404 if error.get('message') == 'User not found' else 400
            return error_response(
                error.get('message', 'Failed to update user'),
                status_code,
                error.get('errors')
            )
        
        return success_response(user.to_dict(), 'User updated successfully')
    
    @staticmethod
    @handle_exceptions
    @log_request
    def delete_user(user_id):
        """
        Delete (deactivate) a user
        ---
        tags:
          - Users
        parameters:
          - in: path
            name: user_id
            required: true
            type: integer
            description: User ID
        responses:
          200:
            description: User deleted successfully
          404:
            description: User not found
        """
        success, error = UserService.delete_user(user_id)
        
        if error:
            status_code = 404 if error.get('message') == 'User not found' else 500
            return error_response(error.get('message', 'Failed to delete user'), status_code)
        
        return success_response(None, 'User deleted successfully')
    
    @staticmethod
    @handle_exceptions
    @log_request
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
          401:
            description: Invalid credentials
        """
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return error_response('Email and password are required', 400)
        
        user, error = UserService.authenticate_user(data['email'], data['password'])
        
        if error:
            return error_response(error.get('message', 'Authentication failed'), 401)
        
        # Create JWT tokens
        access_token = create_access_token(
            identity=user.user_id,
            additional_claims={'role': user.role, 'email': user.email}
        )
        refresh_token = create_refresh_token(identity=user.user_id)
        
        return success_response({
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 'Login successful')
    
    @staticmethod
    @handle_exceptions
    @log_request
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
          401:
            description: Unauthorized
        """
        user_id = get_jwt_identity()
        user = UserService.get_user_by_id(user_id)
        
        if not user:
            return error_response('User not found', 404)
        
        return success_response(user.to_dict(), 'Current user retrieved successfully')

