# Prisma Configuration Fix

## Issue
Prisma 7 has breaking changes for MongoDB that require adapters. Prisma 6 has better MongoDB support.

## Solution
1. Close any running Node processes
2. Run: `npm install` (this will install Prisma 6)
3. Run: `npm run prisma:generate`
4. Run: `npm run prisma:migrate` (or `prisma db push`)
5. Run: `npm run seed`

## If npm install fails with EBUSY error:
1. Close all terminals/editors
2. Restart your computer (or kill Node processes)
3. Delete `node_modules` folder
4. Run `npm install` again
