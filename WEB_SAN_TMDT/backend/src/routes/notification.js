const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pool = await getPool();
    const offset = (page - 1) * limit;

    const notifications = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT * FROM ThongBao
        WHERE MaNguoiDung = @userId
        ORDER BY NgayTao DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    res.json({ success: true, data: notifications.recordset });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('notificationId', sql.Int, notificationId)
      .input('userId', sql.Int, req.userId)
      .query(`
        UPDATE ThongBao 
        SET DaDoc = 1 
        WHERE MaThongBao = @notificationId AND MaNguoiDung = @userId
      `);

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get unread count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT COUNT(*) as unreadCount FROM ThongBao
        WHERE MaNguoiDung = @userId AND DaDoc = 0
      `);

    res.json({ success: true, data: { unreadCount: result.recordset[0].unreadCount } });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit report (Báo cáo vi phạm)
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const { loaiBaoCao, moTaChiTiet, maThamChieu, loaiMaThamChieu } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('loaiBaoCao', sql.NVarChar, loaiBaoCao)
      .input('moTaChiTiet', sql.NVarChar(sql.MAX), moTaChiTiet)
      .input('maThamChieu', sql.Int, maThamChieu || null)
      .input('loaiMaThamChieu', sql.NVarChar, loaiMaThamChieu || null)
      .query(`
        INSERT INTO BaoCao (MaNguoiDungBaoCao, LoaiBaoCao, MoTaChiTiet, MaThamChieu, LoaiMaThamChieu, TrangThai)
        VALUES (@userId, @loaiBaoCao, @moTaChiTiet, @maThamChieu, @loaiMaThamChieu, N'CHO_XU_LY')
        SELECT @@IDENTITY as MaBaoCao
      `);

    res.status(201).json({
      success: true,
      message: 'Report submitted',
      reportId: result.recordset[0].MaBaoCao
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create dispute (Khiếu nại/Tranh chấp)
router.post('/dispute', authenticateToken, async (req, res) => {
  try {
    const { maDonHang, loaiTrancChap, moTaChiTiet } = req.body;
    const pool = await getPool();

    // Get order details
    const order = await pool.request()
      .input('orderId', sql.Int, maDonHang)
      .query(`SELECT MaCuaHang FROM DonHang WHERE MaDonHang = @orderId`);

    if (order.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const cuaHang = await pool.request()
      .input('shopId', sql.Int, order.recordset[0].MaCuaHang)
      .query(`SELECT MaNguoiDung FROM CuaHang WHERE MaCuaHang = @shopId`);

    const shopUserId = cuaHang.recordset[0].MaNguoiDung;

    // Create dispute
    const result = await pool.request()
      .input('orderId', sql.Int, maDonHang)
      .input('buyerId', sql.Int, req.userId)
      .input('sellerId', sql.Int, shopUserId)
      .input('loaiTrancChap', sql.NVarChar, loaiTrancChap)
      .input('moTaChiTiet', sql.NVarChar(sql.MAX), moTaChiTiet)
      .query(`
        INSERT INTO GiaiQuyetTrancChap 
        (MaDonHang, MaNguoiDungKhieu, MaNguoiDungDoiPhuong, LoaiTrancChap, MoTaChiTiet, TrangThai)
        VALUES (@orderId, @buyerId, @sellerId, @loaiTrancChap, @moTaChiTiet, N'CHO_XU_LY')
        SELECT @@IDENTITY as MaTrancChap
      `);

    res.status(201).json({
      success: true,
      message: 'Dispute created',
      disputeId: result.recordset[0].MaTrancChap
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
