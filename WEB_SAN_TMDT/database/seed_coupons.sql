-- ==========================================
-- SEED COUPONS / MÃ KHUYẾN MÃI
-- ==========================================
USE ThuongMaiDienTu;
GO

-- Khuyến mãi toàn sàn (admin tạo ra)
IF NOT EXISTS (SELECT 1 FROM MaKhuyenMai WHERE MaCode = 'MARTHUB10')
    INSERT INTO MaKhuyenMai (MaCode, LoaiGiamGia, GiaTriGiam, DonHangToiThieu, GiamToiDa, TuNgay, DenNgay, GioiHanSuDung, DaSuDung)
    VALUES ('MARTHUB10', 'PHAN_TRAM', 10, 100000, 200000, '2025-01-01', '2027-12-31', 1000, 0);

IF NOT EXISTS (SELECT 1 FROM MaKhuyenMai WHERE MaCode = 'SALE50K')
    INSERT INTO MaKhuyenMai (MaCode, LoaiGiamGia, GiaTriGiam, DonHangToiThieu, GiamToiDa, TuNgay, DenNgay, GioiHanSuDung, DaSuDung)
    VALUES ('SALE50K', 'TIEN_MAT', 50000, 200000, NULL, '2025-01-01', '2027-12-31', 500, 0);

IF NOT EXISTS (SELECT 1 FROM MaKhuyenMai WHERE MaCode = 'NEWUSER')
    INSERT INTO MaKhuyenMai (MaCode, LoaiGiamGia, GiaTriGiam, DonHangToiThieu, GiamToiDa, TuNgay, DenNgay, GioiHanSuDung, DaSuDung)
    VALUES ('NEWUSER', 'PHAN_TRAM', 15, 50000, 150000, '2025-01-01', '2027-12-31', 200, 0);

SELECT * FROM MaKhuyenMai;
GO
