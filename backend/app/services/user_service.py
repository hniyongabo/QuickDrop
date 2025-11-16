"""
User Service Layer
Business logic for user operations
"""
from flask import current_app
from app import db
from app.models.user_model import User
from app.common.validators import validate_user_data
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text


class UserService:
    """User service for business logic"""
    
    @staticmethod
    def create_user(data):
        """
        Create a new user
        
        Args:
            data (dict): User data
        
        Returns:
            tuple: (user, error)
        """
        try:
            print(f"data: {data}")
            # Validate user data
            is_valid, errors = validate_user_data(data, is_update=False)
            if not is_valid:
                return None, {'message': 'Validation failed', 'errors': errors}
            
            # Check if user already exists
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user:
                return None, {'message': 'User with this email already exists'}
            
            # Normalize incoming role
            requested_role = str(data.get('role', 'customer')).lower()
            # Internal role mapping for existing ORM model
            internal_role = (
                'ADMIN' if requested_role == 'admin'
                else 'COURIER' if requested_role in ('driver', 'courier')
                else 'CUSTOMER'
            )

            # Create user (ORM table)
            user = User(
                name=data['name'],
                phone=str(data['phone']),
                email=data['email'],
                role=internal_role,
                address=data.get('address', '')
            )
            print(f"user: {user}")
            user.set_password(data['password'])

            user.save()  # commits

            # Mirror into quickdrop schema and create role-specific record
            # Map to enum role for quickdrop
            quickdrop_role = (
                'ADMIN' if requested_role == 'admin'
                else 'COURIER' if requested_role in ('driver', 'courier')
                else 'CUSTOMER'
            )
            # Use email as unique username to avoid collisions
            username_value = data.get('username') or data['email']

            quick_user_id = db._scalar(
                text("""
                    INSERT INTO quickdrop."user"(username, password, role, email, phone_number)
                    VALUES (:username, :password, :role, :email, :phone)
                    RETURNING user_id
                """),
                {
                    'username': username_value,
                    'password': user.password_hash,
                    'role': quickdrop_role,
                    'email': user.email,
                    'phone': user.phone
                }
            )

            # Create role-specific row
            if quickdrop_role == 'CUSTOMER':
                db.session.execute(
                    text('INSERT INTO quickdrop.customer(user_id) VALUES (:uid) ON CONFLICT DO NOTHING'),
                    {'uid': quick_user_id}
                )
            elif quickdrop_role == 'COURIER':
                db.session.execute(
                    text('INSERT INTO quickdrop.courier(user_id, online) VALUES (:uid, FALSE) ON CONFLICT DO NOTHING'),
                    {'uid': quick_user_id}
                )
            elif quickdrop_role == 'ADMIN':
                db.session.execute(
                    text('INSERT INTO quickdrop.admin(user_id) VALUES (:uid) ON CONFLICT DO NOTHING'),
                    {'uid': quick_user_id}
                )
            db.session.commit()

            current_app.logger.info(f'User created successfully: {user.email} (quickdrop user_id={quick_user_id})')
            return user, None
            
        except IntegrityError as e:
            db.session.rollback()
            current_app.logger.error(f'Database integrity error: {str(e)}')
            return None, {'message': 'User with this email already exists'}
        except Exception as e:
            # Best-effort rollback including removing the ORM user if quickdrop insert failed after ORM commit
            try:
                db.session.rollback()
            except Exception:
                pass
            try:
                if 'user' in locals() and getattr(user, 'user_id', None):
                    # delete the created ORM user to keep systems consistent
                    user.delete()
            except Exception:
                pass
            current_app.logger.error(f'Error creating user: {str(e)}')
            return None, {'message': 'Failed to create user', 'error': str(e)}
    
    @staticmethod
    def get_user_by_id(user_id):
        """
        Get user by ID
        
        Args:
            user_id (int): User ID
        
        Returns:
            User: User object or None
        """
        try:
            user = User.query.filter_by(user_id=user_id, is_active=True).first()
            return user
        except Exception as e:
            current_app.logger.error(f'Error fetching user: {str(e)}')
            return None
    
    @staticmethod
    def get_user_by_email(email):
        """
        Get user by email
        
        Args:
            email (str): User email
        
        Returns:
            User: User object or None
        """
        try:
            user = User.query.filter_by(email=email, is_active=True).first()
            return user
        except Exception as e:
            current_app.logger.error(f'Error fetching user by email: {str(e)}')
            return None
    
    @staticmethod
    def get_all_users(page=1, per_page=20, role=None):
        """
        Get all users with pagination
        
        Args:
            page (int): Page number
            per_page (int): Items per page
            role (str): Filter by role (optional)
        
        Returns:
            dict: Paginated users data
        """
        try:
            query = User.query.filter_by(is_active=True)
            
            if role:
                query = query.filter_by(role=role)
            
            query = query.order_by(User.created_at.desc())
            
            paginated = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'users': [user.to_dict() for user in paginated.items],
                'total': paginated.total,
                'page': page,
                'per_page': per_page,
                'pages': paginated.pages,
                'has_next': paginated.has_next,
                'has_prev': paginated.has_prev
            }
        except Exception as e:
            current_app.logger.error(f'Error fetching users: {str(e)}')
            return None
    
    @staticmethod
    def update_user(user_id, data):
        """
        Update user information
        
        Args:
            user_id (int): User ID
            data (dict): Updated user data
        
        Returns:
            tuple: (user, error)
        """
        try:
            user = User.query.filter_by(user_id=user_id, is_active=True).first()
            if not user:
                return None, {'message': 'User not found'}
            
            # Validate update data
            is_valid, errors = validate_user_data(data, is_update=True)
            if not is_valid:
                return None, {'message': 'Validation failed', 'errors': errors}
            
            # Check email uniqueness if email is being updated
            if 'email' in data and data['email'] != user.email:
                existing_user = User.query.filter_by(email=data['email']).first()
                if existing_user:
                    return None, {'message': 'Email already in use'}
            
            # Update fields
            if 'name' in data:
                user.name = data['name']
            if 'phone' in data:
                user.phone = data['phone']
            if 'email' in data:
                user.email = data['email']
            if 'address' in data:
                user.address = data['address']
            if 'role' in data:
                user.role = data['role']
            if 'password' in data:
                user.set_password(data['password'])
            
            user.save()
            current_app.logger.info(f'User updated successfully: {user.email}')
            return user, None
            
        except IntegrityError as e:
            db.session.rollback()
            current_app.logger.error(f'Database integrity error: {str(e)}')
            return None, {'message': 'Email already in use'}
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'Error updating user: {str(e)}')
            return None, {'message': 'Failed to update user', 'error': str(e)}
    
    @staticmethod
    def delete_user(user_id):
        """
        Soft delete a user (deactivate)
        
        Args:
            user_id (int): User ID
        
        Returns:
            tuple: (success, error)
        """
        try:
            user = User.query.filter_by(user_id=user_id).first()
            if not user:
                return False, {'message': 'User not found'}
            
            user.is_active = False
            user.save()
            current_app.logger.info(f'User deactivated successfully: {user.email}')
            return True, None
            
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'Error deleting user: {str(e)}')
            return False, {'message': 'Failed to delete user', 'error': str(e)}
    
    @staticmethod
    def authenticate_user(email, password):
        """
        Authenticate user with email and password
        
        Args:
            email (str): User email
            password (str): User password
        
        Returns:
            tuple: (user, error)
        """
        try:
            user = User.query.filter_by(email=email, is_active=True).first()
            
            if not user or not user.check_password(password):
                return None, {'message': 'Invalid email or password'}
            
            current_app.logger.info(f'User authenticated successfully: {user.email}')
            return user, None
            
        except Exception as e:
            current_app.logger.error(f'Error authenticating user: {str(e)}')
            return None, {'message': 'Authentication failed', 'error': str(e)}

