"""
Database Initialization Script
Creates all database tables based on defined models
"""
import os
import sys
from app import create_app, db

def init_database():
    """Initialize the database and create all tables"""
    print("=" * 80)
    print("QuickDrop Database Initialization")
    print("=" * 80)

    # Get environment
    env = os.getenv('FLASK_ENV', 'development')
    print(f"\nEnvironment: {env}")

    # Create app
    print("Creating Flask application...")
    app = create_app(env)

    # Create tables
    with app.app_context():
        try:
            print("\nCreating database tables...")

            # Import all models to ensure they're registered
            from app.modules.user.models import User

            # Create all tables
            db.create_all()

            print("\n✓ Database tables created successfully!")

            # Display created tables
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()

            print(f"\nCreated tables ({len(tables)}):")
            for table in tables:
                print(f"  - {table}")

            print("\n" + "=" * 80)
            print("Database initialization completed successfully!")
            print("=" * 80)

            return True

        except Exception as e:
            print(f"\n✗ Error creating database tables: {str(e)}")
            print("\nPlease ensure:")
            print("  1. PostgreSQL is running")
            print("  2. Database exists and credentials are correct in .env")
            print("  3. All dependencies are installed (pip install -r requirements.txt)")
            sys.exit(1)

if __name__ == '__main__':
    init_database()
