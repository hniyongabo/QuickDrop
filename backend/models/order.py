from utils.database import db
from datetime import datetime

class Order(db.Model):
    """Order/Delivery model"""
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(20), unique=True, nullable=False, index=True)

    # Relationships
    sender_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    courier_id = db.Column(db.Integer, db.ForeignKey('couriers.id'))

    # Pickup information
    pickup_address = db.Column(db.String(200), nullable=False)
    pickup_contact_name = db.Column(db.String(100), nullable=False)
    pickup_contact_phone = db.Column(db.String(20), nullable=False)
    pickup_latitude = db.Column(db.Float)
    pickup_longitude = db.Column(db.Float)

    # Delivery information
    delivery_address = db.Column(db.String(200), nullable=False)
    delivery_contact_name = db.Column(db.String(100), nullable=False)
    delivery_contact_phone = db.Column(db.String(20), nullable=False)
    delivery_latitude = db.Column(db.Float)
    delivery_longitude = db.Column(db.Float)

    # Parcel information
    parcel_type = db.Column(db.String(50), nullable=False)  # documents, electronics, food, etc.
    parcel_description = db.Column(db.Text)
    parcel_weight = db.Column(db.Float)  # in kg
    parcel_value = db.Column(db.Float)  # estimated value in RWF

    # Delivery details
    delivery_type = db.Column(db.String(20), default='standard')  # standard, express, scheduled
    scheduled_pickup_time = db.Column(db.DateTime)
    estimated_delivery_time = db.Column(db.DateTime)
    actual_pickup_time = db.Column(db.DateTime)
    actual_delivery_time = db.Column(db.DateTime)

    # Status tracking
    status = db.Column(db.String(30), default='pending')
    # Status flow: pending -> courier_assigned -> en_route_to_pickup ->
    #              picked_up -> in_transit -> delivered -> completed
    #              (can also be: cancelled, failed)

    # Payment
    delivery_fee = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(20))  # cash, mobile_money, card
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, refunded

    # Additional information
    special_instructions = db.Column(db.Text)
    courier_notes = db.Column(db.Text)

    # Rating and feedback
    customer_rating = db.Column(db.Integer)  # 1-5 stars
    customer_feedback = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_details=True):
        """Convert order to dictionary"""
        data = {
            'id': self.id,
            'order_number': self.order_number,
            'status': self.status,
            'delivery_fee': self.delivery_fee,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat()
        }

        if include_details:
            data.update({
                'sender': self.sender.to_dict() if self.sender else None,
                'courier': self.courier.to_dict() if self.courier else None,
                'pickup_address': self.pickup_address,
                'pickup_contact_name': self.pickup_contact_name,
                'pickup_contact_phone': self.pickup_contact_phone,
                'pickup_location': {
                    'latitude': self.pickup_latitude,
                    'longitude': self.pickup_longitude
                } if self.pickup_latitude and self.pickup_longitude else None,
                'delivery_address': self.delivery_address,
                'delivery_contact_name': self.delivery_contact_name,
                'delivery_contact_phone': self.delivery_contact_phone,
                'delivery_location': {
                    'latitude': self.delivery_latitude,
                    'longitude': self.delivery_longitude
                } if self.delivery_latitude and self.delivery_longitude else None,
                'parcel_type': self.parcel_type,
                'parcel_description': self.parcel_description,
                'parcel_weight': self.parcel_weight,
                'parcel_value': self.parcel_value,
                'delivery_type': self.delivery_type,
                'scheduled_pickup_time': self.scheduled_pickup_time.isoformat() if self.scheduled_pickup_time else None,
                'estimated_delivery_time': self.estimated_delivery_time.isoformat() if self.estimated_delivery_time else None,
                'actual_pickup_time': self.actual_pickup_time.isoformat() if self.actual_pickup_time else None,
                'actual_delivery_time': self.actual_delivery_time.isoformat() if self.actual_delivery_time else None,
                'payment_method': self.payment_method,
                'special_instructions': self.special_instructions,
                'courier_notes': self.courier_notes,
                'customer_rating': self.customer_rating,
                'customer_feedback': self.customer_feedback,
                'updated_at': self.updated_at.isoformat()
            })

        return data

    def generate_order_number(self):
        """Generate a unique order number"""
        import random
        import string
        timestamp = datetime.utcnow().strftime('%y%m%d')
        random_str = ''.join(random.choices(string.digits, k=4))
        return f'QD{timestamp}{random_str}'

    def __repr__(self):
        return f'<Order {self.order_number} - {self.status}>'
