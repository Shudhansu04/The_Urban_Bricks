# WhatsApp Notification Troubleshooting

## Quick Check

1. **Check server logs** when a notification should be sent
2. **Test WhatsApp** using: `POST /api/admin/test-whatsapp` (as admin)
3. **Check configuration**: `GET /api/admin/test-config` (as admin)

## Common Issues

### 1. "Twilio client not initialized"

**Problem:** Missing Twilio credentials

**Solution:**
- Check `.env` file has:
  ```env
  TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxx"
  TWILIO_AUTH_TOKEN="your_auth_token"
  ```
- Restart server after adding credentials
- Verify credentials in Twilio Console: https://console.twilio.com

### 2. "ADMIN_WHATSAPP_TO is not set"

**Problem:** Missing admin WhatsApp number

**Solution:**
- Add to `.env`:
  ```env
  ADMIN_WHATSAPP_TO="whatsapp:+919876543210"
  ```
- Format: `whatsapp:+[country code][number]`
- Example: `whatsapp:+919876543210` (India)
- Example: `whatsapp:+1234567890` (USA)

### 3. "TWILIO_WHATSAPP_FROM is not set"

**Problem:** Missing Twilio WhatsApp sender number

**Solution:**
- Add to `.env`:
  ```env
  TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
  ```
- For sandbox: Use `whatsapp:+14155238886` (Twilio sandbox number)
- For production: Use your approved Twilio WhatsApp number

### 4. "Error 21211: Invalid 'To' Phone Number"

**Problem:** Phone number format is incorrect

**Solution:**
- Use format: `whatsapp:+[country code][number]`
- Include country code (e.g., +91 for India, +1 for USA)
- Remove spaces, dashes, parentheses
- Example: `+919876543210` ✅ (not `+91 98765 43210` ❌)

### 5. "Error 21608: The number is not a valid WhatsApp-enabled number"

**Problem:** Number not joined to Twilio WhatsApp sandbox

**Solution:**
1. **Join Twilio Sandbox:**
   - Send `join [your-sandbox-code]` to `+1 415 523 8886` from your WhatsApp
   - Find your sandbox code in Twilio Console → Messaging → Try it out → Send a WhatsApp message

2. **Or use production WhatsApp:**
   - Request WhatsApp Business API access from Twilio
   - Get approved WhatsApp number

### 6. "Error 21614: Unsubscribed recipient"

**Problem:** User unsubscribed or didn't join sandbox

**Solution:**
- Rejoin Twilio sandbox by sending `join [code]` to Twilio number
- Or use a different number that's in the sandbox

### 7. Messages sent but not received

**Possible causes:**
- **Not in sandbox:** Join Twilio WhatsApp sandbox first
- **Wrong number format:** Check format matches `whatsapp:+[country][number]`
- **Twilio account limits:** Check Twilio console for account status
- **Rate limits:** Twilio has rate limits, check console

## Testing

### Test Endpoint

As admin, send POST request to:
```
POST /api/admin/test-whatsapp
```

**Response (success):**
```json
{
  "success": true,
  "message": "Test WhatsApp message sent",
  "details": {
    "messageSid": "SM...",
    "status": "queued",
    "from": "whatsapp:+14155238886",
    "to": "whatsapp:+919876543210"
  }
}
```

**Response (error):**
```json
{
  "error": "Failed to send test WhatsApp",
  "details": {
    "message": "Error message",
    "code": 21211,
    "status": 400
  }
}
```

### Check Configuration

```
GET /api/admin/test-config
```

Shows what's configured and what's missing.

## Twilio WhatsApp Setup

### Step 1: Get Twilio Account

1. Sign up: https://www.twilio.com/try-twilio
2. Get Account SID and Auth Token from console

### Step 2: Join Sandbox (For Testing)

1. Go to: Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Note your sandbox code (e.g., `join abc-xyz`)
3. Send `join abc-xyz` to `+1 415 523 8886` from your WhatsApp
4. You'll receive confirmation message

### Step 3: Configure Environment

```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
ADMIN_WHATSAPP_TO="whatsapp:+919876543210"
```

### Step 4: Test

1. Restart server
2. Use test endpoint: `POST /api/admin/test-whatsapp`
3. Check your WhatsApp for test message

## Production Setup

For production, you need:

1. **WhatsApp Business API Access:**
   - Request from Twilio
   - Approval can take time

2. **Approved WhatsApp Number:**
   - Get from Twilio after approval
   - Use this instead of sandbox number

3. **Update Environment:**
   ```env
   TWILIO_WHATSAPP_FROM="whatsapp:+[your-approved-number]"
   ```

## Debugging Steps

1. **Check server logs:**
   ```
   [notification] ===== WhatsApp Notification Debug =====
   [notification] Twilio Client initialized: true/false
   [notification] TWILIO_ACCOUNT_SID: AC...
   [notification] TWILIO_WHATSAPP_FROM: whatsapp:+...
   [notification] ADMIN_WHATSAPP_TO: whatsapp:+...
   ```

2. **Check notification logs:**
   ```
   GET /api/admin/notifications
   ```
   Look for WhatsApp entries and their status

3. **Test directly:**
   ```
   POST /api/admin/test-whatsapp
   ```

4. **Check Twilio Console:**
   - Go to: https://console.twilio.com
   - Check Messages → Logs
   - See error details and status

## Phone Number Format

**Correct:**
- `whatsapp:+919876543210` ✅
- `whatsapp:+1234567890` ✅

**Incorrect:**
- `+919876543210` ❌ (missing `whatsapp:` prefix)
- `whatsapp:919876543210` ❌ (missing `+` before country code)
- `whatsapp:+91 98765 43210` ❌ (spaces not allowed)
- `whatsapp:9876543210` ❌ (missing country code)

## Still Not Working?

1. **Share server logs** when notification is triggered
2. **Share response** from `/api/admin/test-whatsapp`
3. **Check Twilio Console** for error messages
4. **Verify** you joined the sandbox (for testing)
