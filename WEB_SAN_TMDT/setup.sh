#!/bin/bash

# MartHub Setup Script

echo "🚀 MartHub - E-commerce Platform Setup"
echo "======================================"

# Backend Setup
echo ""
echo "📦 Setting up Backend..."
cd backend
npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env file created. Please update with your config."
fi

cd ..

# Frontend Setup
echo ""
echo "🎨 Setting up Frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Run database schema: Execute database/schema.sql in SQL Server"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"
