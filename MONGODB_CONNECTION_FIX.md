# MongoDB Connection String Fix

## Error
```
The provided database string is invalid. Database must be defined in the connection string.
```

## Solution

Your MongoDB Atlas connection string must include the database name.

### ❌ Wrong Format
```
mongodb+srv://username:password@cluster0.flf0qlk.mongodb.net?retryWrites=true&w=majority
```

### ✅ Correct Format
```
mongodb+srv://username:password@cluster0.flf0qlk.mongodb.net/property_db?retryWrites=true&w=majority
```

Notice the `/property_db` part - that's the database name!

## Steps to Fix

1. **Open your `.env` file** in the `backend` folder

2. **Update your `DATABASE_URL`** to include the database name:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster0.flf0qlk.mongodb.net/property_db?retryWrites=true&w=majority"
   ```
   
   Replace:
   - `username` with your MongoDB Atlas username
   - `password` with your MongoDB Atlas password
   - `property_db` with your desired database name (can be anything, e.g., `property_marketplace`)

3. **Save the file**

4. **Run the command again**:
   ```bash
   npm run prisma:migrate
   ```

## Example Connection Strings

### MongoDB Atlas (Cloud)
```
mongodb+srv://myuser:mypassword@cluster0.flf0qlk.mongodb.net/property_db?retryWrites=true&w=majority
```

### Local MongoDB
```
mongodb://localhost:27017/property_db
```

## Important Notes

- The database name (`property_db`) will be created automatically if it doesn't exist
- Make sure your MongoDB Atlas IP whitelist includes your current IP (or `0.0.0.0/0` for all IPs)
- Ensure your MongoDB user has read/write permissions
