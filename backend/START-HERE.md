# 🚀 Quick Start Guide - Backend Not Running Fix

## Problem: "Backend not running" error

## ✅ SOLUTION - Follow These Steps:

### Step 1: Open PowerShell in Backend Folder
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\backend"
```

### Step 2: Run the Backend
```powershell
.\start-backend.ps1
```

**OR** if that doesn't work:
```powershell
.\run-local.ps1
```

### Step 3: Wait for Success Message
You should see:
```
Started AiLmsApplication in X.XXX seconds
```

**Keep this window open!** The backend must keep running.

### Step 4: Verify Backend is Running
Open your browser and go to:
```
http://localhost:8080/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": null
}
```

### Step 5: Start Frontend (New Terminal)
Open a **NEW** PowerShell window:
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\frontend"
npm run dev
```

### Step 6: Access Your Application
Open browser: **http://localhost:4173**

---

## 🧪 Test Everything Works

### Option 1: Automatic Test
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\backend"
.\test-auth.ps1
```

This will test:
- ✓ Backend connection
- ✓ Student registration
- ✓ Instructor registration
- ✓ Login functionality
- ✓ Course fetching

### Option 2: Manual Test
1. Go to http://localhost:4173
2. Click "Account" or "Get Started"
3. Fill in registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Student
4. Click "Register as Student"
5. You should be logged in!

---

## 🔍 Troubleshooting

### Still not working? Run diagnostic:
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\backend"
.\diagnose-backend.ps1
```

This will check:
- ✓ If backend is running
- ✓ If port 8080 is available
- ✓ If Java is installed
- ✓ If Maven wrapper exists

### Common Issues:

**Issue: "Port 8080 already in use"**
```powershell
# Find and kill the process
Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess
taskkill /F /PID <PROCESS_ID>
```

**Issue: "Java not found"**
- Install JDK 21 from Oracle website
- Add to PATH environment variable

**Issue: "npm not found"**
- Install Node.js from nodejs.org

**Issue: Backend starts but immediately stops**
- Check error messages in the terminal
- Look for "ERROR" or "Exception" messages
- Common: Database connection issue, port conflict

---

## 📋 Quick Reference

### Start Everything:
```powershell
# From project root
.\start-all.ps1
```

### Stop Everything:
- Press `Ctrl+C` in both terminal windows

### Restart Backend:
1. Stop backend (Ctrl+C)
2. Wait 2 seconds
3. Run: `.\start-backend.ps1`

### Check Backend Status:
- Browser: http://localhost:8080/api/health
- Or run: `.\diagnose-backend.ps1`

---

## 📞 Still Having Issues?

1. Check backend terminal for error messages
2. Check frontend terminal for error messages
3. Run diagnostic: `.\diagnose-backend.ps1`
4. Read full guide: `AUTH-TROUBLESHOOTING.md`

---

## ✨ Success Indicators

✅ Backend terminal shows: "Started AiLmsApplication"
✅ http://localhost:8080/api/health returns success
✅ Frontend terminal shows: "Local: http://localhost:4173"
✅ You can register and login on the website
✅ test-auth.ps1 shows all green checkmarks
