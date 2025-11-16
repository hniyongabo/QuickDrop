"""
Admin Model
"""
import bcrypt
from app import db
from app.database.db import BaseModel


class Admin(BaseModel):
    """
    Admin model representing an admin in the system
    
    Fields:
        user_id: Primary key (UUID)
        user: User relationship
    """
    __tablename__ = 'admin'
    
    admin_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    user = db.relationship('User', backref='admin')
    
    def __repr__(self):
        return f'<Admin {self.user.email}>'
    
    def to_dict(self):
        """
        Convert admin object to dictionary
        
        Returns:
            dict: Admin data as dictionary
        """
        return {
            'admin_id': self.admin_id,
            'user': self.user.to_dict()
        }
