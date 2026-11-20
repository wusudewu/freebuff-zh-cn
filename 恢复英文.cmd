@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0FreebuffZhPatch.ps1" -Action Restore
if errorlevel 1 (
  echo.
  echo 还原没有完成，请把上面的提示读完再重试。
)
echo.
pause
