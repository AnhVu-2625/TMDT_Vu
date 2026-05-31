# 🎯 Hướng dẫn Cài đặt & Sử dụng Tính năng Tranh chấp & Đối soát

## 📦 Tổng quan

Đã implement thành công 2 tính năng chính:

### 1. **Giải quyết tranh chấp đổi trả** 
Admin làm trung gian phân xử khi người mua và người bán không thỏa thuận được việc hoàn tiền.

**Tính năng:**
- ✅ Xem danh sách tranh chấp với filter theo trạng thái
- ✅ Xem chi tiết tranh chấp (thông tin 2 bên, video bằng chứng, lịch sử)
- ✅ Admin phán quyết: Đồng ý hoàn tiền hoặc Từ chối
- ✅ Tự động xử lý tiền theo quyết định
- ✅ Ghi lịch sử đầy đủ
- ✅ Gửi thông báo cho người mua và người bán

### 2. **Đối soát & Chia tiền**
Tính toán tiền hàng trả cho người bán sau khi trừ phí sàn.

**Tính năng:**
- ✅ Xem đơn hàng đủ điều kiện đối soát (đã giao, hết hạn đổi trả, không tranh chấp)
- ✅ Tạo phiên đối soát theo khoảng thời gian
- ✅ Tự động tính phí sàn (% cấu hình được)
- ✅ Xem chi tiết đối soát theo cửa hàng
- ✅ Thực hiện chi trả (cộng tiền vào ví người bán)
- ✅ Kiểm tra lỗi số âm (do mã giảm giá)
- ✅ Ghi lịch sử giao dịch ví
- ✅ Quản lý cấu hình hệ thống

---

## 🚀 Cài đặt

### Bước 1: Chạy Database Extension

```bash
# Mở SQL Server Management Studio hoặc dùng sqlcmd
# Chạy file:
database/dispute_settlement_extension.sql
```

Script này sẽ tạo:
- 6 bảng mới
- 2 stored procedures
- Indexes để tối ưu
- Cấu hình mặc định (phí sàn 5%, số ngày đổi trả 7 ngày)

### Bước 2: Seed dữ liệu test (Optional)

```bash
# Chạy file để tạo dữ liệu mẫu:
database/seed_dispute_settlement.sql
```

Sẽ tạo:
- 2 tranh chấp mẫu (1 đang chờ admin, 1 shop từ chối)
- 10+ đơn hàng đủ điều kiện đối soát
- Video bằng chứng mẫu
- Lịch sử tranh chấp

### Bước 3: Restart Backend

Backend đã tự động restart và load routes mới. Kiểm tra:

```bash
# Backend đang chạy tại:
http://localhost:5000

# API docs:
http://localhost:5000/api-docs
```

---

## 📚 API Endpoints

### Dispute Resolution

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/disputes` | Lấy danh sách tranh chấp |
| GET | `/api/disputes/:id` | Xem chi tiết tranh chấp |
| POST | `/api/disputes/:id/resolve` | Admin giải quyết tranh chấp |
| POST | `/api/disputes/:id/escalate` | Người mua khiếu nại lên Admin |

### Settlement

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/settlements/eligible-orders` | Đơn hàng đủ điều kiện |
| POST | `/api/settlements` | Tạo phiên đối soát |
| GET | `/api/settlements` | Danh sách phiên đối soát |
| GET | `/api/settlements/:id` | Chi tiết phiên đối soát |
| POST | `/api/settlements/:id/execute` | Thực hiện chi trả |
| GET | `/api/settlements/config/system` | Lấy cấu hình |
| PUT | `/api/settlements/config/system` | Cập nhật cấu hình |

---

## 🧪 Testing

### Cách 1: Dùng file HTTP test

Mở file `backend/test-dispute-settlement.http` trong VS Code với extension REST Client.

**Bước test:**

1. **Lấy admin token:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

2. **Thay token vào file test:**
```http
@adminToken = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Chạy các test case:**
- Test dispute resolution (section 1)
- Test settlement (section 2)
- Test config (section 3)

### Cách 2: Dùng Postman/Thunder Client

Import các endpoint từ file `test-dispute-settlement.http`.

### Cách 3: Dùng Swagger UI

Truy cập: http://localhost:5000/api-docs

Tìm section:
- **Dispute** - Các API tranh chấp
- **Settlement** - Các API đối soát

---

## 📖 Use Cases

### Use Case 1: Giải quyết tranh chấp

**Scenario:** Người mua nhận sản phẩm không đúng mô tả, shop từ chối hoàn tiền.

**Flow:**

1. **Người mua tạo yêu cầu đổi trả** (dùng API order hiện có)
   - Upload ảnh/video bằng chứng

2. **Shop xem và từ chối**
   - Lý do: "Sản phẩm đã kiểm tra kỹ, có video đóng hàng"

3. **Người mua khiếu nại lên Admin**
   ```http
   POST /api/disputes/1/escalate
   {
     "lyDoKhieuNai": "Sản phẩm thực sự không đúng, tôi có video mở hàng"
   }
   ```

4. **Admin xem chi tiết**
   ```http
   GET /api/disputes/1
   ```
   - Xem video đóng hàng của shop
   - Xem video mở hàng của người mua
   - Xem lịch sử trao đổi

5. **Admin phán quyết**
   ```http
   POST /api/disputes/1/resolve
   {
     "quyetDinh": "DONG_Y_HOAN_TIEN",
     "lyDo": "Video cho thấy sản phẩm không đúng mô tả"
   }
   ```

6. **Hệ thống tự động:**
   - Hoàn tiền cho người mua
   - Trừ tiền từ ví người bán
   - Gửi thông báo cho cả 2 bên
   - Ghi lịch sử

### Use Case 2: Đối soát & Chia tiền

**Scenario:** Cuối tháng, admin đối soát và chi trả tiền cho người bán.

**Flow:**

1. **Xem đơn hàng đủ điều kiện**
   ```http
   GET /api/settlements/eligible-orders?tuNgay=2026-05-01&denNgay=2026-05-31
   ```
   
   Response:
   ```json
   {
     "summary": {
       "tongDonHang": 50,
       "tongDoanhThu": "50000000",
       "phanTramPhiSan": 5,
       "tongPhiSan": "2500000",
       "tongChiTra": "47500000"
     }
   }
   ```

2. **Tạo phiên đối soát**
   ```http
   POST /api/settlements
   {
     "tenPhien": "Đối soát tháng 5/2026",
     "tuNgay": "2026-05-01T00:00:00",
     "denNgay": "2026-05-31T23:59:59"
   }
   ```

3. **Xem chi tiết phiên**
   ```http
   GET /api/settlements/1
   ```
   - Xem chi tiết theo từng cửa hàng
   - Kiểm tra số liệu

4. **Thực hiện chi trả**
   ```http
   POST /api/settlements/1/execute
   ```

5. **Hệ thống tự động:**
   - Kiểm tra số liệu (nếu âm → chặn)
   - Cộng tiền vào ví từng cửa hàng
   - Ghi lịch sử giao dịch
   - Cập nhật trạng thái phiên → HOAN_THANH

### Use Case 3: Alternative Flow - Tự động đối soát

**Cấu hình:**
```http
PUT /api/settlements/config/system
{
  "tenCauHinh": "TU_DONG_DOI_SOAT",
  "giaTri": "true"
}
```

**Implement cron job** (cần thêm):
```javascript
// Chạy vào ngày 1 hàng tháng
const cron = require('node-cron');

cron.schedule('0 0 1 * *', async () => {
  // Tạo phiên đối soát tự động
  const lastMonth = getLastMonthRange();
  await createSettlement({
    tenPhien: `Đối soát tự động ${lastMonth.name}`,
    tuNgay: lastMonth.start,
    denNgay: lastMonth.end
  });
});
```

---

## ⚙️ Cấu hình

### Các tham số có thể cấu hình:

| Tên | Mặc định | Mô tả |
|-----|----------|-------|
| `PHI_SAN_PHAN_TRAM` | 5 | Phí sàn (%) |
| `SO_NGAY_DOI_TRA` | 7 | Số ngày được đổi trả |
| `TU_DONG_DOI_SOAT` | true | Tự động đối soát |
| `NGAY_DOI_SOAT_HANG_THANG` | 1 | Ngày đối soát trong tháng |

### Cập nhật cấu hình:

```http
PUT /api/settlements/config/system
{
  "tenCauHinh": "PHI_SAN_PHAN_TRAM",
  "giaTri": "7"
}
```

---

## 🔒 Phân quyền

### Admin Routes
Tất cả endpoint yêu cầu:
- Token hợp lệ (`Authorization: Bearer {token}`)
- Vai trò: `QUAN_TRI_VIEN`

### User Routes
- `/api/disputes/:id/escalate` - Chỉ người mua của đơn hàng đó

---

## 📊 Database Schema

### Bảng mới:

1. **BangChungVideo** - Video đóng hàng/mở hàng
2. **LichSuTrancChap** - Lịch sử xử lý tranh chấp
3. **CauHinhHeThong** - Cấu hình hệ thống
4. **PhienDoiSoat** - Phiên đối soát
5. **ChiTietDoiSoat** - Chi tiết đối soát
6. **LichSuGiaoDichVi** - Lịch sử giao dịch ví

### Stored Procedures:

1. **sp_TinhPhiSan** - Tính phí sàn cho đơn hàng
2. **sp_CapNhatViCuaHang** - Cập nhật số dư ví

---

## 🐛 Troubleshooting

### Lỗi: "Không tìm thấy tranh chấp"
- Kiểm tra ID tranh chấp có tồn tại không
- Chạy seed data để tạo dữ liệu test

### Lỗi: "Số liệu tổng tiền bị âm"
- Kiểm tra logic tính mã giảm giá
- Phiên đối soát sẽ bị đánh dấu LOI
- Cần xử lý thủ công

### Lỗi: "Không có đơn hàng đủ điều kiện"
- Kiểm tra đã hết hạn đổi trả chưa
- Xem có tranh chấp đang xử lý không
- Chạy seed data để tạo đơn hàng test

### Backend không restart
```bash
# Stop và start lại manually
cd backend
npm run dev
```

---

## 📁 Files đã tạo

```
WEB_SAN_TMDT/
├── backend/
│   ├── src/
│   │   └── routes/
│   │       ├── dispute.js          ← API tranh chấp
│   │       └── settlement.js       ← API đối soát
│   └── test-dispute-settlement.http ← Test file
├── database/
│   ├── dispute_settlement_extension.sql  ← Schema extension
│   └── seed_dispute_settlement.sql       ← Seed data
├── docs/
│   └── DISPUTE_SETTLEMENT_FEATURES.md    ← Chi tiết API
└── DISPUTE_SETTLEMENT_README.md          ← File này
```

---

## ✅ Checklist triển khai

- [x] Tạo database extension
- [x] Tạo API routes (dispute + settlement)
- [x] Đăng ký routes trong server.js
- [x] Tạo stored procedures
- [x] Tạo seed data
- [x] Tạo test file
- [x] Tạo documentation
- [ ] Chạy database migration
- [ ] Test các API
- [ ] Tạo frontend UI (nếu cần)
- [ ] Deploy lên production

---

## 🎓 Học thêm

Xem chi tiết API và use cases tại:
- `docs/DISPUTE_SETTLEMENT_FEATURES.md` - Documentation đầy đủ
- `backend/test-dispute-settlement.http` - Ví dụ test
- http://localhost:5000/api-docs - Swagger UI

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra backend logs
2. Xem database có chạy migration chưa
3. Test với seed data trước
4. Liên hệ team dev

---

**Chúc bạn triển khai thành công! 🚀**
