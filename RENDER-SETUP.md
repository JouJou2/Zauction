# 🚀 Zauction on Render - Complete Guide

## Why Render?

✅ **Free PostgreSQL database** (proper database, not a toy)
✅ **Free backend hosting** (750 hours/month)
✅ **Auto-deploys** from GitHub
✅ **Easy upgrades** to paid plans when needed
✅ **No credit card required** for free tier

---

## 🎯 Development Strategy

### Phase 1: Development (FREE)
- **Database**: Render PostgreSQL (Free tier)
  - 1 GB storage
  - Expires after 90 days (can create new one)
  - Perfect for development!
- **Backend**: Render Web Service (Free tier)
  - Spins down after 15 minutes of inactivity
  - Spins up automatically when accessed
- **Frontend**: Netlify/Vercel (Free static hosting)

### Phase 2: Production (When Ready)
- **Database**: Render PostgreSQL (Starter $7/month or higher)
  - Persistent storage
  - Automated backups
  - Better performance
- **Backend**: Render Web Service (Starter $7/month)
  - Always on
  - No spin-down delay
- **Frontend**: Same (Netlify/Vercel free tier is great)

**Total Cost**: 
- Development: **$0/month**
- Production: **$14/month** (can start with just database upgrade at $7/month)

---

## 📋 Setup Instructions

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up (free, no credit card needed)
3. Connect your GitHub account

### Step 2: Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `zauction-db`
   - **Database**: `zauction_db`
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: **Free** (for development)
3. Click **"Create Database"**
4. Wait 2-3 minutes for provisioning

### Step 3: Get Database Connection Info

1. Once created, go to database dashboard
2. Scroll down to **"Connections"**
3. Copy the **"External Database URL"**
   - Format: `postgresql://user:password@host:port/database`
4. Keep this handy!

### Step 4: Run Database Schema

**Option A: Using Render's Dashboard**

1. In database dashboard, click **"Connect"** → **"External Connection"**
2. Install psql if you don't have it
3. Run:
   ```powershell
   # Copy connection command from Render dashboard
   psql postgresql://user:pass@host:port/db
   
   # Then paste schema (you'll need to copy-paste the SQL)
   # Or use \i command:
   \i c:/Users/leno o/Desktop/Zauction/zauction-backend/database/schema.sql
   ```

**Option B: Using Render's Shell** (Easier!)

1. In database dashboard, click **"Shell"**
2. Opens a web-based terminal connected to your database
3. You can paste SQL directly here!
4. Copy contents of `zauction-backend/database/schema.sql`
5. Paste into shell and press Enter

**Option C: Using a GUI Tool** (Recommended)

1. Download **pgAdmin** or **DBeaver** (free)
2. Create new connection with details from Render
3. Open SQL editor
4. Copy-paste contents of `schema.sql`
5. Execute

### Step 5: Update Local .env for Render Database

Update `zauction-backend/.env`:

```env
# Comment out local database settings
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=zauction_db
# DB_USER=postgres
# DB_PASSWORD=postgres

# Use Render database URL
DATABASE_URL=postgresql://user:password@host:port/zauction_db

# Keep other settings
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000
JWT_SECRET=zauction-super-secret-key-change-in-production-2026
```

### Step 6: Test Local Connection to Render Database

```powershell
cd zauction-backend
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Zauction Backend Server running on port 3000
```

Now your **local backend** is using **Render's database**!

---

## 🌐 Deploy Backend to Render (Optional - For Live Testing)

### Step 1: Push Code to GitHub

```powershell
# Initialize git if you haven't
cd "c:\Users\leno o\Desktop\Zauction"
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/zauction.git
git branch -M main
git push -u origin main
```

### Step 2: Create Web Service on Render

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `zauction-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `zauction-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### Step 3: Add Environment Variables

In the web service settings, add:

```
DATABASE_URL=<paste your database URL>
JWT_SECRET=zauction-super-secret-key-change-in-production-2026
NODE_ENV=production
FRONTEND_URL=https://your-frontend.netlify.app
```

### Step 4: Deploy!

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deploy
3. You'll get a URL like: `https://zauction-backend.onrender.com`

---

## 🎨 Deploy Frontend (Netlify - Recommended)

### Option 1: Netlify (Easiest)

1. Go to https://netlify.com
2. Sign up (free)
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect GitHub → Select repository
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: (leave empty)
   - **Publish directory**: `.` (dot)
6. Click **"Deploy site"**
7. You'll get URL like: `https://zauction-abc123.netlify.app`

### Option 2: Vercel

1. Go to https://vercel.com
2. Import repository
3. Set **Root Directory**: `frontend`
4. Deploy!

### Update Frontend API URL

Once backend is deployed, update `frontend/js/api.js`:

```javascript
// Change this line:
const API_BASE_URL = 'http://localhost:3000/api';

// To your Render backend URL:
const API_BASE_URL = 'https://zauction-backend.onrender.com/api';
```

Commit and push - Netlify/Vercel will auto-deploy!

---

## 📊 Database Management

### Access Your Render Database

**Via Web Shell:**
1. Go to database in Render dashboard
2. Click "Shell"
3. Run SQL commands directly

**Via psql:**
```powershell
psql postgresql://user:pass@host:port/db
```

**Via GUI (pgAdmin/DBeaver):**
- Host: dpg-xxxxx.oregon-postgres.render.com
- Port: 5432
- Database: zauction_db
- User: (from Render)
- Password: (from Render)

### Useful SQL Commands

```sql
-- View all users
SELECT id, email, full_name, role, status FROM users;

-- Approve a user
UPDATE users SET status = 'approved' WHERE email = 'user@example.com';

-- Make someone admin
UPDATE users SET role = 'admin', status = 'approved' WHERE email = 'admin@example.com';

-- View all auctions
SELECT id, title, status, start_date, end_date FROM auctions;

-- View all bids
SELECT b.amount, l.title, u.email, b.created_at 
FROM bids b
JOIN lots l ON b.lot_id = l.id
JOIN users u ON b.user_id = u.id
ORDER BY b.created_at DESC;
```

---

## 🔄 Migration Path: Free → Paid

### When to Upgrade?

Upgrade when you need:
- ✅ Database persistence beyond 90 days
- ✅ Always-on backend (no spin-down)
- ✅ More database storage/connections
- ✅ Better performance
- ✅ Automated backups

### How to Upgrade

**Database:**
1. Go to database settings in Render
2. Click "Upgrade Plan"
3. Choose Starter ($7/month) or higher
4. No code changes needed!

**Backend:**
1. Go to web service settings
2. Click "Upgrade Plan"
3. Choose Starter ($7/month)
4. Backend stays online 24/7

### Database Migration (If Switching Providers)

If you want to move to AWS RDS, Supabase, etc:

```powershell
# 1. Backup from Render
pg_dump postgresql://render-url > backup.sql

# 2. Restore to new database
psql postgresql://new-url < backup.sql

# 3. Update DATABASE_URL in Render environment variables
# 4. Redeploy
```

---

## 💡 Development Workflow

### For Development (Recommended)

```
Local Backend (npm run dev)
      ↓
Render PostgreSQL Database (Free)
      ↑
Local Frontend (python server)
```

**Advantages:**
- ✅ Real database (not SQLite or in-memory)
- ✅ Same as production environment
- ✅ No local PostgreSQL installation needed
- ✅ Team can share same database
- ✅ Access from anywhere

### For Production

```
Render Backend (Always On)
      ↓
Render PostgreSQL (Starter+)
      ↑
Netlify Frontend (CDN)
```

---

## 🐛 Troubleshooting

### "Connection timeout"
- Render databases have IP whitelisting disabled by default
- Check if your DATABASE_URL is correct
- Try accessing via Render Shell first

### "Too many connections"
- Free tier has connection limit
- Make sure you're using connection pooling (already configured in `database.ts`)
- Close unused connections

### "Database expired"
- Free databases expire after 90 days
- Create new database
- Run schema again
- Update DATABASE_URL

### Backend spins down (Free tier)
- Expected behavior on free tier
- First request after 15 min takes ~30 seconds
- Upgrade to Starter ($7/month) for always-on

---

## 💰 Cost Comparison

### Render (Recommended for You)

| Tier | Database | Backend | Total |
|------|----------|---------|-------|
| Free | $0 (90 days) | $0 (with delays) | **$0** |
| Starter | $7/month | $7/month | **$14/month** |
| Pro | $20/month | $25/month | **$45/month** |

### Alternatives

| Service | Database | Backend | Notes |
|---------|----------|---------|-------|
| **Supabase** | Free tier available | Need separate hosting | Great database |
| **Railway** | $5/month | Pay per use | Simple pricing |
| **Heroku** | $5/month | $7/month | Classic choice |
| **AWS** | RDS from $15 | EC2/Elastic Beanstalk | Most scalable |

---

## ✅ Recommended Approach

### Phase 1: Development (NOW)
1. ✅ Create free Render PostgreSQL database
2. ✅ Run schema on Render database
3. ✅ Connect local backend to Render database
4. ✅ Develop and test locally
5. ✅ Frontend stays local (python server)

**Cost: $0**

### Phase 2: Beta Testing (Optional)
1. Deploy backend to Render (free tier)
2. Deploy frontend to Netlify (free tier)
3. Share with testers
4. Collect feedback

**Cost: $0** (with spin-down delays)

### Phase 3: Production (When Ready)
1. Upgrade Render database to Starter ($7/month)
2. Upgrade Render backend to Starter ($7/month)
3. Custom domain (optional)
4. You're live!

**Cost: $14/month**

---

## 🚀 Quick Start with Render

```powershell
# 1. Create Render account (render.com)
# 2. Create PostgreSQL database (free tier)
# 3. Get DATABASE_URL

# 4. Update local .env
code zauction-backend\.env
# Add: DATABASE_URL=postgresql://...

# 5. Run schema via Render Shell
# (Copy-paste contents of schema.sql)

# 6. Start local development
.\start.ps1

# 7. Test connection
curl http://localhost:3000/health
```

You're now developing with a **real production-grade PostgreSQL database** for free! 🎉

---

## 📚 Additional Resources

- **Render Docs**: https://render.com/docs
- **PostgreSQL Docs**: https://render.com/docs/databases
- **Render Discord**: Community support
- **Free SSL**: Automatic on Render
- **Custom Domains**: Available on all plans

---

**Need help?** Check the Render dashboard logs - they're excellent for debugging!
