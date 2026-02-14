# 🚀 Zauction Quick Start Guide

## Current Status ✅

Your backend is **fully structured** with:
- ✅ Express.js server with TypeScript
- ✅ PostgreSQL database schema
- ✅ JWT authentication with bcrypt
- ✅ Socket.IO for real-time bidding
- ✅ All API routes (auth, auctions, lots, bids, watchlist, admin)
- ✅ Complete frontend with i18n support

---

## 🔧 Setup Steps

### Step 1: Install PostgreSQL

**Option A: Install PostgreSQL Locally (Recommended for Development)**

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install with default settings (remember your password!)
3. PostgreSQL will run on `localhost:5432`

**Option B: Use Supabase (Cloud-based, Easier Setup)**

1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Get your DATABASE_URL from Settings → Database

### Step 2: Set Up Database

**If using local PostgreSQL:**

1. Open pgAdmin (installed with PostgreSQL)
2. Create a database named `zauction_db`
3. Run the SQL from `zauction-backend/database/schema.sql`

**If using Supabase:**

1. Go to SQL Editor in Supabase dashboard
2. Copy and paste contents of `zauction-backend/database/schema.sql`
3. Click Run
4. Update `.env` file with your DATABASE_URL

### Step 3: Install Backend Dependencies

```powershell
cd "c:\Users\leno o\Desktop\Zauction\zauction-backend"
npm install
```

### Step 4: Configure Environment

The `.env` file has been created with default values. Update if needed:
- If using Supabase, uncomment DATABASE_URL and add your connection string
- If using local PostgreSQL, update DB_PASSWORD to match your installation

### Step 5: Run Backend Server

```powershell
# Development mode (with auto-reload)
npm run dev

# Production build
npm run build
npm start
```

Server will run at: **http://localhost:3000**

### Step 6: Run Frontend

Open a **new terminal**:

```powershell
cd "c:\Users\leno o\Desktop\Zauction\frontend"
python -m http.server 8000
```

Frontend will run at: **http://localhost:8000**

---

## 🧪 Testing the System

### 1. Test Backend Health

Open browser: http://localhost:3000/health

Should see: `{"status":"ok","timestamp":"..."}`

### 2. Create Test User

**Method 1: Using the frontend**
- Go to http://localhost:8000/pages/register.html
- Register a new account

**Method 2: Using curl/Postman**

```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"full_name\":\"Test User\"}'
```

### 3. Create Admin User (via database)

```sql
-- Update a user to be admin and approved
UPDATE users 
SET role = 'admin', status = 'approved' 
WHERE email = 'test@example.com';
```

---

## 📁 Project Structure

```
Zauction/
├── frontend/              # Frontend application
│   ├── index.html         # Landing page
│   ├── pages/             # All pages (login, register, auctions, etc.)
│   ├── js/                # JavaScript modules
│   ├── css/               # Stylesheets
│   └── locales/           # i18n translations (en, ar)
│
└── zauction-backend/      # Backend API
    ├── src/
    │   ├── server.ts      # Main server file
    │   ├── config/        # Database configuration
    │   ├── middleware/    # Auth middleware
    │   ├── routes/        # API endpoints
    │   └── socket/        # Real-time bidding handlers
    ├── database/
    │   └── schema.sql     # PostgreSQL schema
    └── .env               # Environment variables
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Auctions (Public)
- `GET /api/auctions` - Get all auctions
- `GET /api/auctions/:id` - Get single auction
- `GET /api/auctions/:id/lots` - Get auction lots

### Lots (Public)
- `GET /api/lots/:id` - Get lot details
- `GET /api/lots/:id/media` - Get lot media
- `GET /api/lots/:id/bids` - Get bid history

### Bids (Authenticated)
- `POST /api/bids` - Place a bid

### Watchlist (Authenticated)
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:lotId` - Remove from watchlist

### Admin (Admin Only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/approve` - Approve user
- `POST /api/admin/auctions` - Create auction
- `POST /api/admin/lots` - Create lot

---

## 🔄 Next Steps

1. **Start both servers** (backend on :3000, frontend on :8000)
2. **Test registration** and login
3. **Create an admin user** via database
4. **Add sample auctions** via admin panel
5. **Test bidding** functionality

---

## 🐛 Troubleshooting

### Backend won't start
- Check if PostgreSQL is running
- Verify database credentials in `.env`
- Check if port 3000 is available

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check CORS settings in `server.ts`
- Ensure FRONTEND_URL in `.env` is correct

### Database errors
- Verify schema.sql was run successfully
- Check database connection in pgAdmin
- Look at server logs for specific errors

---

## 📞 Need Help?

Check the logs:
- Backend: Terminal where `npm run dev` is running
- Frontend: Browser console (F12)
- Database: pgAdmin or Supabase logs

Happy Auctioneering! 🎯
