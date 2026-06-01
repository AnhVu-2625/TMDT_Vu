# TODO - Fix thêm/sửa/xóa sản phẩm

## Step 1: Xác định endpoint hiện tại

- [x] Đọc backend `backend/src/routes/product.js` để xem có endpoint thêm/sửa/xóa cho seller chưa
- [x] Đọc frontend `frontend/src/pages/seller/Dashboard.jsx` để xem đang gọi endpoint nào
- [x] Nhận thấy UI GET danh sách sản phẩm chưa lọc theo shop → dễ dẫn tới lỗi quyền khi PUT/DELETE

## Step 2: Backend - Thêm endpoint lấy sản phẩm của seller

- [x] Thêm `GET /api/products/seller` trong `backend/src/routes/product.js`
- [x] Endpoint dùng `authenticateToken` + `requireSeller` và lọc theo `req.shop.MaCuaHang`

## Step 3: Frontend - Sửa seller Dashboard để dùng endpoint mới

- [x] Cập nhật `fetchProducts()` trong `frontend/src/pages/seller/Dashboard.jsx` để gọi `/products/seller`
- [x] Giữ nguyên phần `POST/PUT/DELETE` (vì backend đã có check quyền theo `MaCuaHang`)

## Step 4: Rà soát UI error handling

- [x] Nếu có 403 liên quan shopStatus/chưa đăng ký shop: hiển thị toast đúng message

## Step 5: Test

- [ ] Start backend + frontend
- [ ] Login seller hợp lệ
- [ ] Thêm/sửa/xóa sản phẩm trên dashboard xem có chạy được không
