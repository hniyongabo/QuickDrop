"""
Customer Model
"""
from app import db
from app.database.db import BaseModel


class Customer(BaseModel):
    """
    Customer model 
    """
    __tablename__ = 'customer'

    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)

    # Relationship to user (optional access)
    user = db.relationship('User', backref='customer', uselist=False)

    def __repr__(self):
        return f'<Customer {self.customer_id} user_id={self.user_id}>'

    def to_dict(self):
        return {
            'customer_id': self.customer_id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

