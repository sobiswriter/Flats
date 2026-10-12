$ErrorActionPreference = 'Stop'
$flatsRoot = $PSScriptRoot
Set-Location -LiteralPath $flatsRoot
try {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 22 or newer, then run this launcher again.' }
    if (-not (Test-Path -LiteralPath (Join-Path $flatsRoot 'node_modules/three'))) {
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
    }
    # Build on launch so the game always matches the source in this folder.
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'The game could not be built.' }
    $flatsPort = 3001
    $flatsRunning = $false
    try {
        $flatsResponse = Invoke-WebRequest -Uri "http://localhost:$flatsPort/" -UseBasicParsing -TimeoutSec 2
        $flatsRunning = $flatsResponse.Content -match '<title>FLATS'
    } catch {}
    if (-not $flatsRunning) {
        if (Get-NetTCPConnection -LocalPort $flatsPort -State Listen -ErrorAction SilentlyContinue) { $flatsPort = 3003 }
        $flatsPreviousPort = $env:PORT
        try {
            $env:PORT = [string]$flatsPort
            Start-Process -FilePath (Get-Command node).Source -ArgumentList @('server.mjs') -WorkingDirectory $flatsRoot -WindowStyle Hidden
        } finally { $env:PORT = $flatsPreviousPort }
        $flatsReady = $false
        for ($flatsTry = 0; $flatsTry -lt 30; $flatsTry++) {
            Start-Sleep -Milliseconds 200
            try { $flatsReady = (Invoke-WebRequest -Uri "http://localhost:$flatsPort/" -UseBasicParsing -TimeoutSec 1).Content -match '<title>FLATS' } catch {}
            if ($flatsReady) { break }
        }
        if (-not $flatsReady) { throw 'The local game server did not start. Try npm start in this folder.' }
    }
    Start-Process "http://localhost:$flatsPort/?build=03"
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host 'Press Enter to close'
    exit 1
}
