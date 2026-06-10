# Backend Diagnostic Tool
# This script checks if backend is running and helps troubleshoot issues

Write-Host "========================================"
Write-Host "Backend Diagnostic Tool"
Write-Host "========================================"
Write-Host ""

# Check 1: Is backend running?
Write-Host "Check 1: Testing backend connection..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "SUCCESS: Backend is RUNNING on port 8080" -ForegroundColor Green
        $health = $response.Content | ConvertFrom-Json
        Write-Host "Status: $($health.message)"
        Write-Host ""
        Write-Host "You can now:" -ForegroundColor Yellow
        Write-Host "  - Open http://localhost:4173 in your browser"
        Write-Host "  - Run test-auth.ps1 to test APIs"
        exit 0
    }
} catch {
    Write-Host "ERROR: Backend is NOT running!" -ForegroundColor Red
    Write-Host ""
}

# Check 2: Is port 8080 in use?
Write-Host "Check 2: Checking port 8080..."
$portInUse = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "WARNING: Port 8080 is IN USE" -ForegroundColor Yellow
    Write-Host "Process ID: $($portInUse.OwningProcess)"
    
    try {
        $process = Get-Process -Id $portInUse.OwningProcess -ErrorAction Stop
        Write-Host "Process: $($process.ProcessName)"
        
        if ($process.ProcessName -eq "java") {
            Write-Host ""
            Write-Host "A Java process is already using port 8080." -ForegroundColor Yellow
            Write-Host "This might be another instance of your backend."
            Write-Host ""
            Write-Host "Options:" -ForegroundColor Yellow
            Write-Host "  1. Use the existing backend (it might already be running)"
            Write-Host "  2. Kill it and restart: taskkill /F /PID $($portInUse.OwningProcess)"
        }
    } catch {
        Write-Host "Unknown process"
    }
} else {
    Write-Host "SUCCESS: Port 8080 is FREE" -ForegroundColor Green
}

Write-Host ""

# Check 3: Java installation
Write-Host "Check 3: Checking Java installation..."
try {
    $javaVersion = & java -version 2>&1
    $versionMatch = $javaVersion | Select-String 'version "([0-9]+)'
    if ($versionMatch) {
        $version = $versionMatch.Matches.Groups[1].Value
        Write-Host "SUCCESS: Java $version is installed" -ForegroundColor Green
    } else {
        Write-Host "SUCCESS: Java is installed" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR: Java is NOT installed!" -ForegroundColor Red
    Write-Host "Please install JDK 21"
}

Write-Host ""

# Check 4: Maven wrapper
Write-Host "Check 4: Checking Maven wrapper..."
if (Test-Path ".\mvnw.cmd") {
    Write-Host "SUCCESS: Maven wrapper found" -ForegroundColor Green
} else {
    Write-Host "ERROR: Maven wrapper NOT found!" -ForegroundColor Red
    Write-Host "Navigate to backend folder first:"
    Write-Host "  cd backend"
}

Write-Host ""
Write-Host "========================================"
Write-Host "Solution"
Write-Host "========================================"
Write-Host ""

if (-not $portInUse) {
    Write-Host "To start the backend, run:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  cd backend" -ForegroundColor Cyan
    Write-Host "  .\start-backend.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  cd backend" -ForegroundColor Cyan
    Write-Host "  .\run-local.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Wait for 'Started AiLmsApplication' message, then test again."
    Write-Host ""
} else {
    Write-Host "Backend might already be running. Try:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Open http://localhost:8080/api/health in browser"
    Write-Host "  2. If it works, backend is running fine!"
    Write-Host "  3. If not, kill the process and restart"
    Write-Host ""
}
