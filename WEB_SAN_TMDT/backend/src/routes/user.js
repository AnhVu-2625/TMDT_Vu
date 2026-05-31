const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const user = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT MaNguoiDung, HoTen, Email, SoDienThoai, AnhDaiDien, 
               NgaySinh, GioiTinh, DiemTichLuy, MaHang, VaiTro, TrangThai
        FROM NguoiDung WHERE MaNguoiDung = @userId
      `);

    if (user.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user.recordset[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { hoTen, ngaySinh, gioiTinh, anhDaiDien } = req.body;
    const pool = await getPool();

    await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('hoTen', sql.NVarChar, hoTen)
      .input('ngaySinh', sql.Date, ngaySinh)
      .input('gioiTinh', sql.NVarChar, gioiTinh)
      .input('anhDaiDien', sql.NVarChar, anhDaiDien)
      .query(`
        UPDATE NguoiDung 
        SET HoTen = @hoTen, NgaySinh = @ngaySinh, 
            GioiTinh = @gioiTinh, AnhDaiDien = @anhDaiDien
        WHERE MaNguoiDung = @userId
      `);

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get delivery addresses
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const addresses = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query('SELECT * FROM DiaChiGiaoHang WHERE MaNguoiDung = @userId ORDER BY LaMacDinh DESC');

    res.json({ success: true, data: addresses.recordset });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add delivery address
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const { tenNguoiNhan, sdtNguoiNhan, diaChiCuThe, phuongXa, quanHuyen, tinhThanh, laMacDinh } = req.body;
    const pool = await getPool();

    if (laMacDinh) {
      await pool
        .request()
        .input('userId', sql.Int, req.userId)
        .query('UPDATE DiaChiGiaoHang SET LaMacDinh = 0 WHERE MaNguoiDung = @userId');
    }

    const result = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('tenNguoiNhan', sql.NVarChar, tenNguoiNhan)
      .input('sdtNguoiNhan', sql.NVarChar, sdtNguoiNhan)
      .input('diaChiCuThe', sql.NVarChar, diaChiCuThe)
      .input('phuongXa', sql.NVarChar, phuongXa)
      .input('quanHuyen', sql.NVarChar, quanHuyen)
      .input('tinhThanh', sql.NVarChar, tinhThanh)
      .input('laMacDinh', sql.Bit, laMacDinh ? 1 : 0)
      .query(`
        INSERT INTO DiaChiGiaoHang (MaNguoiDung, TenNguoiNhan, SDTNguoiNhan, 
          DiaChiCuThe, PhuongXa, QuanHuyen, TinhThanh, LaMacDinh)
        VALUES (@userId, @tenNguoiNhan, @sdtNguoiNhan, @diaChiCuThe, 
          @phuongXa, @quanHuyen, @tinhThanh, @laMacDinh)
        SELECT @@IDENTITY as MaDiaChi
      `);

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      addressId: result.recordset[0].MaDiaChi
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const notifications = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT TOP 50 * FROM ThongBao 
        WHERE MaNguoiDung = @userId 
        ORDER BY NgayTao DESC
      `);

    res.json({ success: true, data: notifications.recordset });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update delivery address
router.put('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { tenNguoiNhan, sdtNguoiNhan, diaChiCuThe, phuongXa, quanHuyen, tinhThanh, laMacDinh } = req.body;
    const pool = await getPool();

    // Kiểm tra quyền sở hữu
    const checkOwner = await pool
      .request()
      .input('addressId', sql.Int, addressId)
      .input('userId', sql.Int, req.userId)
      .query('SELECT MaDiaChi FROM DiaChiGiaoHang WHERE MaDiaChi = @addressId AND MaNguoiDung = @userId');

    if (checkOwner.recordset.length === 0) {
      return res.status(403).json({ success: false, message: 'Không có quyền cập nhật địa chỉ này' });
    }

    // Nếu set làm mặc định, bỏ mặc định các địa chỉ khác
    if (laMacDinh) {
      await pool
        .request()
        .input('userId', sql.Int, req.userId)
        .query('UPDATE DiaChiGiaoHang SET LaMacDinh = 0 WHERE MaNguoiDung = @userId');
    }

    await pool
      .request()
      .input('addressId', sql.Int, addressId)
      .input('tenNguoiNhan', sql.NVarChar, tenNguoiNhan)
      .input('sdtNguoiNhan', sql.NVarChar, sdtNguoiNhan)
      .input('diaChiCuThe', sql.NVarChar, diaChiCuThe)
      .input('phuongXa', sql.NVarChar, phuongXa)
      .input('quanHuyen', sql.NVarChar, quanHuyen)
      .input('tinhThanh', sql.NVarChar, tinhThanh)
      .input('laMacDinh', sql.Bit, laMacDinh ? 1 : 0)
      .query(`
        UPDATE DiaChiGiaoHang
        SET TenNguoiNhan = @tenNguoiNhan, SDTNguoiNhan = @sdtNguoiNhan,
            DiaChiCuThe = @diaChiCuThe, PhuongXa = @phuongXa,
            QuanHuyen = @quanHuyen, TinhThanh = @tinhThanh, LaMacDinh = @laMacDinh
        WHERE MaDiaChi = @addressId
      `);

    res.json({ success: true, message: 'Cập nhật địa chỉ thành công' });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete delivery address
router.delete('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const pool = await getPool();

    // Kiểm tra quyền sở hữu
    const checkOwner = await pool
      .request()
      .input('addressId', sql.Int, addressId)
      .input('userId', sql.Int, req.userId)
      .query('SELECT MaDiaChi, LaMacDinh FROM DiaChiGiaoHang WHERE MaDiaChi = @addressId AND MaNguoiDung = @userId');

    if (checkOwner.recordset.length === 0) {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa địa chỉ này' });
    }

    const wasDefault = checkOwner.recordset[0].LaMacDinh;

    await pool
      .request()
      .input('addressId', sql.Int, addressId)
      .query('DELETE FROM DiaChiGiaoHang WHERE MaDiaChi = @addressId');

    // Nếu xóa địa chỉ mặc định, set địa chỉ đầu tiên làm mặc định
    if (wasDefault) {
      await pool
        .request()
        .input('userId', sql.Int, req.userId)
        .query(`
          UPDATE DiaChiGiaoHang
          SET LaMacDinh = 1
          WHERE MaDiaChi = (
            SELECT TOP 1 MaDiaChi FROM DiaChiGiaoHang
            WHERE MaNguoiDung = @userId
            ORDER BY MaDiaChi ASC
          )
        `);
    }

    res.json({ success: true, message: 'Xóa địa chỉ thành công' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Set default address
router.put('/addresses/:addressId/set-default', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const pool = await getPool();

    // Kiểm tra quyền sở hữu
    const checkOwner = await pool
      .request()
      .input('addressId', sql.Int, addressId)
      .input('userId', sql.Int, req.userId)
      .query('SELECT MaDiaChi FROM DiaChiGiaoHang WHERE MaDiaChi = @addressId AND MaNguoiDung = @userId');

    if (checkOwner.recordset.length === 0) {
      return res.status(403).json({ success: false, message: 'Không có quyền thao tác địa chỉ này' });
    }

    // Bỏ mặc định tất cả địa chỉ
    await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query('UPDATE DiaChiGiaoHang SET LaMacDinh = 0 WHERE MaNguoiDung = @userId');

    // Set địa chỉ này làm mặc định
    await pool
      .request()
      .input('addressId', sql.Int, addressId)
      .query('UPDATE DiaChiGiaoHang SET LaMacDinh = 1 WHERE MaDiaChi = @addressId');

    res.json({ success: true, message: 'Đã đặt làm địa chỉ mặc định' });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { matKhauCu, matKhauMoi } = req.body;
    const pool = await getPool();

    if (!matKhauCu || !matKhauMoi) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    if (matKhauMoi.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Lấy mật khẩu hiện tại
    const userResult = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query('SELECT MatKhau FROM NguoiDung WHERE MaNguoiDung = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(matKhauCu, userResult.recordset[0].MatKhau);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Mật khẩu cũ không đúng' });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(matKhauMoi, 10);

    await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('matKhau', sql.NVarChar, hashedPassword)
      .query('UPDATE NguoiDung SET MatKhau = @matKhau, NgayCapNhat = GETDATE() WHERE MaNguoiDung = @userId');

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get membership info
router.get('/membership', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();

    // Lấy thông tin user và hạng thành viên
    const result = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT 
          nd.DiemTichLuy,
          nd.MaHang,
          hv.TenHang,
          hv.DiemToiThieu,
          hv.PhanTramGiamGia,
          (SELECT TOP 1 TenHang FROM HangThanhVien 
           WHERE DiemToiThieu > nd.DiemTichLuy 
           ORDER BY DiemToiThieu ASC) as HangTiepTheo,
          (SELECT TOP 1 DiemToiThieu FROM HangThanhVien 
           WHERE DiemToiThieu > nd.DiemTichLuy 
           ORDER BY DiemToiThieu ASC) as DiemCanThietHangTiepTheo
        FROM NguoiDung nd
        LEFT JOIN HangThanhVien hv ON nd.MaHang = hv.MaHang
        WHERE nd.MaNguoiDung = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin' });
    }

    const data = result.recordset[0];
    const diemCanDe = data.DiemCanThietHangTiepTheo
      ? data.DiemCanThietHangTiepTheo - data.DiemTichLuy
      : 0;

    res.json({
      success: true,
      data: {
        diemHienTai: data.DiemTichLuy,
        hangHienTai: data.TenHang || 'Thành viên mới',
        phanTramGiamGia: data.PhanTramGiamGia || 0,
        hangTiepTheo: data.HangTiepTheo || null,
        diemCanDe: diemCanDe
      }
    });
  } catch (error) {
    console.error('Get membership error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all membership levels
router.get('/membership/levels', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query('SELECT * FROM HangThanhVien ORDER BY DiemToiThieu ASC');

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Get membership levels error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const pool = await getPool();

    await pool
      .request()
      .input('notificationId', sql.Int, notificationId)
      .input('userId', sql.Int, req.userId)
      .query('UPDATE ThongBao SET DaDoc = 1 WHERE MaThongBao = @notificationId AND MaNguoiDung = @userId');

    res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();

    await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query('UPDATE ThongBao SET DaDoc = 1 WHERE MaNguoiDung = @userId AND DaDoc = 0');

    res.json({ success: true, message: 'Đã đánh dấu tất cả đã đọc' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete notification
router.delete('/notifications/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const pool = await getPool();

    await pool
      .request()
      .input('notificationId', sql.Int, notificationId)
      .input('userId', sql.Int, req.userId)
      .query('DELETE FROM ThongBao WHERE MaThongBao = @notificationId AND MaNguoiDung = @userId');

    res.json({ success: true, message: 'Đã xóa thông báo' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get unread notification count
router.get('/notifications/unread-count', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query('SELECT COUNT(*) as count FROM ThongBao WHERE MaNguoiDung = @userId AND DaDoc = 0');

    res.json({ success: true, count: result.recordset[0].count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
