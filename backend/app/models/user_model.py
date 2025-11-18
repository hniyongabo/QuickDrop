"""
User Model
"""
import bcrypt
from app import db
from app.database.db import BaseModel


class User(BaseModel):
    """
    User model 
    """
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=True)
    username = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    phone_number = db.Column(db.String(25), unique=True, nullable=False)
    
    def set_password(self, password):
        """
        Hash and set user password using bcrypt

        Args:
            password (str): Plain text password
        """
        # Encode password to bytes and hash with bcrypt
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        self.password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
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
        password_hash_bytes = self.password.encode('utf-8')
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
            'username': self.username,
            'phone_number': self.phone_number,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_sensitive:
            data['password'] = self.password
        
        return data
    
    def __repr__(self):
        return f'<User {self.username}>'

