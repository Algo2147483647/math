@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3 studio\server.py
) else (
  python studio\server.py
)

if not %errorlevel% equ 0 (
  echo.
  echo DAG Studio failed to start.
  pause
)
