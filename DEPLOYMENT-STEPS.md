# Deploy LMS Portal – Clear Steps

Deploy **backend** on Render and **frontend** on Vercel. Frontend and backend are in **separate** folders in this repo.

---

## Before you start

- [ ] GitHub repo: **https://github.com/tamimabegum158-arch/Learning-management-System**
- [ ] A **MySQL database** (e.g. [Aiven](https://aiven.io) free tier). You need the connection URL.
- [ ] Two **JWT secrets** (32+ characters each).

**Where to generate JWT secrets:** On your computer, in a terminal (PowerShell, Command Prompt, or VS Code terminal). Open the terminal, then run (Node.js must be installed):

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
  Run it **twice** and save both values (first = JWT_ACCESS_SECRET, second = JWT_REFRESH_SECRET).

---

## Part 1: Deploy backend (Render)

**Where:** In your **web browser** at **https://render.com** (not in the terminal). You use the Render dashboard to create the service and set options.

### 1.1 Create the service

1. Go to **https://render.com** and sign in with GitHub.
2. Click **Dashboard** → **New** → **Web Service**.
3. Connect the repo **tamimabegum158-arch/Learning-management-System** (select it and click **Connect**).

### 1.2 Configure the backend

| Field | Value |
|--------|--------|
| **Name** | `lms-backend` (or any name) |
| **Region** | e.g. Oregon |
| **Branch** | `main` |
| **Root Directory** | `backend` ← **important: only the backend folder** |
| **Runtime** | `Node` |
| **Build Command** | `npm install --include=dev && npx prisma generate && npm run build` |
| **Start Command** | `npm start` |

If you see **Release Command**, set it to:

```text
npx prisma migrate deploy
```

(This runs database migrations on each deploy.)

### 1.3 Add environment variables (backend)

In **Environment** (or **Environment Variables**), add:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your MySQL URL, e.g. `mysql://user:pass@host:3306/dbname?ssl-mode=REQUIRED` |
| `JWT_ACCESS_SECRET` | First 32+ character secret you generated |
| `JWT_REFRESH_SECRET` | Second 32+ character secret you generated |
| `CORS_ORIGIN` | Leave **empty** for now (set after frontend is deployed) |
| `COOKIE_DOMAIN` | Leave **empty** for now (set after frontend is deployed) |

**Optional (add later if you need them):**

| Key | Value |
|-----|--------|
| `HUGGINGFACE_TOKEN` | For Ask AI chat (fine-grained token from https://huggingface.co/settings/tokens) |
| `JUDGE0_AUTH_TOKEN` | For Online Compiler (Java, C++, etc.) from Judge0 / RapidAPI |

### 1.4 Deploy

1. Click **Create Web Service**.
2. Wait until the build finishes and status is **Live**.
3. If you did **not** set a Release Command, open **Shell** and run: `npx prisma migrate deploy`, then exit.
4. Copy your **backend URL** from the top of the Render page (e.g. `https://lms-backend-xxxx.onrender.com`). Do **not** type the words "your-backend-url" – use the real URL Render shows you.
5. Test: open **your actual backend URL** + `/api/health` in the browser. Example: if your URL is `https://lms-backend-abc1.onrender.com`, open `https://lms-backend-abc1.onrender.com/api/health`. You should see a JSON response (e.g. `{"ok":true}` or similar).

---

## Part 2: Deploy frontend (Vercel)

### 2.1 Create the project

1. Go to **https://vercel.com** and sign in with GitHub.
2. Click **Add New** → **Project**.
3. Import **tamimabegum158-arch/Learning-management-System** and click **Import**.

### 2.2 Configure the frontend

| Field | Value |
|--------|--------|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | Click **Edit** → set to `frontend` ← **only the frontend folder** |
| **Build Command** | Leave default: `npm run build` |

### 2.3 Add environment variable (frontend)

Under **Environment Variables** add:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_BASE_URL` | Your backend URL from Part 1, e.g. `https://lms-backend.onrender.com` (**no** trailing slash) |

### 2.4 Deploy

1. Click **Deploy**.
2. Wait for the build to finish.
3. Copy your **frontend URL** (e.g. `https://learning-management-system-xxxx.vercel.app`).

---

## Part 3: Connect frontend and backend

1. In **Render** → your backend service → **Environment**.
2. Set:
   - **CORS_ORIGIN** = your full Vercel URL, e.g. `https://learning-management-system-xxxx.vercel.app`
   - **COOKIE_DOMAIN** = only the domain, e.g. `learning-management-system-xxxx.vercel.app` (no `https://`)
3. Save. Render will restart the backend with the new values.

---

## Part 4: Test

1. Open your **Vercel frontend URL** in the browser.
2. Register a new account.
3. Log in and check: Courses list, Enroll, Ask AI, Compiler, Profile.

---

## Quick checklist

- [ ] **Backend (Render):** Root = `backend`, Build = `npm install --include=dev && npx prisma generate && npm run build`, Start = `npm start`, Release = `npx prisma migrate deploy`.
- [ ] **Backend env:** `NODE_ENV`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`; then after frontend: `CORS_ORIGIN`, `COOKIE_DOMAIN`.
- [ ] **Frontend (Vercel):** Root = `frontend`, `NEXT_PUBLIC_API_BASE_URL` = your Render backend URL.
- [ ] **After frontend is live:** Set `CORS_ORIGIN` and `COOKIE_DOMAIN` on the backend.
- [ ] **Test:** Register, login, use Courses and Ask AI.

---

## Troubleshooting

- **"Cannot reach the server" / CORS** → In **Render** → your backend service → **Environment**, set:
  - **CORS_ORIGIN** = your full Vercel URL, **no trailing slash**, e.g. `https://learning-management-system-inky.vercel.app`
  - **COOKIE_DOMAIN** = `.vercel.app` (so cookies work on `*.vercel.app`)
  Save; Render will redeploy. Then try login again.
- **"Cannot reach the API"** → Check `NEXT_PUBLIC_API_BASE_URL` on Vercel (no trailing slash). Redeploy frontend after changing env.
- **CORS / cookie errors** → Set `CORS_ORIGIN` and `COOKIE_DOMAIN` on Render to your exact Vercel URL and domain.
- **Backend build fails** → Ensure Root Directory is exactly `backend` and Build Command includes `npx prisma generate`.
- **Database errors** → Check `DATABASE_URL` on Render; run `npx prisma migrate deploy` in Render Shell if needed.
