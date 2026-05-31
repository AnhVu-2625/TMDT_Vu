-- ═══════════════════════════════════════════════════════════════════════
-- Migration: Thêm các cột cho bảng CuaHang phục vụ đăng ký shop
-- Chạy script này trong SQL Server Management Studio
-- ═══════════════════════════════════════════════════════════════════════

-- Thêm cột Địa chỉ kho hàng
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CuaHang') AND name = 'DiaChiKho')
BEGIN
    ALTER TABLE CuaHang ADD DiaChiKho NVARCHAR(500) NULL;
    PRINT N'Đã thêm cột DiaChiKho';
END
GO

-- Thêm cột SĐT của cửa hàng
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CuaHang') AND name = 'SDTCuaHang')
BEGIN
    ALTER TABLE CuaHang ADD SDTCuaHang NVARCHAR(20) NULL;
    PRINT N'Đã thêm cột SDTCuaHang';
END
GO

-- Thêm cột Ảnh giấy tờ (CCCD/GPKD)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CuaHang') AND name = 'AnhGiayTo')
BEGIN
    ALTER TABLE CuaHang ADD AnhGiayTo NVARCHAR(500) NULL;
    PRINT N'Đã thêm cột AnhGiayTo';
END
GO

-- Đảm bảo cột TrangThai chấp nhận giá trị NHAP (Draft)
-- Các giá trị TrangThai: HOAT_DONG, CHO_DUYET, BI_KHOA, NHAP
PRINT N'Cập nhật hoàn tất. Các cột DiaChiKho, SDTCuaHang, AnhGiayTo đã sẵn sàng.';
GO
