# Creating an Admin User for Testing

## Quick Steps

### Step 1: Set Up Database First

Before creating users, you need a database. Follow [RENDER-SETUP.md](RENDER-SETUP.md) to create a free PostgreSQL database on Render.

### Step 2: Register a User via Frontend

1. Go to http://localhost:8000/pages/register.html
2. Fill in:
   - **Name**: Admin User
   - **Email**: admin@zauction.com
   - **Password**: admin123
3. Click Register
4. You'll see: "Account created successfully! Please wait for admin approval..."

### Step 3: Make User an Admin in Database

**Option A: Using Render Web Shell**

1. Go to your database on Render dashboard
2. Click "Shell"
3. Run this SQL:
   ```sql
   UPDATE users 
   SET role = 'admin', status = 'approved' 
   WHERE email = 'admin@zauction.com';
   ```

**Option B: Using psql (if using local PostgreSQL)**

```powershell
psql -U postgres -d zauction_db -c "UPDATE users SET role = 'admin', status = 'approved' WHERE email = 'admin@zauction.com';"
```

**Option C: Using pgAdmin or DBeaver**

1. Connect to your database
2. Open SQL Editor
3. Run:
   ```sql
   UPDATE users 
   SET role = 'admin', status = 'approved' 
   WHERE email = 'admin@zauction.com';
   ```

### Step 4: Login as Admin

1. Go to http://localhost:8000/pages/login.html
2. Enter:
   - **Email**: admin@zauction.com
   - **Password**: admin123
3. Click Login
4. You should be automatically redirected to http://localhost:8000/pages/admin.html

---

## Create a Regular User Too

Follow the same process but skip the role update:

1. Register at http://localhost:8000/pages/register.html
   - Name: Test User
   - Email: user@zauction.com
   - Password: user123

2. Approve in database:
   ```sql
   UPDATE users SET status = 'approved' WHERE email = 'user@zauction.com';
   ```

Now you can login as a regular user and test bidding!

---

## Testing Different User Types

| User Type | Email | Password | Access |
|-----------|-------|----------|---------|
| Admin | admin@zauction.com | admin123 | Full admin panel access |
| User | user@zauction.com | user123 | Browse & bid only |

---

## Verify User Creation

Check your users in the database:

```sql
SELECT email, full_name, role, status, created_at 
FROM users 
ORDER BY created_at DESC;
```

Expected output:
```
email                  | full_name  | role  | status   | created_at
-----------------------|------------|-------|----------|------------------
admin@zauction.com     | Admin User | admin | approved | 2026-02-08...
user@zauction.com      | Test User  | user  | approved | 2026-02-08...
```

---

## Troubleshooting

### "Cannot connect to database"
- Make sure you've set up a database (Render or local PostgreSQL)
- Verify `DATABASE_URL` in `zauction-backend/.env`
- Restart backend: `npm run dev`

### "Email already registered"
- User already exists
- Either use different email or check database

### "Access denied. Admin privileges required"
- User role is not 'admin'
- Run the UPDATE query again to set role = 'admin'

### Login redirects to account.html instead of admin.html
- User role is 'user' not 'admin'
- Verify in database: `SELECT role FROM users WHERE email = 'admin@zauction.com';`

---

## What You Can Do as Admin

Once logged in to admin panel (http://localhost:8000/pages/admin.html):

- ✅ View dashboard statistics
- ✅ Create/Edit/Delete auctions
- ✅ Create/Edit/Delete lots
- ✅ Approve/Reject user registrations
- ✅ Manage user accounts

Regular users can:
- ✅ Browse auctions and lots
- ✅ Place bids (if approved)
- ✅ Add items to watchlist
- ✅ View their account/bids

---

## Next Steps

1. Create admin user ✅
2. Create some auctions (as admin)
3. Create lots within auctions
4. Create regular user
5. Test bidding as regular user
6. Test approval workflow

Happy testing! 🎉
