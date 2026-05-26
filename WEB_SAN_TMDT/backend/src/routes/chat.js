const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get chat rooms
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const rooms = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT pc.*, ch.TenCuaHang, nd.HoTen
        FROM PhongChat pc
        JOIN CuaHang ch ON pc.MaCuaHang = ch.MaCuaHang
        JOIN NguoiDung nd ON ch.MaNguoiDung = nd.MaNguoiDung
        WHERE pc.MaNguoiDung = @userId
        ORDER BY pc.ThoiGianNhanTinCuoi DESC
      `);

    res.json({ success: true, data: rooms.recordset });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get messages in a room
router.get('/rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const pool = await getPool();

    const messages = await pool
      .request()
      .input('roomId', sql.Int, roomId)
      .query(`
        SELECT * FROM TinNhanChat 
        WHERE MaPhongChat = @roomId
        ORDER BY NgayTao ASC
      `);

    res.json({ success: true, data: messages.recordset });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send message
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { maPhongChat, noiDung } = req.body;
    const pool = await getPool();

    if (!maPhongChat || !noiDung) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await pool
      .request()
      .input('maPhongChat', sql.Int, maPhongChat)
      .input('noiDung', sql.NVarChar, noiDung)
      .query(`
        INSERT INTO TinNhanChat (MaPhongChat, NguoiGui, NoiDung)
        VALUES (@maPhongChat, N'NGUOI_MUA', @noiDung)
        SELECT @@IDENTITY as MaTinNhan
      `);

    res.status(201).json({
      success: true,
      message: 'Message sent',
      messageId: result.recordset[0].MaTinNhan
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
