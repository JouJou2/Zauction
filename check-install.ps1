# Zauction Installation Checker
# Verifies all prerequisites are installed

Write-Host "🔍 Checking Zauction Prerequisites..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 18) {
            Write-Host " ✅ $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  $nodeVersion (v18+ recommended)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host " ❌ Not found" -ForegroundColor Red
    Write-Host "   Install from: https://nodejs.org" -ForegroundColor Yellow
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -NoNewline
try {
    $npmVersion = npm --version
    Write-Host " ✅ $npmVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not found" -ForegroundColor Red
    $allGood = $false
}

# Check Python
Write-Host "Checking Python..." -NoNewline
try {
    $pythonOutput = python --version 2>&1
    Write-Host " ✅ $pythonOutput" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not found" -ForegroundColor Red
    Write-Host "   Install from: https://www.python.org" -ForegroundColor Yellow
    $allGood = $false
}

# Check PostgreSQL (optional)
Write-Host "Checking PostgreSQL..." -NoNewline
try {
    $psqlVersion = psql --version
    Write-Host " ✅ $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  Not found (can use Supabase instead)" -ForegroundColor Yellow
    Write-Host "   Local: https://www.postgresql.org/download/" -ForegroundColor Gray
    Write-Host "   Cloud: https://supabase.com" -ForegroundColor Gray
}

Write-Host ""

# Check if backend dependencies are installed
Write-Host "Checking backend dependencies..." -NoNewline
$backendNodeModules = Join-Path $PSScriptRoot "zauction-backend\node_modules"
if (Test-Path $backendNodeModules) {
    Write-Host " ✅ Installed" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Not installed" -ForegroundColor Yellow
    Write-Host "   Run: cd zauction-backend; npm install" -ForegroundColor Gray
}

# Check if .env file exists
Write-Host "Checking .env file..." -NoNewline
$envFile = Join-Path $PSScriptRoot "zauction-backend\.env"
if (Test-Path $envFile) {
    Write-Host " ✅ Found" -ForegroundColor Green
} else {
    Write-Host " ❌ Not found" -ForegroundColor Red
    Write-Host "   A template .env.example exists in zauction-backend/" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($allGood) {
    Write-Host ""
    Write-Host "✅ All required prerequisites are installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Set up your database (PostgreSQL or Supabase)" -ForegroundColor White
    Write-Host "  2. Configure zauction-backend/.env file" -ForegroundColor White
    Write-Host "  3. Run database schema: zauction-backend/database/schema.sql" -ForegroundColor White
    Write-Host "  4. Start servers: .\start.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 See QUICK-START.md for detailed instructions" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "⚠️  Some prerequisites are missing" -ForegroundColor Yellow
    Write-Host "Please install the missing items and run this check again" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Read-Host "Press Enter to exit"
