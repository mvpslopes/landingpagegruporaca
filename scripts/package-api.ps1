# Empacota a pasta api/ em release/api-deploy-<data>.zip (PHP nao tem build; e o pacote para upload).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$api = Join-Path $root "api"
if (-not (Test-Path $api)) {
  Write-Error "Pasta api/ nao encontrada em $root"
  exit 1
}
$outDir = Join-Path $root "release"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zip = Join-Path $outDir "api-deploy-$stamp.zip"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -LiteralPath $api -DestinationPath $zip -CompressionLevel Optimal -Force
Write-Host "Pacote criado: $zip"
Write-Host "Extraia na hospedagem e mantenha a estrutura em /api/ (inclua vendor/ se usar Google API no servidor)."
