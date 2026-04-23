# Quvna_web2 -> GitHub (SSH). Sizning PC da ishga tushiring: saqlangan SSH key GitHub da bo'lishi kerak.
# PowerShell: ichida:  .\scripts\push-to-github.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
git remote set-url origin "git@github.com:Quvna/Quvna_web2.git"
Write-Host "origin:" -ForegroundColor Cyan
git remote -v
Write-Host "`nPushing master..." -ForegroundColor Cyan
git push -u origin master
Write-Host "`nTayyor." -ForegroundColor Green
