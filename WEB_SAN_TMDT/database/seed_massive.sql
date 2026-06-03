-- ==========================================
-- SEED MASSIVE DATA: 10 shops, 50 products, reviews
-- Ch?y file này SAU KHI ?ã ch?y schema.sql và seed.sql
-- ==========================================
USE ThuongMaiDienTu;
GO

-- ==========================================
-- 1. THÊM NG??I DÙNG M?I (ch? shop owner + ng??i ?ánh giá)
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE Email = 'shop1@marthub.vn')
BEGIN
    INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai, DiemTichLuy, MaHang)
    VALUES 
        (N'Lê V?n An',     'shop1@marthub.vn',  '0901000001', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 200, 1),
        (N'Ph?m Th? Bình', 'shop2@marthub.vn',  '0901000002', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 300, 1),
        (N'Hoàng Minh C?',  'shop3@marthub.vn',  '0901000003', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 150, 1),
        (N'Tr?n V?n D',    'shop4@marthub.vn',  '0901000004', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 400, 2),
        (N'Nguy?n Th? Em', 'shop5@marthub.vn',  '0901000005', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 250, 1),
        (N'Võ V?n Phúc',   'shop6@marthub.vn',  '0901000006', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 180, 1),
        (N'??ng Th? Giang','shop7@marthub.vn',  '0901000007', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 320, 2),
        (N'Bùi V?n H?i',   'shop8@marthub.vn',  '0901000008', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 500, 2),
        (N'Lý Th? H?ng',   'shop9@marthub.vn',  '0901000009', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 210, 1);
END
GO

-- Ng??i dùng ?ánh giá
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE Email = 'reviewer1@marthub.vn')
BEGIN
    INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai, DiemTichLuy, MaHang)
    VALUES 
        (N'Nguy?n V?n Khánh',   'reviewer1@marthub.vn', '0902000001', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 100, 1),
        (N'Tr?n Th? Lan',       'reviewer2@marthub.vn', '0902000002', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 80, 1),
        (N'Ph?m V?n Minh',      'reviewer3@marthub.vn', '0902000003', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 60, 1),
        (N'Lê Th? Nga',         'reviewer4@marthub.vn', '0902000004', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 120, 1),
        (N'Hoàng V?n Ph??c',   'reviewer5@marthub.vn', '0902000005', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 90, 1),
        (N'??ng Th? Quyên',    'reviewer6@marthub.vn', '0902000006', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 150, 1),
        (N'Võ V?n Sang',        'reviewer7@marthub.vn', '0902000007', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 70, 1),
        (N'Bùi Th? Tuy?t',     'reviewer8@marthub.vn', '0902000008', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 110, 1),
        (N'Lý V?n ??c',        'reviewer9@marthub.vn', '0902000009', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 200, 1),
        (N'Ngô Th? Vy',         'reviewer10@marthub.vn','0902000010', '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq', N'NGUOI_DUNG', N'HOAT_DONG', 50, 1);
END
GO

-- ==========================================
-- 2. THÊM C?A HÀNG M?I (t?o 9 shop m?i, t?ng 10)
-- ==========================================
-- Shop 2: Th?i trang
DECLARE @U2 INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'shop1@marthub.vn');
IF @U2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @U2)
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@U2, N'Fashion House', N'Th?i trang nam n? cao c?p - Hàng chính hãng, xu h??ng m?i nh?t', N'HOAT_DONG', 5000000);
GO

DECLARE @U3 INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'shop2@marthub.vn');
IF @U3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @U3)
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@U3, N'Home Living', N'N?i th?t và ?? dùng gia ?ình - ?ep, b?n, giá t?t', N'HOAT_DONG', 3000000);
GO

DECLARE @U4 INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'shop3@marthub.vn');
IF @U4 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @U4)
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@U4, N'Book Worm', N'Nhà sách online - Sách hay m?i ngày, tri th?c b?t t?n', N'HOAT_DONG', 2000000);
GO

DECLARE @U5 INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'shop4@marthub.vn');
IF @U5 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @U5)
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@U5, N'Beauty Care', N'M? ph?m chính hãng Hàn Qu?c - Ch?m sóc da toàn di?n', N'HOAT_DONG', 8000000);
GO

DECLARE @U6 INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'shop5@marthub.vn');
IF @U6 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @U6)
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@U6, N'Gear Zone', N'Gaming gear và ph? ki?n công ngh? - Dành cho game th?', N'HOAT_DONG', 6000000);
GO

DECLARE @U7 INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'shop6@marthub.vn');
IF @U7 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @U7)
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@U7, N'Food Market', N'Th?c ph?m s?ch - Organic - ??c s?n vùng mi?n', N'HOAT_DONG', 1000000);
GO

DECLARE @U8 INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'shop7@marthub.vn');
IF @U8 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @U8)
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@U8, N'Sports Plus', N'D?ng c? th? thao chính hãng - Nike, Adidas, Puma', N'HOAT_DONG', 7000000);
GO

DECLARE @U9 INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'shop8@marthub.vn');
IF @U9 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @U9)
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@U9, N'Digital World', N'?i?n máy - Gia d?ng - T? l?nh, máy gi?t, TV chính hãng', N'HOAT_DONG', 12000000);
GO

DECLARE @U10 INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'shop9@marthub.vn');
IF @U10 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @U10)
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@U10, N'Pet Love', N'Ph? ki?n thú c?ng - Th?c ?n, ?? ch?i cho chó mèo', N'HOAT_DONG', 2000000);
GO

-- ==========================================
-- 3. L?Y ID DANH M?C
-- ==========================================
DECLARE @DienThoaiID INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'dien-thoai');
DECLARE @LaptopID INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'laptop');
DECLARE @TaiNgheID INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'tai-nghe');
DECLARE @ThoiTrangID INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'thoi-trang');
DECLARE @GiaDungID INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'gia-dung');
DECLARE @SachID INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'sach');
DECLARE @MyPhamID INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'my-pham');
DECLARE @GamingID INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'gaming');
DECLARE @ThucPhamID INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'thuc-pham');
DECLARE @TheThaoID INT = (SELECT MaDanhMuc FROM DanhMucSanPham WHERE DuongDan = 'the-thao');

-- ==========================================
-- 4. S?N PH?M M?I - SHOP 1: Tech Store Official (t? seed.sql)
-- ==========================================
-- Shop 1 ?ã có 4 s?n ph?m t? seed.sql, thêm 5 s?n ph?m n?a
DECLARE @Shop1ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Tech Store Official');
IF @Shop1ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop1ID AND DuongDan = 'xiaomi-14-ultra')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@Shop1ID, @DienThoaiID, N'Xiaomi 14 Ultra', 'xiaomi-14-ultra',
        N'Flagship Xiaomi 2024, chip Snapdragon 8 Gen 3, camera Leica 1 inch, pin 5000mAh, s?c nhanh 90W',
        21990000, 4.5);
    DECLARE @SP INT = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SP, N'?en', N'256GB', 19990000, 40), (@SP, N'Tr?ng', N'512GB', 21990000, 25);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP, 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @Shop1ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Tech Store Official');
IF @Shop1ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop1ID AND DuongDan = 'samsung-galaxy-tab-s9')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@Shop1ID, @DienThoaiID, N'Samsung Galaxy Tab S9', 'samsung-galaxy-tab-s9',
        N'Máy tính b?ng cao c?p, màn hình Dynamic AMOLED 11 inch, chip Snapdragon 8 Gen 2, bút S Pen',
        19990000, 4.6);
    DECLARE @SP INT = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SP, N'Grey', N'128GB', 17990000, 30), (@SP, N'Beige', N'256GB', 19990000, 20);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP, 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @Shop1ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Tech Store Official');
IF @Shop1ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop1ID AND DuongDan = 'google-pixel-8')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@Shop1ID, @DienThoaiID, N'Google Pixel 8 Pro', 'google-pixel-8-pro',
        N'?i?n tho?i Google v?i camera tính toán xu?t s?c, chip Tensor G3, c?p nh?t 7 n?m',
        18990000, 4.7);
    DECLARE @SP INT = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SP, N'Ocean', N'128GB', 16990000, 20), (@SP, N'Bay', N'256GB', 18990000, 15);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @Shop1ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Tech Store Official');
IF @Shop1ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop1ID AND DuongDan = 'airpods-pro-2')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@Shop1ID, @TaiNgheID, N'AirPods Pro 2 USB-C', 'airpods-pro-2-usbc',
        N'Tai nghe không dây Apple, ch?ng ?n ch? ??ng, chip H2, âm thanh thích ?ng, pin 6h',
        6790000, 4.8);
    DECLARE @SP INT = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SP, N'Tr?ng', N'Standard', 6790000, 100);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=640&h=640&fit=crop', 1);
END
GO

DECLARE @Shop1ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Tech Store Official');
IF @Shop1ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop1ID AND DuongDan = 'dell-xps-15')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES (@Shop1ID, @LaptopID, N'Dell XPS 15 9530', 'dell-xps-15-9530',
        N'Laptop cao c?p Dell, chip i7-13700H, RAM 16GB, SSD 512GB, màn hình OLED 3.5K touch',
        38990000, 4.5);
    DECLARE @SP INT = SCOPE_IDENTITY();
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SP, N'B?c', N'i7/16GB/512GB', 38990000, 15), (@SP, N'B?c', N'i9/32GB/1TB', 48990000, 10);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 5. S?N PH?M SHOP 2: Fashion House
-- ==========================================
DECLARE @Shop2ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Fashion House');
IF @Shop2ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop2ID)
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES 
        (@Shop2ID, @ThoiTrangID, N'Áo Thun Cotton Cao C?p', 'ao-thun-cotton-cao-cap',
            N'Áo thun nam ch?t cotton 100% cao c?p, m?m m?i, th?m hút t?t, form regular fit', 299000, 4.5),
        (@Shop2ID, @ThoiTrangID, N'? Qu?n Jean Nam Slim Fit', 'quan-jean-nam-slim-fit',
            N'Qu?n jean nam ?n t??ng, ch?t denim cao c?p, co giãn 4 chi?u, may t? m?', 499000, 4.3),
        (@Shop2ID, @ThoiTrangID, N'Áo Khoác Bomber Nam', 'ao-khoac-bomber-nam',
            N'Áo khoác bomber nam th?i trang, ch?t dù bóng cao c?p, lót trong ?m, phù h?p thu ??ng', 699000, 4.6),
        (@Shop2ID, @ThoiTrangID, N'Váy ?m N? Th?i Trang', 'vay-den-nu-thoi-trang',
            N'Váy ?m n? li?n th?i trang ?u á, ch?t li?u cao c?p, ôm g?n body', 549000, 4.4),
        (@Shop2ID, @ThoiTrangID, N'S? mi tr?ng Nam Công S?', 'so-mi-trang-nam-cong-so',
            N'Áo s? mi tr?ng nam công s? cao c?p, ch?t cotton-poly, không nhàu, th?m m?t', 350000, 4.7);
    DECLARE @SP1 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'ao-thun-cotton-cao-cap');
    DECLARE @SP2 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'quan-jean-nam-slim-fit');
    DECLARE @SP3 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'ao-khoac-bomber-nam');
    DECLARE @SP4 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'vay-den-nu-thoi-trang');
    DECLARE @SP5 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'so-mi-trang-nam-cong-so');

    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho) VALUES
        (@SP1, N'Tr?ng', N'M', 299000, 200), (@SP1, N'?en', N'L', 299000, 180), (@SP1, N'Xanh navy', N'XL', 299000, 150),
        (@SP2, N'Xanh nh?t', N'30', 499000, 100), (@SP2, N'?en', N'32', 499000, 120),
        (@SP3, N'?en', N'L', 699000, 80), (@SP3, N'Xanh olive', N'XL', 699000, 60),
        (@SP4, N'?en', N'M', 549000, 90), (@SP4, N'??', N'S', 549000, 70),
        (@SP5, N'Tr?ng', N'L', 350000, 300);

    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&h=640&fit=crop', 1),
        (@SP2, 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=640&h=640&fit=crop', 1),
        (@SP3, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=640&h=640&fit=crop', 1),
        (@SP4, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=640&h=640&fit=crop', 1),
        (@SP5, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 6. S?N PH?M SHOP 3: Home Living
-- ==========================================
DECLARE @Shop3ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Home Living');
IF @Shop3ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop3ID)
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES 
        (@Shop3ID, @GiaDungID, N'B? ?n Gia ??nh Cao C?p', 'bo-an-gia-dinh-cao-cap',
            N'B? ?n gia ?ình 6 ng??i g?m bát, ?a, thìa, d?a - g?m s? Bát Tràng cao c?p', 890000, 4.6),
        (@Shop3ID, @GiaDungID, N'N?i chiên không d?u 5.5L', 'noi-chien-khong-dau-55l',
            N'N?i chiên không d?u ??a n?ng, dung tích 5.5 lít, công su?t 1700W, 8 ch??ng trình', 1690000, 4.7),
        (@Shop3ID, @GiaDungID, N'Máy l?c n??c RO 8 lõi', 'may-loc-nuoc-ro-8-loi',
            N'Máy l?c n??c RO 8 lõi l?c s?ch, công su?t 10L/h, bình ch?a 8L', 3590000, 4.5),
        (@Shop3ID, @GiaDungID, N'?èn bàn LED ch?ng m?i', 'den-ban-led-chong-moi',
            N'?èn bàn LED ch?ng m?i m?t, 5 ch? ?? sáng, s?c USB, ti?t ki?m ?i?n', 390000, 4.3),
        (@Shop3ID, @GiaDungID, N'B? ch?n ga g?i cao su', 'bo-chan-ga-goi-cao-su',
            N'B? ch?n ga g?i cao su non 8cm, b?c v?i cotton, thoáng mát mùa hè', 2490000, 4.8);

    DECLARE @SP1 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'bo-an-gia-dinh-cao-cap');
    DECLARE @SP2 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'noi-chien-khong-dau-55l');
    DECLARE @SP3 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'may-loc-nuoc-ro-8-loi');
    DECLARE @SP4 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'den-ban-led-chong-moi');
    DECLARE @SP5 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'bo-chan-ga-goi-cao-su');

    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=640&fit=crop', 1),
        (@SP2, 'https://images.unsplash.com/photo-1584990347449-a6f0eae1b06f?w=640&h=640&fit=crop', 1),
        (@SP3, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=640&h=640&fit=crop', 1),
        (@SP4, 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=640&h=640&fit=crop', 1),
        (@SP5, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 7. S?N PH?M SHOP 4: Book Worm
-- ==========================================
DECLARE @Shop4ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Book Worm');
IF @Shop4ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop4ID)
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES 
        (@Shop4ID, @SachID, N'??c Nh?n Gian - T?p 1', 'doc-nhan-gian-tap-1',
            N'Ti?u thuy?t ki?m hi?p n?i ti?ng, tác gi? Huy?n Huy?n T?, câu chuy?n v? hành trình tu tiên', 189000, 4.8),
        (@Shop4ID, @SachID, N'Nhà Gi? Kim', 'nha-gia-kim',
            N'Ti?u thuy?t tri?t h?c c?a Paulo Coelho, cu?n sách bán ch?y nh?t m?i th?i ??i', 79000, 4.9),
        (@Shop4ID, @SachID, N'Harry Potter B? 7 T?p', 'harry-potter-bo-7-tap',
            N'B? sách Harry Potter ??y ?? 7 t?p, b?n d?ch ti?ng Vi?t, bìa c?ng ?p kim', 1250000, 4.7),
        (@Shop4ID, @SachID, N'Tôi Th?y Hoa Vàng Trên C? Xanh', 'toi-thay-hoa-vang-tren-co-xanh',
            N'Truy?n dài c?a Nguy?n Nh?t Ánh, tu?i th? Vi?t Nam ?y ?n t??ng', 95000, 4.6),
        (@Shop4ID, @SachID, N'Atomic Habits', 'atomic-habits',
            N'Thói quen nguyên t? - cu?n sách phát tri?n b?n thân bán ch?y toàn c?u', 129000, 4.8);

    DECLARE @SP1 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'doc-nhan-gian-tap-1');
    DECLARE @SP2 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'nha-gia-kim');
    DECLARE @SP3 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'harry-potter-bo-7-tap');
    DECLARE @SP4 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'toi-thay-hoa-vang-tren-co-xanh');
    DECLARE @SP5 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'atomic-habits');

    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=640&h=640&fit=crop', 1),
        (@SP2, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=640&h=640&fit=crop', 1),
        (@SP3, 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=640&h=640&fit=crop', 1),
        (@SP4, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=640&h=640&fit=crop', 1),
        (@SP5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 8. S?N PH?M SHOP 5: Beauty Care
-- ==========================================
DECLARE @Shop5ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Beauty Care');
IF @Shop5ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop5ID)
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES 
        (@Shop5ID, @MyPhamID, N'Serum Vitamin C Nh?t Hàn', 'serum-vitamin-c-nhat-han',
            N'Serum d??ng tr?ng da Vitamin C 15% k?t h?p EGF, tái t?o da, m? th?m nám', 450000, 4.7),
        (@Shop5ID, @MyPhamID, N'Kem Ch?ng N?ng An Toàn', 'kem-chong-nang-an-toan',
            N'Kem ch?ng n?ng v?t lý SPF50+ PA+++, lành tính, không kích ?ng da nh?y c?m', 320000, 4.5),
        (@Shop5ID, @MyPhamID, N'S?a R?a M?t Trà Xanh', 'sua-rua-mat-tra-xanh',
            N'S?a r?a m?t trà xanh Nh?t B?n, làm s?ch sâu, se khít l? chân lông', 185000, 4.4),
        (@Shop5ID, @MyPhamID, N'Son Môi ??t Lì Cao C?p', 'son-moi-dot-li-cao-cap',
            N'Son môi d?ng th?i lì cao c?p, lên màu chu?n, không lem, ?n môi ??m', 280000, 4.6),
        (@Shop5ID, @MyPhamID, N'Kem D??ng Th? Body 400ml', 'kem-duong-the-body-400ml',
            N'Kem d??ng th? tinh d?t d?a, th?m lâu, d??ng ?m 24h, gi?m r?ng da', 235000, 4.3);

    DECLARE @SP1 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'serum-vitamin-c-nhat-han');
    DECLARE @SP2 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'kem-chong-nang-an-toan');
    DECLARE @SP3 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'sua-rua-mat-tra-xanh');
    DECLARE @SP4 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'son-moi-dot-li-cao-cap');
    DECLARE @SP5 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'kem-duong-the-body-400ml');

    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=640&h=640&fit=crop', 1),
        (@SP2, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=640&h=640&fit=crop', 1),
        (@SP3, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=640&h=640&fit=crop', 1),
        (@SP4, 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=640&h=640&fit=crop', 1),
        (@SP5, 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 9. S?N PH?M SHOP 6: Gear Zone
-- ==========================================
DECLARE @Shop6ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Gear Zone');
IF @Shop6ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop6ID)
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES 
        (@Shop6ID, @GamingID, N'Bàn Phím C? Logitech G Pro', 'ban-phim-co-logitech-g-pro',
            N'Bàn phím c? Logitech G Pro X, switch GX Blue, RGB LIGHTSYNC, thi?t k? Tenkeyless', 2590000, 4.6),
        (@Shop6ID, @GamingID, N'Chu?t Gaming Razer DeathAdder', 'chuot-gaming-razer-deathadder',
            N'Chu?t gaming Razer DeathAdder V3, sensor 30K DPI, siêu nh? 59g, không dây', 2190000, 4.7),
        (@Shop6ID, @GamingID, N'Tai Nghe Gaming SteelSeries', 'tai-nghe-gaming-steelseries',
            N'Tai nghe SteelSeries Arctis 7+, âm thanh 7.1 ?o, pin 30h, không dây 2.4GHz', 3290000, 4.5),
        (@Shop6ID, @GamingID, N'Gh? Gaming Công Thái H?c', 'ghe-gaming-cong-thai-hoc',
            N'Gh? gaming cao c?p t?a l?ng l??i, tay v?n 4D, ?i?u ch?nh ng?a 180 ??', 5290000, 4.4),
        (@Shop6ID, @GamingID, N'Lót Chu?t XXL Siêu L?n', 'lot-chuot-xxl-sieu-lon',
            N'Lót chu?t gaming kích th??c 900x400mm, b? m?t v?i m?n, khâu vi?n ch?ng t?a', 390000, 4.8);

    DECLARE @SP1 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'ban-phim-co-logitech-g-pro');
    DECLARE @SP2 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'chuot-gaming-razer-deathadder');
    DECLARE @SP3 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'tai-nghe-gaming-steelseries');
    DECLARE @SP4 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'ghe-gaming-cong-thai-hoc');
    DECLARE @SP5 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'lot-chuot-xxl-sieu-lon');

    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=640&h=640&fit=crop', 1),
        (@SP2, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=640&h=640&fit=crop', 1),
        (@SP3, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=640&h=640&fit=crop', 1),
        (@SP4, 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=640&h=640&fit=crop', 1),
        (@SP5, 'https://images.unsplash.com/photo-1587778080078-5ad9cb51d19e?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 10. S?N PH?M SHOP 7: Food Market
-- ==========================================
DECLARE @Shop7ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Food Market');
IF @Shop7ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop7ID)
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES 
        (@Shop7ID, @ThucPhamID, N'M?t Ong Nguyên Ch?t 500g', 'mat-ong-nguyen-chat-500g',
            N'M?t ong r?ng nguyên ch?t, thu ho?ch t? r?ng Cúc Ph??ng, giàu d??ng ch?t', 350000, 4.7),
        (@Shop7ID, @ThucPhamID, N'Cà Phê Arabica ?à L?t', 'ca-phe-arabica-da-lat',
            N'Cà phê Arabica s?ch 100% t? ?à L?t, rang m?c v?a, h??ng th?m caramel', 120000, 4.6),
        (@Shop7ID, @ThucPhamID, N'H?t ?i?u Rang Mu?i 1kg', 'hat-dieu-rang-muoi-1kg',
            N'H?t ?i?u nhân rang mu?i t?i Bình Ph??c, giòn th?m, ?óng gói hút chân không', 250000, 4.5),
        (@Shop7ID, @ThucPhamID, N'Y?n M?ch Nguyên H?t 1kg', 'yen-mach-nguyen-hat-1kg',
            N'Y?n m?ch Úc nguyên h?t 100%, gi?u ch?t x?, h? tr? gi?m cân, t?t tim m?ch', 85000, 4.3),
        (@Shop7ID, @ThucPhamID, N'Trà Oolong ??c Tr?ng 250g', 'tra-oolong-dac-trung-250g',
            N'Trà Oolong Thái Nguyên cao c?p, h??ng hoa t? nhiên, h?u v? ng?t thanh', 200000, 4.8);

    DECLARE @SP1 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'mat-ong-nguyen-chat-500g');
    DECLARE @SP2 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'ca-phe-arabica-da-lat');
    DECLARE @SP3 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'hat-dieu-rang-muoi-1kg');
    DECLARE @SP4 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'yen-mach-nguyen-hat-1kg');
    DECLARE @SP5 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'tra-oolong-dac-trung-250g');

    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=640&h=640&fit=crop', 1),
        (@SP2, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=640&h=640&fit=crop', 1),
        (@SP3, 'https://images.unsplash.com/photo-1565981222-14e6b6a6b0f0?w=640&h=640&fit=crop', 1),
        (@SP4, 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=640&h=640&fit=crop', 1),
        (@SP5, 'https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 11. S?N PH?M SHOP 8: Sports Plus
-- ==========================================
DECLARE @Shop8ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Sports Plus');
IF @Shop8ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop8ID)
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES 
        (@Shop8ID, @TheThaoID, N'Giày Ch?y B? Nike Air Max', 'giay-chay-bo-nike-air-max',
            N'Giày ch?y b? Nike Air Max 2024, ?m êm Air Sole, breathable mesh upper, siêu nh?', 3590000, 4.7),
        (@Shop8ID, @TheThaoID, N'Áo Thun Th? Thao Adidas', 'ao-thun-the-thao-adidas',
            N'Áo thun th? thao Adidas AEROREADY, th?m hút m? hôi, co giãn 4 chi?u', 650000, 4.5),
        (@Shop8ID, @TheThaoID, N'T? T?ng Gym 20kg', 'ta-tap-gym-20kg',
            N'T? t?ng gym cao su không mùi, tay c?m ch?ng tr?n, b? 2 qu? t? 10kg + thanh ?n', 890000, 4.4),
        (@Shop8ID, @TheThaoID, N'Bóng ?á Nike Premier League', 'bong-da-nike-premier-league',
            N'Bóng ?á Nike Flight 2024, chu?n b?n kích th??c size 5, ??c bi?t cho sân c?', 1650000, 4.6),
        (@Shop8ID, @TheThaoID, N'Th?m T?p Yoga Cao C?p', 'tham-tap-yoga-cao-cap',
            N'Th?m t?p yoga TPE ch?ng tr??t, dày 6mm, t? nhiên kháng khu?n, kèm dây ?eo', 420000, 4.8);

    DECLARE @SP1 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'giay-chay-bo-nike-air-max');
    DECLARE @SP2 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'ao-thun-the-thao-adidas');
    DECLARE @SP3 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'ta-tap-gym-20kg');
    DECLARE @SP4 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'bong-da-nike-premier-league');
    DECLARE @SP5 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'tham-tap-yoga-cao-cap');

    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&h=640&fit=crop', 1),
        (@SP2, 'https://images.unsplash.com/photo-1572495641004-28421a5c1f6c?w=640&h=640&fit=crop', 1),
        (@SP3, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=640&h=640&fit=crop', 1),
        (@SP4, 'https://images.unsplash.com/photo-1614632537423-0e1c2a5a8e06?w=640&h=640&fit=crop', 1),
        (@SP5, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 12. S?N PH?M SHOP 9: Digital World
-- ==========================================
DECLARE @Shop9ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Digital World');
IF @Shop9ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop9ID)
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES 
        (@Shop9ID, @GiaDungID, N'T? L?nh LG Inverter 300L', 'tu-lanh-lg-inverter-300l',
            N'T? l?nh LG Inverter 300L, Door-In-Door, kháng khu?n kh?, ti?t ki?m ?i?n 40%', 11900000, 4.6),
        (@Shop9ID, @GiaDungID, N'Máy Gi?t LG Inverter 9kg', 'may-giat-lg-inverter-9kg',
            N'Máy gi?t c?a ngang LG Inverter 9kg, gi?t h?i n??c, di?t khu?n, lo?i b? nh?n', 8990000, 4.5),
        (@Shop9ID, @GiaDungID, N'TV Samsung QLED 65 inch', 'tv-samsung-qled-65-inch',
            N'TV Samsung QLED 4K 65 inch, HDR10+, Smart Hub, Gaming Hub, lu?t web m??t', 25990000, 4.7),
        (@Shop9ID, @GiaDungID, N'Máy L?nh Inverter 12000BTU', 'may-lanh-inverter-12000btu',
            N'Máy l?nh Daikin Inverter 12000BTU, ti?t ki?m ?i?n, l?c khí s?ch, l?m vi?c êm', 12490000, 4.4),
        (@Shop9ID, @GiaDungID, N'Máy Hút B?i Robot Thông Minh', 'may-hut-bui-robot-thong-minh',
            N'Máy hút b?i robot Xiaomi, LiDAR mapping, hút 4000Pa, lau nhà, t? ?ng x? rác', 6990000, 4.8);

    DECLARE @SP1 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'tu-lanh-lg-inverter-300l');
    DECLARE @SP2 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'may-giat-lg-inverter-9kg');
    DECLARE @SP3 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'tv-samsung-qled-65-inch');
    DECLARE @SP4 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'may-lanh-inverter-12000btu');
    DECLARE @SP5 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'may-hut-bui-robot-thong-minh');

    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=640&h=640&fit=crop', 1),
        (@SP2, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=640&h=640&fit=crop', 1),
        (@SP3, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=640&h=640&fit=crop', 1),
        (@SP4, 'https://images.unsplash.com/photo-1631635589499-afdea35b45b8?w=640&h=640&fit=crop', 1),
        (@SP5, 'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 13. S?N PH?M SHOP 10: Pet Love
-- ==========================================
DECLARE @Shop10ID INT = (SELECT TOP 1 MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Pet Love');
IF @Shop10ID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM SanPham WHERE MaCuaHang = @Shop10ID)
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
    VALUES 
        (@Shop10ID, @ThucPhamID, N'Th?c ?n Chó Royal Canin 7.5kg', 'thuc-an-cho-royal-canin-75kg',
            N'Th?c ?n cao c?p cho chó Royal Canin Size Health Nutrition, ?y ?? d??ng ch?t', 750000, 4.7),
        (@Shop10ID, @ThucPhamID, N'Cát V? Sinh Cho Mèo 10L', 'cat-ve-sinh-cho-meo-10l',
            N'Cát v? sinh cho mèo Bentonite Nh?t B?n, kh?u mùi t?t, vón c?c nhanh', 120000, 4.5),
        (@Shop10ID, @ThucPhamID, N'Nhà V? Sinh Cho Chó Mèo', 'nha-ve-sinh-cho-cho-meo',
            N'Nhà v? sinh thông minh cho chó mèo, khay ?áy kín, có mùi th?m, d? v? sinh', 350000, 4.3),
        (@Shop10ID, @TheThaoID, N'Dây D?t Chó Ch?ng C?n', 'day-dat-cho-chong-can',
            N'Dây d?t chó ch?ng c?n, v?i nylon ch?c ch?n 1.5m, khóa xoay 360 ??', 180000, 4.6),
        (@Shop10ID, @GiaDungID, N'? Cho Mèo Cao C?p', 'o-cho-meo-cao-cap',
            N'? cho mèo 3 t?ng, khung g??
 ?n, n?m êm, có tr?u cào móng, phù h?p m?i gi?ng mèo', 890000, 4.8);

    DECLARE @SP1 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'thuc-an-cho-royal-canin-75kg');
    DECLARE @SP2 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'cat-ve-sinh-cho-meo-10l');
    DECLARE @SP3 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'nha-ve-sinh-cho-cho-meo');
    DECLARE @SP4 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'day-dat-cho-chong-can');
    DECLARE @SP5 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'o-cho-meo-cao-cap');

    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1565708098709-5c0e4e42b63e?w=640&h=640&fit=crop', 1),
        (@SP2, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=640&h=640&fit=crop', 1),
        (@SP3, 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=640&h=640&fit=crop', 1),
        (@SP4, 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=640&h=640&fit=crop', 1),
        (@SP5, 'https://images.unsplash.com/photo-1595246140625-573b715d11c8?w=640&h=640&fit=crop', 1);
END
GO

-- ==========================================
-- 14. THÊM ?ÁNH GIÁ CHO S?N PH?M
-- T?o ??n hàng gi? ?? có MaDonHang h?p l?
-- ==========================================
DECLARE @Reviewers TABLE (MaNguoiDung INT, idx INT);
INSERT INTO @Reviewers
SELECT MaNguoiDung, ROW_NUMBER() OVER (ORDER BY MaNguoiDung) FROM NguoiDung
WHERE Email LIKE 'reviewer%@marthub.vn';

DECLARE @TestUserID INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'user@marthub.vn');
DECLARE @UserAddrID INT = (SELECT TOP 1 MaDiaChi FROM DiaChiGiaoHang WHERE MaNguoiDung = @TestUserID);

-- T?o ??a ch? t?m cho reviewer
INSERT INTO DiaChiGiaoHang (MaNguoiDung, TenNguoiNhan, SDTNguoiNhan, DiaChiCuThe, PhuongXa, QuanHuyen, TinhThanh, LaMacDinh)
SELECT MaNguoiDung, HoTen, SoDienThoai, N'123 ???ng Test', N'Ph??ng 1', N'Qu?n 1', N'TP. H? Chí Minh', 0
FROM NguoiDung WHERE Email LIKE 'reviewer%@marthub.vn'
AND NOT EXISTS (SELECT 1 FROM DiaChiGiaoHang WHERE MaNguoiDung = NguoiDung.MaNguoiDung);
GO

-- Bi?t các reviewer comment
DECLARE @Reviews TABLE (rv_text NVARCHAR(MAX), rv_score INT, idx INT);
INSERT INTO @Reviews VALUES
    (N'S?n ph?m r?t t?t, ?óng gói c?n th?n, giao hàng nhanh! S? ?ng h? d?i.', 5, 1),
    (N'Hàng ?úng mô t?, ch?t l??ng t?t. S? mua l?n sau.', 4, 2),
    (N'S?n ph?m t?m ?n nh?ng giá h?i cao so v?i th? tr??ng.', 3, 3),
    (N'R?t hài lòng! Shop nhi?t tình, h?ng t??i ?ep ?úng nh? hình.', 5, 4),
    (N'Ch?t l??ng khá t?t, s? d?ng ?n ??nh. S? gi?i thi?u b?n bè.', 4, 5),
    (N'C?n c?i thi?n khâu ?óng gói, nh?ng s?n ph?m thì t?t.', 4, 6),
    (N'Quá t?y v?i s?n ph?m! Không phí ti?n.', 5, 7),
    (N'Bình th??ng, không có gì ??c bi?t.', 3, 8),
    (N'Shop giao hàng siêu nhanh, hàng ch?t l??ng, ?úng cam k?t!', 5, 9),
    (N'Mua l?n 2 r?i, v?n r?t hài lòng. Uy tín!', 5, 10);
GO

DECLARE @AllProducts TABLE (MaSanPham INT, shop_idx INT, prod_idx INT);
INSERT INTO @AllProducts
SELECT MaSanPham, ROW_NUMBER() OVER (ORDER BY MaCuaHang, MaSanPham) / 6 + 1,
       ROW_NUMBER() OVER (PARTITION BY MaCuaHang ORDER BY MaSanPham)
FROM SanPham;
GO

-- L?y c?c reviewer ID
DECLARE reviewer_cursor CURSOR FOR 
SELECT MaNguoiDung FROM NguoiDung WHERE Email LIKE 'reviewer%@marthub.vn';
DECLARE @rv_user_id INT;
OPEN reviewer_cursor;

DECLARE product_cursor CURSOR FOR 
SELECT MaSanPham FROM SanPham WHERE TrangThai = N'HOAT_DONG';
DECLARE @prod_id INT, @shop_id_for_order INT;
OPEN product_cursor;

FETCH NEXT FROM product_cursor INTO @prod_id;
WHILE @@FETCH_STATUS = 0
BEGIN
    -- M?i s?n ph?m có 3-5 review
    DECLARE @num_rv INT = 3 + CAST(RAND(CHECKSUM(NEWID())) * 3 AS INT);
    DECLARE @i INT = 0;
    
    -- L?y shop c?a s?n ph?m
    SELECT @shop_id_for_order = MaCuaHang FROM SanPham WHERE MaSanPham = @prod_id;
    
    WHILE @i < @num_rv
    BEGIN
        FETCH NEXT FROM reviewer_cursor INTO @rv_user_id;
        IF @@FETCH_STATUS <> 0
        BEGIN
            CLOSE reviewer_cursor;
            OPEN reviewer_cursor;
            FETCH NEXT FROM reviewer_cursor INTO @rv_user_id;
        END
        
        -- Ki?m tra ??a ch? c?a reviewer
        DECLARE @rv_addr_id INT = (SELECT TOP 1 MaDiaChi FROM DiaChiGiaoHang WHERE MaNguoiDung = @rv_user_id);
        IF @rv_addr_id IS NOT NULL AND @prod_id IS NOT NULL AND @shop_id_for_order IS NOT NULL
        BEGIN
            -- T?o ??n hàng ?ã giao
            DECLARE @rv_order_id INT;
            IF NOT EXISTS (SELECT 1 FROM DonHang WHERE MaNguoiDung = @rv_user_id AND MaCuaHang = @shop_id_for_order AND TrangThaiDonHang = N'DA_GIAO')
            BEGIN
                INSERT INTO DonHang (MaNguoiDung, MaCuaHang, MaDiaChi, TongTien, TienGiamGia, TienThanhToan, PhuongThucThanhToan, TrangThaiThanhToan, TrangThaiDonHang, PhiVanChuyen, NgayTao)
                VALUES (@rv_user_id, @shop_id_for_order, @rv_addr_id, 100000, 0, 100000, N'CHUYEN_KHOAN', N'DA_THANH_TOAN', N'DA_GIAO', 15000, DATEADD(DAY, -CAST(RAND(CHECKSUM(NEWID())) * 30 AS INT), GETDATE()));
                SET @rv_order_id = SCOPE_IDENTITY();
                
                -- T?o chi ti?t ??n hàng v?i bi?n th? b?t k?
                DECLARE @variant_id INT = (SELECT TOP 1 MaPhienBan FROM PhienBanSanPham WHERE MaSanPham = @prod_id);
                IF @variant_id IS NOT NULL
                    INSERT INTO ChiTietDonHang (MaDonHang, MaPhienBan, SoLuong, GiaLucMua)
                    VALUES (@rv_order_id, @variant_id, 1, (SELECT TOP 1 GiaGoc FROM SanPham WHERE MaSanPham = @prod_id));
                
                -- Thêm review
                DECLARE @rv_text NVARCHAR(MAX), @rv_score INT;
                SELECT TOP 1 @rv_text = rv_text, @rv_score = rv_score 
                FROM @Reviews WHERE idx = 1 + CAST(RAND(CHECKSUM(NEWID())) * 10 AS INT);
                
                IF @rv_order_id IS NOT NULL AND @variant_id IS NOT NULL
                BEGIN
                    INSERT INTO DanhGiaSanPham (MaNguoiDung, MaSanPham, MaDonHang, DiemDanhGia, BinhLuan, NgayTao)
                    VALUES (@rv_user_id, @prod_id, @rv_order_id, @rv_score, @rv_text, DATEADD(DAY, -CAST(RAND(CHECKSUM(NEWID())) * 10 AS INT), GETDATE()));
                END
            END
        END
        
        SET @i = @i + 1;
    END
    
    FETCH NEXT FROM product_cursor INTO @prod_id;
END

CLOSE product_cursor;
DEALLOCATE product_cursor;
CLOSE reviewer_cursor;
DEALLOCATE reviewer_cursor;
GO

-- ==========================================
-- 15. C?P NH?T ?I?M TRUNG BÌNH CHO T?T C? S?N PH?M
-- ==========================================
UPDATE SanPham
SET DanhGiaTrungBinh = (
    SELECT ISNULL(AVG(CAST(DiemDanhGia AS DECIMAL(3,2))), 0)
    FROM DanhGiaSanPham WHERE MaSanPham = SanPham.MaSanPham
)
WHERE MaSanPham IN (SELECT DISTINCT MaSanPham FROM DanhGiaSanPham);
GO

-- ==========================================
-- 16. KI?M TRA K?T QU?
-- ==========================================
PRINT '============================================';
PRINT 'SEED MASSIVE DATA COMPLETED!';
PRINT '============================================';
PRINT '';
SELECT 'T?ng s? ng??i dùng:' AS ThongKe, COUNT(*) AS SoLuong FROM NguoiDung;
SELECT 'T?ng s? c?a hàng:' AS ThongKe, COUNT(*) AS SoLuong FROM CuaHang;
SELECT 'T?ng s? s?n ph?m:' AS ThongKe, COUNT(*) AS SoLuong FROM SanPham;
SELECT 'T?ng s? ?ánh giá:' AS ThongKe, COUNT(*) AS SoLuong FROM DanhGiaSanPham;
SELECT 'T?ng s? hình ?nh:' AS ThongKe, COUNT(*) AS SoLuong FROM HinhAnhSanPham;
PRINT '';
PRINT '=== DANH SÁCH C?A HÀNG ===';
SELECT MaCuaHang, TenCuaHang FROM CuaHang;
PRINT '';
PRINT '=== S?N PH?M THEO C?A HÀNG ===';
SELECT ch.TenCuaHang, COUNT(sp.MaSanPham) AS SoSanPham
FROM CuaHang ch LEFT JOIN SanPham sp ON ch.MaCuaHang = sp.MaCuaHang
GROUP BY ch.TenCuaHang ORDER BY SoSanPham DESC;
PRINT '';
PRINT '=== 10 REVIEW G?N ?ÂY ===';
SELECT TOP 10 nd.HoTen, sp.TenSanPham, dg.DiemDanhGia, dg.BinhLuan
FROM DanhGiaSanPham dg
JOIN NguoiDung nd ON dg.MaNguoiDung = nd.MaNguoiDung
JOIN SanPham sp ON dg.MaSanPham = sp.MaSanPham
ORDER BY dg.MaDanhGia DESC;
GO
