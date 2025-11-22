from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from utils.database import db
from controllers import auth_bp, profile_bp, order_bp

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app)
    db.init_app(app)
    jwt = JWTManager(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(order_bp)

    # Import models so SQLAlchemy knows about them
    with app.app_context():
        from models import User, Customer, Courier, Order

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'ok',
            'message': 'QuickDrop API is running',
            'version': '2.0.0'
        }), 200

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    print("\n" + "="*50)
    print("🚀 QuickDrop API Server Starting...")
    print("="*50)
    print("📍 Server: http://localhost:5001")
    print("📚 API Version: 2.0.0")
    print("🗄️  Database: PostgreSQL (Neon)")
    print("⚠️  Using port 5001 (port 5000 blocked by macOS AirPlay)")
    print("="*50 + "\n")
    app.run(debug=True, port=5001)
