#!/usr/bin/env python3
"""
API test script for the new QuickDrop backend structure
Tests all endpoints with the refactored MVC architecture
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000/api"

def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"📋 {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        print(f"Response:\n{json.dumps(data, indent=2)}")
        return data
    except:
        print(f"Response: {response.text}")
        return None

def test_health():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)
    return response.status_code == 200

def test_customer_signup():
    """Test customer signup"""
    data = {
        "email": "newcustomer@test.com",
        "password": "password123",
        "role": "customer",
        "name": "Jane Smith",
        "phone": "+250 788 111 222",
        "address": "Remera, Kigali",
        "city": "Kigali"
    }
    response = requests.post(f"{BASE_URL}/signup", json=data)
    result = print_response("Customer Signup", response)

    if response.status_code == 201 and result:
        return result.get('access_token')
    return None

def test_courier_signup():
    """Test courier signup"""
    data = {
        "email": "newcourier@test.com",
        "password": "password123",
        "role": "courier",
        "name": "Paul Kagame",
        "phone": "+250 788 333 444",
        "address": "Kimihurura, Kigali",
        "vehicle_model": "Motorcycle - Honda",
        "license_plate": "RAC 999Z",
        "driver_license_num": "DL" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "id_card_num": "1" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "experience": 1,
        "motivation": "Want to be part of QuickDrop team"
    }
    response = requests.post(f"{BASE_URL}/signup", json=data)
    result = print_response("Courier Signup", response)

    if response.status_code == 201 and result:
        return result.get('access_token')
    return None

def test_login(email, password):
    """Test login"""
    data = {"email": email, "password": password}
    response = requests.post(f"{BASE_URL}/login", json=data)
    result = print_response(f"Login ({email})", response)

    if response.status_code == 200 and result:
        return result.get('access_token')
    return None

def test_get_profile(token):
    """Test get profile"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/profile", headers=headers)
    print_response("Get Profile", response)
    return response.status_code == 200

def test_update_profile(token):
    """Test update profile"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "name": "Jane Smith Updated",
        "phone": "+250 788 111 999"
    }
    response = requests.put(f"{BASE_URL}/profile", json=data, headers=headers)
    print_response("Update Profile", response)
    return response.status_code == 200

def test_change_password(token):
    """Test change password"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "current_password": "password123",
        "new_password": "newpassword123"
    }
    response = requests.post(f"{BASE_URL}/change-password", json=data, headers=headers)
    print_response("Change Password", response)
    return response.status_code == 200

def test_create_order(customer_token):
    """Test create order"""
    headers = {"Authorization": f"Bearer {customer_token}"}
    data = {
        "pickup_address": "KG 10 Ave, Kigali City Tower",
        "pickup_contact_name": "Jane Smith",
        "pickup_contact_phone": "+250 788 111 222",
        "delivery_address": "KN 5 Rd, Nyarutarama",
        "delivery_contact_name": "David Brown",
        "delivery_contact_phone": "+250 788 555 666",
        "parcel_type": "electronics",
        "parcel_description": "Laptop charger",
        "delivery_fee": 3000,
        "payment_method": "mobile_money",
        "special_instructions": "Call on arrival"
    }
    response = requests.post(f"{BASE_URL}/orders", json=data, headers=headers)
    result = print_response("Create Order", response)

    if response.status_code == 201 and result:
        return result.get('order', {}).get('id')
    return None

def test_get_orders(token):
    """Test get orders"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/orders", headers=headers)
    print_response("Get Orders List", response)
    return response.status_code == 200

def test_get_order_detail(token, order_id):
    """Test get order detail"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/orders/{order_id}", headers=headers)
    result = print_response(f"Get Order Detail (ID: {order_id})", response)

    if response.status_code == 200 and result:
        return result.get('order_number')
    return None

def test_track_order(order_number):
    """Test track order (public endpoint)"""
    response = requests.get(f"{BASE_URL}/orders/track/{order_number}")
    print_response(f"Track Order ({order_number})", response)
    return response.status_code == 200

def main():
    print("\n" + "="*60)
    print("🧪 QuickDrop API Test Suite (New Structure)")
    print("="*60)
    print("Testing refactored MVC architecture with separate models")
    print("")

    input("Press Enter to start testing...")

    results = {"passed": 0, "failed": 0}

    # Test 1: Health Check
    print("\n\n🏥 TESTING HEALTH CHECK")
    if test_health():
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 2: Customer Signup
    print("\n\n👤 TESTING CUSTOMER SIGNUP")
    customer_token = test_customer_signup()
    if customer_token:
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 3: Courier Signup
    print("\n\n🚴 TESTING COURIER SIGNUP")
    courier_token = test_courier_signup()
    if courier_token:
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 4: Login
    print("\n\n🔐 TESTING LOGIN")
    login_token = test_login("newcustomer@test.com", "password123")
    if login_token:
        results["passed"] += 1
    else:
        results["failed"] += 1
        login_token = customer_token  # Fallback to signup token

    if login_token:
        # Test 5: Get Profile
        print("\n\n👁️ TESTING GET PROFILE")
        if test_get_profile(login_token):
            results["passed"] += 1
        else:
            results["failed"] += 1

        # Test 6: Update Profile
        print("\n\n✏️ TESTING UPDATE PROFILE")
        if test_update_profile(login_token):
            results["passed"] += 1
        else:
            results["failed"] += 1

        # Test 7: Change Password
        print("\n\n🔑 TESTING CHANGE PASSWORD")
        if test_change_password(login_token):
            results["passed"] += 1
        else:
            results["failed"] += 1

        # Test 8: Create Order
        print("\n\n📦 TESTING CREATE ORDER")
        order_id = test_create_order(login_token)
        if order_id:
            results["passed"] += 1
        else:
            results["failed"] += 1

        # Test 9: Get Orders
        print("\n\n📋 TESTING GET ORDERS LIST")
        if test_get_orders(login_token):
            results["passed"] += 1
        else:
            results["failed"] += 1

        if order_id:
            # Test 10: Get Order Detail
            print("\n\n🔍 TESTING GET ORDER DETAIL")
            order_number = test_get_order_detail(login_token, order_id)
            if order_number:
                results["passed"] += 1
            else:
                results["failed"] += 1

            # Test 11: Track Order (Public)
            if order_number:
                print("\n\n🗺️ TESTING TRACK ORDER (PUBLIC)")
                if test_track_order(order_number):
                    results["passed"] += 1
                else:
                    results["failed"] += 1

    # Print summary
    print("\n\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"📈 Total: {results['passed'] + results['failed']}")
    print("="*60)

    if results['failed'] == 0:
        print("\n🎉 All tests passed! New structure is working correctly.")
    else:
        print(f"\n⚠️  {results['failed']} test(s) failed. Check output above.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Tests interrupted by user")
    except requests.exceptions.ConnectionError:
        print("\n\n❌ Error: Could not connect to the API server.")
        print("Make sure the Flask server is running on http://localhost:5000")
        print("\nStart the server with: python app.py")
    except Exception as e:
        print(f"\n\n❌ Error: {str(e)}")
