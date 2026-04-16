$ErrorActionPreference = "Stop"

$url = "http://localhost:3000/health"

try {
  $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
  Write-Output "STATUS=$($r.StatusCode)"
  Write-Output $r.Content
} catch {
  Write-Output "HEALTH_FAILED"
  Write-Output $_.Exception.Message
  throw
}

