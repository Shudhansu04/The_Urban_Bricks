# How to Access Admin Dashboard

## Problem: "Unable to access admin dashboard"

This usually means your user account doesn't have the `ADMIN` role. Here's how to fix it:

## Solution 1: Create Admin User (Recommended for First Time)

Run the seed script to create a default admin user:

```bash
cd backend
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@example.com` (or the value in `ADMIN_EMAIL` env variable)
- Password: `admin123` (or the value in `ADMIN_PASSWORD` env variable)

**To customize**, add to your `backend/.env`:
```env
ADMIN_EMAIL="your-admin@email.com"
ADMIN_PASSWORD="your-secure-password"
```

Then run `npm run seed` again.

## Solution 2: Promote Existing User to Admin

If you already have a user account and want to make it admin:

```bash
cd backend
npm run make-admin your-email@example.com
```

Replace `your-email@example.com` with the email you used to register.

**Example:**
```bash
npm run make-admin john@example.com
```

You should see:
```
✅ Successfully promoted "john@example.com" to ADMIN role.
```

## Solution 3: Check Your Current Role

1. Login to the website
2. Check the browser console (F12) → Network tab
3. Look for the `/api/auth/me` request
4. Check the response - it should show `"role": "ADMIN"`

If it shows `"role": "USER"`, you need to promote your account using Solution 2.

## After Making Yourself Admin

1. **Logout** from the website (if you're logged in)
2. **Login again** with the same credentials
3. You should now see the **"Admin"** link in the navbar
4. Click it to access `/admin` dashboard

## Troubleshooting

### Still can't access after promoting?

1. **Clear browser cookies** - The old token might be cached
2. **Logout and login again** - This refreshes your session
3. **Check server logs** - Look for authentication errors
4. **Verify in database** - Check if the user role was actually updated

### Check if user is admin in database:

You can verify by checking the MongoDB database directly, or by looking at the server response when you login.

### Error: "Forbidden" or "403"

This means:
- Your user doesn't have ADMIN role
- Your session token is outdated (logout/login again)
- The backend middleware is blocking access

### Error: "Unauthorized" or "401"

This means:
- You're not logged in
- Your session expired
- Login again

## Quick Test

After promoting yourself to admin:

1. Open browser console (F12)
2. Run: `fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()).then(console.log)`
3. Check if `user.role === "ADMIN"`

If yes, logout and login again. The admin link should appear!
