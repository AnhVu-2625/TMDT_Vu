-- ==========================================
-- EXTENSION: DISPUTE RESOLUTION & SETTLEMENT
-- Mở rộng schema cho giải quyết tranh chấp và đối soát
-- ==========================================

USE ThuongMaiDienTu;
GO

-- ==========================================
-- 1. QUẢN LÝ VIDEO BẰNG CHỨNG
-- ==========================================
CREATE TABLE BangChungVideo (
    MaBangChung INT IDENTITY(1,1) PRIMARY KEY,
    MaDonHang INT NOT NULL,
    LoaiVideo NVARCHAR(20) CHECK (LoaiVideo IN (N'DONG_HANG', N'MO_HANG')) NOT NULL,
    DuongDanVideo NVARCHAR(500) NOT NULL,
    NguoiTai INT NOT NULL, -- MaNguoiDung
    NgayTai DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang),
    FOREIGN KEY (NguoiTai) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- ==========================================
-- 2. LỊCH SỬ TRANH CHẤP (Dispute History)
-- ==========================================
CREATE TABLE LichSuTrancChap (
    MaLichSu INT IDENTITY(1,1) PRIMARY KEY,
    MaDoiTra INT NOT NULL,
    HanhDong NVARCHAR(100) NOT NULL, -- VD: 'Người mua khiếu nại', 'Shop từ chối', 'Admin can thiệp'
    NguoiThucHien INT NULL, -- MaNguoiDung (NULL nếu là hệ thống)
    GhiChu NVARCHAR(MAX),
    NgayThucHien DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaDoiTra) REFERENCES YeuCauDoiTra(MaDoiTra),
    FOREIGN KEY (NguoiThucHien) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- ==========================================
-- 3. QUẢN LÝ ĐỐI SOÁT & CHIA TIỀN
-- ==========================================
CREATE TABLE CauHinhHeThong (
    MaCauHinh INT IDENTITY(1,1) PRIMARY KEY,
    TenCauHinh NVARCHAR(100) UNIQUE NOT NULL,
    GiaTri NVARCHAR(500) NOT NULL,
    MoTa NVARCHAR(MAX),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- Thêm cấu hình phí sàn mặc định
INSERT INTO CauHinhHeThong (TenCauHinh, GiaTri, MoTa)
VALUES 
    (N'PHI_SAN_PHAN_TRAM', N'5', N'Phần trăm phí sàn trừ vào doanh thu người bán (%)'),
    (N'SO_NGAY_DOI_TRA', N'7', N'Số ngày được phép đổi trả sau khi nhận hàng'),
    (N'TU_DONG_DOI_SOAT', N'true', N'Tự động đối soát vào cuối tháng (true/false)'),
    (N'NGAY_DOI_SOAT_HANG_THANG', N'1', N'Ngày trong tháng thực hiện đối soát tự động');
GO

CREATE TABLE PhienDoiSoat (
    MaPhienDoiSoat INT IDENTITY(1,1) PRIMARY KEY,
    TenPhien NVARCHAR(100) NOT NULL, -- VD: 'Đối soát tháng 5/2026'
    TuNgay DATETIME NOT NULL,
    DenNgay DATETIME NOT NULL,
    TongDonHang INT DEFAULT 0,
    TongDoanhThu DECIMAL(15,2) DEFAULT 0,
    TongPhiSan DECIMAL(15,2) DEFAULT 0,
    TongChiTraNguoiBan DECIMAL(15,2) DEFAULT 0,
    TrangThai NVARCHAR(20) CHECK (TrangThai IN (N'DANG_XU_LY', N'HOAN_THANH', N'LOI')) DEFAULT N'DANG_XU_LY',
    NguoiThucHien INT NULL, -- Admin thực hiện
    GhiChu NVARCHAR(MAX),
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayHoanThanh DATETIME NULL,
    FOREIGN KEY (NguoiThucHien) REFERENCES NguoiDung(MaNguoiDung)
);
GO

CREATE TABLE ChiTietDoiSoat (
    MaChiTiet INT IDENTITY(1,1) PRIMARY KEY,
    MaPhienDoiSoat INT NOT NULL,
    MaCuaHang INT NOT NULL,
    MaDonHang INT NOT NULL,
    DoanhThu DECIMAL(15,2) NOT NULL, -- Tiền thanh toán của đơn hàng
    PhiSan DECIMAL(15,2) NOT NULL, -- Phí sàn trừ đi
    TienThucNhan DECIMAL(15,2) NOT NULL, -- Tiền người bán nhận được
    TrangThai NVARCHAR(20) CHECK (TrangThai IN (N'CHO_XU_LY', N'DA_CHI_TRA', N'LOI')) DEFAULT N'CHO_XU_LY',
    NgayChiTra DATETIME NULL,
    FOREIGN KEY (MaPhienDoiSoat) REFERENCES PhienDoiSoat(MaPhienDoiSoat),
    FOREIGN KEY (MaCuaHang) REFERENCES CuaHang(MaCuaHang),
    FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
);
GO

CREATE TABLE LichSuGiaoDichVi (
    MaGiaoDich INT IDENTITY(1,1) PRIMARY KEY,
    MaCuaHang INT NOT NULL,
    LoaiGiaoDich NVARCHAR(50) CHECK (LoaiGiaoDich IN (N'CONG_TIEN', N'TRU_TIEN', N'RUT_TIEN', N'HOAN_TIEN')) NOT NULL,
    SoTien DECIMAL(15,2) NOT NULL,
    SoDuTruoc DECIMAL(15,2) NOT NULL,
    SoDuSau DECIMAL(15,2) NOT NULL,
    MoTa NVARCHAR(MAX),
    MaThamChieu INT NULL, -- MaDonHang hoặc MaPhienDoiSoat
    LoaiThamChieu NVARCHAR(50),
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaCuaHang) REFERENCES CuaHang(MaCuaHang)
);
GO

-- ==========================================
-- 4. CẬP NHẬT BẢNG YeuCauDoiTra
-- ==========================================
-- Thêm cột video bằng chứng
ALTER TABLE YeuCauDoiTra
ADD VideoMoHang NVARCHAR(500) NULL,
    QuyetDinhAdmin NVARCHAR(50) NULL CHECK (QuyetDinhAdmin IN (N'DONG_Y_HOAN_TIEN', N'TU_CHOI_HOAN_TIEN', NULL)),
    NgayQuyetDinh DATETIME NULL,
    AdminXuLy INT NULL,
    FOREIGN KEY (AdminXuLy) REFERENCES NguoiDung(MaNguoiDung);
GO

-- ==========================================
-- 5. CẬP NHẬT BẢNG DonHang
-- ==========================================
-- Thêm cột theo dõi đối soát
ALTER TABLE DonHang
ADD DaDoiSoat BIT DEFAULT 0,
    MaPhienDoiSoat INT NULL,
    NgayHetHanDoiTra DATETIME NULL,
    VideoDongHang NVARCHAR(500) NULL,
    FOREIGN KEY (MaPhienDoiSoat) REFERENCES PhienDoiSoat(MaPhienDoiSoat);
GO

-- ==========================================
-- INDEXES (tối ưu hiệu năng)
-- ==========================================
CREATE INDEX IX_BangChungVideo_MaDonHang ON BangChungVideo(MaDonHang);
CREATE INDEX IX_LichSuTrancChap_MaDoiTra ON LichSuTrancChap(MaDoiTra);
CREATE INDEX IX_ChiTietDoiSoat_MaPhienDoiSoat ON ChiTietDoiSoat(MaPhienDoiSoat);
CREATE INDEX IX_ChiTietDoiSoat_MaCuaHang ON ChiTietDoiSoat(MaCuaHang);
CREATE INDEX IX_LichSuGiaoDichVi_MaCuaHang ON LichSuGiaoDichVi(MaCuaHang);
CREATE INDEX IX_DonHang_DaDoiSoat ON DonHang(DaDoiSoat);
CREATE INDEX IX_DonHang_NgayHetHanDoiTra ON DonHang(NgayHetHanDoiTra);
GO

-- ==========================================
-- STORED PROCEDURES
-- ==========================================

-- Procedure: Tính toán phí sàn cho một đơn hàng
CREATE PROCEDURE sp_TinhPhiSan
    @MaDonHang INT,
    @PhiSan DECIMAL(15,2) OUTPUT
AS
BEGIN
    DECLARE @TienThanhToan DECIMAL(15,2);
    DECLARE @PhanTramPhiSan DECIMAL(5,2);
    
    -- Lấy tiền thanh toán
    SELECT @TienThanhToan = TienThanhToan
    FROM DonHang
    WHERE MaDonHang = @MaDonHang;
    
    -- Lấy phần trăm phí sàn từ cấu hình
    SELECT @PhanTramPhiSan = CAST(GiaTri AS DECIMAL(5,2))
    FROM CauHinhHeThong
    WHERE TenCauHinh = N'PHI_SAN_PHAN_TRAM';
    
    -- Tính phí sàn
    SET @PhiSan = @TienThanhToan * (@PhanTramPhiSan / 100);
END;
GO

-- Procedure: Cập nhật số dư ví cửa hàng
CREATE PROCEDURE sp_CapNhatViCuaHang
    @MaCuaHang INT,
    @SoTien DECIMAL(15,2),
    @LoaiGiaoDich NVARCHAR(50),
    @MoTa NVARCHAR(MAX),
    @MaThamChieu INT = NULL,
    @LoaiThamChieu NVARCHAR(50) = NULL
AS
BEGIN
    DECLARE @SoDuHienTai DECIMAL(15,2);
    DECLARE @SoDuMoi DECIMAL(15,2);
    
    -- Lấy số dư hiện tại
    SELECT @SoDuHienTai = SoDuVi
    FROM CuaHang
    WHERE MaCuaHang = @MaCuaHang;
    
    -- Tính số dư mới
    IF @LoaiGiaoDich IN (N'CONG_TIEN')
        SET @SoDuMoi = @SoDuHienTai + @SoTien;
    ELSE IF @LoaiGiaoDich IN (N'TRU_TIEN', N'RUT_TIEN', N'HOAN_TIEN')
        SET @SoDuMoi = @SoDuHienTai - @SoTien;
    ELSE
        SET @SoDuMoi = @SoDuHienTai;
    
    -- Cập nhật số dư
    UPDATE CuaHang
    SET SoDuVi = @SoDuMoi
    WHERE MaCuaHang = @MaCuaHang;
    
    -- Ghi lịch sử giao dịch
    INSERT INTO LichSuGiaoDichVi (MaCuaHang, LoaiGiaoDich, SoTien, SoDuTruoc, SoDuSau, MoTa, MaThamChieu, LoaiThamChieu)
    VALUES (@MaCuaHang, @LoaiGiaoDich, @SoTien, @SoDuHienTai, @SoDuMoi, @MoTa, @MaThamChieu, @LoaiThamChieu);
END;
GO

PRINT 'Dispute Resolution & Settlement Extension created successfully!'
GO
