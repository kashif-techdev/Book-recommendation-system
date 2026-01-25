# Test API Endpoints Script
# Run this after starting the server

$baseUrl = "http://localhost:3000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NestJS Backend API Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Yellow
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    Write-Host "   ✓ Health check passed" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Health check failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: User Registration
Write-Host "2. Testing User Registration..." -ForegroundColor Green
try {
    $registerBody = @{
        username = "testuser_$(Get-Random)"
        email = "test_$(Get-Random)@example.com"
        password = "password123"
    } | ConvertTo-Json

    $registerResponse = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing
    $registerData = $registerResponse.Content | ConvertFrom-Json
    
    if ($registerData.success) {
        $token = $registerData.data.token
        Write-Host "   ✓ Registration successful" -ForegroundColor Green
        Write-Host "   User ID: $($registerData.data.user.id)" -ForegroundColor Yellow
        Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
    } else {
        Write-Host "   ✗ Registration failed: $($registerData.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ✗ Registration failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error details: $responseBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# Test 3: Get Current User (Protected)
Write-Host "3. Testing Get Current User (Protected Endpoint)..." -ForegroundColor Green
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $meResponse = Invoke-WebRequest -Uri "$baseUrl/auth/me" -Headers $headers -UseBasicParsing
    $meData = $meResponse.Content | ConvertFrom-Json
    
    if ($meData.success) {
        Write-Host "   ✓ Authentication successful" -ForegroundColor Green
        Write-Host "   Username: $($meData.data.user.username)" -ForegroundColor Yellow
        Write-Host "   Email: $($meData.data.user.email)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✗ Authentication failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Authentication failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 4: Search History
Write-Host "4. Testing Search History..." -ForegroundColor Green
try {
    $historyResponse = Invoke-WebRequest -Uri "$baseUrl/search-history" -Headers $headers -UseBasicParsing
    $historyData = $historyResponse.Content | ConvertFrom-Json
    
    if ($historyData.success) {
        Write-Host "   ✓ Search history endpoint works" -ForegroundColor Green
        Write-Host "   History items: $($historyData.data.history.Count)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✗ Search history failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Search history failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 5: API Documentation
Write-Host "5. Testing API Documentation..." -ForegroundColor Green
try {
    $docsResponse = Invoke-WebRequest -Uri "$baseUrl/api" -UseBasicParsing
    Write-Host "   ✓ API documentation accessible" -ForegroundColor Green
    Write-Host "   Visit: http://localhost:3000/api" -ForegroundColor Yellow
} catch {
    Write-Host "   ✗ API documentation not accessible" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Tests Completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  - Visit http://localhost:3000/api for Swagger UI" -ForegroundColor Gray
Write-Host "  - Test book recommendations (requires ML service)" -ForegroundColor Gray
Write-Host ""
