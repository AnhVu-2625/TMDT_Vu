-- ==========================================
-- MIGRATION: HoaDon + ThongBao mở rộng + VIP Voucher
-- ==========================================

-- Bảng hóa đơn (cho cả đơn hàng và VIP)
CREATE TABLE HoaDon (
    MaHoaDon INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    LoaiHoaDon NVARCHAR(20) CHECK (LoaiHoaDon IN (N'DON_HANG', N'VIP')) NOT NULL,
    MaThamChieu INT NOT NULL, -- MaDonHang or MaVIP
    TongTien DECIMAL(15,2) NOT NULL,
    TienGiamGia DECIMAL(15,2) DEFAULT 0,
    PhiVanChuyen DECIMAL(15,2) DEFAULT 0,
    TienThanhToan DECIMAL(15,2) NOT NULL,
    HinhThucThanhToan NVARCHAR(50),
    TrangThaiThanhToan NVARCHAR(20) CHECK (TrangThaiThanhToan IN (N'CHUA_THANH_TOAN', N'DA_THANH_TOAN', N'HOAN_TIEN')) DEFAULT N'DA_THANH_TOAN',
    GhiChu NVARCHAR(MAX),
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- Index cho hóa đơn
CREATE INDEX IX_HoaDon_MaNguoiDung ON HoaDon(MaNguoiDung);
CREATE INDEX IX_HoaDon_MaThamChieu_Loai ON HoaDon(MaThamChieu, LoaiHoaDon);
GO

-- Mở rộng GiaDichVuVIP: thêm voucher benefits
ALTER TABLE GiaDichVuVIP ADD
    SoTienGiamGia DECIMAL(5,2) DEFAULT 0, -- % giảm giá (đã có trong code logic)
    SoLuongVoucher INT DEFAULT 0,          -- số voucher tặng kèm
    GiaTriVoucher DECIMAL(5,2) DEFAULT 0,  -- % giảm của mỗi voucher
    HanVoucher INT DEFAULT 30;             -- số ngày hiệu lực của voucher
GO

-- Bảng voucher được tạo từ VIP
CREATE TABLE VoucherVIP (
    MaVoucher INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaVIP INT NOT NULL,
    MaKhuyenMai INT NULL,
    MaCode NVARCHAR(50) NOT NULL,
    GiaTriGiam DECIMAL(5,2) NOT NULL,
    LoaiGiam NVARCHAR(20) CHECK (LoaiGiam IN (N'PHAN_TRAM', N'TIEN_MAT')) DEFAULT N'PHAN_TRAM',
    GiamToiDa DECIMAL(15,2),
    DonHangToiThieu DECIMAL(15,2) DEFAULT 0,
    NgayHetHan DATE NOT NULL,
    DaSuDung BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (MaVIP) REFERENCES DichVuVIPNguoiDung(MaVIP)
);
GO

CREATE INDEX IX_VoucherVIP_MaNguoiDung ON VoucherVIP(MaNguoiDung);
GO

PRINT 'Migration hoa_don + voucher_vip completed!';
