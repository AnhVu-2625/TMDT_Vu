-- ==========================================
-- SEED FIX: Bổ sung sản phẩm + ảnh cho tất cả danh mục
-- Mỗi danh mục có ít nhất 10 sản phẩm
-- Chạy file này SAU schema.sql + seed.sql
-- ==========================================
USE ThuongMaiDienTu;
GO

DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;

-- ==========================================
-- 1. ĐIỆN THOẠI (danh mục 9) - cần thêm
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'xiaomi-14-ultra')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 9, N'Xiaomi 14 Ultra', 'xiaomi-14-ultra',
        N'Xiaomi 14 Ultra flagship, chip Snapdragon 8 Gen 3, camera Leica 50MP, màn hình LTPO AMOLED 6.73 inch, pin 5000mAh, sạc nhanh 90W',
        22990000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'256GB', 21990000, 20), (@SPID, N'Trắng', N'256GB', 21990000, 15), (@SPID, N'Đen', N'512GB', 24990000, 10);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 2. LAPTOP (danh mục 10) - cần thêm
-- ==========================================
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'lenovo-thinkpad-x1')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 10, N'Lenovo ThinkPad X1 Carbon Gen 11', 'lenovo-thinkpad-x1',
        N'Laptop doanh nhân Lenovo ThinkPad X1 Carbon, Intel i7-1365U, RAM 16GB, SSD 512GB, màn hình 14 inch 2.8K OLED, pin 15 giờ',
        39990000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'16GB/512GB', 37990000, 15), (@SPID, N'Đen', N'32GB/1TB', 42990000, 10);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'hp-spectre-x360')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 10, N'HP Spectre x360 14', 'hp-spectre-x360',
        N'Laptop 2-trong-1 HP Spectre x360, Intel Core i7-1355U, RAM 16GB, SSD 1TB, màn hình cảm ứng OLED 2.8K, bút cảm ứng',
        35990000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Bạc', N'16GB/1TB', 33990000, 12), (@SPID, N'Đen', N'16GB/1TB', 33990000, 8);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 3. TAI NGHE (danh mục 11) - cần thêm
-- ==========================================
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'samsung-buds2-pro')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 11, N'Samsung Galaxy Buds2 Pro', 'samsung-buds2-pro',
        N'Tai nghe không dây Samsung Buds2 Pro, chống ồn ANC, âm thanh 24-bit Hi-Fi, chip AKG, pin 29 giờ, chống nước IPX7',
        3490000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng', N'Tiêu chuẩn', 3190000, 50), (@SPID, N'Đen', N'Tiêu chuẩn', 3190000, 40), (@SPID, N'Tím', N'Tiêu chuẩn', 3290000, 30);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 4. GAMING (danh mục 6) - cần thêm 9 sản phẩm
-- ==========================================
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'ps5-slim')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 6, N'Máy Chơi Game Sony PS5 Slim', 'ps5-slim',
        N'Máy chơi game Sony PlayStation 5 Slim, ổ SSD 1TB, tay cầm DualSense, hỗ trợ 4K 120Hz, Ray Tracing',
        11990000, 4.9);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng', N'1TB', 11490000, 20);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'xbox-series-x')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 6, N'Microsoft Xbox Series X', 'xbox-series-x',
        N'Máy chơi game Microsoft Xbox Series X, ổ SSD 1TB, chip AMD Zen 2, GPU RDNA 2, 4K 120fps, hỗ trợ Game Pass',
        11990000, 4.8);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'1TB', 11490000, 15);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'tay-cam-dualsense')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 6, N'Tay Cầm Sony DualSense PS5', 'tay-cam-dualsense',
        N'Tay cầm không dây Sony DualSense cho PS5, haptic feedback, trigger thích ứng, cảm biến chuyển động, pin 12 giờ',
        1790000, 4.7);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng', N'Standard', 1590000, 100), (@SPID, N'Đen', N'Standard', 1590000, 80), (@SPID, N'Hồng', N'Standard', 1690000, 50);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'ban-phim-co-logitech')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 6, N'Bàn Phím Cơ Logitech G Pro X', 'ban-phim-co-logitech',
        N'Bàn phím cơ Logitech G Pro X cho gaming, switch GX Blue, đèn RGB LIGHTSYNC, khung nhôm, keycap PBT',
        3290000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'Full-size', 2990000, 60), (@SPID, N'Trắng', N'Full-size', 2990000, 40);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1541140532154-b024d1c0c78e?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'chuot-razor-viper')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 6, N'Chuột Gaming Razer Viper V3 Pro', 'chuot-razor-viper',
        N'Chuột gaming không dây Razer Viper V3 Pro, cảm biến Focus Pro 30K, siêu nhẹ 55g, pin 90 giờ, 8 nút lập trình',
        2990000, 4.7);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'Standard', 2790000, 70);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 5. THỂ THAO (danh mục 8) - cần thêm 9 sản phẩm
-- ==========================================
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'giay-chay-bo-nike')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 8, N'Giày Chạy Bộ Nike Revolution 7', 'giay-chay-bo-nike',
        N'Giày chạy bộ nam Nike Revolution 7, đệm Nike Air, lưới thoáng khí, đế cao su bền bỉ, phù hợp chạy bộ hàng ngày',
        2290000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'40', 1990000, 30), (@SPID, N'Đen', N'42', 1990000, 40), (@SPID, N'Đen', N'44', 1990000, 25),
        (@SPID, N'Trắng', N'40', 2090000, 20), (@SPID, N'Trắng', N'42', 2090000, 30), (@SPID, N'Trắng', N'44', 2090000, 20);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'balo-the-thao')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 8, N'Balo Thể Thao Adidas 35L', 'balo-the-thao',
        N'Balo thể thao Adidas 35L chống nước, nhiều ngăn, đệm lưng thoáng khí, quai đeo êm, phù hợp tập gym và du lịch',
        899000, 4.4);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Đen', N'35L', 799000, 80), (@SPID, N'Xám', N'35L', 799000, 60);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'thảm-tap-yoga')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 8, N'Thảm Tập Yoga Cao Su Tự Nhiên', 'tham-tap-yoga',
        N'Thảm tập yoga cao su tự nhiên dày 6mm, chống trượt 2 mặt, kích thước 183x68cm, có túi đeo kèm theo',
        599000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Tím', N'6mm', 499000, 100), (@SPID, N'Xanh lá', N'6mm', 499000, 80);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 6. MỸ PHẨM (danh mục 5) - cần thêm 9 sản phẩm
-- ==========================================
DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'son-mac-lipstick')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 5, N'Son MAC Lipstick Chính Hãng', 'son-mac-lipstick',
        N'Son môi MAC Cosmetics, màu lì mịn, lưu màu lâu 12 giờ, dưỡng ẩm, nhiều tông màu thời trang',
        699000, 4.7);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Ruby Woo', N'3g', 599000, 100), (@SPID, N'Lady Danger', N'3g', 599000, 80), (@SPID, N'Russian Red', N'3g', 649000, 70);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'kem-duong-loreal')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 5, N'Kem Dưỡng Da L''Oréal Revitalift', 'kem-duong-loreal',
        N'Kem dưỡng da L''Oréal Paris Revitalift chống lão hóa, Collagen dạng nước, đàn hồi da, 50ml, cho da mặt và cổ',
        449000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Trắng', N'50ml', 399000, 80);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @FSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Fashion Hub Store');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'nuoc-hoa-nu')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@FSID, 5, N'Nước Hoa Nữ Chanel No 5 EDP', 'nuoc-hoa-nu',
        N'Nước hoa nữ Chanel No 5 EDP chính hãng Pháp, hương hoa cỏ Aldehyde, lưu hương 8-10 giờ, biểu tượng kinh điển',
        3990000, 4.9);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Vàng', N'50ml', 3590000, 20), (@SPID, N'Vàng', N'100ml', 4590000, 15);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 7. SÁCH (danh mục 4) - thêm mới 10 sản phẩm
-- ==========================================
DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'sach-lap-trinh-python')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 4, N'Sách Lập Trình Python Cơ Bản', 'sach-lap-trinh-python',
        N'Sách học lập trình Python từ cơ bản đến nâng cao, dành cho người mới bắt đầu, bài tập thực hành, dự án mẫu',
        199000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Bìa mềm', N'400 trang', 179000, 200);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'sach-tri-tue-nhan-tao')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 4, N'Sách Trí Tuệ Nhân Tạo - AI Cho Mọi Người', 'sach-tri-tue-nhan-tao',
        N'Sách giới thiệu về trí tuệ nhân tạo, học máy, deep learning, ứng dụng thực tế, dành cho người không chuyên',
        249000, 4.5);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Bìa cứng', N'350 trang', 229000, 150);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @TSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Tech Store Official');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'sach-kinh-doanh')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@TSID, 4, N'Sách Kinh Doanh - Tư Duy Triệu Phú', 'sach-kinh-doanh',
        N'Sách kinh doanh bán chạy nhất New York Times, dạy tư duy tài chính, quản lý tiền bạc, đầu tư thông minh',
        179000, 4.7);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, N'Bìa mềm', N'300 trang', 159000, 180);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 8. THỰC PHẨM (danh mục 7) - thêm mới 10 sản phẩm
-- ==========================================
DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'hat-dinh-duong')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 7, N'Hạt Dinh Dưỡng Mixed Nuts 500g', 'hat-dinh-duong',
        N'Hạt dinh dưỡng tổng hợp cao cấp: hạnh nhân, óc chó, hạt điều, macca, hạt dẻ cười. Giàu protein và omega-3',
        249000, 4.6);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, NULL, N'500g', 229000, 200);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'ca-phe-organic')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 7, N'Cà Phê Nguyên Chất Organic 500g', 'ca-phe-organic',
        N'Cà phê nguyên chất organic Đà Lạt, rang xay 100% Arabica, hương vị đậm đà, không hóa chất bảo quản',
        199000, 4.7);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, NULL, N'500g', 179000, 150);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @HSID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = 'Home & Living Pro');
DECLARE @SPID INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE DuongDan = 'matcha-xanh')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@HSID, 7, N'Bột Matcha Xanh Nhật Bản 100g', 'matcha-xanh',
        N'Bột matcha xanh cao cấp Nhật Bản, xay đá granite, màu xanh tươi, vị umami, giàu chất chống oxy hóa',
        349000, 4.8);
    SET @SPID = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SPID, NULL, N'100g', 319000, 100);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SPID, 'https://images.unsplash.com/photo-1582790647761-327c95b1c2e8?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 9. Cập nhật ảnh cho tất cả sản phẩm chưa có ảnh chính
-- ==========================================
DECLARE @pid INT, @pname NVARCHAR(255);
DECLARE cur CURSOR FOR
    SELECT sp.MaSanPham, sp.TenSanPham FROM SanPham sp
    WHERE NOT EXISTS (SELECT 1 FROM HinhAnhSanPham WHERE MaSanPham = sp.MaSanPham AND LaAnhChinh = 1);
OPEN cur;
FETCH NEXT FROM cur INTO @pid, @pname;
WHILE @@FETCH_STATUS = 0
BEGIN
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh)
    VALUES (@pid, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&h=640&fit=crop', 1);
    FETCH NEXT FROM cur INTO @pid, @pname;
END
CLOSE cur;
DEALLOCATE cur;
GO

PRINT '============================================';
PRINT '✅ FIX CATEGORIES & IMAGES DONE!';
PRINT '============================================';

-- Kiểm tra kết quả
SELECT dm.TenDanhMuc, COUNT(sp.MaSanPham) as SoSP, COUNT(ha.MaHinhAnh) as SoAnh
FROM DanhMucSanPham dm
LEFT JOIN SanPham sp ON dm.MaDanhMuc = sp.MaDanhMuc
LEFT JOIN HinhAnhSanPham ha ON sp.MaSanPham = ha.MaSanPham
GROUP BY dm.TenDanhMuc, dm.MaDanhMuc
ORDER BY dm.MaDanhMuc;
GO
