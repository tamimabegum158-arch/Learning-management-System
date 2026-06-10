# Authentication Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Backend Not Running
**Symptom:** Registration/login fails with connection error

**Solution:**
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\backend"
.\run-local.ps1
```
Wait for "Started AiLmsApplication" message before testing.

---

### Issue 2: Frontend Not Running
**Symptom:** Cannot access http://localhost:4173

**Solution:**
Open a NEW terminal:
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\frontend"
npm run dev
```

---

### Issue 3: CORS Error
**Symptom:** Console shows CORS policy error

**Solution:** 
- Backend and frontend must be on correct ports
- Backend: 8080
- Frontend: 4173
- CORS is already configured in SecurityConfig.java

---

### Issue 4: "Email is already registered"
**Symptom:** Registration fails with duplicate email error

**Solution:**
- Use a different email address
- Or clear the database (restart backend with test profile)

---

### Issue 5: "Invalid email or password"
**Symptom:** Login fails

**Solution:**
1. Make sure you registered first
2. Password must be at least 8 characters
3. Use the exact email and password from registration

---

### Issue 6: Roles Not Found
**Symptom:** Registration fails with "Role not configured"

**Solution:**
The DataInitializer should auto-create roles. If not:
1. Check backend logs for errors
2. Restart backend
3. Roles are created automatically on startup

---

## Testing Steps

### Step 1: Start Backend
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\backend"
.\run-local.ps1
```

### Step 2: Verify Backend is Running
Open browser: http://localhost:8080/api/health

Should see: `{"success":true,"message":"Service is healthy","data":null}`

### Step 3: Test APIs with Script
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\backend"
.\test-auth.ps1
```

This will test:
- ✓ Health check
- ✓ Student registration
- ✓ Instructor registration
- ✓ Student login
- ✓ Instructor login
- ✓ Fetch courses

### Step 4: Test Frontend

1. Start frontend (new terminal):
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\frontend"
npm run dev
```

2. Open: http://localhost:4173

3. Click "Account" or "Get Started"

4. **Register:**
   - Full name: Test User
   - Email: testuser@example.com
   - Password: password123
   - Select role: Student or Instructor
   - Click "Register as Student" or "Register as Instructor"

5. **Login:**
   - Email: testuser@example.com
   - Password: password123
   - Click "Sign In"

6. After successful login:
   - You should see "Dashboard" or "Profile" in navigation
   - Click it to view your profile page

---

## Quick Test Credentials

After starting backend, you can use:

**Student Account:**
- Email: student@test.com
- Password: password123

**Instructor Account:**
- Email: instructor@test.com
- Password: password123

Run `.\test-auth.ps1` to create these accounts automatically.

---

## API Endpoints

### Register Student
```
POST http://localhost:8080/api/v1/auth/register/student
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Register Instructor
```
POST http://localhost:8080/api/v1/auth/register/instructor
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

### Login
```
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Courses
```
GET http://localhost:8080/api/v1/courses
```

---

## Check Logs

### Backend Logs
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\backend"
type backend.log
```

### Frontend Logs
Check browser console (F12) for errors

---

## Common Error Messages

### "Unable to connect to the remote server"
→ Backend is not running. Start it with `.\run-local.ps1`

### "Role not configured: STUDENT"
→ DataInitializer didn't run. Restart backend.

### "Email is already registered"
→ Use a different email or clear database

### "Invalid email or password"
→ Wrong credentials. Register first or use correct password

### "Failed to fetch"
→ Backend not running or wrong URL

---

## Reset Everything

If nothing works, start fresh:

1. Stop backend (Ctrl+C)
2. Stop frontend (Ctrl+C)
3. Delete H2 database files (if any)
4. Restart backend: `.\run-local.ps1`
5. Restart frontend: `npm run dev`
6. Test with: `.\test-auth.ps1`
