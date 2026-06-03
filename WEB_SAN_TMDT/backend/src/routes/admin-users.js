const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.VaiTro !== 'QUAN_TRI_VIEN') {
    return res.status(403).json({ success: false, message: 'Yêu cầu quyền Quản trị viên' });
  }
  next();
};

// GET /api/admin/users - Get all users with search, pagination, status filters
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    const pool = await getPool();

    let whereClause = 'WHERE 1=1';
    if (search) {
      whereClause += ` AND (HoTen LIKE N'%${search}%' OR Email LIKE '%${search}%' OR SoDienThoai LIKE '%${search}%')`;
    }
    if (status) {
      whereClause += ` AND TrangThai = N'${status}'`;
    }

    const query = `
      SELECT MaNguoiDung, HoTen, Email, SoDienThoai, VaiTro, TrangThai, NgayTao
      FROM NguoiDung
      ${whereClause}
      ORDER BY NgayTao DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) as Total
      FROM NguoiDung
      ${whereClause}
    `;

    const result = await pool.request().query(query);
    const countResult = await pool.request().query(countQuery);
    const total = countResult.recordset[0].Total;

    res.json({
      success: true,
      data: result.recordset,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/lock - Lock a user account
router.put('/:id/lock', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { lyDo = '' } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.Int, id)
      .input('lyDo', sql.NVarChar, lyDo)
      .query(`
        UPDATE NguoiDung
        SET TrangThai = N'BI_KHOA'
        WHERE MaNguoiDung = @id
      `);

    // Gửi thông báo cho user bị khóa (nếu có)
    await pool.request()
      .input('userId', sql.Int, id)
      .input('noiDung', sql.NVarChar, `Tài khoản của bạn đã bị khóa bởi Admin. Lý do: ${lyDo || 'Vi phạm điều khoản.'}`)
      .query(`
        INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao)
        VALUES (@userId, N'Tài khoản bị khóa', @noiDung, N'HE_THONG')
      `);

    res.json({ success: true, message: 'Tài khoản đã bị khóa thành công' });
  } catch (error) {
    console.error('Lock user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/unlock - Unlock a user account
router.put('/:id/unlock', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE NguoiDung
        SET TrangThai = N'HOAT_DONG'
        WHERE MaNguoiDung = @id
      `);

    // Gửi thông báo cho user được mở khóa
    await pool.request()
      .input('userId', sql.Int, id)
      .query(`
        INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao)
        VALUES (@userId, N'Tài khoản đã mở khóa', N'Tài khoản của bạn đã được mở khóa hoạt động trở lại.', N'HE_THONG')
      `);

    res.json({ success: true, message: 'Mở khóa tài khoản thành công' });
  } catch (error) {
    console.error('Unlock user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
