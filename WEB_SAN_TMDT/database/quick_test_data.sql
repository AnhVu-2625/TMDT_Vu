-- ==========================================
-- QUICK TEST DATA FOR DISPUTE & SETTLEMENT
-- Tạo nhanh dữ liệu để test
-- ==========================================

USE ThuongMaiDienTu;
GO

PRINT 'Creating test data...';

-- ==========================================
-- 1. Tạo người dùng test (nếu chưa có)
-- ==========================================

-- Tạo người mua test
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE Email = 'buyer1@test.com')
BEGIN
    INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai)
    VALUES (N'Nguyễn Văn A', 'buyer1@test.com', '0901234567', '$2a$10$abcdefghijklmnopqrstuv', N'NGUOI_DUNG', N'HOAT_DONG');
    PRINT 'Created buyer user';
END

-- Tạo người bán test
DECLARE @SellerId INT;
IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE Email = 'seller1@test.com')
BEGIN
    INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai)
    VALUES (N'Trần Thị B', 'seller1@test.com', '0907654321', '$2a$10$abcdefghijklmnopqrstuv', N'NGUOI_DUNG', N'HOAT_DONG');
    SET @SellerId = SCOPE_IDENTITY();
    PRINT 'Created seller user';
END
ELSE
BEGIN
    SELECT @SellerId = MaNguoiDung FROM NguoiDung WHERE Email = 'seller1@test.com';
END

-- Tạo cửa hàng test
DECLARE @ShopId INT;
IF NOT EXISTS (SELECT 1 FROM CuaHang WHERE MaNguoiDung = @SellerId)
BEGIN
    INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
    VALUES (@SellerId, N'Shop Test ABC', N'Cửa hàng test', N'HOAT_DONG', 0);
    SET @ShopId = SCOPE_IDENTITY();
    PRINT 'Created shop';
END
ELSE
BEGIN
    SELECT @ShopId = MaCuaHang FROM CuaHang WHERE MaNguoiDung = @SellerId;
END

-- ==========================================
-- 2. Tạo danh mục và sản phẩm test
-- ==========================================

DECLARE @CategoryId INT;
IF NOT EXISTS (SELECT 1 FROM DanhMucSanPham WHERE TenDanhMuc = N'Test Category')
BEGIN
    INSERT INTO DanhMucSanPham (TenDanhMuc, DuongDan)
    VALUES (N'Test Category', 'test-category');
    SET @CategoryId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SELECT @CategoryId = MaDanhMuc FROM DanhMucSanPham WHERE TenDanhMuc = N'Test Category';
END

DECLARE @ProductId INT;
IF NOT EXISTS (SELECT 1 FROM SanPham WHERE TenSanPham = N'Sản phẩm test')
BEGIN
    INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, TrangThai)
    VALUES (@ShopId, @CategoryId, N'Sản phẩm test', 'san-pham-test', N'Mô tả test', 500000, N'HOAT_DONG');
    SET @ProductId = SCOPE_IDENTITY();
    PRINT 'Created product';
END
ELSE
BEGIN
    SELECT @ProductId = MaSanPham FROM SanPham WHERE TenSanPham = N'Sản phẩm test';
END

-- Tạo phiên bản sản phẩm
DECLARE @VariantId INT;
IF NOT EXISTS (SELECT 1 FROM PhienBanSanPham WHERE MaSanPham = @ProductId)
BEGIN
    INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho)
    VALUES (@ProductId, N'Đỏ', N'M', 500000, 100);
    SET @VariantId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SELECT @VariantId = MaPhienBan FROM PhienBanSanPham WHERE MaSanPham = @ProductId;
END

-- ==========================================
-- 3. Tạo địa chỉ giao hàng
-- ==========================================

DECLARE @BuyerId INT;
SELECT @BuyerId = MaNguoiDung FROM NguoiDung WHERE Email = 'buyer1@test.com';

DECLARE @AddressId INT;
IF NOT EXISTS (SELECT 1 FROM DiaChiGiaoHang WHERE MaNguoiDung = @BuyerId)
BEGIN
    INSERT INTO DiaChiGiaoHang (MaNguoiDung, TenNguoiNhan, SDTNguoiNhan, DiaChiCuThe, PhuongXa, QuanHuyen, TinhThanh, LaMacDinh)
    VALUES (@BuyerId, N'Nguyễn Văn A', '0901234567', N'123 Test Street', N'Phường 1', N'Quận 1', N'TP.HCM', 1);
    SET @AddressId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SELECT @AddressId = MaDiaChi FROM DiaChiGiaoHang WHERE MaNguoiDung = @BuyerId;
END

-- ==========================================
-- 4. Tạo đơn hàng test
-- ==========================================

PRINT 'Creating test orders...';

-- Tạo 5 đơn hàng đã giao và hết hạn đổi trả (để test đối soát)
DECLARE @i INT = 1;
WHILE @i <= 5
BEGIN
    DECLARE @OrderId INT;
    
    INSERT INTO DonHang (
        MaNguoiDung, MaCuaHang, MaDiaChi, 
        TongTien, TienGiamGia, TienThanhToan, PhiVanChuyen,
        PhuongThucThanhToan, TrangThaiThanhToan, TrangThaiDonHang,
        NgayTao, NgayCapNhat, NgayHetHanDoiTra, DaDoiSoat, VideoDongHang
    )
    VALUES (
        @BuyerId, @ShopId, @AddressId,
        500000, 0, 500000, 30000,
        N'CHUYEN_KHOAN', N'DA_THANH_TOAN', N'DA_GIAO',
        DATEADD(DAY, -15, GETDATE()),
        DATEADD(DAY, -10, GETDATE()),
        DATEADD(DAY, -3, GETDATE()),
        0,
        'https://example.com/packing_video_' + CAST(@i AS NVARCHAR) + '.mp4'
    );
    
    SET @OrderId = SCOPE_IDENTITY();
    
    -- Thêm chi tiết đơn hàng
    INSERT INTO ChiTietDonHang (MaDonHang, MaPhienBan, SoLuong, GiaLucMua)
    VALUES (@OrderId, @VariantId, 1, 500000);
    
    SET @i = @i + 1;
END

PRINT 'Created 5 eligible orders for settlement';

-- Tạo 2 đơn hàng có tranh chấp
DECLARE @DisputeOrder1 INT, @DisputeOrder2 INT;

-- Đơn hàng tranh chấp 1: Shop từ chối
INSERT INTO DonHang (
    MaNguoiDung, MaCuaHang, MaDiaChi, 
    TongTien, TienGiamGia, TienThanhToan, PhiVanChuyen,
    PhuongThucThanhToan, TrangThaiThanhToan, TrangThaiDonHang,
    NgayTao, NgayCapNhat, NgayHetHanDoiTra, DaDoiSoat, VideoDongHang
)
VALUES (
    @BuyerId, @ShopId, @AddressId,
    500000, 0, 500000, 30000,
    N'CHUYEN_KHOAN', N'DA_THANH_TOAN', N'DA_GIAO',
    DATEADD(DAY, -8, GETDATE()),
    DATEADD(DAY, -5, GETDATE()),
    DATEADD(DAY, 2, GETDATE()),
    0,
    'https://example.com/packing_video_dispute1.mp4'
);
SET @DisputeOrder1 = SCOPE_IDENTITY();

INSERT INTO ChiTietDonHang (MaDonHang, MaPhienBan, SoLuong, GiaLucMua)
VALUES (@DisputeOrder1, @VariantId, 1, 500000);

-- Tạo yêu cầu đổi trả
INSERT INTO YeuCauDoiTra (MaDonHang, LyDo, AnhBangChung, VideoMoHang, TrangThai)
VALUES (
    @DisputeOrder1,
    N'Sản phẩm không đúng với mô tả. Màu sắc khác, chất liệu kém hơn quảng cáo.',
    N'https://example.com/evidence1.jpg,https://example.com/evidence2.jpg',
    N'https://example.com/unboxing_video1.mp4',
    N'SHOP_TU_CHOI'
);

DECLARE @DisputeId1 INT = SCOPE_IDENTITY();

-- Thêm lịch sử tranh chấp
INSERT INTO LichSuTrancChap (MaDoiTra, HanhDong, NguoiThucHien, GhiChu, NgayThucHien)
VALUES 
    (@DisputeId1, N'Người mua tạo yêu cầu đổi trả', @BuyerId, N'Yêu cầu đổi trả do sản phẩm không đúng mô tả', DATEADD(DAY, -5, GETDATE())),
    (@DisputeId1, N'Shop từ chối yêu cầu đổi trả', @SellerId, N'Sản phẩm đã được kiểm tra kỹ trước khi gửi', DATEADD(DAY, -4, GETDATE()));

PRINT 'Created dispute 1: Shop refused';

-- Đơn hàng tranh chấp 2: Đang chờ admin
INSERT INTO DonHang (
    MaNguoiDung, MaCuaHang, MaDiaChi, 
    TongTien, TienGiamGia, TienThanhToan, PhiVanChuyen,
    PhuongThucThanhToan, TrangThaiThanhToan, TrangThaiDonHang,
    NgayTao, NgayCapNhat, NgayHetHanDoiTra, DaDoiSoat, VideoDongHang
)
VALUES (
    @BuyerId, @ShopId, @AddressId,
    500000, 0, 500000, 30000,
    N'CHUYEN_KHOAN', N'DA_THANH_TOAN', N'DA_GIAO',
    DATEADD(DAY, -7, GETDATE()),
    DATEADD(DAY, -4, GETDATE()),
    DATEADD(DAY, 3, GETDATE()),
    0,
    'https://example.com/packing_video_dispute2.mp4'
);
SET @DisputeOrder2 = SCOPE_IDENTITY();

INSERT INTO ChiTietDonHang (MaDonHang, MaPhienBan, SoLuong, GiaLucMua)
VALUES (@DisputeOrder2, @VariantId, 1, 500000);

-- Tạo yêu cầu đổi trả đang chờ admin
INSERT INTO YeuCauDoiTra (MaDonHang, LyDo, AnhBangChung, VideoMoHang, TrangThai, QuyetDinhCuaAdmin)
VALUES (
    @DisputeOrder2,
    N'Sản phẩm bị hỏng trong quá trình vận chuyển. Shop từ chối trách nhiệm.',
    N'https://example.com/damaged1.jpg,https://example.com/damaged2.jpg',
    N'https://example.com/damaged_unboxing.mp4',
    N'KHIEU_NAI_ADMIN',
    N'Shop nói đây là lỗi của đơn vị vận chuyển. Nhưng tôi đã quay video mở hàng ngay khi nhận.'
);

DECLARE @DisputeId2 INT = SCOPE_IDENTITY();

-- Thêm lịch sử tranh chấp
INSERT INTO LichSuTrancChap (MaDoiTra, HanhDong, NguoiThucHien, GhiChu, NgayThucHien)
VALUES 
    (@DisputeId2, N'Người mua tạo yêu cầu đổi trả', @BuyerId, N'Sản phẩm bị hỏng', DATEADD(DAY, -4, GETDATE())),
    (@DisputeId2, N'Shop từ chối yêu cầu đổi trả', @SellerId, N'Lỗi vận chuyển, không phải lỗi shop', DATEADD(DAY, -3, GETDATE())),
    (@DisputeId2, N'Người mua khiếu nại lên Admin', @BuyerId, N'Tôi có video mở hàng chứng minh', DATEADD(DAY, -2, GETDATE()));

PRINT 'Created dispute 2: Escalated to admin';

-- Thêm video bằng chứng
INSERT INTO BangChungVideo (MaDonHang, LoaiVideo, DuongDanVideo, NguoiTai, NgayTai)
VALUES 
    (@DisputeOrder1, N'DONG_HANG', 'https://example.com/packing_video_dispute1.mp4', @SellerId, DATEADD(DAY, -6, GETDATE())),
    (@DisputeOrder1, N'MO_HANG', 'https://example.com/unboxing_video1.mp4', @BuyerId, DATEADD(DAY, -5, GETDATE())),
    (@DisputeOrder2, N'DONG_HANG', 'https://example.com/packing_video_dispute2.mp4', @SellerId, DATEADD(DAY, -5, GETDATE())),
    (@DisputeOrder2, N'MO_HANG', 'https://example.com/damaged_unboxing.mp4', @BuyerId, DATEADD(DAY, -4, GETDATE()));

PRINT 'Created video evidence';

-- ==========================================
-- 5. Hiển thị kết quả
-- ==========================================

PRINT '';
PRINT '========================================';
PRINT 'TEST DATA CREATED SUCCESSFULLY!';
PRINT '========================================';

PRINT '';
PRINT 'Summary:';
SELECT 
    'Total Orders' as Type,
    COUNT(*) as Count
FROM DonHang
UNION ALL
SELECT 
    'Eligible for Settlement',
    COUNT(*)
FROM DonHang
WHERE TrangThaiDonHang = N'DA_GIAO'
    AND TrangThaiThanhToan = N'DA_THANH_TOAN'
    AND DaDoiSoat = 0
    AND NgayHetHanDoiTra < GETDATE()
UNION ALL
SELECT 
    'Disputes',
    COUNT(*)
FROM YeuCauDoiTra;

PRINT '';
PRINT 'Disputes:';
SELECT 
    dt.MaDoiTra,
    dt.MaDonHang,
    dt.TrangThai,
    dh.TienThanhToan
FROM YeuCauDoiTra dt
INNER JOIN DonHang dh ON dt.MaDonHang = dh.MaDonHang;

PRINT '';
PRINT 'Eligible Orders:';
SELECT TOP 5
    MaDonHang,
    TienThanhToan,
    NgayCapNhat as NgayGiao,
    NgayHetHanDoiTra
FROM DonHang
WHERE TrangThaiDonHang = N'DA_GIAO'
    AND TrangThaiThanhToan = N'DA_THANH_TOAN'
    AND DaDoiSoat = 0
    AND NgayHetHanDoiTra < GETDATE();

PRINT '';
PRINT '========================================';
PRINT 'You can now test the APIs!';
PRINT '========================================';
GO
