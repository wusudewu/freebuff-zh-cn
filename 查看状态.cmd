@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0FreebuffZhPatch.ps1" -Action Status
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0FreebuffZhPatch.ps1" -Action Verify
echo.
pause
