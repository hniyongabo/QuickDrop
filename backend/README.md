# QuickDrop Backend API

A Flask-based REST API backend for QuickDrop using PostgreSQL database, following MVC architecture.

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── common/                   # Common utilities
│   │   ├── decorators.py        # Custom decorators (auth, logging, etc.)
│   │   ├── utils.py             # Utility functions
│   │   └── validators.py        # Request validators
│   ├── database/                 # Database configuration
│   │   ├── db.py                # Base model and DB utilities
│   │   └── __init__.py
│   ├── logger/                   # Logging system
│   │   ├── logger_config.py     # Logger configuration
│   │   └── __init__.py
│   └── modules/                  # Application modules
│       └── user/                 # User module (MVC)
│           ├── models.py        # User model
│           ├── services.py      # Business logic
│           ├── controllers.py   # Request handlers
│           ├── routes.py        # URL routes
│           └── __init__.py
├── logs/                         # Application logs
├── config.py                     # Configuration settings
├── run.py                        # Application entry point
├── requirements.txt              # Python dependencies
└── .env.example                  # Environment variables template
```

## 📋 Prerequisites

- Python 3.8 or higher
- PostgreSQL 12 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
cd "/Users/mac/Desktop/ALU/Foundation Project/QuickDrop/backend"
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Setup PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE quickdrop_db;
CREATE USER quickdrop_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE quickdrop_db TO quickdrop_user;

# Exit PostgreSQL
\q
```

### 5. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use any text editor
```

Update the following in `.env`:
```bash
DATABASE_URL=postgresql://quickdrop_user:password@localhost:5432/quickdrop_db
SECRET_KEY=your-unique-secret-key
JWT_SECRET_KEY=your-unique-jwt-secret
```

### 6. Initialize Database

```bash
# Initialize Flask-Migrate
flask db init

# Create initial migration
flask db migrate -m "Initial migration with User model"

# Apply migration to database
flask db upgrade
```

## 🏃 Running the Application

### Development Mode

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run the application
python run.py
```

Or using Flask CLI:

```bash
export FLASK_APP=run.py
export FLASK_ENV=development
flask run
```

The API will be available at: `http://localhost:5000`

### Production Mode

```bash
export FLASK_ENV=production
python run.py
```

## 📚 API Documentation

Once the application is running, access the Swagger UI documentation at:

**http://localhost:5000/apidocs**

## 🔑 API Endpoints

### Health Check
- `GET /health` - Check if API is running

### User Management

#### Public Endpoints
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login

#### Protected Endpoints (Requires JWT Token)
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/` - Get all users (with pagination)
- `GET /api/v1/users/<user_id>` - Get user by ID
- `PUT /api/v1/users/<user_id>` - Update user
- `DELETE /api/v1/users/<user_id>` - Delete user (soft delete)

## 🧪 Testing the API

### Using cURL

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "phone": "+1234567890",
    "role": "user",
    "address": "123 Main St"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

Save the `access_token` from the response.

#### 3. Get Current User (Protected)
```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. Get All Users (Protected)
```bash
curl -X GET "http://localhost:5000/api/v1/users/?page=1&per_page=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 5. Update User (Protected)
```bash
curl -X PUT http://localhost:5000/api/v1/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "phone": "+9876543210"
  }'
```

### Using Postman

1. Import the API into Postman
2. Set base URL: `http://localhost:5000`
3. For protected routes:
   - Go to Authorization tab
   - Select "Bearer Token"
   - Paste your access token

## 📝 Database Migrations

### Create New Migration
```bash
flask db migrate -m "Description of changes"
```

### Apply Migration
```bash
flask db upgrade
```

### Rollback Migration
```bash
flask db downgrade
```

## 🔍 Logging

Logs are stored in the `logs/` directory:
- `application.log` - General application logs
- `error.log` - Error logs only

Configure log level in `.env`:
```bash
LOG_LEVEL=DEBUG  # DEBUG, INFO, WARNING, ERROR, CRITICAL
```

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Ensure database and user exist

### Module Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## 🔐 Security Notes

- Never commit `.env` file to version control
- Change default SECRET_KEY and JWT_SECRET_KEY in production
- Use strong passwords for database users
- Enable HTTPS in production
- Implement rate limiting for production

## 📦 Adding New Modules

To add a new module (e.g., `orders`):

1. Create module structure:
```bash
mkdir -p app/modules/orders
touch app/modules/orders/{__init__.py,models.py,services.py,controllers.py,routes.py}
```

2. Define model in `models.py`
3. Implement business logic in `services.py`
4. Create controllers in `controllers.py`
5. Define routes in `routes.py`
6. Register blueprint in `app/__init__.py`

## 👥 User Roles

- `user` - Regular user
- `driver` - Delivery driver
- `admin` - Administrator

## 📧 Support

For issues or questions, contact the QuickDrop development team.

## 📄 License

Copyright © 2025 QuickDrop Team

