# AI LMS Backend (Phase 1)

Spring Boot 3 + Java 21 backend foundation for the AI Learning Management System.

## Implemented
- Layered architecture scaffold (`controller`, `service`, `repository`, `dto`, `entity`, `security`, `common`)
- JWT-based authentication and role authorization foundation
- MySQL + JPA configuration with profile-based behavior
- Auth endpoints:
  - `POST /api/v1/auth/register/student`
  - `POST /api/v1/auth/register/instructor`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/forgot-password`
  - `POST /api/v1/auth/reset-password`
  - `GET /api/v1/auth/verify-email?token=...`
- Global exception handler + validation responses
- Swagger/OpenAPI at `http://localhost:8080/api/swagger-ui.html`
- Course management Phase 2 APIs (public course catalog, instructor course CRUD-lite, student enrollments)
- Video lecture Phase 3 APIs (lesson progress, resume watching, lesson notes)
- Online exam Phase 4 APIs (quiz creation, timed attempts, auto-evaluation, leaderboard, certificates)
- AI Phase 5 APIs (study planner, quiz generator, chatbot assistant with OpenAI integration)
- Payment Phase 6 APIs (checkout, confirm, payment history, provider webhooks)
- Admin Phase 7 APIs (user/instructor moderation, course approvals, dashboard analytics, platform reports)
- Notifications Phase 8 (WebSocket realtime + persisted in-app notifications)
- Catalog Phase 9 (advanced course search, infinite-scroll feed, wishlist, ratings and reviews)

## Prerequisites
- **Java 21** (JDK). Set `JAVA_HOME` to a JDK 21 install and ensure `java -version` reports 21 in the same terminal where you run Maven. This project uses **Java `record` types** (Java 16+) and Spring Boot 3; if Maven picks JDK 8 you will see many `class, interface, or enum expected` errors. The build runs **Maven Enforcer** and fails fast if the JDK is older than 21.
- **MySQL 8+**
- **Maven is optional** — this repo includes the **Maven Wrapper** (`mvnw.cmd` on Windows).

## Setup
1. Copy `.env.example` values to your environment (or set the same variables in your shell / IDE run configuration).
2. Update DB and JWT values.
3. From the `backend` folder, use the wrapper (no global `mvn` required`):
   - Windows PowerShell:
     - `Set-Item Env:JAVA_HOME 'C:\Program Files\Java\jdk-21'`
     - `Set-Item Env:PATH ($env:JAVA_HOME + '\bin;' + $env:PATH)`
     - `.\mvnw.cmd clean install`
     - `.\mvnw.cmd spring-boot:run`
   - If you already have Maven on your `PATH`, you can use `mvn` instead of `.\mvnw.cmd`.
   - To run locally without MySQL, use the in-memory H2 profile:
     - Windows PowerShell:
       - `Set-Item Env:JAVA_HOME 'C:\Program Files\Java\jdk-21'`
       - `Set-Item Env:PATH ($env:JAVA_HOME + '\bin;' + $env:PATH)`
       - `.\run-local.ps1`
     - macOS / Linux:
       - `SPRING_PROFILES_ACTIVE=test ./mvnw spring-boot:run`
       - `./run-local.sh`
     - Note: if `java -version` shows 21 but `JAVA_HOME` points to a lower JDK, the run helper will override `JAVA_HOME` for the session.
## Useful URLs
- Health: `GET http://localhost:8080/api/health`
- OpenAPI JSON: `GET http://localhost:8080/api/v3/api-docs`
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`

## Phase 2 APIs
- Public courses:
  - `GET /api/v1/courses`
  - `GET /api/v1/courses/{courseId}`
- Instructor (auth + `ROLE_INSTRUCTOR`):
  - `POST /api/v1/instructor/courses`
  - `PUT /api/v1/instructor/courses/{courseId}`
  - `GET /api/v1/instructor/courses/mine`
- Student enrollments (auth + `ROLE_STUDENT`):
  - `POST /api/v1/student/enrollments/{courseId}`
  - `GET /api/v1/student/enrollments/mine`
  - `PATCH /api/v1/student/enrollments/{courseId}/progress?progress=75`

## Phase 3 APIs
- Student video learning (auth + `ROLE_STUDENT`):
  - `PATCH /api/v1/student/video/lessons/{lessonId}/progress`
  - `GET /api/v1/student/video/courses/{courseId}/resume`
  - `POST /api/v1/student/video/lessons/{lessonId}/notes`
  - `GET /api/v1/student/video/lessons/{lessonId}/notes`

## Phase 4 APIs
- Instructor exams (auth + `ROLE_INSTRUCTOR`):
  - `POST /api/v1/instructor/exams/quizzes`
  - `POST /api/v1/instructor/exams/questions`
- Student exams (auth + `ROLE_STUDENT`):
  - `POST /api/v1/student/exams/quizzes/{quizId}/start`
  - `POST /api/v1/student/exams/attempts/{attemptId}/submit`
  - `GET /api/v1/student/exams/quizzes/{quizId}/leaderboard`

## Phase 5 APIs
- AI services:
  - `POST /api/v1/ai/study-plan` (`ROLE_STUDENT`)
  - `POST /api/v1/ai/quiz-generator` (`ROLE_INSTRUCTOR`)
  - `POST /api/v1/ai/chat` (`ROLE_STUDENT|INSTRUCTOR|ADMIN`)

## AI Configuration
- Set `OPENAI_API_KEY` in environment before using AI endpoints.
- Optional overrides:
  - `OPENAI_BASE_URL` (default `https://api.openai.com/v1`)
  - `OPENAI_MODEL` (default `gpt-4o-mini`)

## Phase 6 APIs
- Student payments (`ROLE_STUDENT`):
  - `POST /api/v1/student/payments/checkout`
  - `POST /api/v1/student/payments/confirm`
  - `GET /api/v1/student/payments/history`
- Provider webhooks (public):
  - `POST /api/v1/webhooks/payments/stripe`
  - `POST /api/v1/webhooks/payments/razorpay`

## Payment Configuration
- Set `PAYMENT_WEBHOOK_SECRET` for webhook signature validation.

## Phase 7 APIs
- Admin panel (`ROLE_ADMIN`):
  - `GET /api/v1/admin/users/students`
  - `GET /api/v1/admin/users/instructors`
  - `PATCH /api/v1/admin/users/{userId}/lock`
  - `PATCH /api/v1/admin/users/{userId}/unlock`
  - `GET /api/v1/admin/courses?status=PENDING_APPROVAL`
  - `PATCH /api/v1/admin/courses/{courseId}/approve`
  - `PATCH /api/v1/admin/courses/{courseId}/reject`
  - `GET /api/v1/admin/dashboard`
  - `GET /api/v1/admin/reports/platform`

## Phase 8 APIs and Realtime
- In-app notifications (`ROLE_STUDENT|INSTRUCTOR|ADMIN`):
  - `GET /api/v1/notifications/me`
  - `PATCH /api/v1/notifications/{notificationId}/read`
- WebSocket/STOMP:
  - Endpoint: `/api/ws` (SockJS enabled)
  - User queue destination: `/user/queue/notifications`
  - Events emitted on enrollment, successful payments, and exam submissions.

## Phase 9 APIs (search, feed, wishlist, reviews)
- Public catalog (optional JWT for `inWishlist` personalization when logged in as a student):
  - `GET /api/v1/courses/search?q=&level=BEGINNER&minPrice=&maxPrice=&minRating=&page=&size=&sortBy=&direction=`
  - `GET /api/v1/courses/feed?cursor=&size=` (keyset pagination: pass `cursor` = last item `id` from previous response)
  - `GET /api/v1/courses/{courseId}/reviews`
- Student wishlist (`ROLE_STUDENT`):
  - `POST /api/v1/student/wishlist/{courseId}`
  - `DELETE /api/v1/student/wishlist/{courseId}`
  - `GET /api/v1/student/wishlist`
- Student reviews (`ROLE_STUDENT`, enrolled learners only):
  - `POST /api/v1/student/courses/{courseId}/reviews`

## Testing
- Run all tests: `mvn test`

## Notes
- JWT secret is expected as Base64 string.
- Role seed (`STUDENT`, `INSTRUCTOR`, `ADMIN`) runs on startup.
