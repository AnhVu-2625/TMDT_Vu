-- ==========================================
-- SEED DATA FOR DISPUTE & SETTLEMENT TESTING
-- Dữ liệu mẫu để test tính năng tranh chấp và đối soát
-- ==========================================

USE ThuongMaiDienTu;
GO

-- ==========================================
-- 1. TẠO ĐƠN HÀNG MẪU ĐỂ TEST DISPUTES
-- ==========================================

DECLARE @UserID INT = (SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'user@marthub.vn');
DECLARE @ShopID INT = (SELECT MaCuaHang FROM CuaHang WHERE TenCuaHang = N'Tech Store Official');
DECLARE @AddressID INT = (SELECT TOP 1 MaDiaChi FROM DiaChiGiaoHang WHERE MaNguoiDung = @UserID);
DECLARE @ProductVariantID INT = (SELECT TOP 1 MaPhienBan FROM PhienBanSanPham ORDER BY MaPhienBan);

-- Tạo 3 đơn hàng test
IF @UserID IS NOT NULL AND @ShopID IS NOT NULL AND @AddressID IS NOT NULL
BEGIN
    -- Đơn hàng 1: Trạng thái DA_GIAO, hết hạn đổi trả
    INSERT INTO DonHang (MaNguoiDung, MaCuaHang, MaDiaChi, TongTien, TienThanhToan, PhuongThucThanhToan, TrangThaiDonHang, TrangThaiThanhToan, NgayTao, NgayCapNhat, NgayHetHanDoiTra, DaDoiSoat)
    VALUES (
        @UserID, @ShopID, @AddressID,
        25990000, 25990000, N'CHUYEN_KHOAN',
        N'DA_GIAO', N'DA_THANH_TOAN',
        DATEADD(DAY, -10, GETDATE()), DATEADD(DAY, -8, GETDATE()), DATEADD(DAY, -3, GETDATE()),
        0
    );
    DECLARE @OrderID1 INT = SCOPE_IDENTITY();
    
    -- Chi tiết đơn hàng 1
    IF @ProductVariantID IS NOT NULL
    BEGIN
        INSERT INTO ChiTietDonHang (MaDonHang, MaPhienBan, SoLuong, GiaLucMua)
        VALUES (@OrderID1, @ProductVariantID, 1, 25990000);
    END

    -- Đơn hàng 2: Trạng thái DA_GIAO, hết hạn đổi trả
    INSERT INTO DonHang (MaNguoiDung, MaCuaHang, MaDiaChi, TongTien, TienThanhToan, PhuongThucThanhToan, TrangThaiDonHang, TrangThaiThanhToan, NgayTao, NgayCapNhat, NgayHetHanDoiTra, DaDoiSoat)
    VALUES (
        @UserID, @ShopID, @AddressID,
        27990000, 27990000, N'CHUYEN_KHOAN',
        N'DA_GIAO', N'DA_THANH_TOAN',
        DATEADD(DAY, -12, GETDATE()), DATEADD(DAY, -10, GETDATE()), DATEADD(DAY, -5, GETDATE()),
        0
    );
    DECLARE @OrderID2 INT = SCOPE_IDENTITY();
    
    IF @ProductVariantID IS NOT NULL
    BEGIN
        INSERT INTO ChiTietDonHang (MaDonHang, MaPhienBan, SoLuong, GiaLucMua)
        VALUES (@OrderID2, @ProductVariantID, 1, 27990000);
    END

    -- Đơn hàng 3: Trạng thái DA_GIAO, đủ điều kiện đối soát
    INSERT INTO DonHang (MaNguoiDung, MaCuaHang, MaDiaChi, TongTien, TienThanhToan, PhuongThucThanhToan, TrangThaiDonHang, TrangThaiThanhToan, NgayTao, NgayCapNhat, NgayHetHanDoiTra, DaDoiSoat)
    VALUES (
        @UserID, @ShopID, @AddressID,
        7990000, 7990000, N'CHUYEN_KHOAN',
        N'DA_GIAO', N'DA_THANH_TOAN',
        DATEADD(DAY, -15, GETDATE()), DATEADD(DAY, -13, GETDATE()), DATEADD(DAY, -8, GETDATE()),
        0
    );
    DECLARE @OrderID3 INT = SCOPE_IDENTITY();
    
    IF @ProductVariantID IS NOT NULL
    BEGIN
        INSERT INTO ChiTietDonHang (MaDonHang, MaPhienBan, SoLuong, GiaLucMua)
        VALUES (@OrderID3, @ProductVariantID, 1, 7990000);
    END

    PRINT 'Created 3 test orders: ' + CAST(@OrderID1 AS NVARCHAR) + ', ' + CAST(@OrderID2 AS NVARCHAR) + ', ' + CAST(@OrderID3 AS NVARCHAR);
END
GO

-- ==========================================
-- 2. Tạo yêu cầu đổi trả mẫu cho các đơn hàng
-- ==========================================

DECLARE @MaDonHang1 INT;
DECLARE @MaDonHang2 INT;
DECLARE @MaDonHang3 INT;

-- Lấy 3 đơn hàng mới tạo
SELECT TOP 3 @MaDonHang1 = MaDonHang FROM DonHang WHERE TrangThaiDonHang = N'DA_GIAO' AND TrangThaiThanhToan = N'DA_THANH_TOAN' ORDER BY MaDonHang DESC;
SELECT TOP 1 @MaDonHang2 = MaDonHang FROM DonHang WHERE TrangThaiDonHang = N'DA_GIAO' AND TrangThaiThanhToan = N'DA_THANH_TOAN' AND MaDonHang != @MaDonHang1 ORDER BY MaDonHang DESC;
SELECT TOP 1 @MaDonHang3 = MaDonHang FROM DonHang WHERE TrangThaiDonHang = N'DA_GIAO' AND TrangThaiThanhToan = N'DA_THANH_TOAN' AND MaDonHang NOT IN (@MaDonHang1, @MaDonHang2) ORDER BY MaDonHang DESC;

-- Tranh chấp 1: Shop từ chối
IF @MaDonHang1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM YeuCauDoiTra WHERE MaDonHang = @MaDonHang1)
BEGIN
    INSERT INTO YeuCauDoiTra (MaDonHang, LyDo, AnhBangChung, VideoMoHang, TrangThai)
    VALUES (
        @MaDonHang1,
        N'Sản phẩm không đúng với mô tả. Màu sắc khác, chất liệu kém hơn quảng cáo.',
        N'https://example.com/evidence1.jpg,https://example.com/evidence2.jpg',
        N'https://example.com/unboxing_video.mp4',
        N'SHOP_TU_CHOI'
    );

    UPDATE DonHang
    SET VideoDongHang = N'https://example.com/packing_video.mp4'
    WHERE MaDonHang = @MaDonHang1;

    PRINT 'Created dispute 1 (SHOP_TU_CHOI) for order: ' + CAST(@MaDonHang1 AS NVARCHAR);
END

-- Tranh chấp 2: Đang chờ admin quyết định
IF @MaDonHang2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM YeuCauDoiTra WHERE MaDonHang = @MaDonHang2)
BEGIN
    INSERT INTO YeuCauDoiTra (MaDonHang, LyDo, AnhBangChung, VideoMoHang, TrangThai)
    VALUES (
        @MaDonHang2,
        N'Sản phẩm bị hỏng trong quá trình vận chuyển. Shop từ chối trách nhiệm nhưng tôi có video mở hàng.',
        N'https://example.com/damaged1.jpg,https://example.com/damaged2.jpg',
        N'https://example.com/damaged_unboxing.mp4',
        N'KHIEU_NAI_ADMIN'
    );

    UPDATE DonHang
    SET VideoDongHang = N'https://example.com/careful_packing.mp4'
    WHERE MaDonHang = @MaDonHang2;

    PRINT 'Created dispute 2 (KHIEU_NAI_ADMIN) for order: ' + CAST(@MaDonHang2 AS NVARCHAR);
END

-- Tranh chấp 3: Cho đối soát (không có tranh chấp)
IF @MaDonHang3 IS NOT NULL
BEGIN
    PRINT 'Order 3 ready for settlement (no dispute): ' + CAST(@MaDonHang3 AS NVARCHAR);
END
GO

-- ==========================================
-- 3. Tạo lịch sử tranh chấp mẫu
-- ==========================================

DECLARE @MaDoiTra INT;
SELECT TOP 1 @MaDoiTra = MaDoiTra FROM YeuCauDoiTra ORDER BY MaDoiTra DESC;

IF @MaDoiTra IS NOT NULL
BEGIN
    -- Lịch sử: Người mua tạo yêu cầu
    INSERT INTO LichSuTrancChap (MaDoiTra, HanhDong, NguoiThucHien, GhiChu, NgayThucHien)
    SELECT 
        @MaDoiTra,
        N'Người mua tạo yêu cầu đổi trả',
        dh.MaNguoiDung,
        N'Yêu cầu đổi trả do sản phẩm không đúng mô tả',
        DATEADD(DAY, -5, GETDATE())
    FROM YeuCauDoiTra dt
    INNER JOIN DonHang dh ON dt.MaDonHang = dh.MaDonHang
    WHERE dt.MaDoiTra = @MaDoiTra;

    PRINT 'Created dispute history for dispute: ' + CAST(@MaDoiTra AS NVARCHAR);
END
GO
-- 4. Tạo video bằng chứng mẫu
-- ==========================================

INSERT INTO BangChungVideo (MaDonHang, LoaiVideo, DuongDanVideo, NguoiTai, NgayTai)
SELECT TOP 2
    dh.MaDonHang,
    N'DONG_HANG',
    N'https://example.com/packing_' + CAST(dh.MaDonHang AS NVARCHAR) + '.mp4',
    nd.MaNguoiDung,
    DATEADD(DAY, -6, GETDATE())
FROM DonHang dh
INNER JOIN CuaHang ch ON dh.MaCuaHang = ch.MaCuaHang
INNER JOIN NguoiDung nd ON ch.MaNguoiDung = nd.MaNguoiDung
WHERE dh.TrangThaiDonHang = N'DA_GIAO'
AND EXISTS (SELECT 1 FROM YeuCauDoiTra WHERE MaDonHang = dh.MaDonHang);

INSERT INTO BangChungVideo (MaDonHang, LoaiVideo, DuongDanVideo, NguoiTai, NgayTai)
SELECT TOP 2
    dh.MaDonHang,
    N'MO_HANG',
    N'https://example.com/unboxing_' + CAST(dh.MaDonHang AS NVARCHAR) + '.mp4',
    dh.MaNguoiDung,
    DATEADD(DAY, -5, GETDATE())
FROM DonHang dh
WHERE dh.TrangThaiDonHang = N'DA_GIAO'
AND EXISTS (SELECT 1 FROM YeuCauDoiTra WHERE MaDonHang = dh.MaDonHang);

PRINT 'Created video evidence records';
GO

-- ==========================================
-- 5. Tạo đơn hàng đủ điều kiện đối soát
-- ==========================================

-- Cập nhật thêm đơn hàng để có đủ data test đối soát
UPDATE TOP (10) DonHang
SET TrangThaiDonHang = N'DA_GIAO',
    TrangThaiThanhToan = N'DA_THANH_TOAN',
    NgayCapNhat = DATEADD(DAY, -15, GETDATE()),
    NgayHetHanDoiTra = DATEADD(DAY, -8, GETDATE()),
    DaDoiSoat = 0
WHERE TrangThaiDonHang IN (N'CHO_XAC_NHAN', N'DA_XAC_NHAN')
AND NOT EXISTS (
    SELECT 1 FROM YeuCauDoiTra 
    WHERE MaDonHang = DonHang.MaDonHang 
    AND TrangThai NOT IN (N'DA_GIAI_QUYET')
);
GO

-- ==========================================
-- 6. Kiểm tra kết quả
-- ==========================================

PRINT '========================================';
PRINT 'SEED DATA SUMMARY';
PRINT '========================================';

-- Đếm tranh chấp
DECLARE @TotalDisputes INT;
SELECT @TotalDisputes = COUNT(*) FROM YeuCauDoiTra;
PRINT 'Total disputes: ' + CAST(@TotalDisputes AS NVARCHAR);

-- Đếm đơn hàng đủ điều kiện đối soát
DECLARE @EligibleOrders INT;
SELECT @EligibleOrders = COUNT(*)
FROM DonHang
WHERE TrangThaiDonHang = N'DA_GIAO'
    AND TrangThaiThanhToan = N'DA_THANH_TOAN'
    AND DaDoiSoat = 0
    AND NgayHetHanDoiTra < GETDATE()
    AND NOT EXISTS (
        SELECT 1 FROM YeuCauDoiTra 
        WHERE MaDonHang = DonHang.MaDonHang 
        AND TrangThai NOT IN (N'DA_GIAI_QUYET')
    );
PRINT 'Eligible orders for settlement: ' + CAST(@EligibleOrders AS NVARCHAR);

-- Tổng tiền có thể đối soát
DECLARE @TotalAmount DECIMAL(15,2);
SELECT @TotalAmount = SUM(TienThanhToan)
FROM DonHang
WHERE TrangThaiDonHang = N'DA_GIAO'
    AND TrangThaiThanhToan = N'DA_THANH_TOAN'
    AND DaDoiSoat = 0
    AND NgayHetHanDoiTra < GETDATE()
    AND NOT EXISTS (
        SELECT 1 FROM YeuCauDoiTra 
        WHERE MaDonHang = DonHang.MaDonHang 
        AND TrangThai NOT IN (N'DA_GIAI_QUYET')
    );
PRINT 'Total amount for settlement: ' + CAST(ISNULL(@TotalAmount, 0) AS NVARCHAR);

-- Phí sàn
DECLARE @PhiSan DECIMAL(5,2);
SELECT @PhiSan = CAST(GiaTri AS DECIMAL(5,2))
FROM CauHinhHeThong
WHERE TenCauHinh = N'PHI_SAN_PHAN_TRAM';
PRINT 'Platform fee: ' + CAST(@PhiSan AS NVARCHAR) + '%';

PRINT '========================================';
PRINT 'SEED COMPLETED SUCCESSFULLY!';
PRINT '========================================';
GO

-- ==========================================
-- 7. Hiển thị dữ liệu mẫu
-- ==========================================

PRINT '';
PRINT 'Sample Disputes:';
SELECT 
    dt.MaDoiTra,
    dt.MaDonHang,
    dt.TrangThai,
    dh.TienThanhToan,
    nguoiMua.HoTen as NguoiMua,
    ch.TenCuaHang
FROM YeuCauDoiTra dt
INNER JOIN DonHang dh ON dt.MaDonHang = dh.MaDonHang
INNER JOIN NguoiDung nguoiMua ON dh.MaNguoiDung = nguoiMua.MaNguoiDung
INNER JOIN CuaHang ch ON dh.MaCuaHang = ch.MaCuaHang;

PRINT '';
PRINT 'Sample Eligible Orders for Settlement:';
SELECT TOP 5
    dh.MaDonHang,
    ch.TenCuaHang,
    dh.TienThanhToan,
    dh.NgayCapNhat as NgayGiao,
    dh.NgayHetHanDoiTra
FROM DonHang dh
INNER JOIN CuaHang ch ON dh.MaCuaHang = ch.MaCuaHang
WHERE dh.TrangThaiDonHang = N'DA_GIAO'
    AND dh.TrangThaiThanhToan = N'DA_THANH_TOAN'
    AND dh.DaDoiSoat = 0
    AND dh.NgayHetHanDoiTra < GETDATE()
    AND NOT EXISTS (
        SELECT 1 FROM YeuCauDoiTra 
        WHERE MaDonHang = dh.MaDonHang 
        AND TrangThai NOT IN (N'DA_GIAI_QUYET')
    )
ORDER BY dh.NgayCapNhat DESC;
GO
