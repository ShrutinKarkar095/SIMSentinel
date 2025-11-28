@echo off
echo ==========================================
echo   SIMSentinel Backend - Day 6 Launcher
echo ==========================================

REM Activate virtual environment
call venv\Scripts\activate

REM Move into backend folder
cd backend

REM Start FastAPI backend with uvicorn
echo Starting SIMSentinel backend on http://127.0.0.1:8080
py -m uvicorn app:app --host 0.0.0.0 --port 8080 --reload

REM Keep window open after server stops
pause
