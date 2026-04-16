$ErrorActionPreference = "Stop"

$body = '{"query":"mystery","category":"All","tone":"All","limit":5}'
$res = Invoke-RestMethod -Uri "http://localhost:3000/books/recommend" -Method POST -ContentType "application/json" -Body $body

Write-Output ("success=" + $res.success)
Write-Output ("total=" + $res.data.total)

