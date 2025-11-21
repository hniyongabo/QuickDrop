from utils.database import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    """Base User model for authentication"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'customer', 'courier', or 'admin'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = db.relationship('Customer', backref='user', uselist=False, cascade='all, delete-orphan')
    courier = db.relationship('Courier', backref='user', uselist=False, cascade='all, delete-orphan')

    def set_password(self, password):
        """Hash and set the password"""
        # Use pbkdf2:sha256 for compatibility with older Python versions
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        """Verify password against hash"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Convert user to dictionary"""
        user_data = {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

        # Include related data based on role
        if self.role == 'customer' and self.customer:
            user_data['profile'] = self.customer.to_dict()
        elif self.role == 'courier' and self.courier:
            user_data['profile'] = self.courier.to_dict()

        return user_data

    def __repr__(self):
        return f'<User {self.email} ({self.role})>'
