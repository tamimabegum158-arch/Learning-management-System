# LMS Portal

Learning Management System with Next.js frontend, Express backend, and MySQL (Aiven).

## Structure

- **backend/** – Express REST API (Node.js + TypeScript, Prisma, MySQL)
- **frontend/** – Next.js 14 App Router + Tailwind

## Local development

### Backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `DATABASE_URL` (MySQL, e.g. Aiven), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. Optionally set `CORS_ORIGIN`, `COOKIE_DOMAIN`, `PORT`.
3. Run migrations: `cd backend && npx prisma migrate deploy`
4. Start: `npm run dev` (or `npm run build && npm start`)

### Frontend

1. Set `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:4000`) in `.env.local` or `.env`.
2. Run: `cd frontend && npm run dev`

## Deployment

See **[DEPLOYMENT-STEPS.md](./DEPLOYMENT-STEPS.md)** for the full step-by-step guide (backend → frontend → connect).  
See [DEPLOYMENT.md](./DEPLOYMENT.md) for the shorter reference.

- **Backend (Render):** Root directory `backend`, build `npm install && npx prisma generate && npm run build`, start `npm start`. Set env vars (see `backend/.env.example`). Health check: `GET /api/health`. Run `npx prisma migrate deploy` as release command or manually.
- **Frontend (Vercel):** Root directory `frontend`, set `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL.
- **Database:** Use Aiven MySQL (or any MySQL); set `DATABASE_URL` on the backend.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`
- `GET /api/health`
- `GET /api/subjects`, `GET /api/subjects/:id`, `GET /api/subjects/:id/tree` (auth), `GET /api/subjects/:id/first-video` (auth)
- `GET /api/videos/:id` (auth)
- `GET /api/progress/subjects/:id` (auth), `GET /api/progress/videos/:id` (auth), `POST /api/progress/videos/:id` (auth)
