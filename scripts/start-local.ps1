param([string]$ApiPath)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
if (-not $ApiPath) { $ApiPath = Join-Path (Split-Path $projectRoot -Parent) 'ESPN-API' }
$ApiPath = (Resolve-Path -LiteralPath $ApiPath).Path
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$logDirectory = Join-Path $projectRoot '.local'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

function Start-LocalService($Name, $Port, $Entry, $WorkingDirectory) {
    if (-not (Test-Path -LiteralPath $Entry)) { throw "Missing $Entry. Install the project's dependencies first." }
    $listener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($listener) {
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
        if (-not $process.CommandLine -or -not $process.CommandLine.Contains($Entry)) {
            throw "Port $Port is already used by another process (PID $($listener.OwningProcess))."
        }
        Write-Host "$Name is already running on port $Port."
        return
    }

    $env:PORT = [string]$Port
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
    $started = Start-Process -FilePath $nodePath -ArgumentList ('"' + $Entry + '"') `
        -WorkingDirectory $WorkingDirectory -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $logDirectory "$Name-$stamp.log") `
        -RedirectStandardError (Join-Path $logDirectory "$Name-$stamp.error.log")
    Write-Host "Started $Name on port $Port (PID $($started.Id))."
}

$previousPort = $env:PORT
$previousBrowser = $env:BROWSER
$previousNodeOptions = $env:NODE_OPTIONS
$previousApiUrl = $env:REACT_APP_API_URL
try {
    Start-LocalService 'api' 3002 (Join-Path $ApiPath 'index.js') $ApiPath
    $env:BROWSER = 'none'
    $env:NODE_OPTIONS = (($previousNodeOptions + ' --openssl-legacy-provider').Trim())
    $env:REACT_APP_API_URL = '/'
    Start-LocalService 'frontend' 3001 (Join-Path $projectRoot 'node_modules\react-scripts\scripts\start.js') $projectRoot
} finally {
    $env:PORT = $previousPort
    $env:BROWSER = $previousBrowser
    $env:NODE_OPTIONS = $previousNodeOptions
    $env:REACT_APP_API_URL = $previousApiUrl
}

$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
        $response = Invoke-WebRequest -Uri 'http://127.0.0.1:3001/' -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) { $ready = $true; break }
    } catch { }
    Start-Sleep -Seconds 1
}
if (-not $ready) { throw "The frontend did not become ready. Check logs in $logDirectory." }
Write-Host 'Local preview is ready: http://localhost:3001/?league=IFHL#/overview'
Write-Host "Background service logs: $logDirectory"
