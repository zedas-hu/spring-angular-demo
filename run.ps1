$projectRoot = $PSScriptRoot
$backendRoot = Join-Path $projectRoot 'backend'
$frontendRoot = Join-Path $projectRoot 'frontend'

Start-Process -FilePath 'powershell.exe' `
    -WorkingDirectory $backendRoot `
    -ArgumentList @('-NoExit', '-Command', 'mvn spring-boot:run')

Start-Process -FilePath 'powershell.exe' `
    -WorkingDirectory $frontendRoot `
    -ArgumentList @('-NoExit', '-Command', 'npx ng serve --proxy-config proxy.conf.json')