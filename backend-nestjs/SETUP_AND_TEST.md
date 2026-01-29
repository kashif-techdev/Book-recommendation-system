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

# ML Service (use your deployed Hugging Face Space for full testing)
ML_SERVICE_URL=https://kashifkhaan-book-recommendations.hf.space

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

Use these tests to verify **backend**, **database** (user data, search history), and **ML service** integration.

**Base URL:** `http://localhost:3000` (or your backend URL)

---

#### Test 1: Health Check (API + ML Service)

```bash
curl http://localhost:3000/health
```

**Expected (with ML service URL set and Space running):**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-24T...",
  "services": {
    "api": "healthy",
    "mlService": "healthy"
  }
}
```

If `mlService` is `"unhealthy"`, check `ML_SERVICE_URL` in `.env` and that the Hugging Face Space is running.

---

#### Test 2: API Documentation

Open in browser: **http://localhost:3000/api**

You should see Swagger UI with all endpoints (auth, books, search-history, health).

---

#### Test 3: Register a User (Database: `users` table)

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

**Save the token** from `data.token` for the next tests. If you re-run tests, use a new username/email or use login (Test 4) instead of register again.

---

#### Test 4: Login (Database: verify user exists)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"password123\"}"
```

**Expected:** Same shape as register (user + token). Use this token if you already registered.

---

#### Test 5: Get Current User (Protected — user data from DB)

Use **GET /auth/me** or **GET /profile** (same response).

```bash
# Replace YOUR_TOKEN with the token from register/login
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Or use profile (alias)
curl -X GET http://localhost:3000/profile \
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

If you get `401 Unauthorized`, the token is missing or invalid.

---

#### Test 6: Get Search History (Database: `search_history` table — initially empty)

```bash
curl -X GET http://localhost:3000/search-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected (before any recommendations):**
```json
{
  "success": true,
  "data": {
    "history": []
  }
}
```

---

#### Test 7: Book Recommendations (ML service + saves search history to DB)

**Requires:** `ML_SERVICE_URL` set to your Hugging Face Space (e.g. `https://kashifkhaan-book-recommendations.hf.space`).

```bash
curl -X POST http://localhost:3000/books/recommend \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mystery\",\"category\":\"All\",\"tone\":\"All\",\"limit\":10}"
```

**Expected response:** JSON with `books`, `total`, etc. from the ML service. The backend also **saves this search to the database** (search history).

---

#### Test 8: Get Search History Again (verify history was saved)

```bash
curl -X GET http://localhost:3000/search-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected (after Test 7):** `data.history` contains at least one entry, e.g.:

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": 1,
        "userId": 1,
        "query": "mystery",
        "category": "All",
        "tone": "All",
        "resultsCount": 10,
        "createdAt": "2026-01-24T..."
      }
    ]
  }
}
```

This confirms **user data and search history are stored and retrieved correctly** from PostgreSQL.

---

#### Test 9: Delete One Search History Entry

```bash
# Replace 1 with the actual id from history (e.g. from Test 8)
curl -X DELETE http://localhost:3000/search-history/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** `{ "success": true, "message": "Search history deleted" }`

---

#### Test 10: Delete All Search History

```bash
curl -X DELETE http://localhost:3000/search-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** `{ "success": true, "message": "All search history deleted" }`

Then `GET /search-history` should return `history: []`.

---

#### Test 11: Popular Books (no auth required)

```bash
curl http://localhost:3000/books/popular
```

**Expected:** JSON with popular books from the ML service (same shape as recommendations).

---

## 🗄️ Database Verification (PostgreSQL)

After running the tests above, you can verify that **user data** and **search history** are stored correctly in the database.

### Connect to the database

**Docker:**
```bash
docker exec -it book-recommendation-db psql -U postgres -d book_recommendation
```

**Local PostgreSQL:**
```bash
psql -h localhost -U postgres -d book_recommendation
```

### Check users table

```sql
SELECT id, username, email, "createdAt" FROM "user";
```

**Expected:** At least one row (e.g. `testuser`, `test@example.com`). This confirms registration and login are persisting user data.

### Check search_history table

```sql
SELECT id, "userId", query, category, tone, "resultsCount", "createdAt" FROM search_history ORDER BY "createdAt" DESC;
```

**Expected:** After Test 7 (recommend), you should see at least one row with your `query` (e.g. `mystery`), `userId` matching your user, and `resultsCount`. After Test 9/10 (delete), rows may be empty.

### Exit psql

```sql
\q
```

---

## 🧪 Complete Test Script

Save this as `test-api.sh` (Linux/Mac) or `test-api.ps1` (Windows):

### Windows PowerShell (`test-api.ps1`)

This script tests health, auth, user data, search history, book recommendations (ML), and history delete.

```powershell
# Backend + DB + ML Test Script
$baseUrl = "http://localhost:3000"

Write-Host "1. Health Check (API + ML)..." -ForegroundColor Green
(Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing).Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n2. Register User (DB: users)..." -ForegroundColor Green
$registerBody = @{ username = "testuser"; email = "test@example.com"; password = "password123" } | ConvertTo-Json
try {
    $registerResponse = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing
} catch {
    # If user exists, login instead
    Write-Host "User may exist, trying login..." -ForegroundColor Yellow
    $loginBody = @{ username = "testuser"; password = "password123" } | ConvertTo-Json
    $registerResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
}
$registerData = $registerResponse.Content | ConvertFrom-Json
$token = $registerData.data.token
Write-Host "Token: $($token.Substring(0, 30))..." -ForegroundColor Yellow

Write-Host "`n3. Get Current User (auth/me)..." -ForegroundColor Green
$headers = @{ "Authorization" = "Bearer $token" }
(Invoke-WebRequest -Uri "$baseUrl/auth/me" -Headers $headers -UseBasicParsing).Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n4. Search History (empty at first)..." -ForegroundColor Green
(Invoke-WebRequest -Uri "$baseUrl/search-history" -Headers $headers -UseBasicParsing).Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

Write-Host "`n5. Book Recommendations (ML + saves history)..." -ForegroundColor Green
$recommendBody = @{ query = "mystery"; category = "All"; tone = "All"; limit = 5 } | ConvertTo-Json
$rec = Invoke-WebRequest -Uri "$baseUrl/books/recommend" -Method POST -Headers $headers -Body $recommendBody -ContentType "application/json" -UseBasicParsing
$recData = $rec.Content | ConvertFrom-Json
Write-Host "Recommendations count: $($recData.data.total)" -ForegroundColor Yellow

Write-Host "`n6. Search History again (should have entry)..." -ForegroundColor Green
$history = (Invoke-WebRequest -Uri "$baseUrl/search-history" -Headers $headers -UseBasicParsing).Content | ConvertFrom-Json
$history.data.history | ConvertTo-Json -Depth 3
if ($history.data.history -and $history.data.history.Count -gt 0) { Write-Host "History saved to DB: OK" -ForegroundColor Green }

Write-Host "`n7. Popular Books (no auth)..." -ForegroundColor Green
(Invoke-WebRequest -Uri "$baseUrl/books/popular" -UseBasicParsing).Content | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object total

Write-Host "`n✅ Backend + DB + ML tests completed!" -ForegroundColor Green
```

**Run it:**
```powershell
cd backend-nestjs
.\test-api.ps1
```

For a shorter run (login → search history → recommend → history → delete → popular only), use:
```powershell
.\run-remaining-tests.ps1
```

Ensure `ML_SERVICE_URL` in `.env` points to your Hugging Face Space (e.g. `https://kashifkhaan-book-recommendations.hf.space`) so health and recommendations succeed.

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

**Setup**
- [ ] Dependencies installed (`npm install`)
- [ ] PostgreSQL running (Docker or local)
- [ ] `.env` file configured (DB + JWT + `ML_SERVICE_URL` for full tests)
- [ ] Server starts without errors (`npm run start:dev`)

**API & docs**
- [ ] Health check returns 200 and `api: healthy`
- [ ] With ML Space running, health shows `mlService: healthy`
- [ ] Swagger UI accessible at `/api`

**Auth & user data (database)**
- [ ] User registration works (user stored in `users` table)
- [ ] User login works and returns token
- [ ] JWT token authentication works (`GET /auth/me` returns user)
- [ ] Protected endpoints return 401 without token

**Search history (database)**
- [ ] `GET /search-history` returns empty array for new user
- [ ] After `POST /books/recommend`, search history has at least one entry
- [ ] `DELETE /search-history/:id` and `DELETE /search-history` work

**ML integration**
- [ ] `POST /books/recommend` returns book recommendations (ML service reachable)
- [ ] `GET /books/popular` returns popular books (no auth)

**Database verification (optional)**
- [ ] `SELECT * FROM "user"` shows registered user(s)
- [ ] `SELECT * FROM search_history` shows entries after recommendations

---

## 📝 Next Steps After Testing

1. **Test Frontend Integration:**
   - Point frontend `NEXT_PUBLIC_API_URL` to this backend
   - Test login/register, book search, search history in the UI

2. **Production Deployment:**
   - Follow `DEPLOYMENT_GUIDE.md`
   - Deploy backend to Render, DB to Render/Supabase/Railway
   - Keep `ML_SERVICE_URL` as your Hugging Face Space (e.g. `https://kashifkhaan-book-recommendations.hf.space`)

---

## 🎯 Quick Reference

```bash
# Start DB + backend
docker start book-recommendation-db
cd backend-nestjs
npm run start:dev

# Quick tests (replace YOUR_TOKEN after register/login)
curl http://localhost:3000/health
curl -X GET http://localhost:3000/auth/me -H "Authorization: Bearer YOUR_TOKEN"
curl -X GET http://localhost:3000/search-history -H "Authorization: Bearer YOUR_TOKEN"
curl -X POST http://localhost:3000/books/recommend -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"query\":\"mystery\",\"limit\":5}"
```

**API docs:** http://localhost:3000/api  
**ML Space (example):** https://kashifkhaan-book-recommendations.hf.space
