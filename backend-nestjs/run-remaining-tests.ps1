# Remaining backend tests: search history, recommend, delete, popular
$baseUrl = "http://localhost:3000"
Write-Host "=== Backend remaining tests ===" -ForegroundColor Cyan

# Login
$loginBody = '{"username":"testuser","password":"password123"}'
$r = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $r.data.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "1. Login OK" -ForegroundColor Green

# GET /search-history (initial)
$h = Invoke-RestMethod -Uri "$baseUrl/search-history" -Headers $headers
$count = if ($h.data.history) { $h.data.history.Count } else { 0 }
Write-Host "2. GET /search-history: $count items" -ForegroundColor Green

# POST /books/recommend
$body = '{"query":"mystery","category":"All","tone":"All","limit":5}'
$rec = Invoke-RestMethod -Uri "$baseUrl/books/recommend" -Method POST -Headers $headers -ContentType "application/json" -Body $body
Write-Host "3. POST /books/recommend: total=$($rec.data.total) books" -ForegroundColor Green

# GET /search-history again (should have 1+ entry)
$h2 = Invoke-RestMethod -Uri "$baseUrl/search-history" -Headers $headers
$count2 = if ($h2.data.history) { $h2.data.history.Count } else { 0 }
Write-Host "4. GET /search-history after recommend: $count2 items" -ForegroundColor Green
if ($count2 -gt 0) { Write-Host "   History saved to DB: OK" -ForegroundColor Yellow }

# DELETE all search history
Invoke-RestMethod -Uri "$baseUrl/search-history" -Method DELETE -Headers $headers | Out-Null
Write-Host "5. DELETE /search-history (all): OK" -ForegroundColor Green

# GET /search-history (should be empty)
$h3 = Invoke-RestMethod -Uri "$baseUrl/search-history" -Headers $headers
$count3 = if ($h3.data.history) { $h3.data.history.Count } else { 0 }
Write-Host "6. GET /search-history after delete: $count3 items" -ForegroundColor Green

# GET /books/popular (no auth)
$pop = Invoke-RestMethod -Uri "$baseUrl/books/popular"
Write-Host "7. GET /books/popular: total=$($pop.data.total)" -ForegroundColor Green

Write-Host ""
Write-Host "=== All remaining tests completed ===" -ForegroundColor Cyan
