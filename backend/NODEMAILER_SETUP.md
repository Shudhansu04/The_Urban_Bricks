# Nodemailer Email Setup

## Overview

The application now uses **Nodemailer** instead of SendGrid for sending emails. Nodemailer works with any SMTP server (Gmail, Outlook, custom SMTP, etc.).

## Environment Variables

Add these to your `backend/.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Admin Email (where notifications are sent)
ADMIN_EMAIL=admin@example.com
```

## Common SMTP Providers

### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # See below for App Password
EMAIL_FROM=your-email@gmail.com
```


**Important for Gmail:**
1. Enable 2-Step Verification on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (16 characters) as `SMTP_PASSWORD`

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
```

### Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@yahoo.com
```

### Custom SMTP Server

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false  # Use true for port 465
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-password
EMAIL_FROM=your-email@yourdomain.com
```

## SMTP Ports

- **Port 587**: TLS/STARTTLS (recommended) - Set `SMTP_SECURE=false`
- **Port 465**: SSL/TLS - Set `SMTP_SECURE=true`
- **Port 25**: Usually blocked by ISPs, not recommended

## Testing

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure `.env`** with your SMTP settings

3. **Test email sending:**
   - Submit a property listing
   - Register a new user
   - Make an inquiry
   - Check server logs for email status

4. **Check server logs:**
   ```
   [notification] Nodemailer transporter initialized
   [notification] Sending email to: admin@example.com from: your-email@gmail.com
   [notification] Email sent: <message-id>
   [notification] ✅ Email sent successfully
   ```

## Troubleshooting

### "Email transporter not configured"
- Check all SMTP variables are set in `.env`
- Restart server after adding variables

### "Authentication failed"
- **Gmail**: Make sure you're using an App Password, not your regular password
- **Other providers**: Verify username and password are correct
- Check if 2FA is enabled and use App Password

### "Connection timeout"
- Check firewall/network settings
- Verify SMTP host and port are correct
- Try different port (587 vs 465)

### "Email sent but not received"
- Check spam/junk folder
- Verify `EMAIL_FROM` matches your SMTP account
- Check SMTP provider's sending limits
- Review server logs for error messages

### Gmail Specific Issues

1. **"Less secure app access"** - Gmail no longer supports this. Use App Passwords instead.
2. **"Application-specific password required"** - Generate App Password from Google Account settings
3. **Rate limits** - Gmail has daily sending limits (500 emails/day for free accounts)

## Production Recommendations

For production, consider:
- **Dedicated SMTP service**: SendGrid, Mailgun, Amazon SES, etc.
- **Email service with higher limits**: Avoid Gmail for high-volume sending
- **SPF/DKIM records**: Configure for your domain to improve deliverability
- **Monitoring**: Track email delivery rates and failures

## Example: Using SendGrid with Nodemailer

You can still use SendGrid, but through Nodemailer:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

## Migration from SendGrid

If you were using SendGrid before:
1. Remove `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` from `.env`
2. Add SMTP configuration variables (see above)
3. Restart server
4. Test email sending

All email functionality remains the same - only the underlying service changed!
