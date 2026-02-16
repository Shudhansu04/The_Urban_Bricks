# Notification Setup Guide

## Overview
The system now sends notifications to admin when:
1. **New User Registers** - Email + WhatsApp
2. **New Property is Submitted** - Email + WhatsApp

## Required Environment Variables

Add these to your `.env` file in the `backend` folder:

### Email Notifications (SendGrid)
```env
SENDGRID_API_KEY="your_sendgrid_api_key_here"
SENDGRID_FROM_EMAIL="no-reply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"
```

### WhatsApp Notifications (Twilio)
```env
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
ADMIN_WHATSAPP_TO="whatsapp:+1234567890"
```

## Setup Instructions

### 1. SendGrid Setup (Email)

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free)
3. Go to **Settings > API Keys**
4. Click **Create API Key**
5. Name it (e.g., "Property Marketplace")
6. Select **Full Access** or **Restricted Access** with "Mail Send" permission
7. Copy the API key and add to `.env` as `SENDGRID_API_KEY`

8. Go to **Settings > Sender Authentication**
9. Verify a sender email address (this will be your `SENDGRID_FROM_EMAIL`)
10. Add the verified email to `.env` as `SENDGRID_FROM_EMAIL`

11. Add your admin email to `.env` as `ADMIN_EMAIL`

### 2. Twilio Setup (WhatsApp)

1. Go to [twilio.com](https://twilio.com)
2. Sign up for a free account
3. Go to **Console > Messaging > Try it out > Send a WhatsApp message**
4. Follow instructions to join Twilio WhatsApp sandbox
5. Get your **Account SID** and **Auth Token** from the Console dashboard
6. Add to `.env`:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM` (sandbox number: `whatsapp:+14155238886`)
   - `ADMIN_WHATSAPP_TO` (your WhatsApp number in format: `whatsapp:+1234567890`)

7. **Join the Sandbox**: Send the join code to the Twilio WhatsApp number to activate

### 3. Test Notifications

After setting up, test by:

1. **Register a new user** on the frontend
2. **Submit a new property** listing
3. Check your email and WhatsApp for notifications

## Notification Content

### New User Registration
- **Email**: User name, email, phone, role, registration time
- **WhatsApp**: User name, email, phone, role

### New Property Submission
- **Email**: Property title, price, location, owner details, description
- **WhatsApp**: Property title, price, location, owner name

## Troubleshooting

### Not Receiving Emails
- Check SendGrid API key is correct
- Verify sender email is verified in SendGrid
- Check spam folder
- Check SendGrid activity logs

### Not Receiving WhatsApp Messages
- Ensure you've joined the Twilio sandbox
- Check phone number format: `whatsapp:+1234567890` (include country code)
- Verify Twilio credentials are correct
- Check Twilio console for error logs

### Notifications Not Sending
- Check server logs for error messages
- Verify all environment variables are set
- Check notification logs in admin dashboard (`/api/admin/notifications`)

## Production Notes

- For production, upgrade Twilio to WhatsApp Business API (paid)
- SendGrid free tier: 100 emails/day (upgrade for more)
- Consider rate limiting notifications to avoid spam
- Monitor notification logs for delivery issues
