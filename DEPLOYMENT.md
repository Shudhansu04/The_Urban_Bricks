# Deployment Guide

Complete guide to deploy the Property Marketplace application.

## Overview

- **Frontend**: Deploy to Vercel (recommended) or Netlify
- **Backend**: Deploy to Render, Fly.io, Railway, or Vercel Serverless
- **Database**: Use Neon, Supabase, or Railway PostgreSQL
- **Domain**: Purchase from Namecheap/Google Domains and configure in Vercel

## Step 1: Database Setup

### Option A: MongoDB Atlas (Recommended - Free Tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up and create a free cluster
3. Create a database user (Database Access)
4. Whitelist your IP (0.0.0.0/0 for all IPs, or specific IPs)
5. Get connection string: Click "Connect" > "Connect your application"
6. Copy the connection string (format: `mongodb+srv://user:password@cluster.mongodb.net/property_db?retryWrites=true&w=majority`)
7. Save this as `DATABASE_URL` for backend deployment

### Option B: Local MongoDB

1. Install MongoDB locally: [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/property_db`
4. Save as `DATABASE_URL`

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add MongoDB service
4. Copy connection string from Variables tab

## Step 2: Backend Deployment

### Option A: Render (Recommended)

1. Go to [render.com](https://render.com)
2. Sign up and create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Name**: property-api
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install && npm run prisma:generate`
   - **Start Command**: `cd backend && npm run prisma:deploy && npm start`
   - **Root Directory**: `backend`

5. Add Environment Variables:
   ```
   DATABASE_URL=<your-mongodb-connection-string>
   PORT=4000
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   JWT_SECRET=<generate-random-secret>
   SENDGRID_API_KEY=<your-sendgrid-key>
   SENDGRID_FROM_EMAIL=no-reply@yourdomain.com
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=<secure-password>
   TWILIO_ACCOUNT_SID=<your-twilio-sid>
   TWILIO_AUTH_TOKEN=<your-twilio-token>
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ADMIN_WHATSAPP_TO=whatsapp:+<your-phone-number>
   NODE_ENV=production
   ```

6. Deploy and note the service URL (e.g., `https://property-api.onrender.com`)

### Option B: Fly.io

1. Install Fly CLI: `npm install -g @fly/cli`
2. Login: `fly auth login`
3. Initialize: `cd backend && fly launch`
4. Set secrets:
   ```bash
   fly secrets set DATABASE_URL="<connection-string>"
   fly secrets set JWT_SECRET="<secret>"
   # ... set all other env vars
   ```
5. Deploy: `fly deploy`

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add GitHub repository
4. Add PostgreSQL service (or use external)
5. Set environment variables in Variables tab
6. Deploy automatically

## Step 3: Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Sign up and import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

5. Deploy

## Step 4: Domain Setup

### Purchase Domain

1. Go to [namecheap.com](https://namecheap.com) or [domains.google](https://domains.google)
2. Search and purchase your domain
3. Complete purchase

### Configure in Vercel

1. In Vercel dashboard, go to your project
2. Go to Settings > Domains
3. Add your domain (e.g., `yourdomain.com`)
4. Vercel will provide DNS records to configure

### Configure DNS

1. Go to your domain registrar's DNS settings
2. Add the nameservers provided by Vercel:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

3. Wait for DNS propagation (can take up to 48 hours, usually < 1 hour)

### SSL Certificate

Vercel automatically provisions SSL certificates. No action needed.

## Step 5: Backend Subdomain (Optional)

If you want `api.yourdomain.com` for your backend:

1. In your backend hosting platform (Render/Fly), add custom domain
2. Add CNAME record in DNS:
   - **Type**: CNAME
   - **Name**: api
   - **Value**: Your backend hostname (e.g., `property-api.onrender.com`)

3. Update `FRONTEND_URL` in backend env to include the new API URL

## Step 6: SendGrid Setup

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for free account (100 emails/day free)
3. Go to Settings > API Keys
4. Create API key with "Mail Send" permissions
5. Copy the API key
6. Go to Settings > Sender Authentication
7. Verify a sender email address
8. Use verified email in `SENDGRID_FROM_EMAIL`

## Step 7: Twilio WhatsApp Setup

1. Go to [twilio.com](https://twilio.com)
2. Sign up for account
3. Go to Console > Messaging > Try it out > Send a WhatsApp message
4. Follow instructions to join Twilio WhatsApp sandbox
5. Get your Account SID and Auth Token from Console
6. Use sandbox number format: `whatsapp:+14155238886`
7. For production, upgrade to WhatsApp Business API

## Step 8: Final Configuration

1. Update frontend `VITE_API_URL` to point to your deployed backend
2. Redeploy frontend if needed
3. Test the application:
   - Sign up a new user
   - Submit a property
   - Check admin email/WhatsApp for notifications
   - Login as admin and approve/reject properties

## Step 9: Seed Admin User

After deployment, run the seed script:

```bash
# On your local machine or via SSH
cd backend
npm run seed
```

Or set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in environment variables and the seed script will use them.

## Monitoring & Uptime

### Vercel
- Automatic uptime monitoring
- View logs in Vercel dashboard

### Render
- Free tier includes basic monitoring
- View logs in Render dashboard

### Uptime Monitoring (Optional)
- Use [UptimeRobot](https://uptimerobot.com) (free)
- Add monitor for your frontend and backend URLs
- Set up email alerts

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- For MongoDB Atlas, check IP whitelist (Network Access)
- Ensure database user has proper permissions
- Check connection string format (MongoDB Atlas uses `mongodb+srv://`)

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your actual frontend domain
- Check CORS configuration in `backend/src/index.js`

### Notification Issues
- Verify SendGrid API key is correct
- Check sender email is verified in SendGrid
- For Twilio, ensure you're using correct WhatsApp format
- Check notification logs in admin dashboard

### Build Failures
- Ensure all environment variables are set
- Check build logs for specific errors
- Verify Node.js version compatibility

## Cost Estimation

### Free Tier (Suitable for MVP)
- **Vercel**: Free (hobby plan)
- **MongoDB Atlas**: Free tier (512MB storage, sufficient for small apps)
- **Render**: Free tier (with limitations)
- **SendGrid**: Free (100 emails/day)
- **Twilio**: Pay-as-you-go (WhatsApp sandbox is free for testing)
- **Domain**: ~$10-15/year

### Production Tier (Recommended)
- **Vercel Pro**: $20/month
- **MongoDB Atlas**: Free tier or $9/month (M0 cluster)
- **Render**: $7/month (or free with limitations)
- **SendGrid**: Free tier or paid plans
- **Twilio**: Pay-per-message
- **Total**: ~$40-80/month

## Security Checklist

- [ ] Use strong `JWT_SECRET` (random string, 32+ characters)
- [ ] Use strong admin password
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Keep dependencies updated
- [ ] Use environment variables for all secrets
- [ ] Enable database connection pooling
- [ ] Set up rate limiting (already included)
- [ ] Regular backups of database

## Support

For issues, check:
1. Application logs in hosting dashboard
2. Database connection status
3. Environment variables configuration
4. API endpoint responses
