# Test Authentication APIs
# Run this script after starting the backend

$baseUrl = "http://localhost:8080/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Authentication APIs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✓ Backend is running" -ForegroundColor Green
    Write-Host "  Response: $($health.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend is NOT running!" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Yellow
    Write-Host "  .\run-local.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Register Student
Write-Host "Test 2: Register Student..." -ForegroundColor Yellow
$registerStudentBody = @{
    fullName = "John Student"
    email = "student@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/auth/register/student" -Method POST -Body $registerStudentBody -ContentType "application/json"
    Write-Host "✓ Student registration successful" -ForegroundColor Green
    Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
    Write-Host "  Role: $($response.data.role)" -ForegroundColor Gray
    $studentToken = $response.data.accessToken
} catch {
    Write-Host "✗ Student registration failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Register Instructor
Write-Host "Test 3: Register Instructor..." -ForegroundColor Yellow
$registerInstructorBody = @{
    fullName = "Jane Instructor"
    email = "instructor@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/auth/register/instructor" -Method POST -Body $registerInstructorBody -ContentType "application/json"
    Write-Host "✓ Instructor registration successful" -ForegroundColor Green
    Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
    Write-Host "  Role: $($response.data.role)" -ForegroundColor Gray
    $instructorToken = $response.data.accessToken
} catch {
    Write-Host "✗ Instructor registration failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 4: Login Student
Write-Host "Test 4: Login Student..." -ForegroundColor Yellow
$loginBody = @{
    email = "student@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Student login successful" -ForegroundColor Green
    Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
    Write-Host "  Token: $($response.data.accessToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Student login failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 5: Login Instructor
Write-Host "Test 5: Login Instructor..." -ForegroundColor Yellow
$loginBody = @{
    email = "instructor@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Instructor login successful" -ForegroundColor Green
    Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
    Write-Host "  Token: $($response.data.accessToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Instructor login failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 6: Get Courses (Public)
Write-Host "Test 6: Get Courses..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/courses" -Method GET
    Write-Host "✓ Courses fetched successfully" -ForegroundColor Green
    Write-Host "  Total courses: $($response.data.totalElements)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to fetch courses" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now test the frontend:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:4173" -ForegroundColor Gray
Write-Host "  2. Click 'Account' or 'Get Started'" -ForegroundColor Gray
Write-Host "  3. Register with any email and password (min 8 chars)" -ForegroundColor Gray
Write-Host "  4. Login with your credentials" -ForegroundColor Gray
Write-Host ""
