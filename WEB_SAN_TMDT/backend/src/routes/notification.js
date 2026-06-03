const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get paginated notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT * FROM ThongBao 
        WHERE MaNguoiDung = @userId 
        ORDER BY NgayTao DESC 
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `);

    const countResult = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query('SELECT COUNT(*) as total FROM ThongBao WHERE MaNguoiDung = @userId');

    res.json({
      success: true,
      data: result.recordset,
      total: countResult.recordset[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const pool = await getPool();

    await pool
      .request()
      .input('notificationId', sql.Int, notificationId)
      .input('userId', sql.Int, req.userId)
      .query(`
        UPDATE ThongBao 
        SET DaDoc = 1 
        WHERE MaThongBao = @notificationId AND MaNguoiDung = @userId
      `);

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get unread count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query('SELECT COUNT(*) as count FROM ThongBao WHERE MaNguoiDung = @userId AND DaDoc = 0');

    res.json({ success: true, count: result.recordset[0].count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit a report (BaoCao)
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const { maDonHang, loaiBaoCao, moTa, anhBangChung } = req.body;
    const pool = await getPool();

    await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('maDonHang', sql.Int, maDonHang)
      .input('loaiBaoCao', sql.NVarChar, loaiBaoCao)
      .input('moTa', sql.NVarChar(sql.MAX), moTa)
      .input('anhBangChung', sql.NVarChar(sql.MAX), anhBangChung || null)
      .query(`
        INSERT INTO BaoCao (MaNguoiDungBaoCao, MaDonHang, LoaiBaoCao, MoTa, AnhBangChung)
        VALUES (@userId, @maDonHang, @loaiBaoCao, @moTa, @anhBangChung)
      `);

    res.status(201).json({ success: true, message: 'Report submitted' });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create dispute (Khieu nai/Tranh chap)
router.post('/dispute', authenticateToken, async (req, res) => {
  try {
    const { maDonHang, loaiTrancChap, moTaChiTiet } = req.body;
    const pool = await getPool();

    // Get order details
    const order = await pool.request()
      .input('orderId', sql.Int, maDonHang)
      .query('SELECT MaCuaHang FROM DonHang WHERE MaDonHang = @orderId');

    if (order.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const cuaHang = await pool.request()
      .input('shopId', sql.Int, order.recordset[0].MaCuaHang)
      .query('SELECT MaNguoiDung FROM CuaHang WHERE MaCuaHang = @shopId');

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
        OUTPUT INSERTED.MaTrancChap
        VALUES (@orderId, @buyerId, @sellerId, @loaiTrancChap, @moTaChiTiet, N'CHO_XU_LY')
      `);

    // Notify seller about dispute
    const disputeId = result.recordset[0].MaTrancChap;
    const buyer = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query('SELECT HoTen FROM NguoiDung WHERE MaNguoiDung = @userId');
    const buyerName = buyer.recordset[0]?.HoTen || 'Khach hang';

    await pool.request()
      .input('maNguoiDung', sql.Int, shopUserId)
      .input('tieuDe', sql.NVarChar, 'Khieu nai moi')
      .input('noiDung', sql.NVarChar, 'Khach hang ' + buyerName + ' da khieu nai don hang #' + maDonHang + ': ' + loaiTrancChap)
      .input('loaiThongBao', sql.NVarChar, 'DON_HANG')
      .input('maThamChieu', sql.Int, maDonHang)
      .query(`
        INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao, MaThamChieu)
        VALUES (@maNguoiDung, @tieuDe, @noiDung, @loaiThongBao, @maThamChieu)
      `);

    res.status(201).json({
      success: true,
      message: 'Dispute created',
      disputeId
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
