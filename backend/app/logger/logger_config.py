"""
Logging configuration for QuickDrop Backend
"""
import logging
import os
from logging.handlers import RotatingFileHandler
from datetime import datetime


def setup_logger(app):
    """
    Configure logging for the application
    
    Args:
        app: Flask application instance
    """
    # Create logs directory if it doesn't exist
    log_dir = os.path.dirname(app.config['LOG_FILE'])
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Set log level
    log_level = getattr(logging, app.config['LOG_LEVEL'].upper(), logging.INFO)
    app.logger.setLevel(log_level)
    
    # Remove default handlers
    app.logger.handlers.clear()
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s (%(pathname)s:%(lineno)d): %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # File handler for application logs (rotating)
    file_handler = RotatingFileHandler(
        app.config['LOG_FILE'],
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(detailed_formatter)
    app.logger.addHandler(file_handler)
    
    # File handler for error logs
    error_log_file = os.path.join(log_dir, 'error.log')
    error_handler = RotatingFileHandler(
        error_log_file,
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    app.logger.addHandler(error_handler)
    
    # Console handler for development
    if app.config['DEBUG']:
        console_handler = logging.StreamHandler()
        console_handler.setLevel(log_level)
        console_handler.setFormatter(simple_formatter)
        app.logger.addHandler(console_handler)
    
    # Log application startup
    app.logger.info('='*80)
    app.logger.info(f'QuickDrop Backend starting at {datetime.now()}')
    app.logger.info(f'Environment: {app.config.get("ENV", "development")}')
    app.logger.info(f'Debug mode: {app.config["DEBUG"]}')
    app.logger.info('='*80)


def get_logger(name):
    """
    Get a logger instance with the specified name
    
    Args:
        name (str): Logger name
    
    Returns:
        logging.Logger: Configured logger instance
    """
    return logging.getLogger(name)

