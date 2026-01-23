# 🚀 Flask to FastAPI Migration Plan

## Overview
This document outlines the complete migration plan from Flask to FastAPI for the Book Recommendation System API.

---

## 📋 Current Flask API Structure

### Routes Identified:
1. **POST /recommend** - Book recommendations endpoint
2. **GET /health** - Health check endpoint
3. **POST /auth/register** - User registration
4. **POST /auth/login** - User login
5. **GET /auth/me** - Get current user (JWT protected)
6. **POST /auth/logout** - Logout (JWT protected)
7. **POST /auth/google** - Google OAuth authentication

### Current Dependencies:
- Flask 2.0.0+
- Flask-CORS 3.0.0+
- Flask-JWT-Extended 4.5.0+
- Flask-SQLAlchemy 3.0.0+
- Werkzeug (password hashing)
- SQLAlchemy (via Flask-SQLAlchemy)

---

## 🎯 FastAPI Migration Plan

### Phase 1: Setup & Dependencies

#### 1.1 Update Requirements
**Replace:**
- `flask>=2.0.0` → `fastapi>=0.104.0`
- `flask-cors>=3.0.0` → Built-in CORS in FastAPI
- `flask-jwt-extended>=4.5.0` → `python-jose[cryptography]>=3.3.0` + `passlib[bcrypt]>=1.7.4`
- `flask-sqlalchemy>=3.0.0` → `sqlalchemy>=2.0.0` (direct usage)
- `werkzeug` → `passlib[bcrypt]` (for password hashing)

**Add:**
- `uvicorn[standard]>=0.24.0` (ASGI server)
- `python-multipart>=0.0.6` (for form data)
- `pydantic>=2.0.0` (for data validation)
- `pydantic-settings>=2.0.0` (for settings management)

#### 1.2 Keep Existing Dependencies
- All ML/AI libraries (transformers, torch, langchain, etc.)
- Data processing libraries (pandas, numpy, etc.)
- Google OAuth libraries
- python-dotenv

---

### Phase 2: Project Structure

#### 2.1 New Directory Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app instance
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database setup
│   ├── dependencies.py      # Shared dependencies
│   ├── models.py            # SQLAlchemy models (updated)
│   ├── schemas.py           # Pydantic schemas
│   ├── security.py          # JWT & password utilities
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication routes
│   │   ├── books.py         # Book recommendation routes
│   │   └── health.py         # Health check route
│   └── services/
│       ├── __init__.py
│       ├── book_service.py  # Book recommendation logic
│       └── auth_service.py  # Authentication logic
├── requirements.txt
└── .env
```

---

### Phase 3: Core Components Migration

#### 3.1 Configuration (config.py)
**Flask:**
```python
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', '...')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', '...')
```

**FastAPI:**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./book_recommendation.db"
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    GOOGLE_CLIENT_ID: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
```

#### 3.2 Database Setup (database.py)
**Flask:**
```python
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()
db.init_app(app)
```

**FastAPI:**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 3.3 Models Migration (models.py)
**Changes:**
- Remove `flask_sqlalchemy` dependency
- Use standard SQLAlchemy `Base`
- Keep all model definitions (User, SearchHistory)
- Update imports

#### 3.4 Security (security.py)
**JWT Token Management:**
- Replace `flask_jwt_extended` with `python-jose`
- Create token creation/verification functions
- Password hashing: Replace `werkzeug` with `passlib`

**Functions to create:**
- `create_access_token(data: dict, expires_delta: timedelta)`
- `verify_token(token: str)`
- `get_current_user(token: str, db: Session)`
- `get_password_hash(password: str)`
- `verify_password(plain_password: str, hashed_password: str)`

---

### Phase 4: Routes Migration

#### 4.1 Health Check Route
**Flask:**
```python
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'books_loaded': len(books)})
```

**FastAPI:**
```python
@router.get("/health")
async def health_check():
    return {"status": "healthy", "books_loaded": len(books)}
```

#### 4.2 Book Recommendations Route
**Flask:**
```python
@app.route('/recommend', methods=['POST'])
def recommend_books():
    data = request.get_json()
    # ... logic
    return jsonify({...})
```

**FastAPI:**
```python
@router.post("/recommend")
async def recommend_books(request: RecommendationRequest):
    # ... logic
    return RecommendationResponse(...)
```

#### 4.3 Authentication Routes
**Flask:**
```python
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    # ... logic
    return jsonify({...})
```

**FastAPI:**
```python
@router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    # ... logic
    return AuthResponse(...)
```

**JWT Protection:**
- Flask: `@jwt_required()`
- FastAPI: `Depends(get_current_user)` dependency

---

### Phase 5: Pydantic Schemas (schemas.py)

Create request/response models:

```python
from pydantic import BaseModel, EmailStr

class RecommendationRequest(BaseModel):
    query: str = ""
    category: str = "All"
    tone: str = "All"
    limit: int = 10

class BookResponse(BaseModel):
    isbn13: str
    title: str
    authors: str
    thumbnail: str
    description: str
    # ... all book fields

class RecommendationResponse(BaseModel):
    success: bool
    data: dict
    message: str

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    data: dict
```

---

### Phase 6: Migration Steps

#### Step 1: Install FastAPI Dependencies
```bash
pip install fastapi uvicorn[standard] python-jose[cryptography] passlib[bcrypt] python-multipart pydantic pydantic-settings
```

#### Step 2: Create New Project Structure
- Create `app/` directory
- Move models to new structure
- Create schemas.py
- Create security.py
- Create routers/

#### Step 3: Migrate Models
- Update imports (remove Flask-SQLAlchemy)
- Use standard SQLAlchemy Base
- Update database initialization

#### Step 4: Create Pydantic Schemas
- Define all request/response models
- Add validation rules

#### Step 5: Migrate Routes
- Convert each Flask route to FastAPI router
- Update request handling (Pydantic models)
- Update response handling
- Add proper dependencies

#### Step 6: Update Main Application
- Create FastAPI app instance
- Include routers
- Add CORS middleware
- Add exception handlers

#### Step 7: Update Database Initialization
- Create tables on startup
- Handle schema migrations

#### Step 8: Testing
- Test all endpoints
- Verify JWT authentication
- Test Google OAuth
- Verify CORS works

#### Step 9: Update Frontend (if needed)
- FastAPI uses same JSON format
- No changes needed if endpoints match
- Verify API base URL

#### Step 10: Update Server Startup
- Replace `flask run` with `uvicorn`
- Update any deployment scripts

---

### Phase 7: Key Differences & Considerations

#### 7.1 Request Handling
- **Flask:** `request.get_json()`
- **FastAPI:** Pydantic models in function parameters

#### 7.2 Response Handling
- **Flask:** `jsonify({...})`
- **FastAPI:** Return Python dict/Pydantic model (auto JSON)

#### 7.3 Error Handling
- **Flask:** `return jsonify({...}), 400`
- **FastAPI:** `raise HTTPException(status_code=400, detail="...")`

#### 7.4 Database Sessions
- **Flask:** `db.session` (global)
- **FastAPI:** Dependency injection with `Depends(get_db)`

#### 7.5 JWT Authentication
- **Flask:** `@jwt_required()` decorator
- **FastAPI:** `Depends(get_current_user)` dependency

#### 7.6 CORS
- **Flask:** `CORS(app)`
- **FastAPI:** `app.add_middleware(CORSMiddleware, ...)`

---

### Phase 8: Benefits of FastAPI

1. **Automatic API Documentation**
   - Swagger UI at `/docs`
   - ReDoc at `/redoc`

2. **Type Safety**
   - Pydantic validation
   - Better IDE support

3. **Performance**
   - Async support
   - Better concurrency

4. **Modern Python**
   - Type hints
   - Python 3.8+ features

5. **Better Developer Experience**
   - Automatic validation
   - Better error messages

---

### Phase 9: Backward Compatibility

#### 9.1 API Endpoints
- Keep same URL paths
- Keep same request/response format
- No frontend changes needed

#### 9.2 Database
- Same SQLite database
- Same models structure
- No data migration needed

#### 9.3 Environment Variables
- Same variable names
- Same .env file structure

---

### Phase 10: Testing Checklist

- [ ] Health check endpoint
- [ ] Book recommendations endpoint
- [ ] User registration
- [ ] User login
- [ ] Get current user (protected)
- [ ] Logout (protected)
- [ ] Google OAuth
- [ ] CORS headers
- [ ] Error handling
- [ ] JWT token expiration
- [ ] Database operations
- [ ] Frontend integration

---

### Phase 11: Deployment Changes

#### 11.1 Development
**Flask:**
```bash
python api_server.py
# or
flask run
```

**FastAPI:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

#### 11.2 Production
**Flask:**
```bash
gunicorn api_server:app
```

**FastAPI:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 4
```

---

## 📝 Implementation Order

1. ✅ Create new project structure
2. ✅ Update requirements.txt
3. ✅ Migrate configuration (config.py)
4. ✅ Migrate database setup (database.py)
5. ✅ Update models (models.py)
6. ✅ Create Pydantic schemas (schemas.py)
7. ✅ Create security utilities (security.py)
8. ✅ Migrate health check route
9. ✅ Migrate book recommendations route
10. ✅ Migrate authentication routes
11. ✅ Create main FastAPI app
12. ✅ Test all endpoints
13. ✅ Update startup scripts
14. ✅ Update documentation

---

## ⚠️ Important Notes

1. **Database Compatibility:** SQLAlchemy models work the same way
2. **JWT Tokens:** Need to ensure token format compatibility
3. **Frontend:** Should work without changes if endpoints match
4. **Environment Variables:** Keep same names for compatibility
5. **Testing:** Test thoroughly before removing Flask code

---

## 🎯 Success Criteria

- [ ] All endpoints working
- [ ] JWT authentication working
- [ ] Google OAuth working
- [ ] Frontend can connect successfully
- [ ] API documentation accessible
- [ ] No breaking changes for frontend
- [ ] Performance maintained or improved

---

## 📚 Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- SQLAlchemy with FastAPI: https://fastapi.tiangolo.com/tutorial/sql-databases/
- JWT with FastAPI: https://fastapi.tiangolo.com/advanced/security/http-bearer/
- Pydantic: https://docs.pydantic.dev/
