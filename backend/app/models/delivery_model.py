"""
Courier and Shipment Models
"""
from app import db
from app.database.db import BaseModel


class Courier(BaseModel):
    """
    Courier model representing a delivery driver
    
    Fields:
        courier_id: Primary key
        name: Courier's full name
        vehicle_plate: Vehicle registration plate
        phone: Contact phone number
        status: Courier status (active, inactive, banned, offshift)
    """
    __tablename__ = 'courier'
    __table_args__ = {'schema': 'quickdrop'}
    
    courier_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    vehicle_plate = db.Column(db.String(15), nullable=True)
    phone = db.Column(db.String(25), unique=True, nullable=True)
    status = db.Column(db.String(50), nullable=False, default='inactive')
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())
    
    # Relationships
    shipments = db.relationship('Shipment', back_populates='courier', lazy='dynamic')
    
    def to_dict(self):
        """
        Convert courier object to dictionary
        
        Returns:
            dict: Courier data as dictionary
        """
        return {
            'courier_id': self.courier_id,
            'name': self.name,
            'vehicle_plate': self.vehicle_plate,
            'phone': self.phone,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Courier {self.name} - {self.status}>'


class Order(BaseModel):
    """
    Order model representing a customer order
    
    Fields:
        order_id: Primary key
        user_id: Reference to user (customer)
        dropoff_address_id: Delivery address
        pickup_address_id: Pickup address
        status: Order status (created, assigned, picked_up, delivered, cancelled)
        total_amount: Total order amount
    """
    __tablename__ = 'order'
    __table_args__ = {'schema': 'quickdrop'}
    
    order_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('quickdrop.user.user_id', ondelete='RESTRICT'), nullable=False)
    dropoff_address_id = db.Column(db.Integer, db.ForeignKey('quickdrop.address.address_id', ondelete='SET NULL'), nullable=True)
    pickup_address_id = db.Column(db.Integer, db.ForeignKey('quickdrop.address.address_id', ondelete='SET NULL'), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='created', index=True)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='orders')
    dropoff_address = db.relationship('Address', foreign_keys=[dropoff_address_id])
    pickup_address = db.relationship('Address', foreign_keys=[pickup_address_id])
    shipment = db.relationship('Shipment', back_populates='order', uselist=False)
    payment = db.relationship('Payment', back_populates='order', uselist=False)
    order_items = db.relationship('OrderItem', back_populates='order', lazy='dynamic')
    
    def to_dict(self):
        """
        Convert order object to dictionary
        
        Returns:
            dict: Order data as dictionary
        """
        return {
            'order_id': self.order_id,
            'user_id': self.user_id,
            'dropoff_address_id': self.dropoff_address_id,
            'pickup_address_id': self.pickup_address_id,
            'status': self.status,
            'total_amount': float(self.total_amount) if self.total_amount else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def to_dict_detailed(self):
        """
        Convert order to dictionary with related details
        
        Returns:
            dict: Detailed order data
        """
        data = self.to_dict()
        
        if self.user:
            data['customer'] = {
                'name': self.user.username,
                'email': self.user.email,
                'phone': self.user.phone_number
            }
        
        if self.dropoff_address:
            data['dropoff_location'] = {
                'district': self.dropoff_address.district,
                'city': self.dropoff_address.city,
                'latitude': float(self.dropoff_address.latitude) if self.dropoff_address.latitude else None,
                'longitude': float(self.dropoff_address.longitude) if self.dropoff_address.longitude else None
            }
        
        if self.pickup_address:
            data['pickup_location'] = {
                'district': self.pickup_address.district,
                'city': self.pickup_address.city,
                'latitude': float(self.pickup_address.latitude) if self.pickup_address.latitude else None,
                'longitude': float(self.pickup_address.longitude) if self.pickup_address.longitude else None
            }
        
        return data
    
    def __repr__(self):
        return f'<Order #{self.order_id} - {self.status}>'


class Shipment(BaseModel):
    """
    Shipment model representing delivery/shipment details
    
    Fields:
        shipment_id: Primary key
        order_id: Reference to order
        picked_at: Timestamp when package was picked up
        courier_id: Reference to courier
        delivered_at: Timestamp when delivered
        status: Shipment status (unassigned, assigned, picked_up, in_transit, delivered, failed)
    """
    __tablename__ = 'shipment'
    __table_args__ = {'schema': 'quickdrop'}
    
    shipment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('quickdrop.order.order_id', ondelete='CASCADE'), nullable=False, index=True)
    picked_at = db.Column(db.DateTime(timezone=True), nullable=True)
    courier_id = db.Column(db.Integer, db.ForeignKey('quickdrop.courier.courier_id', ondelete='SET NULL'), nullable=True, index=True)
    delivered_at = db.Column(db.DateTime(timezone=True), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='unassigned')
    
    # Relationships
    order = db.relationship('Order', back_populates='shipment')
    courier = db.relationship('Courier', back_populates='shipments')
    
    def to_dict(self):
        """
        Convert shipment object to dictionary
        
        Returns:
            dict: Shipment data as dictionary
        """
        return {
            'shipment_id': self.shipment_id,
            'order_id': self.order_id,
            'picked_at': self.picked_at.isoformat() if self.picked_at else None,
            'courier_id': self.courier_id,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'status': self.status
        }
    
    def to_dict_detailed(self):
        """
        Convert shipment to dictionary with order and courier details
        
        Returns:
            dict: Detailed shipment data
        """
        data = self.to_dict()
        
        if self.order:
            data['order'] = self.order.to_dict_detailed()
        
        if self.courier:
            data['courier'] = self.courier.to_dict()
        
        return data
    
    def __repr__(self):
        return f'<Shipment #{self.shipment_id} - {self.status}>'


class Address(BaseModel):
    """
    Address model for storing location details
    
    Fields:
        address_id: Primary key
        user_id: Reference to user
        district: District name
        city: City name
        longitude: GPS longitude
        latitude: GPS latitude
    """
    __tablename__ = 'address'
    __table_args__ = {'schema': 'quickdrop'}
    
    address_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('quickdrop.user.user_id', ondelete='CASCADE'), nullable=True, index=True)
    district = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    longitude = db.Column(db.Numeric(9, 6), nullable=True)
    latitude = db.Column(db.Numeric(9, 6), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())
    
    # Relationships
    user = db.relationship('User', backref='addresses')
    
    def to_dict(self):
        """
        Convert address to dictionary
        
        Returns:
            dict: Address data
        """
        return {
            'address_id': self.address_id,
            'user_id': self.user_id,
            'district': self.district,
            'city': self.city,
            'longitude': float(self.longitude) if self.longitude else None,
            'latitude': float(self.latitude) if self.latitude else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Address {self.district}, {self.city}>'


class User(BaseModel):
    """
    User model (extending/matching existing schema)
    
    Fields:
        user_id: Primary key
        username: Unique username
        role: User role (CUSTOMER, DISPATCHER, ADMIN)
        address: Text address
        email: Email address
        phone_number: Phone number
    """
    __tablename__ = 'user'
    __table_args__ = {'schema': 'quickdrop'}
    
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    role = db.Column(db.String(50), nullable=False, index=True)
    address = db.Column(db.String(150), nullable=True)
    email = db.Column(db.String(150), nullable=False, unique=True)
    phone_number = db.Column(db.String(25), nullable=False, unique=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())
    
    def to_dict(self):
        """
        Convert user to dictionary
        
        Returns:
            dict: User data
        """
        return {
            'user_id': self.user_id,
            'username': self.username,
            'role': self.role,
            'address': self.address,
            'email': self.email,
            'phone_number': self.phone_number,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<User {self.username}>'


class Payment(BaseModel):
    """
    Payment model for order payments
    
    Fields:
        payment_id: Primary key
        order_id: Reference to order
        method: Payment method (momo, card, cash)
        status: Payment status (pending, paid, failed, refunded)
        paid_at: Timestamp when paid
    """
    __tablename__ = 'payment'
    __table_args__ = {'schema': 'quickdrop'}
    
    payment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('quickdrop.order.order_id', ondelete='CASCADE'), nullable=False, index=True)
    method = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')
    paid_at = db.Column(db.DateTime(timezone=True), nullable=True)
    
    # Relationships
    order = db.relationship('Order', back_populates='payment')
    
    def to_dict(self):
        """
        Convert payment to dictionary
        
        Returns:
            dict: Payment data
        """
        return {
            'payment_id': self.payment_id,
            'order_id': self.order_id,
            'method': self.method,
            'status': self.status,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None
        }
    
    def __repr__(self):
        return f'<Payment #{self.payment_id} - {self.status}>'


class OrderItem(BaseModel):
    """
    OrderItem model for items in an order
    
    Fields:
        order_item_id: Primary key
        quantity: Quantity ordered
        order_id: Reference to order
        product_id: Reference to product
        unit_price: Price per unit
    """
    __tablename__ = 'order_item'
    __table_args__ = {'schema': 'quickdrop'}
    
    order_item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quantity = db.Column(db.Integer, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('quickdrop.order.order_id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('quickdrop.product.product_id', ondelete='RESTRICT'), nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Relationships
    order = db.relationship('Order', back_populates='order_items')
    
    def to_dict(self):
        """
        Convert order item to dictionary
        
        Returns:
            dict: Order item data
        """
        return {
            'order_item_id': self.order_item_id,
            'quantity': self.quantity,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'unit_price': float(self.unit_price) if self.unit_price else 0
        }
    
    def __repr__(self):
        return f'<OrderItem #{self.order_item_id}>'
    