# 🚨 FIX: "Authentication failed: Request failed with status code 404"

## What This Error Means

**404 = Not Found**

Your frontend is trying to contact the backend, but **the backend is NOT running**!

---

## ✅ HOW TO FIX (3 Simple Steps)

### Step 1: Open PowerShell in the Backend Folder

Click the button below, or run this command:
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\backend"
```

### Step 2: Run the Start Script

```powershell
.\check-and-start.ps1
```

**OR** if that doesn't work:
```powershell
.\start-with-h2.ps1
```

### Step 3: WAIT for Backend to Start

You will see LOTS of text scrolling. **WAIT** for this message:

```
Started AiLmsApplication in XX.XXX seconds
```

Then you should also see:
```
Successfully initialized 8 courses with modules and lessons
```

**This takes 15-30 seconds!**

---

## ✅ How to Know Backend is Ready

**Method 1: Check Terminal**
- Look for: "Started AiLmsApplication"
- Terminal should NOT show any ERROR messages

**Method 2: Open Browser**
- Go to: http://localhost:8080/api/health
- You should see a response (not an error)

---

## ✅ Then Test Your App

Once backend is running:

1. Go to: **http://localhost:4173**
2. Click "Account"
3. Click "Register"
4. Fill in details
5. Click "Register as Student"

**✅ It will work now!**

---

## 📋 IMPORTANT Notes

### You Need TWO Terminals Open:

**Terminal 1 - Backend (MUST keep running):**
```powershell
cd backend
.\start-with-h2.ps1
```

**Terminal 2 - Frontend (MUST keep running):**
```powershell
cd frontend
npm run dev
```

**DO NOT CLOSE either terminal while using the app!**

---

## ❌ Why You're Getting 404

| Problem | Solution |
|---------|----------|
| Backend not started | Run `.\start-with-h2.ps1` |
| Backend crashed | Restart with `.\start-with-h2.ps1` |
| Backend still starting | Wait 15-30 seconds |
| Wrong terminal | Make sure you're in `backend` folder |

---

## 🎯 Quick Test Commands

**Check if backend is running:**
```powershell
curl http://localhost:8080/api/health
```

**Check if courses are available:**
```powershell
curl http://localhost:8080/api/v1/courses
```

If these work, your registration will work too!

---

## 💡 Pro Tip

**Create a shortcut:**
1. Right-click on `START-BACKEND-H2.bat`
2. Select "Pin to Taskbar"
3. Next time, just click the icon to start backend!

---

## Still Not Working?

Run this diagnostic:
```powershell
cd backend
.\test-auth-complete.ps1
```

It will tell you exactly what's wrong!
