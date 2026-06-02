-- ==========================================
-- SEED PERSONAL VOUCHERS (KhuyenMaiNguoiDung)
-- Gán voucher cho từng user để test
-- ==========================================
USE ThuongMaiDienTu;
GO

DECLARE @UserId INT;
DECLARE @PromoId INT;

-- ==========================================
-- User 2: user@marthub.vn (buyer chính)
-- Có 3 voucher: MARTHUB10, SALE50K, FREESHIP
-- ==========================================
SELECT @UserId = MaNguoiDung FROM NguoiDung WHERE Email = 'user@marthub.vn';

-- MARTHUB10 (10%)
SELECT @PromoId = MaKhuyenMai FROM MaKhuyenMai WHERE MaCode = 'MARTHUB10';
IF NOT EXISTS (SELECT 1 FROM KhuyenMaiNguoiDung WHERE MaNguoiDung = @UserId AND MaKhuyenMai = @PromoId)
    INSERT INTO KhuyenMaiNguoiDung (MaNguoiDung, MaKhuyenMai, TrangThai) VALUES (@UserId, @PromoId, N'CHUA_SU_DUNG');

-- SALE50K (50K)
SELECT @PromoId = MaKhuyenMai FROM MaKhuyenMai WHERE MaCode = 'SALE50K';
IF NOT EXISTS (SELECT 1 FROM KhuyenMaiNguoiDung WHERE MaNguoiDung = @UserId AND MaKhuyenMai = @PromoId)
    INSERT INTO KhuyenMaiNguoiDung (MaNguoiDung, MaKhuyenMai, TrangThai) VALUES (@UserId, @PromoId, N'CHUA_SU_DUNG');

-- FREESHIP
SELECT @PromoId = MaKhuyenMai FROM MaKhuyenMai WHERE MaCode = 'FREESHIP';
IF NOT EXISTS (SELECT 1 FROM KhuyenMaiNguoiDung WHERE MaNguoiDung = @UserId AND MaKhuyenMai = @PromoId)
    INSERT INTO KhuyenMaiNguoiDung (MaNguoiDung, MaKhuyenMai, TrangThai) VALUES (@UserId, @PromoId, N'CHUA_SU_DUNG');

-- ==========================================
-- User 1: admin@marthub.vn — có 4 voucher
-- ==========================================
SELECT @UserId = MaNguoiDung FROM NguoiDung WHERE Email = 'admin@marthub.vn';

SELECT @PromoId = MaKhuyenMai FROM MaKhuyenMai WHERE MaCode = 'MARTHUB10';
IF NOT EXISTS (SELECT 1 FROM KhuyenMaiNguoiDung WHERE MaNguoiDung = @UserId AND MaKhuyenMai = @PromoId)
    INSERT INTO KhuyenMaiNguoiDung (MaNguoiDung, MaKhuyenMai, TrangThai) VALUES (@UserId, @PromoId, N'CHUA_SU_DUNG');

SELECT @PromoId = MaKhuyenMai FROM MaKhuyenMai WHERE MaCode = 'SALE50K';
IF NOT EXISTS (SELECT 1 FROM KhuyenMaiNguoiDung WHERE MaNguoiDung = @UserId AND MaKhuyenMai = @PromoId)
    INSERT INTO KhuyenMaiNguoiDung (MaNguoiDung, MaKhuyenMai, TrangThai) VALUES (@UserId, @PromoId, N'CHUA_SU_DUNG');

SELECT @PromoId = MaKhuyenMai FROM MaKhuyenMai WHERE MaCode = 'NEWUSER';
IF NOT EXISTS (SELECT 1 FROM KhuyenMaiNguoiDung WHERE MaNguoiDung = @UserId AND MaKhuyenMai = @PromoId)
    INSERT INTO KhuyenMaiNguoiDung (MaNguoiDung, MaKhuyenMai, TrangThai) VALUES (@UserId, @PromoId, N'CHUA_SU_DUNG');

SELECT @PromoId = MaKhuyenMai FROM MaKhuyenMai WHERE MaCode = 'FREESHIP';
IF NOT EXISTS (SELECT 1 FROM KhuyenMaiNguoiDung WHERE MaNguoiDung = @UserId AND MaKhuyenMai = @PromoId)
    INSERT INTO KhuyenMaiNguoiDung (MaNguoiDung, MaKhuyenMai, TrangThai) VALUES (@UserId, @PromoId, N'CHUA_SU_DUNG');

-- ==========================================
-- User 3: seller@marthub.vn — có 2 voucher
-- ==========================================
SELECT @UserId = MaNguoiDung FROM NguoiDung WHERE Email = 'seller@marthub.vn';

SELECT @PromoId = MaKhuyenMai FROM MaKhuyenMai WHERE MaCode = 'NEWUSER';
IF NOT EXISTS (SELECT 1 FROM KhuyenMaiNguoiDung WHERE MaNguoiDung = @UserId AND MaKhuyenMai = @PromoId)
    INSERT INTO KhuyenMaiNguoiDung (MaNguoiDung, MaKhuyenMai, TrangThai) VALUES (@UserId, @PromoId, N'CHUA_SU_DUNG');

SELECT @PromoId = MaKhuyenMai FROM MaKhuyenMai WHERE MaCode = 'FREESHIP';
IF NOT EXISTS (SELECT 1 FROM KhuyenMaiNguoiDung WHERE MaNguoiDung = @UserId AND MaKhuyenMai = @PromoId)
    INSERT INTO KhuyenMaiNguoiDung (MaNguoiDung, MaKhuyenMai, TrangThai) VALUES (@UserId, @PromoId, N'CHUA_SU_DUNG');

PRINT 'Personal vouchers seeded successfully!';
GO

-- Show result
SELECT nd.Email, nd.HoTen, mk.MaCode, kmn.TrangThai, kmn.NgayNhan
FROM KhuyenMaiNguoiDung kmn
JOIN NguoiDung nd ON kmn.MaNguoiDung = nd.MaNguoiDung
JOIN MaKhuyenMai mk ON kmn.MaKhuyenMai = mk.MaKhuyenMai
ORDER BY nd.MaNguoiDung, mk.MaCode;
GO
