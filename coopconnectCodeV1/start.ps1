$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "================================================" -ForegroundColor Green
Write-Host "  CoopConnect - Demarrage des services" -ForegroundColor Green
Write-Host "================================================"
Write-Host ""

# Verifications
foreach ($cmd in @("python", "java", "node", "mvn")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "[ERREUR] $cmd non trouve" -ForegroundColor Red
        Read-Host "Appuyez sur Entree pour quitter"
        exit 1
    }
}
Write-Host "[OK] Python / Java / Node.js / Maven detectes" -ForegroundColor Green

# Chargement optionnel des variables locales (.env.local)
$ENV_FILE = "$ROOT\.env.local"
if (Test-Path $ENV_FILE) {
    Get-Content $ENV_FILE | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $name = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"').Trim("'")
            if ($name -and -not [Environment]::GetEnvironmentVariable($name, "Process")) {
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
}

if ($env:GOOGLE_CLIENT_ID -and -not $env:VITE_GOOGLE_CLIENT_ID) {
    $env:VITE_GOOGLE_CLIENT_ID = $env:GOOGLE_CLIENT_ID
}

if (-not $env:GOOGLE_CLIENT_ID) {
    Write-Host "[AVERTISSEMENT] GOOGLE_CLIENT_ID non defini - le bouton Google affichera une erreur de configuration" -ForegroundColor Yellow
}

# Python venv
$MATCHING_VENV = "$ROOT\matching-service\venv"
if (Test-Path "$ROOT\matching-service\venv312") {
    $MATCHING_VENV = "$ROOT\matching-service\venv312"
}

if (-not (Test-Path $MATCHING_VENV)) {
    Write-Host "[SETUP] Creation venv Python..."
    python -m venv $MATCHING_VENV
    & "$MATCHING_VENV\Scripts\pip.exe" install -r "$ROOT\matching-service\requirements.txt" --quiet
}

# Node modules
if (-not (Test-Path "$ROOT\frontend\node_modules")) {
    Write-Host "[SETUP] Installation npm..."
    Push-Location "$ROOT\frontend"
    npm install --silent
    Pop-Location
}

Write-Host ""
Write-Host "[1/6] Discovery Service :8761..."
Start-Process "cmd" -ArgumentList "/k title Discovery :8761 && cd /d `"$ROOT\discovery-service`" && mvn spring-boot:run -DskipTests"
Start-Sleep -Seconds 20

Write-Host "[2/6] API Gateway :8080..."
Start-Process "cmd" -ArgumentList "/k title Gateway :8080 && cd /d `"$ROOT\api-gateway`" && mvn spring-boot:run -DskipTests"
Start-Sleep -Seconds 15

Write-Host "[3/6] Auth Service :8081..."
Start-Process "cmd" -ArgumentList "/k title Auth :8081 && cd /d `"$ROOT\auth-service`" && set `"GOOGLE_CLIENT_ID=$env:GOOGLE_CLIENT_ID`" && set `"TWILIO_ACCOUNT_SID=$env:TWILIO_ACCOUNT_SID`" && set `"TWILIO_AUTH_TOKEN=$env:TWILIO_AUTH_TOKEN`" && set `"TWILIO_FROM_NUMBER=$env:TWILIO_FROM_NUMBER`" && mvn spring-boot:run -Dspring-boot.run.profiles=dev -DskipTests"
Start-Sleep -Seconds 25

Write-Host "[4/6] Core Service :8082..."
Start-Process "cmd" -ArgumentList "/k title Core :8082 && cd /d `"$ROOT\backend`" && mvn spring-boot:run -Dspring-boot.run.profiles=dev -DskipTests"
Start-Sleep -Seconds 25

Write-Host "[5/6] Matching AI :8000..."
# IMPORTANT : Definissez GEMINI_API_KEY dans votre environnement avant de lancer ce script
if (-not $env:GEMINI_API_KEY) {
    Write-Host "[AVERTISSEMENT] GEMINI_API_KEY non definie - le matching IA utilisera uniquement TF-IDF" -ForegroundColor Yellow
}
Start-Process "cmd" -ArgumentList "/k title Matching :8000 && cd /d `"$ROOT\matching-service`" && `"$MATCHING_VENV\Scripts\activate.bat`" && set GEMINI_API_KEY=$env:GEMINI_API_KEY && python -m uvicorn main:app --reload --port 8000"
Start-Sleep -Seconds 5

Write-Host "[6/6] Frontend :5173..."
Start-Process "cmd" -ArgumentList "/k title Frontend :5173 && cd /d `"$ROOT\frontend`" && set `"VITE_GOOGLE_CLIENT_ID=$env:VITE_GOOGLE_CLIENT_ID`" && set `"VITE_PUBLIC_APP_URL=$env:VITE_PUBLIC_APP_URL`" && npm run dev"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Tous les services sont lances !" -ForegroundColor Green
Write-Host "================================================"
Write-Host ""
Write-Host "  Frontend  : http://localhost:5173"
Write-Host "  Eureka    : http://localhost:8761"
Write-Host "  Docs AI   : http://localhost:8000/docs"
Write-Host ""
Write-Host "  Compte demo : ahmed.benali / Test1234!"
Write-Host ""
Write-Host "Ouverture du navigateur dans 10s..."
Start-Sleep -Seconds 10
Start-Process "http://localhost:5173"
Start-Process "http://localhost:8761"

Read-Host "Appuyez sur Entree pour fermer"
