# Deploy LMS Portal: Backend (Render) + Frontend (Vercel)

**JWT secrets:** Use the two values provided in the project setup (or generate your own with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` twice). Add them in Render → Environment as `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`. Do not commit real secrets to Git.

---

## Part A: Deploy backend on Render

### Step 1: Create Web Service

1. Open **https://render.com** and sign in (or sign up with GitHub).
2. Click **Dashboard** → **New** → **Web Service**.
3. Connect **GitHub** if asked, and choose the repository: **tamimabegum158-arch/Learning-management-System**.
4. Click **Connect**.

### Step 2: Backend settings

Fill in:

| Field | Value |
|--------|--------|
| **Name** | `lms-backend` (or any name you like) |
| **Region** | Choose one (e.g. Oregon) |
| **Branch** | `main` |
| **Root Directory** | `backend` ← must be exactly `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install --include=dev && npx prisma generate && npm run build` (use `--include=dev` so TypeScript and @types install on Render) |
| **Start Command** | `npm start` |

If you see **Release Command**, set it to:

`npx prisma migrate deploy`

(So the database migrations run on every deploy.)

### Step 3: Environment variables (backend)

In the same page, open **Environment** (or **Environment Variables**). Add these **one by one**:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your MySQL connection URL (same as in your local `backend/.env`, e.g. from Aiven) |
| `JWT_ACCESS_SECRET` | (paste the value you received – 32+ chars) |
| `JWT_REFRESH_SECRET` | (paste the value you received – 32+ chars) |
| `CORS_ORIGIN` | Leave empty for now; you will set it after frontend is deployed |
| `COOKIE_DOMAIN` | Leave empty for now; you will set it after frontend is deployed |

Optional (for Free AI and Online Compiler):

- `GEMINI_API_KEY` – from https://aistudio.google.com/app/apikey  
- `JUDGE0_AUTH_TOKEN` – from Judge0 CE if you use the compiler

### Step 4: Deploy backend

1. Click **Create Web Service** (or **Save**).
2. Wait until the build and deploy finish (green “Live” or “Deployed”).
3. If you did **not** set a Release Command, open the **Shell** tab for the service and run:  
   `npx prisma migrate deploy`  
   then exit the shell.
4. Copy the backend URL from the top of the page (e.g. `https://lms-backend-xxxx.onrender.com`). You need this for the frontend.
5. Check: open that URL + `/api/health` in the browser (e.g. `https://lms-backend-xxxx.onrender.com/api/health`). You should see a healthy JSON response.

---

## Part B: Deploy frontend on Vercel

### Step 1: Create project

1. Open **https://vercel.com** and sign in with **GitHub**.
2. Click **Add New** → **Project**.
3. Import **tamimabegum158-arch/Learning-management-System** (or select it from the list).
4. Click **Import**.

### Step 2: Frontend settings

Before deploying, set:

| Field | Value |
|--------|--------|
| **Framework Preset** | Next.js (should be auto-detected) |
| **Root Directory** | Click **Edit** and set to `frontend` (only the `frontend` folder is built) |
| **Build Command** | Leave default: `npm run build` |

### Step 3: Environment variable (frontend)

Under **Environment Variables** add:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_BASE_URL` | Your Render backend URL, e.g. `https://lms-backend.onrender.com` (no trailing slash) |

### Step 4: Deploy frontend

1. Click **Deploy**.
2. Wait for the build to finish.
3. Copy the Vercel URL (e.g. `https://learning-management-system-xxxx.vercel.app`).

---

## Part C: Connect frontend and backend

1. In **Render** → your backend service → **Environment**.
2. Set:
   - **CORS_ORIGIN** = your full Vercel URL, e.g. `https://learning-management-system-xxxx.vercel.app`
   - **COOKIE_DOMAIN** = only the host part, e.g. `learning-management-system-xxxx.vercel.app` (no `https://`)
3. Save. Render will redeploy/restart the backend with the new values.

---

## Quick checklist

- [ ] **Backend:** Root = `backend`, Build = `npm install --include=dev && npx prisma generate && npm run build`, Start = `npm start`, Release = `npx prisma migrate deploy`.
- [ ] **Backend env:** `NODE_ENV`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (and later `CORS_ORIGIN`, `COOKIE_DOMAIN`).
- [ ] **Frontend:** Root = `frontend`, `NEXT_PUBLIC_API_BASE_URL` = Render backend URL.
- [ ] **After frontend is live:** Set `CORS_ORIGIN` and `COOKIE_DOMAIN` on the backend.
- [ ] **Test:** Open the Vercel URL, register, log in, and use the app.

---

## Optional: custom domain

- **Vercel:** Project → Settings → Domains → add your domain.
- **Render:** Service → Settings → Custom Domain.
- Then update **CORS_ORIGIN** and **COOKIE_DOMAIN** on the backend to use the new frontend domain.
