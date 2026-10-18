$ErrorActionPreference = 'Stop'
$moduleRoot = Split-Path $PSScriptRoot -Parent
$distPath = Join-Path $moduleRoot 'dist'
New-Item -ItemType Directory -Path $distPath -Force | Out-Null
$packageFiles = 'module.json','src','styles','lang','assets','README.md','CHANGELOG.md' | ForEach-Object { Join-Path $moduleRoot $_ }
Compress-Archive -LiteralPath $packageFiles -DestinationPath (Join-Path $distPath 'quedaco-teatro.zip') -Force
Copy-Item -LiteralPath (Join-Path $moduleRoot 'module.json') -Destination (Join-Path $distPath 'module.json')
Write-Output (Join-Path $distPath 'quedaco-teatro.zip')
