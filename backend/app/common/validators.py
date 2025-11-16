"""
Request validation utilities
"""
from functools import wraps
from flask import request
from app.common.utils import error_response, is_valid_email, is_valid_phone


def validate_required_fields(required_fields):
    """
    Decorator to validate required fields in request JSON
    
    Args:
        required_fields (list): List of required field names
    
    Returns:
        function: Decorated function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return error_response('Content-Type must be application/json', 400)
            
            data = request.get_json()
            missing_fields = [field for field in required_fields if field not in data or not data[field]]
            
            if missing_fields:
                return error_response(
                    'Missing required fields',
                    400,
                    {'missing_fields': missing_fields}
                )
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def validate_email_field(field_name='email'):
    """
    Decorator to validate email field in request JSON
    
    Args:
        field_name (str): Name of email field
    
    Returns:
        function: Decorated function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json()
            email = data.get(field_name)
            
            if email and not is_valid_email(email):
                return error_response(
                    f'Invalid email format for field: {field_name}',
                    400
                )
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def validate_phone_field(field_name='phone'):
    """
    Decorator to validate phone field in request JSON
    
    Args:
        field_name (str): Name of phone field
    
    Returns:
        function: Decorated function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json()
            phone = data.get(field_name)
            
            if phone and not is_valid_phone(phone):
                return error_response(
                    f'Invalid phone number format for field: {field_name}',
                    400
                )
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def validate_user_data(data, is_update=False):
    """
    Validate user data
    
    Args:
        data (dict): User data to validate
        is_update (bool): Whether this is an update operation
    
    Returns:
        tuple: (is_valid, errors)
    """
    errors = []
    
    if not is_update:
        # Required fields for creation
        required = ['name', 'email', 'password', 'phone']
        missing = [field for field in required if not data.get(field)]
        if missing:
            errors.append(f"Missing required fields: {', '.join(missing)}")
    
    # Email validation
    if 'email' in data and data['email']:
        if not is_valid_email(data['email']):
            errors.append('Invalid email format')
    
    # Phone validation
    if 'phone' in data and data['phone']:
        if not is_valid_phone(data['phone']):
            errors.append('Invalid phone number format')
    
    # Password validation
    if 'password' in data and data['password']:
        if len(data['password']) < 8:
            errors.append('Password must be at least 8 characters long')
    
    # Role validation
    if 'role' in data and data['role']:
        role_value = str(data['role']).lower()
        valid_roles = ['user', 'admin', 'driver', 'customer', 'courier']
        if role_value not in valid_roles:
            errors.append(f"Invalid role. Must be one of: {', '.join(valid_roles)}")
    
    return len(errors) == 0, errors

