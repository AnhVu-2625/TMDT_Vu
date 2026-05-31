# 🚀 HƯỚNG DẪN TEST NHANH

## ✅ Đã chuẩn bị sẵn

- ✅ Database đã có đủ bảng
- ✅ Dữ liệu test đã được tạo:
  - 2 tranh chấp (1 shop từ chối, 1 đang chờ admin)
  - 5 đơn hàng đủ điều kiện đối soát
  - Tổng tiền: 2,500,000 VNĐ
- ✅ Backend đang chạy: http://localhost:5000

## 📝 Cách test (3 bước đơn giản)

### Bước 1: Mở file test

Mở file: `backend/test-quick-start.http`

### Bước 2: Lấy admin token

1. Tìm section "BƯỚC 1: LOGIN VÀ LẤY TOKEN"
2. Click vào "Send Request" (hoặc Ctrl+Alt+R) ở dòng:
   ```http
   POST {{baseUrl}}/auth/login
   ```
3. Copy token từ response (phần `"token": "eyJhbGc..."`)
4. Paste vào dòng:
   ```http
   @adminToken = YOUR_TOKEN_HERE
   ```

**Thông tin login:**
- Email: `admin@marthub.vn`
- Password: `Admin@123`

### Bước 3: Test các API

Bây giờ bạn có thể test tất cả API:

#### Test Dispute (Tranh chấp)
```http
# Xem danh sách
GET {{baseUrl}}/disputes

# Xem chi tiết
GET {{baseUrl}}/disputes/1

# Admin giải quyết
POST {{baseUrl}}/disputes/2/resolve
```

#### Test Settlement (Đối soát)
```http
# Xem đơn hàng đủ điều kiện
GET {{baseUrl}}/settlements/eligible-orders

# Tạo phiên đối soát
POST {{baseUrl}}/settlements

# Thực hiện chi trả
POST {{baseUrl}}/settlements/1/execute
```

## 🎯 Kết quả mong đợi

### Dispute API
- Danh sách: Trả về 2 tranh chấp
- Chi tiết: Có đầy đủ thông tin người mua, người bán, video
- Giải quyết: Thành công, tự động xử lý tiền

### Settlement API
- Eligible orders: 5 đơn hàng, tổng 2,500,000 VNĐ
- Tạo phiên: Thành công, tính phí sàn 5% = 125,000 VNĐ
- Chi trả: Thành công, cộng 2,375,000 VNĐ vào ví shop

## 🐛 Nếu gặp lỗi

### Lỗi 401 Unauthorized
→ Token chưa đúng hoặc đã hết hạn
→ Chạy lại login và lấy token mới

### Lỗi 404 Not Found
→ Kiểm tra URL có đúng không
→ Backend có đang chạy không (http://localhost:5000)

### Lỗi 500 Internal Server Error
→ Xem backend logs
→ Kiểm tra database có chạy không

## 📊 Kiểm tra dữ liệu

### Xem tranh chấp trong database
```sql
SELECT * FROM YeuCauDoiTra;
SELECT * FROM LichSuTrancChap;
```

### Xem đơn hàng đủ điều kiện
```sql
SELECT * FROM DonHang 
WHERE TrangThaiDonHang = N'DA_GIAO' 
AND DaDoiSoat = 0 
AND NgayHetHanDoiTra < GETDATE();
```

### Xem phiên đối soát
```sql
SELECT * FROM PhienDoiSoat;
SELECT * FROM ChiTietDoiSoat;
```

## 🎓 Tài liệu chi tiết

- `TOM_TAT_TINH_NANG.md` - Tóm tắt tính năng
- `DISPUTE_SETTLEMENT_README.md` - Hướng dẫn đầy đủ
- `docs/DISPUTE_SETTLEMENT_FEATURES.md` - API documentation

## ✨ Tips

1. **Dùng VS Code REST Client extension** để test file .http
2. **Xem Swagger UI** tại http://localhost:5000/api-docs
3. **Xem backend logs** để debug
4. **Test từng API một** theo thứ tự trong file

---

**Chúc bạn test thành công! 🎉**

Nếu vẫn gặp vấn đề, hãy cho mình biết lỗi cụ thể là gì nhé!
