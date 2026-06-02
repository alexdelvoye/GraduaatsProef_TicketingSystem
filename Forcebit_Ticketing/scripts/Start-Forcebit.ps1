param(
    [int]$FrontendPort = 8081,
    [switch]$NoBrowser,
    [switch]$OpenSwagger
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$backendProject = Join-Path $repoRoot "Ticketing_Backend/1_Api/1_Api.csproj"
$frontendRoot = Join-Path $repoRoot "Ticketing_Frontend"
$frontendModules = Join-Path $frontendRoot "node_modules"

$backendUrl = "http://localhost:5047"
$frontendUrl = "http://localhost:$FrontendPort"
$frontendStartCommand = "npx expo start --port $FrontendPort"

if (-not $NoBrowser) {
    $frontendStartCommand = "$frontendStartCommand --web"
}

function Assert-CommandAvailable {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandName
    )

    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "Required command '$CommandName' was not found. Install it before starting the app."
    }
}

function Stop-ProcessTree {
    param(
        [Parameter(Mandatory = $true)]
        [System.Diagnostics.Process[]]$Processes
    )

    foreach ($process in $Processes) {
        if ($process -and -not $process.HasExited) {
            # taskkill stops the terminal process and its child command
            # together, so dotnet/npx do not keep running in the background.
            taskkill.exe /PID $process.Id /T /F | Out-Null
        }
    }
}

# The launcher is used for development and demos, so it checks prerequisites up
# front instead of opening several terminals that fail with separate messages.
Assert-CommandAvailable "dotnet"
Assert-CommandAvailable "npm"

if (-not (Test-Path -LiteralPath $frontendModules)) {
    throw "Frontend dependencies are missing. Run 'npm install' inside Ticketing_Frontend first."
}

$backendCommand = @"
`$Host.UI.RawUI.WindowTitle = 'Forcebit Ticketing - Backend';
Set-Location -LiteralPath '$repoRoot';
Write-Host 'Backend logger output appears in this terminal.';
dotnet run --project '$backendProject' --launch-profile http
"@

$frontendCommand = @"
`$Host.UI.RawUI.WindowTitle = 'Forcebit Ticketing - Frontend';
Set-Location -LiteralPath '$frontendRoot';
`$env:EXPO_DEBUG = '1';
Write-Host 'Frontend Expo/Metro logger output appears in this terminal.';
$frontendStartCommand
"@

$startedProcesses = @()

try {
    Write-Host "Starting Forcebit Ticketing backend at $backendUrl ..."
    $startedProcesses += Start-Process powershell.exe -ArgumentList @("-NoExit", "-Command", $backendCommand) -PassThru

    Write-Host "Starting Forcebit Ticketing frontend at $frontendUrl ..."
    $startedProcesses += Start-Process powershell.exe -ArgumentList @("-NoExit", "-Command", $frontendCommand) -PassThru

    if ($OpenSwagger) {
        Start-Sleep -Seconds 4
        Write-Host "Opening Swagger in the browser: $backendUrl/swagger"
        Start-Process "$backendUrl/swagger"
    }

    Write-Host ""
    Write-Host "Backend:  $backendUrl"
    Write-Host "Frontend: $frontendUrl"
    Write-Host ""
    Write-Host "Press any key in this launcher window to stop the app and close the service terminals."
    [void][System.Console]::ReadKey($true)
}
finally {
    Write-Host ""
    Write-Host "Stopping Forcebit Ticketing ..."
    Stop-ProcessTree -Processes $startedProcesses
    Write-Host "Backend and frontend stopped."
}
