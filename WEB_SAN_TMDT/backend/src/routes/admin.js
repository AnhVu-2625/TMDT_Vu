const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.VaiTro !== 'QUAN_TRI_VIEN') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// ==========================================
// QUẢN LÝ CỬA HÀNG (Shop Management)
// ==========================================

// Get all shops
router.get('/shops', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { trangThai = '' } = req.query;
    const pool = await getPool();

    let query = `
      SELECT ch.MaCuaHang, ch.TenCuaHang, ch.MoTa, ch.Logo, ch.TrangThai, ch.SoDuVi, ch.NgayTao,
             nd.HoTen, nd.Email, nd.SoDienThoai
      FROM CuaHang ch
      INNER JOIN NguoiDung nd ON ch.MaNguoiDung = nd.MaNguoiDung
      WHERE 1=1
    `;
    if (trangThai) query += ` AND ch.TrangThai = @trangThai`;
    query += ` ORDER BY ch.NgayTao DESC`;

    const request = pool.request();
    if (trangThai) request.input('trangThai', sql.NVarChar, trangThai);
    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve shop
router.put('/shops/:shopId/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { shopId } = req.params;
    const pool = await getPool();

    const shopResult = await pool.request()
      .input('shopId', sql.Int, shopId)
      .query(`SELECT ch.*, nd.MaNguoiDung FROM CuaHang ch INNER JOIN NguoiDung nd ON ch.MaNguoiDung = nd.MaNguoiDung WHERE ch.MaCuaHang = @shopId`);

    if (shopResult.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy cửa hàng' });

    const shop = shopResult.recordset[0];

    await pool.request()
      .input('shopId', sql.Int, shopId)
      .query(`UPDATE CuaHang SET TrangThai = N'HOAT_DONG' WHERE MaCuaHang = @shopId`);

    // Gửi thông báo cho chủ shop
    await pool.request()
      .input('userId', sql.Int, shop.MaNguoiDung)
      .input('tieuDe', sql.NVarChar, 'Cửa hàng đã được duyệt')
      .input('noiDung', sql.NVarChar, `Cửa hàng "${shop.TenCuaHang}" của bạn đã được Admin duyệt và có thể bắt đầu kinh doanh.`)
      .query(`INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao) VALUES (@userId, @tieuDe, @noiDung, N'HE_THONG')`);

    res.json({ success: true, message: 'Đã duyệt cửa hàng' });
  } catch (error) {
    console.error('Approve shop error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject shop
router.put('/shops/:shopId/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { lyDo = '' } = req.body;
    const pool = await getPool();

    const shopResult = await pool.request()
      .input('shopId', sql.Int, shopId)
      .query(`SELECT ch.*, nd.MaNguoiDung FROM CuaHang ch INNER JOIN NguoiDung nd ON ch.MaNguoiDung = nd.MaNguoiDung WHERE ch.MaCuaHang = @shopId`);

    if (shopResult.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy cửa hàng' });

    const shop = shopResult.recordset[0];

    await pool.request()
      .input('shopId', sql.Int, shopId)
      .query(`UPDATE CuaHang SET TrangThai = N'BI_KHOA' WHERE MaCuaHang = @shopId`);

    await pool.request()
      .input('userId', sql.Int, shop.MaNguoiDung)
      .input('tieuDe', sql.NVarChar, 'Đăng ký cửa hàng bị từ chối')
      .input('noiDung', sql.NVarChar, `Đăng ký cửa hàng "${shop.TenCuaHang}" bị từ chối. Lý do: ${lyDo}`)
      .query(`INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao) VALUES (@userId, @tieuDe, @noiDung, N'HE_THONG')`);

    res.json({ success: true, message: 'Đã từ chối đăng ký' });
  } catch (error) {
    console.error('Reject shop error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Lock shop
router.put('/shops/:shopId/lock', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { lyDo = '' } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('shopId', sql.Int, shopId)
      .query(`UPDATE CuaHang SET TrangThai = N'BI_KHOA' WHERE MaCuaHang = @shopId`);

    res.json({ success: true, message: 'Đã khóa cửa hàng' });
  } catch (error) {
    console.error('Lock shop error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// QUẢN LÝ NGƯỜI DÙNG (Account Management)
// ==========================================

// Get all users
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const pool = await getPool();
    const offset = (page - 1) * limit;

    let query = `
      SELECT MaNguoiDung, HoTen, Email, SoDienThoai, VaiTro, TrangThai, 
             DiemTichLuy, MaHang, NgayTao
      FROM NguoiDung
      WHERE 1=1
    `;
    
    if (search) {
      query += ` AND (HoTen LIKE @search OR Email LIKE @search OR SoDienThoai LIKE @search)`;
    }
    if (status) {
      query += ` AND TrangThai = @status`;
    }

    query += ` ORDER BY NgayTao DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request();
    if (search) request.input('search', sql.NVarChar, `%${search}%`);
    if (status) request.input('status', sql.NVarChar, status);
    request.input('offset', sql.Int, offset).input('limit', sql.Int, parseInt(limit));

    const result = await request.query(query);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM NguoiDung WHERE 1=1`;
    if (search) countQuery += ` AND (HoTen LIKE @search OR Email LIKE @search OR SoDienThoai LIKE @search)`;
    if (status) countQuery += ` AND TrangThai = @status`;

    const countRequest = pool.request();
    if (search) countRequest.input('search', sql.NVarChar, `%${search}%`);
    if (status) countRequest.input('status', sql.NVarChar, status);
    const countResult = await countRequest.query(countQuery);

    res.json({
      success: true,
      data: result.recordset,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.recordset[0].total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Lock user account (Khóa tài khoản)
router.put('/users/:userId/lock', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { lyDo = '' } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('userId', sql.Int, userId)
      .query(`UPDATE NguoiDung SET TrangThai = N'BI_KHOA', NgayCapNhat = GETDATE() WHERE MaNguoiDung = @userId`);

    // Log notification
    const app = require('../server');
    const io = app.get ? app.get('io') : null;
    if (io) {
      io.emit('user_locked', { userId, reason: lyDo });
    }

    res.json({ success: true, message: 'User account locked' });
  } catch (error) {
    console.error('Lock user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Unlock user account (Mở khóa tài khoản)
router.put('/users/:userId/unlock', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('userId', sql.Int, userId)
      .query(`UPDATE NguoiDung SET TrangThai = N'HOAT_DONG', NgayCapNhat = GETDATE() WHERE MaNguoiDung = @userId`);

    res.json({ success: true, message: 'User account unlocked' });
  } catch (error) {
    console.error('Unlock user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// KIỂM DUYỆT HỆ THỐNG (Reports & Moderation)
// ==========================================

// Get all reports
router.get('/reports', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const pool = await getPool();
    const offset = (page - 1) * limit;

    let query = `
      SELECT MaBaoCao, MaNguoiDungBaoCao, LoaiBaoCao, MoTaChiTiet, TrangThai, 
             MaThamChieu, LoaiMaThamChieu, NgayTao, GhiChuAdmin
      FROM BaoCao
    `;
    
    if (status) {
      query += ` WHERE TrangThai = @status`;
    }

    query += ` ORDER BY NgayTao DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request();
    if (status) request.input('status', sql.NVarChar, status);
    request.input('offset', sql.Int, offset).input('limit', sql.Int, parseInt(limit));

    const result = await request.query(query);

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Resolve report (Xử lý báo cáo)
router.put('/reports/:reportId/resolve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { decision, ghiChu } = req.body; // decision: 'APPROVED', 'REJECTED'
    const pool = await getPool();

    // Get report details
    const report = await pool.request()
      .input('reportId', sql.Int, reportId)
      .query(`SELECT * FROM BaoCao WHERE MaBaoCao = @reportId`);

    if (report.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const reportData = report.recordset[0];

    // Update report status
    await pool.request()
      .input('reportId', sql.Int, reportId)
      .input('status', sql.NVarChar, decision === 'APPROVED' ? 'DA_GIAI_QUYET' : 'BI_TU_CHOI')
      .input('ghiChu', sql.NVarChar, ghiChu || '')
      .query(`
        UPDATE BaoCao 
        SET TrangThai = @status, GhiChuAdmin = @ghiChu, NgayCapNhat = GETDATE()
        WHERE MaBaoCao = @reportId
      `);

    // If approved, take action on reported item
    if (decision === 'APPROVED' && reportData.LoaiMaThamChieu === 'SAN_PHAM') {
      await pool.request()
        .input('productId', sql.Int, reportData.MaThamChieu)
        .query(`UPDATE SanPham SET TrangThai = N'BI_KHOA', NgayCapNhat = GETDATE() WHERE MaSanPham = @productId`);
    }

    res.json({ success: true, message: 'Report resolved' });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// THỐNG KÊ TỔNG QUAN (Overview Statistics)
// ==========================================

router.get('/statistics', authenticateToken, isAdmin, async (req, res) => {
  try {
    const pool = await getPool();

    const stats = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM NguoiDung) as totalUsers,
        (SELECT COUNT(*) FROM NguoiDung WHERE TrangThai = N'BI_KHOA') as lockedUsers,
        (SELECT COUNT(*) FROM DonHang) as totalOrders,
        (SELECT SUM(TienThanhToan) FROM DonHang WHERE TrangThaiThanhToan = N'DA_THANH_TOAN') as totalRevenue,
        (SELECT COUNT(*) FROM BaoCao WHERE TrangThai = N'CHO_XU_LY') as pendingReports,
        (SELECT COUNT(*) FROM YeuCauRutTien WHERE TrangThai = N'CHO_DUYET') as pendingWithdrawals,
        (SELECT COUNT(*) FROM CuaHang) as totalShops,
        (SELECT COUNT(*) FROM CuaHang WHERE TrangThai = N'CHO_DUYET') as pendingShops,
        (SELECT COUNT(*) FROM YeuCauDoiTra WHERE TrangThai = N'KHIEU_NAI_ADMIN') as pendingDisputes
    `);

    res.json({ success: true, data: stats.recordset[0] });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// GIẢI QUYẾT TRANH CHẤP (Dispute Resolution)
// ==========================================

router.get('/disputes', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const pool = await getPool();
    const offset = (page - 1) * limit;

    let query = `
      SELECT MaTrancChap, MaDonHang, MaNguoiDungKhieu, MaNguoiDungDoiPhuong, 
             LoaiTrancChap, MoTaChiTiet, TrangThai, NgayTao
      FROM GiaiQuyetTrancChap
    `;
    
    if (status) {
      query += ` WHERE TrangThai = @status`;
    }

    query += ` ORDER BY NgayTao DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request();
    if (status) request.input('status', sql.NVarChar, status);
    request.input('offset', sql.Int, offset).input('limit', sql.Int, parseInt(limit));

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/disputes/:disputeId/resolve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { decision, ghiChu } = req.body; // decision: 'CHO_NGUOI_MUA', 'CHO_NGUOI_BAN'
    const pool = await getPool();

    await pool.request()
      .input('disputeId', sql.Int, disputeId)
      .input('decision', sql.NVarChar, ghiChu)
      .input('executorId', sql.Int, req.userId)
      .query(`
        UPDATE GiaiQuyetTrancChap
        SET TrangThai = N'DA_GIAI_QUYET', QuyetDinhCuaAdmin = @decision, 
            MaNguoiDungXuLy = @executorId, NgayCapNhat = GETDATE()
        WHERE MaTrancChap = @disputeId
      `);

    res.json({ success: true, message: 'Dispute resolved' });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// CHÍNH SÁCH HỆ THỐNG (System Policies)
// ==========================================

router.get('/policies', authenticateToken, isAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const policies = await pool.request()
      .query(`SELECT * FROM ChinhSachHeThong ORDER BY NgayTao DESC`);
    
    res.json({ success: true, data: policies.recordset });
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/policies', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { tenChinhSach, noiDung, loaiChinhSach } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('tenChinhSach', sql.NVarChar, tenChinhSach)
      .input('noiDung', sql.NVarChar(sql.MAX), noiDung)
      .input('loaiChinhSach', sql.NVarChar, loaiChinhSach)
      .query(`
        INSERT INTO ChinhSachHeThong (TenChinhSach, NoiDung, LoaiChinhSach)
        VALUES (@tenChinhSach, @noiDung, @loaiChinhSach)
      `);

    res.json({ success: true, message: 'Policy created' });
  } catch (error) {
    console.error('Create policy error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/policies/:policyId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { policyId } = req.params;
    const { tenChinhSach, noiDung, loaiChinhSach } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('policyId', sql.Int, policyId)
      .input('tenChinhSach', sql.NVarChar, tenChinhSach)
      .input('noiDung', sql.NVarChar(sql.MAX), noiDung)
      .input('loaiChinhSach', sql.NVarChar, loaiChinhSach)
      .query(`
        UPDATE ChinhSachHeThong
        SET TenChinhSach = @tenChinhSach, NoiDung = @noiDung,
            LoaiChinhSach = @loaiChinhSach, NgayCapNhat = GETDATE()
        WHERE MaChinhSach = @policyId
      `);

    res.json({ success: true, message: 'Policy updated' });
  } catch (error) {
    console.error('Update policy error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// QUẢN LÝ RÚT TIỀN (Settlement & Withdrawals)
// ==========================================

router.get('/withdrawals', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status = '' } = req.query;
    const pool = await getPool();

    let query = `
      SELECT yr.MaYeuCau, yr.MaCuaHang, yr.SoTien, yr.TenTaiKhoanNganHang,
             yr.SoTaiKhoan, yr.TenNganHang, yr.TrangThai, yr.NgayTao,
             ch.TenCuaHang, nd.HoTen, nd.Email
      FROM YeuCauRutTien yr
      JOIN CuaHang ch ON yr.MaCuaHang = ch.MaCuaHang
      JOIN NguoiDung nd ON ch.MaNguoiDung = nd.MaNguoiDung
    `;

    if (status) {
      query += ` WHERE yr.TrangThai = @status`;
    }

    query += ` ORDER BY yr.NgayTao DESC`;

    const request = pool.request();
    if (status) request.input('status', sql.NVarChar, status);

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/withdrawals/:withdrawalId/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('withdrawalId', sql.Int, withdrawalId)
      .query(`
        UPDATE YeuCauRutTien 
        SET TrangThai = N'DA_DUYET'
        WHERE MaYeuCau = @withdrawalId
      `);

    res.json({ success: true, message: 'Withdrawal approved' });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/withdrawals/:withdrawalId/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('withdrawalId', sql.Int, withdrawalId)
      .query(`
        UPDATE YeuCauRutTien 
        SET TrangThai = N'TU_CHOI'
        WHERE MaYeuCau = @withdrawalId
      `);

    res.json({ success: true, message: 'Withdrawal rejected' });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// GỬI THÔNG BÁO (Send Notifications)
// ==========================================

router.post('/send-notification', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId, tieuDe, noiDung, loaiThongBao = 'HE_THONG' } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('userId', sql.Int, userId)
      .input('tieuDe', sql.NVarChar, tieuDe)
      .input('noiDung', sql.NVarChar(sql.MAX), noiDung)
      .input('loaiThongBao', sql.NVarChar, loaiThongBao)
      .query(`
        INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao)
        VALUES (@userId, @tieuDe, @noiDung, @loaiThongBao)
      `);

    // Real-time notification via Socket.IO
    const app = require('../server');
    const io = app.get ? app.get('io') : null;
    if (io) {
      io.emit('notification', { userId, tieuDe, noiDung });
    }

    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Broadcast notification to all users
router.post('/broadcast-notification', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { tieuDe, noiDung, loaiThongBao = 'HE_THONG' } = req.body;
    const pool = await getPool();

    // Lấy tất cả user đang hoạt động
    const users = await pool.request()
      .query(`SELECT MaNguoiDung FROM NguoiDung WHERE TrangThai = N'HOAT_DONG'`);

    // Bulk insert thông báo
    for (const user of users.recordset) {
      await pool.request()
        .input('userId', sql.Int, user.MaNguoiDung)
        .input('tieuDe', sql.NVarChar, tieuDe)
        .input('noiDung', sql.NVarChar(sql.MAX), noiDung)
        .input('loaiThongBao', sql.NVarChar, loaiThongBao)
        .query(`INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao) VALUES (@userId, @tieuDe, @noiDung, @loaiThongBao)`);
    }

    res.json({ success: true, message: `Đã gửi thông báo đến ${users.recordset.length} người dùng` });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
