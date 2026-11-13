@echo off
cd /d "%~dp0"
git pull --ff-only origin main
if errorlevel 1 (
  pause
  exit /b 1
)
call START.cmd
