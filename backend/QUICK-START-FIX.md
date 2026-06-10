# 🚀 Quick Start - Fix "No Courses Available" Error

## Problem
You're seeing **"No courses are available yet"** in the courses section.

## Root Cause
The backend is configured to use **MySQL** by default, but MySQL is not running on your system. This prevents the backend from starting properly and courses cannot be created.

---

## ✅ SOLUTION: Use H2 In-Memory Database (Easiest!)

I've created a special startup script that uses **H2 in-memory database** instead of MySQL. This requires NO external database setup!

### Step 1: Stop Current Backend (if running)
If you have a backend terminal running, press `Ctrl+C` to stop it.

### Step 2: Start Backend with H2 Database
```powershell
cd "c:\Users\karee\Desktop\Learning Management Portal\backend"
.\start-with-h2.ps1
```

**What this does:**
- ✅ Uses H2 in-memory database (no MySQL needed!)
- ✅ Automatically creates database tables
- ✅ Creates 8 sample courses with modules and lessons
- ✅ Creates sample instructor account
- ✅ Initializes roles (STUDENT, INSTRUCTOR, ADMIN)

### Step 3: Wait for Startup
Wait until you see:
```
Started AiLmsApplication in X.XXX seconds
```

You should also see:
```
Successfully initialized 8 courses with modules and lessons
```

### Step 4: Verify Backend is Working
Open browser and check:
- **http://localhost:8080/api/health** → Should show health status
- **http://localhost:8080/api/v1/courses** → Should show 8 courses

### Step 5: View Courses in Frontend
If frontend is running:
- **http://localhost:4173/courses** → Should show all 8 courses!

If frontend is NOT running:
```powershell
# Open NEW terminal
cd "c:\Users\karee\Desktop\Learning Management Portal\frontend"
npm run dev
```

---

## 📋 What You'll Get

### 8 Sample Courses:
1. ✅ Complete Java Programming Masterclass - $49.99
2. ✅ Modern Web Development with React - $59.99
3. ✅ Python for Data Science and Machine Learning - $69.99
4. ✅ JavaScript: The Complete Guide - $44.99
5. ✅ SQL and Database Design Fundamentals - $39.99
6. ✅ DevOps and Cloud Computing Essentials - $79.99
7. ✅ Mobile App Development with React Native - $64.99
8. ✅ Cybersecurity Essentials - $54.99

Each course has:
- 3 modules
- 9 lessons
- Different difficulty levels (Beginner/Intermediate/Advanced)

### Sample Instructor Account:
- **Email:** instructor@lms.com
- **Password:** test123
- **Role:** INSTRUCTOR

---

## 🧪 Test Everything

Run the complete test suite:
```powershell
cd backend
.\test-auth-complete.ps1
```

This will verify:
- ✓ Backend is running
- ✓ Registration works
- ✓ Login works
- ✓ Courses are available
- ✓ CORS is configured

---

## 🔍 Troubleshooting

### Backend won't start?
1. Check Java version: `java -version` (need JDK 21)
2. Check error messages in terminal
3. Try: `.\mvnw.cmd clean install` then `.\start-with-h2.ps1`

### Still no courses?
1. Check backend terminal for: "Initializing sample courses"
2. Look for errors: "Error initializing course data"
3. Restart backend with: `.\start-with-h2.ps1`

### Frontend shows "No courses"?
1. Make sure backend is fully started first
2. Refresh the page (Ctrl+F5)
3. Check browser console (F12) for errors
4. Verify: http://localhost:8080/api/v1/courses works

---

## 💡 Important Notes

**H2 Database:**
- Data is stored in memory (RAM)
- **All data is lost when backend stops**
- Fresh database created each time you start
- Perfect for development and testing

**MySQL (Production):**
- For production use, configure MySQL in `application.properties`
- Data persists between restarts
- Requires MySQL server installation

---

## 🎯 Quick Commands

### Start Everything:
```powershell
# Terminal 1 - Backend
cd backend
.\start-with-h2.ps1

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Test Registration:
1. Go to: http://localhost:4173
2. Click "Account"
3. Register with any email
4. Should see success message!

### View Courses:
- http://localhost:4173/courses

---

## ✨ That's It!

Using the H2 database is the **easiest way** to get started. No MySQL setup required!

Just run: `.\start-with-h2.ps1` and everything works automatically! 🎉
