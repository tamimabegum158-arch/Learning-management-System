# LMS Implementation vs Plan

This document maps the **LMS Implementation Plan** to the codebase (users, sections, video, progress, description, enrollment).

---

## Database schema & relations

| Plan | Implementation |
|------|-----------------|
| **users** – id, email, password_hash, name, created_at, updated_at | `backend/prisma/schema.prisma` → `User` model; auth uses it in `backend/src/modules/auth/*` |
| **subjects** – id, title, slug, description, is_published | `Subject` in schema; `GET /api/subjects`, `GET /api/subjects/:id`, tree in subject service |
| **sections** – subject_id, title, order_index, unique (subject_id, order_index) | `Section` in schema; `section.repository.ts`; tree ordered by `order_index` |
| **videos** – section_id, title, description, youtube_url/id, order_index, duration_seconds | `Video` in schema; video service returns **description**; `VideoMeta` shows title + description |
| **enrollments** – user_id, subject_id (optional / future-ready) | `Enrollment` in schema; table present for future enroll flows |
| **video_progress** – user_id, video_id, is_completed, last_position_seconds, completed_at | `VideoProgress` in schema; progress module (GET/POST, upsert, capping) |
| **refresh_tokens** – user_id, token_hash, expires_at, revoked_at | `RefreshToken` in schema; auth service issues/revokes |

---

## API (REST)

- **Auth:** register, login, refresh (cookie), logout → `backend/src/modules/auth/*`
- **Subjects:** `GET /api/subjects`, `GET /api/subjects/:id`, `GET /api/subjects/:id/tree`, `GET /api/subjects/:id/first-video` → subject + section repositories, `ordering.ts`
- **Videos:** `GET /api/videos/:id` (meta, **description**, prev/next, locked, unlock_reason) → video service
- **Progress:** `GET/POST /api/progress/videos/:id`, `GET /api/progress/subjects/:id` → progress module (upsert, cap to duration)
- **Health:** `GET /api/health` → health routes

---

## Strict ordering & access

- **Global order:** sections by `order_index`, videos by `order_index` within section → `backend/src/utils/ordering.ts` (`flattenVideoOrder`, `getPrevNextVideoId`, `computeLockedStates`, `getFirstUnlockedVideoId`).
- **Locked:** tree and video endpoints return `locked` and `unlock_reason`; frontend does not mount player for locked videos.

---

## Frontend

- **Layout:** App Router; `AppShell`; auth guard for learning/profile.
- **Pages:** login, register, subject list, subject layout (sidebar + content), subject overview → first video, video page, profile.
- **Video:** `VideoPlayer` (YouTube IFrame API), `VideoMeta` (title + **description**), `VideoProgressBar` (subject progress: X of Y videos).
- **Progress:** resume from `last_position_seconds`; debounced POST on progress; on completed → POST `is_completed`, mark in sidebar, auto-advance to next.
- **Auth:** `apiClient` 401 → refresh then retry; logout/redirect if refresh fails.

---

## Summary

- **Users:** schema + auth module + `backend/src/modules/users/user.model.ts`.
- **Sections:** schema + section repository + tree in subject service.
- **Video:** schema + video repo/service + **description** in API and `VideoMeta`.
- **Progress:** `video_progress` table + progress module + frontend resume/debounce/complete + `VideoProgressBar`.
- **Description:** subject and video have `description` in DB and API; subject list and `VideoMeta` show it.
- **Enrollment:** table only (optional/future-ready); no enroll API required by plan.

Implementation follows the plan for these areas.
