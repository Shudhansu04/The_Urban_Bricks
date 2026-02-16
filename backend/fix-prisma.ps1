# PowerShell script to fix Prisma installation issues

Write-Host "Stopping all Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Removing Prisma folders..." -ForegroundColor Yellow
Remove-Item -Path "node_modules\@prisma" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate

Write-Host "Done! Now run: npm run prisma:migrate" -ForegroundColor Green
