# LMS Portal – Full deployment (step by step)

Deploy **backend on Render** first, then **frontend on Vercel**, then **connect** them.

---

## Your deployment URLs (use these exact values)

| Where | Key / Purpose | Value |
|--------|----------------|--------|
| **Backend (Render)** | Service URL | `https://learning-management-system-rg7m.onrender.com` |
| **Frontend (Vercel)** | App URL | `https://learning-management-system-five-coral.vercel.app` |
| **Vercel env** | `NEXT_PUBLIC_API_BASE_URL` | `https://learning-management-system-rg7m.onrender.com` |
| **Render env** | `CORS_ORIGIN` | `https://learning-management-system-five-coral.vercel.app` |
| **Render env** | `COOKIE_DOMAIN` | `learning-management-system-five-coral.vercel.app` |

Health check: open **https://learning-management-system-rg7m.onrender.com/api/health** in the browser to confirm the backend is up.

---

## Prerequisites

- GitHub repo: **tamimabegum158-arch/Learning-management-System** (code already pushed).
- MySQL database URL (e.g. from [Aiven](https://aiven.io) or any MySQL host).
- Two JWT secrets (32+ characters each). Example – run in terminal twice and use the outputs:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

---

# PART 1: Backend on Render

## Step 1.1 – Create the service

1. Go to **https://render.com** and sign in (or sign up with GitHub).
2. Click **Dashboard** → **New** → **Web Service**.
3. If asked, connect **GitHub** and allow Render to access your repos.
4. Select repository: **tamimabegum158-arch/Learning-management-System**.
5. Click **Connect**.

---

## Step 1.2 – Configure the backend

On the setup page, set these **exactly**:

| Field | What to enter |
|--------|----------------|
| **Name** | `lms-backend` (or any name) |
| **Region** | e.g. Oregon (or nearest to you) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install --include=dev && npx prisma generate && npm run build` |
| **Start Command** | `npm start` |

If you see **Release Command**, set it to:

`npx prisma migrate deploy`

---

## Step 1.3 – Add environment variables (backend)

Still on the same page, open the **Environment** (or **Environment Variables**) section.

Add these variables **one by one** (use **Add Environment Variable** or **Add Key** for each):

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Paste your Aiven **Service URI** (full MySQL URL, includes password) |
| `JWT_ACCESS_SECRET` | First long random string (32+ chars) |
| `JWT_REFRESH_SECRET` | Second long random string (32+ chars) |
| `CORS_ORIGIN` | Leave **empty** for now |
| `COOKIE_DOMAIN` | Leave **empty** for now |

**DATABASE_URL:** Must be the **full** connection string from Aiven (**Service URI** → reveal password → copy). Must start with `mysql://`.

Example format (do **not** commit real passwords):

```text
mysql://avnadmin:YOUR_PASSWORD@mysql-xxxx.aivencloud.com:11597/defaultdb?ssl-mode=REQUIRED
```

If the password has special characters (`@`, `#`, `%`, `?`, `/`, `:`), URL-encode them (e.g. `@` → `%40`, `#` → `%23`, `%` → `%25`).

Optional (add later if you need them):

- `GEMINI_API_KEY` – for Free AI help (get key at https://aistudio.google.com/app/apikey)
- `JUDGE0_AUTH_TOKEN` – for Online Compiler backend languages

---

## Step 1.4 – Deploy the backend

1. Click **Create Web Service** (or **Save**).
2. Wait for the build to finish (can take 2–5 minutes). Status should turn green (**Live** / **Deployed**).
3. If you **did not** set a Release Command in Step 1.2:
   - Open the **Shell** tab for the service.
   - Run: `npx prisma migrate deploy`
   - Exit the shell.
4. At the top of the page you’ll see your backend URL, e.g. `https://lms-backend.onrender.com`.
5. **Copy this URL** – you need it for the frontend.
6. Test: open `https://your-backend-url.onrender.com/api/health` in the browser. You should see a JSON response (e.g. `{"ok":true}` or similar).

---

# PART 2: Frontend on Vercel

## Step 2.1 – Create the project

1. Go to **https://vercel.com** and sign in with **GitHub**.
2. Click **Add New** → **Project**.
3. Find **tamimabegum158-arch/Learning-management-System** and click **Import** (or **Import Project**).

---

## Step 2.2 – Configure the frontend

Before clicking Deploy, set:

| Field | What to enter |
|--------|----------------|
| **Framework Preset** | Next.js (usually auto-detected) |
| **Root Directory** | Click **Edit** and type: `frontend` |
| **Build Command** | Leave as: `npm run build` |

---

## Step 2.3 – Add environment variable (frontend)

In **Environment Variables**:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_BASE_URL` | Your **Render backend URL** (e.g. `https://lms-backend.onrender.com`) – **no trailing slash** |

Use the **exact** URL you copied in Step 1.4.

---

## Step 2.4 – Deploy the frontend

1. Click **Deploy**.
2. Wait for the build to finish (1–3 minutes).
3. When done, Vercel shows your frontend URL, e.g. `https://learning-management-system-five-coral.vercel.app`.
4. **Copy this URL** – you need it for the next part.
5. Open this URL in the browser (e.g. https://learning-management-system-five-coral.vercel.app). You may still see “Cannot reach the API” or “Failed to fetch” until Part 3 is done – that’s expected.

---

# PART 3: Connect frontend and backend

## Step 3.1 – Set CORS and cookie on Render

1. Go back to **Render** → your **lms-backend** service.
2. Open **Environment** (in the left menu or the Environment tab).
3. Find or add these two variables and set them to **your real Vercel URL**:

| Key | Value |
|-----|--------|
| `CORS_ORIGIN` | `https://learning-management-system-five-coral.vercel.app` |
| `COOKIE_DOMAIN` | `learning-management-system-five-coral.vercel.app` |

4. Click **Save Changes**. Render will restart the backend (wait until it’s live again).

---

## Step 3.2 – Test the app

1. Open your **Vercel URL** again (e.g. `https://learning-management-system-five-coral.vercel.app`).
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R).
3. You should see the **Subjects** list (or “Loading subjects…” then the list).
4. Click **Register**, create an account, then **Log in**.
5. Try opening a subject and playing a video.

If the first load is slow (30–60 seconds), that’s normal on Render’s free tier (service was sleeping). After that it should be fast.

---

# Checklist (quick reference)

**Backend (Render)**  
- [ ] Root Directory = `backend`  
- [ ] Build Command = `npm install --include=dev && npx prisma generate && npm run build`  
- [ ] Start Command = `npm start`  
- [ ] Release Command = `npx prisma migrate deploy`  
- [ ] Env: `NODE_ENV`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`  
- [ ] After frontend is live: `CORS_ORIGIN` and `COOKIE_DOMAIN` set to your Vercel URL/host  

**Frontend (Vercel)**  
- [ ] Root Directory = `frontend`  
- [ ] `NEXT_PUBLIC_API_BASE_URL` = your Render backend URL (no trailing slash)  
- [ ] Redeploy after changing env vars (env is baked in at build time)  

**Connection**  
- [ ] CORS_ORIGIN = `https://learning-management-system-five-coral.vercel.app`  
- [ ] COOKIE_DOMAIN = `learning-management-system-five-coral.vercel.app`  

---

# If something goes wrong

- **“Failed to fetch” / “Cannot reach the API”**  
  - Vercel: confirm `NEXT_PUBLIC_API_BASE_URL` is the Render URL, then **redeploy**.  
  - Render: confirm `CORS_ORIGIN` is your full Vercel URL and **Save**.  
  - Test backend directly: open `https://your-render-url.onrender.com/api/health`.

- **Login/register not working or session lost**  
  - Render: set `COOKIE_DOMAIN` to the Vercel host only (no `https://`), then Save.

- **Backend very slow on first request**  
  - Normal on Render free tier (service sleeps after ~15 min idle). First request can take 30–60 s.

- **Database errors**  
  - Check `DATABASE_URL` on Render. Run migrations: Shell → `npx prisma migrate deploy`.
