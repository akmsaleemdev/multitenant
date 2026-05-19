# Run from project root after GitHub + Vercel accounts are ready.
# 1) gh auth login
# 2) .\scripts\publish.ps1

$ErrorActionPreference = "Stop"
$env:Path = "C:\Program Files\Git\bin;C:\Program Files\GitHub CLI;" + $env:Path

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "==> Pushing to https://github.com/akmsaleemdev/multitenant.git"
gh auth setup-git 2>$null
git push -u origin main

Write-Host ""
Write-Host "==> Deploy to Vercel (production)"
Write-Host "    First time: npx vercel login && npx vercel link"
npx vercel --prod

Write-Host ""
Write-Host "Done. Set DATABASE_URL in Vercel dashboard, then run:"
Write-Host '  $env:DATABASE_URL="your-url"; npm run db:setup'
