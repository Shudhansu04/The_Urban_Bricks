# Quick Start Guide

Get the Property Marketplace running locally in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)

## 1. Clone and Setup Backend

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your DATABASE_URL and other configs
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Backend runs on `http://localhost:4000`

## 2. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:4000/api
npm run dev
```

Frontend runs on `http://localhost:5173`

## 3. Test the Application

1. Open `http://localhost:5173`
2. Sign up a new account
3. Submit a property
4. Check admin email/WhatsApp (if configured)
5. Login as admin (credentials from seed script)
6. Approve/reject properties

## Default Admin

After running `npm run seed`:
- Email: Value from `ADMIN_EMAIL` in `.env`
- Password: Value from `ADMIN_PASSWORD` in `.env` (default: `admin123`)

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Ensure MongoDB is running (if local)
- For MongoDB Atlas, check IP whitelist and connection string
- Verify database name in connection string

### Port Already in Use
- Change `PORT` in backend `.env`
- Update `VITE_API_URL` in frontend `.env`

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check browser console for specific errors

## Next Steps

- See `README.md` for full documentation
- See `DEPLOYMENT.md` for production deployment
- Configure SendGrid and Twilio for notifications
