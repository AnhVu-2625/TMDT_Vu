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

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.userId}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ được tải lên file ảnh!'));
    }
  }
});

// Upload avatar endpoint
router.post('/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh để tải lên' });
    }
    
    // Serve file URL
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Tải ảnh lên thành công',
      data: { url: fileUrl }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, message: 'Không thể tải ảnh lên' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { hoTen, ngaySinh, gioiTinh, anhDaiDien } = req.body;
    const pool = await getPool();

    // Validate birthdate to prevent SQL Server out-of-bounds date crashes (must be within 1900 - 2100)
    let formattedNgaySinh = null;
    if (ngaySinh) {
      const parsedDate = new Date(ngaySinh);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Ngày sinh không hợp lệ!' });
      }
      const year = parsedDate.getFullYear();
      if (year < 1900 || year > 2100) {
        return res.status(400).json({ success: false, message: 'Năm sinh phải nằm trong khoảng từ 1900 đến 2100!' });
      }
      formattedNgaySinh = ngaySinh;
    }

    await pool
      .request()
      .input('userId', sql.Int, req.userId)
      .input('hoTen', sql.NVarChar, hoTen)
      .input('ngaySinh', sql.Date, formattedNgaySinh)
      .input('gioiTinh', sql.NVarChar, gioiTinh)
      .input('anhDaiDien', sql.NVarChar, anhDaiDien)
      .query(`
        UPDATE NguoiDung 
        SET HoTen = @hoTen, NgaySinh = @ngaySinh, 
            GioiTinh = @gioiTinh, AnhDaiDien = @anhDaiDien
        WHERE MaNguoiDung = @userId
      `);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { hoTen, ngaySinh, gioiTinh, anhDaiDien }
    });
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
        OUTPUT INSERTED.MaDiaChi
        VALUES (@userId, @tenNguoiNhan, @sdtNguoiNhan, @diaChiCuThe, 
          @phuongXa, @quanHuyen, @tinhThanh, @laMacDinh)
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

// Update delivery address
router.put('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { tenNguoiNhan, sdtNguoiNhan, diaChiCuThe, phuongXa, quanHuyen, tinhThanh, laMacDinh } = req.body;
    const pool = await getPool();

    // Check ownership
    const check = await pool
      .request()
      .input('addressId', sql.Int, addressId)
      .input('userId', sql.Int, req.userId)
      .query('SELECT MaDiaChi FROM DiaChiGiaoHang WHERE MaDiaChi = @addressId AND MaNguoiDung = @userId');

    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
    }

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

    res.json({ success: true, message: 'Address updated successfully' });
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

    // Check ownership
    const check = await pool
      .request()
      .input('addressId', sql.Int, addressId)
      .input('userId', sql.Int, req.userId)
      .query('SELECT MaDiaChi, LaMacDinh FROM DiaChiGiaoHang WHERE MaDiaChi = @addressId AND MaNguoiDung = @userId');

    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
    }

    const wasDefault = check.recordset[0].LaMacDinh;

    await pool
      .request()
      .input('addressId', sql.Int, addressId)
      .query('DELETE FROM DiaChiGiaoHang WHERE MaDiaChi = @addressId');

    // If we deleted the default address, make another one default
    if (wasDefault) {
      const remaining = await pool
        .request()
        .input('userId', sql.Int, req.userId)
        .query('SELECT TOP 1 MaDiaChi FROM DiaChiGiaoHang WHERE MaNguoiDung = @userId ORDER BY MaDiaChi DESC');
      
      if (remaining.recordset.length > 0) {
        await pool
          .request()
          .input('addressId', sql.Int, remaining.recordset[0].MaDiaChi)
          .query('UPDATE DiaChiGiaoHang SET LaMacDinh = 1 WHERE MaDiaChi = @addressId');
      }
    }

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
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

// ==========================================
// QUẢN LÝ VIP (Join VIP - Tham gia VIP)
// ==========================================

// Get VIP packages
router.get('/vip-packages', async (req, res) => {
  try {
    const pool = await getPool();
    const packages = await pool.request()
      .query(`SELECT * FROM GiaDichVuVIP ORDER BY GiaTien ASC`);
    
    res.json({ success: true, data: packages.recordset });
  } catch (error) {
    console.error('Get VIP packages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user VIP status
router.get('/vip-status', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const vipStatus = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT dv.MaVIP, dv.MaGiaDichVu, gdv.TenGoi, gdv.GiaTien, 
               dv.NgayBatDau, dv.NgayKetThuc, dv.TrangThai
        FROM DichVuVIPNguoiDung dv
        JOIN GiaDichVuVIP gdv ON dv.MaGiaDichVu = gdv.MaGiaDichVu
        WHERE dv.MaNguoiDung = @userId AND dv.TrangThai = N'DANG_HOAT_DONG'
      `);

    if (vipStatus.recordset.length === 0) {
      return res.json({ success: true, data: null, message: 'Not VIP member' });
    }

    res.json({ success: true, data: vipStatus.recordset[0] });
  } catch (error) {
    console.error('Get VIP status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Subscribe to VIP
router.post('/vip/subscribe', authenticateToken, async (req, res) => {
  try {
    const { maGiaDichVu } = req.body;
    const pool = await getPool();

    // Get package details
    const pkg = await pool.request()
      .input('packageId', sql.Int, maGiaDichVu)
      .query(`SELECT * FROM GiaDichVuVIP WHERE MaGiaDichVu = @packageId`);

    if (pkg.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const packageData = pkg.recordset[0];
    const ngayBatDau = new Date();
    const ngayKetThuc = new Date(ngayBatDau.getTime() + packageData.ThoiGianDangKy * 24 * 60 * 60 * 1000);

    // Add VIP subscription
    await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('packageId', sql.Int, maGiaDichVu)
      .input('ngayBatDau', sql.DateTime, ngayBatDau)
      .input('ngayKetThuc', sql.DateTime, ngayKetThuc)
      .query(`
        INSERT INTO DichVuVIPNguoiDung (MaNguoiDung, MaGiaDichVu, NgayBatDau, NgayKetThuc, TrangThai)
        VALUES (@userId, @packageId, @ngayBatDau, @ngayKetThuc, N'DANG_HOAT_DONG')
      `);

    // Add points bonus for VIP subscription
    await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('diemBonus', sql.Int, 100)
      .query(`
        UPDATE NguoiDung SET DiemTichLuy = DiemTichLuy + @diemBonus WHERE MaNguoiDung = @userId
      `);

    // Log point history
    await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('diem', sql.Decimal, 100)
      .input('lyDo', sql.NVarChar, 'Đăng ký VIP')
      .query(`
        INSERT INTO LichSuThayDoiDiem (MaNguoiDung, DiemThanh, LoaiThay, LyDo, LoaiMaThamChieu)
        VALUES (@userId, @diem, 1, @lyDo, 'HE_THONG')
      `);

    res.json({ success: true, message: 'VIP subscription successful' });
  } catch (error) {
    console.error('Subscribe VIP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel VIP subscription
router.post('/vip/unsubscribe', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();

    await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`
        UPDATE DichVuVIPNguoiDung 
        SET TrangThai = N'HUY_BO'
        WHERE MaNguoiDung = @userId AND TrangThai = N'DANG_HOAT_DONG'
      `);

    res.json({ success: true, message: 'VIP subscription cancelled' });
  } catch (error) {
    console.error('Unsubscribe VIP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// QUẢN LÝ ĐIỂM TÍCH LŨY (Accumulation Points - Điểm tích lũy)
// ==========================================

// Get user points
router.get('/points', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const user = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`SELECT DiemTichLuy FROM NguoiDung WHERE MaNguoiDung = @userId`);

    if (user.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { points: user.recordset[0].DiemTichLuy } });
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get points history
router.get('/points/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pool = await getPool();
    const offset = (page - 1) * limit;

    const history = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT MaLichSu, DiemThanh, LoaiThay, LyDo, NgayTao
        FROM LichSuThayDoiDiem
        WHERE MaNguoiDung = @userId
        ORDER BY NgayTao DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    res.json({ success: true, data: history.recordset });
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// QUẢN LÝ HẠNG THÀNH VIÊN (Member Rank - Hạng thành viên)
// ==========================================

// Get user rank
router.get('/rank', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const user = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT nd.MaNguoiDung, nd.DiemTichLuy, ht.MaHang, ht.TenHang, 
               ht.DiemToiThieu, ht.PhanTramGiamGia
        FROM NguoiDung nd
        LEFT JOIN HangThanhVien ht ON nd.MaHang = ht.MaHang
        WHERE nd.MaNguoiDung = @userId
      `);

    if (user.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user.recordset[0] });
  } catch (error) {
    console.error('Get rank error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all member ranks
router.get('/ranks/all', async (req, res) => {
  try {
    const pool = await getPool();
    const ranks = await pool.request()
      .query(`SELECT * FROM HangThanhVien ORDER BY DiemToiThieu ASC`);

    res.json({ success: true, data: ranks.recordset });
  } catch (error) {
    console.error('Get ranks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// QUẢN LÝ BỘ LỌC ĐÃ LƯU (Saved Filters - Lưu bộ lọc)
// ==========================================

// Get saved filters
router.get('/filters', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const filters = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT * FROM BoLocDaLuu
        WHERE MaNguoiDung = @userId
        ORDER BY NgayTao DESC
      `);

    res.json({ success: true, data: filters.recordset });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save filter
router.post('/filters', authenticateToken, async (req, res) => {
  try {
    const { tenBoLoc, danhMucId, giaToiThieu, giaToiDa, diemDanhGiaToiThieu, mauSac, kichThuoc, sapXep } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('tenBoLoc', sql.NVarChar, tenBoLoc)
      .input('danhMucId', sql.Int, danhMucId || null)
      .input('giaToiThieu', sql.Decimal, giaToiThieu || null)
      .input('giaToiDa', sql.Decimal, giaToiDa || null)
      .input('diemDanhGiaToiThieu', sql.Decimal, diemDanhGiaToiThieu || null)
      .input('mauSac', sql.NVarChar, mauSac || null)
      .input('kichThuoc', sql.NVarChar, kichThuoc || null)
      .input('sapXep', sql.NVarChar, sapXep || null)
      .query(`
        INSERT INTO BoLocDaLuu (MaNguoiDung, TenBoLoc, DanhMucId, GiaToiThieu, GiaToiDa, 
                               DiemDanhGiaToiThieu, MauSac, KichThuoc, SapXep)
        OUTPUT INSERTED.MaBoLoc
        VALUES (@userId, @tenBoLoc, @danhMucId, @giaToiThieu, @giaToiDa,
                @diemDanhGiaToiThieu, @mauSac, @kichThuoc, @sapXep)
      `);

    res.status(201).json({
      success: true,
      message: 'Filter saved',
      filterId: result.recordset[0].MaBoLoc
    });
  } catch (error) {
    console.error('Save filter error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete saved filter
router.delete('/filters/:filterId', authenticateToken, async (req, res) => {
  try {
    const { filterId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('filterId', sql.Int, filterId)
      .input('userId', sql.Int, req.userId)
      .query(`
        DELETE FROM BoLocDaLuu 
        WHERE MaBoLoc = @filterId AND MaNguoiDung = @userId
      `);

    res.json({ success: true, message: 'Filter deleted' });
  } catch (error) {
    console.error('Delete filter error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// QUẢN LÝ KHUYẾN MÃI (Promotions - Nhận ưu đãi)
// ==========================================

// Get available promotions
router.get('/promotions', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const promotions = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT mk.MaKhuyenMai, mk.MaCode, mk.LoaiGiamGia, mk.GiaTriGiam,
               mk.DonHangToiThieu, mk.GiamToiDa, mk.TuNgay, mk.DenNgay,
               mk.GioiHanSuDung, mk.DaSuDung,
               ISNULL(kmn.MaKhuyenMaiNguoiDung, 0) as daNhan
        FROM MaKhuyenMai mk
        LEFT JOIN KhuyenMaiNguoiDung kmn ON mk.MaKhuyenMai = kmn.MaKhuyenMai 
                                           AND kmn.MaNguoiDung = @userId
        WHERE mk.TuNgay <= GETDATE() AND mk.DenNgay >= GETDATE()
        ORDER BY mk.TuNgay DESC
      `);

    res.json({ success: true, data: promotions.recordset });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Receive promotion
router.post('/promotions/:promotionId/receive', authenticateToken, async (req, res) => {
  try {
    const { promotionId } = req.params;
    const pool = await getPool();

    // Check if user already has this promotion
    const check = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('promotionId', sql.Int, promotionId)
      .query(`
        SELECT * FROM KhuyenMaiNguoiDung 
        WHERE MaNguoiDung = @userId AND MaKhuyenMai = @promotionId
      `);

    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Already received this promotion' });
    }

    // Add promotion to user
    await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('promotionId', sql.Int, promotionId)
      .query(`
        INSERT INTO KhuyenMaiNguoiDung (MaNguoiDung, MaKhuyenMai, TrangThai)
        VALUES (@userId, @promotionId, N'CHUA_SU_DUNG')
      `);

    res.json({ success: true, message: 'Promotion received' });
  } catch (error) {
    console.error('Receive promotion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's promotions
router.get('/my-promotions', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const myPromotions = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT kmn.MaKhuyenMaiNguoiDung, mk.MaKhuyenMai, mk.MaCode, mk.LoaiGiamGia, mk.GiaTriGiam,
               mk.DonHangToiThieu, mk.GiamToiDa, mk.TuNgay, mk.DenNgay,
               kmn.TrangThai, kmn.NgayNhan
        FROM KhuyenMaiNguoiDung kmn
        JOIN MaKhuyenMai mk ON kmn.MaKhuyenMai = mk.MaKhuyenMai
        WHERE kmn.MaNguoiDung = @userId
        ORDER BY kmn.NgayNhan DESC
      `);

    res.json({ success: true, data: myPromotions.recordset });
  } catch (error) {
    console.error('Get my promotions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
