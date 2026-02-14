# Zauction Backend - Prisma + Docker Setup ✅

## 🎉 Setup Complete!

Your Zauction backend is now running with:
- **Prisma ORM** (v5.22.0) for type-safe database queries
- **Docker PostgreSQL** (v15-alpine) running on port 5433
- **Admin & Test Users** already created

---

## 🚀 Quick Start

### 1. Start Docker Database
```bash
cd zauction-backend
docker-compose up -d
```

### 2. Run Database Migrations  
```bash
npx prisma migrate dev
```

### 3. Start Backend Server
```bash
npm run dev
```

### 4. Start Frontend Server (separate terminal)
```bash
cd ../frontend
npx http-server -p 8000
```

---

## 📝 Login Credentials

**Admin Access:**
- Email: `admin@zauction.com`
- Password: `admin123`
- Redirects to: `/pages/admin.html`

**Regular User:**
- Email: `user@zauction.com`  
- Password: `user123`
- Redirects to: `/pages/account.html`

---

## 🐳 Docker Commands

**View logs:**
```bash
docker-compose logs -f
```

**Stop database:**
```bash
docker-compose down
```

**Remove data (fresh start):**
```bash
docker-compose down -v
```

**Restart database:**
```bash
docker-compose restart
```

---

## 🗄️ Prisma Commands

**Generate Prisma Client:**
```bash
npx prisma generate
```

**Create new migration:**
```bash
npx prisma migrate dev --name your_migration_name
```

**View database in Prisma Studio:**
```bash
npx prisma studio
```

**Reset database (WARNING: deletes all data):**
```bash
npx prisma migrate reset
```

**Seed database with test data:**
```bash
npx ts-node prisma/seed.ts
```

---

## 🔧 Configuration

**Database Connection:**
- Location: `.env`
- Default: `postgresql://zauction:zauction123@localhost:5433/zauction_db`

**Docker PostgreSQL:**
- Image: `postgres:15-alpine`
- Container: `zauction-postgres`
- Port: `5433` (mapped from container's 5432)
- Username: `zauction`
- Password: `zauction123`
- Database: `zauction_db`

---

## 📊 Database Schema

The Prisma schema includes:
- **Users** - Authentication, roles (user/admin), status (pending/approved)
- **Auctions** - Auction events with start/end dates
- **Lots** - Individual items in auctions
- **LotMedia** - Images and videos for lots
- **Bids** - Bidding history  
- **Watchlist** - User-saved lots

View schema: `prisma/schema.prisma`

---

## 🔍 Debugging

**Check if PostgreSQL is running:**
```bash
docker ps
```

**Check database connection:**
```bash
docker exec -it zauction-postgres psql -U zauction -d zauction_db
```

**View all tables:**
```sql
\dt
```

**Exit psql:**
```sql
\q
```

**Backend logs:**
- Prisma queries are logged in development mode
- Check terminal output for database connection status

---

## 🆕 vs Previous Setup

**Before (Raw SQL):**
- Used `pg` driver directly
- Manual SQL queries
- Connection pooling via `database.ts`

**Now (Prisma):**
- Type-safe queries
- Auto-generated TypeScript types
- Database migrations
- Simplified CRUD operations
- Better IDE autocomplete

**Files Changed:**
- `src/config/prisma.ts` - New Prisma client
- `src/routes/auth.ts` - Updated to use Prisma
- `src/config/database.ts` - Can be removed (not used)
- `prisma/schema.prisma` - Database schema
- `prisma.config.js` - Prisma configuration  
- `docker-compose.yml` - PostgreSQL container
- `.env` - Updated DATABASE_URL

---

## ✅ What's Working

- ✅ Docker PostgreSQL running on port 5433
- ✅ Prisma Client generated and configured
- ✅ Database schema migrated
- ✅ Admin user created (`admin@zauction.com`)
- ✅ Test user created (`user@zauction.com`)
- ✅ Backend server connected to database
- ✅ Authentication routes using Prisma
- ✅ Role-based redirects (admin → admin panel)

---

## 📚 Next Steps

1. Update remaining routes to use Prisma:
   - `src/routes/auctions.ts`
   - `src/routes/lots.ts`
   - `src/routes/bids.ts`
   - `src/routes/watchlist.ts`
   - `src/routes/admin/*`

2. Test login/registration on frontend
3. Test admin panel functionality
4. Add more seed data if needed

---

## 🐛 Troubleshooting

**Port 5432 already in use:**
- Default changed to 5433 to avoid conflicts
- Update `.env` if needed

**Prisma Client not found:**
```bash
npx prisma generate
```

**Migration errors:**
```bash
npx prisma migrate reset
npx ts-node prisma/seed.ts
```

**Docker not running:**
- Start Docker Desktop
- Wait 10-15 seconds, then run `docker-compose up -d`

---

🎊 **Happy coding!**
