### ShopDashPro - Setup ###
### Run: powershell -ExecutionPolicy Bypass -File setup.ps1 ###

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   ShopDashPro - Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] Installing packages..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "[2/5] Resetting database (clean start)..." -ForegroundColor Yellow
npx prisma db push --force-reset --accept-data-loss

Write-Host ""
Write-Host "[3/5] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "[4/5] Loading 3 demo shops (~1 min)..." -ForegroundColor Yellow
npm run db:seed

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   DONE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "   Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Email:    demo@shopdashpro.com" -ForegroundColor White
Write-Host "   Password: demo123" -ForegroundColor White
Write-Host ""

Write-Host "[5/5] Starting server..." -ForegroundColor Yellow
npm run dev
