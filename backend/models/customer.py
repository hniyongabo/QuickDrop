from utils.database import db
from datetime import datetime

class Customer(db.Model):
    """Customer profile model"""
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)

    # Personal information
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200), nullable=False)

    # Optional fields
    secondary_phone = db.Column(db.String(20))
    city = db.Column(db.String(50))
    country = db.Column(db.String(50), default='Rwanda')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders_as_sender = db.relationship('Order', foreign_keys='Order.sender_id', backref='sender', lazy='dynamic')

    def to_dict(self):
        """Convert customer to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'phone': self.phone,
            'address': self.address,
            'secondary_phone': self.secondary_phone,
            'city': self.city,
            'country': self.country,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<Customer {self.name}>'
