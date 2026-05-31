-- ==========================================
-- SEED DATA - DỮ LIỆU MẪU ĐỂ TEST
-- Chạy file này SAU KHI đã chạy schema.sql
-- ==========================================
USE ThuongMaiDienTu;
GO

-- ==========================================
-- 1. HẠNG THÀNH VIÊN (nếu chưa có)
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM HangThanhVien)
BEGIN
    INSERT INTO HangThanhVien (TenHang, DiemToiThieu, PhanTramGiamGia)
    VALUES 
        (N'Thường',   0,    0),
        (N'Bạc',      500,  5),
        (N'Vàng',     1000, 10),
        (N'Bạch Kim', 2000, 15);
END
GO

-- ==========================================
-- 2. TÀI KHOẢN ADMIN
-- Email: admin@marthub.vn | Pass: Admin@123
-- Hash bcrypt của "Admin@123" với salt=10
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE Email = 'admin@marthub.vn')
BEGIN
    INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai, DiemTichLuy, MaHang)
    VALUES (
        N'Quản Trị Viên',
        'admin@marthub.vn',
        '0900000000',
        '$2a$10$yiVifDE9oL7uHpCc1BK7ke0GDxRdKxXVL6EsHFYVpa9ZlX8B3hVhi', -- Admin@123
        N'QUAN_TRI_VIEN',
        N'HOAT_DONG',
        9999,
        1  -- Hạng Thường
    );
END
GO

-- ==========================================
-- 3. TÀI KHOẢN USER THƯỜNG
-- Email: user@marthub.vn | Pass: User@123
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE Email = 'user@marthub.vn')
BEGIN
    INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai, DiemTichLuy, MaHang)
    VALUES (
        N'Nguyễn Văn User',
        'user@marthub.vn',
        '0911111111',
        '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', -- User@123
        N'NGUOI_DUNG',
        N'HOAT_DONG',
        150,
        1
    );
END
GO

-- ==========================================
-- 4. TÀI KHOẢN SELLER (Người bán)
-- Email: seller@marthub.vn | Pass: Seller@123
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE Email = 'seller@marthub.vn')
BEGIN
    INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai, DiemTichLuy, MaHang)
    VALUES (
        N'Trần Thị Seller',
        'seller@marthub.vn',
        '0922222222',
        '$2a$10$AwuJtLJeEt/b6j2BYRl7n.Ho8IiDcV7VDfDPPGKVrbiLPTC5///6.', -- Seller@123
        N'NGUOI_DUNG',
        N'HOAT_DONG',
        500,
        2  -- Hạng Bạc
    );
END
GO

-- Tạo cửa hàng cho Seller (TrangThai = HOAT_DONG)
DECLARE @SellerID INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'seller@marthub.vn');
IF @SellerID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @SellerID)
BEGIN
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (
        @SellerID,
        N'Tech Store Official',
        N'Cửa hàng công nghệ chính hãng - Điện thoại, Laptop, Phụ kiện',
        N'HOAT_DONG',
        1500000.00
    );
END
GO

-- ==========================================
-- 5. DANH MỤC SẢN PHẨM
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM DanhMucSanPham)
BEGIN
    INSERT INTO DanhMucSanPham (TenDanhMuc, DuongDan, MaDanhMucCha)
    VALUES 
        (N'Điện tử',     'dien-tu',    NULL),
        (N'Thời trang',  'thoi-trang', NULL),
        (N'Gia dụng',    'gia-dung',   NULL),
        (N'Sách',        'sach',       NULL),
        (N'Mỹ phẩm',     'my-pham',    NULL),
        (N'Gaming',      'gaming',     NULL),
        (N'Thực phẩm',   'thuc-pham',  NULL),
        (N'Thể thao',    'the-thao',   NULL);

    -- Danh mục con của Điện tử
    DECLARE @DienTuID INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'dien-tu');
    INSERT INTO DanhMucSanPham (TenDanhMuc, DuongDan, MaDanhMucCha)
    VALUES 
        (N'Điện thoại',  'dien-thoai', @DienTuID),
        (N'Laptop',      'laptop',     @DienTuID),
        (N'Tai nghe',    'tai-nghe',   @DienTuID);
END
GO

-- ==========================================
-- 6. SẢN PHẨM MẪU (từ cửa hàng Seller)
-- ==========================================
DECLARE @ShopID INT = (
    SELECT ch.MaCuaHang FROM CuaHang ch
    JOIN NguoiDung nd ON ch.MaNguoiDung = nd.MaNguoiDung
    WHERE nd.Email = 'seller@marthub.vn'
);
DECLARE @DienThoaiCat INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'dien-thoai');
DECLARE @LaptopCat INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'laptop');

IF @ShopID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @ShopID)
BEGIN
    -- Sản phẩm 1: Samsung Galaxy S24
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@ShopID, @DienThoaiCat, N'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra',
        N'Điện thoại cao cấp nhất của Samsung 2024, màn hình Dynamic AMOLED 2X 6.8 inch, chip Snapdragon 8 Gen 3',
        27990000, 4.8);

    DECLARE @SP1 INT = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SP1, N'Titan Black', N'256GB', 25990000, 50),
        (@SP1, N'Titan Gray',  N'512GB', 27990000, 30),
        (@SP1, N'Titan Violet',N'1TB',   31990000, 15);

    -- Sản phẩm 2: iPhone 15 Pro
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@ShopID, @DienThoaiCat, N'iPhone 15 Pro Max', 'iphone-15-pro-max',
        N'iPhone cao cấp nhất của Apple 2023, chip A17 Pro, camera 48MP, Dynamic Island',
        33990000, 4.9);

    DECLARE @SP2 INT = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SP2, N'Black Titanium', N'256GB', 33990000, 25),
        (@SP2, N'White Titanium', N'512GB', 37990000, 20),
        (@SP2, N'Natural Titanium', N'1TB', 44990000, 10);

    -- Sản phẩm 3: MacBook Pro
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@ShopID, @LaptopCat, N'MacBook Pro 14 M3 Pro', 'macbook-pro-14-m3-pro',
        N'Laptop chuyên nghiệp của Apple, chip M3 Pro, RAM 18GB, màn hình Liquid Retina XDR',
        52990000, 4.7);

    DECLARE @SP3 INT = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SP3, N'Space Black', N'18GB/512GB', 52990000, 20),
        (@SP3, N'Silver',      N'18GB/1TB',   58990000, 15);

    -- Sản phẩm 4: Tai nghe Sony
    DECLARE @TaiNgheCat INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'tai-nghe');
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@ShopID, @TaiNgheCat, N'Sony WH-1000XM5', 'sony-wh-1000xm5',
        N'Tai nghe chống ồn hàng đầu thế giới, âm thanh Hi-Res, pin 30 giờ, kết nối đa thiết bị',
        8990000, 4.6);

    DECLARE @SP4 INT = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SP4, N'Đen', N'One Size', 7990000, 100),
        (@SP4, N'Bạc', N'One Size', 7990000, 80);
END
GO

-- ==========================================
-- 7. ĐỊA CHỈ MẪU CHO USER
-- ==========================================
DECLARE @UserID INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'user@marthub.vn');
IF @UserID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM DiaChiGiaoHang WHERE MaNguoiDung = @UserID)
BEGIN
    INSERT INTO DiaChiGiaoHang (MaNguoiDung, TenNguoiNhan, SDTNguoiNhan, DiaChiCuThe, PhuongXa, QuanHuyen, TinhThanh, LaMacDinh)
    VALUES (
        @UserID,
        N'Nguyễn Văn User',
        '0911111111',
        N'123 Đường Nguyễn Huệ',
        N'Phường Bến Nghé',
        N'Quận 1',
        N'TP. Hồ Chí Minh',
        1
    );
END
GO

-- ==========================================
-- 8. MÃ KHUYẾN MÃI MẪU
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM MaKhuyenMai WHERE MaCode = 'WELCOME10')
BEGIN
    INSERT INTO MaKhuyenMai (MaCuaHang, MaCode, LoaiGiamGia, GiaTriGiam, DonHangToiThieu, GiamToiDa, TuNgay, DenNgay, GioiHanSuDung)
    VALUES 
        (NULL, 'WELCOME10', N'PHAN_TRAM', 10, 100000, 50000,  GETDATE(), DATEADD(MONTH,6,GETDATE()), 1000),
        (NULL, 'SALE50K',   N'TIEN_MAT',  50000, 500000, NULL, GETDATE(), DATEADD(MONTH,3,GETDATE()), 500),
        (NULL, 'VIP20',     N'PHAN_TRAM', 20, 1000000, 200000, GETDATE(), DATEADD(MONTH,1,GETDATE()), 100);
END
GO

PRINT '============================================'
PRINT 'SEED DATA INSERTED SUCCESSFULLY!'
PRINT '============================================'
PRINT ''
PRINT '=== TÀI KHOẢN TEST ==='
PRINT 'ADMIN  : admin@marthub.vn  / Admin@123'
PRINT 'SELLER : seller@marthub.vn / Seller@123'
PRINT 'USER   : user@marthub.vn   / User@123'
PRINT ''
PRINT 'Shop Seller: "Tech Store Official" (HOAT_DONG)'
PRINT 'Có 4 sản phẩm mẫu + mã khuyến mãi: WELCOME10, SALE50K, VIP20'
GO

-- ==========================================
-- 9. GÓI DỊCH VỤ VIP
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM GiaDichVuVIP)
BEGIN
    INSERT INTO GiaDichVuVIP (TenGoi, MoTa, GiaTien, ThoiGianDangKy, LoiIch)
    VALUES 
        (N'VIP Bạc', 
         N'Gói VIP cơ bản - Thích hợp cho người mua hàng thường xuyên',
         99000, 30,
         N'Giảm 5% trên mọi đơn hàng
- Ưu tiên hỗ trợ khách hàng
- Tích lũy 100 điểm bonus
- Miễn phí vận chuyển cho đơn từ 500K'),

        (N'VIP Vàng',
         N'Gói VIP tiêu chuẩn - Lợi ích cao',
         199000, 30,
         N'Giảm 10% trên mọi đơn hàng
- Ưu tiên hỗ trợ VIP 24/7
- Tích lũy 200 điểm bonus
- Miễn phí vận chuyển toàn quốc
- Ưu tiên trả góp 0%'),

        (N'VIP Bạch Kim',
         N'Gói VIP cao cấp - Quyền lợi tối đa',
         399000, 30,
         N'Giảm 15% trên mọi đơn hàng
- Hỗ trợ VIP 24/7 riêng biệt
- Tích lũy 500 điểm bonus
- Miễn phí vận chuyển toàn quốc
- Trả góp 0% không điều kiện
- Hàng chính hãng 100% hoặc trả tiền'),

        (N'VIP Ngàn Sao',
         N'Gói VIP tối cao - Đặc quyền hoàng gia',
         999000, 30,
         N'Giảm 20% trên mọi đơn hàng
- Hỗ trợ VIP 24/7 riêng biệt với Priority
- Tích lũy 1000 điểm bonus
- Miễn phí vận chuyển + hoàn phí nếu hỏng
- Trả góp 0% không điều kiện
- Hàng chính hãng 100% hoặc hoàn tiền x2
- Tham gia flash sale độc quyền
- Gift voucher hàng tháng');
END
GO

-- ==========================================
-- 10. CHÍNH SÁCH HỆ THỐNG
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM ChinhSachHeThong)
BEGIN
    INSERT INTO ChinhSachHeThong (TenChinhSach, NoiDung, LoaiChinhSach)
    VALUES 
        (N'Chính sách thanh toán',
         N'Tất cả giao dịch trên nền tảng MartHub đều được bảo vệ bởi hệ thống thanh toán an toàn và mã hóa. Người dùng có thể chọn nhiều phương thức thanh toán: thẻ tín dụng, ví điện tử, chuyển khoản ngân hàng.',
         N'CHI_TRA'),

        (N'Chính sách bảo mật',
         N'Thông tin cá nhân của người dùng được bảo vệ tuyệt đối theo tiêu chuẩn GDPR. Không bao giờ chia sẻ thông tin với bên thứ ba mà không có sự đồng ý.',
         N'BAO_MAT'),

        (N'Chính sách khiếu nại',
         N'Người dùng có quyền khiếu nại về chất lượng sản phẩm, dịch vụ trong vòng 30 ngày. Admin sẽ xem xét và có phán quyết trong vòng 7 ngày làm việc.',
         N'KHIEU_NAI'),

        (N'Chính sách hoàn trả',
         N'Hàng hóa có thể được trả lại trong vòng 7 ngày nếu chưa sử dụng. Phí vận chuyển sẽ được hoàn nếu lỗi của người bán.',
         N'CHI_TRA');
END
GO

-- ==========================================
-- 11. LỊCH SỬ THAY ĐỔI ĐIỂM MẪU
-- ==========================================
DECLARE @UserID INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'user@marthub.vn');
IF @UserID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM LichSuThayDoiDiem WHERE MaNguoiDung = @UserID)
BEGIN
    INSERT INTO LichSuThayDoiDiem (MaNguoiDung, DiemThanh, LoaiThay, LyDo, LoaiMaThamChieu)
    VALUES 
        (@UserID, 50,   1, N'Hoàn thành đơn hàng',     N'DON_HANG'),
        (@UserID, 10,   1, N'Đánh giá sản phẩm 5 sao', N'DANH_GIA'),
        (@UserID, 5,    1, N'Referral bạn bè',          N'HE_THONG'),
        (@UserID, 100,  1, N'Đăng ký VIP Vàng',         N'HE_THONG');
END
GO

PRINT '============================================'
PRINT 'ADMIN & USER FEATURES SEED DATA INSERTED!'
PRINT '============================================'
PRINT ''
PRINT '=== GÓI VIP AVAILABLE ==='
PRINT 'VIP Bạc     : 99,000 VNĐ   - Giảm 5%'
PRINT 'VIP Vàng    : 199,000 VNĐ  - Giảm 10%'
PRINT 'VIP Bạch Kim: 399,000 VNĐ  - Giảm 15%'
PRINT 'VIP Ngàn Sao: 999,000 VNĐ  - Giảm 20%'
PRINT ''
PRINT 'Đã thêm các bảng mới:'
PRINT '- BaoCao (báo cáo vi phạm)'
PRINT '- GiaiQuyetTrancChap (xử lý tranh chấp)'
PRINT '- DichVuVIPNguoiDung (VIP membership)'
PRINT '- LichSuThayDoiDiem (điểm tích lũy)'
PRINT '- BoLocDaLuu (bộ lọc tìm kiếm)'
PRINT '- KhuyenMaiNguoiDung (khuyến mãi user)'
PRINT '- ChinhSachHeThong (chính sách)'
GO

