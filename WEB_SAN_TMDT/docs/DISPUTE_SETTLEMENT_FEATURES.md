# Tài liệu Tính năng Giải quyết Tranh chấp & Đối soát

## 📋 Tổng quan

Tài liệu này mô tả 2 tính năng chính mới được thêm vào hệ thống:

1. **Giải quyết tranh chấp đổi trả** - Admin làm trung gian phân xử khi người mua và người bán không thỏa thuận được
2. **Đối soát & Chia tiền** - Tính toán và chi trả tiền cho người bán sau khi trừ phí sàn

---

## 🔧 Cài đặt Database

### Bước 1: Chạy script mở rộng schema

```bash
# Chạy file SQL extension
sqlcmd -S localhost -d ThuongMaiDienTu -i database/dispute_settlement_extension.sql
```

Hoặc mở file `database/dispute_settlement_extension.sql` và chạy trong SQL Server Management Studio.

### Bước 2: Kiểm tra các bảng mới

Script sẽ tạo các bảng sau:

- `BangChungVideo` - Lưu video đóng hàng/mở hàng
- `LichSuTrancChap` - Lịch sử xử lý tranh chấp
- `CauHinhHeThong` - Cấu hình phí sàn, số ngày đổi trả
- `PhienDoiSoat` - Các phiên đối soát
- `ChiTietDoiSoat` - Chi tiết đối soát theo đơn hàng
- `LichSuGiaoDichVi` - Lịch sử giao dịch ví cửa hàng

---

## 1️⃣ Tính năng Giải quyết Tranh chấp

### Use Case

**Mô tả**: Admin đứng ra làm trung gian phân xử khi người mua và người bán không thỏa thuận được việc hoàn tiền.

**Actors**: Admin

**Input**: 
- Thông tin đơn hàng đang tranh chấp
- Bằng chứng của hai bên (video đóng hàng, video mở hàng)

**Output**: Quyết định cuối cùng - tiền thuộc về người mua hay người bán

### API Endpoints

#### 1. Lấy danh sách tranh chấp

```http
GET /api/disputes
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `trangThai` (optional): CHO_XU_LY | SHOP_DONG_Y | SHOP_TU_CHOI | KHIEU_NAI_ADMIN | DA_GIAI_QUYET
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số bản ghi/trang (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaDoiTra": 1,
      "MaDonHang": 123,
      "LyDo": "Sản phẩm không đúng mô tả",
      "TrangThai": "KHIEU_NAI_ADMIN",
      "TenNguoiMua": "Nguyễn Văn A",
      "TenCuaHang": "Shop ABC",
      "TienThanhToan": 500000,
      "NgayTao": "2026-05-20T10:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

#### 2. Xem chi tiết tranh chấp

```http
GET /api/disputes/{id}
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dispute": {
      "MaDoiTra": 1,
      "MaDonHang": 123,
      "LyDo": "Sản phẩm không đúng mô tả",
      "AnhBangChung": "url1,url2",
      "VideoMoHang": "video_url",
      "VideoDongHang": "video_url",
      "TrangThai": "KHIEU_NAI_ADMIN",
      "TenNguoiMua": "Nguyễn Văn A",
      "EmailNguoiMua": "a@example.com",
      "TenCuaHang": "Shop ABC",
      "TenNguoiBan": "Trần Thị B"
    },
    "history": [
      {
        "HanhDong": "Người mua khiếu nại lên Admin",
        "TenNguoiThucHien": "Nguyễn Văn A",
        "NgayThucHien": "2026-05-20T10:00:00"
      }
    ],
    "videos": [
      {
        "LoaiVideo": "DONG_HANG",
        "DuongDanVideo": "url",
        "NgayTai": "2026-05-19T15:00:00"
      }
    ]
  }
}
```

#### 3. Admin giải quyết tranh chấp (Phán quyết)

```http
POST /api/disputes/{id}/resolve
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "quyetDinh": "DONG_Y_HOAN_TIEN",
  "lyDo": "Sau khi xem video, sản phẩm thực tế không đúng với mô tả. Đồng ý hoàn tiền cho người mua."
}
```

**Body Parameters:**
- `quyetDinh`: `DONG_Y_HOAN_TIEN` hoặc `TU_CHOI_HOAN_TIEN`
- `lyDo`: Lý do quyết định (bắt buộc)

**Response:**
```json
{
  "success": true,
  "message": "Giải quyết tranh chấp thành công",
  "data": {
    "quyetDinh": "DONG_Y_HOAN_TIEN",
    "lyDo": "..."
  }
}
```

**Xử lý tự động:**
- Nếu `DONG_Y_HOAN_TIEN`: 
  - Cập nhật trạng thái đơn hàng thành `DA_TRA_HANG`
  - Cập nhật trạng thái thanh toán thành `HOAN_TIEN`
  - Trừ tiền từ ví người bán (nếu đã được cộng)
  - Gửi thông báo cho người mua và người bán

- Nếu `TU_CHOI_HOAN_TIEN`:
  - Giữ nguyên trạng thái đơn hàng `DA_GIAO`
  - Tiền thuộc về người bán
  - Gửi thông báo cho người mua và người bán

#### 4. Người mua khiếu nại lên Admin

```http
POST /api/disputes/{id}/escalate
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "lyDoKhieuNai": "Shop từ chối hoàn tiền nhưng sản phẩm thực sự bị lỗi"
}
```

### Flow xử lý tranh chấp

```
1. Người mua tạo yêu cầu đổi trả
   ↓
2. Shop xem xét → Đồng ý / Từ chối
   ↓
3. Nếu Shop từ chối → Người mua có thể khiếu nại lên Admin
   ↓
4. Admin xem video bằng chứng của cả 2 bên
   ↓
5. Admin đưa ra phán quyết cuối cùng
   ↓
6. Hệ thống tự động xử lý tiền theo quyết định
```

---

## 2️⃣ Tính năng Đối soát & Chia tiền

### Use Case

**Mô tả**: Admin tính toán tiền hàng trả cho người bán sau khi đã trừ đi phần trăm phí duy trì của sàn.

**Actors**: Admin

**Input**: Các đơn hàng đã giao thành công và hết hạn đổi trả

**Output**: Tiền được cộng vào ví tài khoản của người bán

### API Endpoints

#### 1. Lấy đơn hàng đủ điều kiện đối soát

```http
GET /api/settlements/eligible-orders
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `tuNgay` (optional): Từ ngày (ISO 8601)
- `denNgay` (optional): Đến ngày (ISO 8601)
- `maCuaHang` (optional): Lọc theo cửa hàng

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "MaDonHang": 123,
        "MaCuaHang": 5,
        "TenCuaHang": "Shop ABC",
        "TienThanhToan": 500000,
        "NgayGiaoHang": "2026-05-15T10:00:00",
        "NgayHetHanDoiTra": "2026-05-22T10:00:00",
        "DaDoiSoat": false
      }
    ],
    "summary": {
      "tongDonHang": 10,
      "tongDoanhThu": "5000000.00",
      "phanTramPhiSan": 5,
      "tongPhiSan": "250000.00",
      "tongChiTra": "4750000.00"
    }
  }
}
```

**Điều kiện đơn hàng đủ điều kiện:**
- Trạng thái: `DA_GIAO`
- Thanh toán: `DA_THANH_TOAN`
- Đã hết hạn đổi trả (NgayHetHanDoiTra < hiện tại)
- Chưa đối soát (`DaDoiSoat = 0`)
- Không có tranh chấp đang xử lý

#### 2. Tạo phiên đối soát

```http
POST /api/settlements
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "tenPhien": "Đối soát tháng 5/2026",
  "tuNgay": "2026-05-01T00:00:00",
  "denNgay": "2026-05-31T23:59:59",
  "ghiChu": "Đối soát định kỳ cuối tháng"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo phiên đối soát thành công",
  "data": {
    "maPhienDoiSoat": 1,
    "tongDonHang": 10,
    "tongDoanhThu": "5000000.00",
    "tongPhiSan": "250000.00",
    "tongChiTra": "4750000.00"
  }
}
```

**Xử lý tự động:**
- Tính toán phí sàn cho từng đơn hàng
- Tạo chi tiết đối soát theo cửa hàng
- Đánh dấu đơn hàng đã đối soát
- Kiểm tra số liệu âm (lỗi tính mã giảm giá)

#### 3. Lấy danh sách phiên đối soát

```http
GET /api/settlements
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `trangThai` (optional): DANG_XU_LY | HOAN_THANH | LOI
- `page`, `limit`: Phân trang

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaPhienDoiSoat": 1,
      "TenPhien": "Đối soát tháng 5/2026",
      "TuNgay": "2026-05-01T00:00:00",
      "DenNgay": "2026-05-31T23:59:59",
      "TongDonHang": 10,
      "TongDoanhThu": 5000000,
      "TongPhiSan": 250000,
      "TongChiTraNguoiBan": 4750000,
      "TrangThai": "DANG_XU_LY",
      "TenNguoiThucHien": "Admin",
      "NgayTao": "2026-05-31T10:00:00"
    }
  ]
}
```

#### 4. Xem chi tiết phiên đối soát

```http
GET /api/settlements/{id}
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phien": {
      "MaPhienDoiSoat": 1,
      "TenPhien": "Đối soát tháng 5/2026",
      "TongDonHang": 10,
      "TongDoanhThu": 5000000,
      "TrangThai": "DANG_XU_LY"
    },
    "chiTiet": [
      {
        "MaCuaHang": 5,
        "TenCuaHang": "Shop ABC",
        "SoDonHang": 3,
        "TongDoanhThu": 1500000,
        "TongPhiSan": 75000,
        "TongTienThucNhan": 1425000,
        "TrangThai": "CHO_XU_LY"
      }
    ]
  }
}
```

#### 5. Thực hiện chi trả (Xác nhận)

```http
POST /api/settlements/{id}/execute
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Thực hiện chi trả thành công",
  "data": {
    "soLuongCuaHang": 5,
    "tongTienChiTra": 4750000
  }
}
```

**Xử lý tự động:**
- Kiểm tra số liệu (nếu có số âm → chặn và đánh dấu lỗi)
- Cộng tiền vào ví từng cửa hàng
- Ghi lịch sử giao dịch ví
- Cập nhật trạng thái chi tiết → `DA_CHI_TRA`
- Cập nhật trạng thái phiên → `HOAN_THANH`

#### 6. Quản lý cấu hình hệ thống

**Lấy cấu hình:**
```http
GET /api/settlements/config/system
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "TenCauHinh": "PHI_SAN_PHAN_TRAM",
      "GiaTri": "5",
      "MoTa": "Phần trăm phí sàn trừ vào doanh thu người bán (%)"
    },
    {
      "TenCauHinh": "SO_NGAY_DOI_TRA",
      "GiaTri": "7",
      "MoTa": "Số ngày được phép đổi trả sau khi nhận hàng"
    },
    {
      "TenCauHinh": "TU_DONG_DOI_SOAT",
      "GiaTri": "true",
      "MoTa": "Tự động đối soát vào cuối tháng"
    }
  ]
}
```

**Cập nhật cấu hình:**
```http
PUT /api/settlements/config/system
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "tenCauHinh": "PHI_SAN_PHAN_TRAM",
  "giaTri": "7"
}
```

### Flow đối soát

```
1. Admin vào bảng đối soát tài chính
   ↓
2. Hệ thống tự động hiển thị các đơn hàng đủ điều kiện
   ↓
3. Admin tạo phiên đối soát (chọn khoảng thời gian)
   ↓
4. Hệ thống tính toán:
   - Tổng doanh thu
   - Phí sàn (%)
   - Tiền thực nhận của người bán
   ↓
5. Admin xem chi tiết và nhấn xác nhận
   ↓
6. Hệ thống cộng tiền vào ví của người bán
   ↓
7. Ghi lịch sử giao dịch
```

### Alternative Flow: Tự động đối soát

Có thể cấu hình hệ thống tự động đối soát định kỳ:

```javascript
// Cron job (cần implement riêng)
// Chạy vào ngày 1 hàng tháng
const autoSettlement = async () => {
  const config = await getConfig('TU_DONG_DOI_SOAT');
  if (config === 'true') {
    // Tạo phiên đối soát tự động cho tháng trước
    // Gọi API POST /api/settlements
  }
};
```

---

## 🔐 Phân quyền

### Admin Routes
Tất cả các endpoint đều yêu cầu:
- `authenticateToken` - Token hợp lệ
- `requireAdmin` - Vai trò QUAN_TRI_VIEN

### User Routes
- `/api/disputes/{id}/escalate` - Chỉ người mua của đơn hàng đó

---

## 🧪 Testing

### Test Dispute Resolution

```bash
# 1. Lấy danh sách tranh chấp
curl -X GET http://localhost:5000/api/disputes \
  -H "Authorization: Bearer {admin_token}"

# 2. Xem chi tiết
curl -X GET http://localhost:5000/api/disputes/1 \
  -H "Authorization: Bearer {admin_token}"

# 3. Giải quyết tranh chấp
curl -X POST http://localhost:5000/api/disputes/1/resolve \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "quyetDinh": "DONG_Y_HOAN_TIEN",
    "lyDo": "Sản phẩm không đúng mô tả"
  }'
```

### Test Settlement

```bash
# 1. Xem đơn hàng đủ điều kiện
curl -X GET "http://localhost:5000/api/settlements/eligible-orders?tuNgay=2026-05-01&denNgay=2026-05-31" \
  -H "Authorization: Bearer {admin_token}"

# 2. Tạo phiên đối soát
curl -X POST http://localhost:5000/api/settlements \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tenPhien": "Đối soát tháng 5/2026",
    "tuNgay": "2026-05-01T00:00:00",
    "denNgay": "2026-05-31T23:59:59"
  }'

# 3. Thực hiện chi trả
curl -X POST http://localhost:5000/api/settlements/1/execute \
  -H "Authorization: Bearer {admin_token}"
```

---

## 📊 Database Schema

### Bảng quan trọng

**YeuCauDoiTra** (đã mở rộng):
- `VideoMoHang`: URL video người mua mở hàng
- `QuyetDinhAdmin`: DONG_Y_HOAN_TIEN | TU_CHOI_HOAN_TIEN
- `NgayQuyetDinh`: Thời gian admin quyết định
- `AdminXuLy`: ID admin xử lý

**PhienDoiSoat**:
- Lưu thông tin tổng hợp của mỗi phiên đối soát
- Trạng thái: DANG_XU_LY | HOAN_THANH | LOI

**ChiTietDoiSoat**:
- Chi tiết từng đơn hàng trong phiên
- Tính toán: DoanhThu - PhiSan = TienThucNhan

**LichSuGiaoDichVi**:
- Ghi lại mọi thay đổi số dư ví cửa hàng
- Có SoDuTruoc và SoDuSau để audit

---

## 🚀 Deployment Notes

1. **Chạy migration database** trước khi deploy code mới
2. **Cấu hình phí sàn** phù hợp với chính sách kinh doanh
3. **Backup database** trước khi chạy đối soát lần đầu
4. **Monitor logs** khi thực hiện chi trả tự động
5. **Test kỹ flow tranh chấp** với các case khác nhau

---

## 📝 Notes

- Video bằng chứng nên được lưu trên cloud storage (S3, Cloudinary)
- Cân nhắc thêm webhook để thông báo cho người bán khi có tiền vào ví
- Có thể mở rộng thêm báo cáo thống kê đối soát theo tháng/quý
- Xem xét thêm tính năng xuất file Excel báo cáo đối soát

---

## 🐛 Troubleshooting

**Lỗi: "Số liệu tổng tiền bị âm"**
- Kiểm tra logic tính mã giảm giá
- Xem lại các đơn hàng có giảm giá > 100%
- Phiên đối soát sẽ bị đánh dấu LOI và cần xử lý thủ công

**Lỗi: "Không có đơn hàng đủ điều kiện"**
- Kiểm tra đã hết hạn đổi trả chưa
- Xem có tranh chấp đang xử lý không
- Kiểm tra trạng thái đơn hàng và thanh toán

---

## 📞 Support

Nếu có vấn đề, liên hệ team dev hoặc tạo issue trên repository.
