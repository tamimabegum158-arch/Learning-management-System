Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "     AI LMS - COMPLETE STARTUP (BACKEND + FRONTEND)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:SPRING_PROFILES_ACTIVE = "h2"

Write-Host "Starting Backend with H2 Database..." -ForegroundColor Yellow
Write-Host "Profile: h2" -ForegroundColor Gray
Write-Host "Database: H2 In-Memory" -ForegroundColor Gray
Write-Host "URL: http://localhost:8080" -ForegroundColor Gray
Write-Host ""

# Start backend in background
$backendProcess = Start-Process -FilePath ".\mvnw.cmd" -ArgumentList "spring-boot:run `"-Dspring-boot.run.profiles=h2`"" -PassThru -NoNewWindow -WorkingDirectory $PWD

Write-Host "Backend process started (PID: $($backendProcess.Id))" -ForegroundColor Green
Write-Host "Waiting for backend to start (30 seconds)..." -ForegroundColor Yellow
Write-Host ""

# Wait for backend to start
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "     BACKEND IS RUNNING" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now open ANOTHER terminal and run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  cd frontend" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Then visit: http://localhost:4173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop backend when done." -ForegroundColor Gray
Write-Host ""

# Wait for process
$backendProcess | Wait-Process
