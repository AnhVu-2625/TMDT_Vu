-- Kiểm tra dữ liệu đơn hàng cho đối soát
USE ThuongMaiDienTu;

-- 1. Xem đơn hàng đã giao
SELECT TOP 10
    dh.MaDonHang,
    dh.MaCuaHang,
    ch.TenCuaHang,
    dh.TienThanhToan,
    dh.TrangThaiDonHang,
    dh.TrangThaiThanhToan,
    dh.NgayTao,
    dh.NgayCapNhat as NgayGiaoHang,
    dh.NgayHetHanDoiTra,
    dh.DaDoiSoat,
    CASE 
        WHEN dh.NgayHetHanDoiTra IS NULL THEN 'NULL - Cần update'
        WHEN dh.NgayHetHanDoiTra < GETDATE() THEN 'Đã hết hạn - OK'
        ELSE 'Chưa hết hạn'
    END as TrangThaiHetHan
FROM DonHang dh
INNER JOIN CuaHang ch ON dh.MaCuaHang = ch.MaCuaHang
WHERE dh.TrangThaiDonHang = N'DA_GIAO'
    AND dh.TrangThaiThanhToan = N'DA_THANH_TOAN'
ORDER BY dh.MaDonHang DESC;

-- 2. Đếm số đơn hàng đủ điều kiện đối soát
SELECT 
    COUNT(*) as TongDonHang,
    SUM(CASE WHEN NgayHetHanDoiTra IS NULL THEN 1 ELSE 0 END) as SoLuongNgayNull,
    SUM(CASE WHEN NgayHetHanDoiTra < GETDATE() THEN 1 ELSE 0 END) as SoLuongDuDieuKien
FROM DonHang
WHERE TrangThaiDonHang = N'DA_GIAO'
    AND TrangThaiThanhToan = N'DA_THANH_TOAN'
    AND DaDoiSoat = 0;

-- 3. Update NgayHetHanDoiTra cho các đơn hàng chưa có (nếu cần)
-- Uncomment để chạy:
/*
UPDATE DonHang
SET NgayHetHanDoiTra = DATEADD(DAY, 7, NgayCapNhat)
WHERE TrangThaiDonHang = N'DA_GIAO'
    AND NgayHetHanDoiTra IS NULL;

SELECT 'Updated NgayHetHanDoiTra for orders' as Result;
*/

-- 4. Xem đơn hàng đủ điều kiện đối soát (giống API)
SELECT 
    dh.MaDonHang,
    dh.MaCuaHang,
    ch.TenCuaHang,
    dh.TienThanhToan,
    dh.NgayCapNhat as NgayGiaoHang,
    dh.NgayHetHanDoiTra,
    dh.DaDoiSoat
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
