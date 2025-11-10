# QuickDrop Backend - Complete Setup Guide

This guide will help you set up the QuickDrop backend with proper authentication and database configuration.

## Prerequisites

- **Python 3.8+** installed
- **PostgreSQL 12+** installed and running
- **pip** (Python package manager)
- Basic knowledge of terminal/command line

## Quick Setup (Automated)

### Step 1: Run Setup Script

```bash
cd "/Users/mac/Desktop/ALU/Foundation Project/QuickDrop/backend"
chmod +x setup.sh
./setup.sh
```

### Step 2: Configure Environment

Edit the `.env` file created by the setup script:

```bash
nano .env  # or use your preferred text editor
```

Update these critical values:
- `DATABASE_URL` - Your PostgreSQL connection string
- `SECRET_KEY` - Generate using: `python -c "import secrets; print(secrets.token_hex(32))"`
- `JWT_SECRET_KEY` - Generate using: `python -c "import secrets; print(secrets.token_hex(32))"`

### Step 3: Setup Database

```bash
# Create database and user in PostgreSQL
psql -U postgres

# Inside PostgreSQL prompt:
CREATE DATABASE quickdrop_db;
CREATE USER quickdrop_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE quickdrop_db TO quickdrop_user;
\q
```

### Step 4: Initialize Database Tables

```bash
source venv/bin/activate
python init_db.py
```

### Step 5: Run the Application

```bash
python run.py
```

Visit http://localhost:5000/apidocs to see the API documentation!

---

## Manual Setup (Step by Step)

### 1. Create Virtual Environment

```bash
cd "/Users/mac/Desktop/ALU/Foundation Project/QuickDrop/backend"
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Flask
FLASK_ENV=development
FLASK_PORT=5000

# Security (Generate new keys!)
SECRET_KEY=your-generated-secret-key
JWT_SECRET_KEY=your-generated-jwt-secret

# Database
DATABASE_URL=postgresql://quickdrop_user:your_password@localhost:5432/quickdrop_db

# Logging
LOG_LEVEL=DEBUG
```

### 4. Setup PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Run these commands in PostgreSQL:
CREATE DATABASE quickdrop_db;
CREATE USER quickdrop_user WITH PASSWORD 'your_password';
ALTER USER quickdrop_user WITH SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE quickdrop_db TO quickdrop_user;
\q
```

### 5. Initialize Database

```bash
# Activate virtual environment if not already active
source venv/bin/activate

# Run initialization script
python init_db.py
```

You should see:
```
✓ Database tables created successfully!

Created tables (1):
  - users
```

### 6. Run the Application

```bash
python run.py
```

Expected output:
```
 * Running on http://0.0.0.0:5000
```

---

## Testing the API

### 1. Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "QuickDrop Backend"
}
```

### 2. Register a User

```bash
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "phone": "+1234567890",
    "role": "user",
    "address": "123 Main St"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Save the `access_token` from the response!

### 4. Access Protected Endpoint

```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Features Implemented

### Authentication & Security
- ✅ **Bcrypt password hashing** - Industry-standard password security
- ✅ **JWT authentication** - Secure token-based auth
- ✅ **Role-based access** - User, driver, admin roles
- ✅ **Token expiration** - Automatic token refresh
- ✅ **Secure error handling** - No sensitive data leaks

### Database
- ✅ **PostgreSQL** - Production-grade database
- ✅ **SQLAlchemy ORM** - Type-safe database operations
- ✅ **Soft deletes** - Data retention with is_active flag
- ✅ **Timestamps** - Automatic created_at/updated_at

### API Design
- ✅ **MVC Architecture** - Clean separation of concerns
- ✅ **RESTful endpoints** - Standard HTTP methods
- ✅ **Swagger documentation** - Interactive API docs
- ✅ **Pagination** - Efficient data retrieval
- ✅ **Validation** - Request data validation

### Developer Experience
- ✅ **Structured logging** - Debug and error logs
- ✅ **Error handling** - Consistent error responses
- ✅ **CORS enabled** - Frontend integration ready
- ✅ **Environment configs** - Dev/prod separation

---

## API Endpoints

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/users/register` | Register new user |
| POST | `/api/v1/users/login` | User login |

### Protected Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user |
| GET | `/api/v1/users/` | Get all users (paginated) |
| GET | `/api/v1/users/<id>` | Get user by ID |
| PUT | `/api/v1/users/<id>` | Update user |
| DELETE | `/api/v1/users/<id>` | Delete user (soft) |

---

## Troubleshooting

### Database Connection Error

```
Error: could not connect to server
```

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env`
3. Ensure database exists: `psql -U postgres -l`

### Port Already in Use

```
Error: Address already in use
```

**Solution:**
```bash
# Find process on port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Module Import Errors

```
ModuleNotFoundError: No module named 'bcrypt'
```

**Solution:**
```bash
source venv/bin/activate
pip install -r requirements.txt --force-reinstall
```

### JWT Errors

```
Invalid token / Token expired
```

**Solution:**
- Tokens expire after 1 hour by default
- Login again to get a new token
- Check JWT_SECRET_KEY matches in .env

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py              # App factory with JWT handlers
│   ├── common/                  # Shared utilities
│   │   ├── decorators.py       # Auth decorators
│   │   ├── validators.py       # Input validation
│   │   └── utils.py            # Helper functions
│   ├── database/
│   │   └── db.py               # Base model with timestamps
│   ├── logger/
│   │   └── logger_config.py    # Logging setup
│   └── modules/
│       └── user/               # User module (MVC)
│           ├── models.py       # User model with bcrypt
│           ├── services.py     # Business logic
│           ├── controllers.py  # Request handlers
│           └── routes.py       # URL routing
├── logs/                        # Application logs
├── config.py                    # Configuration classes
├── init_db.py                   # Database initialization
├── run.py                       # Application entry point
├── setup.sh                     # Automated setup script
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment template
└── .env                         # Your configuration (git-ignored)
```

---

## Security Best Practices

### Production Deployment

1. **Generate Strong Keys**
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

2. **Use HTTPS**
   - Configure SSL/TLS certificates
   - Update Swagger template to use HTTPS

3. **Database Security**
   - Use strong passwords
   - Limit database user permissions
   - Enable SSL for database connections

4. **Environment Variables**
   - Never commit `.env` to git
   - Use environment-specific configs
   - Rotate keys periodically

5. **Rate Limiting**
   - Add Flask-Limiter for API rate limiting
   - Protect against brute force attacks

---

## Next Steps

1. **Add More Modules**
   - Orders module
   - Delivery tracking
   - Payments integration

2. **Add Tests**
   - Unit tests with pytest
   - Integration tests
   - Load testing

3. **Add Features**
   - Email verification
   - Password reset
   - Role-based permissions
   - File uploads

4. **Production Setup**
   - Use Gunicorn/uWSGI
   - Setup Nginx reverse proxy
   - Configure monitoring
   - Setup CI/CD pipeline

---

## Support

For issues or questions:
- Check logs in `logs/` directory
- Review Swagger docs at `/apidocs`
- Check PostgreSQL logs

## License

Copyright © 2025 QuickDrop Team
