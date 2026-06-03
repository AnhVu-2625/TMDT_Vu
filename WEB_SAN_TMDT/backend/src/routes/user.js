const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { createInvoice, createNotification } = require('./invoice');

const router = express.Router();

// Caps: Hạng TV tối đa 100K, VIP Tháng 200K, VIP Quý 500K, VIP Năm 1M
const VIP_CAPS = { default: 100000, 1: 200000, 2: 500000, 3: 1000000 };

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
    const vipResult = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('packageId', sql.Int, maGiaDichVu)
      .input('ngayBatDau', sql.DateTime, ngayBatDau)
      .input('ngayKetThuc', sql.DateTime, ngayKetThuc)
      .query(`
        INSERT INTO DichVuVIPNguoiDung (MaNguoiDung, MaGiaDichVu, NgayBatDau, NgayKetThuc, TrangThai)
        OUTPUT INSERTED.MaVIP
        VALUES (@userId, @packageId, @ngayBatDau, @ngayKetThuc, N'DANG_HOAT_DONG')
      `);

    const maVIP = vipResult.recordset[0].MaVIP;

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

    // Generate vouchers
    const soLuongVoucher = packageData.SoLuongVoucher || 0;
    const giaTriVoucher = packageData.GiaTriVoucher || 0;
    const hanVoucher = packageData.HanVoucher || 30;
    const voucherCodes = [];

    for (let i = 0; i < soLuongVoucher; i++) {
      const code = 'VIP' + (packageData.MaGiaDichVu) + ((new Date().getTime()) % 10000) + i + req.userId;

      // Create coupon in MaKhuyenMai
      const tuNgay = new Date();
      const denNgay = new Date(tuNgay.getTime() + hanVoucher * 24 * 60 * 60 * 1000);

      // Caps: Tháng=200K, Quý=500K, Năm=1M
      const giamToiDa = VIP_CAPS[packageData.MaGiaDichVu] || 200000;

      const couponResult = await pool.request()
        .input('maCode', sql.NVarChar, code)
        .input('giaTriGiam', sql.Decimal(15,2), giaTriVoucher)
        .input('donHangToiThieu', sql.Decimal(15,2), 0)
        .input('giamToiDa', sql.Decimal(15,2), giamToiDa)
        .input('tuNgay', sql.DateTime, tuNgay)
        .input('denNgay', sql.DateTime, denNgay)
        .input('gioiHanSuDung', sql.Int, 1)
        .query(`
          INSERT INTO MaKhuyenMai (MaCode, LoaiGiamGia, GiaTriGiam, DonHangToiThieu, GiamToiDa, TuNgay, DenNgay, GioiHanSuDung)
          OUTPUT INSERTED.MaKhuyenMai
          VALUES (@maCode, N'PHAN_TRAM', @giaTriGiam, @donHangToiThieu, @giamToiDa, @tuNgay, @denNgay, @gioiHanSuDung)
        `);

      const maKhuyenMai = couponResult.recordset[0].MaKhuyenMai;

      // Link coupon to user
      await pool.request()
        .input('userId', sql.Int, req.userId)
        .input('maKhuyenMai', sql.Int, maKhuyenMai)
        .query(`
          INSERT INTO KhuyenMaiNguoiDung (MaNguoiDung, MaKhuyenMai, TrangThai)
          VALUES (@userId, @maKhuyenMai, N'CHUA_SU_DUNG')
        `);

      // Record in VoucherVIP
      await pool.request()
        .input('userId', sql.Int, req.userId)
        .input('maVIP', sql.Int, maVIP)
        .input('maKhuyenMai', sql.Int, maKhuyenMai)
        .input('maCode', sql.NVarChar, code)
        .input('giaTriGiam', sql.Decimal(5,2), giaTriVoucher)
        .input('donHangToiThieu', sql.Decimal(15,2), 0)
        .input('ngayHetHan', sql.Date, denNgay)
        .query(`
          INSERT INTO VoucherVIP (MaNguoiDung, MaVIP, MaKhuyenMai, MaCode, GiaTriGiam, DonHangToiThieu, NgayHetHan)
          VALUES (@userId, @maVIP, @maKhuyenMai, @maCode, @giaTriGiam, @donHangToiThieu, @ngayHetHan)
        `);

      voucherCodes.push(code);
    }

    // Create invoice for VIP purchase
    await createInvoice(pool, req.userId, 'VIP', maVIP, packageData.GiaTien, 0, 0, packageData.GiaTien, 'CHUYEN_KHOAN',
      'Thanh toán gói ' + packageData.TenGoi + ' VIP');

    // Notify user
    let voucherMsg = '';
    if (voucherCodes.length > 0) {
      voucherMsg = ' Bạn nhận được ' + voucherCodes.length + ' voucher giảm ' + giaTriVoucher + '% (mã: ' + voucherCodes.join(', ') + ').';
    }
    await createNotification(pool, req.userId,
      'Đăng ký VIP thành công!',
      'Chúc mừng bạn đã trở thành thành viên ' + packageData.TenGoi + '!' + voucherMsg + ' Hiệu lực đến ' + ngayKetThuc.toLocaleDateString('vi-VN') + '.',
      'HE_THONG', maVIP
    );

    res.json({
      success: true,
      message: 'VIP subscription successful',
      data: {
        maVIP,
        voucherCodes,
        ngayBatDau,
        ngayKetThuc,
        packageData
      }
    });
  } catch (error) {
    console.error('Subscribe VIP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel VIP subscription
router.post('/vip/unsubscribe', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();

    // Get current VIP info before cancel
    const vipInfo = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT dv.MaVIP, gv.TenGoi FROM DichVuVIPNguoiDung dv
        JOIN GiaDichVuVIP gv ON dv.MaGiaDichVu = gv.MaGiaDichVu
        WHERE dv.MaNguoiDung = @userId AND dv.TrangThai = N'DANG_HOAT_DONG'
      `);

    await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`
        UPDATE DichVuVIPNguoiDung 
        SET TrangThai = N'HUY_BO'
        WHERE MaNguoiDung = @userId AND TrangThai = N'DANG_HOAT_DONG'
      `);

    if (vipInfo.recordset.length > 0) {
      await createNotification(pool, req.userId,
        'Hủy VIP thành công',
        'Gói ' + vipInfo.recordset[0].TenGoi + ' đã được hủy. Các ưu đãi VIP sẽ không còn hiệu lực.',
        'HE_THONG', vipInfo.recordset[0].MaVIP
      );
    }

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

// Get user's combined benefits (tier + VIP)
router.get('/benefits', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const user = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`SELECT DiemTichLuy, MaHang FROM NguoiDung WHERE MaNguoiDung = @userId`);

    if (user.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const diemTichLuy = user.recordset[0].DiemTichLuy || 0;
    const currentRank = user.recordset[0].MaHang || 1;

    // Get rank benefits
    const rankData = await pool.request()
      .input('maHang', sql.Int, currentRank)
      .query(`SELECT * FROM HangThanhVien WHERE MaHang = @maHang`);
    const rank = rankData.recordset[0] || { PhanTramGiam: 0, MienPhiVanChuyen: 0, HeSoTichDiem: 1.0 };

    // Get next rank info
    const nextRankData = await pool.request()
      .input('maHang', sql.Int, currentRank + 1)
      .query(`SELECT * FROM HangThanhVien WHERE MaHang = @maHang`);
    const nextRank = nextRankData.recordset[0] || null;

    // Get VIP status
    const vipData = await pool.request()
      .input('userId', sql.Int, req.userId)
      .query(`
        SELECT dv.*, gdv.TenGoi, gdv.GiaTien, gdv.UuDai
        FROM DichVuVIPNguoiDung dv
        JOIN GiaDichVuVIP gdv ON dv.MaGiaDichVu = gdv.MaGiaDichVu
        WHERE dv.MaNguoiDung = @userId AND dv.TrangThai = N'DANG_HOAT_DONG'
      `);
    const vip = vipData.recordset[0] || null;

    // Check if VIP is expired
    let vipDiscount = 0;
    let vipFreeShip = false;
    let vipPointMultiplier = 1;
    if (vip && new Date(vip.NgayKetThuc) > new Date()) {
      switch (vip.MaGiaDichVu) {
        case 1: vipDiscount = 5; vipPointMultiplier = 2; break; // VIP Tháng: 5%
        case 2: vipDiscount = 8; vipPointMultiplier = 3; break; // VIP Quý: 8%
        case 3: vipDiscount = 12; vipPointMultiplier = 5; break; // VIP Năm: 12%
      }
      vipFreeShip = true;
    }

    const tierDiscount = rank.PhanTramGiam || 0;
    const tierFreeShip = rank.MienPhiVanChuyen === 1;
    const tierPointMultiplier = rank.HeSoTichDiem || 1.0;

    // Best discount: take the higher one (VIP > tier)
    const finalDiscount = Math.max(vipDiscount, tierDiscount);
    const finalFreeShip = vipFreeShip || tierFreeShip;
    const finalPointMultiplier = Math.max(vipPointMultiplier, tierPointMultiplier);

    // Calculate progress to next rank
    let progress = 100;
    if (nextRank) {
      const prevThreshold = rank.DiemToiThieu || 0;
      const nextThreshold = nextRank.DiemToiThieu;
      const needed = nextThreshold - prevThreshold;
      const earned = Math.min(Math.max(diemTichLuy - prevThreshold, 0), needed);
      progress = needed > 0 ? Math.round((earned / needed) * 100) : 100;
    }

    res.json({
      success: true,
      data: {
        diemTichLuy,
        rank: {
          maHang: currentRank,
          tenHang: rank.TenHang || '',
          phanTramGiam: rank.PhanTramGiam || 0,
          mienPhiVanChuyen: rank.MienPhiVanChuyen === 1,
          heSoTichDiem: rank.HeSoTichDiem || 1.0,
          moTaUuDai: rank.MoTaUuDai || '',
        },
        nextRank: nextRank ? {
          maHang: nextRank.MaHang,
          tenHang: nextRank.TenHang,
          diemToiThieu: nextRank.DiemToiThieu,
        } : null,
        progress,
        vip: vip ? {
          maVIP: vip.MaVIP,
          tenGoi: vip.TenGoi,
          ngayKetThuc: vip.NgayKetThuc,
          uuDai: vip.UuDai,
        } : null,
        benefits: {
          giamGia: finalDiscount,
          giamGiaCap: vip ? VIP_CAPS[vip.MaGiaDichVu] || VIP_CAPS.default : VIP_CAPS.default,
          mienPhiVanChuyen: finalFreeShip,
          heSoTichDiem: finalPointMultiplier,
          nguon: vip ? 'VIP' : 'HangThanhVien',
        }
      }
    });
  } catch (error) {
    console.error('Get benefits error:', error);
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
