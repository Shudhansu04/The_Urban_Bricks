# Debug Notifications - Step by Step

## Step 1: Check Server Logs

When you submit a property, you should see detailed logs like:

```
[notification] Triggering notifications for property: clx123...
[notification] Attempting to send email notification
[notification] Config check - API Key exists: true Admin Email: admin@example.com
[notification] Sending email to: admin@example.com from: no-reply@example.com
[notification] ✅ Email sent successfully to admin@example.com
```

**If you see:**
- `API Key exists: false` → Your `SENDGRID_API_KEY` is not set in `.env`
- `Admin Email: undefined` → Your `ADMIN_EMAIL` is not set in `.env`
- `SendGrid not configured` → Missing required email credentials

## Step 2: Test Notification Endpoint

Use this endpoint to test notifications without creating actual data:

```bash
# Test property notification
curl -X POST http://localhost:4000/api/test/test-notification \
  -H "Content-Type: application/json" \
  -d '{"type": "property"}'

# Test user notification  
curl -X POST http://localhost:4000/api/test/test-notification \
  -H "Content-Type: application/json" \
  -d '{"type": "user"}'
```

Or use Postman/Thunder Client:
- Method: POST
- URL: `http://localhost:4000/api/test/test-notification`
- Body (JSON): `{"type": "property"}` or `{"type": "user"}`

## Step 3: Check Configuration

Visit: `http://localhost:4000/api/admin/test-config` (as admin)

This shows exactly what's configured and what's missing.

## Step 4: Verify .env File

Make sure your `backend/.env` file has REAL values (not placeholders):

```env
# ❌ WRONG (won't work):
SENDGRID_API_KEY="your_sendgrid_key"
ADMIN_EMAIL="admin@example.com"

# ✅ CORRECT (will work):
SENDGRID_API_KEY="SG.abc123def456ghi789jkl012mno345pqr678"
ADMIN_EMAIL="your-real-email@gmail.com"
ADMIN_WHATSAPP_TO="whatsapp:+919876543210"
```

## Step 5: Common Issues & Solutions

### Issue: "API Key exists: false"
**Solution:** 
- Check `.env` file has `SENDGRID_API_KEY=SG.xxxxx`
- Make sure there are no quotes around the value (or use quotes correctly)
- Restart server after adding

### Issue: "Admin Email: undefined"
**Solution:**
- Add `ADMIN_EMAIL="your-email@example.com"` to `.env`
- Restart server

### Issue: Email sent but not received
**Solutions:**
1. Check spam/junk folder
2. Verify sender email is verified in SendGrid
3. Check SendGrid activity logs (dashboard)
4. Make sure `SENDGRID_FROM_EMAIL` is verified

### Issue: WhatsApp not working
**Solutions:**
1. Check phone format: `whatsapp:+1234567890` (with country code)
2. Make sure you joined Twilio WhatsApp sandbox
3. Verify Twilio credentials in Twilio console
4. Check Twilio console for error logs

## Step 6: Check Notification Logs

View what was attempted:
```
GET http://localhost:4000/api/admin/notifications
```

This shows:
- Which notifications were sent
- Which failed
- Error messages
- Timestamps

## Quick Diagnostic Commands

```bash
# Check if server is running
curl http://localhost:4000/health

# Test notification (no auth needed)
curl -X POST http://localhost:4000/api/test/test-notification \
  -H "Content-Type: application/json" \
  -d '{"type": "property"}'

# Check config (need admin auth)
curl http://localhost:4000/api/admin/test-config \
  -H "Cookie: token=your-admin-token"
```

## What to Share for Help

If still not working, share:
1. Server console output when submitting property
2. Response from `/api/admin/test-config`
3. Notification logs from `/api/admin/notifications`
4. Your `.env` file structure (without actual secrets)
