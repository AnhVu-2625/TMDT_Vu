# 🗄️ Database Setup Guide

The backend API is running on `http://localhost:5000`, but the database needs to be initialized for full functionality.

## Current Status
- ✅ Backend server running on port 5000
- ✅ Swagger UI accessible at http://localhost:5000/api-docs
- ❌ Database connection: Failed (needs setup)

## Option 1: Using Windows Authentication (Recommended for Local Development)

If you have SQL Server installed locally with Windows authentication access:

### Step 1: Create Database Using SQL Server Management Studio (SSMS)

```sql
-- Connect to SQL Server using Windows Authentication
-- Then run this script to create the database

CREATE DATABASE ThuongMaiDienTu;
GO
```

### Step 2: Run Database Schema Script

1. Open [database/schema.sql](../database/schema.sql) in SSMS
2. Make sure you're connected to the `ThuongMaiDienTu` database
3. Execute the entire script (Ctrl+A, then Ctrl+E)
4. Wait for all tables to be created successfully

### Step 3: Seed Initial Data

1. Open [database/seed.sql](../database/seed.sql) in SSMS
2. Make sure you're connected to the `ThuongMaiDienTu` database
3. Execute the entire script
4. Wait for data insertion to complete

### Step 4: Restart Backend Server

The backend will automatically connect once the database is ready. You should see:
```
✅ Connected to database
🚀 Server running on http://localhost:5000
```

---

## Option 2: Using SQL Server Authentication (If Using SQL Server Express/Developer Edition)

If you prefer SQL Server Authentication with sa user:

### Step 1: Update .env File

Edit `backend/.env`:
```
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourPassword123  # Your SQL Server sa password
DB_NAME=ThuongMaiDienTu
DB_PORT=1433
```

### Step 2: Create Database Via SQL Query

```sql
-- Connect with SA user
CREATE DATABASE ThuongMaiDienTu;
GO
USE ThuongMaiDienTu;
GO
```

### Step 3: Run Schema and Seed Scripts

Same as Option 1, steps 2-3 above.

---

## Test Data After Seeding

Once the database is set up, you'll have these test accounts:

### Admin Account
- **Email:** admin@marthub.vn
- **Password:** Admin@123
- **Role:** QUAN_TRI_VIEN (Admin)

### Regular User Account  
- **Email:** user@marthub.vn
- **Password:** User@123
- **Role:** NGUOI_DUNG (User)

### Seller Account
- **Email:** seller@marthub.vn
- **Password:** Seller@123
- **Role:** NGUOI_DUNG (User with shop)

---

## VIP Packages Available

After seeding, these VIP packages will be available:

| Package | Price | Duration | Discount | Bonus Points |
|---------|-------|----------|----------|--------------|
| **Bạc** (Silver) | 99,000 VNĐ | 30 days | 5% | 100 |
| **Vàng** (Gold) | 199,000 VNĐ | 30 days | 10% | 200 |
| **Bạch Kim** (Platinum) | 399,000 VNĐ | 30 days | 15% | 500 |
| **Ngàn Sao** (Platinum Plus) | 999,000 VNĐ | 30 days | 20% | 1000 |

---

## Troubleshooting

### "Login failed for user ''"
- Indicates Windows Authentication is not working
- **Solution:** Ensure SQL Server is running and accessible
- **Alternative:** Switch to Option 2 (SQL Server Authentication)

### "Cannot open database"
- Database doesn't exist yet
- **Solution:** Run `CREATE DATABASE ThuongMaiDienTu;` first

### "Invalid column name"
- Schema script wasn't executed properly
- **Solution:** Re-run the entire schema.sql script from the beginning

### Connection timeout
- SQL Server might not be running or firewall is blocking port 1433
- **Solution:** 
  - Check SQL Server is running (Windows Services)
  - Verify port 1433 is not blocked by firewall

---

## Next Steps

Once database is set up and backend shows connection success:

1. ✅ Database initialized with all tables and seed data
2. 🔄 Run API Testing Guide (see TESTING_GUIDE.md)
3. 🔄 Begin Frontend Development
