#!/bin/bash

echo "============================================"
echo "ACIK Management System - Installation Verification"
echo "============================================"
echo ""

echo "Checking Node.js..."
if command -v node &> /dev/null; then
    echo "[OK] Node.js installed: $(node --version)"
else
    echo "[ERROR] Node.js not found! Please install Node.js v18+"
    exit 1
fi
echo ""

echo "Checking npm..."
if command -v npm &> /dev/null; then
    echo "[OK] npm installed: $(npm --version)"
else
    echo "[ERROR] npm not found!"
    exit 1
fi
echo ""

echo "Checking MongoDB..."
if command -v mongod &> /dev/null; then
    echo "[OK] MongoDB installed: $(mongod --version | head -n 1)"
else
    echo "[WARNING] MongoDB not found in PATH"
    echo "If using Docker, this is OK"
fi
echo ""

echo "Checking Docker..."
if command -v docker &> /dev/null; then
    echo "[OK] Docker installed: $(docker --version)"
else
    echo "[WARNING] Docker not found"
    echo "Docker is optional but recommended"
fi
echo ""

echo "Checking project structure..."
if [ -f "backend/package.json" ]; then
    echo "[OK] Backend directory found"
else
    echo "[ERROR] Backend directory not found!"
fi

if [ -f "frontend/package.json" ]; then
    echo "[OK] Frontend directory found"
else
    echo "[ERROR] Frontend directory not found!"
fi
echo ""

echo "Checking configuration files..."
if [ -f "backend/.env" ]; then
    echo "[OK] Backend .env found"
else
    echo "[WARNING] Backend .env not found - will use defaults"
fi

if [ -f "frontend/.env" ]; then
    echo "[OK] Frontend .env found"
else
    echo "[WARNING] Frontend .env not found - will use defaults"
fi
echo ""

echo "============================================"
echo "Verification Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. With Docker: docker-compose up -d"
echo "2. Without Docker:"
echo "   - Start MongoDB"
echo "   - cd backend && npm install && npm run seed && npm run dev"
echo "   - cd frontend && npm install && npm start"
echo ""
echo "See START_HERE.md for detailed instructions"
echo ""
