-- ==========================================
-- SEED EVEN MORE PRODUCTS
-- Thêm 24 sản phẩm nữa cho 3 cửa hàng
-- ==========================================
USE ThuongMaiDienTu;
GO

-- ===== TECH STORE - 8 sản phẩm mới =====
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;

-- Google Pixel 9 Pro
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'google-pixel-9-pro')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 9, N'Google Pixel 9 Pro', 'google-pixel-9-pro',
        N'Điện thoại Pixel 9 Pro chính hãng, chip Tensor G4, camera 50MP, màn hình LTPO OLED 6.7 inch, Android 14, 7 năm cập nhật',
        24990000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Obsidian', N'128GB', 22990000, 25), (@SPID, N'Obsidian', N'256GB', 25990000, 30),
        (@SPID, N'Porcelain', N'128GB', 22990000, 15), (@SPID, N'Porcelain', N'256GB', 25990000, 20);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1575695342320-d2d2d2f9b73f?w=640&h=640&fit=crop', 0);
END
GO

-- Samsung Galaxy Watch 6
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'samsung-galaxy-watch-6')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 9, N'Samsung Galaxy Watch 6 Classic', 'samsung-galaxy-watch-6',
        N'Đồng hồ thông minh Samsung, chip Exynos W930, màn hình Super AMOLED 1.47 inch, đo ECG, huyết áp, Wear OS, pin 425mAh',
        8990000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'43mm', 7990000, 30), (@SPID, N'Đen', N'47mm', 8490000, 35),
        (@SPID, N'Bạc', N'43mm', 8190000, 20), (@SPID, N'Bạc', N'47mm', 8690000, 25);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1546868871-af0de0ae72ef?w=640&h=640&fit=crop', 0);
END
GO

-- Máy ảnh Sony A7 IV
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'sony-a7-iv')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 1, N'Máy Ảnh Sony A7 IV Body', 'sony-a7-iv',
        N'Máy ảnh mirrorless full-frame Sony A7 IV, cảm biến 33MP Exmor R, quay 4K 60fps, lấy nét 759 điểm, ISO 100-51200',
        43990000, 4.8);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'Body', 39990000, 10), (@SPID, N'Đen', N'Kit 28-70mm', 45990000, 8);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=640&h=640&fit=crop', 0);
END
GO

-- Loa JBL Charge 5
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'jbl-charge-5')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 1, N'Loa Bluetooth JBL Charge 5', 'jbl-charge-5',
        N'Loa di động JBL Charge 5 chống nước IP67, công suất 30W, pin 20 giờ, sạc dự phòng USB-A, âm thanh mạnh mẽ',
        3290000, 4.7);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'Tiêu chuẩn', 2990000, 50), (@SPID, N'Xanh dương', N'Tiêu chuẩn', 2990000, 40),
        (@SPID, N'Đỏ', N'Tiêu chuẩn', 3090000, 25);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=640&h=640&fit=crop', 0);
END
GO

-- Samsung Tab S9
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'samsung-tab-s9')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 10, N'Samsung Galaxy Tab S9 FE', 'samsung-tab-s9',
        N'Máy tính bảng Samsung Tab S9 FE, màn hình TFT 10.9 inch 90Hz, chip Exynos 1380, RAM 6GB, pin 8000mAh, kèm bút S Pen',
        10990000, 4.4);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Xám', N'128GB/WiFi', 9990000, 40), (@SPID, N'Xám', N'256GB/WiFi', 11990000, 25),
        (@SPID, N'Bạc hà', N'128GB/WiFi', 9990000, 20);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=640&h=640&fit=crop', 0);
END
GO

-- Mac Mini M4
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'mac-mini-m4')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 10, N'Apple Mac Mini M4', 'mac-mini-m4',
        N'Mac Mini chip Apple M4, CPU 10-core GPU 10-core, RAM 16GB, SSD 256GB, hai cổng Thunderbolt 4, HDMI, Ethernet',
        16990000, 4.7);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Bạc', N'16GB/256GB', 15990000, 20), (@SPID, N'Bạc', N'16GB/512GB', 19990000, 15),
        (@SPID, N'Bạc', N'24GB/512GB', 24990000, 10);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1631729332150-e28b28ba9e95?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=640&h=640&fit=crop', 0);
END
GO

-- SSD Samsung 2TB
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'ssd-samsung-2tb')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 1, N'SSD Samsung 870 EVO 2TB', 'ssd-samsung-2tb',
        N'SSD Samsung 870 EVO 2.5 inch SATA III, đọc 560MB/s, ghi 530MB/s, bảo hành 5 năm, dung lượng 2TB lưu trữ',
        4290000, 4.8);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Bạc', N'2TB', 3990000, 100);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1555617778-5ce6c038c733?w=640&h=640&fit=crop', 0);
END
GO

-- Apple AirPods Max
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'airpods-max')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 11, N'Apple AirPods Max', 'airpods-max',
        N'Tai nghe chụp đầu Apple AirPods Max, chip H1, chống ồn chủ động, âm thanh không gian Spatial Audio, khung thép không gỉ, pin 20 giờ',
        10990000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Bạc', N'Tiêu chuẩn', 9990000, 20), (@SPID, N'Xanh dương', N'Tiêu chuẩn', 10490000, 15),
        (@SPID, N'Hồng', N'Tiêu chuẩn', 10990000, 10);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1605462863736-92a9c76f0f46?w=640&h=640&fit=crop', 0);
END
GO

-- ===== FASHION HUB - 8 sản phẩm mới =====
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;

-- Áo sơ mi nam
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'ao-so-mi-nam-dai-tay')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 2, N'Áo Sơ Mi Nam Dài Tay Cao Cấp', 'ao-so-mi-nam-dai-tay',
        N'Áo sơ mi nam dài tay chất liệu Oxford, form slimfit, cổ đức, phù hợp đi làm và đi chơi, 7 màu sắc',
        499000, 4.4);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng', N'M', 399000, 100), (@SPID, N'Trắng', N'L', 399000, 120), (@SPID, N'Trắng', N'XL', 399000, 80),
        (@SPID, N'Xanh nhạt', N'M', 399000, 80), (@SPID, N'Xanh nhạt', N'L', 399000, 100), (@SPID, N'Xanh nhạt', N'XL', 399000, 60);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=640&h=640&fit=crop', 0);
END
GO

-- Đầm nữ dự tiệc
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'dam-nu-du-tiec')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 2, N'Đầm Nữ Dự Tiệc Cao Cấp', 'dam-nu-du-tiec',
        N'Đầm nữ dáng dài chất voan cao cấp, thiết kế cổ V, eo ôm, tay ngắn, phù hợp dự tiệc cưới và sự kiện',
        1299000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đỏ', N'S', 999000, 40), (@SPID, N'Đỏ', N'M', 999000, 50), (@SPID, N'Đỏ', N'L', 999000, 40),
        (@SPID, N'Xanh navy', N'S', 1099000, 30), (@SPID, N'Xanh navy', N'M', 1099000, 40), (@SPID, N'Xanh navy', N'L', 1099000, 30);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=640&h=640&fit=crop', 0);
END
GO

-- Túi xách nữ
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'tui-xach-nu-cao-cap')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 2, N'Túi Xách Nữ Cao Cấp Da Bò', 'tui-xach-nu-cao-cap',
        N'Túi xách nữ da bò thật 100%, thiết kế thanh lịch, quai xách tay và đeo chéo, nhiều ngăn, phù hợp đi làm',
        2499000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'Medium', 2199000, 30), (@SPID, N'Nâu', N'Medium', 2299000, 25),
        (@SPID, N'Đen', N'Large', 2499000, 20), (@SPID, N'Nâu', N'Large', 2599000, 15);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=640&h=640&fit=crop', 0);
END
GO

-- Giày da nam Oxford
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'giay-da-nam-oxford')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 2, N'Giày Da Nam Oxford Cao Cấp', 'giay-da-nam-oxford',
        N'Giày da nam Oxford da bò nhập khẩu, đế cao su chống trượt, lót da êm ái, phù hợp công sở và tiệc',
        1899000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'40', 1599000, 30), (@SPID, N'Đen', N'41', 1599000, 40), (@SPID, N'Đen', N'42', 1599000, 50),
        (@SPID, N'Đen', N'43', 1599000, 35), (@SPID, N'Nâu', N'40', 1699000, 20), (@SPID, N'Nâu', N'41', 1699000, 25),
        (@SPID, N'Nâu', N'42', 1699000, 30), (@SPID, N'Nâu', N'43', 1699000, 20);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1614252235316-8c857f38b7f5?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1614252361605-99d4f5cd479f?w=640&h=640&fit=crop', 0);
END
GO

-- Kính mát nam nữ
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'kinh-mat-thoi-trang')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 2, N'Kính Mát Thời Trang Chống UV400', 'kinh-mat-thoi-trang',
        N'Kính mát thời trang unisex, tròng chống tia UV400, gọng nhựa acetate cao cấp, nhẹ, 5 màu sắc',
        599000, 4.3);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'Standard', 449000, 80), (@SPID, N'Nâu', N'Standard', 449000, 60),
        (@SPID, N'Xanh rêu', N'Standard', 499000, 50);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=640&h=640&fit=crop', 0);
END
GO

-- Nước hoa nam
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'nuoc-hoa-nam')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 5, N'Nước Hoa Nam Bleu De Chanel', 'nuoc-hoa-nam',
        N'Nước hoa nam Bleu De Chanel EDP chính hãng Pháp, hương gỗ thơm cay, lưu hương 8-10 giờ, thích hợp mọi dịp',
        2990000, 4.9);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Xanh', N'50ml', 2590000, 25), (@SPID, N'Xanh', N'100ml', 3490000, 20);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=640&h=640&fit=crop', 0);
END
GO

-- Thắt lưng nam
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'that-lung-nam-da-bo')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 2, N'Thắt Lưng Nam Da Bò Cao Cấp', 'that-lung-nam-da-bo',
        N'Thắt lưng nam da bò thật 100%, khóa kim loại sáng bóng, nhiều lỗ điều chỉnh, phù hợp công sở và thường ngày',
        499000, 4.4);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'100cm', 399000, 100), (@SPID, N'Đen', N'110cm', 399000, 120),
        (@SPID, N'Nâu', N'100cm', 449000, 80), (@SPID, N'Nâu', N'110cm', 449000, 90);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1632276536839-84d79c89d727?w=640&h=640&fit=crop', 0);
END
GO

-- Áo khoác nữ
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'ao-khoac-nu-cao-cap')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 2, N'Áo Khoác Nữ Dáng Dài Cao Cấp', 'ao-khoac-nu-cao-cap',
        N'Áo khoác nữ dáng dài chất liệu len pha cashmere, cổ bẻ, form ôm nhẹ, 4 màu, phù hợp mùa đông và đi làm',
        1899000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Be', N'M', 1599000, 40), (@SPID, N'Be', N'L', 1599000, 50), (@SPID, N'Be', N'XL', 1599000, 30),
        (@SPID, N'Đen', N'M', 1599000, 50), (@SPID, N'Đen', N'L', 1599000, 60), (@SPID, N'Đen', N'XL', 1599000, 35);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1551482504-afc5196b0fd5?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1608234807903-5c9a9b2d36c4?w=640&h=640&fit=crop', 0);
END
GO

-- ===== HOME & LIVING - 8 sản phẩm mới =====
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;

-- Máy pha cà phê
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'may-pha-ca-phe')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Máy Pha Cà Phê Philips EP3246', 'may-pha-ca-phe',
        N'Máy pha cà phê tự động Philips Series 3200, bình chứa 1.8L, 12 mức xay, LatteCrema, vệ sinh tự động',
        14990000, 4.7);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'Tiêu chuẩn', 13990000, 15);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1612214071831-86145a731a57?w=640&h=640&fit=crop', 0);
END
GO

-- Lò vi sóng
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'lo-vi-song-lg')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Lò Vi Sóng LG 25L Inverter', 'lo-vi-song-lg',
        N'Lò vi sóng LG Inverter 25L, công suất 1000W, nướng kết hợp, Smart Inverter, điều khiển cảm ứng, bảo hành 2 năm',
        4290000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Bạc', N'25L', 3990000, 30);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1574279606130-5abd2705e022?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=640&h=640&fit=crop', 0);
END
GO

-- Ấm siêu tốc
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'am-sieu-toc')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Ấm Siêu Tốc Lock&Lock 1.7L', 'am-sieu-toc',
        N'Ấm đun siêu tốc Lock&Lock, chất liệu thép không gỉ 304, dung tích 1.7L, công suất 2200W, đun sôi nhanh, tự ngắt an toàn',
        599000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Bạc', N'1.7L', 499000, 80);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1571302102727-e6b20e10dd04?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1600625838580-2769fb2a8b0f?w=640&h=640&fit=crop', 0);
END
GO

-- Nồi cơm điện
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'noi-com-dien')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Nồi Cơm Điện Cuckoo 1.8L', 'noi-com-dien',
        N'Nồi cơm điện tử Cuckoo 1.8L, lòng nồi xử lý áp suất cao, nấu đa năng, hẹn giờ, giữ nóng 24h, hàng chính hãng Hàn Quốc',
        3490000, 4.8);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng', N'1.8L', 3190000, 40);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=640&h=640&fit=crop', 0);
END
GO

-- Ghế công thái học
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'ghe-cong-thai-hoc')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Ghế Công Thái Học Sihoo M57', 'ghe-cong-thai-hoc',
        N'Ghế công thái học Sihoo M57, tựa lưng lưới thoáng khí, đệm ngồi mút hoạt tính, tay vịn 3D, điều chỉnh độ cao, chịu lực 150kg',
        6490000, 4.7);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'Tiêu chuẩn', 5990000, 25);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=640&h=640&fit=crop', 0);
END
GO

-- Quạt điều hòa
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'quat-dieu-hoa')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Quạt Điều Hòa Hongsen 200L', 'quat-dieu-hoa',
        N'Quạt điều hòa làm mát không khí Hongsen, bình chứa 200L, công suất 250W, sử dụng than làm mát, điều khiển từ xa, phòng 40m²',
        5990000, 4.3);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng', N'200L', 5490000, 20);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1601000930680-2b0ff0d03f76?w=640&h=640&fit=crop', 0);
END
GO

-- Máy giặt mini
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'may-giat-mini')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Máy Giặt Mini ElectrolUX 7kg', 'may-giat-mini',
        N'Máy giặt cửa trước ElectrolUX 7kg, Inverter, hơi nước, giặt nhanh 15 phút, tiết kiệm điện A+++, bảo hành 3 năm',
        8990000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng', N'7kg', 8490000, 15);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=640&h=640&fit=crop', 0);
END
GO

-- Đèn bàn thông minh
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'den-ban-thong-minh')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 3, N'Đèn Bàn Thông Minh LED', 'den-ban-thong-minh',
        N'Đèn bàn LED thông minh chống mỏi mắt, 5 chế độ ánh sáng, điều chỉnh độ sáng, sạc không dây cho điện thoại, chân đế chắc chắn',
        1299000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'Tiêu chuẩn', 999000, 40), (@SPID, N'Trắng', N'Tiêu chuẩn', 999000, 35);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=640&h=640&fit=crop', 1),
        (@SPID, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=640&h=640&fit=crop', 0);
END
GO

PRINT '============================================';
PRINT '✅ 24 PRODUCTS ADDED SUCCESSFULLY!';
PRINT '============================================';
GO

-- Kiểm tra tổng quan
SELECT ch.TenCuaHang, COUNT(DISTINCT sp.MaSanPham) as SoSP, COUNT(ha.MaHinhAnh) as SoAnh
FROM CuaHang ch
JOIN SanPham sp ON ch.MaCuaHang = sp.MaCuaHang
LEFT JOIN HinhAnhSanPham ha ON sp.MaSanPham = ha.MaSanPham
GROUP BY ch.TenCuaHang, ch.MaCuaHang
ORDER BY ch.MaCuaHang;

SELECT COUNT(*) as TongSanPham FROM SanPham;
SELECT COUNT(*) as TongAnh FROM HinhAnhSanPham;
GO
