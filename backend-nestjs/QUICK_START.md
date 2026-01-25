# ⚡ Quick Start Commands

## 🚀 Complete Setup & Run (Copy & Paste)

### 1. Install Dependencies
```powershell
cd backend-nestjs
npm install
```

### 2. Start PostgreSQL (Docker)
```powershell
docker run --name book-recommendation-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=book_recommendation -p 5432:5432 -d postgres:15-alpine
```

**Wait 5 seconds for PostgreSQL to start, then verify:**
```powershell
docker ps
```

### 3. Create Environment File
```powershell
# Copy example file
Copy-Item .env.example .env

# Edit .env file with these values:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=password
# DB_DATABASE=book_recommendation
# JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
# JWT_EXPIRES_IN=7d
# PORT=3000
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:3000
```

### 4. Start the Server
```powershell
npm run start:dev
```

**Expected output:**
```
🚀 Application is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api
```

### 5. Test the API (Open New Terminal)

**Option A: Run Test Script**
```powershell
cd backend-nestjs
.\test-api.ps1
```

**Option B: Manual Tests**

```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing

# Register user
$body = @{username="testuser";email="test@test.com";password="password123"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing

# Get token from response, then:
$token = "YOUR_TOKEN_HERE"
$headers = @{Authorization="Bearer $token"}
Invoke-WebRequest -Uri "http://localhost:3000/auth/me" -Headers $headers -UseBasicParsing
```

---

## 📋 Individual Commands Reference

### Database Commands
```powershell
# Start PostgreSQL
docker start book-recommendation-db

# Stop PostgreSQL
docker stop book-recommendation-db

# Remove container (if needed)
docker rm book-recommendation-db

# View logs
docker logs book-recommendation-db
```

### Server Commands
```powershell
# Development (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Check if running
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
```

### Testing Commands
```powershell
# Health check
curl http://localhost:3000/health

# View API docs in browser
start http://localhost:3000/api

# Run test script
.\test-api.ps1
```

---

## 🔧 Troubleshooting Commands

### Check if port is in use
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :5432
```

### Kill process on port 3000
```powershell
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}
```

### Check PostgreSQL connection
```powershell
# If psql is installed
psql -h localhost -U postgres -d book_recommendation
# Password: password
```

### View server logs
```powershell
# Logs appear in the terminal where you ran npm run start:dev
```

---

## ✅ Verification Checklist

Run these to verify everything works:

```powershell
# 1. Check PostgreSQL
docker ps | Select-String "book-recommendation-db"

# 2. Check server
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing

# 3. Check API docs
start http://localhost:3000/api

# 4. Run full test
.\test-api.ps1
```

---

## 🎯 Expected Results

✅ **Health Check**: Returns `{"status":"healthy",...}`  
✅ **Registration**: Returns user object + JWT token  
✅ **Login**: Returns user object + JWT token  
✅ **Get Me**: Returns user object (requires token)  
✅ **Search History**: Returns empty array `[]` (requires token)  
✅ **API Docs**: Swagger UI opens in browser  

---

## 📝 Notes

- **First run**: Database tables are created automatically
- **Token**: Save the JWT token from register/login for protected endpoints
- **ML Service**: Book recommendations will fail until ML service is deployed
- **Port conflicts**: Change PORT in `.env` if 3000 is in use
