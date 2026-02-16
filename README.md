# Property Selling Website

A full-stack property marketplace application built with MERN stack (MongoDB/PostgreSQL, Express, React, Node.js).

## Features

- **User Authentication**: Signup, login, and role-based access (USER/ADMIN)
- **Property Listings**: Create, view, update, and delete property listings
- **Search & Filter**: Search properties by title, location, city, state, and price range
- **Admin Dashboard**: Review pending properties, approve/reject listings, view statistics
- **Notifications**: Automatic email (SendGrid) and WhatsApp (Twilio) notifications to admin on new submissions
- **Inquiries**: Contact property owners through inquiry system
- **Responsive Design**: Modern, mobile-friendly UI

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Prisma ORM
- JWT authentication (httpOnly cookies)
- SendGrid for email notifications
- Twilio for WhatsApp notifications
- Zod for validation
- Helmet, CORS for security

### Frontend
- React with Vite
- React Router for navigation
- Axios for API calls
- Modern CSS with responsive design

## Project Structure

```
Property_Selling Website/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, validation, rate limiting
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (notifications)
│   │   ├── utils/           # Helper functions
│   │   ├── scripts/         # Seed scripts
│   │   └── index.js         # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── utils/           # API utilities
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB database (local or MongoDB Atlas)
- SendGrid account (for email)
- Twilio account (for WhatsApp)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="mongodb://localhost:27017/property_db"
PORT=4000
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="your-secret-key"
SENDGRID_API_KEY="your-sendgrid-key"
SENDGRID_FROM_EMAIL="no-reply@example.com"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
ADMIN_WHATSAPP_TO="whatsapp:+911234567890"
NODE_ENV="development"
```

4. Set up database:
```bash
# Make sure MongoDB is running locally or use MongoDB Atlas connection string

# Generate Prisma client
npm run prisma:generate

# Push schema to MongoDB (MongoDB doesn't use migrations)
npm run prisma:migrate

# Seed admin user
npm run seed
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:4000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - List properties (with filters)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (authenticated)
- `PUT /api/properties/:id` - Update property (owner/admin)
- `DELETE /api/properties/:id` - Delete property (owner/admin)

### Inquiries
- `POST /api/inquiries` - Create inquiry
- `GET /api/inquiries` - List user inquiries (authenticated)
- `PATCH /api/inquiries/:id/status` - Update inquiry status

### Admin
- `GET /api/admin/pending` - Get pending properties
- `PUT /api/admin/properties/:id/status` - Update property status
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/notifications` - Get notification logs

## Deployment

### Backend Deployment (Render/Fly/Railway)

1. Push code to GitHub
2. Connect repository to your hosting platform
3. Set environment variables
4. Set build command: `npm install && npm run prisma:generate && npm run prisma:deploy`
5. Set start command: `npm start`

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL` pointing to your backend URL

### Database (Neon/Supabase)

1. Create a PostgreSQL database
2. Get connection string
3. Update `DATABASE_URL` in backend environment variables
4. Run migrations: `npm run prisma:deploy`

### Domain Setup

1. Purchase domain from Namecheap/Google Domains
2. In Vercel, add your domain
3. Update DNS records as instructed by Vercel
4. SSL certificates are automatically provisioned

## Default Admin Credentials

After running the seed script:
- Email: Set in `ADMIN_EMAIL` environment variable
- Password: Set in `ADMIN_PASSWORD` environment variable

## Security Features

- JWT tokens in httpOnly cookies
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- Input validation with Zod
- Helmet for security headers
- CORS configuration
- Role-based access control

## License

ISC
