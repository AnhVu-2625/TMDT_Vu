# 🗄️ Hướng Dẫn Setup Database & API Testing

## 📋 Thứ Tự Chạy SQL Scripts

**⚠️ QUAN TRỌNG**: Chạy theo đúng thứ tự này hoặc dữ liệu sẽ không chính xác!

### 1️⃣ Tạo Schema Cơ Bản (Chắc chắn chạy trước!)
```bash
# SQL Server Management Studio: 
# Chuột phải → New Query → Mở file:
database/schema.sql

# Hoặc command line:
sqlcmd -S YOUR_SERVER_NAME -d master -i "database\schema.sql"
```
✅ Tạo database `ThuongMaiDienTu` với tất cả bảng cơ bản

---

### 2️⃣ Thêm Extension Cho Dispute & Settlement
```bash
# SQL Server Management Studio:
database/dispute_settlement_extension.sql

# Command line:
sqlcmd -S YOUR_SERVER_NAME -d ThuongMaiDienTu -i "database\dispute_settlement_extension.sql"
```
✅ Thêm cột mới: `VideoMoHang`, `VideoDongHang`, `AdminXuLy`, `DaDoiSoat`, `NgayHetHanDoiTra`, `MaPhienDoiSoat`

---

### 3️⃣ Seed Dữ Liệu Cơ Bản (Users, Shops, Products)
```bash
# SQL Server Management Studio:
database/seed.sql

# Command line:
sqlcmd -S YOUR_SERVER_NAME -d ThuongMaiDienTu -i "database\seed.sql"
```
✅ Tạo:
- 3 User test: `admin@marthub.vn`, `seller@marthub.vn`, `user@marthub.vn`
- 1 Shop: "Tech Store Official"
- 4 Products: Samsung S24, iPhone 15 Pro, MacBook Pro, Sony Headphones
- 3 Discount codes: WELCOME10, SALE50K, VIP20
- 4 VIP packages
- System policies

---

### 4️⃣ Seed Dữ Liệu Tranh Chấp & Đối Soát (Cuối cùng!)
```bash
# SQL Server Management Studio:
database/seed_dispute_settlement.sql

# Command line:
sqlcmd -S YOUR_SERVER_NAME -d ThuongMaiDienTu -i "database\seed_dispute_settlement.sql"
```
✅ Tạo:
- 3 Orders test cho "user@marthub.vn"
- 2 Disputes (tranh chấp): Một shop từ chối, một khiếu nại admin
- 1 Order sẵn sàng cho đối soát
- Lịch sử tranh chấp mẫu
- Video evidence records

---

## 🔑 Tài Khoản Test

| Role | Email | Mật Khẩu | Mục Đích |
|------|-------|----------|---------|
| Admin | `admin@marthub.vn` | `Admin@123` | Giải quyết tranh chấp, đối soát |
| Seller | `seller@marthub.vn` | `Seller@123` | Bán hàng, quản lý shop |
| Buyer | `user@marthub.vn` | `User@123` | Mua hàng, tạo disputes |

---

## ⚙️ Cấu Hình Backend

### File `.env` - Backend
```env
# Database Configuration
DB_SERVER=LAPTOP-ANHVU           # (hoặc server name của bạn)
DB_DATABASE=ThuongMaiDienTu
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=marthub_jwt_secret_key_2024_secure_random_string
JWT_EXPIRE=7d

# Email (Email OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Cài Đặt Backend
```bash
cd backend

# 1. Cài packages
npm install

# 2. Kiểm tra .env
cat .env

# 3. Chạy server
npm run dev
# Output: ✅ Server running on http://localhost:5000
```

---

## 🧪 Test API

### Bước 1: Login (Lấy Token)
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "admin@marthub.vn",
  "matKhau": "Admin@123"
}

# Response sẽ có: token (copy token này)
```

### Bước 2: Sử Dụng Token
```http
GET http://localhost:5000/api/disputes
Authorization: Bearer eyJhbGc...YOUR_TOKEN_HERE...

# Response: Danh sách tranh chấp
```

### Hoặc Dùng Test Files
```bash
# VS Code REST Client Extension

# File: backend/test-quick-start.http
# 1. Chạy: 1.1 Login với admin
# 2. Copy token → Paste vào @adminToken
# 3. Chạy các endpoint khác
```

---

## 🔍 Kiểm Tra Dữ Liệu Sau Setup

### Đếm Records
```sql
-- Kiểm tra users
SELECT COUNT(*) as TotalUsers FROM NguoiDung;
-- Expected: ≥ 3

-- Kiểm tra shops
SELECT COUNT(*) as TotalShops FROM CuaHang WHERE TrangThai = N'HOAT_DONG';
-- Expected: ≥ 1

-- Kiểm tra products
SELECT COUNT(*) as TotalProducts FROM SanPham;
-- Expected: ≥ 4

-- Kiểm tra orders (disputes)
SELECT COUNT(*) as OrdersForDisputes FROM DonHang WHERE TrangThaiDonHang = N'DA_GIAO';
-- Expected: ≥ 3

-- Kiểm tra disputes
SELECT COUNT(*) as TotalDisputes FROM YeuCauDoiTra;
-- Expected: ≥ 2
```

---

## 🐛 Troubleshooting

### Lỗi: "Column not found - VideoMoHang"
❌ Chạy `dispute_settlement_extension.sql` trước `seed_dispute_settlement.sql`
✅ Chạy theo thứ tự: schema.sql → dispute_settlement_extension.sql → seed.sql → seed_dispute_settlement.sql

### Lỗi: "Foreign Key violation"
❌ Có thể seed.sql chưa tạo xong users/shops
✅ Chạy lại seed.sql rồi sau đó seed_dispute_settlement.sql

### Lỗi: "Server error 500"
❌ .env không cấu hình đúng hoặc PORT sai
✅ Kiểm tra:
- PORT=5000 (không phải 5001)
- DB_SERVER tên máy đúng
- Database name = ThuongMaiDienTu

### Lỗi: "Token not found"
❌ HTTP header Authorization sai format
✅ Đúng format: `Authorization: Bearer YOUR_TOKEN_HERE`

---

## 📊 Dữ Liệu Có Sẵn Sau Setup

### Users
- ✅ Admin (Quản trị viên)
- ✅ Seller (Chủ shop "Tech Store Official")
- ✅ User (Người mua hàng)

### Products (Tech Store)
- ✅ Samsung Galaxy S24 Ultra (Phiên bản: 3 màu)
- ✅ iPhone 15 Pro Max (Phiên bản: 3 màu)
- ✅ MacBook Pro 14 M3 (Phiên bản: 2 màu)
- ✅ Sony WH-1000XM5 (Phiên bản: 2 màu)

### Orders & Disputes
- ✅ 3 Orders (trạng thái: DA_GIAO)
- ✅ 2 Disputes:
  - Dispute 1: Shop từ chối (SHOP_TU_CHOI)
  - Dispute 2: Khiếu nại admin (KHIEU_NAI_ADMIN)
- ✅ 1 Order ready for settlement

### Discount Codes
- ✅ WELCOME10 (Giảm 10%, tối thiểu 100k)
- ✅ SALE50K (Giảm 50k, tối thiểu 500k)
- ✅ VIP20 (Giảm 20%, tối thiểu 1M)

---

## 📝 Ghi Chú

- **LIMIT 1**: SQL Server sử dụng `TOP 1` thay vì `LIMIT 1`
- **Encoding**: Tất cả dữ liệu Vietnamese (N'...')
- **Timestamps**: Dùng `GETDATE()` (SQL Server)
- **Float types**: Dùng `DECIMAL(15,2)` cho tiền tệ

---

## ✅ Checklist Setup

- [ ] Chạy `schema.sql`
- [ ] Chạy `dispute_settlement_extension.sql`
- [ ] Chạy `seed.sql`
- [ ] Chạy `seed_dispute_settlement.sql`
- [ ] Cấu hình `.env` (PORT=5000, DB_SERVER)
- [ ] Chạy `npm install` backend
- [ ] Chạy `npm run dev`
- [ ] Test login: `admin@marthub.vn / Admin@123`
- [ ] Kiểm tra disputes API: GET `/api/disputes`
- [ ] Ready to test! 🚀
