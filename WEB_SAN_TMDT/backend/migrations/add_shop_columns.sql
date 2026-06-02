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
-- Xóa constraint cũ và tạo mới với NHAP
DECLARE @constraintName NVARCHAR(200);
SELECT @constraintName = name FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID('CuaHang') AND definition LIKE '%CHO_DUYET%';

IF @constraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE CuaHang DROP CONSTRAINT [' + @constraintName + ']');
    ALTER TABLE CuaHang ADD CONSTRAINT CK_CuaHang_TrangThai 
        CHECK (TrangThai IN (N'CHO_DUYET', N'HOAT_DONG', N'BI_KHOA', N'NHAP'));
    PRINT N'Đã cập nhật constraint TrangThai để hỗ trợ NHAP (Draft)';
END
GO

PRINT N'Cập nhật hoàn tất. Các cột DiaChiKho, SDTCuaHang, AnhGiayTo đã sẵn sàng.';
GO
