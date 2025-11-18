"""
Courier and Shipment Models
"""
from app import db
from app.database.db import BaseModel

class Payment(BaseModel):
    """
    Payment model for order payments
    
    Fields:
        payment_id: Primary key
        method: Payment method (momo, card, cash)
        status: Payment status (pending, paid, failed, refunded)
        paid_at: Timestamp when paid
    """
    __tablename__ = 'payment'
    
    payment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    shipment_id = db.Column(db.Integer, db.ForeignKey('shipment.shipment_id'), nullable=False)
    method = db.Column(db.String(150), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')
    paid_at = db.Column(db.DateTime(timezone=True), nullable=True)
    
    
    def to_dict(self):
        """
        Convert payment to dictionary
        
        Returns:
            dict: Payment data
        """
        return {
            'payment_id': self.payment_id,
            'method': self.method,
            'status': self.status,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None
        }
    
    def __repr__(self):
        return f'<Payment #{self.payment_id} - {self.status}>'
