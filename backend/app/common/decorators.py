"""
Custom decorators for authentication, authorization, and other cross-cutting concerns
"""
from functools import wraps
from flask import request, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.common.utils import error_response


def jwt_required_custom(f):
    """
    Custom JWT required decorator with better error handling
    
    Returns:
        function: Decorated function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            current_app.logger.error(f'JWT verification failed: {str(e)}')
            return error_response('Invalid or expired token', 401)
    return decorated_function


def role_required(required_roles):
    """
    Decorator to check if user has required role
    
    Args:
        required_roles (list or str): Required role(s)
    
    Returns:
        function: Decorated function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                user_role = claims.get('role', 'user')
                
                if isinstance(required_roles, str):
                    roles = [required_roles]
                else:
                    roles = required_roles
                
                if user_role not in roles:
                    return error_response(
                        'You do not have permission to access this resource',
                        403
                    )
                
                return f(*args, **kwargs)
            except Exception as e:
                current_app.logger.error(f'Role verification failed: {str(e)}')
                return error_response('Authorization failed', 403)
        return decorated_function
    return decorator


def log_request(f):
    """
    Decorator to log incoming requests
    
    Returns:
        function: Decorated function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_app.logger.info(f'Request: {request.method} {request.path}')
        current_app.logger.info(f'Request args: {request.args}')
        if request.is_json:
            # Don't log sensitive data like passwords
            data = request.get_json().copy()
            if 'password' in data:
                data['password'] = '***'
            current_app.logger.info(f'Request body: {data}')
        
        response = f(*args, **kwargs)
        current_app.logger.info(f'Response status: {response[1] if isinstance(response, tuple) else 200}')
        return response
    return decorated_function


def handle_exceptions(f):
    """
    Decorator to handle exceptions gracefully
    
    Returns:
        function: Decorated function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            current_app.logger.error(f'Unhandled exception in {f.__name__}: {str(e)}', exc_info=True)
            return error_response('An unexpected error occurred', 500)
    return decorated_function

