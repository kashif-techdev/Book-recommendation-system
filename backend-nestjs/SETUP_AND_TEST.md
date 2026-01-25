# 🚀 NestJS Backend Setup & Testing Guide

## Step-by-Step Commands to Run

### Step 1: Install Dependencies

```bash
cd backend-nestjs
npm install
```

---

### Step 2: Set Up PostgreSQL Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name book-recommendation-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=book_recommendation -p 5432:5432 -d postgres:15-alpine

# Verify it's running
docker ps
```

#### Option B: Using Local PostgreSQL

```bash
# Create database (if PostgreSQL is installed locally)
createdb book_recommendation

# Or using psql
psql -U postgres
CREATE DATABASE book_recommendation;
\q
```

---

### Step 3: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env
```

**Edit `.env` file with these values:**

```env
# Database (for Docker)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=book_recommendation

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Google OAuth (optional for now)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ML Service (optional for now - we'll test without it first)
ML_SERVICE_URL=http://localhost:8000

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

### Step 4: Start the Backend Server

```bash
# Development mode (with hot reload)
npm run start:dev
```

**Expected output:**
```
[Nest] Starting Nest application...
Database initialized
🚀 Application is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api
```

---

### Step 5: Test the API Endpoints

#### Test 1: Health Check

```bash
# Open new terminal/command prompt
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-24T...",
  "services": {
    "api": "healthy",
    "mlService": "unhealthy"
  }
}
```

#### Test 2: API Documentation

Open in browser:
```
http://localhost:3000/api
```

You should see Swagger UI with all available endpoints.

#### Test 3: Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Expected response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "profilePicture": null,
      "createdAt": "2026-01-24T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token from the response!**

#### Test 4: Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"password123\"}"
```

**Expected response:** Similar to register, with token.

#### Test 5: Get Current User (Protected Endpoint)

```bash
# Replace YOUR_TOKEN with the token from register/login
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "profilePicture": null,
      "createdAt": "2026-01-24T..."
    }
  }
}
```

#### Test 6: Get Search History

```bash
# Replace YOUR_TOKEN with your token
curl -X GET http://localhost:3000/search-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "history": []
  }
}
```

#### Test 7: Book Recommendations (Requires ML Service)

**Note:** This will fail if ML service is not running. That's expected.

```bash
# Replace YOUR_TOKEN with your token
curl -X POST http://localhost:3000/books/recommend \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mystery\",\"category\":\"All\",\"tone\":\"All\",\"limit\":10}"
```

**Expected:** Error about ML service (since it's not running yet)

---

## 🧪 Complete Test Script

Save this as `test-api.sh` (Linux/Mac) or `test-api.ps1` (Windows):

### Windows PowerShell (`test-api.ps1`)

```powershell
# Test API Endpoints
$baseUrl = "http://localhost:3000"

Write-Host "1. Testing Health Check..." -ForegroundColor Green
Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host "`n2. Testing User Registration..." -ForegroundColor Green
$registerBody = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$registerResponse = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing
$registerData = $registerResponse.Content | ConvertFrom-Json
$token = $registerData.data.token

Write-Host "Token received: $($token.Substring(0, 20))..." -ForegroundColor Yellow

Write-Host "`n3. Testing Get Current User..." -ForegroundColor Green
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-WebRequest -Uri "$baseUrl/auth/me" -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host "`n4. Testing Search History..." -ForegroundColor Green
Invoke-WebRequest -Uri "$baseUrl/search-history" -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
```

**Run it:**
```powershell
cd backend-nestjs
.\test-api.ps1
```

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps

# If not running, start it
docker start book-recommendation-db

# Check connection
psql -h localhost -U postgres -d book_recommendation
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Change PORT in .env file to 3001
# Or kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database connection refused

**Check:**
1. PostgreSQL is running: `docker ps` or `pg_isready`
2. Database credentials in `.env` are correct
3. Port 5432 is not blocked

---

## ✅ Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] PostgreSQL running
- [ ] `.env` file configured
- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] Swagger UI accessible at `/api`
- [ ] User registration works
- [ ] User login works
- [ ] JWT token authentication works
- [ ] Protected endpoints require token
- [ ] Search history endpoint works

---

## 📝 Next Steps After Testing

1. **Test with ML Service:**
   - Deploy ML service to Hugging Face
   - Update `ML_SERVICE_URL` in `.env`
   - Test book recommendations

2. **Test Frontend Integration:**
   - Update frontend API URL
   - Test full authentication flow
   - Test book search

3. **Production Deployment:**
   - Follow `DEPLOYMENT_GUIDE.md`
   - Deploy to Render
   - Set up production database

---

## 🎯 Quick Reference

```bash
# Start everything
docker start book-recommendation-db
cd backend-nestjs
npm run start:dev

# Test health
curl http://localhost:3000/health

# View API docs
# Open: http://localhost:3000/api
```
