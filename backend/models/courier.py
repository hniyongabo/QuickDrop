from utils.database import db
from datetime import datetime

class Courier(db.Model):
    """Courier profile model with verification details"""
    __tablename__ = 'couriers'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)

    # Personal information
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200), nullable=False)

    # Vehicle information
    vehicle_model = db.Column(db.String(100), nullable=False)
    license_plate = db.Column(db.String(50), nullable=False, unique=True)

    # Verification documents
    driver_license_num = db.Column(db.String(50), nullable=False, unique=True)
    driver_license_photo_url = db.Column(db.String(255))
    id_card_num = db.Column(db.String(50), nullable=False, unique=True)
    id_card_photo_url = db.Column(db.String(255))

    # Experience and motivation
    experience = db.Column(db.Integer, default=0)  # years of delivery experience
    motivation = db.Column(db.Text)

    # Verification status
    is_verified = db.Column(db.Boolean, default=False)
    verification_date = db.Column(db.DateTime)

    # Availability and ratings
    is_available = db.Column(db.Boolean, default=True)
    rating = db.Column(db.Float, default=0.0)
    total_deliveries = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders = db.relationship('Order', foreign_keys='Order.courier_id', backref='courier', lazy='dynamic')

    def to_dict(self, include_sensitive=False):
        """Convert courier to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'phone': self.phone,
            'address': self.address,
            'vehicle_model': self.vehicle_model,
            'license_plate': self.license_plate,
            'experience': self.experience,
            'is_verified': self.is_verified,
            'is_available': self.is_available,
            'rating': self.rating,
            'total_deliveries': self.total_deliveries,
            'created_at': self.created_at.isoformat()
        }

        # Include sensitive information only when needed (e.g., for admin or own profile)
        if include_sensitive:
            data.update({
                'driver_license_num': self.driver_license_num,
                'driver_license_photo_url': self.driver_license_photo_url,
                'id_card_num': self.id_card_num,
                'id_card_photo_url': self.id_card_photo_url,
                'motivation': self.motivation,
                'verification_date': self.verification_date.isoformat() if self.verification_date else None
            })

        return data

    def __repr__(self):
        return f'<Courier {self.name} ({self.license_plate})>'
