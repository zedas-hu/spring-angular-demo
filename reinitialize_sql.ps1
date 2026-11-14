$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
$seedDatabase = Join-Path $projectRoot 'database\seed\bookstore.db'
$dataDirectory = Join-Path $projectRoot 'database\data'
$database = Join-Path $dataDirectory 'bookstore.db'

if (-not (Test-Path -LiteralPath $seedDatabase -PathType Leaf)) {
    throw "Seed database not found: $seedDatabase"
}

if ((Get-Item -LiteralPath $seedDatabase).Length -eq 0) {
    throw "Seed database is empty: $seedDatabase"
}

New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null

Write-Host 'Restoring the SQLite database from the seed file...'
Write-Host 'Make sure the backend is stopped before continuing.'

$databaseFiles = @(
    $database
    ('{0}-wal' -f $database)
    ('{0}-shm' -f $database)
    ('{0}-journal' -f $database)
)

foreach ($file in $databaseFiles) {
    if (Test-Path -LiteralPath $file) {
        Remove-Item -LiteralPath $file -Force
    }
}

Copy-Item -LiteralPath $seedDatabase -Destination $database

Write-Host "Database restored to: $database"