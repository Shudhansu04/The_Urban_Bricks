# How to Check Why Notifications Aren't Working

## Quick Diagnostic Steps

### 1. Check Server Console Logs

When you submit a property, look for these messages in your server console:

**If configured correctly:**
```
[notification] Triggering notifications for property: clx123...
[notification] Email sent to admin
[notification] WhatsApp sent to admin
[notification] All notifications processed for property: clx123...
```

**If NOT configured:**
```
[notification] Triggering notifications for property: clx123...
[notification] SendGrid not configured - API Key: false Admin Email: false
[notification] Twilio WhatsApp not configured - Client: false Admin WhatsApp: false
```

### 2. Check Notification Configuration

Visit this endpoint (as admin):
```
GET http://localhost:4000/api/admin/test-config
```

This will show you:
- ✅ Which credentials are set
- ❌ Which credentials are missing
- Status of email/WhatsApp readiness

### 3. Check Your .env File

Open `backend/.env` and verify:

```env
# Email Configuration
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"  # Should start with "SG."
SENDGRID_FROM_EMAIL="no-reply@yourdomain.com"  # Must be verified in SendGrid
ADMIN_EMAIL="your-email@example.com"  # Where you want to receive notifications

# WhatsApp Configuration  
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxx"  # Should start with "AC"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"  # Twilio sandbox number
ADMIN_WHATSAPP_TO="whatsapp:+1234567890"  # Your WhatsApp number with country code
```

### 4. Common Problems

#### Problem: Variables are set but still not working
**Solution:** Restart the server after adding/changing .env variables
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

#### Problem: "SendGrid not configured" but API key is set
**Check:**
- Is the API key correct? (should start with "SG.")
- Is ADMIN_EMAIL set?
- Is SENDGRID_FROM_EMAIL verified in SendGrid dashboard?

#### Problem: "Twilio not configured" but credentials are set
**Check:**
- Are phone numbers in correct format? `whatsapp:+1234567890`
- Did you join the Twilio WhatsApp sandbox?
- Are credentials correct? (check Twilio console)

### 5. Test Manually

After fixing configuration, test by:
1. Submitting a new property
2. Check server logs for notification messages
3. Check your email inbox (and spam folder)
4. Check WhatsApp

### 6. View Notification Logs

Check what the system tried to send:
```
GET http://localhost:4000/api/admin/notifications
```

This shows all notification attempts, successes, and failures.

## Still Not Working?

1. **Share server console output** - The logs will show exactly what's wrong
2. **Check notification logs** - See what was attempted
3. **Verify credentials separately** - Test SendGrid/Twilio in their dashboards
4. **Check spam folder** - Emails might be filtered
