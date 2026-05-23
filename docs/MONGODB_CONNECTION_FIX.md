# MongoDB Connection Fix - Complete Setup Guide

## Problem Summary
The application was trying to connect to `localhost:27017` which wasn't available. The solution is to use **MongoDB Atlas** (cloud-hosted MongoDB) which is easier to set up and more reliable.

---

## What Was Fixed

### 1. ✅ Fixed `.env` Configuration
- Changed key from `MONGODB_URL` → `MONGODB_URI` (to match config.py)
- Removed hardcoded credentials
- Added placeholder MongoDB Atlas connection string

### 2. ✅ Enhanced Error Handling in `app.py`
- Added try-catch block for MongoDB connection
- Displays helpful error messages
- Tracks connection status in `app.mongo_connected`
- Masks credentials when logging

### 3. ✅ Improved Health Endpoint
- Now shows database connection status (🟢 Connected / 🔴 Disconnected)
- Returns 503 Service Unavailable if DB is down
- Includes error details when disconnected

### 4. ✅ Added Database Helpers
- `utils/db_helpers.py`: Decorators for database connection checking
- `@require_db_connection`: Ensures DB is connected before executing endpoint
- `@handle_db_errors`: Catches MongoDB-specific errors

### 5. ✅ Comprehensive Documentation
- `docs/MONGODB_SETUP.md`: Complete MongoDB Atlas setup guide

---

## Quick Start: 3 Steps

### Step 1: Get MongoDB Atlas Connection String
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (free tier available)
3. Create a cluster
4. Create a database user
5. Get your connection string

### Step 2: Update `.env` File
```bash
# Open .env and replace the MONGODB_URI:
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/resume_screening?retryWrites=true&w=majority
```

Replace:
- `your_username` with your database user
- `your_password` with your database password
- `cluster0.xxxxx` with your actual cluster name

### Step 3: Start the Backend
```bash
cd backend
python app.py
```

You should see:
```
[DB] Attempting to connect to MongoDB...
[DB] ✅ MongoDB connection established successfully.
```

---

## Testing Connection

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected Response (Connected):**
```json
{
  "status": "ok",
  "message": "AI Resume Screening API is running",
  "database": "🟢 Connected"
}
```

**Response if Not Connected:**
```json
{
  "status": "degraded",
  "message": "AI Resume Screening API is running",
  "database": "🔴 Disconnected",
  "db_error": "ServerSelectionTimeoutError: localhost:27017 refused to connect"
}
```

### Test 2: Test with Data
```bash
curl -X POST http://localhost:5000/api/resume/analyze-text \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "role": "Backend Developer",
    "resume_text": "Experienced in Python, Flask, MongoDB, Docker",
    "job_description": "Looking for Backend Developer skilled in Python and MongoDB"
  }'
```

---

## Troubleshooting

### Error: "ServerSelectionTimeoutError: localhost:27017 refused to connect"
**Cause:** Application is still trying to connect to local MongoDB

**Fix:**
1. Verify `.env` has correct `MONGODB_URI`
2. Check that MONGODB_URI starts with `mongodb+srv://`
3. Restart the backend

### Error: "AuthenticationFailed"
**Cause:** Wrong username or password

**Fix:**
1. Double-check credentials in MongoDB Atlas
2. Reset password if needed
3. URL-encode special characters in password

### Error: "Invalid ConnectionString"
**Cause:** Incorrect connection string format

**Fix:**
1. Copy connection string again from MongoDB Atlas
2. Ensure format: `mongodb+srv://user:pass@cluster/database?params`

### Backend starts but `/api/resume/analyze-text` returns 503
**Cause:** Database connection failed despite successful startup

**Fix:**
1. Check MongoDB Atlas cluster is running
2. Check IP whitelist includes your IP
3. Review logs for specific error

---

## Environment Files

### `.env` (Your actual credentials - DO NOT COMMIT)
```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/resume_screening?retryWrites=true&w=majority
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SECRET_KEY=your_super_secret_key
```

### `.env.example` (Template - Safe to commit)
```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/resume_screening?retryWrites=true&w=majority
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SECRET_KEY=your_super_secret_key
```

---

## Production Checklist

Before deploying to production:

- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Use strong database password (15+ chars)
- [ ] Restrict IP whitelist to production servers only
- [ ] Enable encryption at rest
- [ ] Enable automated backups
- [ ] Use separate database user for application
- [ ] Set `FLASK_ENV=production`
- [ ] Set `FLASK_DEBUG=False`
- [ ] Monitor database metrics and alerts
- [ ] Have a disaster recovery plan

---

## Key Files Changed

1. **`.env`** - Updated MONGODB_URI with placeholders
2. **`.env.example`** - Comprehensive documentation with options
3. **`backend/app.py`** - Added error handling, connection verification
4. **`backend/config.py`** - No changes needed (already correct)
5. **`backend/routes/resume.py`** - Added `@require_db_connection` decorator
6. **`backend/utils/db_helpers.py`** - NEW: Database helpers and decorators
7. **`docs/MONGODB_SETUP.md`** - NEW: Comprehensive MongoDB setup guide

---

## Alternative: Use Local MongoDB

If you prefer local MongoDB for development:

### macOS
```bash
brew install mongodb-community
brew services start mongodb-community
```

### Windows
Download and install from [mongodb.com](https://www.mongodb.com/try/download/community)

### Update `.env`
```env
MONGODB_URI=mongodb://localhost:27017/resume_screening
```

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` to git (already in `.gitignore`)
- Never hardcode credentials in code
- Always use strong passwords
- Rotate credentials periodically
- Use role-based access control

✅ **Best Practices:**
- Store credentials in environment variables
- Use `.env.example` as template
- Enable audit logging in MongoDB Atlas
- Monitor database for suspicious activity
- Keep database updated

---

## Next Steps

1. ✅ Get MongoDB Atlas URI
2. ✅ Update `.env` with credentials
3. ✅ Start backend
4. ✅ Test with health endpoint
5. ✅ Test data operations
6. ✅ Deploy to production when ready

---

**For detailed MongoDB setup instructions, see:** `docs/MONGODB_SETUP.md`

**Need help?** Check the application logs for specific error messages.
