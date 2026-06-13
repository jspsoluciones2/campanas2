# Desarrollo local — Plataforma Campañas
# Uso: .\scripts\dev.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "Instalando dependencias raíz (si aplica)..."
Set-Location $Root
if (-not (Test-Path "node_modules")) { npm install }

Write-Host "Iniciando Flask (5000) y Next.js (3000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root'; python services/python/run.py"
Set-Location "$Root\apps\web"
npm run dev
