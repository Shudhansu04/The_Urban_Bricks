# Troubleshooting Notifications

## Issue: Not Receiving Email/WhatsApp Notifications

### Step 1: Check Server Logs

When you register a property or user, check the server console for messages like:
- `[notification] SendGrid not configured`
- `[notification] Twilio WhatsApp not configured`
- `[notification] Email sent to admin` ✅
- `[notification] WhatsApp sent to admin` ✅

### Step 2: Verify Environment Variables

Check your `backend/.env` file has these variables set:

```env
# Required for Email
SENDGRID_API_KEY="your_actual_api_key_here"
SENDGRID_FROM_EMAIL="your-verified-email@domain.com"
ADMIN_EMAIL="admin@yourdomain.com"

# Required for WhatsApp
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
ADMIN_WHATSAPP_TO="whatsapp:+1234567890"
```

### Step 3: Common Issues

#### Issue: "SendGrid not configured" warning
**Solution:**
1. Make sure `SENDGRID_API_KEY` is set (not empty, not "your_sendgrid_key")
2. Make sure `ADMIN_EMAIL` is set to your actual email
3. Make sure `SENDGRID_FROM_EMAIL` is a verified email in SendGrid

#### Issue: "Twilio WhatsApp not configured" warning
**Solution:**
1. Make sure all Twilio variables are set
2. Check phone number format: `whatsapp:+1234567890` (include country code, no spaces)
3. Make sure you've joined the Twilio WhatsApp sandbox

#### Issue: No warnings but no notifications received
**Possible causes:**
1. **SendGrid**: Check spam folder, verify sender email is verified
2. **Twilio**: Check you've joined the sandbox, verify phone number format
3. **Check notification logs**: Visit `/api/admin/notifications` endpoint

### Step 4: Test Notification Configuration

Add this test endpoint to check your configuration:

```javascript
// Add to backend/src/routes/admin.js or create test route
router.get("/test-notifications", async (req, res) => {
  const config = {
    sendgrid: {
      apiKey: !!env.sendgridApiKey,
      fromEmail: env.sendgridFrom,
      adminEmail: env.adminEmail,
    },
    twilio: {
      accountSid: !!env.twilioSid,
      authToken: !!env.twilioToken,
      whatsappFrom: env.twilioWhatsappFrom,
      adminWhatsappTo: env.adminWhatsappTo,
    },
  };
  res.json({ config });
});
```

### Step 5: Check Notification Logs

View notification logs in admin dashboard or via API:
```
GET /api/admin/notifications
```

This shows:
- Which notifications were sent
- Which failed
- Error messages
- Timestamps

### Step 6: Manual Test

You can manually trigger a test notification by creating a test property or user, then check:
1. Server console for error messages
2. Notification logs in database
3. SendGrid activity dashboard
4. Twilio console logs

## Quick Checklist

- [ ] `.env` file exists in `backend/` folder
- [ ] All environment variables are set (not empty, not placeholder values)
- [ ] SendGrid API key is valid
- [ ] SendGrid sender email is verified
- [ ] Twilio credentials are correct
- [ ] WhatsApp phone numbers are in correct format: `whatsapp:+1234567890`
- [ ] You've joined Twilio WhatsApp sandbox
- [ ] Server has been restarted after adding env variables
- [ ] Check server logs for error messages

## Still Not Working?

1. **Check server console** - Look for specific error messages
2. **Verify credentials** - Test SendGrid/Twilio credentials separately
3. **Check notification logs** - See what the system tried to send
4. **Test with curl** - Manually test SendGrid/Twilio APIs
