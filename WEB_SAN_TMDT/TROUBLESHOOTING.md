# 🐛 HƯỚNG DẪN TROUBLESHOOTING

## Các Lỗi Phổ Biến & Cách Khắc Phục

---

## 1️⃣ **API Connection Errors**

### Lỗi: `Cannot connect to http://localhost:5000`
```
Error: ECONNREFUSED 127.0.0.1:5000
```

**Nguyên nhân:**
- Backend chưa chạy
- Port sai (5001 thay vì 5000)
- Firewall block

**Sửa:**
```bash
# 1. Kiểm tra backend đã chạy?
npm run dev

# 2. Kiểm tra port trong .env
cat backend/.env | grep PORT
# Phải là: PORT=5000

# 3. Restart backend
# Ctrl+C rồi npm run dev
```

---

## 2️⃣ **Database Connection Errors**

### Lỗi: `Error: No connection available for acquiring`
```
Error: NoAuthentication: No authentication supplied in this login attempt
```

**Nguyên nhân:**
- `DB_SERVER` name sai
- SQL Server không chạy
- Windows credentials không match

**Sửa:**
```bash
# 1. Kiểm tra tên server
hostname  # Phải match DB_SERVER

# 2. Kiểm tra SQL Server running
# Windows: Services > SQL Server (MSSQLSERVER) > Status

# 3. Update .env
DB_SERVER=YOUR_ACTUAL_SERVER_NAME

# 4. Restart backend
npm run dev
```

### Lỗi: `Object reference not set to an instance of an object`
**Nguyên nhân:** Database name sai hoặc chưa tạo
```bash
# Kiểm tra database tồn tại:
sqlcmd -S YOUR_SERVER -E -Q "SELECT name FROM sys.databases WHERE name = 'ThuongMaiDienTu'"

# Nếu không có, chạy schema.sql
```

---

## 3️⃣ **Database Schema Errors**

### Lỗi: `Invalid column name 'VideoMoHang'`
```
Msg 207, Level 16, State 1
Invalid column name 'VideoMoHang'
```

**Nguyên nhân:** Chưa chạy `dispute_settlement_extension.sql`

**Sửa:**
```bash
# Đảm bảo chạy đúng thứ tự:
1. database/schema.sql
2. database/dispute_settlement_extension.sql  ← Quan trọng!
3. database/seed.sql
4. database/seed_dispute_settlement.sql
```

### Lỗi: `Foreign Key constraint failed`
```
The INSERT, UPDATE, or DELETE statement conflicted with a FOREIGN KEY constraint
```

**Nguyên nhân:** Seed order sai hoặc thiếu dữ liệu parent

**Sửa:**
```bash
# 1. Kiểm tra users tồn tại
SELECT * FROM NguoiDung WHERE Email = 'seller@marthub.vn';

# 2. Kiểm tra shop tồn tại
SELECT * FROM CuaHang WHERE TenCuaHang = N'Tech Store Official';

# 3. Re-run seed.sql sau đó seed_dispute_settlement.sql
```

---

## 4️⃣ **API Response Errors**

### Lỗi: `Unexpected token in JSON`
```
SyntaxError: Unexpected token < in JSON at position 0
```

**Nguyên nhân:** API trả HTML error thay vì JSON

**Sửa:**
```bash
# 1. Kiểm tra console backend error
# Look for: Error: ... (chi tiết lỗi)

# 2. Kiểm tra token valid
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/disputes

# 3. Check API Swagger docs
http://localhost:5000/api-docs
```

### Lỗi: `401 Unauthorized`
```json
{
  "success": false,
  "message": "Không tìm thấy token xác thực"
}
```

**Nguyên nhân:** 
- Không gửi Authorization header
- Token expired
- Token format sai

**Sửa:**
```bash
# 1. Login để lấy token mới
POST /api/auth/login
{
  "emailOrPhone": "admin@marthub.vn",
  "matKhau": "Admin@123"
}

# 2. Sử dụng token đúng format
Authorization: Bearer eyJhbGc... (với "Bearer ")

# 3. Kiểm tra token chưa expired
# Token valid 7 days từ lúc login
```

### Lỗi: `400 Bad Request`
```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```

**Nguyên nhân:** Request body sai format

**Sửa:**
```bash
# 1. Kiểm tra Content-Type header
Content-Type: application/json

# 2. Kiểm tra JSON format
POST /api/disputes/1/resolve
{
  "quyetDinh": "DONG_Y_HOAN_TIEN",
  "lyDo": "Lý do ở đây"
}

# 3. Sử dụng đúng quyền (Admin endpoint)
```

---

## 5️⃣ **Dispute & Settlement Specific**

### Lỗi: `Disputes list trống`
```json
{
  "success": true,
  "data": []
}
```

**Nguyên nhân:** Seed data chưa chạy hoặc không tạo disputes

**Sửa:**
```bash
# 1. Kiểm tra orders tồn tại
SELECT COUNT(*) FROM DonHang WHERE TrangThaiDonHang = N'DA_GIAO';

# 2. Kiểm tra disputes
SELECT * FROM YeuCauDoiTra;

# 3. Nếu không có, re-run:
database/seed_dispute_settlement.sql
```

### Lỗi: `Cannot resolve dispute - No orders found`
**Nguyên nhân:** Orders chưa tạo hoặc status sai

**Sửa:**
```sql
-- Kiểm tra orders
SELECT 
    MaDonHang, 
    TrangThaiDonHang, 
    TrangThaiThanhToan, 
    NgayHetHanDoiTra
FROM DonHang 
WHERE TrangThaiDonHang = N'DA_GIAO' 
AND TrangThaiThanhToan = N'DA_THANH_TOAN';

-- Phải có ít nhất 3 orders
-- Nếu không, update manually:
UPDATE TOP (3) DonHang
SET TrangThaiDonHang = N'DA_GIAO',
    TrangThaiThanhToan = N'DA_THANH_TOAN',
    NgayHetHanDoiTra = DATEADD(DAY, -1, GETDATE())
WHERE TrangThaiDonHang IN (N'CHO_XAC_NHAN', N'DA_XAC_NHAN');
```

---

## 6️⃣ **Character Encoding Issues**

### Lỗi: Tiếng Việt hiển thị `?????`
**Nguyên nhân:** Encoding mismatch

**Sửa:**
```bash
# 1. Backend response header đã set UTF-8
# ✅ Đã cấu hình trong server.js:
# res.setHeader('Content-Type', 'application/json; charset=utf-8');

# 2. Database dùng Unicode
# ✅ Tất cả strings dùng N'...'

# 3. Frontend Axios config
axios.defaults.headers.common['Accept-Charset'] = 'utf-8';
```

---

## 7️⃣ **Performance Issues**

### Lỗi: API response rất chậm (> 5 giây)
**Nguyên nhân:** Database không indexing hoặc query phức tạp

**Sửa:**
```sql
-- Kiểm tra indexes được tạo
SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('DonHang');

-- Nếu không có, run schema.sql lại
-- Schema có tạo 16 indexes

-- Check query performance
SET STATISTICS IO ON;
SELECT ... -- Your query
SET STATISTICS IO OFF;
-- Look for: Scan count, Logical reads
```

---

## 8️⃣ **File Upload Issues**

### Lỗi: Hình ảnh không upload được
```
Error: ENOENT: no such file or directory
```

**Nguyên nhân:** Upload folder không tồn tại

**Sửa:**
```bash
# Tạo thư mục uploads
mkdir -p backend/uploads/shops

# Hoặc backend sẽ tạo tự động nếu cấu hình benar:
# multer automatically creates if not exists
```

---

## 🔧 Debug Commands

```bash
# 1. Kiểm tra Node.js version
node --version  # Phải >= 16.x

# 2. Kiểm tra npm packages
npm list mssql  # Phải cài v8.x

# 3. Kiểm tra SQL Server
sqlcmd -S YOUR_SERVER -E -Q "SELECT @@VERSION"

# 4. Kiểm tra database
sqlcmd -S YOUR_SERVER -E -Q "SELECT COUNT(*) FROM ThuongMaiDienTu.dbo.NguoiDung"

# 5. Test API health
curl http://localhost:5000/api/health

# 6. View logs
# Frontend: Browser DevTools → Console
# Backend: Terminal console
```

---

## 📞 Khi Cần Help

**Kiểm tra trước:**
1. Lỗi chính xác là gì? (Copy full error message)
2. File log nào? (terminal output)
3. Bước nào sai? (schema → seed → test?)
4. Đã chạy đúng SQL order?
5. Database có dữ liệu? (SELECT COUNT(*) ...)

**Thông tin cần cung cấp:**
```
- Node.js version: node --version
- SQL Server version: SELECT @@VERSION
- Error message: [copy full]
- API endpoint gọi: [copy]
- Request body: [copy]
- Response: [copy]
```

---

## ✅ Verify Setup Complete

Chạy những command này để verify:

```bash
# 1. Backend running?
curl http://localhost:5000/api/health
# Expected: {"status": "API is running ✅", ...}

# 2. Database connected?
# Check backend console: "✅ Database connected successfully"

# 3. Users created?
SELECT COUNT(*) FROM NguoiDung;  -- Expected: ≥ 3

# 4. Disputes ready?
SELECT COUNT(*) FROM YeuCauDoiTra;  -- Expected: ≥ 2

# 5. Can login?
POST /api/auth/login
{
  "emailOrPhone": "admin@marthub.vn",
  "matKhau": "Admin@123"
}
# Expected: 200 OK with token
```

✅ Nếu tất cả passed → Ready to test! 🚀
