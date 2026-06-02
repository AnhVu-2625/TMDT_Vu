# ⚡ CHECKLIST TEST NHANH

## 🎯 MỤC TIÊU
Kiểm tra 2 chức năng đã hoạt động đúng sau khi sửa lỗi

---

## ✅ TRƯỚC KHI TEST

### 1. Kiểm tra Backend đang chạy
- [ ] Mở http://localhost:5000 → Phải thấy "API is running"
- [ ] Terminal backend hiển thị: `🚀 Server running on http://localhost:5000`
- [ ] Terminal ID: **10** (không phải 9)

### 2. Kiểm tra Frontend đang chạy
- [ ] Mở http://localhost:3000 → Phải thấy trang login
- [ ] Nhấn F5 để refresh (đảm bảo load code mới)

### 3. Đăng nhập Admin
- [ ] Email: `admin@test.com`
- [ ] Password: `Admin@123`
- [ ] Đăng nhập thành công → Vào trang Dashboard

---

## 🧪 TEST 1: GIẢI QUYẾT TRANH CHẤP

### Bước 1: Vào trang Quản lý tranh chấp
- [ ] Click menu "Quản lý tranh chấp"
- [ ] Trang load thành công (không lỗi)

### Bước 2: Xem danh sách tranh chấp
- [ ] Có hiển thị danh sách tranh chấp
- [ ] Có tranh chấp nào trạng thái `KHIEU_NAI_ADMIN` (màu vàng)?

### Bước 3: Giải quyết tranh chấp
- [ ] Click vào một tranh chấp để xem chi tiết
- [ ] Chọn quyết định: "Đồng ý hoàn tiền" hoặc "Từ chối hoàn tiền"
- [ ] Nhập lý do: `Test sau khi sửa lỗi`
- [ ] Click "Xác nhận"

### Bước 4: Kiểm tra kết quả
- [ ] **KHÔNG CÒN LỖI 500** ✅
- [ ] Thông báo: "Giải quyết tranh chấp thành công"
- [ ] Trạng thái tranh chấp chuyển sang `DA_GIAI_QUYET`

### ❌ Nếu vẫn lỗi 500:
1. Mở Developer Tools (F12)
2. Tab Network → Tìm request `/api/disputes/{id}/resolve`
3. Click vào request → Tab Response
4. Copy toàn bộ lỗi và báo lại

---

## 🧪 TEST 2: ĐỐI SOÁT & CHIA TIỀN

### Bước 1: Vào trang Đối soát & Chia tiền
- [ ] Click menu "Đối soát & Chia tiền"
- [ ] Trang load thành công (không lỗi)

### Bước 2: Xem đơn hàng đủ điều kiện
- [ ] Tab "Đơn hàng đủ điều kiện"
- [ ] Có hiển thị danh sách đơn hàng
- [ ] **Cột "Ngày giao hàng" hiển thị đúng** (không còn "Invalid Date") ✅
- [ ] **Cột "Hết hạn đổi trả" hiển thị đúng** (không còn "Invalid Date") ✅
- [ ] Tổng doanh thu, phí sàn, tiền chi trả được tính

### Bước 3: Tạo phiên đối soát
- [ ] Click "Tạo phiên đối soát"
- [ ] Điền thông tin:
  - Tên phiên: `Test tháng 5`
  - Từ ngày: `2026-05-01`
  - Đến ngày: `2026-05-31`
  - Ghi chú: `Test sau khi sửa lỗi`
- [ ] Click "Tạo phiên"

### Bước 4: Kiểm tra kết quả tạo phiên
- [ ] **KHÔNG CÒN LỖI 500** ✅
- [ ] Thông báo: "Tạo phiên đối soát thành công"
- [ ] Chuyển sang tab "Phiên đối soát"
- [ ] Thấy phiên vừa tạo trong danh sách

### Bước 5: Thực hiện chi trả
- [ ] Click vào phiên vừa tạo để xem chi tiết
- [ ] Click "Thực hiện chi trả"
- [ ] Xác nhận

### Bước 6: Kiểm tra kết quả chi trả
- [ ] **KHÔNG CÒN LỖI 500** ✅
- [ ] Thông báo: "Thực hiện chi trả thành công"
- [ ] Trạng thái phiên chuyển sang `HOAN_THANH`

### ❌ Nếu vẫn lỗi:
1. Mở Developer Tools (F12)
2. Tab Network → Tìm request bị lỗi
3. Copy lỗi và báo lại

---

## 🎉 KẾT QUẢ CUỐI CÙNG

### ✅ Nếu TẤT CẢ đều PASS:
```
🎊 HOÀN THÀNH! CẢ 2 CHỨC NĂNG ĐÃ HOẠT ĐỘNG ĐÚNG!

✅ Giải quyết tranh chấp: OK
✅ Đối soát & Chia tiền: OK
✅ Không còn lỗi 500: OK
✅ Hiển thị ngày tháng đúng: OK
```

### ❌ Nếu VẪN CÒN LỖI:
Báo cáo chi tiết:
1. Chức năng nào bị lỗi?
2. Lỗi gì? (copy message)
3. Screenshot lỗi

---

## 🔍 KIỂM TRA THÊM (TÙY CHỌN)

### Xem log trong Database
```sql
USE ThuongMaiDienTu;

-- Xem log giao dịch ví (phải có dữ liệu mới)
SELECT TOP 10 
    ls.*,
    ch.TenCuaHang
FROM LichSuGiaoDichVi ls
INNER JOIN CuaHang ch ON ls.MaCuaHang = ch.MaCuaHang
ORDER BY ls.NgayTao DESC;

-- Xem tranh chấp đã giải quyết
SELECT TOP 5
    dt.MaDoiTra,
    dt.MaDonHang,
    dt.TrangThai,
    dt.QuyetDinhAdmin,
    dt.NgayQuyetDinh
FROM YeuCauDoiTra dt
WHERE dt.TrangThai = N'DA_GIAI_QUYET'
ORDER BY dt.NgayQuyetDinh DESC;

-- Xem phiên đối soát
SELECT TOP 5
    ps.MaPhienDoiSoat,
    ps.TenPhien,
    ps.TrangThai,
    ps.TongDonHang,
    ps.TongDoanhThu,
    ps.TongPhiSan,
    ps.TongChiTraNguoiBan
FROM PhienDoiSoat ps
ORDER BY ps.NgayTao DESC;
```

---

## 📞 HỖ TRỢ

Nếu cần hỗ trợ, cung cấp:
1. ✅ hoặc ❌ cho từng bước trong checklist
2. Screenshot lỗi (nếu có)
3. Log từ Developer Tools (F12 → Console/Network)

---

**Chúc test thành công! 🚀**
