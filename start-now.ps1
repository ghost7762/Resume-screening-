$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"
$PythonPath = Join-Path $ProjectRoot ".venv\Scripts\python.exe"

Write-Host "Starting Resume Screening AI..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd `"$BackendPath`"; `"$PythonPath`" app.py"
)

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd `"$FrontendPath`"; npm start"
)

Write-Host "Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
