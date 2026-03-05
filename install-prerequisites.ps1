# SCMS Prerequisites Installation Script
# Run this script as Administrator (Right-click -> Run as Administrator)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "SCMS Prerequisites Installation" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click on PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit 1
}

Write-Host "[OK] Running as Administrator" -ForegroundColor Green
Write-Host ""

# Check current installations
Write-Host "Checking current installations..." -ForegroundColor Cyan
Write-Host ""

$javaInstalled = Get-Command java -ErrorAction SilentlyContinue
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
$mvnInstalled = Get-Command mvn -ErrorAction SilentlyContinue
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($javaInstalled) {
    Write-Host "[INSTALLED] Java" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Java" -ForegroundColor Yellow
}

if ($nodeInstalled) {
    Write-Host "[INSTALLED] Node.js" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Node.js" -ForegroundColor Yellow
}

if ($mvnInstalled) {
    Write-Host "[INSTALLED] Maven" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Maven" -ForegroundColor Yellow
}

if ($dockerInstalled) {
    Write-Host "[INSTALLED] Docker" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Docker Desktop" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Installing missing components..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Ensure Chocolatey is installed
if (-not $chocoInstalled) {
    Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Host "[OK] Chocolatey installed" -ForegroundColor Green
    Write-Host ""
}

# Install Maven
if (-not $mvnInstalled) {
    Write-Host "Installing Maven..." -ForegroundColor Yellow
    choco install maven -y
    Write-Host "[OK] Maven installed" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Maven already installed, skipping..." -ForegroundColor Gray
}

# Install Docker Desktop
if (-not $dockerInstalled) {
    Write-Host "Installing Docker Desktop..." -ForegroundColor Yellow
    Write-Host "(This may take 5-10 minutes)" -ForegroundColor Gray
    choco install docker-desktop -y
    Write-Host "[OK] Docker Desktop installed" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: You need to restart your computer after Docker installation!" -ForegroundColor Red
    Write-Host ""
} else {
    Write-Host "Docker already installed, skipping..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Close this PowerShell window" -ForegroundColor White
Write-Host "2. Open a NEW PowerShell window (normal, not admin)" -ForegroundColor White
Write-Host "3. Run: cd c:\Users\abhij\scms" -ForegroundColor Gray
Write-Host "4. Run: .\start-all.ps1" -ForegroundColor Gray
Write-Host ""

if (-not $dockerInstalled) {
    Write-Host "IMPORTANT: After Docker installation, you MUST:" -ForegroundColor Red
    Write-Host "  1. Restart your computer" -ForegroundColor Yellow
    Write-Host "  2. Start Docker Desktop application" -ForegroundColor Yellow
    Write-Host "  3. Wait for Docker to finish starting (check system tray icon)" -ForegroundColor Yellow
    Write-Host "  4. Then run .\start-all.ps1" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
