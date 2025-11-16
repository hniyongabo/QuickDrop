"""
Database utilities and base model
"""
from datetime import datetime
from app import db


class BaseModel(db.Model):
    """
    Base model class with common fields and methods
    """
    __abstract__ = True
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def save(self):
        """Save instance to database"""
        try:
            db.session.add(self)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
    
    def delete(self):
        """Delete instance from database"""
        try:
            db.session.delete(self)
            db.session.commit()
            return True
        except Exception as e:w
            db.session.rollback()
            raise e
    
    def update(self, **kwargs):
        """Update instance with provided key-value pairs"""
        try:
            for key, value in kwargs.items():
                if hasattr(self, key):
                    setattr(self, key, value)
            self.updated_at = datetime.utcnow()
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
    
    def to_dict(self):
        """Convert model instance to dictionary"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }


def init_db(app):
    """Initialize database with app context"""
    with app.app_context():
        db.create_all()

