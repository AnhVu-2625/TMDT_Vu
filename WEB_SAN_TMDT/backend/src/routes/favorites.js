const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add to favorites
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { maSanPham } = req.body;
    const pool = await getPool();

    if (!maSanPham) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    const existing = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('maSanPham', sql.Int, maSanPham)
      .query(`
        SELECT * FROM DanhSachYeuThich 
        WHERE MaNguoiDung = @userId AND MaSanPham = @maSanPham
      `);

    if (existing.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Already in favorites' });
    }

    await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('maSanPham', sql.Int, maSanPham)
      .query(`
        INSERT INTO DanhSachYeuThich (MaNguoiDung, MaSanPham)
        VALUES (@userId, @maSanPham)
      `);

    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const favorites = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT sp.*, ch.TenCuaHang
        FROM DanhSachYeuThich dy
        JOIN SanPham sp ON dy.MaSanPham = sp.MaSanPham
        JOIN CuaHang ch ON sp.MaCuaHang = ch.MaCuaHang
        WHERE dy.MaNguoiDung = @userId
        ORDER BY dy.NgayThem DESC
      `);

    res.json({ success: true, data: favorites.recordset });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove from favorites
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const pool = await getPool();

    await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('maSanPham', sql.Int, productId)
      .query(`
        DELETE FROM DanhSachYeuThich 
        WHERE MaNguoiDung = @userId AND MaSanPham = @maSanPham
      `);

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
