@echo off
title SDEMS - Secure Decentralized Election Management System
cd /d "%~dp0"
node launcher.cjs
if %ERRORLEVEL% neq 0 (
    echo.
    echo System exited with an error. Press any key to close this window...
    pause >nul
)
