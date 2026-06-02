# 📝 Báo Cáo Sửa Lỗi - Thêm/Sửa/Xóa Sản Phẩm

## 🐛 Bug Chính Được Xác Định

### Vấn Đề

Khi seller truy cập dashboard để quản lý sản phẩm (thêm/sửa/xóa), các thao tác không hoạt động đúng.

### Root Cause

**Lỗi Route Ordering trong `backend/src/routes/product.js`**

Express routes được match theo thứ tự khai báo. Routes có path parameter (`:id`) phải đặt **SAU** routes có path cụ thể `/seller`, `/categories/all`.

**Trước khi sửa (WRONG):**

```javascript
router.get('/', ...)                    // Line 43 - GET /api/products
router.get('/:id', ...)                 // Line 160 - GET /api/products/:id ⬅️ PROBLEM
    ↓ Khi request đến /api/products/seller, Express match với /:id
    ↓ Coi "seller" là product ID, query không tìm thấy => ERROR
...
router.get('/seller', ...)              // Line 451 - TOO LATE, never reached!
router.get('/categories/all', ...)      // Line 495 - TOO LATE, never reached!
```

---

## ✅ Fix Áp Dụng

### Thay Đổi

**File:** `backend/src/routes/product.js`

Chuyển các route cụ thể TRƯỚC route tham số:

```javascript
// ĐÚNG THỨ TỰ (SAU FIX)
1. router.get('/', ...)                 // Line 43 - Danh sách sản phẩm (public)
2. router.get('/categories/all', ...)   // Line 142 - Danh mục (public) ✅ TRƯỚC
3. router.get('/seller', ...)           // Line 165 - Sản phẩm của seller ✅ TRƯỚC
4. router.get('/:id', ...)              // Line 227 - Chi tiết sản phẩm ✅ CUỐI
5. router.post('/', ...)                // Line 332 - Tạo sản phẩm
6. router.put('/:id', ...)              // Line 377 - Cập nhật sản phẩm
7. router.delete('/:id', ...)           // Line 429 - Xóa sản phẩm
8. router.post('/:id/variants', ...)    // Line 466 - Thêm phiên bản
```

### Chi Tiết

- Tìm thấy `router.get('/seller', ...)` ở line 451 (SAU `/:id`)
- Tìm thấy `router.get('/categories/all', ...)` ở line 495 (SAU `/:id`)
- **Moved:** Cấp `GET /categories/all` ngay trước `GET /:id` (line 142)
- **Moved:** Cấp `GET /seller` ngay trước `GET /:id` (line 165)
- **Removed:** Xóa duplicate routes ở cuối file

---

## 🎯 Tác Động Của Fix

### Trước Fix ❌

```
Seller Login
  ↓
Frontend: GET /api/products/seller
  ↓
Express matches with /:id (treats "seller" as product ID)
  ↓
Query: SELECT * FROM SanPham WHERE MaSanPham = 'seller'
  ↓
Returns empty → Error "Không tìm thấy sản phẩm"
  ↓
Dashboard không hiển thị sản phẩm
  ↓
Add/Edit/Delete tương ứng không hoạt động
```

### Sau Fix ✅

```
Seller Login
  ↓
Frontend: GET /api/products/seller
  ↓
Express matches with /seller (cụ thể hơn)
  ✅
Query: SELECT * FROM SanPham WHERE MaCuaHang = @MaCuaHang
  ↓
Returns seller's products correctly
  ↓
Dashboard hiển thị danh sách sản phẩm
  ↓
Add/Edit/Delete/Toggle Status hoạt động bình thường
```

---

## 🔐 Kiểm Tra Bảo Mật

fix này vẫn giữ nguyên các kiểm tra bảo mật:

✅ **Authentication:**

- `authenticateToken` - Verify JWT token
- Chỉ authenticated users mới có thể add/edit/delete

✅ **Authorization:**

- `requireSeller` - Check seller có shop đang hoạt động (not CHO_DUYET, not BI_KHOA)
- Check MaCuaHang match - seller A không thể edit seller B's product

✅ **Validation:**

- `validateProduct` - Kiểm tra required fields
- `validateProductVariant` - Kiểm tra variant data

---

## 📊 Routes Explanation

### GET /api/products (Public)

- Lấy danh sách tất cả sản phẩm (có filter, phân trang)
- Không cần auth
- Dùng bởi: Homepage, Product List page

### GET /api/products/categories/all (Public)

- Lấy danh mục sản phẩm
- Không cần auth
- Dùng bởi: Filter dropdowns (frontend)

### GET /api/products/seller (Protected)

- Lấy sản phẩm của seller hiện tại
- Yêu cầu: `authenticateToken` + `requireSeller`
- Lọc theo `req.shop.MaCuaHang`
- Dùng bởi: Seller Dashboard

### GET /api/products/:id (Public)

- Lấy chi tiết 1 sản phẩm (hình ảnh, phiên bản, đánh giá)
- Không cần auth
- Dùng bởi: Product Detail page

### POST /api/products (Protected)

- Tạo sản phẩm mới
- Yêu cầu: `authenticateToken` + `requireSeller` + `validateProduct`
- Dùng bởi: Seller Dashboard - Thêm sản phẩm

### PUT /api/products/:id (Protected)

- Cập nhật sản phẩm
- Yêu cầu: `authenticateToken` + `requireSeller` + `validateProduct`
- Check: Seller chỉ có thể edit sản phẩm của shop mình
- Dùng bởi: Seller Dashboard - Sửa sản phẩm

### DELETE /api/products/:id (Protected)

- Xóa sản phẩm (thực ra là set TrangThai = 'AN')
- Yêu cầu: `authenticateToken` + `requireSeller`
- Check: Seller chỉ có thể delete sản phẩm của shop mình
- Dùng bởi: Seller Dashboard - Xóa sản phẩm

### POST /api/products/:id/variants (Protected)

- Thêm phiên bản sản phẩm (size, color, giá, tồn kho)
- Yêu cầu: `authenticateToken` + `requireSeller` + `validateProductVariant`
- Check: Seller chỉ có thể add variant cho sản phẩm của shop mình
- Dùng bởi: Product Details - Thêm variant

---

## 🧪 Verification Checklist

- [x] Xác định bug (route ordering)
- [x] Áp dụng fix (move routes)
- [x] Xóa duplicate code
- [x] Verify syntax (no errors)
- [x] Verify auth middleware (still working)
- [x] Verify protection (seller can't edit others' products)
- [ ] Test end-to-end (when backend/frontend started)

---

## 📋 Frontend Handler (Already Correct)

`frontend/src/pages/seller/Dashboard.jsx` đã được cập nhật để:

1. **Fetch Products:**

   ```javascript
   const res = await axios.get(`${API_URL}/products/seller`, {
     headers: { Authorization: `Bearer ${token}` },
     params: { limit: 100 },
   });
   ```

   → Gọi endpoint mới `/seller` ✅

2. **Add Product:** `POST /api/products` ✅

3. **Edit Product:** `PUT /api/products/{id}` ✅

4. **Delete Product:** `DELETE /api/products/{id}` ✅

5. **Toggle Status:** `PUT /api/products/{id}` with different `trangThai` ✅

---

## 🚀 Next Steps

1. **Test Backend + Frontend:**
   - Start backend: `npm start` (từ backend folder)
   - Start frontend: `npm run dev` (từ frontend folder)

2. **Test Flow:**
   - Login seller
   - Verify products load on dashboard
   - Add new product
   - Edit product
   - Delete/toggle product
   - Verify authorization (use different seller account)

3. **Monitor Logs:**
   - Backend: Check console for SQL queries and errors
   - Frontend: Check browser DevTools Network tab
   - Database: Verify products created in SanPham table

4. **Common Issues:**
   - Shop not approved: Admin needs to approve shop first
   - Token expired: Re-login
   - CORS error: Check backend CORS config
   - 500 error: Check backend database connection

---

## 📞 Summary

| Item                    | Status      | Details                            |
| ----------------------- | ----------- | ---------------------------------- |
| **Bug Found**           | ✅ Complete | Route ordering issue identified    |
| **Fix Applied**         | ✅ Complete | Routes reordered correctly         |
| **Auth Check**          | ✅ OK       | Still protected properly           |
| **Authorization Check** | ✅ OK       | Seller can't edit others' products |
| **Code Cleanup**        | ✅ Complete | Removed duplicate routes           |
| **Testing**             | ⏳ Pending  | Ready to test when server started  |

**File Changed:** `backend/src/routes/product.js`
**Lines Modified:** Routes moved from lines 451/495 to lines 142/165
**Breaking Changes:** None - all endpoints still work the same way

---

**Status:** 🟢 **READY FOR TESTING**

Hãy start backend + frontend và test theo hướng dẫn trong `TEST_PRODUCT_FIX.md`
