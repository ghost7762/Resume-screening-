# MongoDB Setup Guide for AI Resume Screening System

## Overview
This project uses **MongoDB** as the primary database. You can choose between:
- **MongoDB Atlas** (Cloud - Recommended for Production)
- **Local MongoDB** (Development)

---

## Option 1: MongoDB Atlas (Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Create an account" (or sign in if you have one)
3. Complete the verification email

### Step 2: Create a Project and Cluster
1. On the dashboard, click "Create a project"
2. Enter project name: `resume-screening`
3. Click "Create Project"
4. Click "Create a Cluster"
5. Choose the **Free Tier** option
6. Select your region (e.g., `US-East-1`)
7. Click "Create Cluster" (takes 2-3 minutes)

### Step 3: Create Database User
1. Go to **Database Access** → **Add a Database User**
2. Create username: `resume_user` (or your preference)
3. Generate a strong password (click "Generate")
   - **Save this password securely!**
4. Under "Built-in Role", select **"Atlas Admin"**
5. Click "Add User"

### Step 4: Whitelist Your IP
1. Go to **Network Access** → **Add IP Address**
2. Click "Add My Current IP Address"
   - OR enter `0.0.0.0/0` to allow all IPs (less secure, only for dev)
3. Click "Confirm"

### Step 5: Get Connection String
1. In the Cluster view, click "Connect"
2. Choose "Drivers"
3. Select "Python" and "3.6 or later"
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update .env File
Replace the MongoDB URI in `.env`:
```env
MONGODB_URI=mongodb+srv://resume_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/resume_screening?retryWrites=true&w=majority
```

**⚠️ Important:**
- Replace `resume_user` with your actual username
- Replace `YOUR_PASSWORD` with your actual password
- Replace `cluster0.xxxxx` with your actual cluster name
- **If your password contains special characters**, URL-encode them:
  - `@` → `%40`
  - `!` → `%21`
  - `#` → `%23`
  - Use [URL Encoder](https://www.urlencoder.org/) tool

### Step 7: Verify Connection
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

## Option 2: Local MongoDB (Development Only)

### Windows Installation
1. Download MongoDB Community Edition from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the prompts
3. MongoDB will be installed as a service

### macOS Installation
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux Installation (Ubuntu)
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Start MongoDB Locally
```bash
# Windows (if installed as service - starts automatically)
# Manual start:
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Update .env for Local Development
```env
MONGODB_URI=mongodb://localhost:27017/resume_screening
```

### Verify Local Connection
```bash
cd backend
python app.py
```

---

## Testing the Connection

### Method 1: Health Endpoint
```bash
curl http://localhost:5000/api/health
```

Expected response if connected:
```json
{
  "status": "ok",
  "message": "AI Resume Screening API is running",
  "database": "🟢 Connected"
}
```

Expected response if NOT connected:
```json
{
  "status": "degraded",
  "message": "AI Resume Screening API is running",
  "database": "🔴 Disconnected",
  "db_error": "..."
}
```

### Method 2: Check Application Logs
```bash
# Look for this in the terminal output:
[DB] ✅ MongoDB connection established successfully.
```

### Method 3: Test Data Operations
```bash
# Upload and analyze a resume
curl -X POST http://localhost:5000/api/resume/analyze-text \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Backend Developer",
    "resume_text": "Python, Flask, MongoDB, Docker",
    "job_description": "Backend Developer - Python, Flask, MongoDB required"
  }'
```

---

## Troubleshooting

### Error: "ServerSelectionTimeoutError"
**Problem:** Cannot connect to MongoDB

**Solutions:**
1. ✅ Check if MongoDB is running
   - MongoDB Atlas: Cluster must be running
   - Local: Run `mongod` in a terminal
2. ✅ Verify MONGODB_URI is correct
   - Check username and password
   - Check cluster name
   - Ensure database exists
3. ✅ Check IP whitelist (Atlas only)
   - Go to Network Access
   - Add your current IP address
4. ✅ Check credentials
   ```bash
   # Test connection with MongoDB client
   mongosh "mongodb+srv://user:password@cluster.mongodb.net/resume_screening"
   ```

### Error: "AuthenticationFailed"
**Problem:** Wrong username or password

**Solutions:**
1. Reset password in MongoDB Atlas
2. Verify credentials in .env file
3. Check for special characters that need URL encoding

### Error: "Invalid ConnectionString"
**Problem:** Connection string format is wrong

**Solutions:**
1. Copy connection string again from MongoDB Atlas
2. Ensure format: `mongodb+srv://user:pass@cluster/database?params`
3. For local, use: `mongodb://localhost:27017/database`

### Backend starts but `/api/resume/analyze-text` fails
**Problem:** Connection established but operations fail

**Solutions:**
1. Ensure database user has correct permissions (Atlas Admin role)
2. Check if collections exist (they auto-create on first write)
3. Review error logs for specific errors

---

## Security Best Practices

### ✅ Do's
- ✅ Use strong passwords (15+ characters, mix of uppercase, numbers, symbols)
- ✅ Store credentials in `.env` file (never in git)
- ✅ Use environment variables in production
- ✅ Limit IP whitelist to your servers only
- ✅ Rotate credentials periodically
- ✅ Use role-based access control (Atlas)

### ❌ Don'ts
- ❌ Never hardcode credentials in code
- ❌ Don't commit `.env` file to git
- ❌ Don't use weak passwords like "password123"
- ❌ Don't whitelist `0.0.0.0/0` in production
- ❌ Don't share connection strings
- ❌ Don't use default MongoDB ports in production

---

## Production Deployment Checklist

- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Enable encryption at rest and in transit
- [ ] Use strong, unique database passwords
- [ ] Restrict IP whitelist to application servers only
- [ ] Enable automated backups (Atlas: free tier provides 8-day retention)
- [ ] Monitor cluster metrics and alerts
- [ ] Use separate database user for application
- [ ] Keep MongoDB driver and server versions updated
- [ ] Test failover and disaster recovery
- [ ] Document recovery procedures

---

## Useful Commands

### MongoDB Atlas CLI (Optional)
```bash
# Install Atlas CLI
brew install mongodb/brew/mongodb-atlas-cli

# Login to your Atlas account
atlas auth login

# List clusters
atlas clusters list

# Get connection string
atlas clusters connectionStrings describe YOUR_CLUSTER
```

### mongosh (MongoDB Shell - Optional)
```bash
# Install mongosh
# macOS: brew install mongosh
# Windows: choco install mongosh

# Connect to MongoDB
mongosh "mongodb+srv://user:password@cluster.mongodb.net/database"

# List databases
show dbs

# Use specific database
use resume_screening

# List collections
show collections

# Count documents in a collection
db.candidates.countDocuments()
```

---

## Additional Resources
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoEngine Documentation](http://mongoengine.org/)
- [Flask-MongoEngine Guide](https://docs.mongoengine.org/projects/flask-mongoengine/)
- [MongoDB Security Best Practices](https://docs.mongodb.com/manual/security/)

---

**Need help?** Check the health endpoint or review application logs for error messages.
