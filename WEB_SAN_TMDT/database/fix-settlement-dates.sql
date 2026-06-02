-- Sửa dữ liệu ngày tháng cho đối soát
USE ThuongMaiDienTu;

-- 1. Update NgayHetHanDoiTra cho các đơn hàng chưa có
UPDATE DonHang
SET NgayHetHanDoiTra = DATEADD(DAY, 7, NgayCapNhat)
WHERE TrangThaiDonHang = N'DA_GIAO'
    AND NgayHetHanDoiTra IS NULL;

PRINT 'Updated NgayHetHanDoiTra for orders without expiry date';

-- 2. Đảm bảo có ít nhất 3 đơn hàng đủ điều kiện đối soát (để test)
-- Update một số đơn hàng để hết hạn đổi trả
UPDATE TOP (3) DonHang
SET NgayHetHanDoiTra = DATEADD(DAY, -1, GETDATE()),  -- Hết hạn 1 ngày trước
    NgayCapNhat = DATEADD(DAY, -8, GETDATE()),       -- Giao hàng 8 ngày trước
    DaDoiSoat = 0
WHERE TrangThaiDonHang = N'DA_GIAO'
    AND TrangThaiThanhToan = N'DA_THANH_TOAN'
    AND NOT EXISTS (
        SELECT 1 FROM YeuCauDoiTra 
        WHERE MaDonHang = DonHang.MaDonHang 
        AND TrangThai NOT IN (N'DA_GIAI_QUYET')
    );

PRINT 'Updated 3 orders to be eligible for settlement';

-- 3. Kiểm tra kết quả
SELECT 
    'Eligible Orders' as Category,
    COUNT(*) as Count
FROM DonHang dh
WHERE dh.TrangThaiDonHang = N'DA_GIAO'
    AND dh.TrangThaiThanhToan = N'DA_THANH_TOAN'
    AND dh.DaDoiSoat = 0
    AND dh.NgayHetHanDoiTra < GETDATE()
    AND NOT EXISTS (
        SELECT 1 FROM YeuCauDoiTra 
        WHERE MaDonHang = dh.MaDonHang 
        AND TrangThai NOT IN (N'DA_GIAI_QUYET')
    );

-- 4. Xem chi tiết các đơn hàng đủ điều kiện
SELECT TOP 5
    dh.MaDonHang,
    ch.TenCuaHang,
    dh.TienThanhToan,
    dh.NgayCapNhat as NgayGiaoHang,
    dh.NgayHetHanDoiTra,
    DATEDIFF(DAY, dh.NgayHetHanDoiTra, GETDATE()) as SoNgayDaHetHan
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

PRINT 'Done! Now you can test settlement feature.';
