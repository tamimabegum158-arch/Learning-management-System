# Authentication Failed - Quick Fix Guide

## Most Common Cause: Backend Not Running

90% of "authentication failed" errors happen because **the backend is not running** when you try to register or login.

---

## ✅ Step-by-Step Fix

### 1. **Start the Backend FIRST**

Open a terminal and run:
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\backend"
.\start-backend.ps1
```

**WAIT** for this message:
```
Started AiLmsApplication in X.XXX seconds
```

✅ Backend is ready when you see: `http://localhost:8080`

---

### 2. **Start the Frontend** (in a NEW terminal)

```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\frontend"
npm run dev
```

Frontend should show: `http://localhost:4173`

---

### 3. **Test Registration**

Open browser: **http://localhost:4173**

1. Click "Account" or "Get Started"
2. Click "Register" tab
3. Fill in:
   - **Full name:** Test User
   - **Email:** testuser@example.com
   - **Password:** password123 (minimum 8 characters)
   - Select "Student"
4. Click "Register as Student"

**You should see:** ✅ "Registration successful! You are now registered as a student."

---

## 🔍 Run Diagnostic Test

If it still fails, run this test to find the exact issue:

```powershell
cd backend
.\test-auth-complete.ps1
```

This will test:
- ✓ Backend connectivity
- ✓ Student registration API
- ✓ Instructor registration API
- ✓ Login API
- ✓ CORS (frontend-backend connection)

---

## 🚨 Common Errors & Solutions

### Error: "Authentication failed: fetch failed"
**Cause:** Backend is not running  
**Fix:** Start backend with `.\start-backend.ps1`

### Error: "Authentication failed: Request failed with status code 403"
**Cause:** CORS issue or security config problem  
**Fix:** 
1. Check backend is using correct port (8080)
2. Verify SecurityConfig allows `/v1/auth/**`

### Error: "Authentication failed: Request failed with status code 500"
**Cause:** Backend error (check terminal)  
**Fix:** 
1. Look at backend terminal for error messages
2. Common issue: Roles not initialized
3. Restart backend

### Error: "Authentication failed: Invalid email or password"
**Cause:** Wrong credentials during login  
**Fix:** 
1. Make sure you registered first
2. Use the exact same email and password
3. Password must be 8+ characters

### Error: "Authentication failed: Email is already registered"
**Cause:** Trying to register with existing email  
**Fix:** Use a different email or login instead

---

## 📋 Quick Checklist

Before testing in browser, verify:

- [ ] Backend terminal shows "Started AiLmsApplication"
- [ ] Backend is on http://localhost:8080
- [ ] Frontend is on http://localhost:4173
- [ ] Both terminals are running (no errors)
- [ ] Password is at least 8 characters
- [ ] Email format is valid (user@example.com)

---

## 🧪 Manual API Test

Test registration directly (bypass frontend):

```powershell
# Test Student Registration
$body = @{
    fullName = "Test User"
    email = "test123@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register/student" `
  -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "accessToken": "eyJ...",
    "tokenType": "Bearer",
    "email": "test123@example.com",
    "role": "STUDENT"
  }
}
```

---

## 💡 Pro Tips

1. **Always start backend FIRST**, then frontend
2. **Keep both terminals open** while testing
3. **Use different emails** for each registration test
4. **Check backend terminal** for error messages
5. **Run diagnostic script** if unsure: `.\test-auth-complete.ps1`

---

## 📞 Still Not Working?

Run the complete diagnostic and share the output:
```powershell
cd backend
.\test-auth-complete.ps1
```

This will show exactly which part is failing!
