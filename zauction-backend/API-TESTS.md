# Zauction API Test Suite

This file contains test commands for all API endpoints.

## Prerequisites

1. Backend server running on http://localhost:3000
2. Database set up with schema
3. PowerShell terminal

## Test Commands

### 1. Health Check

```powershell
curl http://localhost:3000/health
```

Expected: `{"status":"ok","timestamp":"..."}`

---

### 2. User Registration

```powershell
# Register a regular user
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"buyer@example.com\",\"password\":\"password123\",\"full_name\":\"John Buyer\"}'

# Register an admin user
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\",\"full_name\":\"Admin User\"}'
```

Expected: Success message with user data

**Note:** Users are created with `pending` status by default.

---

### 3. Approve User (Database)

Run this SQL in your database to approve and make a user an admin:

```sql
-- Approve regular user
UPDATE users SET status = 'approved' WHERE email = 'buyer@example.com';

-- Make admin user
UPDATE users SET role = 'admin', status = 'approved' WHERE email = 'admin@example.com';
```

---

### 4. User Login

```powershell
# Login as regular user
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"buyer@example.com\",\"password\":\"password123\"}'

# Login as admin
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\"}'
```

Expected: Returns JWT token

**Save the token for authenticated requests!**

---

### 5. Get Current User

```powershell
curl http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 6. Create Auction (Admin)

```powershell
$token = "YOUR_ADMIN_TOKEN_HERE"

curl -X POST http://localhost:3000/api/admin/auctions `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{
    \"title\": \"Fine Art & Antiques\",
    \"description\": \"Monthly auction featuring European paintings and antique furniture\",
    \"category\": \"Fine Art\",
    \"location\": \"London, UK\",
    \"start_date\": \"2026-03-01T10:00:00Z\",
    \"end_date\": \"2026-03-15T20:00:00Z\",
    \"buyers_premium\": 25.00,
    \"featured\": true
  }'
```

---

### 7. Get All Auctions (Public)

```powershell
# All active auctions
curl http://localhost:3000/api/auctions

# Featured auctions only
curl "http://localhost:3000/api/auctions?featured=true"

# By status
curl "http://localhost:3000/api/auctions?status=upcoming"
```

---

### 8. Get Single Auction

```powershell
curl http://localhost:3000/api/auctions/AUCTION_ID_HERE
```

---

### 9. Create Lot (Admin)

```powershell
$token = "YOUR_ADMIN_TOKEN_HERE"
$auctionId = "YOUR_AUCTION_ID"

curl -X POST http://localhost:3000/api/admin/lots `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d "{
    \"auction_id\": \"$auctionId\",
    \"lot_number\": 1,
    \"title\": \"18th Century French Clock\",
    \"description\": \"Rare Louis XVI bronze and marble clock\",
    \"category\": \"Clocks\",
    \"condition\": \"Excellent\",
    \"provenance\": \"Private European collection\",
    \"estimate_low\": 5000,
    \"estimate_high\": 8000,
    \"starting_bid\": 4000,
    \"reserve_price\": 4500,
    \"bid_increment\": 500
  }"
```

---

### 10. Get Auction Lots

```powershell
curl http://localhost:3000/api/auctions/AUCTION_ID/lots
```

---

### 11. Get Single Lot

```powershell
curl http://localhost:3000/api/lots/LOT_ID
```

---

### 12. Place Bid (Authenticated User)

```powershell
$token = "YOUR_USER_TOKEN"
$lotId = "YOUR_LOT_ID"

curl -X POST http://localhost:3000/api/bids `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d "{
    \"lot_id\": \"$lotId\",
    \"amount\": 4500
  }"
```

---

### 13. Get Bid History

```powershell
curl http://localhost:3000/api/lots/LOT_ID/bids
```

---

### 14. Watchlist Operations

```powershell
$token = "YOUR_USER_TOKEN"
$lotId = "YOUR_LOT_ID"

# Add to watchlist
curl -X POST http://localhost:3000/api/watchlist `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d "{\"lot_id\": \"$lotId\"}"

# Get watchlist
curl http://localhost:3000/api/watchlist `
  -H "Authorization: Bearer $token"

# Remove from watchlist
curl -X DELETE http://localhost:3000/api/watchlist/$lotId `
  -H "Authorization: Bearer $token"
```

---

### 15. Admin User Management

```powershell
$token = "YOUR_ADMIN_TOKEN"

# Get all users
curl http://localhost:3000/api/admin/users `
  -H "Authorization: Bearer $token"

# Get pending users
curl "http://localhost:3000/api/admin/users?status=pending" `
  -H "Authorization: Bearer $token"

# Approve user
$userId = "USER_ID_HERE"
curl -X PUT http://localhost:3000/api/admin/users/$userId/approve `
  -H "Authorization: Bearer $token"

# Reject user
curl -X PUT http://localhost:3000/api/admin/users/$userId/reject `
  -H "Authorization: Bearer $token"

# Suspend user
curl -X PUT http://localhost:3000/api/admin/users/$userId/suspend `
  -H "Authorization: Bearer $token"
```

---

## WebSocket Testing (Live Bidding)

Use a WebSocket client or browser console:

```javascript
// In browser console (with Socket.IO client loaded)
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Join auction room
socket.emit('join-auction', 'AUCTION_ID');

// Join lot room
socket.emit('join-lot', 'LOT_ID');

// Listen for bid updates
socket.on('new-bid', (data) => {
  console.log('New bid:', data);
});

// Listen for auction updates
socket.on('auction-updated', (data) => {
  console.log('Auction updated:', data);
});
```

---

## Complete Test Flow

### Step 1: Create Admin
```powershell
# 1. Register
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@test.com\",\"password\":\"admin123\",\"full_name\":\"Admin User\"}'

# 2. Update in database
# UPDATE users SET role = 'admin', status = 'approved' WHERE email = 'admin@test.com';

# 3. Login and get token
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@test.com\",\"password\":\"admin123\"}'
```

### Step 2: Create Auction
```powershell
# Save admin token
$adminToken = "PASTE_TOKEN_HERE"

# Create auction
curl -X POST http://localhost:3000/api/admin/auctions `
  -H "Authorization: Bearer $adminToken" `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Test Auction\",\"start_date\":\"2026-02-10T10:00:00Z\",\"end_date\":\"2026-02-20T20:00:00Z\"}'
```

### Step 3: Create Lots
```powershell
# Save auction ID from previous response
$auctionId = "PASTE_AUCTION_ID"

# Create lot
curl -X POST http://localhost:3000/api/admin/lots `
  -H "Authorization: Bearer $adminToken" `
  -H "Content-Type: application/json" `
  -d "{\"auction_id\":\"$auctionId\",\"lot_number\":1,\"title\":\"Test Item\",\"starting_bid\":1000,\"bid_increment\":100}"
```

### Step 4: Create Regular User
```powershell
# Register
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"buyer@test.com\",\"password\":\"buyer123\",\"full_name\":\"Test Buyer\"}'

# Approve in database
# UPDATE users SET status = 'approved' WHERE email = 'buyer@test.com';

# Login
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"buyer@test.com\",\"password\":\"buyer123\"}'
```

### Step 5: Place Bids
```powershell
# Save user token and lot ID
$userToken = "PASTE_USER_TOKEN"
$lotId = "PASTE_LOT_ID"

# Place bid
curl -X POST http://localhost:3000/api/bids `
  -H "Authorization: Bearer $userToken" `
  -H "Content-Type: application/json" `
  -d "{\"lot_id\":\"$lotId\",\"amount\":1000}"
```

---

## Troubleshooting

### "Connection refused"
- Backend server is not running
- Wrong port number

### "Invalid token"
- Token expired (7 days default)
- Wrong token format
- Missing "Bearer " prefix

### "Account not approved"
- User status is still "pending"
- Run SQL to approve: `UPDATE users SET status = 'approved' WHERE email = 'your@email.com'`

### "Minimum bid is $X"
- Your bid is too low
- Check current_bid + bid_increment

### Database errors
- Check if PostgreSQL is running
- Verify schema was created
- Check .env configuration

---

## Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Server health check |
| `/api/auth/register` | POST | No | Register new user |
| `/api/auth/login` | POST | No | Login user |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/auctions` | GET | No | Get all auctions |
| `/api/auctions/:id` | GET | No | Get single auction |
| `/api/auctions/:id/lots` | GET | No | Get auction lots |
| `/api/lots/:id` | GET | No | Get lot details |
| `/api/bids` | POST | Yes (Approved) | Place bid |
| `/api/watchlist` | GET/POST/DELETE | Yes | Manage watchlist |
| `/api/admin/*` | ALL | Admin | Admin operations |
