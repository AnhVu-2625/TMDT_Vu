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

// Mark notification as read
router.put('/notifications/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const pool = await getPool();

    await pool
      .request()
      .input('notificationId', sql.Int, notificationId)
      .query('UPDATE ThongBao SET DaDoc = 1 WHERE MaThongBao = @notificationId');

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
