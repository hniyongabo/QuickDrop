"""
Courier Model
"""
from app import db
from app.database.db import BaseModel


class Courier(BaseModel):
    """
    Courier model representing a courier/driver in the system

    Fields:
        courier_id: Primary key
        user_id: FK to users.user_id (one-to-one)
        vehicle_plate: Vehicle plate number
        online: Whether the courier is online
        last_seen: Last heartbeat timestamp
        current_latitude/current_longitude: Last known coordinates
        current_address: Human-readable last known address
    """
    __tablename__ = 'courier'

    courier_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    user = db.relationship('User', backref='courier')

    vehicle_plate = db.Column(db.String(10), nullable=True)
    online = db.Column(db.Boolean, nullable=False, default=False)
    last_seen = db.Column(db.DateTime, nullable=True)

    current_latitude = db.Column(db.Numeric(9, 6), nullable=True)
    current_longitude = db.Column(db.Numeric(9, 6), nullable=True)
    current_address = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<Courier {self.courier_id} - {self.user.email if self.user else "unassigned"}>'

    def to_dict(self, include_user: bool = True):
        """
        Convert courier object to dictionary

        Args:
            include_user (bool): Whether to include nested user details

        Returns:
            dict: Courier data as dictionary
        """
        data = {
            'courier_id': self.courier_id,
            'user_id': self.user_id,
            'vehicle_plate': self.vehicle_plate,
            'online': self.online,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'current_location': {
                'latitude': float(self.current_latitude) if self.current_latitude is not None else None,
                'longitude': float(self.current_longitude) if self.current_longitude is not None else None,
                'address': self.current_address,
            },
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_user and self.user:
            data['user'] = self.user.to_dict()

        return data


