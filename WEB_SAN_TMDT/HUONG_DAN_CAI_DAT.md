# Hướng dẫn kết nối Backend với SQL Server

## Bước 1: Cài đặt SQL Server

### 1.1. Tải SQL Server
- Tải SQL Server 2019 Express: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
- Hoặc SQL Server 2022 Developer Edition (miễn phí)

### 1.2. Cài đặt SQL Server Management Studio (SSMS)
- Tải SSMS: https://aka.ms/ssmsfullsetup
- Cài đặt và khởi động SSMS

### 1.3. Kết nối SQL Server
1. Mở SSMS
2. Server name: `localhost` hoặc `.\SQLEXPRESS` hoặc `(localdb)\MSSQLLocalDB`
3. Authentication: `Windows Authentication` hoặc `SQL Server Authentication`
4. Click **Connect**

## Bước 2: Tạo Database

### 2.1. Tạo Database từ SSMS
```sql
-- Mở New Query trong SSMS và chạy:
CREATE DATABASE ThuongMaiDienTu;
GO
```

### 2.2. Chạy Schema
1. Mở file `database/schema.sql`
2. Copy toàn bộ nội dung
3. Paste vào SSMS Query Window
4. Nhấn F5 hoặc Execute để chạy

### 2.3. Kiểm tra Database
```sql
USE ThuongMaiDienTu;
GO

-- Xem danh sách tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';
```

## Bước 3: Cấu hình Backend

### 3.1. Tạo file .env
```bash
cd backend
copy .env.example .env
```

### 3.2. Cập nhật thông tin kết nối trong .env

**Nếu dùng Windows Authentication:**
```env
DB_SERVER=localhost
DB_DATABASE=ThuongMaiDienTu
DB_USER=
DB_PASSWORD=
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

JWT_SECRET=my_super_secret_jwt_key_2024_ecommerce_platform
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@ecommerce.com

SOCKET_CORS_ORIGIN=http://localhost:3000
```

**Nếu dùng SQL Server Authentication:**
```env
DB_SERVER=localhost
DB_DATABASE=ThuongMaiDienTu
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

JWT_SECRET=my_super_secret_jwt_key_2024_ecommerce_platform
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@ecommerce.com

SOCKET_CORS_ORIGIN=http://localhost:3000
```

### 3.3. Cài đặt Dependencies
```bash
cd backend
npm install
```

### 3.4. Khởi động Backend
```bash
npm run dev
```

Nếu thành công, bạn sẽ thấy:
```
✅ Kết nối database thành công!
🚀 Server đang chạy tại port 5000
🌐 Environment: development
```

## Bước 4: Test API với Postman hoặc Thunder Client

### 4.1. Cài đặt Postman
- Tải Postman: https://www.postman.com/downloads/
- Hoặc dùng Thunder Client extension trong VS Code

### 4.2. Test Health Check
```
GET http://localhost:5000/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4.3. Test Đăng ký tài khoản
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "hoTen": "Nguyen Van A",
  "email": "test@example.com",
  "soDienThoai": "0123456789",
  "matKhau": "123456"
}
```

Response thành công:
```json
{
  "success": true,
  "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
  "data": {
    "maNguoiDung": 1,
    "email": "test@example.com"
  }
}
```

### 4.4. Test Xác thực OTP
```
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456"
}
```

### 4.5. Test Đăng nhập
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "test@example.com",
  "matKhau": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "maNguoiDung": 1,
      "hoTen": "Nguyen Van A",
      "email": "test@example.com",
      "vaiTro": "NGUOI_DUNG"
    }
  }
}
```

### 4.6. Test API có Authentication
```
GET http://localhost:5000/api/products
Authorization: Bearer YOUR_TOKEN_HERE
```

## Bước 5: Khắc phục lỗi thường gặp

### Lỗi 1: Cannot connect to SQL Server
**Nguyên nhân:** SQL Server chưa chạy hoặc cấu hình sai

**Giải pháp:**
1. Mở SQL Server Configuration Manager
2. Kiểm tra SQL Server service đang chạy
3. Enable TCP/IP protocol
4. Restart SQL Server service

### Lỗi 2: Login failed for user
**Nguyên nhân:** Sai username/password hoặc chưa enable SQL Authentication

**Giải pháp:**
1. Mở SSMS
2. Right-click Server → Properties → Security
3. Chọn "SQL Server and Windows Authentication mode"
4. Restart SQL Server
5. Tạo user mới hoặc reset password

### Lỗi 3: Database does not exist
**Nguyên nhân:** Chưa tạo database

**Giải pháp:**
```sql
CREATE DATABASE ThuongMaiDienTu;
GO
```

### Lỗi 4: Port 5000 already in use
**Nguyên nhân:** Port đã được sử dụng

**Giải pháp:**
- Đổi PORT trong .env thành 5001 hoặc port khác
- Hoặc kill process đang dùng port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Bước 6: Insert dữ liệu mẫu (Optional)

### 6.1. Tạo Hạng thành viên
```sql
USE ThuongMaiDienTu;
GO

INSERT INTO HangThanhVien (TenHang, DiemToiThieu, PhanTramGiamGia)
VALUES 
  (N'Đồng', 0, 0),
  (N'Bạc', 1000, 5),
  (N'Vàng', 5000, 10),
  (N'Kim Cương', 10000, 15);
```

### 6.2. Tạo Danh mục
```sql
INSERT INTO DanhMucSanPham (TenDanhMuc, DuongDan)
VALUES 
  (N'Điện tử', 'dien-tu'),
  (N'Thời trang', 'thoi-trang'),
  (N'Gia dụng', 'gia-dung'),
  (N'Sách', 'sach'),
  (N'Thể thao', 'the-thao');
```

### 6.3. Kiểm tra dữ liệu
```sql
SELECT * FROM HangThanhVien;
SELECT * FROM DanhMucSanPham;
SELECT * FROM NguoiDung;
```

## Bước 7: Chạy Frontend

### 7.1. Cài đặt Frontend
```bash
cd frontend
npm install
copy .env.example .env
```

### 7.2. Cập nhật .env
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 7.3. Khởi động Frontend
```bash
npm start
```

Frontend sẽ chạy tại: http://localhost:3000

## 🎉 Hoàn thành!

Bây giờ bạn có thể:
1. Truy cập http://localhost:3000
2. Đăng ký tài khoản mới
3. Xác thực OTP (kiểm tra console log nếu chưa cấu hình email)
4. Đăng nhập và sử dụng hệ thống

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. SQL Server đang chạy
2. Database đã được tạo
3. File .env đã cấu hình đúng
4. Port 5000 và 3000 chưa bị sử dụng
5. Node.js version >= 16
