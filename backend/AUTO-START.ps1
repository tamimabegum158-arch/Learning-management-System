Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STARTING BACKEND - PLEASE WAIT 30 SECONDS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:SPRING_PROFILES_ACTIVE = "h2"

Write-Host "Starting backend with H2 database..." -ForegroundColor Yellow
Write-Host ""

# Run Maven
& ".\mvnw.cmd" spring-boot:run "-Dspring-boot.run.profiles=h2"
