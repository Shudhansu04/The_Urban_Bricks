# Inquiry Notifications Setup

## What's New

When someone makes an inquiry about a property, notifications are sent to:

1. **Admin Only** - Email + WhatsApp (property owner is NOT notified)

## Notification Details

### Admin Receives:
- Property details
- Owner information
- Buyer information
- Buyer's message
- Inquiry date

## Requirements

### For Admin Notifications:
- **Email (Nodemailer/SMTP):**
  - `SMTP_HOST` - SMTP server host (e.g., smtp.gmail.com)
  - `SMTP_PORT` - SMTP port (usually 587)
  - `SMTP_USER` - SMTP username/email
  - `SMTP_PASSWORD` - SMTP password/app password
  - `EMAIL_FROM` - Sender email address
  - `ADMIN_EMAIL` - Admin email address (where notifications are sent)
- **WhatsApp (Twilio):**
  - `TWILIO_ACCOUNT_SID` - Twilio Account SID
  - `TWILIO_AUTH_TOKEN` - Twilio Auth Token
  - `TWILIO_WHATSAPP_FROM` - Twilio WhatsApp number (e.g., whatsapp:+14155238886)
  - `ADMIN_WHATSAPP_TO` - Admin WhatsApp number (e.g., whatsapp:+919876543210)

## Testing

1. **Create a property** (as a seller)
2. **Make an inquiry** (as a buyer) on that property
3. **Check notifications:**
   - Admin should receive email/WhatsApp
   - Property owner will NOT receive notifications
   - Check server logs for detailed notification status

## Troubleshooting

### Admin Not Receiving Notifications

1. **Check admin email/WhatsApp:**
   - Verify `ADMIN_EMAIL` is set correctly
   - Verify `ADMIN_WHATSAPP_TO` is set correctly
   - Format: `whatsapp:+1234567890`

2. **Check configuration:**
   - All required env variables must be set
   - Check server logs for configuration status

### Check Notification Logs

View notification attempts:
```
GET /api/admin/notifications
```

This shows:
- Which notifications were sent
- Which failed
- Error messages
- Timestamps

## Server Logs

When an inquiry is created, you should see:

```
[notification] Triggering admin notifications for inquiry: clx123...
[notification] Attempting to send inquiry email to admin
[notification] ✅ Inquiry email sent to admin
[notification] ✅ Inquiry WhatsApp sent to admin
```

**Note:** Property owner will NOT receive any notifications. Only admin is notified.

If you see errors, check:
- Missing environment variables (SMTP for email, Twilio for WhatsApp)
- SMTP/Twilio API errors
- Invalid email/phone formats
