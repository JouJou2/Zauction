# ✅ Zauction Setup Checklist

Quick reference guide to get your Zauction platform running.

---

## 📋 Pre-Setup Checklist

Before you begin, make sure you have:

- [ ] **Node.js** (v18 or higher) installed
  - Check: `node --version`
  - Download: https://nodejs.org

- [ ] **Python** (v3.7 or higher) installed
  - Check: `python --version`
  - Download: https://www.python.org

- [ ] **Database** choice made:
  - [ ] Option A: Local PostgreSQL installed
  - [ ] Option B: Supabase account created

- [ ] **Port availability**:
  - [ ] Port 3000 free (backend)
  - [ ] Port 8000 free (frontend)

**Quick Check:** Run `.\check-install.ps1` to verify all prerequisites

---

## 🗄️ Database Setup

### Option A: Render PostgreSQL (⭐ Recommended - Free & Easy)

- [ ] Create account at https://render.com (no credit card needed)
- [ ] Click "New +" → "PostgreSQL"
- [ ] Name: `zauction-db`, Plan: **Free**
- [ ] Wait 2-3 minutes for provisioning
- [ ] Click "Shell" in database dashboard
- [ ] Copy contents of `zauction-backend\database\schema.sql`
- [ ] Paste into shell and press Enter
- [ ] Copy "External Database URL" from Connections section
- [ ] Update `zauction-backend\.env`:
  ```
  DATABASE_URL=postgresql://user:pass@dpg-xxxxx.oregon-postgres.render.com:5432/zauction_db
  ```
  Comment out the DB_HOST, DB_PORT, etc. lines

**See RENDER-SETUP.md for detailed guide**

### Option B: Local PostgreSQL

- [ ] Install PostgreSQL from https://www.postgresql.org/download/windows/
- [ ] Remember your postgres password during installation
- [ ] Create database:
  ```powershell
  createdb -U postgres zauction_db
  ```
- [ ] Run schema:
  ```powershell
  psql -U postgres -d zauction_db -f "zauction-backend\database\schema.sql"
  ```
- [ ] Update `zauction-backend\.env` with your postgres password:
  ```
  DB_PASSWORD=your_actual_password
  ```

### Option C: Supabase (Alternative Cloud Option)

- [ ] Create account at https://supabase.com
- [ ] Create new project
- [ ] Go to SQL Editor
- [ ] Copy contents of `zauction-backend\database\schema.sql`
- [ ] Paste and click "Run"
- [ ] Go to Settings → Database
- [ ] Copy "Connection string" (URI)
- [ ] Update `zauction-backend\.env`:
  ```
  DATABASE_URL=your_supabase_connection_string
  ```
  Comment out the DB_HOST, DB_PORT, etc. lines

---

## 📦 Backend Setup

- [ ] Install dependencies:
  ```powershell
  .\install-backend.ps1
  ```
  OR manually:
  ```powershell
  cd zauction-backend
  npm install
  ```

- [ ] Verify `.env` file exists in `zauction-backend\`
- [ ] Update `.env` with your database credentials (see above)

---

## 🚀 Launch Application

### Option 1: Automated Start (Recommended)

- [ ] Run startup script:
  ```powershell
  .\start.ps1
  ```
- [ ] Wait for both windows to open
- [ ] Browser should open automatically to http://localhost:8000

### Option 2: Manual Start

**Terminal 1 (Backend):**
```powershell
cd zauction-backend
npm run dev
```
- [ ] See "🚀 Zauction Backend Server running on port 3000"

**Terminal 2 (Frontend):**
```powershell
cd frontend
python -m http.server 8000
```
- [ ] See "Serving HTTP on..."

**Browser:**
- [ ] Open http://localhost:8000

---

## 🧪 Verify Everything Works

### 1. Backend Health Check
- [ ] Open: http://localhost:3000/health
- [ ] Should see: `{"status":"ok","timestamp":"..."}`

### 2. Frontend Loads
- [ ] Open: http://localhost:8000
- [ ] Landing page displays correctly
- [ ] No console errors (F12 → Console)

### 3. Create Test User

**Via Frontend:**
- [ ] Go to http://localhost:8000/pages/register.html
- [ ] Fill form and submit
- [ ] See success message

**Via API (PowerShell):**
```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"full_name\":\"Test User\"}'
```
- [ ] See success response

### 4. Approve Test User (Database)

**If using Supabase:**
- [ ] Go to Table Editor → users
- [ ] Find your user
- [ ] Set status = 'approved'
- [ ] Click Save

**If using psql:**
```sql
UPDATE users SET status = 'approved' WHERE email = 'test@example.com';
```
- [ ] Run command
- [ ] See "UPDATE 1"

### 5. Test Login

**Via Frontend:**
- [ ] Go to http://localhost:8000/pages/login.html
- [ ] Enter email and password
- [ ] Should redirect to account page

**Via API:**
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```
- [ ] Should receive JWT token

---

## 👑 Create Admin User

- [ ] Register a user (see step 3 above)
- [ ] In database, run:
  ```sql
  UPDATE users 
  SET role = 'admin', status = 'approved' 
  WHERE email = 'your@email.com';
  ```
- [ ] Login with this user
- [ ] Access admin panel: http://localhost:8000/pages/admin.html

---

## 📊 Test Full Workflow

### 1. Create Auction (as Admin)
- [ ] Login as admin user
- [ ] Go to admin panel
- [ ] Create new auction
- [ ] Fill all required fields
- [ ] Submit

### 2. Create Lot (as Admin)
- [ ] In admin panel, select auction
- [ ] Create new lot
- [ ] Set starting bid and increment
- [ ] Submit

### 3. Place Bid (as Regular User)
- [ ] Logout from admin
- [ ] Login as regular user (must be approved)
- [ ] Navigate to lot page
- [ ] Place bid
- [ ] See bid confirmation

### 4. Test Real-Time Updates
- [ ] Open lot page in two browser windows
- [ ] Login different users in each
- [ ] Place bid in one window
- [ ] See update in other window (real-time)

---

## 🎯 You're Done When...

- [ ] Backend runs without errors
- [ ] Frontend loads and displays correctly
- [ ] Can register new users
- [ ] Can login successfully
- [ ] Can create auctions (admin)
- [ ] Can create lots (admin)
- [ ] Can place bids (approved users)
- [ ] Real-time bidding works
- [ ] Language toggle works (EN/AR)

---

## 🐛 Troubleshooting

### Backend won't start
- [ ] Check if PostgreSQL/Supabase is accessible
- [ ] Verify .env configuration
- [ ] Ensure port 3000 is not in use
- [ ] Check `npm install` completed successfully

### Frontend can't connect to backend
- [ ] Verify backend is running (http://localhost:3000/health)
- [ ] Check browser console for CORS errors
- [ ] Ensure frontend uses http://localhost:8000 (not file://)

### Database connection errors
- [ ] Test database connection directly:
  ```powershell
  psql -U postgres -d zauction_db
  ```
- [ ] Or check Supabase dashboard
- [ ] Verify credentials in .env

### "Account not approved" error
- [ ] Check user status in database
- [ ] Run approval SQL command
- [ ] Logout and login again

---

## 📚 Next Steps

Once everything works:

1. **Customize**
   - [ ] Add your branding
   - [ ] Modify color scheme in `frontend/css/variables.css`
   - [ ] Update content in pages

2. **Add Content**
   - [ ] Create real auctions
   - [ ] Add lot images/videos
   - [ ] Write descriptions

3. **Test Thoroughly**
   - [ ] Test bidding workflow
   - [ ] Test watchlist features
   - [ ] Test admin functions
   - [ ] Test on mobile devices

4. **Deploy** (when ready)
   - [ ] Frontend to Netlify/Vercel
   - [ ] Backend to Heroku/Railway
   - [ ] Database to Supabase/AWS RDS
   - [ ] See README.md for deployment guide

---

## 🆘 Need Help?

**Documentation:**
- README.md - Project overview
- QUICK-START.md - Detailed setup
- API-TESTS.md - API reference
- ARCHITECTURE.md - System architecture

**Check Logs:**
- Backend: Terminal running `npm run dev`
- Frontend: Browser console (F12)
- Database: PostgreSQL logs or Supabase logs

**Common Issues:**
See QUICK-START.md troubleshooting section

---

## ✅ Checklist Complete?

Congratulations! 🎉

Your Zauction platform is now running!

Access your platform at:
- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/health

**Happy Auctioneering! 🎯**
