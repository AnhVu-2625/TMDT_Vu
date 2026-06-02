# Admin & User Features API Documentation

Tài liệu này mô tả tất cả các API endpoints mới cho chức năng Admin và User được thêm vào hệ thống.

## Nội dung

1. [Admin Routes](#admin-routes)
2. [User Routes](#user-routes)
3. [Notification Routes](#notification-routes)
4. [Database Modifications](#database-modifications)

---

## Admin Routes

**Base URL:** `/api/admin`

**Yêu cầu:** Tất cả endpoints yêu cầu xác thực (JWT token) và quyền Admin (VaiTro = 'QUAN_TRI_VIEN')

### 1. Quản Lý Tài Khoản (Account Management)

#### GET /users
Lấy danh sách tất cả người dùng

**Query Parameters:**
- `page` (optional, default: 1): Trang hiện tại
- `limit` (optional, default: 20): Số bản ghi trên trang
- `search` (optional): Tìm kiếm theo tên, email, hoặc số điện thoại
- `status` (optional): Lọc theo trạng thái (CHUA_KICH_HOAT, HOAT_DONG, BI_KHOA)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaNguoiDung": 1,
      "HoTen": "Nguyễn Văn A",
      "Email": "user@example.com",
      "SoDienThoai": "0912345678",
      "VaiTro": "NGUOI_DUNG",
      "TrangThai": "HOAT_DONG",
      "DiemTichLuy": 150,
      "MaHang": 1,
      "NgayTao": "2024-01-01T10:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### PUT /users/:userId/lock
Khóa tài khoản người dùng

**Request Body:**
```json
{
  "lyDo": "Lý do khóa tài khoản (tùy chọn)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User account locked"
}
```

#### PUT /users/:userId/unlock
Mở khóa tài khoản người dùng

**Response:**
```json
{
  "success": true,
  "message": "User account unlocked"
}
```

---

### 2. Kiểm Duyệt Hệ Thống (System Moderation)

#### GET /reports
Lấy danh sách báo cáo vi phạm

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `status` (optional): Lọc theo trạng thái (CHO_XU_LY, DANG_XU_LY, DA_GIAI_QUYET, BI_TU_CHOI)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaBaoCao": 1,
      "MaNguoiDungBaoCao": 5,
      "LoaiBaoCao": "SAN_PHAM_KHONG_HOP_LE",
      "MoTaChiTiet": "Sản phẩm vi phạm",
      "TrangThai": "CHO_XU_LY",
      "MaThamChieu": 10,
      "LoaiMaThamChieu": "SAN_PHAM",
      "NgayTao": "2024-01-15T14:30:00",
      "GhiChuAdmin": null
    }
  ]
}
```

#### PUT /reports/:reportId/resolve
Xử lý (phê duyệt hoặc từ chối) báo cáo

**Request Body:**
```json
{
  "decision": "APPROVED",  // hoặc "REJECTED"
  "ghiChu": "Ghi chú xử lý (tùy chọn)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report resolved"
}
```

---

### 3. Thống Kê Tổng Quan (Overview Statistics)

#### GET /statistics
Lấy thống kê hệ thống

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "lockedUsers": 5,
    "totalOrders": 2500,
    "totalRevenue": 5000000000,
    "pendingReports": 12,
    "pendingWithdrawals": 8,
    "totalShops": 150,
    "pendingDisputes": 3
  }
}
```

---

### 4. Giải Quyết Tranh Chấp (Dispute Resolution)

#### GET /disputes
Lấy danh sách tranh chấp cần xử lý

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `status` (optional): CHO_XU_LY, DANG_XU_LY, DA_GIAI_QUYET

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaTrancChap": 1,
      "MaDonHang": 100,
      "MaNguoiDungKhieu": 5,
      "MaNguoiDungDoiPhuong": 10,
      "LoaiTrancChap": "Sản phẩm không đúng mô tả",
      "MoTaChiTiet": "Mô tả chi tiết vấn đề",
      "TrangThai": "CHO_XU_LY",
      "NgayTao": "2024-01-15T14:30:00"
    }
  ]
}
```

#### PUT /disputes/:disputeId/resolve
Giải quyết tranh chấp

**Request Body:**
```json
{
  "decision": "CHO_NGUOI_MUA",  // hoặc "CHO_NGUOI_BAN"
  "ghiChu": "Quyết định và lý do"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dispute resolved"
}
```

---

### 5. Chính Sách Hệ Thống (System Policies)

#### GET /policies
Lấy tất cả chính sách hệ thống

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaChinhSach": 1,
      "TenChinhSach": "Chính sách thanh toán",
      "NoiDung": "Nội dung chính sách...",
      "LoaiChinhSach": "CHI_TRA",
      "NgayTao": "2024-01-01T00:00:00"
    }
  ]
}
```

#### POST /policies
Tạo chính sách mới

**Request Body:**
```json
{
  "tenChinhSach": "Tên chính sách",
  "noiDung": "Nội dung chi tiết",
  "loaiChinhSach": "CHI_TRA"  // CHI_TRA, BAO_MAT, KHIEU_NAI, KHAC
}
```

**Response:**
```json
{
  "success": true,
  "message": "Policy created"
}
```

---

### 6. Quản Lý Rút Tiền (Settlement & Withdrawals)

#### GET /withdrawals
Lấy danh sách yêu cầu rút tiền

**Query Parameters:**
- `status` (optional): CHO_DUYET, DA_DUYET, TU_CHOI

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaYeuCau": 1,
      "MaCuaHang": 5,
      "SoTien": 1000000,
      "TenTaiKhoanNganHang": "Nguyễn Văn A",
      "SoTaiKhoan": "123456789",
      "TenNganHang": "Vietcombank",
      "TrangThai": "CHO_DUYET",
      "NgayTao": "2024-01-15T10:00:00",
      "TenCuaHang": "Shop A",
      "HoTen": "Nguyễn Văn A",
      "Email": "shop@example.com"
    }
  ]
}
```

#### PUT /withdrawals/:withdrawalId/approve
Phê duyệt yêu cầu rút tiền

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal approved"
}
```

#### PUT /withdrawals/:withdrawalId/reject
Từ chối yêu cầu rút tiền

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal rejected"
}
```

---

### 7. Gửi Thông Báo (Send Notifications)

#### POST /send-notification
Gửi thông báo hệ thống cho người dùng

**Request Body:**
```json
{
  "userId": 5,
  "tieuDe": "Tiêu đề thông báo",
  "noiDung": "Nội dung chi tiết thông báo",
  "loaiThongBao": "HE_THONG"  // DON_HANG, KHUYEN_MAI, HE_THONG, TIN_NHAN
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent"
}
```

---

## User Routes

**Base URL:** `/api/users`

**Yêu cầu xác thực:** Hầu hết endpoints yêu cầu JWT token

### 1. Quản Lý VIP (Join VIP - Tham gia VIP)

#### GET /vip-packages
Lấy danh sách gói VIP có sẵn (không yêu cầu đăng nhập)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaGiaDichVu": 1,
      "TenGoi": "VIP Bạc",
      "MoTa": "Gói VIP cơ bản",
      "GiaTien": 99000,
      "ThoiGianDangKy": 30,
      "LoiIch": "Giảm 5% trên mọi đơn hàng..."
    }
  ]
}
```

#### GET /vip-status
Lấy trạng thái VIP của người dùng hiện tại

**Response:**
```json
{
  "success": true,
  "data": {
    "MaVIP": 1,
    "MaGiaDichVu": 2,
    "TenGoi": "VIP Vàng",
    "GiaTien": 199000,
    "NgayBatDau": "2024-01-15T00:00:00",
    "NgayKetThuc": "2024-02-14T23:59:59",
    "TrangThai": "DANG_HOAT_DONG"
  },
  "message": "Active VIP membership"
}
```

#### POST /vip/subscribe
Đăng ký gói VIP

**Request Body:**
```json
{
  "maGiaDichVu": 2  // ID của gói VIP
}
```

**Response:**
```json
{
  "success": true,
  "message": "VIP subscription successful"
}
```

#### POST /vip/unsubscribe
Hủy đăng ký VIP

**Response:**
```json
{
  "success": true,
  "message": "VIP subscription cancelled"
}
```

---

### 2. Quản Lý Điểm Tích Lũy (Accumulation Points)

#### GET /points
Lấy số điểm tích lũy hiện tại

**Response:**
```json
{
  "success": true,
  "data": {
    "points": 250
  }
}
```

#### GET /points/history
Lấy lịch sử thay đổi điểm

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaLichSu": 1,
      "DiemThanh": 50,
      "LoaiThay": 1,  // 1: cộng, -1: trừ
      "LyDo": "Hoàn thành đơn hàng",
      "NgayTao": "2024-01-15T14:30:00"
    }
  ]
}
```

---

### 3. Quản Lý Hạng Thành Viên (Member Rank)

#### GET /rank
Lấy hạng thành viên của người dùng

**Response:**
```json
{
  "success": true,
  "data": {
    "MaNguoiDung": 5,
    "DiemTichLuy": 250,
    "MaHang": 1,
    "TenHang": "Bạc",
    "DiemToiThieu": 500,
    "PhanTramGiamGia": 5
  }
}
```

#### GET /ranks/all
Lấy tất cả hạng thành viên (không yêu cầu đăng nhập)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaHang": 1,
      "TenHang": "Thường",
      "DiemToiThieu": 0,
      "PhanTramGiamGia": 0
    },
    {
      "MaHang": 2,
      "TenHang": "Bạc",
      "DiemToiThieu": 500,
      "PhanTramGiamGia": 5
    }
  ]
}
```

---

### 4. Quản Lý Bộ Lọc Đã Lưu (Saved Filters)

#### GET /filters
Lấy danh sách bộ lọc đã lưu

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaBoLoc": 1,
      "TenBoLoc": "Điện thoại Samsung giá rẻ",
      "DanhMucId": 2,
      "GiaToiThieu": 5000000,
      "GiaToiDa": 10000000,
      "DiemDanhGiaToiThieu": 4.5,
      "MauSac": null,
      "KichThuoc": null,
      "SapXep": "ASC",
      "NgayTao": "2024-01-15T10:00:00"
    }
  ]
}
```

#### POST /filters
Lưu bộ lọc mới

**Request Body:**
```json
{
  "tenBoLoc": "Tên bộ lọc",
  "danhMucId": 2,
  "giaToiThieu": 5000000,
  "giaToiDa": 10000000,
  "diemDanhGiaToiThieu": 4.5,
  "mauSac": "Đen",
  "kichThuoc": "256GB",
  "sapXep": "DESC"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Filter saved",
  "filterId": 1
}
```

#### DELETE /filters/:filterId
Xóa bộ lọc đã lưu

**Response:**
```json
{
  "success": true,
  "message": "Filter deleted"
}
```

---

### 5. Quản Lý Khuyến Mãi (Promotions)

#### GET /promotions
Lấy danh sách khuyến mãi có sẵn

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaKhuyenMai": 1,
      "MaCode": "WELCOME10",
      "LoaiGiamGia": "PHAN_TRAM",
      "GiaTriGiam": 10,
      "DonHangToiThieu": 100000,
      "GiamToiDa": 50000,
      "TuNgay": "2024-01-01T00:00:00",
      "DenNgay": "2024-06-30T23:59:59",
      "GioiHanSuDung": 1000,
      "DaSuDung": 250,
      "daNhan": 0  // 0 = chưa nhận, > 0 = đã nhận
    }
  ]
}
```

#### POST /promotions/:promotionId/receive
Nhận khuyến mãi

**Response:**
```json
{
  "success": true,
  "message": "Promotion received"
}
```

#### GET /my-promotions
Lấy danh sách khuyến mãi của người dùng

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaKhuyenMaiNguoiDung": 1,
      "MaCode": "WELCOME10",
      "LoaiGiamGia": "PHAN_TRAM",
      "GiaTriGiam": 10,
      "TrangThai": "CHUA_SU_DUNG",
      "NgayNhan": "2024-01-15T14:30:00"
    }
  ]
}
```

---

## Notification Routes

**Base URL:** `/api/notifications`

### GET /
Lấy danh sách thông báo

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

### PUT /:notificationId/read
Đánh dấu thông báo đã đọc

### GET /unread/count
Lấy số thông báo chưa đọc

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

### POST /report
Gửi báo cáo vi phạm

**Request Body:**
```json
{
  "loaiBaoCao": "SAN_PHAM_KHONG_HOP_LE",
  "moTaChiTiet": "Mô tả chi tiết về vấn đề",
  "maThamChieu": 10,
  "loaiMaThamChieu": "SAN_PHAM"
}
```

### POST /dispute
Tạo yêu cầu giải quyết tranh chấp

**Request Body:**
```json
{
  "maDonHang": 100,
  "loaiTrancChap": "Sản phẩm không đúng mô tả",
  "moTaChiTiet": "Mô tả chi tiết vấn đề"
}
```

---

## Database Modifications

### Các bảng mới được thêm:

1. **BaoCao** - Báo cáo vi phạm
   - MaBaoCao (PK)
   - MaNguoiDungBaoCao (FK)
   - LoaiBaoCao (SAN_PHAM_KHONG_HOP_LE, HANH_VI_KHONG_HOP_LE, GIAN_LAN, KHAC)
   - TrangThai (CHO_XU_LY, DANG_XU_LY, DA_GIAI_QUYET, BI_TU_CHOI)

2. **GiaiQuyetTrancChap** - Xử lý tranh chấp
   - MaTrancChap (PK)
   - MaDonHang (FK)
   - MaNguoiDungKhieu (FK)
   - MaNguoiDungDoiPhuong (FK)
   - TrangThai (CHO_XU_LY, DANG_XU_LY, DA_GIAI_QUYET)

3. **GiaDichVuVIP** - Gói VIP
   - MaGiaDichVu (PK)
   - TenGoi, GiaTien, ThoiGianDangKy, LoiIch

4. **DichVuVIPNguoiDung** - VIP membership
   - MaVIP (PK)
   - MaNguoiDung (FK)
   - TrangThai (DANG_HOAT_DONG, HET_HAN, HUY_BO)

5. **LichSuThayDoiDiem** - Lịch sử điểm
   - MaLichSu (PK)
   - MaNguoiDung (FK)
   - DiemThanh, LoaiThay, LyDo

6. **BoLocDaLuu** - Bộ lọc tìm kiếm
   - MaBoLoc (PK)
   - MaNguoiDung (FK)
   - GiaToiThieu, GiaToiDa, etc.

7. **KhuyenMaiNguoiDung** - Khuyến mãi user
   - MaKhuyenMaiNguoiDung (PK)
   - MaNguoiDung (FK)
   - MaKhuyenMai (FK)

8. **ChinhSachHeThong** - Chính sách
   - MaChinhSach (PK)
   - LoaiChinhSach (CHI_TRA, BAO_MAT, KHIEU_NAI, KHAC)

---

## Cách Sử Dụng

### Thiết lập ban đầu

1. Chạy script schema update để thêm các bảng mới:
```bash
# Sử dụng SQL Server Management Studio hoặc sqlcmd
sqlcmd -S your_server -d ThuongMaiDienTu -i schema.sql
```

2. Chạy seed data để thêm dữ liệu mẫu:
```bash
sqlcmd -S your_server -d ThuongMaiDienTu -i seed.sql
```

### Test Admin Routes

```bash
# 1. Lấy JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@marthub.vn", "password": "Admin@123"}'

# 2. Lấy danh sách người dùng
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Khóa tài khoản
curl -X PUT http://localhost:5000/api/admin/users/5/lock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lyDo": "Vi phạm chính sách"}'
```

### Test User Features

```bash
# 1. Lấy trạng thái VIP
curl -X GET http://localhost:5000/api/users/vip-status \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Đăng ký VIP
curl -X POST http://localhost:5000/api/users/vip/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maGiaDichVu": 2}'

# 3. Lấy điểm tích lũy
curl -X GET http://localhost:5000/api/users/points \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Ghi Chú

- Tất cả các request yêu cầu authentication đều cần thêm header `Authorization: Bearer <token>`
- Các endpoint admin yêu cầu role QUAN_TRI_VIEN
- Thời gian trả về dưới dạng ISO 8601 format (UTC)
- Tiền tệ tính bằng VNĐ (Việt Nam Đồng)
- Điểm tích lũy được tính dưới dạng số nguyên

---

**Cập nhật lần cuối:** 2024-01-15
**Phiên bản API:** 2.0
