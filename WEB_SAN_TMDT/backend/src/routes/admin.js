const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/admin/shops — Danh sách shop (lọc theo trạng thái)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @swagger
 * /api/admin/shops:
 *   get:
 *     tags: [Admin]
 *     summary: Danh sách shop cần duyệt
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: trangThai
 *         schema: { type: string, enum: [CHO_DUYET, HOAT_DONG, BI_KHOA] }
 */
router.get('/shops', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { trangThai } = req.query;
    const pool = await getPool();

    let where = '';
    if (trangThai) where = `WHERE ch.TrangThai = N'${trangThai}'`;

    const result = await pool.request().query(`
      SELECT ch.*, nd.HoTen, nd.Email, nd.SoDienThoai
      FROM CuaHang ch
      JOIN NguoiDung nd ON ch.MaNguoiDung = nd.MaNguoiDung
      ${where}
      ORDER BY ch.NgayTao DESC
    `);

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy danh sách shop:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách shop' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/admin/shops/:id/approve — Duyệt shop
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @swagger
 * /api/admin/shops/{id}/approve:
 *   put:
 *     tags: [Admin]
 *     summary: Duyệt / từ chối shop
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action: { type: string, enum: [approve, reject] }
 *               lyDo: { type: string }
 */
router.put('/shops/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { action, lyDo } = req.body;
    const pool = await getPool();

    if (action === 'approve') {
      await pool.request()
        .input('MaCuaHang', sql.Int, req.params.id)
        .query("UPDATE CuaHang SET TrangThai = N'HOAT_DONG' WHERE MaCuaHang = @MaCuaHang");
      res.json({ success: true, message: 'Đã duyệt shop thành công' });
    } else if (action === 'reject') {
      await pool.request()
        .input('MaCuaHang', sql.Int, req.params.id)
        .query("UPDATE CuaHang SET TrangThai = N'BI_KHOA' WHERE MaCuaHang = @MaCuaHang");
      res.json({ success: true, message: 'Đã từ chối shop' });
    } else {
      res.status(400).json({ success: false, message: 'Action không hợp lệ (approve/reject)' });
    }
  } catch (error) {
    console.error('Lỗi duyệt shop:', error);
    res.status(500).json({ success: false, message: 'Lỗi duyệt shop' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/admin/users — Quản lý người dùng
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT MaNguoiDung, HoTen, Email, SoDienThoai, VaiTro, TrangThai, NgayTao, DiemTichLuy
      FROM NguoiDung
      ORDER BY NgayTao DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy users:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách người dùng' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/admin/stats — Thống kê admin
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM NguoiDung) as tongNguoiDung,
        (SELECT COUNT(*) FROM CuaHang WHERE TrangThai = N'HOAT_DONG') as tongShop,
        (SELECT COUNT(*) FROM CuaHang WHERE TrangThai = N'CHO_DUYET') as shopChoDuyet,
        (SELECT COUNT(*) FROM SanPham WHERE TrangThai = N'HOAT_DONG') as tongSanPham,
        (SELECT COUNT(*) FROM DonHang) as tongDonHang,
        (SELECT ISNULL(SUM(TienThanhToan), 0) FROM DonHang WHERE TrangThaiDonHang = N'DA_GIAO') as tongDoanhThu
    `);
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Lỗi thống kê:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy thống kê' });
  }
});

module.exports = router;
