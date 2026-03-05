# SCMS Startup Script
# Run this script to start the entire application

Write-Host "Starting Smart Campus Management System..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Cyan
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is running!" -ForegroundColor Green
Write-Host ""

# Start Docker containers
Write-Host "Starting Docker containers (PostgreSQL + pgAdmin)..." -ForegroundColor Cyan
docker-compose up -d
Start-Sleep -Seconds 5
Write-Host "Docker containers started!" -ForegroundColor Green
Write-Host ""

# Check if database exists
Write-Host "Checking database..." -ForegroundColor Cyan
$dbExists = docker exec scms-postgres-1 psql -U postgres -lqt 2>$null | Select-String -Pattern "scms_users" -Quiet

if (-not $dbExists) {
    Write-Host "Creating database and running migrations..." -ForegroundColor Yellow
    
    # Create database
    docker exec -i scms-postgres-1 psql -U postgres -c "CREATE DATABASE scms_users;"
    
    # Run migrations
    Get-Content "database\migrations\V1__init.sql" | docker exec -i scms-postgres-1 psql -U postgres -d scms_users
    
    # Run seeds
    Get-Content "database\seeds\data.sql" | docker exec -i scms-postgres-1 psql -U postgres -d scms_users
    
    Write-Host "Database setup complete!" -ForegroundColor Green
} else {
    Write-Host "Database already exists!" -ForegroundColor Green
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "SCMS is ready to start!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open a NEW terminal and run:" -ForegroundColor White
Write-Host "   cd backend\user-service" -ForegroundColor Gray
Write-Host "   mvn spring-boot:run" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Open ANOTHER terminal and run:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open browser to: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "  Student: student1@scms.edu / password123" -ForegroundColor Gray
Write-Host "  Faculty: faculty1@scms.edu / password123" -ForegroundColor Gray
Write-Host ""
Write-Host "pgAdmin: http://localhost:5050" -ForegroundColor Cyan
Write-Host "  Email: admin@scms.edu / Password: admin" -ForegroundColor Gray
Write-Host ""
