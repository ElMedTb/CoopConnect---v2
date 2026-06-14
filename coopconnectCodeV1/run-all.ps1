param(
    [switch]$SkipInstall,
    [switch]$NoBrowser,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$LOG_DIR = Join-Path $ROOT "logs"
New-Item -ItemType Directory -Force -Path $LOG_DIR | Out-Null

function Write-Step($Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok($Message) {
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn($Message) {
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Escape-SingleQuote($Value) {
    return $Value.Replace("'", "''")
}

function Load-EnvFile($Path) {
    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }

    Get-Content -LiteralPath $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) { return }

        $parts = $line.Split("=", 2)
        $name = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")

        if ($name) {
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

function Test-Port($Port) {
    try {
        $client = New-Object Net.Sockets.TcpClient
        $result = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        $success = $result.AsyncWaitHandle.WaitOne(500)
        if ($success) { $client.EndConnect($result) }
        $client.Close()
        return $success
    } catch {
        return $false
    }
}

function Wait-Port($Name, $Port, $TimeoutSeconds = 120) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-Port $Port) {
            Write-Ok "$Name disponible sur le port $Port"
            return $true
        }
        Start-Sleep -Seconds 2
    }

    Write-Warn "$Name ne repond pas encore sur le port $Port apres $TimeoutSeconds secondes."
    Write-Warn "Consultez le log du service dans: $LOG_DIR"
    return $false
}

function Assert-Directory($Path, $Label) {
    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "$Label introuvable: $Path"
    }
}

function Assert-Command($CommandName) {
    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "$CommandName introuvable. Installez-le ou ajoutez-le au PATH."
    }
}

function New-ServiceSlug($Title) {
    $slug = $Title.ToLowerInvariant() -replace "[^a-z0-9]+", "-"
    return $slug.Trim("-")
}

function Start-CoopService($Title, $WorkingDirectory, $Command, $Port = $null, $WaitSeconds = 120) {
    if ($Port -and (Test-Port $Port)) {
        Write-Warn "$Title semble deja lance sur le port $Port. Je ne relance pas ce service."
        return
    }

    if ($DryRun) {
        Write-Ok "DryRun: $Title -> $Command"
        return
    }

    $slug = New-ServiceSlug $Title
    $logFile = Join-Path $LOG_DIR "$slug.log"
    $launcherFile = Join-Path $LOG_DIR "$slug.launch.ps1"
    $safeTitle = Escape-SingleQuote $Title
    $safeDir = Escape-SingleQuote $WorkingDirectory
    $safeLog = Escape-SingleQuote $logFile

    $launcher = @"
`$ErrorActionPreference = 'Continue'
`$Host.UI.RawUI.WindowTitle = '$safeTitle'
Set-Location -LiteralPath '$safeDir'
'' | Tee-Object -FilePath '$safeLog' -Append
'============================================================' | Tee-Object -FilePath '$safeLog' -Append
'$safeTitle' | Tee-Object -FilePath '$safeLog' -Append
('Started: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Tee-Object -FilePath '$safeLog' -Append
'Working directory: $safeDir' | Tee-Object -FilePath '$safeLog' -Append
'============================================================' | Tee-Object -FilePath '$safeLog' -Append
$Command 2>&1 | Tee-Object -FilePath '$safeLog' -Append
'' | Tee-Object -FilePath '$safeLog' -Append
('Stopped: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Tee-Object -FilePath '$safeLog' -Append
Read-Host 'Service arrete. Appuyez sur Entree pour fermer cette fenetre'
"@

    Set-Content -LiteralPath $launcherFile -Value $launcher -Encoding UTF8
    Start-Process -FilePath "powershell.exe" -ArgumentList @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", $launcherFile
    ) -WorkingDirectory $WorkingDirectory -WindowStyle Normal | Out-Null

    if ($Port) {
        Wait-Port $Title $Port $WaitSeconds | Out-Null
    }
}

function Install-MatchingRequirements($PythonExe, $RequirementsPath) {
    & $PythonExe -c "import fastapi, uvicorn" *> $null
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "Dependencies Python matching deja installees"
        return
    }

    if ($SkipInstall) {
        throw "Dependencies Python matching absentes et -SkipInstall active."
    }

    Write-Host "Installation des dependencies Python matching..."
    & $PythonExe -m pip install -r $RequirementsPath
    if ($LASTEXITCODE -ne 0) {
        throw "Installation des dependencies Python matching echouee."
    }
}

Write-Host "================================================" -ForegroundColor Green
Write-Host "  CoopConnect - Run All" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Step "Verification de la structure projet"
$discoveryDir = Join-Path $ROOT "discovery-service"
$authDir = Join-Path $ROOT "auth-service"
$coreDir = Join-Path $ROOT "backend"
$gatewayDir = Join-Path $ROOT "api-gateway"
$matchingDir = Join-Path $ROOT "matching-service"
$frontendDir = Join-Path $ROOT "frontend"

Assert-Directory $discoveryDir "discovery-service"
Assert-Directory $authDir "auth-service"
Assert-Directory $coreDir "backend / core-service"
Assert-Directory $gatewayDir "api-gateway"
Assert-Directory $matchingDir "matching-service"
Assert-Directory $frontendDir "frontend"
Write-Ok "Structure projet valide: $ROOT"

Write-Step "Chargement des variables locales"
Load-EnvFile (Join-Path $ROOT "local-config.env")
Load-EnvFile (Join-Path $ROOT ".env.local")

if ($env:GOOGLE_CLIENT_ID -and -not $env:VITE_GOOGLE_CLIENT_ID) {
    $env:VITE_GOOGLE_CLIENT_ID = $env:GOOGLE_CLIENT_ID
}

if (-not $env:VITE_PUBLIC_APP_URL) {
    try {
        $ip = Get-NetIPAddress -AddressFamily IPv4 |
            Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
            Select-Object -First 1 -ExpandProperty IPAddress
        if ($ip) {
            $env:VITE_PUBLIC_APP_URL = "http://$ip`:5173"
            Write-Ok "VITE_PUBLIC_APP_URL auto: $env:VITE_PUBLIC_APP_URL"
        }
    } catch {
        Write-Warn "Detection IP locale impossible. Le QR mobile peut necessiter VITE_PUBLIC_APP_URL dans local-config.env."
    }
}

if (-not $env:GOOGLE_CLIENT_ID) { Write-Warn "GOOGLE_CLIENT_ID manquant: Google Login sera desactive." }
if (-not $env:VITE_GOOGLE_CLIENT_ID) { Write-Warn "VITE_GOOGLE_CLIENT_ID manquant: le bouton Google frontend sera desactive." }
if (-not $env:TWILIO_ACCOUNT_SID -or -not $env:TWILIO_AUTH_TOKEN -or -not $env:TWILIO_FROM_NUMBER) {
    Write-Warn "Variables TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER incompletes: SMS reel peut echouer."
}
if (-not $env:MAIL_USERNAME -or -not $env:MAIL_PASSWORD) {
    Write-Warn "Variables MAIL_USERNAME / MAIL_PASSWORD incompletes: email reel peut echouer."
}
if (-not $env:GEMINI_API_KEY) { Write-Warn "GEMINI_API_KEY manquante: Gemini sera desactive." }
Write-Ok "Variables locales chargees sans afficher les secrets"

Write-Step "Verification des outils"
foreach ($cmd in @("java", "node", "npm.cmd", "mvn.cmd", "python")) {
    Assert-Command $cmd
}
Write-Ok "Java / Node / npm / Maven / Python detectes"

Write-Step "Preparation matching-service"
$venvDir = Join-Path $matchingDir "venv312"
if (-not (Test-Path -LiteralPath $venvDir -PathType Container)) {
    $venvDir = Join-Path $matchingDir "venv"
}
if (-not (Test-Path -LiteralPath $venvDir -PathType Container)) {
    if ($SkipInstall) {
        throw "Venv Python absent et -SkipInstall active."
    }
    Write-Host "Creation du venv Python matching..."
    & python -m venv $venvDir
    if ($LASTEXITCODE -ne 0) {
        throw "Creation du venv Python echouee."
    }
}
$matchingPython = Join-Path $venvDir "Scripts\python.exe"
Install-MatchingRequirements $matchingPython (Join-Path $matchingDir "requirements.txt")
Write-Ok "Python matching: $matchingPython"

Write-Step "Preparation frontend"
if (-not (Test-Path -LiteralPath (Join-Path $frontendDir "node_modules") -PathType Container)) {
    if ($SkipInstall) {
        throw "node_modules absent et -SkipInstall active."
    }
    Push-Location $frontendDir
    npm.cmd install
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        throw "npm install frontend echoue."
    }
    Pop-Location
}
Write-Ok "Frontend pret"

Write-Step "Lancement des services"
Start-CoopService "CoopConnect Discovery :8761" $discoveryDir "mvn.cmd spring-boot:run -DskipTests" 8761 120
Start-CoopService "CoopConnect Auth :8081" $authDir "`$env:SPRING_PROFILES_ACTIVE='dev'; mvn.cmd spring-boot:run -DskipTests" 8081 140
Start-CoopService "CoopConnect Core :8082" $coreDir "`$env:SPRING_PROFILES_ACTIVE='dev'; mvn.cmd spring-boot:run -DskipTests" 8082 140
Start-CoopService "CoopConnect Gateway :8090" $gatewayDir "mvn.cmd spring-boot:run -DskipTests" 8090 120
Start-CoopService "CoopConnect Matching :8000" $matchingDir "& '$matchingPython' -m uvicorn main:app --reload --port 8000" 8000 90
Start-CoopService "CoopConnect Frontend :5173" $frontendDir "npm.cmd run dev -- --host 0.0.0.0 --port 5173" 5173 90

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  CoopConnect est lance" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "Frontend local : http://localhost:5173"
if ($env:VITE_PUBLIC_APP_URL) { Write-Host "Frontend reseau: $env:VITE_PUBLIC_APP_URL" }
Write-Host "Gateway        : http://localhost:8090"
Write-Host "Auth service   : http://localhost:8081"
Write-Host "Core service   : http://localhost:8082"
Write-Host "Matching docs  : http://localhost:8000/docs"
Write-Host "Eureka         : http://localhost:8761"
Write-Host "Logs           : $LOG_DIR"
Write-Host ""
Write-Host "Pour relancer proprement, fermez les fenetres des services deja ouvertes puis relancez RUN_PROJECT.cmd."
Write-Host ""

if (-not $NoBrowser -and -not $DryRun) {
    try {
        Start-Process "http://localhost:5173" | Out-Null
    } catch {
        Write-Warn "Ouverture automatique du navigateur impossible."
    }
}
