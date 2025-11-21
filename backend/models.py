from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'customer', 'courier', or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Courier-specific fields
    vehicle_model = db.Column(db.String(100))
    license_plate = db.Column(db.String(50))
    driver_license_num = db.Column(db.String(50))
    id_card_num = db.Column(db.String(50))
    experience = db.Column(db.Integer)
    motivation = db.Column(db.Text)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        user_data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

        # Include courier-specific fields if user is a courier
        if self.role == 'courier':
            user_data.update({
                'vehicle_model': self.vehicle_model,
                'license_plate': self.license_plate,
                'driver_license_num': self.driver_license_num,
                'id_card_num': self.id_card_num,
                'experience': self.experience,
                'motivation': self.motivation
            })

        return user_data
