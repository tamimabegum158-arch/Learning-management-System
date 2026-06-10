Write-Host "==================================" -ForegroundColor Cyan
Write-Host "STARTING BACKEND WITH H2 DATABASE" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Set JAVA_HOME to JDK 21
$jdk21Path = "C:\Program Files\Java\jdk-21"
if (Test-Path $jdk21Path) {
    $env:JAVA_HOME = $jdk21Path
    $env:PATH = "$jdk21Path\bin;$env:PATH"
    Write-Host "SUCCESS: JAVA_HOME set to: $jdk21Path" -ForegroundColor Green
} else {
    Write-Host "ERROR: JDK 21 not found at $jdk21Path" -ForegroundColor Red
    Write-Host "Please install JDK 21 or update the path" -ForegroundColor Yellow
    exit 1
}

# Check Java
Write-Host "Checking Java..."
try {
    $null = Get-Command java -ErrorAction Stop
    Write-Host "SUCCESS: Java is installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Java is NOT installed or not in PATH!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting Backend with H2 In-Memory Database..." -ForegroundColor Yellow
Write-Host "This will create sample courses automatically!" -ForegroundColor Yellow
Write-Host ""

# Start with H2 profile
$env:SPRING_PROFILES_ACTIVE = "h2"

Write-Host "Profile: h2 (uses H2 in-memory database)" -ForegroundColor Cyan
Write-Host "Database: jdbc:h2:mem:testdb" -ForegroundColor Cyan
Write-Host ""

# Build and Run
Write-Host "Building and starting backend..." -ForegroundColor Yellow
Write-Host ""

try {
    .\mvnw.cmd clean spring-boot:run "-Dspring-boot.run.profiles=h2"
} catch {
    Write-Host ""
    Write-Host "ERROR: Backend failed to start!" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    exit 1
}
