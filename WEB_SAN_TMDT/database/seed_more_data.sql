-- ==========================================
-- SEED ADDITIONAL DATA - Shops, Products & Images
-- Mở rộng dữ liệu cho marketplace (single batch)
-- ==========================================
USE ThuongMaiDienTu;
GO

-- ==========================================
-- 1. THÊM NGƯỜI BÁN MỚI
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE Email = 'fashion@marthub.vn')
    INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai, DiemTichLuy, MaHang)
    VALUES (N'Lê Thị Fashion', 'fashion@marthub.vn', '0933333333',
        '$2a$10$AwuJtLJeEt/b6j2BYRl7n.Ho8IiDcV7VDfDPPGKVrbiLPTC5///6.', N'NGUOI_DUNG', N'HOAT_DONG', 300, 1);
GO

IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE Email = 'home@marthub.vn')
    INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai, DiemTichLuy, MaHang)
    VALUES (N'Phạm Văn Home', 'home@marthub.vn', '0944444444',
        '$2a$10$AwuJtLJeEt/b6j2BYRl7n.Ho8IiDcV7VDfDPPGKVrbiLPTC5///6.', N'NGUOI_DUNG', N'HOAT_DONG', 200, 1);
GO

-- ==========================================
-- 2. THÊM CỬA HÀNG MỚI
-- ==========================================
DECLARE @FUID INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'fashion@marthub.vn');
IF @FUID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @FUID)
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@FUID, N'Fashion Hub Store',
        N'Thời trang nam nữ cao cấp - Quần áo, giày dép, phụ kiện thời trang mới nhất',
        N'HOAT_DONG', 800000.00);

DECLARE @HUID INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'home@marthub.vn');
IF @HUID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @HUID)
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@HUID, N'Home & Living Pro',
        N'Đồ gia dụng thông minh - Thiết bị nhà bếp, máy lọc không khí, robot hút bụi chính hãng',
        N'HOAT_DONG', 600000.00);
GO

-- ==========================================
-- 3. THÊM SẢN PHẨM + PHIÊN BẢN + HÌNH ẢNH
-- ==========================================
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;

-- ===== TECH STORE - iPad Pro M4 =====
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'ipad-pro-m4')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 10, N'iPad Pro M4 11 inch', 'ipad-pro-m4',
        N'Máy tính bảng mạnh nhất thế giới với chip Apple M4, màn hình Ultra Retina XDR OLED 11 inch, hỗ trợ Apple Pencil Pro',
        26990000, 4.8);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Silver', N'256GB', 26990000, 30),
        (@SPID, N'Space Black', N'512GB', 31990000, 20),
        (@SPID, N'Space Black', N'1TB', 39990000, 10);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=640&h=640&fit=crop', 0);
END
GO

-- ===== TECH STORE - Apple Watch Ultra 2 =====
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'apple-watch-ultra-2')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 9, N'Apple Watch Ultra 2', 'apple-watch-ultra-2',
        N'Đồng hồ thông minh cao cấp nhất của Apple, chip S9, màn hình 49mm, pin 36 giờ, độ sâu 100m',
        20990000, 4.7);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Titanium Natural', N'49mm', 20990000, 25),
        (@SPID, N'Titanium Black', N'49mm', 21990000, 15);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1546868871-af0de0ae72ef?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=640&h=640&fit=crop', 0);
END
GO

-- ===== TECH STORE - Dell XPS 15 =====
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'dell-xps-15')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 10, N'Dell XPS 15 OLED', 'dell-xps-15',
        N'Laptop cao cấp của Dell, màn hình OLED 3.5K 15.6 inch, chip Intel Core i9-13900H, RAM 32GB, RTX 4070',
        45990000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Platinum Silver', N'32GB/512GB', 45990000, 15),
        (@SPID, N'Graphite', N'32GB/1TB', 49990000, 10);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1593642634443-44adaa06623a?w=640&h=640&fit=crop', 0);
END
GO

-- ===== TECH STORE - ASUS ROG Zephyrus G16 =====
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'asus-rog-zephyrus-g16')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 6, N'ASUS ROG Zephyrus G16', 'asus-rog-zephyrus-g16',
        N'Laptop gaming siêu mỏng nhẹ, màn hình ROG Nebula 16 inch 2.5K 240Hz, Intel Ultra 9, RTX 4060',
        38990000, 4.8);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Platinum White', N'16GB/1TB', 38990000, 20),
        (@SPID, N'Eclipse Gray', N'32GB/1TB', 42990000, 12);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1603302746720-ae93f0e4a8d4?w=640&h=640&fit=crop', 0);
END
GO

-- ===== TECH STORE - AirPods Pro 2 =====
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'airpods-pro-2-usb-c')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 11, N'AirPods Pro 2 USB-C', 'airpods-pro-2-usb-c',
        N'Tai nghe không dây chống ồn tốt nhất của Apple, chip H2, âm thanh thích ứng, pin 30 giờ, sạc USB-C',
        6490000, 4.9);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng', N'Tiêu chuẩn', 6490000, 200);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1605462863736-92a9c76f0f46?w=640&h=640&fit=crop', 0);
END
GO

-- ===== FASHION HUB - Áo thun nam =====
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'ao-thun-nam-tay-ngan')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 2, N'Áo Thun Nam Tay Ngắn Cotton Cao Cấp', 'ao-thun-nam-tay-ngan',
        N'Áo thun nam chất liệu cotton 100% cao cấp, thấm hút mồ hôi tốt, form regular fit thoải mái',
        299000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'M', 199000, 200), (@SPID, N'Đen', N'L', 199000, 200), (@SPID, N'Đen', N'XL', 199000, 150),
        (@SPID, N'Trắng', N'M', 199000, 180), (@SPID, N'Trắng', N'L', 199000, 180), (@SPID, N'Trắng', N'XL', 199000, 120),
        (@SPID, N'Xám', N'M', 219000, 100), (@SPID, N'Xám', N'L', 219000, 100);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=640&h=640&fit=crop', 0),
        (@SPID, 'https://images.unsplash.com/photo-1576569640580-9e6c6f6b7e1a?w=640&h=640&fit=crop', 0);
END
GO

-- ===== FASHION HUB - Quần jeans nam =====
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'quan-jeans-nam-cao-cap')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 2, N'Quần Jeans Nam Slim Fit Cao Cấp', 'quan-jeans-nam-cao-cap',
        N'Quần jeans nam chất liệu denim Nhật Bản, form slim fit co giãn tốt, phù hợp đi làm và đi chơi',
        599000, 4.3);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Xanh đậm', N'30', 499000, 100), (@SPID, N'Xanh đậm', N'32', 499000, 150), (@SPID, N'Xanh đậm', N'34', 499000, 120),
        (@SPID, N'Đen', N'30', 499000, 80), (@SPID, N'Đen', N'32', 499000, 130), (@SPID, N'Đen', N'34', 499000, 100);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=640&h=640&fit=crop', 0);
END
GO

-- ===== FASHION HUB - Áo khoác bomber =====
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'ao-khoac-bomber-nam')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 2, N'Áo Khoác Bomber Nam Nữ Unisex', 'ao-khoac-bomber-nam',
        N'Áo khoác bomber phong cách Hàn Quốc, chất liệu dù dày dặn chống gió, form oversized thoải mái',
        699000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'M', 549000, 80), (@SPID, N'Đen', N'L', 549000, 100), (@SPID, N'Đen', N'XL', 549000, 70),
        (@SPID, N'Xanh olive', N'M', 599000, 60), (@SPID, N'Xanh olive', N'L', 599000, 80), (@SPID, N'Xanh olive', N'XL', 599000, 50);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=640&h=640&fit=crop', 0);
END
GO

-- ===== FASHION HUB - Giày thể thao Nike =====
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'giay-the-thao-nike-air-max')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 8, N'Giày Thể Thao Nike Air Max 90', 'giay-the-thao-nike-air-max',
        N'Giày thể thao Nike Air Max 90 chính hãng, đệm Air êm ái, phối màu cổ điển, phù hợp chạy bộ và đi chơi',
        3290000, 4.7);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng-Đỏ', N'40', 2990000, 30), (@SPID, N'Trắng-Đỏ', N'41', 2990000, 40),
        (@SPID, N'Trắng-Đỏ', N'42', 2990000, 50), (@SPID, N'Trắng-Đỏ', N'43', 2990000, 35), (@SPID, N'Trắng-Đỏ', N'44', 2990000, 25),
        (@SPID, N'Đen-Trắng', N'40', 3090000, 20), (@SPID, N'Đen-Trắng', N'41', 3090000, 30),
        (@SPID, N'Đen-Trắng', N'42', 3090000, 40), (@SPID, N'Đen-Trắng', N'43', 3090000, 25), (@SPID, N'Đen-Trắng', N'44', 3090000, 15);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=640&h=640&fit=crop', 0),
        (@SPID, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=640&h=640&fit=crop', 0);
END
GO

-- ===== FASHION HUB - Đồng hồ Casio =====
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'dong-ho-nam-casio-g-shock')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 2, N'Đồng Hồ Nam Casio G-Shock Chính Hãng', 'dong-ho-nam-casio-g-shock',
        N'Đồng hồ Casio G-Shock chống sốc, chống nước 200m, đèn LED, lịch ngày tháng, pin 10 năm',
        2490000, 4.8);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'Standard', 2190000, 60),
        (@SPID, N'Xanh dương', N'Standard', 2290000, 40),
        (@SPID, N'Trắng', N'Standard', 2390000, 30);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=640&h=640&fit=crop', 0);
END
GO

-- ===== HOME & LIVING - Nồi chiên không dầu =====
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'noi-chien-khong-dau')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Nồi Chiên Không Dầu Philips HD9270', 'noi-chien-khong-dau',
        N'Nồi chiên không dầu Philips 7.3L, công nghệ Rapid Air, 8 chế độ nấu, cảm ứng, dễ vệ sinh',
        4290000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'7.3L', 3990000, 50),
        (@SPID, N'Trắng', N'7.3L', 3990000, 35);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=640&h=640&fit=crop', 0);
END
GO

-- ===== HOME & LIVING - Máy lọc không khí =====
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'may-loc-khong-khi-xiaomi')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Máy Lọc Không Khí Xiaomi Smart Air Purifier 4', 'may-loc-khong-khi-xiaomi',
        N'Máy lọc không khí thông minh Xiaomi, HEPA H13, cảm biến laser PM2.5, điều khiển qua app, phòng 48m²',
        3490000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng', N'Tiêu chuẩn', 3190000, 40);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1630839437035-dac17da580d0?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1627658630007-8d16b0e4c360?w=640&h=640&fit=crop', 0);
END
GO

-- ===== HOME & LIVING - Robot hút bụi =====
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'robot-hut-bui-roborock')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Robot Hút Bụi Lau Nhà Roborock S8 Pro Ultra', 'robot-hut-bui-roborock',
        N'Robot hút bụi lau nhà tự động, DuoRoller, trạm tự làm sạch 7-trong-1, LiDAR, hút 5500Pa',
        15990000, 4.9);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng', N'Tiêu chuẩn', 14990000, 15);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1561951799-5e3d5f0e7b2f?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1635776062360-af423602aff3?w=640&h=640&fit=crop', 0);
END
GO

-- ===== HOME & LIVING - Bàn làm việc thông minh =====
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'ban-lam-viec-thong-minh')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Bàn Làm Việc Thông Minh Điện Đứng Ngồi', 'ban-lam-viec-thong-minh',
        N'Bàn làm việc chống gù, điều chỉnh độ cao bằng điện, mặt gỗ tự nhiên 120x60cm, chịu lực 80kg',
        5290000, 4.4);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Gỗ óc chó', N'120x60cm', 4990000, 20),
        (@SPID, N'Gỗ sồi', N'120x60cm', 4990000, 25),
        (@SPID, N'Trắng', N'120x60cm', 4790000, 15);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=640&h=640&fit=crop', 0);
END
GO

-- ===== HOME & LIVING - Máy xay sinh tố =====
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'may-xay-sinh-to-blaupunkt')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Máy Xay Sinh Tố Blaupunkt 2 Lít', 'may-xay-sinh-to-blaupunkt',
        N'Máy xay sinh tố Blaupunkt 1000W, cối thủy tinh 2L, 6 lưỡi dao, 5 tốc độ + xay đá',
        1890000, 4.3);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Bạc', N'2L', 1590000, 60),
        (@SPID, N'Đen', N'2L', 1690000, 45);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1622484211149-3c4b9fef8b38?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1570222094111-d3f3c5e1b7e1?w=640&h=640&fit=crop', 0);
END
GO

PRINT '============================================';
PRINT '✅ ALL DATA INSERTED SUCCESSFULLY!';
PRINT '============================================';
PRINT 'Tài khoản mới: fashion@marthub.vn / home@marthub.vn (pass: Seller@123)';
GO

-- Kiểm tra tổng quan
SELECT ch.TenCuaHang, COUNT(DISTINCT sp.MaSanPham) as SoSP, COUNT(ha.MaHinhAnh) as SoAnh
FROM CuaHang ch
JOIN SanPham sp ON ch.MaCuaHang = sp.MaCuaHang
LEFT JOIN HinhAnhSanPham ha ON sp.MaSanPham = ha.MaSanPham
GROUP BY ch.TenCuaHang, ch.MaCuaHang
ORDER BY ch.MaCuaHang;
GO
