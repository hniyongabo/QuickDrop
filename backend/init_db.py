#!/usr/bin/env python3
"""
Database initialization script for QuickDrop
Creates all tables and optionally seeds with sample data
"""

from app import create_app
from utils.database import db
from models import User, Customer, Courier, Order
from datetime import datetime, timedelta

def init_database(seed_data=False):
    """Initialize database with tables"""
    app = create_app()

    with app.app_context():
        print("\n" + "="*50)
        print("🗄️  Database Initialization")
        print("="*50)

        # Drop all tables (use with caution!)
        print("\n⚠️  Dropping existing tables...")
        db.drop_all()

        # Create all tables
        print("📝 Creating new tables...")
        db.create_all()

        print("\n✅ Tables created successfully:")
        print("   - users")
        print("   - customers")
        print("   - couriers")
        print("   - orders")

        if seed_data:
            print("\n🌱 Seeding sample data...")
            seed_sample_data()

        print("\n" + "="*50)
        print("✨ Database initialization complete!")
        print("="*50 + "\n")

def seed_sample_data():
    """Seed database with sample data for testing"""

    # Create sample customer
    customer_user = User(email='customer@test.com', role='customer')
    customer_user.set_password('password123')
    db.session.add(customer_user)
    db.session.flush()

    customer = Customer(
        user_id=customer_user.id,
        name='John Doe',
        phone='+250 788 123 456',
        address='KG 9 Ave, Kigali',
        city='Kigali'
    )
    db.session.add(customer)

    # Create sample courier
    courier_user = User(email='courier@test.com', role='courier')
    courier_user.set_password('password123')
    db.session.add(courier_user)
    db.session.flush()

    courier = Courier(
        user_id=courier_user.id,
        name='Didier Mukasa',
        phone='+250 788 456 789',
        address='Nyarutarama, Kigali',
        vehicle_model='Motorcycle - Yamaha',
        license_plate='RAC 123A',
        driver_license_num='DL987654',
        id_card_num='1199012345678901',
        experience=3,
        motivation='I love helping people and earning extra income',
        is_verified=True,
        is_available=True,
        rating=4.8,
        total_deliveries=150
    )
    db.session.add(courier)
    db.session.flush()

    # Create sample admin
    admin_user = User(email='admin@quickdrop.rw', role='admin')
    admin_user.set_password('admin123')
    db.session.add(admin_user)

    # Create sample orders
    order1 = Order(
        sender_id=customer.id,
        courier_id=courier.id,
        order_number='QD' + datetime.utcnow().strftime('%y%m%d') + '1001',
        pickup_address='MTN Centre, KG 9 Ave, Nyarugenge',
        pickup_contact_name='John Doe',
        pickup_contact_phone='+250 788 123 456',
        delivery_address='Gisozi Sector, Gasabo',
        delivery_contact_name='Ange Kabera',
        delivery_contact_phone='+250 788 999 888',
        parcel_type='documents',
        parcel_description='Important business documents',
        delivery_fee=2000,
        payment_method='mobile_money',
        payment_status='paid',
        status='in_transit',
        estimated_delivery_time=datetime.utcnow() + timedelta(minutes=20),
        actual_pickup_time=datetime.utcnow() - timedelta(minutes=10)
    )
    db.session.add(order1)

    order2 = Order(
        sender_id=customer.id,
        order_number='QD' + datetime.utcnow().strftime('%y%m%d') + '1002',
        pickup_address='Kigali Heights, KN 4 Ave',
        pickup_contact_name='John Doe',
        pickup_contact_phone='+250 788 123 456',
        delivery_address='Kimironko Market',
        delivery_contact_name='Marie Claire',
        delivery_contact_phone='+250 788 777 666',
        parcel_type='food',
        parcel_description='Restaurant delivery',
        delivery_fee=1500,
        payment_method='cash',
        payment_status='pending',
        status='pending',
        estimated_delivery_time=datetime.utcnow() + timedelta(hours=1)
    )
    db.session.add(order2)

    db.session.commit()

    print("\n   ✓ Sample customer created (customer@test.com)")
    print("   ✓ Sample courier created (courier@test.com)")
    print("   ✓ Sample admin created (admin@quickdrop.rw)")
    print("   ✓ Sample orders created")
    print("\n   All passwords: password123 (admin123 for admin)")

if __name__ == '__main__':
    import sys

    seed = '--seed' in sys.argv or '-s' in sys.argv
    force = '--force' in sys.argv or '-f' in sys.argv

    if '--help' in sys.argv or '-h' in sys.argv:
        print("\nQuickDrop Database Initialization")
        print("\nUsage:")
        print("  python init_db.py           - Initialize database only")
        print("  python init_db.py --seed    - Initialize and seed with sample data")
        print("  python init_db.py -s        - Short form of --seed")
        print("  python init_db.py --force   - Skip confirmation prompt")
        print()
        sys.exit(0)

    if seed and not force:
        confirm = input("\n⚠️  This will DELETE all existing data and create sample data. Continue? (yes/no): ")
        if confirm.lower() != 'yes':
            print("\n❌ Operation cancelled.")
            sys.exit(0)

    init_database(seed_data=seed)
