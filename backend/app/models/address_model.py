"""
Address Model
"""
from app import db
from app.database.db import BaseModel


class Address(BaseModel):
    """
    Address model 
    """
    __tablename__ = 'address'

    address_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)

    district = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    longitude = db.Column(db.Numeric(9, 6), nullable=True)
    latitude = db.Column(db.Numeric(9, 6), nullable=True)

    user = db.relationship('User', backref='addresses')

    def __repr__(self):
        return f'<Address {self.address_id} user_id={self.user_id}>'

    def to_dict(self):
        return {
            'address_id': self.address_id,
            'user_id': self.user_id,
            'district': self.district,
            'city': self.city,
            'longitude': float(self.longitude) if self.longitude is not None else None,
            'latitude': float(self.latitude) if self.latitude is not None else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

