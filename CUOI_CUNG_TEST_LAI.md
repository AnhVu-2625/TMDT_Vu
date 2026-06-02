# ✅ HƯỚNG DẪN TEST LẠI SAU KHI SỬA LỖI

## 🔧 ĐÃ SỬA GÌ?

### 1. **Backend đã được RESTART hoàn toàn**
- Stop process cũ (Terminal ID: 9)
- Start process mới (Terminal ID: 10)
- Backend đang chạy tại: http://localhost:5000
- Code mới đã được load (không còn dùng stored procedure có lỗi)

### 2. **Code đã sửa**
- ✅ `dispute.js`: Thay stored procedure `sp_CapNhatViCuaHang` bằng INSERT trực tiếp vào `LichSuGiaoDichVi`
- ✅ `settlement.js`: Tương tự, dùng INSERT trực tiếp
- ✅ `Settlement.jsx`: Đã có check null cho ngày tháng (`value ? new Date(value).toLocaleDateString() : '-'`)

---

## 🧪 CÁCH TEST NHANH

### **Bước 1: Đăng nhập Admin**
1. Mở trình duyệt: http://localhost:3000
2. Đăng nhập với:
   - Email: `admin@test.com`
   - Password: `Admin@123`

### **Bước 2: Test Giải quyết tranh chấp**

#### A. Xem danh sách tranh chấp
1. Vào menu: **Quản lý tranh chấp**
2. Kiểm tra có tranh chấp nào đang chờ xử lý không
3. Trạng thái cần xử lý: `KHIEU_NAI_ADMIN` (màu vàng)

#### B. Giải quyết tranh chấp
1. Click vào một tranh chấp để xem chi tiết
2. Chọn quyết định:
   - **Đồng ý hoàn tiền**: Tiền sẽ trả lại người mua
   - **Từ chối hoàn tiền**: Tiền thuộc về người bán
3. Nhập lý do quyết định
4. Click **Xác nhận**

#### C. Kiểm tra kết quả
- ✅ Không còn lỗi 500 Internal Server Error
- ✅ Thông báo "Giải quyết tranh chấp thành công"
- ✅ Trạng thái tranh chấp chuyển sang `DA_GIAI_QUYET`
- ✅ Có ghi log vào bảng `LichSuGiaoDichVi`

---

### **Bước 3: Test Đối soát & Chia tiền**

#### A. Xem đơn hàng đủ điều kiện
1. Vào menu: **Đối soát & Chia tiền**
2. Tab: **Đơn hàng đủ điều kiện**
3. Kiểm tra:
   - ✅ Cột "Ngày giao hàng" hiển thị đúng (không còn "Invalid Date")
   - ✅ Cột "Hết hạn đổi trả" hiển thị đúng
   - ✅ Tổng doanh thu, phí sàn, tiền chi trả được tính đúng

#### B. Tạo phiên đối soát
1. Click **Tạo phiên đối soát**
2. Điền thông tin:
   - Tên phiên: `Test đối soát tháng 5`
   - Từ ngày: `2026-05-01`
   - Đến ngày: `2026-05-31`
   - Ghi chú: `Test sau khi sửa lỗi`
3. Click **Tạo phiên**

#### C. Thực hiện chi trả
1. Tab: **Phiên đối soát**
2. Click vào phiên vừa tạo để xem chi tiết
3. Click **Thực hiện chi trả**
4. Xác nhận

#### D. Kiểm tra kết quả
- ✅ Không còn lỗi 500
- ✅ Thông báo "Thực hiện chi trả thành công"
- ✅ Trạng thái phiên chuyển sang `HOAN_THANH`
- ✅ Có ghi log vào bảng `LichSuGiaoDichVi`

---

## 🔍 KIỂM TRA DATABASE

### Xem log giao dịch ví
```sql
USE ThuongMaiDienTu;

-- Xem tất cả giao dịch ví
SELECT TOP 20 
    ls.*,
    ch.TenCuaHang
FROM LichSuGiaoDichVi ls
INNER JOIN CuaHang ch ON ls.MaCuaHang = ch.MaCuaHang
ORDER BY ls.NgayTao DESC;
```

### Xem tranh chấp đã giải quyết
```sql
-- Xem tranh chấp đã xử lý
SELECT 
    dt.MaDoiTra,
    dt.MaDonHang,
    dt.TrangThai,
    dt.QuyetDinhAdmin,
    dt.QuyetDinhCuaAdmin,
    dt.NgayQuyetDinh,
    admin.HoTen as AdminXuLy
FROM YeuCauDoiTra dt
LEFT JOIN NguoiDung admin ON dt.AdminXuLy = admin.MaNguoiDung
WHERE dt.TrangThai = N'DA_GIAI_QUYET'
ORDER BY dt.NgayQuyetDinh DESC;
```

### Xem phiên đối soát
```sql
-- Xem phiên đối soát đã hoàn thành
SELECT 
    ps.*,
    nd.HoTen as NguoiThucHien
FROM PhienDoiSoat ps
LEFT JOIN NguoiDung nd ON ps.NguoiThucHien = nd.MaNguoiDung
ORDER BY ps.NgayTao DESC;
```

---

## ❌ NẾU VẪN CÒN LỖI

### Lỗi 500 khi resolve dispute
1. Mở Developer Tools (F12)
2. Tab Network → Xem response của API `/api/disputes/{id}/resolve`
3. Copy lỗi chi tiết và báo lại

### Lỗi "Invalid Date"
1. Kiểm tra dữ liệu trong database:
```sql
SELECT TOP 5 
    MaDonHang,
    NgayCapNhat as NgayGiaoHang,
    NgayHetHanDoiTra,
    TrangThaiDonHang
FROM DonHang
WHERE TrangThaiDonHang = N'DA_GIAO'
ORDER BY MaDonHang DESC;
```

2. Nếu `NgayCapNhat` hoặc `NgayHetHanDoiTra` là NULL → Cần update dữ liệu test

### Backend không chạy code mới
1. Stop backend: Ctrl+C trong terminal backend
2. Xóa cache: `rd /s /q node_modules\.cache` (nếu có)
3. Start lại: `node src/server.js`

---

## 📊 KẾT QUẢ MONG ĐỢI

### ✅ Chức năng Giải quyết tranh chấp
- [x] Admin xem được danh sách tranh chấp
- [x] Admin xem được chi tiết tranh chấp (video, lịch sử)
- [x] Admin giải quyết thành công (đồng ý/từ chối hoàn tiền)
- [x] Không còn lỗi 500
- [x] Ghi log vào `LichSuGiaoDichVi`
- [x] Cập nhật trạng thái đơn hàng

### ✅ Chức năng Đối soát & Chia tiền
- [x] Xem được đơn hàng đủ điều kiện
- [x] Hiển thị đúng ngày tháng (không còn Invalid Date)
- [x] Tạo phiên đối soát thành công
- [x] Tính toán đúng: Doanh thu - Phí sàn = Tiền chi trả
- [x] Thực hiện chi trả thành công
- [x] Không còn lỗi 500
- [x] Ghi log vào `LichSuGiaoDichVi`

---

## 🎯 LƯU Ý QUAN TRỌNG

1. **Backend PHẢI chạy code mới** (Terminal ID: 10)
   - Kiểm tra: `http://localhost:5000` phải trả về "API is running"
   
2. **Frontend phải refresh** sau khi backend restart
   - Nhấn F5 hoặc Ctrl+R trong trình duyệt

3. **Dữ liệu test phải đúng**
   - Đơn hàng phải có trạng thái `DA_GIAO`
   - Đơn hàng phải đã hết hạn đổi trả (`NgayHetHanDoiTra < GETDATE()`)
   - Tranh chấp phải có trạng thái `KHIEU_NAI_ADMIN`

4. **Stored procedure KHÔNG được dùng** (tạm thời)
   - Code hiện tại dùng INSERT trực tiếp
   - Sau khi test OK, có thể sửa lại stored procedure

---

## 📞 BÁO CÁO KẾT QUẢ

Sau khi test, vui lòng báo cáo:

### ✅ Nếu thành công:
- "Đã test OK cả 2 chức năng"
- Screenshot kết quả (nếu có)

### ❌ Nếu vẫn lỗi:
- Chức năng nào bị lỗi?
- Lỗi gì? (copy message lỗi)
- Screenshot lỗi trong Developer Tools (F12 → Network tab)

---

**Chúc test thành công! 🚀**
