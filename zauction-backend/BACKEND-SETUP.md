# Zauction Backend Setup Guide

Complete backend API with Node.js, Express, PostgreSQL, JWT Auth, bcrypt, and Socket.IO for live bidding.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager

### 1. Install Dependencies

```bash
cd zauction-backend
npm install
```

This will install:
- **express** - Web framework
- **socket.io** - Real-time bidding
- **pg** - PostgreSQL client
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin requests
- **dotenv** - Environment variables
- And more...

### 2. Database Setup

#### Option A: Local PostgreSQL

1. **Install PostgreSQL** if you haven't already

2. **Create the database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE zauction_db;

# Exit psql
\q
```

3. **Run the schema:**
```bash
# Run the schema file
psql -U postgres -d zauction_db -f database/schema.sql
```

#### Option B: Supabase (Cloud PostgreSQL)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the contents of `database/schema.sql`
4. Get your connection string from Project Settings > Database

### 3. Environment Configuration

1. **Copy the example environment file:**
```bash
cp .env.example .env
```

2. **Edit `.env` with your values:**

For **Local PostgreSQL:**
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8000

# Local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zauction_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_SSL=false

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Bcrypt rounds
BCRYPT_ROUNDS=10
```

For **Supabase:**
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8000

# Supabase Connection
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Bcrypt rounds
BCRYPT_ROUNDS=10
```

### 4. Start the Server

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Build and Run Production:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Auctions
- `GET /api/auctions` - Get all auctions
- `GET /api/auctions/:id` - Get auction by ID
- `POST /api/admin/auctions` - Create auction (admin only)
- `PUT /api/admin/auctions/:id` - Update auction (admin only)
- `DELETE /api/admin/auctions/:id` - Delete auction (admin only)

### Lots
- `GET /api/lots` - Get all lots
- `GET /api/lots/:id` - Get lot by ID
- `GET /api/auctions/:auctionId/lots` - Get lots for auction
- `POST /api/admin/lots` - Create lot (admin only)
- `PUT /api/admin/lots/:id` - Update lot (admin only)

### Bids
- `POST /api/bids` - Place a bid (requires auth)
- `GET /api/lots/:lotId/bids` - Get bids for a lot
- `GET /api/users/me/bids` - Get user's bids (requires auth)

### Watchlist
- `GET /api/watchlist` - Get user's watchlist (requires auth)
- `POST /api/watchlist/:lotId` - Add to watchlist (requires auth)
- `DELETE /api/watchlist/:lotId` - Remove from watchlist (requires auth)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id/status` - Update user status (admin only)

## 🔌 Socket.IO Events

### Client → Server

#### Join/Leave Rooms
```javascript
socket.emit('join-auction', auctionId);
socket.emit('leave-auction', auctionId);
socket.emit('join-lot', lotId);
socket.emit('leave-lot', lotId);
```

#### Place Bid
```javascript
socket.emit('place-bid', {
    lotId: 'uuid-here',
    amount: 1500
});
```

### Server → Client

#### New Bid
```javascript
socket.on('new-bid', (data) => {
    console.log('New bid:', data);
    // { id, lotId, amount, bidTime, user: { id, email, name } }
});
```

#### Bid Error
```javascript
socket.on('bid-error', (error) => {
    console.error('Bid failed:', error.message);
});
```

#### Lot Updated
```javascript
socket.on('lot-updated', (data) => {
    // { lotId, currentBid, bidCount }
});
```

#### Auction Ending Soon
```javascript
socket.on('auction-ending-soon', (data) => {
    // { auctionId, title, endDate }
});
```

#### Auction Ended
```javascript
socket.on('auction-ended', (data) => {
    // { auctionId, title }
});
```

## 🔐 Authentication

### Registering a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "full_name": "John Doe"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

### Using the Token

Include the token in the `Authorization` header:

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

For Socket.IO:
```javascript
const socket = io('http://localhost:3000', {
    auth: {
        token: 'YOUR_TOKEN_HERE'
    }
});
```

## 📊 Database Schema Overview

### Tables

1. **users** - User accounts with bcrypt-hashed passwords
2. **auctions** - Auction events with date ranges
3. **lots** - Individual items in auctions
4. **lot_media** - Images/videos for lots
5. **bids** - Bid history
6. **watchlist** - User saved lots

See `database/schema.sql` for complete schema.

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - WebSocket for real-time bidding
- **PostgreSQL** - Relational database
- **TypeScript** - Type safety
- **JWT (jsonwebtoken)** - Secure authentication
- **bcrypt** - Password hashing
- **pg** - PostgreSQL client
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment management

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-08T..."
}
```

### Create Test Data

Connect to your database and run:

```sql
-- Create an admin user
INSERT INTO users (email, password_hash, full_name, role, status)
VALUES ('admin@zauction.com', '$2b$10$...', 'Admin User', 'admin', 'approved');

-- Create a test auction
INSERT INTO auctions (title, description, start_date, end_date, status)
VALUES (
  'Fine Art Collection',
  'Curated selection of European paintings',
  NOW(),
  NOW() + INTERVAL '7 days',
  'active'
);
```

## 🔧 Development Tips

### Watch Mode
The dev server uses `nodemon` for auto-reload on file changes:
```bash
npm run dev
```

### Database Queries
Check `src/config/database.ts` for query logging and connection pooling.

### Socket.IO Testing
Use the Chrome extension "Socket.IO Client Tool" or test from frontend.

### Environment Variables
Never commit `.env` file. It's already in `.gitignore`.

## 🚨 Troubleshooting

### Database Connection Issues

**Error: "password authentication failed"**
- Check your PostgreSQL password in `.env`
- Verify user exists: `psql -U postgres -c "\du"`

**Error: "database does not exist"**
- Create the database: `createdb zauction_db`

### Port Already in Use

**Error: "EADDRINUSE: port 3000 already in use"**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### TypeScript Errors

```bash
# Clean build
rm -rf dist
npm run build
```

## 📝 Next Steps

1. ✅ Set up the database
2. ✅ Configure `.env`
3. ✅ Start the backend server
4. 🔄 Test API endpoints
5. 🔄 Connect frontend to backend
6. 🔄 Test live bidding with Socket.IO

## 🌐 Deployment

### Heroku
```bash
heroku create zauction-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Railway
1. Connect GitHub repo
2. Add PostgreSQL plugin
3. Set environment variables
4. Deploy

---

**Happy coding!** 🎉

For issues, check the logs:
```bash
# View real-time logs
npm run dev

# Check database logs
psql -U postgres -d zauction_db
```
