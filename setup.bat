@echo off
echo ====================================
echo      BudgetBox Setup Script
echo ====================================
echo.

echo [1/4] Starting MongoDB (make sure MongoDB is installed)
echo You can also use MongoDB Atlas cloud database
echo.

echo [2/4] Setting up Backend...
cd backend
call npm install
echo Backend dependencies installed!
echo.

echo [3/4] Setting up Frontend...
cd ..\frontend  
call npm install
echo Frontend dependencies installed!
echo.

echo [4/4] Setup Complete!
echo.
echo To start the application:
echo 1. Start Backend: cd backend && npm run dev
echo 2. Start Frontend: cd frontend && npm run dev
echo 3. Open http://localhost:5173 in your browser
echo.
echo Demo Login Credentials:
echo Email: hire-me@anshumat.org
echo Password: HireMe@2025!
echo.
echo ====================================
pause