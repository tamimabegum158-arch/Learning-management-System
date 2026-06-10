# Start Backend with Error Handling
# This script provides better error messages

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "Starting AI LMS Backend"
Write-Host "========================================"
Write-Host ""

# Check Java
Write-Host "Checking Java..."
try {
    $null = Get-Command java -ErrorAction Stop
    Write-Host "Java is installed" -ForegroundColor Green
} catch {
    Write-Host "Java is NOT installed or not in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install JDK 21 from:" -ForegroundColor Yellow
    Write-Host "https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Maven Wrapper
Write-Host "Checking Maven Wrapper..."
if (Test-Path ".\mvnw.cmd") {
    Write-Host "Maven wrapper found" -ForegroundColor Green
} else {
    Write-Host "Maven wrapper NOT found!" -ForegroundColor Red
    Write-Host "Please run: mvn -N io.takari:maven-takari-plugin:generate" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting Spring Boot on port 8080..." -ForegroundColor Yellow
Write-Host "Profile: test (H2 in-memory database)"
Write-Host ""

# Set correct JAVA_HOME to JDK 21
$jdk21Path = "C:\Program Files\Java\jdk-21"
if (Test-Path $jdk21Path) {
    $env:JAVA_HOME = $jdk21Path
    $env:PATH = "$jdk21Path\bin;$env:PATH"
    Write-Host "JAVA_HOME set to: $jdk21Path" -ForegroundColor Green
} else {
    Write-Host "WARNING: JDK 21 not found at $jdk21Path" -ForegroundColor Yellow
    Write-Host "Using system JAVA_HOME: $env:JAVA_HOME"
}

Write-Host "Press Ctrl+C to stop the server"
Write-Host ""

# Set environment variables
$env:SPRING_PROFILES_ACTIVE = 'test'
$env:SERVER_PORT = '8080'

# Start backend
try {
    & .\mvnw.cmd spring-boot:run
} catch {
    Write-Host ""
    Write-Host "Failed to start backend!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "1. Make sure port 8080 is not already in use"
    Write-Host "2. Check if another Java process is running"
    Write-Host "3. Run 'taskkill /F /IM java.exe' to stop all Java processes"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
