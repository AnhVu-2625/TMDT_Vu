-- ==========================================
-- SEED IMAGES FOR PRODUCTS
-- Thêm ảnh mẫu cho các sản phẩm đã có
-- ==========================================
USE ThuongMaiDienTu;
GO

-- Thêm ảnh cho tất cả sản phẩm chưa có ảnh chính
GO

-- Product 1: Samsung Galaxy S24 Ultra
DECLARE @SP1 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'samsung-galaxy-s24-ultra');
IF @SP1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM HinhAnhSanPham WHERE MaSanPham = @SP1 AND LaAnhChinh = 1)
BEGIN
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=640&h=640&fit=crop', 1);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1610945411781-d41b7c1e477f?w=640&h=640&fit=crop', 0);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP1, 'https://images.unsplash.com/photo-1610945411631-5c8a5e1b1e7b?w=640&h=640&fit=crop', 0);
END
GO

-- Product 2: iPhone 15 Pro Max
DECLARE @SP2 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'iphone-15-pro-max');
IF @SP2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM HinhAnhSanPham WHERE MaSanPham = @SP2 AND LaAnhChinh = 1)
BEGIN
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP2, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=640&h=640&fit=crop', 1);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP2, 'https://images.unsplash.com/photo-1696446701796-da61224797f6?w=640&h=640&fit=crop', 0);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP2, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=640&h=640&fit=crop', 0);
END
GO

-- Product 3: MacBook Pro 14 M3 Pro
DECLARE @SP3 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'macbook-pro-14-m3-pro');
IF @SP3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM HinhAnhSanPham WHERE MaSanPham = @SP3 AND LaAnhChinh = 1)
BEGIN
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP3, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640&h=640&fit=crop', 1);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP3, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=640&h=640&fit=crop', 0);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP3, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=640&h=640&fit=crop', 0);
END
GO

-- Product 4: Sony WH-1000XM5
DECLARE @SP4 INT = (SELECT MaSanPham FROM SanPham WHERE DuongDan = 'sony-wh-1000xm5');
IF @SP4 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM HinhAnhSanPham WHERE MaSanPham = @SP4 AND LaAnhChinh = 1)
BEGIN
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP4, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=640&h=640&fit=crop', 1);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP4, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=640&h=640&fit=crop', 0);
    INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES
        (@SP4, 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=640&h=640&fit=crop', 0);
END
GO

PRINT '✅ Added images for all base products!';
GO

-- Kiểm tra
SELECT sp.TenSanPham, COUNT(ha.MaHinhAnh) as SoLuongAnh
FROM SanPham sp
LEFT JOIN HinhAnhSanPham ha ON sp.MaSanPham = ha.MaSanPham
GROUP BY sp.TenSanPham;
GO
