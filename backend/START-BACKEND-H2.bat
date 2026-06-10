@echo off
title LMS Backend - H2 Database
color 0A

echo ==================================
echo STARTING LMS BACKEND WITH H2
echo ==================================
echo.
echo This will:
echo  - Use H2 in-memory database (no MySQL needed)
echo  - Create 8 sample courses automatically
echo  - Initialize all required data
echo.
echo Starting backend...
echo.

cd /d "%~dp0"

set SPRING_PROFILES_ACTIVE=h2

call mvnw.cmd clean spring-boot:run -Dspring-boot.run.profiles=h2

echo.
echo Backend stopped.
pause
