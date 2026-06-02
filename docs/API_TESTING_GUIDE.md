# 🧪 API Testing Guide - Complete Walkthrough

**Swagger URL:** http://localhost:5000/api-docs

## Prerequisites

✅ Backend server running on http://localhost:5000
✅ Database initialized with schema.sql and seed.sql
✅ Test accounts created in database

---

## Test Accounts (from seed.sql)

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@marthub.vn | Admin@123 | Admin features testing |
| User | user@marthub.vn | User@123 | User features testing |
| Seller | seller@marthub.vn | Seller@123 | Seller dashboard testing |

---

## Phase 1: Authentication Testing

### 1.1 User Login 

**Endpoint:** `POST /api/auth/login`

**In Swagger UI:**
1. Click on `POST /api/auth/login` to expand it
2. Click "Try it out" button
3. In the Request body, enter:
```json
{
  "emailOrPhone": "user@marthub.vn",
  "matKhau": "User@123"
}
```
4. Click "Execute"
5. **Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "hoTen": "User Test",
    "email": "user@marthub.vn",
    "vaiTro": "NGUOI_DUNG"
  }
}
```

**Save this token!** You'll need it for authorized requests.

### 1.2 Admin Login

**Endpoint:** `POST /api/auth/login`

1. Click "Try it out"
2. Enter:
```json
{
  "emailOrPhone": "admin@marthub.vn",
  "matKhau": "Admin@123"
}
```
3. Click "Execute"
4. **Expected Response:** Status 200 with admin token
5. Save this token for admin testing

### 1.3 Seller Login

**Endpoint:** `POST /api/auth/login`

1. Click "Try it out"
2. Enter:
```json
{
  "emailOrPhone": "seller@marthub.vn",
  "matKhau": "Seller@123"
}
```
3. Click "Execute"
4. Save seller token

---

## Phase 2: User Features Testing

### 2.1 Get Current User Information

**Endpoint:** `GET /api/user/profile` (or similar - check Swagger)

**In Swagger UI:**
1. Find the GET /api/user/profile endpoint
2. Click "Try it out"
3. Scroll down to find the Authorization section
4. There should be a "Bearer" token field - paste your user token there
5. Click "Execute"
6. **Expected Response:** Status 200 with user profile data

### 2.2 Get VIP Packages (No Auth Required)

**Endpoint:** `GET /api/user/vip-packages`

1. Find and expand the endpoint
2. Click "Try it out"
3. Click "Execute" (no authentication needed)
4. **Expected Response:** Status 200 with array of VIP packages:
```json
[
  {
    "maGiaDichVu": 1,
    "tenGoi": "Bạc",
    "giaTien": 99000,
    "thoiGianDangKy": 30,
    "loiIch": "5% discount"
  },
  // ... more packages
]
```

### 2.3 Subscribe to VIP Package

**Endpoint:** `POST /api/user/vip/subscribe`

**Steps:**
1. Click "Try it out"
2. Add your user token to Authorization
3. In Request body, enter:
```json
{
  "maGiaDichVu": 1
}
```
4. Click "Execute"
5. **Expected Response:** Status 200 with success message

**Check Results:** 
- Log in again and verify VIP status is active
- Check VIP dashboard for activated package

### 2.4 Get User VIP Status

**Endpoint:** `GET /api/user/vip-status`

1. Click "Try it out"
2. Add user token to Authorization
3. Click "Execute"
4. **Expected Response:** Status 200 with VIP status details

### 2.5 Get User Points

**Endpoint:** `GET /api/user/points`

1. Click "Try it out"
2. Add user token
3. Click "Execute"
4. **Expected Response:**
```json
{
  "success": true,
  "currentPoints": 100,  // From VIP subscription
  "message": "Points retrieved successfully"
}
```

### 2.6 Get Points History

**Endpoint:** `GET /api/user/points/history?page=1&limit=10`

1. Click "Try it out"
2. Add user token
3. Optional: modify page and limit parameters
4. Click "Execute"
5. **Expected Response:** Shows point transactions including VIP signup

### 2.7 Get User Rank

**Endpoint:** `GET /api/user/rank`

1. Click "Try it out"
2. Add user token
3. Click "Execute"
4. **Expected Response:** User's current rank based on points:
```json
{
  "maHang": 1,
  "tenHang": "Thường",
  "diemToiThieu": 0,
  "phanTramGiamGia": 0
}
```

### 2.8 Get All Available Ranks

**Endpoint:** `GET /api/user/ranks/all` (No auth required)

1. Click "Try it out"
2. Click "Execute"
3. **Expected Response:** All member ranks

---

## Phase 3: Admin Features Testing

### 3.1 Get System Statistics

**Endpoint:** `GET /api/admin/statistics`

**Steps:**
1. Find the endpoint in Swagger
2. Click "Try it out"
3. Add your **admin token** to Authorization
4. Click "Execute"
5. **Expected Response:** Status 200 with statistics:
```json
{
  "success": true,
  "data": {
    "totalUsers": 3,
    "lockedUsers": 0,
    "totalOrders": 0,
    "totalRevenue": 0,
    "pendingReports": 0,
    "pendingWithdrawals": 0,
    "totalShops": 1,
    "pendingDisputes": 0
  }
}
```

### 3.2 Get All Users (With Pagination)

**Endpoint:** `GET /api/admin/users?page=1&limit=10`

**Steps:**
1. Click "Try it out"
2. Add admin token
3. Optional parameters:
   - `page`: Page number (default 1)
   - `limit`: Items per page (default 20)
   - `search`: Search by name/email
   - `status`: Filter by status (HOAT_DONG/BI_KHOA)
4. Click "Execute"
5. **Expected Response:** Paginated user list

### 3.3 Lock a User Account

**Endpoint:** `PUT /api/admin/users/{userId}/lock`

**Steps:**
1. From previous user listing, note a user's ID (not admin)
2. Find and expand PUT endpoint
3. Click "Try it out"
4. Enter user ID in the path parameter
5. Add admin token
6. Click "Execute"
7. **Expected Response:** Success message

### 3.4 Unlock a User Account

**Endpoint:** `PUT /api/admin/users/{userId}/unlock`

**Steps:**
1. Same as above but with the unlock endpoint
2. This reverses the lock

### 3.5 Send Notification (Admin)

**Endpoint:** `POST /api/admin/send-notification`

**Steps:**
1. Click "Try it out"
2. Add admin token
3. In Request body:
```json
{
  "userId": 2,
  "tieuDe": "Test Notification",
  "noiDung": "This is a test notification from admin"
}
```
4. Click "Execute"
5. **Expected Response:** Success message

---

## Phase 4: Products Testing

### 4.1 Get All Products (Public)

**Endpoint:** `GET /api/products?page=1&limit=20`

**Steps:**
1. Click "Try it out"
2. Optional filters:
   - `page`: Page number
   - `limit`: Items per page
   - `danhMucId`: Filter by category ID
   - `search`: Search by product name
3. Click "Execute"
4. **Expected Response:** List of products (currently may be empty)

### 4.2 Get Product Categories

**Endpoint:** `GET /api/products/categories/all`

**Steps:**
1. Click "Try it out"
2. Click "Execute"
3. **Expected Response:** All available product categories

### 4.3 Create Product (Seller)

**Endpoint:** `POST /api/products`

**Steps:**
1. Click "Try it out"
2. Add **seller token** to Authorization
3. Request body:
```json
{
  "tenSanPham": "Test Product",
  "moTa": "This is a test product",
  "gia": 100000,
  "danhMucId": 1,
  "soLuongTon": 50,
  "hinhAnh": "https://via.placeholder.com/300"
}
```
4. Click "Execute"
5. **Expected Response:** Created product with ID

---

## Phase 5: Notifications Testing

### 5.1 Submit a Report

**Endpoint:** `POST /api/notification/report`

**Steps:**
1. Click "Try it out"
2. Add user token
3. Request body:
```json
{
  "loaiBaoCao": "SAN_PHAM_KHONG_HOP_LE",
  "moTaChiTiet": "This product violates policies",
  "maThamChieu": 1,
  "loaiMaThamChieu": "SAN_PHAM"
}
```
4. Click "Execute"
5. **Expected Response:** Success message with report ID

### 5.2 Get User Notifications

**Endpoint:** `GET /api/notification/?page=1&limit=10`

**Steps:**
1. Click "Try it out"
2. Add user token
3. Click "Execute"
4. **Expected Response:** List of user notifications

### 5.3 Get Unread Count

**Endpoint:** `GET /api/notification/unread/count`

**Steps:**
1. Click "Try it out"
2. Add user token
3. Click "Execute"
4. **Expected Response:**
```json
{
  "unreadCount": 0
}
```

---

## Curl Command Examples (Alternative Testing Method)

If you prefer command-line testing instead of Swagger UI:

### Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "user@marthub.vn",
    "matKhau": "User@123"
  }'
```

### Get User Profile (with token)
```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Subscribe to VIP
```bash
curl -X POST http://localhost:5000/api/user/vip/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "maGiaDichVu": 1
  }'
```

### Admin Statistics
```bash
curl -X GET http://localhost:5000/api/admin/statistics \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

## Testing Checklist

Use this checklist to verify all features work:

### Authentication ✓
- [ ] User login successful
- [ ] Admin login successful
- [ ] Seller login successful
- [ ] Tokens are returned and valid

### User Features ✓
- [ ] Can view profile
- [ ] Can view VIP packages
- [ ] Can subscribe to VIP
- [ ] Can view current points
- [ ] Can view points history
- [ ] Can view user rank
- [ ] Can view all ranks

### Admin Features ✓
- [ ] Can view statistics
- [ ] Can list all users
- [ ] Can lock/unlock users
- [ ] Can send notifications
- [ ] Can view reports
- [ ] Can view disputes

### Products ✓
- [ ] Can view products
- [ ] Can view categories
- [ ] Seller can create products

### Notifications ✓
- [ ] Can submit reports
- [ ] Can view notifications
- [ ] Can check unread count

---

## Common Issues & Solutions

### "Unauthorized" Response
- **Problem:** Token missing or invalid
- **Solution:** Make sure Authorization header has `Bearer YOUR_TOKEN_HERE`

### "Internal Server Error"
- **Problem:** Database not connected
- **Solution:** Check database setup is complete and backend shows "Connected to database"

### "Invalid Token"
- **Problem:** Token expired or corrupted
- **Solution:** Log in again to get a fresh token

### CORS Errors
- **Problem:** Frontend trying to call API
- **Solution:** Verify FRONTEND_URL in .env matches frontend origin

---

## Next Steps

✅ Once all tests pass:
1. Database is fully functional
2. All API endpoints working
3. Ready to build frontend

→ **Next:** [Frontend Development Guide](FRONTEND_GUIDE.md)
