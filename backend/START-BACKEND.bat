@echo off
echo ========================================
echo Starting AI LMS Backend
echo ========================================
echo.
echo This will start the Spring Boot server...
echo.
echo IMPORTANT: Keep this window open!
echo Press Ctrl+C to stop the server.
echo.
pause

cd /d "%~dp0"

set SPRING_PROFILES_ACTIVE=test
set SERVER_PORT=8080

echo.
echo Starting backend on port 8080...
echo.

call mvnw.cmd spring-boot:run

echo.
echo Backend stopped.
echo.
pause
