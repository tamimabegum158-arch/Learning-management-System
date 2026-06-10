Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "QUICK BACKEND CHECK & START" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is already running
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host ""
    Write-Host "SUCCESS: Backend IS running!" -ForegroundColor Green
    Write-Host "Backend URL: http://localhost:8080" -ForegroundColor Gray
    Write-Host ""
    Write-Host "You can now use the app at: http://localhost:4173" -ForegroundColor Green
    Write-Host ""
    pause
    exit 0
} catch {
    Write-Host "ERROR: Backend is NOT running!" -ForegroundColor Red
    Write-Host ""
}

Write-Host "==================================" -ForegroundColor Yellow
Write-Host "STARTING BACKEND NOW..." -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host ""

# Set JAVA_HOME
$jdk21Path = "C:\Program Files\Java\jdk-21"
if (Test-Path $jdk21Path) {
    $env:JAVA_HOME = $jdk21Path
    $env:PATH = "$jdk21Path\bin;$env:PATH"
    Write-Host "SUCCESS: Java configured" -ForegroundColor Green
} else {
    Write-Host "ERROR: JDK 21 not found!" -ForegroundColor Red
    Write-Host "Please install JDK 21" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Starting backend with H2 database..." -ForegroundColor Yellow
Write-Host "This will take 15-30 seconds..." -ForegroundColor Yellow
Write-Host ""

# Start backend
$env:SPRING_PROFILES_ACTIVE = "h2"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=h2"
