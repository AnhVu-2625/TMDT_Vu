-- ==========================================
-- FIX MISSING COLUMNS & TABLES
-- ==========================================
USE ThuongMaiDienTu;
GO

-- 1. ADD MISSING COLUMNS TO YeuCauDoiTra
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'YeuCauDoiTra' AND COLUMN_NAME = 'QuyetDinhAdmin'
)
BEGIN
    ALTER TABLE YeuCauDoiTra ADD QuyetDinhAdmin NVARCHAR(MAX) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'YeuCauDoiTra' AND COLUMN_NAME = 'NgayQuyetDinh'
)
BEGIN
    ALTER TABLE YeuCauDoiTra ADD NgayQuyetDinh DATETIME NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'YeuCauDoiTra' AND COLUMN_NAME = 'AdminXuLy'
)
BEGIN
    ALTER TABLE YeuCauDoiTra ADD AdminXuLy INT NULL REFERENCES NguoiDung(MaNguoiDung);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'YeuCauDoiTra' AND COLUMN_NAME = 'VideoMoHang'
)
BEGIN
    ALTER TABLE YeuCauDoiTra ADD VideoMoHang NVARCHAR(MAX) NULL;
END
GO

-- 2. CREATE CauHinhHeThong TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CauHinhHeThong')
BEGIN
    CREATE TABLE CauHinhHeThong (
        MaCauHinh INT IDENTITY(1,1) PRIMARY KEY,
        TenCauHinh NVARCHAR(100) NOT NULL UNIQUE,
        GiaTri NVARCHAR(MAX) NOT NULL,
        MoTa NVARCHAR(500),
        NgayTao DATETIME DEFAULT GETDATE(),
        NgayCapNhat DATETIME DEFAULT GETDATE()
    );
    
    -- Insert default values
    INSERT INTO CauHinhHeThong (TenCauHinh, GiaTri, MoTa) VALUES
        (N'SO_NGAY_DOI_TRA', N'7', N'Số ngày cho phép đổi trả sản phẩm'),
        (N'PHI_SAN_PHAN_TRAM', N'5', N'Phần trăm phí sàn'),
        (N'TIEN_THUA_TOI_THIEU_GIAO_DICH', N'10000', N'Tiền thừa tối thiểu để ghi nhận giao dịch'),
        (N'THOI_GI_DOI_SOAT', N'30', N'Số ngày cho phép đối soát từ khi giao hàng');
END
GO

-- 3. ADD MISSING COLUMNS TO CuaHang (if not exists)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CuaHang' AND COLUMN_NAME = 'AnhGiayTo'
)
BEGIN
    ALTER TABLE CuaHang ADD AnhGiayTo NVARCHAR(MAX) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CuaHang' AND COLUMN_NAME = 'SoDienThoaiShop'
)
BEGIN
    ALTER TABLE CuaHang ADD SoDienThoaiShop NVARCHAR(20) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CuaHang' AND COLUMN_NAME = 'DiaChiShop'
)
BEGIN
    ALTER TABLE CuaHang ADD DiaChiShop NVARCHAR(255) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CuaHang' AND COLUMN_NAME = 'GiayToPhapLy'
)
BEGIN
    ALTER TABLE CuaHang ADD GiayToPhapLy NVARCHAR(MAX) NULL;
END
GO

-- 4. CREATE GiayToCuaHang TABLE (for shop documents)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GiayToCuaHang')
BEGIN
    CREATE TABLE GiayToCuaHang (
        MaGiayTo INT IDENTITY(1,1) PRIMARY KEY,
        MaCuaHang INT NOT NULL,
        LoaiGiayTo NVARCHAR(100) NOT NULL,
        UrlGiayTo NVARCHAR(255) NOT NULL,
        TrangThai NVARCHAR(20) CHECK (TrangThai IN (N'CHO_DUYET', N'DA_DUYET', N'TU_CHOI')) DEFAULT N'CHO_DUYET',
        GhiChu NVARCHAR(255),
        NgayTao DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (MaCuaHang) REFERENCES CuaHang(MaCuaHang)
    );
END
GO

-- 5. ADD MISSING COLUMNS TO DonHang (if not exists)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'DonHang' AND COLUMN_NAME = 'NgayHetHanDoiTra'
)
BEGIN
    ALTER TABLE DonHang ADD NgayHetHanDoiTra DATETIME NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'DonHang' AND COLUMN_NAME = 'DaDoiSoat'
)
BEGIN
    ALTER TABLE DonHang ADD DaDoiSoat BIT DEFAULT 0;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'DonHang' AND COLUMN_NAME = 'TrangThaiThanhToan'
)
BEGIN
    ALTER TABLE DonHang ADD TrangThaiThanhToan NVARCHAR(20) DEFAULT N'DA_THANH_TOAN';
END
GO

-- 6. CREATE ThongBaoShopApproval TABLE (for shop approval notifications)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ThongBaoShopApproval')
BEGIN
    CREATE TABLE ThongBaoShopApproval (
        MaThongBao INT IDENTITY(1,1) PRIMARY KEY,
        MaNguoiDung INT NOT NULL,
        MaCuaHang INT NOT NULL,
        TrangThaiDuyet NVARCHAR(20) CHECK (TrangThaiDuyet IN (N'DUYET', N'TU_CHOI')) NOT NULL,
        GhiChuDuyet NVARCHAR(MAX),
        DaDoc BIT DEFAULT 0,
        NgayTao DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
        FOREIGN KEY (MaCuaHang) REFERENCES CuaHang(MaCuaHang)
    );
END
GO

-- 7. UPDATE EXISTING ORDERS WITH NgayHetHanDoiTra
UPDATE DonHang 
SET NgayHetHanDoiTra = DATEADD(DAY, 7, NgayCapNhat)
WHERE NgayHetHanDoiTra IS NULL
GO

PRINT '✅ All migrations completed successfully!';
