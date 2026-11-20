$ErrorActionPreference = 'Stop'

Write-Host 'Stop any running backend and frontend before using recovery mode.'
Write-Host 'Recovery mode uses a separate build directory; backend edits require a restart.'

Push-Location $PSScriptRoot
try {
    & npm run dev:recovery
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}
finally {
    Pop-Location
}
