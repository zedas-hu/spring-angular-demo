param(
    [switch]$Test
)

$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
$backendDirectory = Join-Path $projectRoot 'backend'
$targetDirectory = Join-Path $backendDirectory 'target'
$pomFile = Join-Path $backendDirectory 'pom.xml'

if (Test-Path -LiteralPath $targetDirectory) {
    $maxAttempts = 5
    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        try {
            Remove-Item -LiteralPath $targetDirectory -Recurse -Force
            break
        }
        catch {
            if ($attempt -eq $maxAttempts) {
                throw "Could not delete $targetDirectory. Stop the running backend and try again. $($_.Exception.Message)"
            }
            Start-Sleep -Seconds 1
        }
    }
    Write-Host "Deleted: $targetDirectory"
}
else {
    Write-Host "Nothing to delete: $targetDirectory does not exist."
}

if ($Test) {
    if (-not $env:DB_URL) {
        Write-Warning 'DB_URL is not set. The backend tests need it (see backend/src/main/resources/application.yml).'
    }

    Write-Host 'Running backend tests...'
    & mvn -B -f $pomFile test
    if ($LASTEXITCODE -ne 0) {
        throw "Maven tests failed with exit code $LASTEXITCODE."
    }
}
