# Zauction Startup Script
# Run this to start both frontend and backend servers

Write-Host "🎯 Starting Zauction Platform..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Python detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Write-Host "Location: zauction-backend" -ForegroundColor Gray
Write-Host "URL: http://localhost:3000" -ForegroundColor Gray

# Start backend in new window
$backendPath = Join-Path $PSScriptRoot "zauction-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"

# Wait a bit for backend to start
Write-Host ""
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "Location: frontend" -ForegroundColor Gray
Write-Host "URL: http://localhost:8000" -ForegroundColor Gray

# Start frontend in new window
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; python -m http.server 8000"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Zauction Platform Started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Frontend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📍 Backend API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📍 Backend Health: http://localhost:3000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Gray
Start-Sleep -Seconds 2
Start-Process "http://localhost:8000"
