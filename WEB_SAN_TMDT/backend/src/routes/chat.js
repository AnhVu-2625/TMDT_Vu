const express = require('express');
const multer = require('multer');
const path = require('path');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// File upload config for chat
const chatUploadDir = path.join(__dirname, '..', '..', 'uploads', 'chat');
const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    if (!fs.existsSync(chatUploadDir)) fs.mkdirSync(chatUploadDir, { recursive: true });
    cb(null, chatUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `chat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`);
  }
});
const chatUpload = multer({
  storage: chatStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|bmp|pdf|docx|xlsx|zip|rar|txt)$/i;
    if (allowed.test(file.originalname)) cb(null, true);
    else cb(new Error('File type not allowed'));
  }
});

// Migration: Thêm cột DaDoc nếu chưa có
async function ensureDaDocColumn() {
  try {
    const pool = await getPool();
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'TinNhanChat') AND name = 'DaDoc')
      BEGIN
        ALTER TABLE TinNhanChat ADD DaDoc BIT DEFAULT 0
      END
    `);
    console.log('✅ DaDoc column ensured on TinNhanChat');
  } catch (e) {}
}
ensureDaDocColumn();

// Migration: Thêm cột MaSanPham vào PhongChat nếu chưa có
async function ensureMaSanPhamColumn() {
  try {
    const pool = await getPool();
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'PhongChat') AND name = 'MaSanPham')
      BEGIN
        ALTER TABLE PhongChat ADD MaSanPham INT NULL
      END
    `);
    console.log('✅ MaSanPham column ensured on PhongChat');
  } catch (e) {
    console.error('⚠️ MaSanPham migration error:', e.message);
  }
}
setTimeout(() => ensureMaSanPhamColumn(), 3000);

// Helper: lấy admin user đầu tiên cho support chat
async function getAdminUser(pool) {
  const admin = await pool.request()
    .query(`SELECT TOP 1 MaNguoiDung, HoTen, Email, SoDienThoai FROM NguoiDung WHERE VaiTro = N'QUAN_TRI_VIEN' ORDER BY MaNguoiDung`);
  return admin.recordset[0] || null;
}

// Get chat rooms với unread count, last message, partner role
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { type } = req.query; // 'shop', 'support', or undefined = all

    let typeFilter = '';
    if (type === 'shop') {
      typeFilter = `AND (pc.LoaiPhong IS NULL OR pc.LoaiPhong = N'USER_SHOP')`;
    } else if (type === 'support') {
      typeFilter = `AND pc.LoaiPhong = N'USER_USER' AND nd1.VaiTro = N'QUAN_TRI_VIEN'`;
    }

    const rooms = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT pc.*, 
          CASE 
            WHEN pc.LoaiPhong IS NULL THEN ch.TenCuaHang
            WHEN pc.LoaiPhong = N'USER_SHOP' THEN ch.TenCuaHang
            WHEN pc.LoaiPhong = N'USER_USER' AND pc.MaNguoiDung = @userId THEN nd2.HoTen
            ELSE nd1.HoTen
          END AS TenDoiTac,
          CASE
            WHEN pc.LoaiPhong IS NULL THEN nd0.SoDienThoai
            WHEN pc.LoaiPhong = N'USER_SHOP' THEN nd0.SoDienThoai
            WHEN pc.LoaiPhong = N'USER_USER' AND pc.MaNguoiDung = @userId THEN nd2.SoDienThoai
            ELSE nd1.SoDienThoai
          END AS SDTDoiTac,
          CASE
            WHEN pc.LoaiPhong IS NULL THEN nd0.MaNguoiDung
            WHEN pc.LoaiPhong = N'USER_SHOP' THEN nd0.MaNguoiDung
            WHEN pc.LoaiPhong = N'USER_USER' AND pc.MaNguoiDung = @userId THEN nd2.MaNguoiDung
            ELSE nd1.MaNguoiDung
          END AS MaDoiTac,
          CASE
            WHEN pc.LoaiPhong IS NULL THEN nd0.VaiTro
            WHEN pc.LoaiPhong = N'USER_SHOP' THEN nd0.VaiTro
            WHEN pc.LoaiPhong = N'USER_USER' AND pc.MaNguoiDung = @userId THEN nd2.VaiTro
            ELSE nd1.VaiTro
          END AS VaiTroDoiTac,
          sp.MaSanPham AS MaSanPhamChat,
          sp.TenSanPham AS TenSanPhamChat,
          sp.GiaGoc AS GiaSanPhamChat,
          (SELECT TOP 1 DuongDanAnh FROM HinhAnhSanPham WHERE MaSanPham = sp.MaSanPham AND LaAnhChinh = 1) AS AnhSanPhamChat,
          (SELECT COUNT(*) FROM TinNhanChat tc 
           WHERE tc.MaPhongChat = pc.MaPhongChat 
           AND ((pc.MaNguoiDung = @userId AND tc.NguoiGui = N'NGUOI_BAN') OR (pc.MaNguoiNhan = @userId AND tc.NguoiGui = N'NGUOI_MUA'))
           AND (tc.DaDoc IS NULL OR tc.DaDoc = 0)) AS SoTinChuaDoc,
          (SELECT TOP 1 NoiDung FROM TinNhanChat tc WHERE tc.MaPhongChat = pc.MaPhongChat ORDER BY NgayTao DESC) AS TinNhanCuoi,
          (SELECT TOP 1 NgayTao FROM TinNhanChat tc WHERE tc.MaPhongChat = pc.MaPhongChat ORDER BY NgayTao DESC) AS ThoiGianTinCuoi
        FROM PhongChat pc
        LEFT JOIN CuaHang ch ON pc.MaCuaHang = ch.MaCuaHang
        LEFT JOIN NguoiDung nd0 ON ch.MaNguoiDung = nd0.MaNguoiDung
        LEFT JOIN NguoiDung nd1 ON pc.MaNguoiDung = nd1.MaNguoiDung
        LEFT JOIN NguoiDung nd2 ON pc.MaNguoiNhan = nd2.MaNguoiDung
        LEFT JOIN SanPham sp ON pc.MaSanPham = sp.MaSanPham
        WHERE (pc.MaNguoiDung = @userId OR pc.MaNguoiNhan = @userId
               OR (pc.LoaiPhong = N'USER_SHOP' AND EXISTS (SELECT 1 FROM CuaHang ch2 WHERE ch2.MaCuaHang = pc.MaCuaHang AND ch2.MaNguoiDung = @userId)))
          ${typeFilter}
        ORDER BY ISNULL(pc.ThoiGianNhanTinCuoi, '1900-01-01') DESC
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

// Đánh dấu tin nhắn đã đọc
router.put('/rooms/:roomId/read', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const pool = await getPool();
    const room = await pool
      .request()
      .input('roomId', sql.Int, roomId)
      .query('SELECT * FROM PhongChat WHERE MaPhongChat = @roomId');
    if (room.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const phong = room.recordset[0];
    let nguoiGuiDoiTac;
    if (phong.LoaiPhong === 'USER_USER') {
      nguoiGuiDoiTac = phong.MaNguoiDung === req.userId ? 'NGUOI_BAN' : 'NGUOI_MUA';
    } else {
      const shopOwner = await pool
        .request()
        .input('maCuaHang', sql.Int, phong.MaCuaHang)
        .query('SELECT MaNguoiDung FROM CuaHang WHERE MaCuaHang = @maCuaHang');
      nguoiGuiDoiTac = (shopOwner.recordset[0]?.MaNguoiDung === req.userId) ? 'NGUOI_MUA' : 'NGUOI_BAN';
    }
    await pool
      .request()
      .input('roomId', sql.Int, roomId)
      .input('nguoiGui', sql.NVarChar, nguoiGuiDoiTac)
      .query(`
        UPDATE TinNhanChat SET DaDoc = 1
        WHERE MaPhongChat = @roomId AND NguoiGui = @nguoiGui AND (DaDoc IS NULL OR DaDoc = 0)
      `);
    const io = req.app.get('io');
    io.to(`chat_${roomId}`).emit('messages_seen', {
      roomId, seenBy: req.userId, seenAt: new Date().toISOString()
    });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Search user by phone
router.get('/users/search', authenticateToken, async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ success: false, message: 'Vui long nhap so dien thoai' });
    const pool = await getPool();
    const searchTerm = '%' + phone.trim() + '%';
    const users = await pool
      .request()
      .input('phone', sql.NVarChar, searchTerm)
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT MaNguoiDung, HoTen, Email, SoDienThoai, VaiTro
        FROM NguoiDung
        WHERE SoDienThoai LIKE @phone AND MaNguoiDung <> @userId
      `);
    res.json({ success: true, data: users.recordset });
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Tạo phòng support chat (USER_USER với admin)
router.post('/support/start', authenticateToken, async (req, res) => {
  try {
    const { loiNhan } = req.body;
    const pool = await getPool();
    const admin = await getAdminUser(pool);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Chua co admin ho tro' });
    }

    // Kiểm tra phòng đã tồn tại
    const existing = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('adminId', sql.Int, admin.MaNguoiDung)
      .query(`
        SELECT MaPhongChat FROM PhongChat 
        WHERE ((MaNguoiDung = @userId AND MaNguoiNhan = @adminId) OR (MaNguoiDung = @adminId AND MaNguoiNhan = @userId))
          AND LoaiPhong = N'USER_USER'
      `);

    if (existing.recordset.length > 0) {
      return res.json({ success: true, data: { MaPhongChat: existing.recordset[0].MaPhongChat, exists: true } });
    }

    const room = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('adminId', sql.Int, admin.MaNguoiDung)
      .query(`
        INSERT INTO PhongChat (MaNguoiDung, MaCuaHang, LoaiPhong, MaNguoiNhan, TrangThai)
        VALUES (@userId, NULL, N'USER_USER', @adminId, N'DA_CHAP_NHAN')
        SELECT @@IDENTITY as MaPhongChat
      `);

    const roomId = room.recordset[0].MaPhongChat;
    const io = req.app.get('io');

    // Gửi tin nhắn đầu tiên (luôn có)
    const welcomeMsg = loiNhan && loiNhan.trim() ? loiNhan : 'Xin chào, tôi cần hỗ trợ';
    const msgResult = await pool
      .request()
      .input('maPhongChat', sql.Int, roomId)
      .input('noiDung', sql.NVarChar, welcomeMsg)
      .query(`
        INSERT INTO TinNhanChat (MaPhongChat, NguoiGui, NoiDung)
        VALUES (@maPhongChat, N'NGUOI_MUA', @noiDung)
        SELECT @@IDENTITY as MaTinNhan
      `);

    const msgEvent = {
      MaTinNhan: msgResult.recordset[0].MaTinNhan,
      MaPhongChat: roomId,
      NguoiGui: 'NGUOI_MUA',
      NoiDung: welcomeMsg,
      NgayTao: new Date().toISOString(),
      DaDoc: false
    };
    io.to(`chat_${roomId}`).emit('receive_message', msgEvent);
    io.to(`user_${req.userId}`).emit('receive_message', msgEvent);
    io.to(`user_${admin.MaNguoiDung}`).emit('receive_message', msgEvent);
    io.to(`user_${admin.MaNguoiDung}`).emit('new_room', { roomId });

    res.status(201).json({ success: true, data: { MaPhongChat: roomId, exists: false } });
  } catch (error) {
    console.error('Create support room error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Tạo / lấy phòng USER_SHOP chat với cửa hàng (từ trang sản phẩm)
router.post('/shop/start', authenticateToken, async (req, res) => {
  try {
    const { loiNhan, maCuaHang, maSanPham } = req.body;
    if (!maCuaHang) {
      return res.status(400).json({ success: false, message: 'Thieu maCuaHang' });
    }
    const parsedMaCH = parseInt(maCuaHang, 10);
    if (isNaN(parsedMaCH)) {
      return res.status(400).json({ success: false, message: 'maCuaHang khong hop le' });
    }

    const pool = await getPool();

    // Lấy chủ cửa hàng
    const shop = await pool.request()
      .input('maCuaHang', sql.Int, parsedMaCH)
      .query('SELECT MaNguoiDung FROM CuaHang WHERE MaCuaHang = @maCuaHang');
    if (shop.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Khong tim thay cua hang' });
    }
    const shopOwnerId = shop.recordset[0].MaNguoiDung;

    const parsedMaSP = maSanPham ? parseInt(maSanPham, 10) : null;

    // Kiểm tra phòng đã tồn tại
    const existing = await pool.request()
      .input('maCuaHang', sql.Int, parsedMaCH)
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT MaPhongChat FROM PhongChat
        WHERE MaCuaHang = @maCuaHang AND MaNguoiDung = @userId
      `);

    if (existing.recordset.length > 0) {
      const existingRoomId = existing.recordset[0].MaPhongChat;
      if (parsedMaSP) {
        await pool.request()
          .input('maPhongChat', sql.Int, existingRoomId)
          .input('maSanPham', sql.Int, parsedMaSP)
          .query('UPDATE PhongChat SET MaSanPham = @maSanPham WHERE MaPhongChat = @maPhongChat AND MaSanPham IS NULL');
      }
      return res.json({ success: true, data: { MaPhongChat: existingRoomId, exists: true } });
    }

    const room = await pool.request()
      .input('maCuaHang', sql.Int, parsedMaCH)
      .input('userId', sql.Int, req.userId)
      .input('maSanPham', sql.Int, parsedMaSP)
      .query(`
        INSERT INTO PhongChat (MaNguoiDung, MaCuaHang, LoaiPhong, MaNguoiNhan, TrangThai, MaSanPham)
        VALUES (@userId, @maCuaHang, N'USER_SHOP', @userId, N'DA_CHAP_NHAN', @maSanPham)
        SELECT @@IDENTITY as MaPhongChat
      `);

    const roomId = room.recordset[0].MaPhongChat;
    const io = req.app.get('io');

    // Lấy thông tin sản phẩm để gửi qua socket
    let productInfo = {};
    if (parsedMaSP) {
      const sp = await pool.request()
        .input('maSP', sql.Int, parsedMaSP)
        .query(`SELECT MaSanPham, TenSanPham, GiaGoc, (SELECT TOP 1 DuongDanAnh FROM HinhAnhSanPham WHERE MaSanPham = @maSP AND LaAnhChinh = 1) AS AnhChinh FROM SanPham WHERE MaSanPham = @maSP`);
      if (sp.recordset.length > 0) {
        productInfo = sp.recordset[0];
      }
    }

    // Gửi tin nhắn đầu tiên (luôn có)
    const autoMsg = loiNhan && loiNhan.trim() ? loiNhan : 'Xin chào, tôi quan tâm đến sản phẩm của cửa hàng';
    const msgResult = await pool.request()
      .input('maPhongChat', sql.Int, roomId)
      .input('noiDung', sql.NVarChar, autoMsg)
      .query(`
        INSERT INTO TinNhanChat (MaPhongChat, NguoiGui, NoiDung)
        VALUES (@maPhongChat, N'NGUOI_MUA', @noiDung)
        SELECT @@IDENTITY as MaTinNhan
      `);

    const msgEvent = {
      MaTinNhan: msgResult.recordset[0].MaTinNhan,
      MaPhongChat: roomId,
      NguoiGui: 'NGUOI_MUA',
      NoiDung: autoMsg,
      NgayTao: new Date().toISOString(),
      DaDoc: false
    };
    io.to(`chat_${roomId}`).emit('receive_message', msgEvent);
    io.to(`user_${req.userId}`).emit('receive_message', msgEvent);
    io.to(`user_${shopOwnerId}`).emit('receive_message', msgEvent);
    io.to(`user_${shopOwnerId}`).emit('new_room', { roomId, productInfo });

    res.status(201).json({ success: true, data: { MaPhongChat: roomId, exists: false, productInfo } });
  } catch (error) {
    console.error('Create shop room error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Tạo phòng chat với user khác (USER_USER), gửi tin nhắn đầu tiên
router.post('/rooms/start', authenticateToken, async (req, res) => {
  try {
    const { maNguoiNhan, loiNhan } = req.body;
    if (!maNguoiNhan) {
      return res.status(400).json({ success: false, message: 'Thieu maNguoiNhan' });
    }
    const pool = await getPool();

    const existing = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('maNguoiNhan', sql.Int, maNguoiNhan)
      .query(`
        SELECT MaPhongChat FROM PhongChat
        WHERE ((MaNguoiDung = @userId AND MaNguoiNhan = @maNguoiNhan) OR (MaNguoiDung = @maNguoiNhan AND MaNguoiNhan = @userId))
          AND (LoaiPhong IS NULL OR LoaiPhong = N'USER_USER')
      `);

    if (existing.recordset.length > 0) {
      return res.json({ success: true, data: { MaPhongChat: existing.recordset[0].MaPhongChat, exists: true } });
    }

    const room = await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('maNguoiNhan', sql.Int, maNguoiNhan)
      .query(`
        INSERT INTO PhongChat (MaNguoiDung, MaCuaHang, LoaiPhong, MaNguoiNhan, TrangThai)
        VALUES (@userId, NULL, N'USER_USER', @maNguoiNhan, N'DA_CHAP_NHAN')
        SELECT @@IDENTITY as MaPhongChat
      `);

    const roomId = room.recordset[0].MaPhongChat;
    const io = req.app.get('io');

    // Gửi tin nhắn đầu tiên (nếu có)
    if (loiNhan && loiNhan.trim()) {
      const msgResult = await pool
        .request()
        .input('maPhongChat', sql.Int, roomId)
        .input('noiDung', sql.NVarChar, loiNhan)
        .query(`
          INSERT INTO TinNhanChat (MaPhongChat, NguoiGui, NoiDung)
          VALUES (@maPhongChat, N'NGUOI_MUA', @noiDung)
          SELECT @@IDENTITY as MaTinNhan
        `);

      const msgEvent = {
        MaTinNhan: msgResult.recordset[0].MaTinNhan,
        MaPhongChat: roomId,
        NguoiGui: 'NGUOI_MUA',
        NoiDung: loiNhan,
        NgayTao: new Date().toISOString(),
        DaDoc: false
      };
      io.to(`chat_${roomId}`).emit('receive_message', msgEvent);
      io.to(`user_${maNguoiNhan}`).emit('receive_message', msgEvent);
    }

    io.to(`user_${maNguoiNhan}`).emit('new_room', { roomId });
    res.status(201).json({ success: true, data: { MaPhongChat: roomId, exists: false } });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Accept room
router.put('/rooms/:roomId/accept', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const pool = await getPool();
    const room = await pool
      .request()
      .input('roomId', sql.Int, roomId)
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT * FROM PhongChat WHERE MaPhongChat = @roomId AND MaNguoiNhan = @userId AND LoaiPhong = N'USER_USER'
      `);
    if (room.recordset.length === 0) return res.status(403).json({ success: false, message: 'Khong co quyen' });
    await pool.request().input('roomId', sql.Int, roomId).query(`UPDATE PhongChat SET TrangThai = N'DA_CHAP_NHAN' WHERE MaPhongChat = @roomId`);
    const io = req.app.get('io');
    io.to(`chat_${roomId}`).emit('room_accepted', { roomId });
    io.to(`user_${room.recordset[0].MaNguoiDung}`).emit('room_accepted', { roomId });
    res.json({ success: true, message: 'Da chap nhan' });
  } catch (error) {
    console.error('Accept error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject room
router.put('/rooms/:roomId/reject', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const pool = await getPool();
    const room = await pool
      .request()
      .input('roomId', sql.Int, roomId)
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT * FROM PhongChat WHERE MaPhongChat = @roomId AND MaNguoiNhan = @userId AND LoaiPhong = N'USER_USER'
      `);
    if (room.recordset.length === 0) return res.status(403).json({ success: false, message: 'Khong co quyen' });
    await pool.request().input('roomId', sql.Int, roomId).query(`UPDATE PhongChat SET TrangThai = N'DA_TU_CHOI' WHERE MaPhongChat = @roomId`);
    const io = req.app.get('io');
    io.to(`chat_${roomId}`).emit('room_rejected', { roomId });
    io.to(`user_${room.recordset[0].MaNguoiDung}`).emit('room_rejected', { roomId });
    res.json({ success: true, message: 'Da tu choi' });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send message
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { maPhongChat, noiDung } = req.body;
    if (!maPhongChat || !noiDung) return res.status(400).json({ success: false, message: 'Missing fields' });

    const pool = await getPool();
    const room = await pool.request()
      .input('roomId', sql.Int, maPhongChat)
      .query('SELECT * FROM PhongChat WHERE MaPhongChat = @roomId');
    if (room.recordset.length === 0) return res.status(404).json({ success: false, message: 'Room not found' });

    const phong = room.recordset[0];

    if (phong.LoaiPhong === 'USER_USER' && phong.TrangThai === 'CHO_CHAP_NHAN') {
      if (phong.MaNguoiDung !== req.userId) {
        return res.status(403).json({ success: false, message: 'Vui long cho chap nhan' });
      }
    }

    let nguoiGui = 'NGUOI_MUA';
    if (phong.LoaiPhong === 'USER_USER') {
      if (phong.MaNguoiNhan === req.userId) nguoiGui = 'NGUOI_BAN';
    } else {
      const shopOwner = await pool.request()
        .input('maCuaHang', sql.Int, phong.MaCuaHang)
        .query('SELECT MaNguoiDung FROM CuaHang WHERE MaCuaHang = @maCuaHang');
      if (shopOwner.recordset.length > 0 && shopOwner.recordset[0].MaNguoiDung === req.userId) {
        nguoiGui = 'NGUOI_BAN';
      }
    }

    const result = await pool.request()
      .input('maPhongChat', sql.Int, maPhongChat)
      .input('nguoiGui', sql.NVarChar, nguoiGui)
      .input('noiDung', sql.NVarChar, noiDung)
      .query(`
        INSERT INTO TinNhanChat (MaPhongChat, NguoiGui, NoiDung)
        VALUES (@maPhongChat, @nguoiGui, @noiDung)
        SELECT @@IDENTITY as MaTinNhan
      `);

    await pool.request()
      .input('roomId', sql.Int, maPhongChat)
      .query('UPDATE PhongChat SET ThoiGianNhanTinCuoi = GETDATE() WHERE MaPhongChat = @roomId');

    const io = req.app.get('io');
    const msgData = {
      MaTinNhan: result.recordset[0].MaTinNhan,
      MaPhongChat: maPhongChat,
      NguoiGui: nguoiGui,
      NoiDung: noiDung,
      NgayTao: new Date().toISOString(),
      DaDoc: false
    };
    io.to(`chat_${maPhongChat}`).emit('receive_message', msgData);

    // Chatbot auto-reply cho USER_SHOP rooms khi người mua gửi tin nhắn
    if (nguoiGui === 'NGUOI_MUA' && (phong.LoaiPhong === 'USER_SHOP' || phong.LoaiPhong === null)) {
      const lower = noiDung.toLowerCase();
      let replies = null;

      const hangReplies = [
        'Cảm ơn bạn đã quan tâm! Hiện tại sản phẩm vẫn còn hàng nhé. Số lượng có hạn, bạn đặt ngay để không bỏ lỡ ạ!',
        'Dạ, sản phẩm vẫn còn hàng bạn ơi! Bạn muốn đặt bao nhiêu để shop check số lượng tồn giúp bạn?',
        'Sản phẩm còn hàng bạn nhé! Shop đang có chương trình giảm giá cho đơn hàng đầu tiên nữa đó ạ.',
        'Còn hàng bạn ơi! Bạn cần shop tư vấn thêm gì về sản phẩm không ạ?',
        'Vẫn còn hàng bạn nha! Số lượng đang được shop nhập thêm liên tục. Bạn đặt trước để được ưu tiên giao sớm nhé!',
      ];
      const shipReplies = [
        'Shop hỗ trợ giao hàng toàn quốc nha bạn! Phí ship được tính theo địa chỉ nhận hàng. Đơn trên 200k được miễn phí vận chuyển.',
        'Dạ, shop giao hàng tận nơi trên toàn quốc ạ. Thời gian giao hàng từ 2-5 ngày tùy khu vực bạn nhé.',
        'Shop có giao hàng bạn ơi! Hiện tại đang free ship cho đơn từ 150k trở lên nè.',
        'Giao hàng toàn quốc bạn nhé! COD cũng được chấp nhận. Bạn cứ đặt hàng, shop sẽ xác nhận nhanh chóng.',
        'Có giao hàng tận nơi bạn ạ! Nội thành giao trong 24h, ngoại thành 2-3 ngày. Miễn phí ship cho đơn trên 200k!',
      ];
      const priceReplies = [
        'Bạn có thể trao đổi trực tiếp với shop để thương lượng giá nhé. Shop luôn có ưu đãi cho khách hàng mua sỉ hoặc mua lần đầu!',
        'Giá hiện tại đã là giá tốt nhất rồi bạn ơi. Nhưng bạn để lại SĐT, shop sẽ gửi thêm voucher giảm giá cho bạn nhé!',
        'Dạ, giá có thể thương lượng ạ. Nếu bạn mua từ 2 sản phẩm trở lên, shop sẽ giảm thêm 5% đó!',
        'Shop sẵn sàng hỗ trợ giá tốt nhất cho bạn. Bạn inbox trực tiếp cho shop qua chat để thương lượng chi tiết nhé!',
        'Giá niêm yết đã là ưu đãi nhất rồi ạ. Tuy nhiên shop có thêm quà tặng kèm cho đơn hàng hôm nay nha!',
      ];
      const buyReplies = [
        'Cảm ơn bạn đã quan tâm! Bạn vui lòng đặt hàng trực tiếp trên website, shop sẽ xác nhận và giao hàng sớm nhất có thể nhé!',
        'Dạ, bạn muốn mua sản phẩm này ạ? Bạn bấm "Đặt hàng" trên trang sản phẩm hoặc để lại địa chỉ, shop sẽ gửi hàng ngay!',
        'Cảm ơn bạn! Nếu bạn cần tư vấn thêm về kích thước, màu sắc trước khi đặt, shop sẵn sàng hỗ trợ ạ.',
        'Bạn có thể đặt hàng online ngay trên website. Shop sẽ gọi xác nhận đơn hàng trong vòng 30 phút tới nhé!',
        'Đặt hàng giúp shop bạn nha! Shop sẽ ưu tiên xử lý đơn của bạn và giao hàng nhanh nhất có thể!',
      ];
      const mauSacReplies = [
        'Sản phẩm có nhiều màu sắc để bạn lựa chọn nha! Bạn xem thêm trên trang sản phẩm để thấy đầy đủ các màu nhé.',
        'Hiện tại shop còn các màu: trắng, đen, xanh dương, hồng. Bạn thích màu nào để shop tư vấn thêm ạ?',
        'Dạ, sản phẩm có nhiều phiên bản màu sắc khác nhau. Bạn vào trang sản phẩm chọn màu mong muốn rồi đặt hàng nha!',
        'Còn nhiều màu bạn ơi! Shop có đủ màu cơ bản. Nếu bạn cần màu đặc biệt, shop có thể order thêm trong 3-5 ngày.',
      ];
      const baoHanhReplies = [
        'Sản phẩm được bảo hành chính hãng 12 tháng bạn nha! Trong thời gian bảo hành, shop hỗ trợ đổi trả miễn phí.',
        'Dạ, shop bảo hành 6 tháng cho lỗi nhà sản xuất. Ngoài ra shop có gói bảo hành mở rộng lên đến 24 tháng nữa ạ.',
        'Shop bảo hành 1 đổi 1 trong 30 ngày đầu nếu có lỗi từ nhà sản xuất. Sau đó bảo hành 12 tháng theo tiêu chuẩn.',
        'Sản phẩm có bảo hành đầy đủ bạn nhé! Shop hỗ trợ bảo hành tại shop hoặc gửi qua đường bưu điện, rất tiện lợi.',
      ];
      const diaChiReplies = [
        'Shop tọa lạc tại địa chỉ được đăng ký trên website. Bạn có thể đến trực tiếp xem sản phẩm trước khi mua nha!',
        'Hiện tại shop hoạt động online là chính bạn ạ. Nếu bạn cần xem hàng trực tiếp, hãy liên hệ trước để shop sắp xếp nhé!',
        'Shop có địa chỉ trên trang thông tin. Bạn có thể ghé thăm shop để xem và trải nghiệm sản phẩm trực tiếp trước khi quyết định mua hàng.',
        'Shop ở trong khu vực nội thành, rất thuận tiện cho việc giao hàng và nhận hàng trực tiếp. Bạn liên hệ shop qua SĐT để được chỉ đường cụ thể nhé!',
      ];
      const kichThuocReplies = [
        'Bạn tham khảo bảng size trên trang sản phẩm để chọn kích thước phù hợp nha! Shop có hướng dẫn đo size chi tiết đó ạ.',
        'Kích thước này phù hợp với đa số người dùng bạn ơi! Nếu bạn không chắc, shop có thể tư vấn dựa trên cân nặng và chiều cao của bạn.',
        'Dạ, shop có bảng size mẫu để bạn đối chiếu. Nếu vẫn không chắc, bạn cho shop xin số đo cụ thể, shop sẽ tư vấn size chính xác nhất!',
        'Sản phẩm có size từ M đến XXL. Nếu bạn cần size lớn hơn, shop có thể đặt hàng riêng trong vòng 7 ngày nha!',
      ];
      const otherReplies = [
        'Cảm ơn bạn đã quan tâm đến sản phẩm của shop! Shop sẽ phản hồi chi tiết ngay khi nhận được tin nhắn của bạn.',
        'Dạ, shop đã nhận được tin nhắn của bạn. Hiện tại shop đang kiểm tra thông tin, sẽ trả lời bạn trong ít phút nữa nhé!',
        'Cảm ơn bạn! Shop sẽ hỗ trợ bạn nhanh nhất có thể. Bạn vui lòng chờ chút xíu nha!',
      ];

      if (lower.includes('còn hàng') || lower.includes('con hang') || lower.includes('còn không') || lower.includes('con khong') || lower.includes('het hang') || lower.includes('hết hàng') || lower.includes('con ko')) {
        replies = hangReplies;
      } else if (lower.includes('giao hàng') || lower.includes('giao hang') || lower.includes('ship') || lower.includes('vận chuyển') || lower.includes('van chuyen') || lower.includes('free ship')) {
        replies = shipReplies;
      } else if (lower.includes('giá') || lower.includes('gia') || lower.includes('thương lượng') || lower.includes('thuong luong') || lower.includes('giảm') || lower.includes('giam') || lower.includes('bao nhiêu') || lower.includes('bao nhieu')) {
        replies = priceReplies;
      } else if (lower.includes('mua') || lower.includes('muốn mua') || lower.includes('muon mua') || lower.includes('đặt') || lower.includes('dat') || lower.includes('order')) {
        replies = buyReplies;
      } else if (lower.includes('màu') || lower.includes('mau sac') || lower.includes('màu sắc') || lower.includes('color') || lower.includes('trắng') || lower.includes('đen') || lower.includes('xanh') || lower.includes('đỏ') || lower.includes('hồng') || lower.includes('tím') || lower.includes('vàng')) {
        replies = mauSacReplies;
      } else if (lower.includes('bảo hành') || lower.includes('bao hanh') || lower.includes('đổi trả') || lower.includes('doi tra') || lower.includes('hoàn tiền') || lower.includes('hoan tien') || lower.includes('1 đổi 1')) {
        replies = baoHanhReplies;
      } else if (lower.includes('ở đâu') || lower.includes('o dau') || lower.includes('địa chỉ') || lower.includes('dia chi') || lower.includes('cửa hàng') || lower.includes('cua hang') || lower.includes('đến') || lower.includes('den') || lower.includes('đường') || lower.includes('duong')) {
        replies = diaChiReplies;
      } else if (lower.includes('kích thước') || lower.includes('kich thuoc') || lower.includes('size') || lower.includes('vừa') || lower.includes('vua') || lower.includes('lớn') || lower.includes('lon') || lower.includes('nhỏ') || lower.includes('nho') || lower.includes('cân') || lower.includes('can nang') || lower.includes('chiều cao') || lower.includes('chieu cao')) {
        replies = kichThuocReplies;
      } else if (lower.includes('xin chào') || lower.includes('xin chao') || lower.includes('hello') || lower.includes('chào') || lower.includes('chao') || lower.includes('hi') || lower.includes('helo')) {
        replies = otherReplies;
      }

      if (replies) {
        const botReply = replies[Math.floor(Math.random() * replies.length)];
        const typingDelay = 800 + Math.random() * 1200; // Thời gian "đang nhập" 0.8-2s

        // 1. Hiện typing indicator ngay lập tức
        io.to(`chat_${maPhongChat}`).emit('user_typing', {
          roomId: maPhongChat, userId: 999999, isTyping: true
        });

        // 2. Sau typingDelay, ẩn typing + gửi tin nhắn
        setTimeout(async () => {
          io.to(`chat_${maPhongChat}`).emit('user_typing', {
            roomId: maPhongChat, userId: 999999, isTyping: false
          });

          try {
            const p2 = await getPool();
            const botResult = await p2.request()
              .input('maPhongChat', sql.Int, maPhongChat)
              .input('noiDung', sql.NVarChar, botReply)
              .query(`
                INSERT INTO TinNhanChat (MaPhongChat, NguoiGui, NoiDung)
                VALUES (@maPhongChat, N'NGUOI_BAN', @noiDung)
                SELECT @@IDENTITY as MaTinNhan
              `);
            io.to(`chat_${maPhongChat}`).emit('receive_message', {
              MaTinNhan: botResult.recordset[0].MaTinNhan,
              MaPhongChat: maPhongChat,
              NguoiGui: 'NGUOI_BAN',
              NoiDung: botReply,
              NgayTao: new Date().toISOString(),
              DaDoc: false
            });
          } catch (e) {
            console.error('Bot reply error:', e.message);
          }
        }, typingDelay);
      }
    }

    res.status(201).json({ success: true, message: 'Sent', messageId: result.recordset[0].MaTinNhan });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Upload file cho chat (ảnh, tài liệu)
router.post('/upload', authenticateToken, (req, res) => {
  chatUpload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) return res.status(400).json({ success: false, message: err.message });
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'Khong co file' });
    const fileUrl = `/uploads/chat/${req.file.filename}`;
    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(req.file.originalname);
    res.json({ success: true, data: { url: fileUrl, name: req.file.originalname, isImage } });
  });
});

module.exports = router;
