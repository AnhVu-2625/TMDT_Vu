-- ==========================================
-- SCHEMA MartHub E-Commerce Platform
-- Phiên bản: 2.0 (chuẩn hóa theo yêu cầu)
-- ==========================================

USE master;
GO

-- Xóa DB cũ nếu có
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'ThuongMaiDienTu')
BEGIN
    ALTER DATABASE ThuongMaiDienTu SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ThuongMaiDienTu;
END
GO

CREATE DATABASE ThuongMaiDienTu;
GO

USE ThuongMaiDienTu;
GO

-- ==========================================
-- NHÓM QUẢN LÝ NGƯỜI DÙNG & TÀI KHOẢN
-- ==========================================

CREATE TABLE HangThanhVien (
    MaHang INT IDENTITY(1,1) PRIMARY KEY,
    TenHang NVARCHAR(50) NOT NULL, 
    DiemToiThieu INT NOT NULL DEFAULT 0,
    PhanTramGiamGia DECIMAL(5,2) DEFAULT 0
);
GO

CREATE TABLE NguoiDung (
    MaNguoiDung INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE,
    SoDienThoai NVARCHAR(20) UNIQUE,
    MatKhau NVARCHAR(255) NOT NULL,
    AnhDaiDien NVARCHAR(255),
    NgaySinh DATE,
    GioiTinh NVARCHAR(10) CHECK (GioiTinh IN (N'NAM', N'NU', N'KHAC')),
    VaiTro NVARCHAR(20) CHECK (VaiTro IN (N'NGUOI_DUNG', N'QUAN_TRI_VIEN')) DEFAULT N'NGUOI_DUNG',
    TrangThai NVARCHAR(20) CHECK (TrangThai IN (N'CHUA_KICH_HOAT', N'HOAT_DONG', N'BI_KHOA')) DEFAULT N'CHUA_KICH_HOAT',
    DiemTichLuy INT DEFAULT 0,
    MaHang INT,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaHang) REFERENCES HangThanhVien(MaHang)
);
GO

CREATE TABLE XacThucNguoiDung (
    MaXacThuc INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaOTP NVARCHAR(6) NOT NULL,
    ThoiGianHetHan DATETIME NOT NULL,
    DaSuDung BIT DEFAULT 0,
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);
GO

CREATE TABLE DiaChiGiaoHang (
    MaDiaChi INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    TenNguoiNhan NVARCHAR(100) NOT NULL,
    SDTNguoiNhan NVARCHAR(20) NOT NULL,
    DiaChiCuThe NVARCHAR(255) NOT NULL,
    PhuongXa NVARCHAR(100) NOT NULL,
    QuanHuyen NVARCHAR(100) NOT NULL,
    TinhThanh NVARCHAR(100) NOT NULL,
    LaMacDinh BIT DEFAULT 0,
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- ==========================================
-- NHÓM QUẢN LÝ CỬA HÀNG & TÀI CHÍNH
-- ==========================================

CREATE TABLE CuaHang (
    MaCuaHang INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL UNIQUE, 
    TenCuaHang NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(MAX),
    Logo NVARCHAR(255),
    TrangThai NVARCHAR(20) CHECK (TrangThai IN (N'CHO_DUYET', N'HOAT_DONG', N'BI_KHOA')) DEFAULT N'CHO_DUYET',
    SoDuVi DECIMAL(15,2) DEFAULT 0.00,
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);
GO

CREATE TABLE YeuCauRutTien (
    MaYeuCau INT IDENTITY(1,1) PRIMARY KEY,
    MaCuaHang INT NOT NULL,
    SoTien DECIMAL(15,2) NOT NULL,
    TenTaiKhoanNganHang NVARCHAR(100) NOT NULL,
    SoTaiKhoan NVARCHAR(50) NOT NULL,
    TenNganHang NVARCHAR(100) NOT NULL,
    TrangThai NVARCHAR(20) CHECK (TrangThai IN (N'CHO_DUYET', N'DA_DUYET', N'TU_CHOI')) DEFAULT N'CHO_DUYET',
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaCuaHang) REFERENCES CuaHang(MaCuaHang)
);
GO

-- ==========================================
-- NHÓM SẢN PHẨM & DANH MỤC
-- ==========================================

CREATE TABLE DanhMucSanPham (
    MaDanhMuc INT IDENTITY(1,1) PRIMARY KEY,
    MaDanhMucCha INT NULL,
    TenDanhMuc NVARCHAR(100) NOT NULL,
    DuongDan NVARCHAR(100) UNIQUE NOT NULL,
    FOREIGN KEY (MaDanhMucCha) REFERENCES DanhMucSanPham(MaDanhMuc)
);
GO

CREATE TABLE SanPham (
    MaSanPham INT IDENTITY(1,1) PRIMARY KEY,
    MaCuaHang INT NOT NULL,
    MaDanhMuc INT NULL,
    TenSanPham NVARCHAR(255) NOT NULL,
    DuongDan NVARCHAR(255) UNIQUE NOT NULL,
    MoTa NVARCHAR(MAX),
    GiaGoc DECIMAL(15,2) NOT NULL,
    DanhGiaTrungBinh DECIMAL(3,2) DEFAULT 0.00,
    TrangThai NVARCHAR(20) CHECK (TrangThai IN (N'HOAT_DONG', N'AN', N'BI_KHOA')) DEFAULT N'HOAT_DONG',
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaCuaHang) REFERENCES CuaHang(MaCuaHang),
    FOREIGN KEY (MaDanhMuc) REFERENCES DanhMucSanPham(MaDanhMuc)
);
GO

CREATE TABLE HinhAnhSanPham (
    MaHinhAnh INT IDENTITY(1,1) PRIMARY KEY,
    MaSanPham INT NOT NULL,
    DuongDanAnh NVARCHAR(255) NOT NULL,
    LaAnhChinh BIT DEFAULT 0,
    FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
);
GO

CREATE TABLE PhienBanSanPham (
    MaPhienBan INT IDENTITY(1,1) PRIMARY KEY,
    MaSanPham INT NOT NULL,
    MauSac NVARCHAR(50),
    KichThuoc NVARCHAR(50),
    GiaBan DECIMAL(15,2) NOT NULL,
    SoLuongTonKho INT NOT NULL CHECK (SoLuongTonKho >= 0),
    FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
);
GO

-- ==========================================
-- NHÓM MUA SẮM, TÌM KIẾM & KHUYẾN MÃI
-- ==========================================

CREATE TABLE ChiTietGioHang (
    MaChiTietGioHang INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaPhienBan INT NOT NULL,
    SoLuong INT NOT NULL CHECK (SoLuong > 0),
    NgayThem DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (MaPhienBan) REFERENCES PhienBanSanPham(MaPhienBan),
    UNIQUE(MaNguoiDung, MaPhienBan)
);
GO

CREATE TABLE DanhSachYeuThich (
    MaYeuThich INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaSanPham INT NOT NULL,
    NgayThem DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham),
    UNIQUE(MaNguoiDung, MaSanPham)
);
GO

CREATE TABLE LichSuTimKiem (
    MaTimKiem INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    TuKhoa NVARCHAR(255) NOT NULL,
    NgayTimKiem DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);
GO

CREATE TABLE MaKhuyenMai (
    MaKhuyenMai INT IDENTITY(1,1) PRIMARY KEY,
    MaCuaHang INT NULL, 
    MaCode NVARCHAR(20) UNIQUE NOT NULL,
    LoaiGiamGia NVARCHAR(20) CHECK (LoaiGiamGia IN (N'PHAN_TRAM', N'TIEN_MAT')) NOT NULL,
    GiaTriGiam DECIMAL(15,2) NOT NULL,
    DonHangToiThieu DECIMAL(15,2) DEFAULT 0,
    GiamToiDa DECIMAL(15,2),
    TuNgay DATETIME NOT NULL,
    DenNgay DATETIME NOT NULL,
    GioiHanSuDung INT NOT NULL,
    DaSuDung INT DEFAULT 0,
    FOREIGN KEY (MaCuaHang) REFERENCES CuaHang(MaCuaHang)
);
GO

-- ==========================================
-- NHÓM ĐƠN HÀNG & ĐÁNH GIÁ
-- ==========================================

CREATE TABLE DonHang (
    MaDonHang INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaCuaHang INT NOT NULL,
    MaDiaChi INT NOT NULL,
    MaKhuyenMai INT NULL,
    TongTien DECIMAL(15,2) NOT NULL,
    TienGiamGia DECIMAL(15,2) DEFAULT 0,
    TienThanhToan DECIMAL(15,2) NOT NULL,
    PhuongThucThanhToan NVARCHAR(20) CHECK (PhuongThucThanhToan IN (N'TIEN_MAT', N'CHUYEN_KHOAN', N'VI_DIEN_TU', N'THE_TIN_DUNG')) NOT NULL,
    TrangThaiThanhToan NVARCHAR(20) CHECK (TrangThaiThanhToan IN (N'CHUA_THANH_TOAN', N'DA_THANH_TOAN', N'THAT_BAI', N'HOAN_TIEN')) DEFAULT N'CHUA_THANH_TOAN',
    TrangThaiDonHang NVARCHAR(20) CHECK (TrangThaiDonHang IN (N'CHO_XAC_NHAN', N'DA_XAC_NHAN', N'DANG_GIAO', N'DA_GIAO', N'DA_HUY', N'DA_TRA_HANG')) DEFAULT N'CHO_XAC_NHAN',
    PhiVanChuyen DECIMAL(15,2) DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (MaCuaHang) REFERENCES CuaHang(MaCuaHang),
    FOREIGN KEY (MaDiaChi) REFERENCES DiaChiGiaoHang(MaDiaChi),
    FOREIGN KEY (MaKhuyenMai) REFERENCES MaKhuyenMai(MaKhuyenMai)
);
GO

CREATE TABLE ChiTietDonHang (
    MaChiTietDonHang INT IDENTITY(1,1) PRIMARY KEY,
    MaDonHang INT NOT NULL,
    MaPhienBan INT NOT NULL,
    SoLuong INT NOT NULL,
    GiaLucMua DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang),
    FOREIGN KEY (MaPhienBan) REFERENCES PhienBanSanPham(MaPhienBan)
);
GO

CREATE TABLE DanhGiaSanPham (
    MaDanhGia INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaSanPham INT NOT NULL,
    MaDonHang INT NOT NULL,
    DiemDanhGia INT NOT NULL CHECK (DiemDanhGia BETWEEN 1 AND 5),
    BinhLuan NVARCHAR(MAX),
    PhanHoiCuaHang NVARCHAR(MAX) NULL,
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham),
    FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
);
GO

CREATE TABLE YeuCauDoiTra (
    MaDoiTra INT IDENTITY(1,1) PRIMARY KEY,
    MaDonHang INT NOT NULL UNIQUE,
    LyDo NVARCHAR(MAX) NOT NULL,
    AnhBangChung NVARCHAR(MAX), 
    TrangThai NVARCHAR(20) CHECK (TrangThai IN (N'CHO_XU_LY', N'SHOP_DONG_Y', N'SHOP_TU_CHOI', N'KHIEU_NAI_ADMIN', N'DA_GIAI_QUYET')) DEFAULT N'CHO_XU_LY',
    QuyetDinhCuaAdmin NVARCHAR(MAX) NULL,
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
);
GO

-- ==========================================
-- NHÓM TƯƠNG TÁC (CHAT & THÔNG BÁO)
-- ==========================================

CREATE TABLE PhongChat (
    MaPhongChat INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaCuaHang INT NOT NULL,
    ThoiGianNhanTinCuoi DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (MaCuaHang) REFERENCES CuaHang(MaCuaHang),
    UNIQUE(MaNguoiDung, MaCuaHang)
);
GO

CREATE TABLE TinNhanChat (
    MaTinNhan INT IDENTITY(1,1) PRIMARY KEY,
    MaPhongChat INT NOT NULL,
    NguoiGui NVARCHAR(20) CHECK (NguoiGui IN (N'NGUOI_MUA', N'NGUOI_BAN')) NOT NULL,
    NoiDung NVARCHAR(MAX) NOT NULL,
    DaDoc BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaPhongChat) REFERENCES PhongChat(MaPhongChat)
);
GO

CREATE TABLE ThongBao (
    MaThongBao INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    TieuDe NVARCHAR(255) NOT NULL,
    NoiDung NVARCHAR(MAX) NOT NULL,
    LoaiThongBao NVARCHAR(20) CHECK (LoaiThongBao IN (N'DON_HANG', N'KHUYEN_MAI', N'HE_THONG', N'TIN_NHAN')) NOT NULL,
    MaThamChieu INT NULL,
    DaDoc BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- ==========================================
-- INDEXES (tối ưu hiệu năng)
-- ==========================================
CREATE INDEX IX_NguoiDung_Email ON NguoiDung(Email);
CREATE INDEX IX_NguoiDung_SoDienThoai ON NguoiDung(SoDienThoai);
CREATE INDEX IX_SanPham_MaCuaHang ON SanPham(MaCuaHang);
CREATE INDEX IX_SanPham_MaDanhMuc ON SanPham(MaDanhMuc);
CREATE INDEX IX_SanPham_TrangThai ON SanPham(TrangThai);
CREATE INDEX IX_DonHang_MaNguoiDung ON DonHang(MaNguoiDung);
CREATE INDEX IX_DonHang_MaCuaHang ON DonHang(MaCuaHang);
CREATE INDEX IX_DonHang_TrangThaiDonHang ON DonHang(TrangThaiDonHang);
CREATE INDEX IX_ChiTietGioHang_MaNguoiDung ON ChiTietGioHang(MaNguoiDung);
CREATE INDEX IX_DanhGiaSanPham_MaSanPham ON DanhGiaSanPham(MaSanPham);
CREATE INDEX IX_ThongBao_MaNguoiDung ON ThongBao(MaNguoiDung);
GO

PRINT 'Schema ThuongMaiDienTu created successfully!'
GO
