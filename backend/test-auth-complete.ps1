Write-Host "==================================" -ForegroundColor Cyan
Write-Host "AUTHENTICATION TEST & DIAGNOSIS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Backend is Running
Write-Host "STEP 1: Checking if Backend is Running..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ Backend is running on http://localhost:8080" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Backend is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  .\start-backend.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Wait for 'Started AiLmsApplication' message before testing." -ForegroundColor Yellow
    exit 1
}

# Step 2: Check if Frontend is Running
Write-Host "STEP 2: Checking if Frontend is Running..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:4173" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ Frontend is running on http://localhost:4173" -ForegroundColor Green
} catch {
    Write-Host "⚠ Frontend might not be running" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "TESTING AUTHENTICATION APIS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Yellow
Write-Host ""

# Step 3: Test Student Registration
Write-Host "TEST 1: Student Registration" -ForegroundColor Yellow
$timestamp = Get-Date -Format "HHmmss"
$testEmail = "test${timestamp}@example.com"
$registerBody = @{
    fullName = "Test Student"
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

try {
    Write-Host "  Registering: $testEmail" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register/student" -Method POST -Body $registerBody -ContentType "application/json"
    
    if ($response.success -eq $true) {
        Write-Host "✓ SUCCESS: Student registration works!" -ForegroundColor Green
        Write-Host "  Response: $($response.message)" -ForegroundColor Gray
        Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
        Write-Host "  Role: $($response.data.role)" -ForegroundColor Gray
        $studentToken = $response.data.accessToken
    } else {
        Write-Host "✗ FAILED: Registration returned success=false" -ForegroundColor Red
        Write-Host "  Message: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ ERROR: Registration API failed" -ForegroundColor Red
    $errorMsg = $_.Exception.Message
    if ($errorMsg -match "Response status code") {
        Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    Write-Host "  Details: $errorMsg" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common causes:" -ForegroundColor Yellow
    Write-Host "  1. Backend not fully started (wait for 'Started AiLmsApplication')" -ForegroundColor Gray
    Write-Host "  2. Database not initialized (roles missing)" -ForegroundColor Gray
    Write-Host "  3. CORS configuration issue" -ForegroundColor Gray
}

Write-Host ""

# Step 4: Test Instructor Registration
Write-Host "TEST 2: Instructor Registration" -ForegroundColor Yellow
$instructorEmail = "instructor${timestamp}@example.com"
$instructorBody = @{
    fullName = "Test Instructor"
    email = $instructorEmail
    password = "password123"
} | ConvertTo-Json

try {
    Write-Host "  Registering: $instructorEmail" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register/instructor" -Method POST -Body $instructorBody -ContentType "application/json"
    
    if ($response.success -eq $true) {
        Write-Host "✓ SUCCESS: Instructor registration works!" -ForegroundColor Green
        Write-Host "  Response: $($response.message)" -ForegroundColor Gray
        Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
        Write-Host "  Role: $($response.data.role)" -ForegroundColor Gray
    } else {
        Write-Host "✗ FAILED: Registration returned success=false" -ForegroundColor Red
        Write-Host "  Message: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ ERROR: Instructor registration failed" -ForegroundColor Red
    Write-Host "  Details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 5: Test Login
Write-Host "TEST 3: Login" -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

try {
    Write-Host "  Logging in with: $testEmail" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($response.success -eq $true) {
        Write-Host "✓ SUCCESS: Login works!" -ForegroundColor Green
        Write-Host "  Response: $($response.message)" -ForegroundColor Gray
        Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
        Write-Host "  Role: $($response.data.role)" -ForegroundColor Gray
        Write-Host "  Token: $($response.data.accessToken.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "✗ FAILED: Login returned success=false" -ForegroundColor Red
        Write-Host "  Message: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ ERROR: Login API failed" -ForegroundColor Red
    Write-Host "  Details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 6: Test CORS (Frontend to Backend)
Write-Host "TEST 4: CORS Test (Frontend -> Backend Connection)" -ForegroundColor Yellow
try {
    $corsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/courses" -Method GET -Headers @{
        "Origin" = "http://localhost:4173"
    } -TimeoutSec 3 -ErrorAction Stop
    
    $corsHeader = $corsResponse.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "✓ SUCCESS: CORS is working!" -ForegroundColor Green
        Write-Host "  Access-Control-Allow-Origin: $corsHeader" -ForegroundColor Gray
    } else {
        Write-Host "⚠ WARNING: CORS headers not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ ERROR: CORS test failed" -ForegroundColor Red
    Write-Host "  Details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed:" -ForegroundColor Green
Write-Host "  ✓ Your backend is working correctly" -ForegroundColor Gray
Write-Host "  ✓ Registration and Login APIs are functional" -ForegroundColor Gray
Write-Host "  ✓ The issue is in the frontend code" -ForegroundColor Gray
Write-Host ""
Write-Host "If tests failed:" -ForegroundColor Red
Write-Host "  1. Make sure backend is fully started" -ForegroundColor Gray
Write-Host "  2. Check backend terminal for errors" -ForegroundColor Gray
Write-Host "  3. Restart backend: .\start-backend.ps1" -ForegroundColor Gray
Write-Host ""
