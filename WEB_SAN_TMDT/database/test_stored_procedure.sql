-- ==========================================
-- TEST STORED PROCEDURE
-- ==========================================

USE ThuongMaiDienTu;
GO

-- Kiểm tra stored procedure tồn tại
SELECT name, create_date, modify_date
FROM sys.procedures 
WHERE name = 'sp_CapNhatViCuaHang';
GO

-- Test gọi stored procedure
DECLARE @TestResult INT;

BEGIN TRY
    -- Test với dữ liệu giả
    EXEC sp_CapNhatViCuaHang
        @MaCuaHang = 1,
        @SoTien = 100000,
        @LoaiGiaoDich = N'CONG_TIEN',
        @MoTa = N'Test stored procedure',
        @MaThamChieu = 1,
        @LoaiThamChieu = N'TEST';
    
    PRINT '✅ Stored procedure hoạt động tốt!';
    SET @TestResult = 1;
END TRY
BEGIN CATCH
    PRINT '❌ Lỗi khi gọi stored procedure:';
    PRINT ERROR_MESSAGE();
    SET @TestResult = 0;
END CATCH;

-- Xem kết quả
IF @TestResult = 1
BEGIN
    PRINT '';
    PRINT 'Kiểm tra lịch sử giao dịch vừa tạo:';
    SELECT TOP 1 * FROM LichSuGiaoDichVi 
    ORDER BY NgayTao DESC;
END;
GO
