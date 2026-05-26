@echo off

REM MartHub Setup Script for Windows

echo.
echo 🚀 MartHub - E-commerce Platform Setup
echo ======================================

REM Backend Setup
echo.
echo 📦 Setting up Backend...
cd backend
call npm install

if not exist .env (
  copy .env.example .env
  echo ✅ .env file created. Please update with your config.
)

cd ..

REM Frontend Setup
echo.
echo 🎨 Setting up Frontend...
cd frontend
call npm install
cd ..

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update backend/.env with your database credentials
echo 2. Run database schema: Execute database/schema.sql in SQL Server
echo 3. Start backend: cd backend ^&^& npm run dev
echo 4. Start frontend: cd frontend ^&^& npm start

pause
