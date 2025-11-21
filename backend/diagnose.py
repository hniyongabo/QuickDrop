#!/usr/bin/env python3
"""
Diagnostic script to check QuickDrop backend status
"""

import requests
import sys

def check_health():
    """Check if backend is responding"""
    try:
        response = requests.get('http://localhost:5000/api/health', timeout=2)
        print(f"✅ Backend is running on port 5000")
        print(f"   Status: {response.status_code}")
        try:
            data = response.json()
            print(f"   Version: {data.get('version', 'Unknown')}")
            print(f"   Message: {data.get('message', 'Unknown')}")

            if data.get('version') == '2.0.0':
                print("\n✅ New backend (v2.0) is running - CORRECT!")
            else:
                print("\n⚠️  Old backend might be running. Expected version 2.0.0")
        except:
            print("   Response is not JSON")
        return True
    except requests.exceptions.ConnectionError:
        print(f"❌ Backend is NOT running on port 5000")
        return False
    except Exception as e:
        print(f"❌ Error checking backend: {e}")
        return False

def test_signup():
    """Test signup endpoint"""
    print("\n📝 Testing signup endpoint...")
    try:
        response = requests.post('http://localhost:5000/api/signup',
            json={
                "email": "diagnostic@test.com",
                "password": "test123",
                "role": "customer",
                "name": "Diagnostic Test",
                "phone": "+250788000000",
                "address": "Test Address"
            },
            timeout=5
        )

        print(f"   Status: {response.status_code}")

        if response.status_code == 201:
            print("   ✅ Signup endpoint works!")
        elif response.status_code == 400:
            try:
                error = response.json()
                if 'already registered' in error.get('error', '').lower():
                    print("   ✅ Signup endpoint works (email already exists)")
                else:
                    print(f"   ⚠️  Signup validation error: {error.get('error')}")
            except:
                print(f"   ⚠️  Response: {response.text}")
        elif response.status_code == 500:
            print("   ❌ Server error - likely database issue")
            try:
                error = response.json()
                print(f"   Error: {error.get('error')}")
            except:
                print(f"   Response: {response.text}")
        else:
            print(f"   ⚠️  Unexpected status: {response.status_code}")
            print(f"   Response: {response.text}")

    except requests.exceptions.ConnectionError:
        print("   ❌ Cannot connect to backend")
    except Exception as e:
        print(f"   ❌ Error: {e}")

def check_database():
    """Check if database tables exist"""
    print("\n🗄️  Checking database...")
    try:
        from app import create_app
        from utils.database import db
        from models import User, Customer, Courier, Order

        app = create_app()
        with app.app_context():
            # Try to query tables
            user_count = User.query.count()
            customer_count = Customer.query.count()
            courier_count = Courier.query.count()
            order_count = Order.query.count()

            print(f"   ✅ Database connected successfully")
            print(f"   📊 Tables found:")
            print(f"      - Users: {user_count}")
            print(f"      - Customers: {customer_count}")
            print(f"      - Couriers: {courier_count}")
            print(f"      - Orders: {order_count}")

            if user_count == 0:
                print("\n   💡 Tip: Run 'python init_db.py --seed' to add sample data")

    except ImportError as e:
        print(f"   ❌ Import error: {e}")
        print("   💡 Make sure you're in the backend directory")
    except Exception as e:
        print(f"   ❌ Database error: {e}")
        print("   💡 Run 'python init_db.py' to create tables")

def main():
    print("="*60)
    print("🔍 QuickDrop Backend Diagnostic")
    print("="*60)

    # Check 1: Is backend running?
    if not check_health():
        print("\n💡 Backend is not running. Start it with:")
        print("   cd backend")
        print("   python app.py")
        sys.exit(1)

    # Check 2: Test signup
    test_signup()

    # Check 3: Database check
    check_database()

    print("\n" + "="*60)
    print("🎯 Diagnosis Complete")
    print("="*60)

    print("\n📋 Next Steps:")
    print("1. If backend is not running: python app.py")
    print("2. If database errors: python init_db.py --seed")
    print("3. If still issues: Check browser console for details")

if __name__ == '__main__':
    main()
