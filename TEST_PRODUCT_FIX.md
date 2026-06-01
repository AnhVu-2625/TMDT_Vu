# 🧪 Test Hướng Dẫn - Sửa Lỗi Thêm/Sửa/Xóa Sản Phẩm

## ✅ Bug Đã Sửa

- **Root Cause:** Routes không đúng thứ tự → `/seller` và `/categories/all` bị `/:id` catch trước
- **Fix:** Chuyển `GET /seller` và `GET /categories/all` lên trước `GET /:id`

---

## 📋 Test Steps

### Bước 1: Start Backend

```bash
cd WEB_SAN_TMDT/backend
npm install
npm start
```

✅ Chạy trên `http://localhost:5000`

---

### Bước 2: Start Frontend

```bash
cd WEB_SAN_TMDT/frontend
npm install
npm run dev
```

✅ Chạy trên `http://localhost:5173` (hoặc port khác)

---

### Bước 3: Test Quyền & Functionality

#### 3.1 Đăng nhập Seller

- Vào trang login
- Đăng nhập với seller account (có shop đã duyệt)
  - Email: `seller@example.com` hoặc `seller@marthub.vn`
  - Password: `Seller@123` hoặc theo test data

**Expected:** ✅ Login thành công, nhận token

---

#### 3.2 Vào Seller Dashboard

- Click vào "Quản lý sản phẩm" hoặc /seller
- Frontend gọi `GET /api/products/seller`

**Expected:**

- ✅ Danh sách sản phẩm của shop này hiện ra
- ✅ Không bị lỗi 404 hoặc "Không tìm thấy"
- ✅ Console không có lỗi network

---

#### 3.3 Thêm Sản Phẩm

- Click nút "Thêm sản phẩm"
- Điền form:
  ```
  Tên: "Test Laptop 2024"
  Giá gốc: 25000000
  Danh mục: (chọn cái gì đó)
  Mô tả: "Sản phẩm test"
  ```
- Click "Thêm sản phẩm"

**Expected:**

- ✅ Toast: "Thêm sản phẩm mới thành công! 🎉"
- ✅ Modal đóng
- ✅ Sản phẩm mới hiển thị trong table
- ✅ Backend không có lỗi

**Backend Test (Postman/REST Client):**

```http
POST http://localhost:5000/api/products
Authorization: Bearer {{sellerToken}}
Content-Type: application/json

{
  "tenSanPham": "Test Laptop 2024",
  "moTa": "Sản phẩm test",
  "giaGoc": 25000000,
  "maDanhMuc": 1
}
```

---

#### 3.4 Sửa Sản Phẩm

- Click nút "✏️" (edit) trên sản phẩm vừa tạo
- Sửa tên: "Test Laptop 2024 UPDATED"
- Click "Cập nhật"

**Expected:**

- ✅ Toast: "Cập nhật sản phẩm thành công! ✨"
- ✅ Tên sản phẩm cập nhật trong table
- ✅ API call: `PUT /api/products/{id}`

**Backend Test:**

```http
PUT http://localhost:5000/api/products/10
Authorization: Bearer {{sellerToken}}
Content-Type: application/json

{
  "tenSanPham": "Test Laptop 2024 UPDATED",
  "moTa": "Sản phẩm test",
  "giaGoc": 25000000,
  "maDanhMuc": 1,
  "trangThai": "HOAT_DONG"
}
```

---

#### 3.5 Xóa Sản Phẩm

- Click nút "🗑️" (delete)
- Confirm dialog: "Bạn có chắc chắn muốn xóa..."
- Click OK

**Expected:**

- ✅ Toast: "Đã xóa sản phẩm thành công!"
- ✅ Sản phẩm vẫn hiển thị nhưng status = "AN" (ẩn)
- ✅ API call: `DELETE /api/products/{id}`

**Backend Test:**

```http
DELETE http://localhost:5000/api/products/10
Authorization: Bearer {{sellerToken}}
```

---

#### 3.6 Toggle Trạng Thái

- Click button "🟢 Đang bán" hoặc "🔴 Đã ẩn" để toggle
- Status sẽ thay đổi

**Expected:**

- ✅ Toast: "Đã hiện sản phẩm" hoặc "Đã ẩn sản phẩm"
- ✅ Button color changes
- ✅ API call: `PUT /api/products/{id}` với `trangThai` khác

---

### Bước 4: Verify Backend Logs

In console backend, bạn sẽ thấy:

```
✅ Lấy sản phẩm của seller: (query result)
✅ Tạo sản phẩm: (new product id)
✅ Cập nhật sản phẩm: (updated)
✅ Xóa sản phẩm: (deleted)
```

Nếu có lỗi error, sẽ hiển thị ở console.

---

### Bước 5: Test Authorization (Quyền)

#### Case: Seller A cố sửa sản phẩm của Seller B

- Login Seller A, lấy token
- Lấy product ID của Seller B (e.g., id=5)
- Gửi `PUT /api/products/5` với token Seller A

**Expected:**

- ✅ Response: `403 Forbidden`
- ✅ Message: "Bạn không có quyền cập nhật sản phẩm này"

---

## 🐛 Nếu Còn Lỗi

### Lỗi 1: "Không tìm thấy sản phẩm" khi vào dashboard

```
→ Check: Seller có shop không? (requireShopRegister)
→ Check: Shop status là gì? (CHO_DUYET, HOAT_DONG, BI_KHOA)
→ Solution: Admin duyệt shop trước
```

### Lỗi 2: 401 Unauthorized

```
→ Check: Token hết hạn?
→ Solution: Đăng nhập lại
```

### Lỗi 3: 500 Internal Server Error

```
→ Check backend console cho error message
→ Có thể: Database connection issue, query syntax error
→ Solution: Xem error log, restart backend
```

### Lỗi 4: CORS Error

```
→ Check: Backend CORS setting
→ Frontend URL có match không?
```

---

## 📊 Expected API Calls Flow

```
1. Frontend Login
   → POST /api/auth/login
   → Get token + shop info

2. Frontend Load Dashboard
   → GET /api/products/seller (✅ Now works!)
   → GET /api/products/categories/all

3. Frontend Add Product
   → POST /api/products
   → GET /api/products/seller (refresh)

4. Frontend Edit Product
   → PUT /api/products/{id}
   → GET /api/products/seller (refresh)

5. Frontend Delete Product
   → DELETE /api/products/{id}
   → GET /api/products/seller (refresh)
```

---

## ✅ Fix Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Seller can login
- [ ] Dashboard loads products from `/api/products/seller`
- [ ] Can add new product (POST /api/products works)
- [ ] Can edit product (PUT /api/products/{id} works)
- [ ] Can delete product (DELETE /api/products/{id} works)
- [ ] Can toggle product status
- [ ] Authorization works (seller A can't edit seller B's product)
- [ ] No 404 or 500 errors
- [ ] Toast notifications show correctly

---

## 📞 Debugging Help

If you need to debug, check:

1. **Browser DevTools - Network tab**
   - Watch the API requests
   - Check status codes and responses

2. **Backend console**
   - Look for error logs
   - Check SQL query results

3. **Database (SQL Server)**
   - Verify shop exists: `SELECT * FROM CuaHang WHERE MaNguoiDung = @userId`
   - Verify products created: `SELECT * FROM SanPham WHERE MaCuaHang = @shopId`

---

## 🎯 Summary of Fix

| Aspect              | Before                          | After                                |
| ------------------- | ------------------------------- | ------------------------------------ |
| GET /seller         | ❌ Would fail (matched by /:id) | ✅ Works correctly                   |
| GET /categories/all | ❌ Would fail (matched by /:id) | ✅ Works correctly                   |
| Route Order         | Wrong (specific after generic)  | ✅ Correct (specific before generic) |
| Seller Dashboard    | ❌ Can't load products          | ✅ Loads own products                |
| Add/Edit/Delete     | ❌ Unreliable due to routing    | ✅ Works properly                    |

---

**Status:** ✅ **FIX APPLIED & READY TO TEST**

Good luck! 🚀
