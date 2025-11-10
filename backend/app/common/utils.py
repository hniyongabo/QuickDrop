"""
Common utility functions
"""
import re
from datetime import datetime
from flask import jsonify


def success_response(data=None, message='Success', status_code=200):
    """
    Standard success response format
    
    Args:
        data: Response data
        message (str): Success message
        status_code (int): HTTP status code
    
    Returns:
        tuple: Flask response and status code
    """
    response = {
        'success': True,
        'message': message,
        'data': data,
        'timestamp': datetime.utcnow().isoformat()
    }
    return jsonify(response), status_code


def error_response(message='An error occurred', status_code=400, errors=None):
    """
    Standard error response format
    
    Args:
        message (str): Error message
        status_code (int): HTTP status code
        errors: Additional error details
    
    Returns:
        tuple: Flask response and status code
    """
    response = {
        'success': False,
        'message': message,
        'timestamp': datetime.utcnow().isoformat()
    }
    if errors:
        response['errors'] = errors
    return jsonify(response), status_code


def paginate_query(query, page=1, per_page=20):
    """
    Paginate a SQLAlchemy query
    
    Args:
        query: SQLAlchemy query object
        page (int): Page number
        per_page (int): Items per page
    
    Returns:
        dict: Pagination data
    """
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return {
        'items': [item.to_dict() for item in paginated.items],
        'total': paginated.total,
        'page': page,
        'per_page': per_page,
        'pages': paginated.pages,
        'has_next': paginated.has_next,
        'has_prev': paginated.has_prev
    }


def is_valid_email(email):
    """
    Validate email format
    
    Args:
        email (str): Email to validate
    
    Returns:
        bool: True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def is_valid_phone(phone):
    """
    Validate phone number format
    
    Args:
        phone (str): Phone number to validate
    
    Returns:
        bool: True if valid, False otherwise
    """
    # Remove common separators
    cleaned = re.sub(r'[\s\-\(\)\+]', '', phone)
    # Check if it contains only digits and has reasonable length
    return cleaned.isdigit() and 10 <= len(cleaned) <= 15


def sanitize_string(text):
    """
    Sanitize string input
    
    Args:
        text (str): Text to sanitize
    
    Returns:
        str: Sanitized text
    """
    if not text:
        return text
    return text.strip()


def format_datetime(dt, format_str='%Y-%m-%d %H:%M:%S'):
    """
    Format datetime object to string
    
    Args:
        dt (datetime): Datetime object
        format_str (str): Format string
    
    Returns:
        str: Formatted datetime string
    """
    if isinstance(dt, datetime):
        return dt.strftime(format_str)
    return str(dt)

