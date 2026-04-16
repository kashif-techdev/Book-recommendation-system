$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:3000"

function Invoke-JsonRequest {
  param(
    [Parameter(Mandatory=$true)][string]$Method,
    [Parameter(Mandatory=$true)][string]$Path,
    [hashtable]$Headers,
    $Body
  )

  $uri = "$baseUrl$Path"

  if ($Body -ne $null) {
    return Invoke-RestMethod -Uri $uri -Method $Method -Headers $Headers -Body $Body -ContentType "application/json" -TimeoutSec 120
  }

  return Invoke-RestMethod -Uri $uri -Method $Method -Headers $Headers -TimeoutSec 120
}

Write-Host "=== DB feature tests (auth + search history) ==="

Write-Host "1) HEALTH: GET /health"
$health = Invoke-JsonRequest -Method "GET" -Path "/health"
Write-Host ("   status=" + $health.status + " mlService=" + $health.services.mlService)

Write-Host "2) AUTH: register (or login if already exists)"
$suffix = Get-Random -Minimum 1000 -Maximum 999999
$username = "dbtestuser_$suffix"
$email = "dbtest_$suffix@example.com"
$password = "password123"

$headersJson = @{}
$registerBody = @{
  username = $username
  email = $email
  password = $password
} | ConvertTo-Json -Depth 5

$token = $null
$userId = $null

try {
  $register = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -ContentType "application/json" -Body $registerBody -TimeoutSec 120
  if ($register.success -ne $true) { throw "register failed: $($register.error)" }
  $token = $register.data.token
  $userId = $register.data.user.id
  Write-Host "   register OK userId=$userId"
} catch {
  Write-Host "   register failed, trying login..." -ForegroundColor Yellow
  $loginBody = @{
    username = $username
    password = $password
  } | ConvertTo-Json -Depth 5

  $login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -TimeoutSec 120
  $token = $login.data.token
  $userId = $login.data.user.id
  Write-Host "   login OK userId=$userId"
}

$authHeaders = @{ Authorization = "Bearer $token" }

Write-Host "3) AUTH: GET /auth/me"
$me = Invoke-JsonRequest -Method "GET" -Path "/auth/me" -Headers $authHeaders
if ($me.success -ne $true) { throw "me failed" }
Write-Host ("   me username=" + $me.data.user.username + " email=" + $me.data.user.email)

Write-Host "4) DB: GET /search-history (initial)"
$h1 = Invoke-JsonRequest -Method "GET" -Path "/search-history" -Headers $authHeaders
$count1 = 0
if ($h1.data.history) { $count1 = $h1.data.history.Count }
Write-Host "   history count=" $count1

Write-Host "5) ML integration call (to generate history): POST /books/recommend"
$recommendBody = @{
  query = "mystery"
  category = "All"
  tone = "All"
  limit = 3
} | ConvertTo-Json -Depth 5

$recOk = $false
try {
  $rec = Invoke-RestMethod -Uri "$baseUrl/books/recommend" -Method POST -Headers $authHeaders -Body $recommendBody -ContentType "application/json" -TimeoutSec 120
  if ($rec.success -eq $true) {
    $recOk = $true
    Write-Host ("   recommend OK total=" + $rec.data.total)
  } else {
    Write-Host "   recommend returned non-success" -ForegroundColor Yellow
  }
} catch {
  Write-Host ("   recommend failed (ML may be unavailable). Continuing. Error: " + $_.Exception.Message) -ForegroundColor Yellow
}

Write-Host "6) DB: GET /search-history (after recommend if possible)"
$h2 = Invoke-JsonRequest -Method "GET" -Path "/search-history" -Headers $authHeaders
$count2 = 0
if ($h2.data.history) { $count2 = $h2.data.history.Count }
Write-Host "   history count=" $count2
if (-not $recOk) {
  Write-Host "   Note: history count may still be 0 if ML step failed." -ForegroundColor Yellow
} elseif ($count2 -lt 1) {
  Write-Host "   WARNING: expected at least 1 history item after recommend, but got 0." -ForegroundColor Yellow
}

Write-Host "7) DB: DELETE /search-history/:id (delete first item)"
if ($count2 -gt 0) {
  $firstId = $h2.data.history[0].id
  Invoke-RestMethod -Uri "$baseUrl/search-history/$firstId" -Method DELETE -Headers $authHeaders -TimeoutSec 120 | Out-Null
  Write-Host "   delete-by-id OK id=" $firstId
} else {
  Write-Host "   skip delete-by-id (no history items)"
}

Write-Host "8) DB: GET /search-history (after delete-by-id)"
$h3 = Invoke-JsonRequest -Method "GET" -Path "/search-history" -Headers $authHeaders
$count3 = 0
if ($h3.data.history) { $count3 = $h3.data.history.Count }
Write-Host "   history count=" $count3

Write-Host "9) DB: DELETE /search-history (all) to clean up"
Invoke-RestMethod -Uri "$baseUrl/search-history" -Method DELETE -Headers $authHeaders -TimeoutSec 120 | Out-Null
Write-Host "   delete-all OK"

Write-Host "10) DB: GET /search-history (after delete-all)"
$h4 = Invoke-JsonRequest -Method "GET" -Path "/search-history" -Headers $authHeaders
$count4 = 0
if ($h4.data.history) { $count4 = $h4.data.history.Count }
Write-Host "   history count=" $count4

Write-Host "11) PUBLIC: GET /books/popular (no auth)"
$pop = Invoke-JsonRequest -Method "GET" -Path "/books/popular"
Write-Host ("   popular total=" + $pop.data.total)

Write-Host "=== DONE ==="

