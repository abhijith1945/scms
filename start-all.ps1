# SCMS Complete Startup Script (All-in-One)
# This script starts everything in the background

Write-Host "Starting Smart Campus Management System (Complete)..." -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Cyan

# Check Java
$javaVersion = java -version 2>&1 | Select-String -Pattern "version" | Out-String
if ($javaVersion -match "17") {
    Write-Host "[OK] Java 17 found" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Java 17 not found. Please install Java 17." -ForegroundColor Red
    exit 1
}

# Check Maven
$mvnVersion = mvn -version 2>&1 | Select-String -Pattern "Maven" | Out-String
if ($mvnVersion) {
    Write-Host "[OK] Maven found" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Maven not found. Please install Maven." -ForegroundColor Red
    exit 1
}

# Check Node
$nodeVersion = node -v 2>&1
if ($nodeVersion -match "v20" -or $nodeVersion -match "v18") {
    Write-Host "[OK] Node.js found" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js 18+ not found. Please install Node.js." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Start Docker
Write-Host "Starting Docker containers..." -ForegroundColor Cyan
docker-compose up -d
Start-Sleep -Seconds 5
Write-Host "[OK] Docker containers started" -ForegroundColor Green
Write-Host ""

# Setup database
Write-Host "Setting up database..." -ForegroundColor Cyan
$dbExists = docker exec scms-postgres-1 psql -U postgres -lqt 2>$null | Select-String -Pattern "scms_users" -Quiet

if (-not $dbExists) {
    docker exec -i scms-postgres-1 psql -U postgres -c "CREATE DATABASE scms_users;"
    Get-Content "database\migrations\V1__init.sql" | docker exec -i scms-postgres-1 psql -U postgres -d scms_users
    Get-Content "database\seeds\data.sql" | docker exec -i scms-postgres-1 psql -U postgres -d scms_users
    Write-Host "[OK] Database created and seeded" -ForegroundColor Green
} else {
    Write-Host "[OK] Database already exists" -ForegroundColor Green
}
Write-Host ""

# Start Backend
Write-Host "Starting Spring Boot backend..." -ForegroundColor Cyan
Write-Host "This may take 1-2 minutes on first run..." -ForegroundColor Yellow
Set-Location backend\user-service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "mvn spring-boot:run" -WindowStyle Normal
Set-Location ..\..
Write-Host "[OK] Backend starting in new window..." -ForegroundColor Green
Write-Host ""

# Wait for backend to start
Write-Host "Waiting for backend to start (checking port 8081)..." -ForegroundColor Cyan
$maxAttempts = 60
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    Start-Sleep -Seconds 2
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test","password":"test"}' -ErrorAction SilentlyContinue 2>$null
        $backendReady = $true
    } catch {
        Write-Host "." -NoNewline
    }
}

if ($backendReady) {
    Write-Host ""
    Write-Host "[OK] Backend is ready!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[WARNING] Backend may still be starting. Check the backend window." -ForegroundColor Yellow
}
Write-Host ""

# Install frontend dependencies if needed
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Start Frontend
Write-Host "Starting React frontend..." -ForegroundColor Cyan
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Set-Location ..
Write-Host "[OK] Frontend starting in new window..." -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 5

Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "SCMS is now running!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Access the application:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8081" -ForegroundColor White
Write-Host "  pgAdmin:  http://localhost:5050" -ForegroundColor White
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "  Student: student1@scms.edu / password123" -ForegroundColor Gray
Write-Host "  Faculty: faculty1@scms.edu / password123" -ForegroundColor Gray
Write-Host ""
Write-Host "Check the other PowerShell windows for backend/frontend logs." -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop everything, close all PowerShell windows and run:" -ForegroundColor Yellow
Write-Host "  docker-compose down" -ForegroundColor Gray
Write-Host ""
