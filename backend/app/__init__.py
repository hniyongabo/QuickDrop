"""
Flask Application Factory
"""
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flasgger import Swagger

from config import config
from app.logger.logger_config import setup_logger

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_name='development'):
    """
    Application factory pattern
    
    Args:
        config_name (str): Configuration environment (development, production, testing)
    
    Returns:
        Flask: Configured Flask application
    """
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)
    
    # Swagger configuration with JWT support
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs/"
    }
    
    # Swagger template - host is omitted to use relative URLs (works with any port)
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "QuickDrop API",
            "description": "API Documentation for QuickDrop Delivery System",
            "version": "1.0.0",
            "contact": {
                "name": "QuickDrop Team",
                "email": "support@quickdrop.com"
            }
        },
        "basePath": "/",
        "schemes": ["http", "https"],
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
            }
        },
        "security": [
            {
                "Bearer": []
            }
        ],
        "tags": [
            {
                "name": "Authentication",
                "description": "User authentication and authorization"
            },
            {
                "name": "Users",
                "description": "User management operations"
            },
            {
                "name": "Courier",
                "description": "Courier/Driver operations and delivery management"
            },
            {
                "name": "Health",
                "description": "Health check endpoints"
            }
        ]
    }
    
    Swagger(app, config=swagger_config, template=swagger_template)
    
    # Setup logging
    setup_logger(app)

    # Import models to ensure they're registered with SQLAlchemy
    with app.app_context():
        from app.models.user_model import User
        from app.models.admin_model import Admin
        from app.models.courier_model import Courier
        from app.models.shipment_model import Shipment
        from app.models.delivery_model import Payment

    # Register blueprints
    from app.routes.user_route import user_bp
    from app.routes.admin_route import admin_bp
    from app.routes.courier_route import courier_bp
    from app.routes.shipment_route import shipment_bp
    app.register_blueprint(user_bp, url_prefix='/api/v1/users')
    app.register_blueprint(admin_bp, url_prefix='/api/v1/admin')
    app.register_blueprint(courier_bp, url_prefix='/api/v1/couriers')
    app.register_blueprint(shipment_bp, url_prefix='/api/v1/shipments')

    # Error handlers
    register_error_handlers(app)
    register_jwt_handlers(app)
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        """
        Health check endpoint
        ---
        tags:
          - Health
        responses:
          200:
            description: Service is healthy
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: healthy
                service:
                  type: string
                  example: QuickDrop Backend
        """
        return jsonify({
            'status': 'healthy',
            'service': 'QuickDrop Backend'
        }), 200
    
    # API info endpoint
    @app.route('/api/info', methods=['GET'])
    def api_info():
        """
        API information endpoint
        ---
        tags:
          - Health
        responses:
          200:
            description: API information
            schema:
              type: object
              properties:
                name:
                  type: string
                version:
                  type: string
                endpoints:
                  type: object
        """
        return jsonify({
            'name': 'QuickDrop API',
            'version': '1.0.0',
            'endpoints': {
                'users': '/api/v1/users',
                'courier': '/api/v1/courier',
                'documentation': '/apidocs',
                'health': '/health'
            }
        }), 200
    
    return app


def register_error_handlers(app):
    """Register error handlers"""

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Resource not found',
            'message': str(error)
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Internal server error: {error}')
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'error': 'Bad request',
            'message': str(error)
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'error': 'Unauthorized',
            'message': 'Authentication required'
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'error': 'Forbidden',
            'message': 'You do not have permission to access this resource'
        }), 403


def register_jwt_handlers(app):
    """Register JWT error handlers for better error messages"""

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'error': 'Token expired',
            'message': 'The token has expired. Please login again.'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'error': 'Invalid token',
            'message': 'Signature verification failed or token is malformed.'
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'success': False,
            'error': 'Authorization required',
            'message': 'Request does not contain an access token.'
        }), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'error': 'Token revoked',
            'message': 'The token has been revoked.'
        }), 401

