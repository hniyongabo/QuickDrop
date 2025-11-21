#!/usr/bin/env python3
"""
Simple API test script for QuickDrop backend
Run this after starting the Flask server to verify all endpoints work correctly
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*50}")
    print(f"📋 {title}")
    print(f"{'='*50}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

def test_health():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)
    return response.status_code == 200

def test_signup_customer():
    """Test customer signup"""
    data = {
        "name": "Test Customer",
        "email": "testcustomer@example.com",
        "phone": "+250 788 123 456",
        "address": "Kigali, Rwanda",
        "password": "password123",
        "role": "customer"
    }
    response = requests.post(f"{BASE_URL}/signup", json=data)
    print_response("Customer Signup", response)

    if response.status_code == 201:
        return response.json().get('access_token')
    return None

def test_signup_courier():
    """Test courier signup with all fields"""
    data = {
        "name": "Test Courier",
        "email": "testcourier@example.com",
        "phone": "+250 788 456 789",
        "address": "Kigali, Rwanda",
        "password": "password123",
        "role": "courier",
        "vehicle_model": "Toyota Corolla",
        "license_plate": "RAC 123A",
        "driver_license_num": "DL123456",
        "id_card_num": "1234567890123456",
        "experience": 2,
        "motivation": "I want to earn extra income"
    }
    response = requests.post(f"{BASE_URL}/signup", json=data)
    print_response("Courier Signup", response)

    if response.status_code == 201:
        return response.json().get('access_token')
    return None

def test_login(email, password):
    """Test login endpoint"""
    data = {
        "email": email,
        "password": password
    }
    response = requests.post(f"{BASE_URL}/login", json=data)
    print_response(f"Login ({email})", response)

    if response.status_code == 200:
        return response.json().get('access_token')
    return None

def test_get_profile(token):
    """Test get profile endpoint"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/profile", headers=headers)
    print_response("Get Profile", response)
    return response.status_code == 200

def test_update_profile(token):
    """Test update profile endpoint"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "name": "Updated Test Customer",
        "phone": "+250 788 999 888"
    }
    response = requests.put(f"{BASE_URL}/profile", json=data, headers=headers)
    print_response("Update Profile", response)
    return response.status_code == 200

def test_change_password(token):
    """Test change password endpoint"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "current_password": "password123",
        "new_password": "newpassword123"
    }
    response = requests.post(f"{BASE_URL}/change-password", json=data, headers=headers)
    print_response("Change Password", response)
    return response.status_code == 200

def main():
    print("\n" + "="*50)
    print("🧪 QuickDrop API Test Suite")
    print("="*50)
    print("Make sure the Flask server is running on http://localhost:5000")
    print("")

    input("Press Enter to start testing...")

    results = {
        "passed": 0,
        "failed": 0
    }

    # Test 1: Health Check
    if test_health():
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 2: Customer Signup
    customer_token = test_signup_customer()
    if customer_token:
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 3: Courier Signup
    courier_token = test_signup_courier()
    if courier_token:
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 4: Login
    login_token = test_login("testcustomer@example.com", "password123")
    if login_token:
        results["passed"] += 1
    else:
        results["failed"] += 1

    if login_token:
        # Test 5: Get Profile
        if test_get_profile(login_token):
            results["passed"] += 1
        else:
            results["failed"] += 1

        # Test 6: Update Profile
        if test_update_profile(login_token):
            results["passed"] += 1
        else:
            results["failed"] += 1

        # Test 7: Change Password
        if test_change_password(login_token):
            results["passed"] += 1
        else:
            results["failed"] += 1

    # Print summary
    print("\n" + "="*50)
    print("📊 Test Summary")
    print("="*50)
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"Total: {results['passed'] + results['failed']}")
    print("="*50)

    if results['failed'] == 0:
        print("\n🎉 All tests passed! Your API is working correctly.")
    else:
        print(f"\n⚠️  {results['failed']} test(s) failed. Check the output above for details.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Tests interrupted by user")
    except requests.exceptions.ConnectionError:
        print("\n\n❌ Error: Could not connect to the API server.")
        print("Make sure the Flask server is running on http://localhost:5000")
    except Exception as e:
        print(f"\n\n❌ Error: {str(e)}")
