# Learning Management Portal

This workspace contains the LMS backend and a new frontend scaffold for the AI Learning Management System.

## Backend

1. Open PowerShell.
2. Go to the backend folder:
   ```powershell
   cd "C:\Users\karee\Desktop\Learning Management Portal\backend"
   ```
3. Ensure JDK 21 is active:
   ```powershell
   Set-Item Env:JAVA_HOME 'C:\Program Files\Java\jdk-21'
   Set-Item Env:PATH ($env:JAVA_HOME + '\bin;' + $env:PATH)
   ```
4. Run local backend (H2 in-memory test profile):
   ```powershell
   .\run-local.ps1
   ```

The backend listens on `http://localhost:8080`.

## Frontend

1. Open a new terminal.
2. Go to the frontend folder:
   ```powershell
   cd "C:\Users\karee\Desktop\Learning Management Portal\frontend"
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Start the frontend:
   ```powershell
   npm run dev
   ```

The frontend runs on `http://localhost:4173` and proxies `/api` calls to the backend at `http://localhost:8080`.

## Useful URLs

- Backend Health: `http://localhost:8080/api/health`
- Frontend: `http://localhost:4173`
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`
