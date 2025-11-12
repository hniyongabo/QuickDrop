"""
User Model
"""
import bcrypt
from app import db
from app.database.db import BaseModel


class User(BaseModel):
    """
    User model representing a user in the system
    
    Fields:
        user_id: Primary key (UUID)
        name: User's full name
        phone: User's phone number
        email: User's email address (unique)
        password: Hashed password
        role: User role (user, admin, driver)
        address: User's address
    """
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)
    address = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    def set_password(self, password):
        """
        Hash and set user password using bcrypt

        Args:
            password (str): Plain text password
        """
        # Encode password to bytes and hash with bcrypt
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    def check_password(self, password):
        """
        Verify password using bcrypt

        Args:
            password (str): Plain text password to verify

        Returns:
            bool: True if password matches, False otherwise
        """
        # Encode password and hash to bytes for comparison
        password_bytes = password.encode('utf-8')
        password_hash_bytes = self.password_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, password_hash_bytes)
    
    def to_dict(self, include_sensitive=False):
        """
        Convert user object to dictionary
        
        Args:
            include_sensitive (bool): Whether to include sensitive fields
        
        Returns:
            dict: User data as dictionary
        """
        data = {
            'user_id': self.user_id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'role': self.role,
            'address': self.address,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_sensitive:
            data['password_hash'] = self.password_hash
        
        return data
    
    def __repr__(self):
        return f'<User {self.email}>'

