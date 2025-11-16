"""
Shipment Model
"""
from app import db
from app.database.db import BaseModel


class Shipment(BaseModel):
    """
    Shipment model representing a delivery job

    Fields:
        shipment_id: Primary key
        status: Shipment status
        assigned_at, picked_at, delivered_at: Timestamps for lifecycle
        courier_id: FK to courier.courier_id (nullable until assigned)
        customer_id: Customer identifier (nullable)
        pickup_*: Pickup coordinates and address
        destination_*: Destination coordinates and address
    """
    __tablename__ = 'shipment'

    shipment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # Assignment and lifecycle
    assigned_at = db.Column(db.DateTime, nullable=True)
    picked_at = db.Column(db.DateTime, nullable=True)
    delivered_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    courier_id = db.Column(db.Integer, db.ForeignKey('courier.courier_id'), nullable=True)
    courier = db.relationship('Courier', backref='shipments')

    # We don't model Customer class here; store the id for linkage
    customer_id = db.Column(db.Integer, nullable=True)

    # Locations
    pickup_latitude = db.Column(db.Numeric(9, 6), nullable=True)
    pickup_longitude = db.Column(db.Numeric(9, 6), nullable=True)
    pickup_address = db.Column(db.Text, nullable=True)

    destination_latitude = db.Column(db.Numeric(9, 6), nullable=True)
    destination_longitude = db.Column(db.Numeric(9, 6), nullable=True)
    destination_address = db.Column(db.Text, nullable=True)

    # Status as string for portability; DB may enforce enum separately
    status = db.Column(db.String(20), nullable=False, default='unassigned', index=True)

    def __repr__(self):
        return f'<Shipment {self.shipment_id} - {self.status}>'

    def to_dict(self):
        """
        Convert shipment object to dictionary
        """
        return {
            'shipment_id': self.shipment_id,
            'status': self.status,
            'courier_id': self.courier_id,
            'customer_id': self.customer_id,
            'pickup': {
                'latitude': float(self.pickup_latitude) if self.pickup_latitude is not None else None,
                'longitude': float(self.pickup_longitude) if self.pickup_longitude is not None else None,
                'address': self.pickup_address,
            },
            'destination': {
                'latitude': float(self.destination_latitude) if self.destination_latitude is not None else None,
                'longitude': float(self.destination_longitude) if self.destination_longitude is not None else None,
                'address': self.destination_address,
            },
            'timeline': {
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
                'picked_at': self.picked_at.isoformat() if self.picked_at else None,
                'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            },
        }


