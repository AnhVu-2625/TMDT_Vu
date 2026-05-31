const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ─── Thêm vào giỏ hàng ────────────────────────────────────────────────────────
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { maPhienBan, soLuong } = req.body;
    const pool = await getPool();

    if (!maPhienBan || !soLuong || soLuong <= 0) {
      return res.status(400).json({ success: false, message: 'Thông tin không hợp lệ' });
    }

    // Kiểm tra tồn kho
    const stockCheck = await pool.request()
      .input('maPhienBan', sql.Int, maPhienBan)
      .query('SELECT SoLuongTonKho FROM PhienBanSanPham WHERE MaPhienBan = @maPhienBan');

    if (stockCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Phiên bản sản phẩm không tồn tại' });
    }

    if (stockCheck.recordset[0].SoLuongTonKho < soLuong) {
      return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });
    }

    // Kiểm tra đã có trong giỏ chưa
    const existing = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('maPhienBan', sql.Int, maPhienBan)
      .query('SELECT MaChiTietGioHang, SoLuong FROM ChiTietGioHang WHERE MaNguoiDung = @userId AND MaPhienBan = @maPhienBan');

    if (existing.recordset.length > 0) {
      const newQty = existing.recordset[0].SoLuong + soLuong;
      if (newQty > stockCheck.recordset[0].SoLuongTonKho) {
        return res.status(400).json({ success: false, message: 'Tổng số lượng vượt quá tồn kho' });
      }
      await pool.request()
        .input('userId', sql.Int, req.userId)
        .input('maPhienBan', sql.Int, maPhienBan)
        .input('soLuong', sql.Int, soLuong)
        .query('UPDATE ChiTietGioHang SET SoLuong = SoLuong + @soLuong WHERE MaNguoiDung = @userId AND MaPhienBan = @maPhienBan');
    } else {
      await pool.request()
        .input('userId', sql.Int, req.userId)
        .input('maPhienBan', sql.Int, maPhienBan)
        .input('soLuong', sql.Int, soLuong)
        .query('INSERT INTO ChiTietGioHang (MaNguoiDung, MaPhienBan, SoLuong) VALUES (@userId, @maPhienBan, @soLuong)');
    }

    res.json({ success: true, message: 'Đã thêm vào giỏ hàng' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─── Lấy giỏ hàng ─────────────────────────────────────────────────────────────
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const cart = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT 
          cg.MaChiTietGioHang, cg.SoLuong, cg.NgayThem,
          pb.MaPhienBan, pb.MauSac, pb.KichThuoc, pb.GiaBan, pb.SoLuongTonKho,
          sp.MaSanPham, sp.TenSanPham, sp.DuongDan,
          ch.MaCuaHang, ch.TenCuaHang,
          (SELECT TOP 1 DuongDanAnh FROM HinhAnhSanPham WHERE MaSanPham = sp.MaSanPham AND LaAnhChinh = 1) as AnhChinh
        FROM ChiTietGioHang cg
        JOIN PhienBanSanPham pb ON cg.MaPhienBan = pb.MaPhienBan
        JOIN SanPham sp ON pb.MaSanPham = sp.MaSanPham
        JOIN CuaHang ch ON sp.MaCuaHang = ch.MaCuaHang
        WHERE cg.MaNguoiDung = @userId
        ORDER BY cg.NgayThem DESC
      `);

    res.json({ success: true, data: cart.recordset });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─── Cập nhật số lượng ────────────────────────────────────────────────────────
router.put('/:cartItemId', authenticateToken, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { soLuong } = req.body;

    if (!soLuong || soLuong <= 0) {
      return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ' });
    }

    const pool = await getPool();

    // Kiểm tra ownership
    const item = await pool.request()
      .input('cartItemId', sql.Int, cartItemId)
      .input('userId', sql.Int, req.userId)
      .query('SELECT MaChiTietGioHang FROM ChiTietGioHang WHERE MaChiTietGioHang = @cartItemId AND MaNguoiDung = @userId');

    if (item.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ' });
    }

    await pool.request()
      .input('cartItemId', sql.Int, cartItemId)
      .input('soLuong', sql.Int, soLuong)
      .query('UPDATE ChiTietGioHang SET SoLuong = @soLuong WHERE MaChiTietGioHang = @cartItemId');

    res.json({ success: true, message: 'Đã cập nhật giỏ hàng' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─── Xóa 1 sản phẩm khỏi giỏ ─────────────────────────────────────────────────
router.delete('/:cartItemId', authenticateToken, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const pool = await getPool();
    await pool.request()
      .input('cartItemId', sql.Int, cartItemId)
      .input('userId', sql.Int, req.userId)
      .query('DELETE FROM ChiTietGioHang WHERE MaChiTietGioHang = @cartItemId AND MaNguoiDung = @userId');
    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─── Xóa toàn bộ giỏ hàng ────────────────────────────────────────────────────
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('userId', sql.Int, req.userId)
      .query('DELETE FROM ChiTietGioHang WHERE MaNguoiDung = @userId');
    res.json({ success: true, message: 'Đã xóa giỏ hàng' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
