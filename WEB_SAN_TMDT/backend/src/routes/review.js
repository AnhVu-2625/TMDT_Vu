const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/reviews – Viết đánh giá sản phẩm
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { maSanPham, maDonHang, diemDanhGia, binhLuan } = req.body;
    const pool = await getPool();

    // Kiểm tra đã mua hàng chưa
    const check = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('maDonHang', sql.Int, maDonHang)
      .input('maSanPham', sql.Int, maSanPham)
      .query(`
        SELECT dh.MaDonHang FROM DonHang dh
        JOIN ChiTietDonHang ct ON dh.MaDonHang = ct.MaDonHang
        JOIN PhienBanSanPham pb ON ct.MaPhienBan = pb.MaPhienBan
        WHERE dh.MaDonHang = @maDonHang AND dh.MaNguoiDung = @userId
          AND pb.MaSanPham = @maSanPham AND dh.TrangThaiDonHang = N'DA_GIAO'
      `);

    if (check.recordset.length === 0) {
      return res.status(400).json({ success: false, message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua và đã nhận hàng' });
    }

    // Kiểm tra đã đánh giá chưa
    const existing = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('maSanPham', sql.Int, maSanPham)
      .input('maDonHang', sql.Int, maDonHang)
      .query('SELECT MaDanhGia FROM DanhGiaSanPham WHERE MaNguoiDung=@userId AND MaSanPham=@maSanPham AND MaDonHang=@maDonHang');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('maSanPham', sql.Int, maSanPham)
      .input('maDonHang', sql.Int, maDonHang)
      .input('diem', sql.Int, diemDanhGia)
      .input('binhLuan', sql.NVarChar, binhLuan || '')
      .query(`INSERT INTO DanhGiaSanPham (MaNguoiDung, MaSanPham, MaDonHang, DiemDanhGia, BinhLuan)
              VALUES (@userId, @maSanPham, @maDonHang, @diem, @binhLuan)`);

    // Cập nhật điểm trung bình
    await pool.request()
      .input('maSanPham', sql.Int, maSanPham)
      .query(`UPDATE SanPham SET DanhGiaTrungBinh =
        (SELECT AVG(CAST(DiemDanhGia AS DECIMAL(3,2))) FROM DanhGiaSanPham WHERE MaSanPham=@maSanPham)
        WHERE MaSanPham = @maSanPham`);

    res.status(201).json({ success: true, message: 'Đánh giá thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// PUT /api/reviews/:id/reply – Người bán phản hồi
router.put('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { phanHoi } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('phanHoi', sql.NVarChar, phanHoi)
      .query('UPDATE DanhGiaSanPham SET PhanHoiCuaHang=@phanHoi WHERE MaDanhGia=@id');
    res.json({ success: true, message: 'Đã phản hồi đánh giá' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/reviews/product/:id – Lấy đánh giá sản phẩm
router.get('/product/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`SELECT dg.*, nd.HoTen, nd.AnhDaiDien
              FROM DanhGiaSanPham dg
              JOIN NguoiDung nd ON dg.MaNguoiDung = nd.MaNguoiDung
              WHERE dg.MaSanPham = @id ORDER BY dg.NgayTao DESC`);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
