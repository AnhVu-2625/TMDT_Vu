# Website Thương Mại Điện Tử - Mô Hình Trang Web Trung Tâm

Nền tảng thương mại điện tử với giao diện dark mode cinematic, kết nối người mua và người bán.

## 🎨 Tính năng nổi bật

- ✨ Giao diện Dark Mode Cinematic với Framer Motion
- 🎬 Banner động với hiệu ứng chuyển cảnh mượt mà
- 🛒 Carousel sản phẩm ngang với Swiper
- 📱 Responsive hoàn toàn (Mobile + Desktop)
- 🔐 Xác thực OTP qua email
- 💳 Đa dạng phương thức thanh toán
- 💬 Chat realtime với Socket.IO
- 🔔 Hệ thống thông báo
- ⭐ Đánh giá và review sản phẩm

## 🚀 Công nghệ sử dụng

### Frontend
- **React 18** - UI Framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Swiper** - Carousel
- **Zustand** - State Management
- **React Router** - Routing
- **Axios** - HTTP Client
- **Socket.IO Client** - Realtime

### Backend
- **Node.js + Express** - Server
- **SQL Server** - Database
- **JWT** - Authentication
- **Bcrypt** - Password Hashing
- **Nodemailer** - Email Service
- **Socket.IO** - Realtime Communication

## 📋 Yêu cầu hệ thống

- Node.js >= 16.x
- SQL Server 2019 hoặc mới hơn
- npm hoặc yarn

## 🛠️ Cài đặt

### 1. Clone repository

```bash
cd "d:\HOC_KY_225_NAM_3\THƯƠNG MẠI ĐIỆN TỬ\WEB_SAN_TMDT"
```

### 2. Cài đặt Database

Chạy file SQL để tạo database:

```bash
# Mở SQL Server Management Studio và chạy file:
database/schema.sql
```

### 3. Cài đặt Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
copy .env.example .env

# Cập nhật thông tin database trong .env
# DB_SERVER=localhost
# DB_USER=sa
# DB_PASSWORD=your_password
# DB_NAME=ThuongMaiDienTu
# JWT_SECRET=your_secret_key
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password

# Chạy server
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

### 4. Cài đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
copy .env.example .env

# Cập nhật API URL trong .env
# REACT_APP_API_URL=http://localhost:5000/api

# Chạy development server
npm start
```

Frontend sẽ chạy tại: http://localhost:3000

## 👥 Các Actor và Chức năng

### 1. Khách vãng lai
- Đăng nhập / Đăng ký
- Xác thực tài khoản qua OTP
- Tìm kiếm và lọc sản phẩm
- Xem chi tiết sản phẩm

### 2. Người dùng
- Tất cả chức năng của Khách vãng lai
- Đăng xuất
- Cập nhật thông tin cá nhân
- Chat với người khác
- Nhận thông báo

### 3. Người mua
- Tất cả chức năng của Người dùng
- Quản lý giỏ hàng
- Thêm sản phẩm yêu thích
- Mua hàng và thanh toán
- Áp dụng mã khuyến mãi
- Xem lịch sử và trạng thái đơn hàng
- Yêu cầu đổi trả / Hủy đơn
- Viết đánh giá sản phẩm

### 4. Khách hàng thân thiết
- Tất cả chức năng của Người mua
- Lưu bộ lọc tìm kiếm
- Nhận ưu đãi đặc biệt
- Tham gia chương trình VIP
- Sử dụng điểm tích lũy
- Xem hạng thành viên

### 5. Người bán
- Đăng ký mở Shop
- Đăng và quản lý sản phẩm
- Quản lý khuyến mãi
- Quản lý đơn hàng
- Quản lý tài chính
- Rút tiền bán hàng
- Xem và xử lý đơn hàng

### 6. Admin
- Quản lý tài khoản người dùng
- Khóa tài khoản vi phạm
- Kiểm duyệt hệ thống
- Gỡ bài vi phạm
- Xem và xử lý báo cáo
- Thống kê tổng quan
- Giải quyết tranh chấp
- Đối soát và chia tiền
- Cập nhật chính sách
- Gửi thông báo hệ thống

## 📁 Cấu trúc thư mục

```
WEB_SAN_TMDT/
├── backend/
│   ├── src/
│   │   ├── config/         # Cấu hình database
│   │   ├── middleware/     # Authentication, validation
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities
│   │   └── server.js       # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── App.jsx         # Main app component
│   │   ├── index.css       # Global styles
│   │   └── main.jsx        # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.js
│
├── database/
│   └── schema.sql          # Database schema
│
└── README.md
```

## 🎨 Màu sắc chủ đạo

- **Primary Red**: #dc2626 (Red-600)
- **Dark Background**: #000000 (Black)
- **Card Background**: #111827 (Gray-900)
- **Border**: #1f2937 (Gray-800)
- **Text**: #f3f4f6 (Gray-100)

## 📱 Screenshots

### Trang chủ với Banner Cinematic
- Banner full-screen với hiệu ứng fade
- Carousel sản phẩm nổi bật
- Danh mục sản phẩm với icon

### Trang sản phẩm
- Grid layout responsive
- Bộ lọc sidebar
- Phân trang

### Chi tiết sản phẩm
- Gallery ảnh với thumbnails
- Chọn phiên bản sản phẩm
- Đánh giá và review

### Giỏ hàng & Thanh toán
- Quản lý số lượng
- Tóm tắt đơn hàng
- Multi-step checkout

## 🔧 Scripts

### Backend
```bash
npm start          # Chạy production
npm run dev        # Chạy development với nodemon
npm test           # Chạy tests
npm run lint       # Kiểm tra code style
```

### Frontend
```bash
npm start          # Chạy development server
npm run build      # Build production
npm test           # Chạy tests
```

## 🌐 API Endpoints

### Authentication
- POST `/api/auth/register` - Đăng ký
- POST `/api/auth/login` - Đăng nhập
- POST `/api/auth/verify-otp` - Xác thực OTP
- POST `/api/auth/resend-otp` - Gửi lại OTP

### Products
- GET `/api/products` - Danh sách sản phẩm
- GET `/api/products/:id` - Chi tiết sản phẩm
- POST `/api/products` - Tạo sản phẩm (Seller)
- PUT `/api/products/:id` - Cập nhật sản phẩm (Seller)

### Cart
- GET `/api/cart` - Lấy giỏ hàng
- POST `/api/cart` - Thêm vào giỏ
- PUT `/api/cart/:id` - Cập nhật số lượng
- DELETE `/api/cart/:id` - Xóa khỏi giỏ

### Orders
- GET `/api/orders` - Danh sách đơn hàng
- POST `/api/orders` - Tạo đơn hàng
- GET `/api/orders/:id` - Chi tiết đơn hàng
- PUT `/api/orders/:id` - Cập nhật trạng thái

## 🔐 Bảo mật

- JWT Authentication
- Password hashing với Bcrypt
- OTP verification
- Input validation
- SQL injection prevention
- XSS protection với Helmet

## 📧 Cấu hình Email

Để gửi OTP qua email, cần cấu hình Gmail App Password:

1. Truy cập https://myaccount.google.com/security
2. Bật xác thực 2 bước
3. Tạo App Password
4. Cập nhật vào file .env:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Pull Request hoặc Issue.

## 📄 License

MIT License

## 👨‍💻 Tác giả

Dự án được phát triển cho môn Thương Mại Điện Tử

## 📞 Liên hệ

- Email: support@ecommerce.vn
- Website: https://ecommerce.vn

---

**Lưu ý**: Đây là dự án học tập. Không sử dụng cho mục đích thương mại mà không có sự cho phép.
