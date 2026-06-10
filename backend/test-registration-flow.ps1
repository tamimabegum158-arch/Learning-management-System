# Complete Registration Flow Test
# This tests the ENTIRE flow from frontend to backend

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Complete Registration Flow Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if backend is running
Write-Host "STEP 1: Checking Backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET -TimeoutSec 3
    Write-Host "SUCCESS: Backend is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Backend is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start backend first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  .\start-backend.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then run this test again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Check if frontend is running
Write-Host "STEP 2: Checking Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:4173" -Method GET -TimeoutSec 3 -UseBasicParsing
    if ($frontend.StatusCode -eq 200) {
        Write-Host "SUCCESS: Frontend is running" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING: Frontend is NOT running" -ForegroundColor Yellow
    Write-Host "You can still test backend APIs directly" -ForegroundColor Gray
}

Write-Host ""

# Step 3: Test Registration Endpoint Directly
Write-Host "STEP 3: Testing Student Registration..." -ForegroundColor Yellow
$registerBody = @{
    fullName = "Test Student"
    email = "teststudent@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register/student" -Method POST -Body $registerBody -ContentType "application/json"
    
    if ($response.success -eq $true) {
        Write-Host "SUCCESS: Student registration works!" -ForegroundColor Green
        Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
        Write-Host "  Role: $($response.data.role)" -ForegroundColor Gray
        Write-Host "  Token: $($response.data.accessToken.Substring(0, 30))..." -ForegroundColor Gray
        $studentToken = $response.data.accessToken
    } else {
        Write-Host "ERROR: Registration failed" -ForegroundColor Red
        Write-Host "  Message: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Registration API failed" -ForegroundColor Red
    Write-Host "  Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Error: $($errorDetail.message)" -ForegroundColor Red
    } else {
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

Write-Host ""

# Step 4: Test Instructor Registration
Write-Host "STEP 4: Testing Instructor Registration..." -ForegroundColor Yellow
$instructorBody = @{
    fullName = "Test Instructor"
    email = "testinstructor@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register/instructor" -Method POST -Body $instructorBody -ContentType "application/json"
    
    if ($response.success -eq $true) {
        Write-Host "SUCCESS: Instructor registration works!" -ForegroundColor Green
        Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
        Write-Host "  Role: $($response.data.role)" -ForegroundColor Gray
        $instructorToken = $response.data.accessToken
    } else {
        Write-Host "ERROR: Registration failed" -ForegroundColor Red
        Write-Host "  Message: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Registration API failed" -ForegroundColor Red
    Write-Host "  Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Error: $($errorDetail.message)" -ForegroundColor Red
    }
}

Write-Host ""

# Step 5: Test Login
Write-Host "STEP 5: Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "teststudent@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($response.success -eq $true) {
        Write-Host "SUCCESS: Login works!" -ForegroundColor Green
        Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
        Write-Host "  Role: $($response.data.role)" -ForegroundColor Gray
    } else {
        Write-Host "ERROR: Login failed" -ForegroundColor Red
        Write-Host "  Message: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Login API failed" -ForegroundColor Red
    Write-Host "  Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Error: $($errorDetail.message)" -ForegroundColor Red
    }
}

Write-Host ""

# Step 6: Test CORS (Frontend to Backend)
Write-Host "STEP 6: Testing Frontend-to-Backend Connection..." -ForegroundColor Yellow
try {
    $corsTest = Invoke-RestMethod -Uri "http://localhost:4173/api/v1/auth/register/student" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "SUCCESS: Frontend can reach backend (CORS works)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "SUCCESS: Frontend can reach backend (email already registered)" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Frontend-to-Backend connection issue" -ForegroundColor Yellow
        Write-Host "  Error: $_" -ForegroundColor Gray
        Write-Host "  This might be okay if frontend is not running" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "If you see SUCCESS messages above:" -ForegroundColor Yellow
Write-Host "  The backend registration is working correctly!" -ForegroundColor Green
Write-Host ""
Write-Host "If registration button doesn't work in frontend:" -ForegroundColor Yellow
Write-Host "  1. Make sure BOTH backend and frontend are running" -ForegroundColor Gray
Write-Host "  2. Open browser console (F12) and check for errors" -ForegroundColor Gray
Write-Host "  3. Check Network tab to see the actual request" -ForegroundColor Gray
Write-Host ""
Write-Host "To test in browser:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:4173" -ForegroundColor Gray
Write-Host "  2. Click 'Account' or 'Get Started'" -ForegroundColor Gray
Write-Host "  3. Click 'Register' tab" -ForegroundColor Gray
Write-Host "  4. Fill in:" -ForegroundColor Gray
Write-Host "     - Full name: Test User" -ForegroundColor Gray
Write-Host "     - Email: testuser123@example.com" -ForegroundColor Gray
Write-Host "     - Password: password123" -ForegroundColor Gray
Write-Host "     - Click 'Student' role button" -ForegroundColor Gray
Write-Host "  5. Click 'Register as Student'" -ForegroundColor Gray
Write-Host ""
