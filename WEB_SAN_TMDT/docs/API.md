# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Include JWT token in headers:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "hoTen": "Nguyễn Văn A",
  "email": "user@example.com",
  "soDienThoai": "0123456789",
  "matKhau": "Password123!",
  "xacNhanMatKhau": "Password123!"
}
```

### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "maNguoiDung": 1,
  "otp": "123456"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "matKhau": "Password123!"
}
```

### Response
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "userId": 1,
    "hoTen": "Nguyễn Văn A",
    "email": "user@example.com",
    "vaiTro": "NGUOI_DUNG"
  }
}
```

---

## Product Endpoints

### Get Products
```http
GET /products?page=1&limit=12&category=1&search=laptop&minPrice=1000000&maxPrice=50000000&sort=price-asc
Authorization: Bearer <token>
```

### Get Product Detail
```http
GET /products/:id
Authorization: Bearer <token>
```

### Get Categories
```http
GET /products/categories/all
```

---

## Cart Endpoints

### Add to Cart
```http
POST /cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "maPhienBan": 1,
  "soLuong": 2
}
```

### Get Cart
```http
GET /cart
Authorization: Bearer <token>
```

### Update Cart Item
```http
PUT /cart/:cartItemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "soLuong": 3
}
```

### Remove from Cart
```http
DELETE /cart/:cartItemId
Authorization: Bearer <token>
```

---

## Order Endpoints

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "maDiaChi": 1,
  "maKhuyenMai": 5,
  "phuongThucThanhToan": "VI_DIEN_TU"
}
```

### Get Orders
```http
GET /orders
Authorization: Bearer <token>
```

### Get Order Detail
```http
GET /orders/:orderId
Authorization: Bearer <token>
```

### Cancel Order
```http
PUT /orders/:orderId/cancel
Authorization: Bearer <token>
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## Rate Limiting

- Limit: 100 requests per 15 minutes
- Header: `X-RateLimit-Remaining`

---

**Last Updated**: May 2026
