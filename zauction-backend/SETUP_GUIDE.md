# Zauction Backend - Setup Guide

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Fill in details:
   - Name: `zauction`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

### 2. Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `database/schema.sql`
4. Paste and click **Run**
5. You should see "Success. No rows returned"

### 3. Get Database Connection String

1. In Supabase, go to **Settings** → **Database**
2. Scroll to **Connection String** → **URI**
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password

### 4. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up
2. Go to Dashboard
3. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

### 5. Configure Environment

1. In `zauction-backend` folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file:
   ```env
   PORT=3000
   NODE_ENV=development
   
   # Paste your Supabase connection string
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
   
   # Generate a random secret (or use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   JWT_SECRET=your-super-secret-jwt-key-change-this
   
   # Paste Cloudinary credentials
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Frontend URL
   FRONTEND_URL=http://localhost:8000
   ```

### 6. Install Dependencies

```bash
cd zauction-backend
npm install
```

### 7. Start Development Server

```bash
npm run dev
```

You should see:
```
🚀 Zauction API server running on port 3000
📍 Environment: development
🌐 CORS enabled for: http://localhost:8000
✅ Connected to PostgreSQL database
```

### 8. Test the API

Open a new terminal and test:

```bash
# Health check
curl http://localhost:3000/health

# Login as admin (default account)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zauction.com","password":"admin123"}'
```

You should get a JSON response with a token!

## Default Admin Account

**Email:** `admin@zauction.com`  
**Password:** `admin123`

⚠️ **IMPORTANT:** Change this password immediately!

## API Endpoints Summary

### Public Routes
- `GET /api/auctions` - List auctions
- `GET /api/auctions/:id` - Get auction
- `GET /api/auctions/:id/lots` - Get lots in auction
- `GET /api/lots/:id` - Get lot details
- `GET /api/lots/:id/bids` - Get bid history

### Authentication
- `POST /api/auth/register` - Register (status: pending)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### User Routes (Authenticated)
- `POST /api/bids` - Place bid (approved users only)
- `GET /api/bids/my-bids` - Get my bids
- `GET /api/watchlist` - Get watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:lotId` - Remove from watchlist

### Admin Routes
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/:id/approve` - Approve user
- `PATCH /api/admin/users/:id/reject` - Reject user
- `PATCH /api/admin/users/:id/suspend` - Suspend user
- `POST /api/admin/auctions` - Create auction
- `PATCH /api/admin/auctions/:id` - Update auction
- `DELETE /api/admin/auctions/:id` - Delete auction
- `POST /api/admin/lots` - Create lot
- `PATCH /api/admin/lots/:id` - Update lot
- `POST /api/admin/lots/:id/media` - Upload media
- `DELETE /api/admin/lots/:id` - Delete lot

## Troubleshooting

### "Connection refused"
- Make sure Supabase project is running
- Check DATABASE_URL is correct
- Verify your IP is allowed in Supabase (Settings → Database → Connection Pooling)

### "Invalid token"
- Token expired (7 days) - login again
- JWT_SECRET changed - login again

### "Cannot upload media"
- Check Cloudinary credentials
- Verify file size < 10MB
- Check file format (images: jpg, png, webp; videos: mp4)

### "Port 3000 already in use"
- Change PORT in .env
- Or kill process: `npx kill-port 3000`

## Next Steps

1. ✅ Backend is running
2. → Update frontend to use API
3. → Test user registration and approval flow
4. → Test bidding system
5. → Deploy to production

## Production Deployment

For production, you'll need to:
1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Enable HTTPS
4. Set proper CORS origins
5. Add rate limiting
6. Set up monitoring

Recommended platforms:
- **Railway** (easiest)
- **Render** (free tier)
- **Heroku**
- **AWS/GCP/Azure** (most control)
