# 🧪 HƯỚNG DẪN TEST ĐỐI SOÁT & CHIA TIỀN

## ✅ Giải quyết tranh chấp đã OK!

Bây giờ test chức năng **Đối soát & Chia tiền**.

---

## ❌ VẤN ĐỀ: Không hiển thị ngày

Có 2 khả năng:
1. **Dữ liệu trong database NULL** → Cần update dữ liệu
2. **Frontend không format đúng** → Đã sửa rồi

---

## 🔧 BƯỚC 1: SỬA DỮ LIỆU DATABASE

### Cách 1: Chạy script SQL (KHUYẾN NGHỊ)

1. Mở **SQL Server Management Studio** (SSMS)
2. Kết nối database `ThuongMaiDienTu`
3. Mở file: `backend/fix-settlement-dates.sql`
4. Chạy script (F5)

Script sẽ:
- ✅ Update `NgayHetHanDoiTra` cho các đơn hàng chưa có
- ✅ Tạo 3 đơn hàng đủ điều kiện đối soát (để test)
- ✅ Hiển thị kết quả

### Cách 2: Chạy query thủ công

```sql
USE ThuongMaiDienTu;

-- Update NgayHetHanDoiTra
UPDATE DonHang
SET NgayHetHanDoiTra = DATEADD(DAY, 7, NgayCapNhat)
WHERE TrangThaiDonHang = N'DA_GIAO'
    AND NgayHetHanDoiTra IS NULL;

-- Tạo đơn hàng test
UPDATE TOP (3) DonHang
SET NgayHetHanDoiTra = DATEADD(DAY, -1, GETDATE()),
    NgayCapNhat = DATEADD(DAY, -8, GETDATE()),
    DaDoiSoat = 0
WHERE TrangThaiDonHang = N'DA_GIAO'
    AND TrangThaiThanhToan = N'DA_THANH_TOAN';
```

---

## 🧪 BƯỚC 2: TEST TRÊN FRONTEND

### 1. Refresh trình duyệt
- Nhấn **Ctrl + Shift + R**

### 2. Vào trang Đối soát & Chia tiền
- Click menu **"Đối soát & Chia tiền"**
- Tab: **"Đơn hàng đủ điều kiện"**

### 3. Kiểm tra hiển thị

#### ✅ NẾU OK:
- Cột **"Ngày giao hàng"**: Hiển thị ngày (VD: 23/05/2026)
- Cột **"Hết hạn đổi trả"**: Hiển thị ngày (VD: 30/05/2026)
- Có danh sách đơn hàng

#### ❌ NẾU VẪN LỖI:
- Hiển thị "Invalid Date"
- Hoặc hiển thị "-"
- Hoặc không có đơn hàng nào

---

## 🔍 BƯỚC 3: KIỂM TRA DỮ LIỆU

Nếu vẫn không hiển thị, chạy query kiểm tra:

```sql
USE ThuongMaiDienTu;

-- Xem đơn hàng đủ điều kiện
SELECT TOP 5
    dh.MaDonHang,
    ch.TenCuaHang,
    dh.TienThanhToan,
    dh.NgayCapNhat as NgayGiaoHang,
    dh.NgayHetHanDoiTra,
    dh.TrangThaiDonHang,
    dh.TrangThaiThanhToan,
    dh.DaDoiSoat
FROM DonHang dh
INNER JOIN CuaHang ch ON dh.MaCuaHang = ch.MaCuaHang
WHERE dh.TrangThaiDonHang = N'DA_GIAO'
    AND dh.TrangThaiThanhToan = N'DA_THANH_TOAN'
    AND dh.DaDoiSoat = 0
ORDER BY dh.MaDonHang DESC;
```

**Kiểm tra:**
- `NgayCapNhat` có NULL không?
- `NgayHetHanDoiTra` có NULL không?
- Có đơn hàng nào `NgayHetHanDoiTra < GETDATE()` không?

---

## 🧪 BƯỚC 4: TEST TẠO PHIÊN ĐỐI SOÁT

Sau khi thấy danh sách đơn hàng:

### 1. Tạo phiên đối soát
- Click **"Tạo phiên đối soát"**
- Điền thông tin:
  - Tên phiên: `Test đối soát tháng 5`
  - Từ ngày: `2026-05-01`
  - Đến ngày: `2026-05-31`
  - Ghi chú: `Test sau khi sửa lỗi`
- Click **"Tạo phiên"**

### 2. Kiểm tra kết quả

#### ✅ NẾU THÀNH CÔNG:
- Thông báo: "Tạo phiên đối soát thành công"
- Chuyển sang tab "Phiên đối soát"
- Thấy phiên vừa tạo

#### ❌ NẾU LỖI:
- Lỗi 500
- Hoặc thông báo: "Không có đơn hàng nào đủ điều kiện"

---

## 🧪 BƯỚC 5: TEST THỰC HIỆN CHI TRẢ

### 1. Xem chi tiết phiên
- Tab "Phiên đối soát"
- Click vào phiên vừa tạo

### 2. Thực hiện chi trả
- Click **"Thực hiện chi trả"**
- Xác nhận

### 3. Kiểm tra kết quả

#### ✅ NẾU THÀNH CÔNG:
- Thông báo: "Thực hiện chi trả thành công"
- Trạng thái phiên chuyển sang `HOAN_THANH`

#### ❌ NẾU LỖI:
- Lỗi 500
- Báo lại để tôi kiểm tra

---

## 📊 KIỂM TRA LOG DATABASE

Sau khi thực hiện chi trả, kiểm tra log:

```sql
USE ThuongMaiDienTu;

-- Xem log giao dịch ví
SELECT TOP 10
    ls.*,
    ch.TenCuaHang
FROM LichSuGiaoDichVi ls
INNER JOIN CuaHang ch ON ls.MaCuaHang = ch.MaCuaHang
ORDER BY ls.NgayTao DESC;

-- Xem phiên đối soát
SELECT TOP 5
    ps.*
FROM PhienDoiSoat ps
ORDER BY ps.NgayTao DESC;
```

---

## 🎯 KẾT QUẢ MONG ĐỢI

### ✅ Chức năng Đối soát & Chia tiền
- [x] Hiển thị đúng ngày tháng
- [x] Có danh sách đơn hàng đủ điều kiện
- [x] Tạo phiên đối soát thành công
- [x] Thực hiện chi trả thành công
- [x] Ghi log vào database

---

## 📞 BÁO CÁO KẾT QUẢ

Sau khi test, vui lòng báo cáo:

### ✅ Nếu thành công:
"Đã OK! Cả 2 chức năng hoạt động tốt"

### ❌ Nếu vẫn lỗi:
1. Lỗi ở bước nào?
2. Hiển thị gì? (Screenshot nếu có)
3. Có chạy script SQL chưa?

---

**Hãy chạy script SQL trước, rồi test lại! 🚀**
