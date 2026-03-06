# LMS Portal – Summary of Changes

This document summarizes the main changes made to the project (features added, removed, and updated).

---

## 1. Removed: Price / Purchase

- **Frontend:** No price display, no "Set price", no "Pay ₹" or "Purchase" on course cards or subject pages. Only **Enroll** / **Remove** for all courses.
- **Home page:** Subject cards show title, description, Enroll/Remove, and Delete (for logged-in users). No price field in "Add subject" form.
- **Backend:** `priceCents` and purchase/PATCH are still in the schema and API (database column, create/subject list/patch endpoint, purchase endpoint) but are not used by the current UI.

---

## 2. Removed: Ask AI (subject & video pages)

- **Subject overview** (`/subjects/[id]`): "Free AI help" section and all AI question/answer UI removed.
- **Video page** (`/subjects/[id]/video/[id]`): "Free AI help" section and all AI question/answer UI removed.
- **Backend:** `POST /api/ai/ask` (Gemini) still exists for possible future use but is not linked from the UI.

---

## 3. API / CORS & Local Dev

- **Backend CORS:** Supports multiple origins (comma-separated `CORS_ORIGIN`). `http://localhost:3000` is always allowed so local frontend can call the backend even when `.env` has a production URL.
- **Home page error:** When the API URL is localhost/127.0.0.1, the "Cannot reach the API" message shows **"Running locally? Start the backend first"** with steps (open terminal → backend folder → `npm run dev` → Retry). For non-local URLs it still shows Vercel/Render deployment steps.

---

## 4. AI Chat (in-app, Hugging Face)

- **Route:** `/chat` (auth required). Nav link **"AI Chat"** in the header for logged-in users (with Compiler and Profile).
- **Backend:** `POST /api/ai/chat` uses **Hugging Face router** (`https://router.huggingface.co/v1/chat/completions`), not the deprecated `api-inference.huggingface.co`.
- **Model:** Default `Qwen/Qwen2.5-0.5B-Instruct`. Override with `HF_CHAT_MODEL` in `backend/.env` (e.g. `HuggingFaceH4/zephyr-7b-beta`).
- **Auth:** Requires `HUGGINGFACE_TOKEN` in `backend/.env` (from https://huggingface.co/settings/tokens). Same token is used for router chat.
- **Frontend:** In-app chat UI (message list, input, Send). Error message is always coerced to string so `error.includes()` never throws. Setup instructions shown when chat is "not configured".

---

## 5. Compiler

- **Route:** `/compiler` (auth required). Label in nav is **"Compiler"** (not "Online compiler"). Only visible when logged in.

---

## 6. Profile

- **Route:** `/profile`. Shows user name, email, and **enrolled courses** with progress (completed/total videos, % complete, link to subject). Data from `GET /api/me/enrollments`.

---

## 7. Backend env

- **Required:** `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
- **Optional:**  
  - `HUGGINGFACE_TOKEN` – for AI Chat (router).  
  - `HF_CHAT_MODEL` – override default chat model.  
  - `GEMINI_API_KEY` – only if you re-enable "Ask AI" and use Gemini.  
  - `COOKIE_DOMAIN`, `COOKIE_SECURE`, `CORS_ORIGIN`, `PORT`, `JUDGE0_AUTH_TOKEN` (for compiler), etc.

---

## 8. Database

- **Subject:** `price_cents` column exists (nullable). Migrations: `20250303100000_add_subject_price_cents`.
- **Enrollment:** Free enroll is allowed for all subjects; paid-course logic exists in backend but is unused by current UI.

---

## File-level reference

| Area | Files touched |
|------|----------------|
| AI Chat backend | `backend/src/modules/ai/ai.controller.ts` (chat → router, model, env), `ai.routes.ts` (POST /chat), `backend/src/config/env.ts` (HUGGINGFACE_TOKEN, HF_CHAT_MODEL) |
| AI Chat frontend | `frontend/src/app/chat/page.tsx` (in-app UI, String(error), Hugging Face copy) |
| Nav | `frontend/src/components/Layout/AppShell.tsx` (Compiler, AI Chat, Profile – all when logged in) |
| CORS | `backend/src/config/security.ts` (allowed origins, localhost, dynamic origin callback) |
| Home error UX | `frontend/src/app/page.tsx` (localhost vs deployed message, Retry) |
| Price removed from UI | `frontend/src/app/page.tsx` (no price/Purchase/Set price), `frontend/src/app/subjects/[subjectId]/page.tsx` (no price/Purchase/Ask AI) |
| Ask AI removed | `frontend/src/app/subjects/[subjectId]/page.tsx`, `frontend/src/app/subjects/[subjectId]/video/[videoId]/page.tsx` |
| Profile enrollments | `frontend/src/app/profile/page.tsx` (enrolled courses + progress) |
| Env / example | `backend/.env`, `backend/.env.example` (HUGGINGFACE_TOKEN, HF_CHAT_MODEL, comments) |

---

*Last updated: March 2025*
