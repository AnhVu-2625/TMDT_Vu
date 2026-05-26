const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { maPhienBan, soLuong } = req.body;
    const pool = await getPool();

    if (!maPhienBan || !soLuong || soLuong <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    // Check if item already in cart
    const existing = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('maPhienBan', sql.Int, maPhienBan)
      .query(`
        SELECT * FROM ChiTietGioHang 
        WHERE MaNguoiDung = @userId AND MaPhienBan = @maPhienBan
      `);

    if (existing.recordset.length > 0) {
      // Update quantity
      await pool
        .request()
        .input('userId', sql.Int, req.userId)
        .input('maPhienBan', sql.Int, maPhienBan)
        .input('soLuong', sql.Int, soLuong)
        .query(`
          UPDATE ChiTietGioHang 
          SET SoLuong = SoLuong + @soLuong
          WHERE MaNguoiDung = @userId AND MaPhienBan = @maPhienBan
        `);
    } else {
      // Add new item
      await pool
        .request()
        .input('userId', sql.Int, req.userId)
        .input('maPhienBan', sql.Int, maPhienBan)
        .input('soLuong', sql.Int, soLuong)
        .query(`
          INSERT INTO ChiTietGioHang (MaNguoiDung, MaPhienBan, SoLuong)
          VALUES (@userId, @maPhienBan, @soLuong)
        `);
    }

    res.json({ success: true, message: 'Added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const cart = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT cg.*, pbsn.*, sp.TenSanPham, ch.TenCuaHang
        FROM ChiTietGioHang cg
        JOIN PhienBanSanPham pbsn ON cg.MaPhienBan = pbsn.MaPhienBan
        JOIN SanPham sp ON pbsn.MaSanPham = sp.MaSanPham
        JOIN CuaHang ch ON sp.MaCuaHang = ch.MaCuaHang
        WHERE cg.MaNguoiDung = @userId
      `);

    res.json({ success: true, data: cart.recordset });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update cart item
router.put('/:cartItemId', authenticateToken, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { soLuong } = req.body;

    if (!soLuong || soLuong <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    const pool = await getPool();
    await pool
      .request()
      .input('cartItemId', sql.Int, cartItemId)
      .input('soLuong', sql.Int, soLuong)
      .query(`
        UPDATE ChiTietGioHang SET SoLuong = @soLuong WHERE MaChiTietGioHang = @cartItemId
      `);

    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove from cart
router.delete('/:cartItemId', authenticateToken, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const pool = await getPool();

    await pool
      .request()
      .input('cartItemId', sql.Int, cartItemId)
      .query('DELETE FROM ChiTietGioHang WHERE MaChiTietGioHang = @cartItemId');

    res.json({ success: true, message: 'Removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Clear cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query('DELETE FROM ChiTietGioHang WHERE MaNguoiDung = @userId');

    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
