# Backend API

Express.js REST API for The Urban Bricks.

## Setup

1. Install dependencies: `npm install`
2. Copy `env.example` to `.env` and configure
3. Run migrations: `npm run prisma:migrate`
4. Generate Prisma client: `npm run prisma:generate`
5. Seed admin user: `npm run seed`
6. Start server: `npm run dev`

## Environment Variables

See `env.example` for required variables.

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:deploy` - Deploy migrations (production)
- `npm run seed` - Seed admin user

## API Documentation

See main README.md for endpoint documentation.
