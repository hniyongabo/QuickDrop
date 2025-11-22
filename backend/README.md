# QuickDrop Backend API v2.0

Flask backend with MVC architecture, separate models for User/Customer/Courier, and comprehensive order management.

## 🚀 Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Initialize Database
```bash
# Create tables only
python init_db.py

# Create tables and seed with sample data
python init_db.py --seed
```

### 3. Run the Server
```bash
python app.py
```

Server starts on `http://localhost:5000`

## 📡 API Endpoints

### Authentication (`/api`)

#### POST /signup
Register a new user (customer, courier, or admin)

**Request Body (Customer):**
```json
{
  "email": "customer@example.com",
  "password": "password123",
  "role": "customer",
  "name": "John Doe",
  "phone": "+250 788 123 456",
  "address": "Kigali, Rwanda",
  "city": "Kigali"
}
```

**Request Body (Courier):**
```json
{
  "email": "courier@example.com",
  "password": "password123",
  "role": "courier",
  "name": "Didier Mukasa",
  "phone": "+250 788 456 789",
  "address": "Kigali, Rwanda",
  "vehicle_model": "Motorcycle - Yamaha",
  "license_plate": "RAC 123A",
  "driver_license_num": "DL987654",
  "id_card_num": "1199012345678901",
  "experience": 3,
  "motivation": "I want to earn extra income"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "access_token": "eyJ0eXAi...",
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "role": "customer",
    "profile": {
      "name": "John Doe",
      "phone": "+250 788 123 456",
      ...
    }
  }
}
```

#### POST /login
Login and receive JWT token

**Request:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "access_token": "eyJ0eXAi...",
  "user": { ... }
}
```

### Profile Management (`/api`)

#### GET /profile
Get current user profile (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "customer@example.com",
  "role": "customer",
  "profile": {
    "name": "John Doe",
    "phone": "+250 788 123 456",
    "address": "Kigali, Rwanda"
  }
}
```

#### PUT /profile
Update user profile

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "John Updated",
  "phone": "+250 788 999 888",
  "address": "New Address"
}
```

#### POST /change-password
Change password

**Request:**
```json
{
  "current_password": "password123",
  "new_password": "newpassword123"
}
```

### Order Management (`/api`)

#### POST /orders
Create a new delivery order (customers only)

**Request:**
```json
{
  "pickup_address": "MTN Centre, KG 9 Ave",
  "pickup_contact_name": "John Doe",
  "pickup_contact_phone": "+250 788 123 456",
  "delivery_address": "Gisozi Sector, Gasabo",
  "delivery_contact_name": "Jane Smith",
  "delivery_contact_phone": "+250 788 999 888",
  "parcel_type": "documents",
  "parcel_description": "Business documents",
  "delivery_fee": 2000,
  "payment_method": "mobile_money",
  "special_instructions": "Call on arrival"
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "order_number": "QD2511151001",
    "status": "pending",
    ...
  }
}
```

#### GET /orders
Get all orders for current user

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "order_number": "QD2511151001",
      "status": "in_transit",
      "delivery_fee": 2000,
      "created_at": "2025-11-15T10:00:00"
    }
  ]
}
```

#### GET /orders/:id
Get specific order details

**Response:**
```json
{
  "id": 1,
  "order_number": "QD2511151001",
  "status": "in_transit",
  "sender": { ... },
  "courier": { ... },
  "pickup_address": "MTN Centre",
  "delivery_address": "Gisozi",
  ...
}
```

#### GET /orders/track/:order_number
Track order by order number (public endpoint)

**Example:** `/api/orders/track/QD2511151001`

#### PUT /orders/:id/status
Update order status (couriers and admins only)

**Request:**
```json
{
  "status": "picked_up",
  "courier_notes": "Package collected successfully"
}
```

**Valid Statuses:**
- `pending` → `courier_assigned` → `en_route_to_pickup` → `picked_up` → `in_transit` → `delivered` → `completed`
- Can also be: `cancelled`, `failed`

#### POST /orders/:id/assign
Assign courier to order

**Request:**
```json
{
  "courier_id": 1
}
```

Or leave empty for auto-assignment to available courier.

#### POST /orders/:id/rate
Rate a completed order (customers only)

**Request:**
```json
{
  "rating": 5,
  "feedback": "Excellent service!"
}
```

## 🧪 Testing

### Run Test Suite
```bash
python test_new_structure.py
```

This will test:
- Health check
- Customer and courier signup
- Login
- Profile operations
- Order creation and management
- Order tracking

### Manual Testing with cURL

**Create Order:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pickup_address": "Kigali City Tower",
    "pickup_contact_name": "John",
    "pickup_contact_phone": "+250788123456",
    "delivery_address": "Nyarutarama",
    "delivery_contact_name": "Jane",
    "delivery_contact_phone": "+250788999888",
    "parcel_type": "electronics",
    "delivery_fee": 3000,
    "payment_method": "cash"
  }'
```

**Track Order:**
```bash
curl http://localhost:5000/api/orders/track/QD2511151001
```

## 🔒 Security Features

- ✅ Password hashing with Werkzeug
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Protected routes with `@jwt_required()`
- ✅ Email uniqueness validation
- ✅ Courier license and ID uniqueness
- ✅ CORS enabled for cross-origin requests

## 🎯 Key Improvements in v2.0

1. **Separate Models**: User, Customer, and Courier now have their own tables with proper relationships
2. **MVC Architecture**: Clear separation of concerns with models, controllers, and utilities
3. **Order Management**: Complete order lifecycle with status tracking
4. **Courier Verification**: Track verification status and ratings
5. **Public Tracking**: Track orders without authentication
6. **Better Organization**: Code is more maintainable and scalable
7. **Sample Data**: init_db.py can seed database for testing

## 📝 Development Notes

### Adding New Endpoints

1. Create controller in `controllers/`
2. Define routes using Blueprint
3. Register blueprint in `app.py`
4. Update tests in `test_new_structure.py`

### Database Migrations

For schema changes, drop and recreate tables:
```bash
python init_db.py --seed
```

For production, use Flask-Migrate or Alembic.

## 🚧 Future Enhancements

- [ ] File upload for courier documents
- [ ] Email notifications
- [ ] SMS integration
- [ ] Real-time location tracking with WebSocket
- [ ] Payment gateway integration
- [ ] Admin dashboard APIs
- [ ] Analytics and reporting
- [ ] Database migrations with Alembic

---

**QuickDrop API v2.0** - Built with Flask, PostgreSQL, and JWT Authentication
