# User Stories & Use Cases

## Khách vãng lai (Guest)

### US-001: Đăng ký tài khoản
- User nhấn "Đăng ký"
- Nhập thông tin: Họ tên, email, SĐT, mật khẩu
- Hệ thống gửi OTP đến email
- User xác thực OTP
- Tài khoản được kích hoạt

### US-002: Tìm kiếm sản phẩm
- User nhập từ khóa tìm kiếm
- Hệ thống hiển thị kết quả
- User có thể lọc theo: giá, danh mục, đánh giá, người bán
- Sắp xếp kết quả

## Người dùng (User)

### US-003: Cập nhật thông tin cá nhân
- User vào Profile
- Chỉnh sửa: Họ tên, ngày sinh, giới tính, ảnh đại diện
- Lưu thay đổi

### US-004: Chat với người bán
- User vào chi tiết sản phẩm
- Nhấn nút "Chat với shop"
- Mở phòng chat
- Gửi/nhận tin nhắn real-time

## Người mua (Buyer)

### US-005: Quản lý giỏ hàng
- Thêm sản phẩm vào giỏ
- Xem giỏ hàng
- Cập nhật số lượng
- Xóa sản phẩm
- Xóa toàn bộ giỏ

### US-006: Mua hàng
- Xem giỏ hàng
- Chọn địa chỉ giao hàng
- Chọn phương thức thanh toán
- Áp dụng mã khuyến mãi
- Xem tổng tiền
- Xác nhận đơn hàng

### US-007: Quản lý đơn hàng
- Xem lịch sử đơn hàng
- Xem trạng thái từng đơn
- Hủy đơn hàng (nếu chưa xác nhận)
- Yêu cầu đổi trả
- Xem chi tiết đơn hàng

## Người bán (Seller)

### US-008: Đăng ký mở shop
- User chọn "Bở shop"
- Nhập thông tin: Tên shop, mô tả, logo
- Chờ xét duyệt từ admin
- Admin phê duyệt → Shop hoạt động

### US-009: Quản lý sản phẩm
- Thêm sản phẩm mới
- Cập nhật thông tin sản phẩm
- Thêm ảnh sản phẩm
- Quản lý kho (số lượng)
- Xóa/ẩn sản phẩm

### US-010: Quản lý đơn hàng bán
- Xem danh sách đơn hàng
- Xác nhận đơn hàng
- Cập nhật trạng thái giao hàng
- Hủy đơn hàng (nếu có lí do hợp lệ)

## Admin

### US-011: Quản lý người dùng
- Xem danh sách người dùng
- Khóa/mở khóa tài khoản
- Xem thông tin người dùng
- Xóa tài khoản vi phạm

### US-012: Xử lí báo cáo
- Xem danh sách báo cáo
- Xem chi tiết báo cáo
- Xác nhận/từ chối báo cáo
- Gửi notification kết quả

### US-013: Thống kê
- Doanh thu theo ngày/tuần/tháng
- Số đơn hàng
- Số người dùng mới
- Danh sách top sản phẩm

---

## Database Schema Summary

### Tables (13 chính)
1. **HangThanhVien** - Membership tiers
2. **NguoiDung** - Users
3. **XacThucNguoiDung** - OTP verification
4. **DiaChiGiaoHang** - Delivery addresses
5. **CuaHang** - Shops/Sellers
6. **YeuCauRutTien** - Withdrawal requests
7. **DanhMucSanPham** - Product categories
8. **SanPham** - Products
9. **HinhAnhSanPham** - Product images
10. **PhienBanSanPham** - Product variants
11. **ChiTietGioHang** - Cart items
12. **DanhSachYeuThich** - Favorites
13. **LichSuTimKiem** - Search history
14. **MaKhuyenMai** - Coupons/Promotions
15. **DonHang** - Orders
16. **ChiTietDonHang** - Order items
17. **DanhGiaSanPham** - Reviews
18. **YeuCauDoiTra** - Return requests
19. **PhongChat** - Chat rooms
20. **TinNhanChat** - Chat messages
21. **ThongBao** - Notifications

---

## Technical Stack

### Frontend
- React 18
- Tailwind CSS
- Framer Motion
- Zustand
- React Router v6
- Axios
- Socket.IO Client

### Backend
- Node.js + Express
- SQL Server
- JWT Authentication
- Socket.IO

### DevOps
- GitHub Actions
- Docker (optional)
- Vercel/Netlify (Frontend)
- Azure/AWS (Backend)

---

**Document Version**: 1.0
**Last Updated**: May 2026
