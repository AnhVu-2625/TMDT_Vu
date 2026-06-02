# ⚡ QUICK REFERENCE - SETUP & TEST

## 📦 Database Setup (10 phút)

```sql
-- 1. Chạy schema (SQL Server Management Studio)
database/schema.sql

-- 2. Chạy extension
database/dispute_settlement_extension.sql

-- 3. Chạy seed data
database/seed.sql

-- 4. Chạy dispute data (CUỐI CÙNG)
database/seed_dispute_settlement.sql

-- 5. Optional: Fix dates
database/fix-settlement-dates.sql
```

---

## 🚀 Backend Setup (5 phút)

```bash
cd backend
npm install              # First time only
npm run dev             # Start server
# Output: ✅ Server running on http://localhost:5000
```

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@marthub.vn | Admin@123 |
| Seller | seller@marthub.vn | Seller@123 |
| Buyer | user@marthub.vn | User@123 |

---

## 🧪 Quick Test (REST Client / cURL)

### 1. Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "admin@marthub.vn",
  "matKhau": "Admin@123"
}
```
👉 Copy token từ response

### 2. Get Disputes
```http
GET http://localhost:5000/api/disputes
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Get Eligible Orders
```http
GET http://localhost:5000/api/settlements/eligible-orders
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Resolve Dispute
```http
POST http://localhost:5000/api/disputes/1/resolve
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "quyetDinh": "DONG_Y_HOAN_TIEN",
  "lyDo": "Người mua có bằng chứng video"
}
```

---

## 📊 Data Summary

- ✅ 3 Users (admin, seller, buyer)
- ✅ 1 Active Shop (Tech Store Official)
- ✅ 4 Products (Samsung, iPhone, MacBook, Sony)
- ✅ 3 Test Orders (DA_GIAO)
- ✅ 2 Test Disputes (SHOP_TU_CHOI, KHIEU_NAI_ADMIN)
- ✅ 3 Discount Codes (WELCOME10, SALE50K, VIP20)
- ✅ Ready for Settlement testing

---

## ✅ Verify Setup

```sql
-- Kiểm tra users
SELECT COUNT(*) FROM NguoiDung;
-- Should return: 3+

-- Kiểm tra disputes
SELECT * FROM YeuCauDoiTra;
-- Should return: 2 rows

-- Kiểm tra orders
SELECT COUNT(*) FROM DonHang WHERE TrangThaiDonHang = N'DA_GIAO';
-- Should return: 3+
```

---

## 🛠️ Common Fixes

| Problem | Fix |
|---------|-----|
| Port 5001 | Change `.env` PORT=5000 |
| Can't connect DB | Check DB_SERVER name, restart SQL Server |
| Column not found | Run dispute_settlement_extension.sql |
| No disputes in API | Run seed_dispute_settlement.sql |
| Token error | Login again to get fresh token |

---

## 📖 Full Guides

- 📘 Setup Details: `DATABASE_SETUP.md`
- 🐛 Troubleshooting: `TROUBLESHOOTING.md`
- 📋 Complete Review: `REVIEW_REPORT.md`

---

## 🎯 API Endpoints Available

```
Auth:
  POST /api/auth/login
  POST /api/auth/register
  POST /api/auth/verify-otp

Products:
  GET  /api/products
  GET  /api/products/:id

Orders:
  POST /api/orders
  GET  /api/orders

Disputes (Admin):
  GET    /api/disputes
  GET    /api/disputes/:id
  POST   /api/disputes/:id/resolve

Settlement (Admin):
  GET    /api/settlements/eligible-orders
  GET    /api/settlements
  POST   /api/settlements
  POST   /api/settlements/:id/execute
```

---

## 🔐 Security Notes

- JWT expires in 7 days
- All passwords hashed with bcrypt
- Database uses Unicode (N'...' for Vietnamese)
- CORS enabled for frontend origins

---

## 📞 Need Help?

1. Check `TROUBLESHOOTING.md`
2. Verify database setup order
3. Check `.env` configuration
4. Review console logs (backend terminal)
5. Run verification queries

---

**Ready to test? Start with Database Setup! 🚀**
