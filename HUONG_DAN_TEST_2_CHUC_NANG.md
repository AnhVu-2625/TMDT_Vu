# 🧪 HƯỚNG DẪN TEST 2 CHỨC NĂNG CHÍNH

## 🚀 CHUẨN BỊ

### 1. Khởi động hệ thống

Backend và Frontend đã đang chạy:
- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:3000

### 2. Tài khoản test

```
Admin:
- Email: admin@test.com
- Password: Admin@123

Người mua (Buyer):
- Email: buyer1@test.com
- Password: Buyer@123

Người bán (Seller):
- Email: seller1@test.com
- Password: Seller@123
```

---

## 📋 TEST 1: GIẢI QUYẾT TRANH CHẤP ĐỔI TRẢ

### Bước 1: Đăng nhập Admin

1. Mở trình duyệt: http://localhost:3000
2. Click "Đăng nhập"
3. Nhập:
   - Email: `admin@test.com`
   - Password: `Admin@123`
4. Click "Đăng nhập"

✅ **Kết quả mong đợi**: Chuyển đến Admin Dashboard

### Bước 2: Vào trang Giải quyết tranh chấp

1. Trong Admin Dashboard, click menu bên trái
2. Click "Giải quyết tranh chấp đổi trả"

✅ **Kết quả mong đợi**: 
- Hiển thị trang với 4 tab: Chờ phán quyết / Shop từ chối / Đã giải quyết / Tất cả
- Hiển thị danh sách tranh chấp (nếu có)

### Bước 3: Xem danh sách tranh chấp

1. Click vào các tab khác nhau để xem:
   - **Chờ phán quyết**: Tranh chấp cần Admin xử lý
   - **Shop từ chối**: Shop đã từ chối, người mua khiếu nại
   - **Đã giải quyết**: Tranh chấp đã được xử lý
   - **Tất cả**: Tất cả tranh chấp

✅ **Kết quả mong đợi**:
- Mỗi tranh chấp hiển thị:
  - Mã đơn hàng
  - Trạng thái (badge màu)
  - Giá trị đơn hàng
  - Lý do tranh chấp (chữ tiếng Việt rõ ràng)
  - Tên người mua
  - Tên cửa hàng
  - Ngày tạo
  - Button "Xem & Xử lý"

### Bước 4: Xem chi tiết tranh chấp

1. Click button "Xem & Xử lý" trên một tranh chấp

✅ **Kết quả mong đợi**: Modal hiển thị với:

**Thông tin 2 bên:**
```
┌─────────────────────────────────────────┐
│ Người mua                               │
│ - Tên: Nguyễn Văn A                    │
│ - Email: buyer1@test.com               │
│ - SĐT: 0901234567                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Người bán                               │
│ - Tên cửa hàng: Shop Test ABC          │
│ - Email: seller1@test.com              │
│ - SĐT: 0907654321                      │
└─────────────────────────────────────────┘
```

**Lý do tranh chấp:**
```
Sản phẩm bị hỏng trong quá trình vận chuyển. 
Shop từ chối trách nhiệm.
```

**Giá trị đơn hàng:** 500.000₫

**Bằng chứng video:**
- Video đóng hàng (link có thể click)
- Video mở hàng (link có thể click)

**Lịch sử xử lý:**
- Các hành động đã thực hiện
- Người thực hiện
- Thời gian

### Bước 5: Admin phán quyết - ĐỒNG Ý HOÀN TIỀN

1. Trong modal chi tiết, kéo xuống phần "Phán quyết của Admin"
2. Nhập lý do vào textarea:
   ```
   Sau khi xem video đóng hàng và mở hàng, xác nhận sản phẩm bị hỏng 
   trong quá trình vận chuyển. Người bán đóng gói không cẩn thận. 
   Đồng ý hoàn tiền cho người mua.
   ```
3. Click button **"Đồng ý hoàn tiền (tiền về người mua)"**
4. Đợi xử lý

✅ **Kết quả mong đợi**:
- Toast thông báo: "Đã đồng ý hoàn tiền cho người mua"
- Modal tự động đóng
- Tranh chấp biến mất khỏi tab "Chờ phán quyết"
- Tranh chấp xuất hiện trong tab "Đã giải quyết"

✅ **Kiểm tra backend**:
- Trạng thái tranh chấp: `DA_GIAI_QUYET`
- Quyết định: `DONG_Y_HOAN_TIEN`
- Trạng thái đơn hàng: `HOAN_TIEN`
- Lịch sử được ghi nhận
- Thông báo được gửi cho người mua

### Bước 6: Admin phán quyết - TỪ CHỐI HOÀN TIỀN

1. Tìm một tranh chấp khác
2. Click "Xem & Xử lý"
3. Nhập lý do:
   ```
   Sau khi xem video, phát hiện người mua cố tình làm hỏng sản phẩm 
   để đòi hoàn tiền. Video đóng hàng của shop cho thấy sản phẩm nguyên vẹn. 
   Từ chối hoàn tiền, tiền thuộc về người bán.
   ```
4. Click button **"Từ chối hoàn tiền (tiền về shop)"**

✅ **Kết quả mong đợi**:
- Toast thông báo: "Đã từ chối hoàn tiền"
- Modal tự động đóng
- Tranh chấp chuyển sang "Đã giải quyết"

✅ **Kiểm tra backend**:
- Trạng thái tranh chấp: `DA_GIAI_QUYET`
- Quyết định: `TU_CHOI_HOAN_TIEN`
- Trạng thái đơn hàng: `DA_GIAO`
- Tiền được chuyển cho người bán

### Bước 7: Kiểm tra không thể phán quyết lại

1. Vào tab "Đã giải quyết"
2. Click "Xem & Xử lý" trên tranh chấp đã xử lý

✅ **Kết quả mong đợi**:
- Không hiển thị form phán quyết
- Chỉ hiển thị thông tin và lịch sử
- Có thể xem nhưng không thể sửa

---

## 💰 TEST 2: ĐỐI SOÁT & CHIA TIỀN

### Bước 1: Vào trang Đối soát & Chia tiền

1. Trong Admin Dashboard
2. Click menu "Đối soát & Chia tiền"

✅ **Kết quả mong đợi**:
- Hiển thị 3 tab: Đơn đủ điều kiện / Phiên đối soát / Cấu hình
- Mặc định hiển thị tab "Đơn đủ điều kiện"

### Bước 2: Xem đơn hàng đủ điều kiện

Tab "Đơn đủ điều kiện" hiển thị:

**Thống kê tổng hợp:**
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Số đơn hàng     │ Tổng doanh thu  │ Phí sàn (5%)    │ Tiền trả shop   │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ 10              │ 5.000.000₫      │ 250.000₫        │ 4.750.000₫      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**Bảng chi tiết:**
```
┌──────────┬─────────────────┬──────────────┬──────────────┬──────────────────┐
│ Đơn hàng │ Cửa hàng        │ Doanh thu    │ Ngày giao    │ Hết hạn đổi trả  │
├──────────┼─────────────────┼──────────────┼──────────────┼──────────────────┤
│ #1001    │ Shop Test ABC   │ 500.000₫     │ 15/05/2026   │ 22/05/2026       │
│ #1002    │ Shop XYZ        │ 300.000₫     │ 16/05/2026   │ 23/05/2026       │
│ ...      │ ...             │ ...          │ ...          │ ...              │
└──────────┴─────────────────┴──────────────┴──────────────┴──────────────────┘
```

✅ **Điều kiện đơn hàng hiển thị**:
- ✅ Đã giao hàng thành công
- ✅ Đã thanh toán
- ✅ Hết hạn đổi trả (> 7 ngày)
- ✅ Chưa đối soát
- ✅ Không có tranh chấp đang xử lý

### Bước 3: Tạo phiên đối soát

1. Click button **"Tạo phiên đối soát"** (góc trên bên phải)
2. Modal hiển thị form:

**Điền thông tin:**
```
Tên phiên: Đối soát tháng 5/2026
Từ ngày: 01/05/2026 00:00
Đến ngày: 31/05/2026 23:59
Ghi chú: Đối soát định kỳ cuối tháng 5
```

3. Click button **"Tạo phiên"**

✅ **Kết quả mong đợi**:
- Toast thông báo: "Tạo phiên đối soát thành công"
- Modal tự động đóng
- Tự động chuyển sang tab "Phiên đối soát"
- Phiên mới xuất hiện với trạng thái "DANG_XU_LY"

✅ **Kiểm tra backend**:
- Tạo bản ghi PhienDoiSoat
- Tạo chi tiết ChiTietDoiSoat cho từng đơn
- Đánh dấu các đơn hàng: DaDoiSoat = 1
- Tính toán đúng:
  ```
  Doanh thu = TienThanhToan
  Phí sàn = Doanh thu × 5%
  Tiền thực nhận = Doanh thu - Phí sàn
  ```

### Bước 4: Xem danh sách phiên đối soát

1. Click tab **"Phiên đối soát"**

✅ **Kết quả mong đợi**: Hiển thị danh sách phiên với:

```
┌────────────────────────────────────────────────────────────────────┐
│ Đối soát tháng 5/2026                    [DANG_XU_LY]             │
├────────────────────────────────────────────────────────────────────┤
│ Đơn hàng: 10                                                       │
│ Doanh thu: 5.000.000₫                                             │
│ Phí sàn: 250.000₫                                                 │
│ Chi trả shop: 4.750.000₫                                          │
│                                                                    │
│ 01/05/2026 → 31/05/2026 · Bởi Admin                              │
│                                                                    │
│ [Chi tiết]  [Chi trả]                                             │
└────────────────────────────────────────────────────────────────────┘
```

### Bước 5: Xem chi tiết phiên đối soát

1. Click button **"Chi tiết"** trên một phiên

✅ **Kết quả mong đợi**: Modal hiển thị chi tiết theo cửa hàng:

```
┌────────────────────────────────────────────────────────────────┐
│ Đối soát tháng 5/2026                                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Shop Test ABC                              1.425.000₫          │
│ 3 đơn hàng                                 Phí: 75.000₫        │
│                                                                │
│ Shop XYZ                                   950.000₫            │
│ 2 đơn hàng                                 Phí: 50.000₫        │
│                                                                │
│ ...                                                            │
│                                                                │
│                                            [Đóng]              │
└────────────────────────────────────────────────────────────────┘
```

### Bước 6: Thực hiện chi trả

1. Quay lại tab "Phiên đối soát"
2. Tìm phiên có trạng thái **"DANG_XU_LY"**
3. Click button **"Chi trả"**
4. Confirm: "Xác nhận thực hiện chi trả tiền cho người bán?"
5. Click **"OK"**

✅ **Kết quả mong đợi**:
- Toast thông báo: "Thực hiện chi trả thành công"
- Trạng thái phiên chuyển sang **"HOAN_THANH"**
- Button "Chi trả" biến mất
- Hiển thị ngày hoàn thành

✅ **Kiểm tra backend**:
- Cộng tiền vào ví từng cửa hàng
- Cập nhật trạng thái: HOAN_THANH
- Ghi nhận NgayHoanThanh
- Cập nhật ChiTietDoiSoat: DA_CHI_TRA

### Bước 7: Test Exception Flow - Số liệu âm

**Giả lập trường hợp có lỗi:**

1. Tạo một đơn hàng có giá trị âm (test data)
2. Tạo phiên đối soát bao gồm đơn hàng đó
3. Click "Chi trả"

✅ **Kết quả mong đợi**:
- Toast lỗi: "Phát hiện số liệu tổng tiền bị âm, tính năng chia tiền bị chặn lại để chờ kiểm tra thủ công"
- Trạng thái phiên: **"LOI"**
- Ghi chú: "Phát hiện số liệu bị âm, cần kiểm tra thủ công"
- Không thể chi trả
- Admin phải kiểm tra và sửa dữ liệu

### Bước 8: Quản lý cấu hình

1. Click tab **"Cấu hình"**

✅ **Kết quả mong đợi**: Hiển thị danh sách cấu hình:

```
┌────────────────────────────────────────────────────────────┐
│ PHI_SAN_PHAN_TRAM                                          │
│ Phần trăm phí sàn thu từ mỗi giao dịch                     │
│ [5                                    ] [Lưu]              │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ SO_NGAY_DOI_TRA                                            │
│ Số ngày người mua có thể đổi trả sản phẩm                  │
│ [7                                    ] [Lưu]              │
└────────────────────────────────────────────────────────────┘
```

2. Thay đổi phí sàn từ 5 → 6
3. Click **"Lưu"**

✅ **Kết quả mong đợi**:
- Toast: "Đã cập nhật cấu hình"
- Giá trị được lưu
- Các phiên đối soát mới sẽ dùng phí sàn 6%

---

## 📊 CHECKLIST TỔNG HỢP

### ✅ Giải quyết tranh chấp đổi trả

- [ ] Đăng nhập Admin thành công
- [ ] Vào trang Giải quyết tranh chấp
- [ ] Xem danh sách tranh chấp
- [ ] Filter theo trạng thái (4 tab)
- [ ] Click "Xem & Xử lý"
- [ ] Xem thông tin 2 bên (người mua, người bán)
- [ ] Xem lý do tranh chấp (chữ tiếng Việt rõ)
- [ ] Xem giá trị đơn hàng
- [ ] Xem video bằng chứng (link click được)
- [ ] Xem lịch sử xử lý
- [ ] Nhập lý do quyết định
- [ ] Phán quyết: Đồng ý hoàn tiền
- [ ] Kiểm tra thông báo thành công
- [ ] Kiểm tra tranh chấp chuyển sang "Đã giải quyết"
- [ ] Phán quyết: Từ chối hoàn tiền
- [ ] Kiểm tra không thể phán quyết lại

### ✅ Đối soát & Chia tiền

- [ ] Vào trang Đối soát & Chia tiền
- [ ] Tab "Đơn đủ điều kiện"
- [ ] Xem thống kê tổng hợp (4 số liệu)
- [ ] Xem bảng chi tiết đơn hàng
- [ ] Click "Tạo phiên đối soát"
- [ ] Điền thông tin phiên
- [ ] Tạo phiên thành công
- [ ] Tab "Phiên đối soát"
- [ ] Xem danh sách phiên
- [ ] Click "Chi tiết" xem chi tiết phiên
- [ ] Click "Chi trả" thực hiện chi trả
- [ ] Xác nhận chi trả
- [ ] Kiểm tra phiên chuyển "Hoàn thành"
- [ ] Tab "Cấu hình"
- [ ] Xem cấu hình hệ thống
- [ ] Thay đổi phí sàn
- [ ] Lưu cấu hình thành công
- [ ] Test exception: Số liệu âm bị chặn

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi test xong, bạn sẽ thấy:

✅ **Giải quyết tranh chấp**:
- Admin có thể xem và xử lý tranh chấp dễ dàng
- Thông tin hiển thị đầy đủ, rõ ràng
- Phán quyết được thực hiện nhanh chóng
- Hệ thống tự động xử lý tiền
- Không thể phán quyết lại sau khi đã xử lý

✅ **Đối soát & Chia tiền**:
- Hệ thống tự động tính toán chính xác
- Tạo phiên đối soát dễ dàng
- Chi trả tiền cho người bán tự động
- Kiểm tra lỗi số liệu âm
- Quản lý cấu hình linh hoạt

---

## 🐛 NẾU GẶP LỖI

### Lỗi: Không có dữ liệu tranh chấp

**Giải pháp**: Chạy seed data
```sql
-- Chạy file: database/seed_dispute_settlement.sql
```

### Lỗi: Không có đơn hàng đủ điều kiện

**Giải pháp**: Tạo đơn hàng test
```sql
-- Cập nhật đơn hàng để hết hạn đổi trả
UPDATE DonHang
SET NgayHetHanDoiTra = DATEADD(day, -1, GETDATE())
WHERE TrangThaiDonHang = N'DA_GIAO'
```

### Lỗi: Token hết hạn

**Giải pháp**: Đăng nhập lại
1. Logout
2. Login lại với admin@test.com

---

**Chúc bạn test thành công! 🎉**
