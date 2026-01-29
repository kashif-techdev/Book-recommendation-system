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

# Test 4: Search History (initial)
Write-Host "4. Testing Search History..." -ForegroundColor Green
try {
    $historyResponse = Invoke-WebRequest -Uri "$baseUrl/search-history" -Headers $headers -UseBasicParsing
    $historyData = $historyResponse.Content | ConvertFrom-Json
    $histCount = if ($historyData.data.history) { $historyData.data.history.Count } else { 0 }
    if ($historyData.success) {
        Write-Host "   ✓ Search history: $histCount items" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Search history failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Search history failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 5: Book Recommendations (ML service)
Write-Host "5. Testing Book Recommendations (ML)..." -ForegroundColor Green
try {
    $recommendBody = '{"query":"mystery","category":"All","tone":"All","limit":5}'
    $recResponse = Invoke-WebRequest -Uri "$baseUrl/books/recommend" -Method POST -Headers $headers -Body $recommendBody -ContentType "application/json" -UseBasicParsing
    $recData = $recResponse.Content | ConvertFrom-Json
    Write-Host "   ✓ Recommendations: total=$($recData.data.total) books" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Recommendations failed (is ML_SERVICE_URL set?): $_" -ForegroundColor Red
}

Write-Host ""

# Test 6: Search History after recommend (should have entry)
Write-Host "6. Testing Search History (after recommend)..." -ForegroundColor Green
try {
    $historyResponse2 = Invoke-WebRequest -Uri "$baseUrl/search-history" -Headers $headers -UseBasicParsing
    $historyData2 = $historyResponse2.Content | ConvertFrom-Json
    $histCount2 = if ($historyData2.data.history) { $historyData2.data.history.Count } else { 0 }
    if ($historyData2.success -and $histCount2 -gt 0) {
        Write-Host "   ✓ History saved to DB: $histCount2 items" -ForegroundColor Green
    } else {
        Write-Host "   History items: $histCount2" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Search history failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 7: Delete all search history
Write-Host "7. Testing DELETE /search-history..." -ForegroundColor Green
try {
    Invoke-WebRequest -Uri "$baseUrl/search-history" -Method DELETE -Headers $headers -UseBasicParsing | Out-Null
    Write-Host "   ✓ All history deleted" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Delete failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 8: Popular Books (no auth)
Write-Host "8. Testing GET /books/popular..." -ForegroundColor Green
try {
    $popResponse = Invoke-WebRequest -Uri "$baseUrl/books/popular" -UseBasicParsing
    $popData = $popResponse.Content | ConvertFrom-Json
    Write-Host "   ✓ Popular books: total=$($popData.data.total)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Popular books failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 9: API Documentation
Write-Host "9. Testing API Documentation..." -ForegroundColor Green
try {
    $docsResponse = Invoke-WebRequest -Uri "$baseUrl/api" -UseBasicParsing
    Write-Host "   ✓ API docs: http://localhost:3000/api" -ForegroundColor Green
} catch {
    Write-Host "   ✗ API documentation not accessible" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Tests Completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Visit http://localhost:3000/api for Swagger UI" -ForegroundColor Yellow
Write-Host ""
