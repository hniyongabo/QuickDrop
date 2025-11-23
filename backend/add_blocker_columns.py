#!/usr/bin/env python3
"""
Migration script to add blocker columns to orders table
"""

from flask import Flask
from config import Config
from utils.database import db
from sqlalchemy import text

def add_blocker_columns():
    """Add blocker_title, blocker_notes, and blocker_reported_at columns to orders table"""

    # Create minimal app
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        print("\n" + "="*50)
        print("🔧 Adding Blocker Columns Migration")
        print("="*50)

        try:
            # Check if columns already exist
            result = db.session.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name='orders' AND column_name IN ('blocker_title', 'blocker_notes', 'blocker_reported_at')
            """))
            existing_columns = [row[0] for row in result]

            if 'blocker_title' in existing_columns:
                print("✓ Columns already exist, skipping migration")
                return

            print("\n📝 Adding blocker columns to orders table...")

            # Add blocker_title column
            db.session.execute(text("""
                ALTER TABLE orders
                ADD COLUMN IF NOT EXISTS blocker_title VARCHAR(200)
            """))
            print("  ✓ Added blocker_title column")

            # Add blocker_notes column
            db.session.execute(text("""
                ALTER TABLE orders
                ADD COLUMN IF NOT EXISTS blocker_notes TEXT
            """))
            print("  ✓ Added blocker_notes column")

            # Add blocker_reported_at column
            db.session.execute(text("""
                ALTER TABLE orders
                ADD COLUMN IF NOT EXISTS blocker_reported_at TIMESTAMP
            """))
            print("  ✓ Added blocker_reported_at column")

            db.session.commit()

            print("\n" + "="*50)
            print("✅ Migration completed successfully!")
            print("="*50 + "\n")

        except Exception as e:
            print(f"\n❌ Error during migration: {e}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    add_blocker_columns()
