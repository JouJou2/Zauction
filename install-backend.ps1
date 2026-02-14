# Zauction Backend Installation Script
# Installs all required npm dependencies

Write-Host "📦 Installing Zauction Backend Dependencies..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
$backendPath = Join-Path $PSScriptRoot "zauction-backend"

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found at: $backendPath" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

Write-Host "📍 Location: zauction-backend" -ForegroundColor Gray
Write-Host ""

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found!" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Running: npm install" -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

try {
    npm install
    
    Write-Host ""
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Show installed packages
    Write-Host "📦 Main Dependencies:" -ForegroundColor Cyan
    Write-Host "  • express          - Web framework" -ForegroundColor White
    Write-Host "  • socket.io        - Real-time bidding" -ForegroundColor White
    Write-Host "  • pg               - PostgreSQL client" -ForegroundColor White
    Write-Host "  • jsonwebtoken     - JWT authentication" -ForegroundColor White
    Write-Host "  • bcrypt           - Password hashing" -ForegroundColor White
    Write-Host "  • express-validator - Input validation" -ForegroundColor White
    Write-Host "  • cors             - Cross-origin requests" -ForegroundColor White
    Write-Host "  • dotenv           - Environment variables" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🛠️  Dev Dependencies:" -ForegroundColor Cyan
    Write-Host "  • typescript       - Type safety" -ForegroundColor White
    Write-Host "  • ts-node          - TypeScript execution" -ForegroundColor White
    Write-Host "  • nodemon          - Auto-reload" -ForegroundColor White
    Write-Host ""
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. ✅ Install backend dependencies (DONE)" -ForegroundColor Green
    Write-Host "  2. ⬜ Set up PostgreSQL or Supabase database" -ForegroundColor Gray
    Write-Host "  3. ⬜ Configure .env file" -ForegroundColor Gray
    Write-Host "  4. ⬜ Run database schema" -ForegroundColor Gray
    Write-Host "  5. ⬜ Start the servers" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📚 See QUICK-START.md for detailed instructions" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  • Make sure Node.js and npm are installed" -ForegroundColor White
    Write-Host "  • Check your internet connection" -ForegroundColor White
    Write-Host "  • Try running: npm cache clean --force" -ForegroundColor White
    exit 1
}

Set-Location $PSScriptRoot
Read-Host "Press Enter to exit"
