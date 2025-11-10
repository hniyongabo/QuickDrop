"""
Test script to verify authentication functionality
"""
import bcrypt

def test_bcrypt():
    """Test bcrypt password hashing"""
    print("Testing bcrypt password hashing...")

    # Test password
    password = "SecurePass123"
    print(f"Original password: {password}")

    # Hash password
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    print(f"Hashed password: {hashed.decode('utf-8')}")

    # Verify correct password
    is_correct = bcrypt.checkpw(password_bytes, hashed)
    print(f"Correct password verification: {is_correct}")
    assert is_correct, "Correct password should verify"

    # Verify wrong password
    wrong_password = "WrongPassword"
    is_wrong = bcrypt.checkpw(wrong_password.encode('utf-8'), hashed)
    print(f"Wrong password verification: {is_wrong}")
    assert not is_wrong, "Wrong password should not verify"

    print("✓ Bcrypt test passed!\n")

def test_jwt_config():
    """Test JWT configuration"""
    print("Testing JWT configuration...")
    from app import create_app

    app = create_app('development')

    with app.app_context():
        # Check JWT config
        assert app.config['JWT_SECRET_KEY'], "JWT_SECRET_KEY should be set"
        assert app.config['JWT_ACCESS_TOKEN_EXPIRES'], "JWT expiration should be set"
        print(f"JWT Secret Key: {'*' * 20} (hidden)")
        print(f"JWT Access Token Expiration: {app.config['JWT_ACCESS_TOKEN_EXPIRES']}")
        print("✓ JWT configuration test passed!\n")

def test_database_config():
    """Test database configuration"""
    print("Testing database configuration...")
    from app import create_app, db

    app = create_app('development')

    with app.app_context():
        # Check database config
        assert app.config['SQLALCHEMY_DATABASE_URI'], "Database URI should be set"
        print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI'].split('@')[0]}@***")
        print("✓ Database configuration test passed!\n")

def test_user_model():
    """Test User model"""
    print("Testing User model...")
    from app import create_app, db
    from app.modules.user.models import User

    app = create_app('development')

    with app.app_context():
        # Create test user instance (not saved)
        user = User(
            name="Test User",
            email="test@example.com",
            phone="+1234567890",
            role="user"
        )
        user.set_password("TestPass123")

        # Test password verification
        assert user.check_password("TestPass123"), "Password should verify"
        assert not user.check_password("WrongPass"), "Wrong password should not verify"

        # Test to_dict
        user_dict = user.to_dict()
        assert 'email' in user_dict, "to_dict should include email"
        assert 'password_hash' not in user_dict, "to_dict should not include password_hash by default"

        print("✓ User model test passed!\n")

if __name__ == '__main__':
    print("=" * 60)
    print("QuickDrop Authentication System Tests")
    print("=" * 60)
    print()

    try:
        test_bcrypt()
        test_jwt_config()
        test_database_config()
        test_user_model()

        print("=" * 60)
        print("✅ All tests passed successfully!")
        print("=" * 60)

    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
