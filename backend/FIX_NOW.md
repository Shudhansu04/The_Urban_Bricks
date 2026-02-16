# Quick Fix for Prisma Errors

## The Problem
- Files are locked (EBUSY error)
- Prisma client binary missing (ENOENT error)

## Solution - Run These Commands

### Option 1: Use the PowerShell Script (Easiest)
```powershell
cd "C:\Users\Himanshu Pandey\OneDrive\Desktop\Property_Selling Website\backend"
.\fix-prisma.ps1
```

### Option 2: Manual Steps

**Step 1: Kill Node Processes**
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Step 2: Delete Prisma Folders**
```powershell
cd "C:\Users\Himanshu Pandey\OneDrive\Desktop\Property_Selling Website\backend"
Remove-Item -Path "node_modules\@prisma" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
```

**Step 3: Clean and Reinstall**
```powershell
npm cache clean --force
npm install
```

**Step 4: Generate Prisma Client**
```powershell
npm run prisma:generate
```

**Step 5: Push Schema to Database**
```powershell
npm run prisma:migrate
```

**Step 6: Seed Admin User**
```powershell
npm run seed
```

## If Still Getting Errors

1. **Close ALL terminals and editors**
2. **Restart your computer** (this releases all file locks)
3. **Open a fresh terminal** and run the commands again

## Alternative: Delete Everything and Start Fresh

If nothing works:
```powershell
cd "C:\Users\Himanshu Pandey\OneDrive\Desktop\Property_Selling Website\backend"
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path "package-lock.json" -Force
npm install
npm run prisma:generate
```
