# 🏗️ Zauction Platform Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ZAUCTION PLATFORM                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│    FRONTEND      │◄───────►│     BACKEND      │◄───────►│    DATABASE      │
│   (Port 8000)    │         │   (Port 3000)    │         │   PostgreSQL     │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
      │                              │
      │                              │
      └──────────────────────────────┘
            WebSocket (Socket.IO)
            Real-time Bidding
```

---

## Frontend Architecture

```
FRONTEND (HTML/CSS/JavaScript)
│
├── Pages (User Interface)
│   ├── index.html ─────────────► Landing Page
│   ├── login.html ─────────────► Authentication
│   ├── register.html ──────────► User Registration
│   ├── auctions.html ──────────► Browse Auctions
│   ├── auction.html ───────────► Single Auction View
│   ├── lot.html ───────────────► Lot Details + Bidding
│   ├── account.html ───────────► User Dashboard
│   └── admin.html ─────────────► Admin Panel
│
├── JavaScript Modules
│   ├── api.js ──────────► API Client (Fetch wrapper)
│   ├── auth.js ─────────► Login/Register/Token management
│   ├── bidding.js ──────► Bid placement logic
│   ├── i18n.js ─────────► English/Arabic translations
│   ├── watchlist.js ────► Watchlist management
│   ├── admin.js ────────► Admin operations
│   └── data.js ─────────► Local data management
│
├── Styling
│   ├── variables.css ───► Colors, fonts, spacing
│   ├── components.css ──► Buttons, forms, cards
│   ├── layout.css ──────► Grid, flexbox layouts
│   └── pages/ ──────────► Page-specific styles
│
└── Internationalization
    ├── locales/en.json ─► English translations
    └── locales/ar.json ─► Arabic translations (RTL)
```

---

## Backend Architecture

```
BACKEND (Node.js + TypeScript)
│
├── Server (src/server.ts)
│   ├── Express.js ──────────► HTTP REST API
│   ├── Socket.IO ───────────► WebSocket connections
│   ├── CORS ────────────────► Cross-origin requests
│   └── Error Handling ──────► Centralized error middleware
│
├── Database (src/config/database.ts)
│   ├── PostgreSQL Pool ─────► Connection pooling
│   ├── Connection URL ──────► Supabase/Local support
│   └── Query helpers ───────► Database utilities
│
├── Middleware (src/middleware/auth.ts)
│   ├── authenticate ────────► Verify JWT tokens
│   ├── requireApproved ─────► Check user approval status
│   └── requireAdmin ────────► Admin-only access
│
├── API Routes
│   │
│   ├── /api/auth (src/routes/auth.ts)
│   │   ├── POST /register ──────► Create new user
│   │   ├── POST /login ─────────► Login & get token
│   │   └── GET /me ─────────────► Get current user
│   │
│   ├── /api/auctions (src/routes/auctions.ts)
│   │   ├── GET / ───────────────► List all auctions
│   │   ├── GET /:id ────────────► Get auction details
│   │   └── GET /:id/lots ───────► Get auction lots
│   │
│   ├── /api/lots (src/routes/lots.ts)
│   │   ├── GET /:id ────────────► Get lot details
│   │   ├── GET /:id/media ──────► Get lot media
│   │   └── GET /:id/bids ───────► Get bid history
│   │
│   ├── /api/bids (src/routes/bids.ts)
│   │   ├── POST / ──────────────► Place bid
│   │   └── GET /my-bids ────────► User's bid history
│   │
│   ├── /api/watchlist (src/routes/watchlist.ts)
│   │   ├── GET / ───────────────► Get user watchlist
│   │   ├── POST / ──────────────► Add to watchlist
│   │   └── DELETE /:lotId ──────► Remove from watchlist
│   │
│   └── /api/admin/* (Admin Routes)
│       │
│       ├── /users (src/routes/admin/users.ts)
│       │   ├── GET / ───────────► Get all users
│       │   ├── PUT /:id/approve ► Approve user
│       │   ├── PUT /:id/reject ─► Reject user
│       │   └── PUT /:id/suspend ► Suspend user
│       │
│       ├── /auctions (src/routes/admin/auctions.ts)
│       │   ├── POST / ──────────► Create auction
│       │   ├── PUT /:id ────────► Update auction
│       │   └── DELETE /:id ─────► Delete auction
│       │
│       └── /lots (src/routes/admin/lots.ts)
│           ├── POST / ──────────► Create lot
│           ├── PUT /:id ────────► Update lot
│           └── DELETE /:id ─────► Delete lot
│
└── WebSocket (src/socket/handlers.ts)
    ├── join-auction ────────► Join auction room
    ├── leave-auction ───────► Leave auction room
    ├── join-lot ────────────► Join lot room
    ├── place-bid ───────────► Real-time bid placement
    └── Events Emitted:
        ├── new-bid ─────────► Broadcast new bids
        ├── auction-updated ─► Auction status changes
        └── lot-updated ─────► Lot status changes
```

---

## Database Schema

```
DATABASE (PostgreSQL)
│
├── USERS
│   ├── id (UUID, PK)
│   ├── email (unique)
│   ├── password_hash
│   ├── full_name
│   ├── role ────────────► 'user' | 'admin'
│   ├── status ──────────► 'pending' | 'approved' | 'rejected'
│   └── timestamps
│
├── AUCTIONS
│   ├── id (UUID, PK)
│   ├── title
│   ├── description
│   ├── category
│   ├── start_date
│   ├── end_date
│   ├── buyers_premium
│   ├── status ──────────► 'upcoming' | 'active' | 'ended'
│   ├── featured (boolean)
│   └── created_by (FK → users)
│
├── LOTS
│   ├── id (UUID, PK)
│   ├── auction_id (FK → auctions)
│   ├── lot_number
│   ├── title
│   ├── description
│   ├── category
│   ├── condition
│   ├── estimate_low
│   ├── estimate_high
│   ├── starting_bid
│   ├── reserve_price
│   ├── current_bid
│   ├── bid_increment
│   ├── bid_count
│   └── status ──────────► 'active' | 'sold' | 'unsold'
│
├── BIDS
│   ├── id (UUID, PK)
│   ├── lot_id (FK → lots)
│   ├── user_id (FK → users)
│   ├── amount
│   ├── status ──────────► 'winning' | 'outbid' | 'won' | 'lost'
│   ├── bid_type ────────► 'regular' | 'max_bid'
│   └── created_at
│
├── LOT_MEDIA
│   ├── id (UUID, PK)
│   ├── lot_id (FK → lots)
│   ├── media_type ──────► 'image' | 'video'
│   ├── url
│   ├── thumbnail_url
│   └── display_order
│
└── WATCHLIST
    ├── user_id (FK → users, PK)
    ├── lot_id (FK → lots, PK)
    └── created_at
```

---

## Data Flow

### User Registration & Login

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Frontend │         │ Backend  │         │ Database │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │ POST /register     │                    │
     ├───────────────────>│                    │
     │                    │ Hash password      │
     │                    │ (bcrypt)           │
     │                    │                    │
     │                    │ INSERT user        │
     │                    ├───────────────────>│
     │                    │                    │
     │                    │ Return user        │
     │                    │<───────────────────┤
     │ User created       │                    │
     │ (status: pending)  │                    │
     │<───────────────────┤                    │
     │                    │                    │
     │                                         │
     │ POST /login        │                    │
     ├───────────────────>│                    │
     │                    │ SELECT user        │
     │                    ├───────────────────>│
     │                    │                    │
     │                    │ User data          │
     │                    │<───────────────────┤
     │                    │                    │
     │                    │ Verify password    │
     │                    │ (bcrypt.compare)   │
     │                    │                    │
     │                    │ Generate JWT       │
     │                    │ (jsonwebtoken)     │
     │                    │                    │
     │ JWT token + user   │                    │
     │<───────────────────┤                    │
     │                    │                    │
     │ Store token        │                    │
     │ (localStorage)     │                    │
     │                    │                    │
```

### Placing a Bid

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ Frontend │         │ Backend  │         │ Database │         │ Other    │
│          │         │ (HTTP)   │         │          │         │ Clients  │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ POST /api/bids     │                    │                    │
     │ (with JWT)         │                    │                    │
     ├───────────────────>│                    │                    │
     │                    │ Verify JWT         │                    │
     │                    │                    │                    │
     │                    │ Check user status  │                    │
     │                    │ (must be approved) │                    │
     │                    │                    │                    │
     │                    │ BEGIN TRANSACTION  │                    │
     │                    ├───────────────────>│                    │
     │                    │                    │                    │
     │                    │ SELECT lot         │                    │
     │                    │ (FOR UPDATE)       │                    │
     │                    ├───────────────────>│                    │
     │                    │                    │                    │
     │                    │ Validate:          │                    │
     │                    │ • Auction active   │                    │
     │                    │ • Min bid met      │                    │
     │                    │ • Not self-outbid  │                    │
     │                    │                    │                    │
     │                    │ INSERT bid         │                    │
     │                    ├───────────────────>│                    │
     │                    │                    │                    │
     │                    │ UPDATE lot         │                    │
     │                    │ (current_bid)      │                    │
     │                    ├───────────────────>│                    │
     │                    │                    │                    │
     │                    │ COMMIT             │                    │
     │                    ├───────────────────>│                    │
     │                    │                    │                    │
     │ Bid confirmed      │                    │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
     │                    │ Socket.IO emit     │                    │
     │                    │ 'new-bid'          │                    │
     │<═══════════════════╪════════════════════╪═══════════════════>│
     │                    │                    │                    │
     │ Update UI          │                    │                    │ Update UI
     │ (real-time)        │                    │                    │ (real-time)
     │                    │                    │                    │
```

---

## Authentication Flow

```
USER JOURNEY
│
├── Registration
│   ├── User submits form
│   ├── Password hashed (bcrypt, 12 rounds)
│   ├── User created with status='pending'
│   └── Waits for admin approval
│
├── Admin Approval
│   ├── Admin views pending users
│   ├── Reviews user info
│   └── Approves → status='approved'
│
└── Login & Access
    ├── User enters credentials
    ├── Password verified (bcrypt.compare)
    ├── JWT token generated
    │   ├── Payload: { id, email, role, status }
    │   ├── Secret: from .env
    │   └── Expires: 7 days (configurable)
    │
    ├── Frontend stores token (localStorage)
    │
    └── Subsequent Requests
        ├── Authorization: Bearer <token>
        ├── Backend verifies token
        ├── Extracts user info
        └── Grants access based on role/status
```

---

## Real-Time Bidding (WebSocket)

```
SOCKET.IO EVENTS
│
├── Client → Server
│   ├── 'join-auction' ──────► Join room for auction updates
│   ├── 'leave-auction' ─────► Leave auction room
│   ├── 'join-lot' ──────────► Join room for specific lot
│   ├── 'leave-lot' ─────────► Leave lot room
│   └── 'place-bid' ─────────► Place bid via WebSocket
│
└── Server → Client(s)
    ├── 'new-bid' ───────────► New bid placed on lot
    ├── 'auction-updated' ───► Auction status changed
    ├── 'lot-updated' ───────► Lot status changed
    ├── 'user-joined' ───────► User joined auction room
    └── 'bid-error' ─────────► Bid validation failed
```

---

## Security Layers

```
SECURITY ARCHITECTURE
│
├── Authentication
│   ├── JWT tokens (7-day expiry)
│   ├── Bcrypt password hashing (12 rounds)
│   └── Token verification on each request
│
├── Authorization
│   ├── Role-based access (user/admin)
│   ├── Status-based access (pending/approved)
│   └── Route-level middleware protection
│
├── Input Validation
│   ├── express-validator for all inputs
│   ├── Type checking (TypeScript)
│   └── SQL injection prevention (parameterized queries)
│
├── Database Security
│   ├── Foreign key constraints
│   ├── Transaction support
│   ├── Row-level locking (FOR UPDATE)
│   └── SSL connection (production)
│
└── Network Security
    ├── CORS configured
    ├── HTTPS ready (production)
    └── Environment variables (.env)
```

---

## Deployment Architecture

```
DEVELOPMENT
├── Frontend: python -m http.server 8000
├── Backend: npm run dev (nodemon + ts-node)
└── Database: Local PostgreSQL or Supabase

PRODUCTION
├── Frontend
│   ├── Netlify / Vercel / GitHub Pages
│   ├── Static file hosting
│   └── CDN distribution
│
├── Backend
│   ├── Heroku / Railway / Render
│   ├── Node.js server
│   ├── Environment variables
│   └── Auto-scaling
│
└── Database
    ├── Supabase (managed PostgreSQL)
    ├── AWS RDS
    └── Or other PostgreSQL hosting
```

---

## File Structure Summary

```
Zauction/
│
├── frontend/                  # Static files (HTML/CSS/JS)
│   ├── pages/                 # Application pages
│   ├── js/                    # JavaScript modules
│   ├── css/                   # Stylesheets
│   └── locales/               # i18n translations
│
├── zauction-backend/          # Node.js backend
│   ├── src/                   # TypeScript source
│   │   ├── server.ts          # Entry point
│   │   ├── config/            # Configuration
│   │   ├── middleware/        # Auth middleware
│   │   ├── routes/            # API endpoints
│   │   └── socket/            # WebSocket handlers
│   ├── database/              # SQL schema
│   ├── .env                   # Environment variables
│   └── package.json           # Dependencies
│
└── Documentation
    ├── README.md              # Project overview
    ├── QUICK-START.md         # Setup guide
    ├── SETUP-COMPLETE.md      # Status summary
    ├── ARCHITECTURE.md        # This file
    └── Scripts
        ├── start.ps1          # Start both servers
        ├── check-install.ps1  # Verify prerequisites
        └── install-backend.ps1 # Install dependencies
```

---

This architecture provides a scalable, secure, and maintainable auction platform ready for production deployment!
