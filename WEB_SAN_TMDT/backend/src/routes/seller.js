const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireSeller, requireShopOwner } = require('../middleware/auth');
const { validateShop } = require('../utils/validators');

// ─── Multer config: upload ảnh CCCD / GPKD ──────────────────────────────────
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'shops');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `shop_${req.userId}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(ext && mime ? null : new Error('Chỉ chấp nhận file ảnh (jpg/png) hoặc PDF'), ext && mime);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/sellers/register — Đăng ký mở shop
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @swagger
 * /api/sellers/register:
 *   post:
 *     tags: [Seller]
 *     summary: Đăng ký mở shop
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [tenCuaHang, diaChiKho, sdtCuaHang]
 *             properties:
 *               tenCuaHang: { type: string, example: "Shop ABC" }
 *               moTa: { type: string }
 *               diaChiKho: { type: string, example: "123 Đường XYZ, Q1, HCM" }
 *               sdtCuaHang: { type: string, example: "0901234567" }
 *               anhGiayTo: { type: string, format: binary }
 *     responses:
 *       201: { description: Đăng ký shop thành công - chờ duyệt }
 *       400: { description: Đã có shop }
 */
router.post('/register', authenticateToken, upload.single('anhGiayTo'), async (req, res) => {
  try {
    const { tenCuaHang, moTa, diaChiKho, sdtCuaHang } = req.body;
    const pool = await getPool();

    // Kiểm tra đã có shop chưa
    const existing = await pool.request()
      .input('MaNguoiDung', sql.Int, req.userId)
      .query('SELECT MaCuaHang, TrangThai FROM CuaHang WHERE MaNguoiDung = @MaNguoiDung');

    if (existing.recordset.length > 0) {
      const shop = existing.recordset[0];
      if (shop.TrangThai === 'HOAT_DONG') {
        return res.status(400).json({ success: false, message: 'Bạn đã có cửa hàng đang hoạt động' });
      }
      if (shop.TrangThai === 'CHO_DUYET') {
        return res.status(400).json({ success: false, message: 'Hồ sơ shop đang chờ duyệt' });
      }
      // Nếu là NHAP (draft) → cập nhật thành CHO_DUYET
      await pool.request()
        .input('MaCuaHang', sql.Int, shop.MaCuaHang)
        .input('TenCuaHang', sql.NVarChar, tenCuaHang)
        .input('MoTa', sql.NVarChar, moTa || null)
        .input('TrangThai', sql.NVarChar, 'CHO_DUYET')
        .query(`UPDATE CuaHang SET TenCuaHang=@TenCuaHang, MoTa=@MoTa, TrangThai=@TrangThai WHERE MaCuaHang=@MaCuaHang`);
      return res.json({ success: true, message: 'Gửi hồ sơ thành công, vui lòng chờ Admin duyệt' });
    }

    // Tạo mới — thử với đầy đủ cột, nếu lỗi thì fallback cột cơ bản
    try {
      const anhPath = req.file ? `/uploads/shops/${req.file.filename}` : null;
      const result = await pool.request()
        .input('MaNguoiDung', sql.Int, req.userId)
        .input('TenCuaHang', sql.NVarChar, tenCuaHang)
        .input('MoTa', sql.NVarChar, moTa || null)
        .input('DiaChiKho', sql.NVarChar, diaChiKho || null)
        .input('SDTCuaHang', sql.NVarChar, sdtCuaHang || null)
        .input('AnhGiayTo', sql.NVarChar, anhPath)
        .input('TrangThai', sql.NVarChar, 'CHO_DUYET')
        .query(`
          INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, DiaChiKho, SDTCuaHang, AnhGiayTo, TrangThai)
          OUTPUT INSERTED.MaCuaHang
          VALUES (@MaNguoiDung, @TenCuaHang, @MoTa, @DiaChiKho, @SDTCuaHang, @AnhGiayTo, @TrangThai)
        `);
      return res.status(201).json({
        success: true,
        message: 'Gửi hồ sơ thành công, vui lòng chờ Admin duyệt',
        data: { maCuaHang: result.recordset[0].MaCuaHang }
      });
    } catch (insertErr) {
      // Fallback: dùng cột cơ bản nếu DB chưa có cột mở rộng
      console.warn('⚠️  Insert đầy đủ thất bại, thử fallback cột cơ bản:', insertErr.message);
      const result = await pool.request()
        .input('MaNguoiDung', sql.Int, req.userId)
        .input('TenCuaHang', sql.NVarChar, tenCuaHang)
        .input('MoTa', sql.NVarChar, moTa || null)
        .input('TrangThai', sql.NVarChar, 'CHO_DUYET')
        .query(`
          INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai)
          OUTPUT INSERTED.MaCuaHang
          VALUES (@MaNguoiDung, @TenCuaHang, @MoTa, @TrangThai)
        `);
      return res.status(201).json({
        success: true,
        message: 'Gửi hồ sơ thành công, vui lòng chờ Admin duyệt',
        data: { maCuaHang: result.recordset[0].MaCuaHang }
      });
    }
  } catch (error) {
    console.error('❌ Lỗi đăng ký shop:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi đăng ký cửa hàng' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/sellers/register/draft — Lưu nháp hồ sơ shop
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @swagger
 * /api/sellers/register/draft:
 *   put:
 *     tags: [Seller]
 *     summary: Lưu nháp hồ sơ shop
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               tenCuaHang: { type: string }
 *               moTa: { type: string }
 *               diaChiKho: { type: string }
 *               sdtCuaHang: { type: string }
 *               anhGiayTo: { type: string, format: binary }
 *     responses:
 *       200: { description: Lưu nháp thành công }
 */
router.put('/register/draft', authenticateToken, upload.single('anhGiayTo'), async (req, res) => {
  try {
    const { tenCuaHang, moTa, diaChiKho, sdtCuaHang } = req.body;
    const pool = await getPool();
    const anhPath = req.file ? `/uploads/shops/${req.file.filename}` : null;

    const existing = await pool.request()
      .input('MaNguoiDung', sql.Int, req.userId)
      .query("SELECT MaCuaHang FROM CuaHang WHERE MaNguoiDung = @MaNguoiDung AND TrangThai = N'NHAP'");

    if (existing.recordset.length > 0) {
      // Cập nhật draft
      await pool.request()
        .input('MaCuaHang', sql.Int, existing.recordset[0].MaCuaHang)
        .input('TenCuaHang', sql.NVarChar, tenCuaHang || null)
        .input('MoTa', sql.NVarChar, moTa || null)
        .input('DiaChiKho', sql.NVarChar, diaChiKho || null)
        .input('SDTCuaHang', sql.NVarChar, sdtCuaHang || null)
        .input('AnhGiayTo', sql.NVarChar, anhPath)
        .query(`
          UPDATE CuaHang SET 
            TenCuaHang=COALESCE(@TenCuaHang, TenCuaHang),
            MoTa=COALESCE(@MoTa, MoTa),
            DiaChiKho=COALESCE(@DiaChiKho, DiaChiKho),
            SDTCuaHang=COALESCE(@SDTCuaHang, SDTCuaHang)
            ${anhPath ? ', AnhGiayTo=@AnhGiayTo' : ''}
          WHERE MaCuaHang=@MaCuaHang
        `);
    } else {
      // Tạo draft mới
      await pool.request()
        .input('MaNguoiDung', sql.Int, req.userId)
        .input('TenCuaHang', sql.NVarChar, tenCuaHang || 'Chưa đặt tên')
        .input('MoTa', sql.NVarChar, moTa || null)
        .input('DiaChiKho', sql.NVarChar, diaChiKho || null)
        .input('SDTCuaHang', sql.NVarChar, sdtCuaHang || null)
        .input('AnhGiayTo', sql.NVarChar, anhPath)
        .input('TrangThai', sql.NVarChar, 'NHAP')
        .query(`
          INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, DiaChiKho, SDTCuaHang, AnhGiayTo, TrangThai)
          VALUES (@MaNguoiDung, @TenCuaHang, @MoTa, @DiaChiKho, @SDTCuaHang, @AnhGiayTo, @TrangThai)
        `);
    }

    res.json({ success: true, message: 'Lưu nháp thành công' });
  } catch (error) {
    console.error('Lỗi lưu nháp:', error);
    res.status(500).json({ success: false, message: 'Lỗi lưu nháp' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/sellers/my-shop — Lấy thông tin shop của mình
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @swagger
 * /api/sellers/my-shop:
 *   get:
 *     tags: [Seller]
 *     summary: Lấy thông tin shop của mình
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Thông tin shop }
 */
router.get('/my-shop', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('MaNguoiDung', sql.Int, req.userId)
      .query('SELECT * FROM CuaHang WHERE MaNguoiDung = @MaNguoiDung');

    if (result.recordset.length === 0) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Lỗi lấy shop:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy thông tin shop' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/sellers/products — Sản phẩm của shop mình
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @swagger
 * /api/sellers/products:
 *   get:
 *     tags: [Seller]
 *     summary: Danh sách sản phẩm của shop mình
 *     security: [{ bearerAuth: [] }]
 */
router.get('/products', authenticateToken, requireSeller, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('MaCuaHang', sql.Int, req.shop.MaCuaHang)
      .query(`
        SELECT sp.*,
          dm.TenDanhMuc,
          (SELECT TOP 1 DuongDanAnh FROM HinhAnhSanPham WHERE MaSanPham = sp.MaSanPham AND LaAnhChinh = 1) as AnhChinh,
          (SELECT COUNT(*) FROM PhienBanSanPham WHERE MaSanPham = sp.MaSanPham) as SoPhienBan,
          (SELECT SUM(SoLuongTonKho) FROM PhienBanSanPham WHERE MaSanPham = sp.MaSanPham) as TongTonKho,
          (SELECT MIN(GiaBan) FROM PhienBanSanPham WHERE MaSanPham = sp.MaSanPham) as GiaThapNhat
        FROM SanPham sp
        LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
        WHERE sp.MaCuaHang = @MaCuaHang
        ORDER BY sp.NgayTao DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy sản phẩm:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách sản phẩm' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/sellers/orders — Đơn hàng đến shop mình
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @swagger
 * /api/sellers/orders:
 *   get:
 *     tags: [Seller]
 *     summary: Đơn hàng của shop (xem user mua gì)
 *     security: [{ bearerAuth: [] }]
 */
router.get('/orders', authenticateToken, requireSeller, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('MaCuaHang', sql.Int, req.shop.MaCuaHang)
      .query(`
        SELECT 
          dh.MaDonHang, dh.TongTien, dh.TienGiamGia, dh.TienThanhToan,
          dh.TrangThaiDonHang, dh.PhuongThucThanhToan, dh.NgayTao,
          nd.HoTen AS TenNguoiMua, nd.Email AS EmailNguoiMua, nd.SoDienThoai AS SDTNguoiMua
        FROM DonHang dh
        JOIN NguoiDung nd ON dh.MaNguoiDung = nd.MaNguoiDung
        WHERE dh.MaCuaHang = @MaCuaHang
        ORDER BY dh.NgayTao DESC
      `);

    // Lấy chi tiết từng đơn
    for (let order of result.recordset) {
      const details = await pool.request()
        .input('MaDonHang', sql.Int, order.MaDonHang)
        .query(`
          SELECT ctdh.*, sp.TenSanPham, pbsp.MauSac, pbsp.KichThuoc,
            (SELECT TOP 1 DuongDanAnh FROM HinhAnhSanPham WHERE MaSanPham = sp.MaSanPham AND LaAnhChinh=1) as AnhSP
          FROM ChiTietDonHang ctdh
          JOIN PhienBanSanPham pbsp ON ctdh.MaPhienBan = pbsp.MaPhienBan
          JOIN SanPham sp ON pbsp.MaSanPham = sp.MaSanPham
          WHERE ctdh.MaDonHang = @MaDonHang
        `);
      order.chiTiet = details.recordset;
    }

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy đơn hàng seller:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy đơn hàng' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/sellers/orders/:id/status — Cập nhật trạng thái đơn hàng
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @swagger
 * /api/sellers/orders/{id}/status:
 *   put:
 *     tags: [Seller]
 *     summary: Cập nhật trạng thái đơn hàng
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trangThai:
 *                 type: string
 *                 enum: [DA_XAC_NHAN, DANG_GIAO, DA_GIAO, DA_HUY]
 */
router.put('/orders/:id/status', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { trangThai } = req.body;
    const validStatuses = ['DA_XAC_NHAN', 'DANG_GIAO', 'DA_GIAO', 'DA_HUY'];
    if (!validStatuses.includes(trangThai)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const pool = await getPool();
    // Kiểm tra đơn hàng thuộc shop
    const check = await pool.request()
      .input('MaDonHang', sql.Int, req.params.id)
      .input('MaCuaHang', sql.Int, req.shop.MaCuaHang)
      .query('SELECT MaDonHang FROM DonHang WHERE MaDonHang = @MaDonHang AND MaCuaHang = @MaCuaHang');

    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    await pool.request()
      .input('MaDonHang', sql.Int, req.params.id)
      .input('TrangThai', sql.NVarChar, trangThai)
      .query('UPDATE DonHang SET TrangThaiDonHang = @TrangThai WHERE MaDonHang = @MaDonHang');

    // Notify buyer about status change
    const orderInfo = await pool.request()
      .input('MaDonHang', sql.Int, req.params.id)
      .query('SELECT MaNguoiDung FROM DonHang WHERE MaDonHang = @MaDonHang');

    if (orderInfo.recordset.length > 0) {
      const statusLabels = {
        DA_XAC_NHAN: 'da xac nhan',
        DANG_GIAO: 'dang duoc giao',
        DA_GIAO: 'da giao thanh cong',
        DA_HUY: 'da bi huy',
      };

      await pool.request()
        .input('maNguoiDung', sql.Int, orderInfo.recordset[0].MaNguoiDung)
        .input('tieuDe', sql.NVarChar, 'Cap nhat don hang')
        .input('noiDung', sql.NVarChar, 'Don hang #' + req.params.id + ' cua ban ' + (statusLabels[trangThai] || trangThai))
        .input('loaiThongBao', sql.NVarChar, 'DON_HANG')
        .input('maThamChieu', sql.Int, parseInt(req.params.id))
        .query(`
          INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao, MaThamChieu)
          VALUES (@maNguoiDung, @tieuDe, @noiDung, @loaiThongBao, @maThamChieu)
        `);
    }

    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật đơn hàng:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/sellers/stats — Thống kê cho dashboard
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/stats', authenticateToken, requireSeller, async (req, res) => {
  try {
    const pool = await getPool();
    const shopId = req.shop.MaCuaHang;

    const stats = await pool.request()
      .input('MaCuaHang', sql.Int, shopId)
      .query(`
        SELECT
          (SELECT COUNT(*) FROM SanPham WHERE MaCuaHang = @MaCuaHang AND TrangThai = N'HOAT_DONG') as tongSanPham,
          (SELECT COUNT(*) FROM DonHang WHERE MaCuaHang = @MaCuaHang) as tongDonHang,
          (SELECT COUNT(*) FROM DonHang WHERE MaCuaHang = @MaCuaHang AND TrangThaiDonHang = N'CHO_XAC_NHAN') as donChoXacNhan,
          (SELECT ISNULL(SUM(TienThanhToan), 0) FROM DonHang WHERE MaCuaHang = @MaCuaHang AND TrangThaiDonHang = N'DA_GIAO') as doanhThu
      `);

    res.json({ success: true, data: stats.recordset[0] });
  } catch (error) {
    console.error('Lỗi lấy thống kê:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy thống kê' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// VOUCHER MANAGEMENT — Quản lý khuyến mãi
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/sellers/vouchers — Danh sách mã khuyến mãi của shop
router.get('/vouchers', authenticateToken, requireSeller, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('MaCuaHang', sql.Int, req.shop.MaCuaHang)
      .query(`
        SELECT *, (CASE WHEN GETDATE() >= TuNgay AND GETDATE() <= DenNgay THEN 1 ELSE 0 END) as DangHoatDong
        FROM MaKhuyenMai
        WHERE MaCuaHang = @MaCuaHang
        ORDER BY MaKhuyenMai DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy voucher:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách khuyến mãi' });
  }
});

// POST /api/sellers/vouchers — Tạo mã khuyến mãi mới
router.post('/vouchers', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { maCode, loaiGiamGia, giaTriGiam, donHangToiThieu, giamToiDa, tuNgay, denNgay, gioiHanSuDung } = req.body;
    if (!maCode || !loaiGiamGia || !giaTriGiam || !tuNgay || !denNgay || !gioiHanSuDung) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }
    const pool = await getPool();

    // Check trùng mã code trong shop
    const existing = await pool.request()
      .input('MaCuaHang', sql.Int, req.shop.MaCuaHang)
      .input('MaCode', sql.NVarChar, maCode)
      .query('SELECT MaKhuyenMai FROM MaKhuyenMai WHERE MaCuaHang = @MaCuaHang AND MaCode = @MaCode');
    if (existing.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'Mã code này đã tồn tại trong shop của bạn' });
    }

    const result = await pool.request()
      .input('MaCuaHang', sql.Int, req.shop.MaCuaHang)
      .input('MaCode', sql.NVarChar, maCode)
      .input('LoaiGiamGia', sql.NVarChar, loaiGiamGia)
      .input('GiaTriGiam', sql.Decimal(15, 2), giaTriGiam)
      .input('DonHangToiThieu', sql.Decimal(15, 2), donHangToiThieu || 0)
      .input('GiamToiDa', sql.Decimal(15, 2), giamToiDa || null)
      .input('TuNgay', sql.DateTime, new Date(tuNgay))
      .input('DenNgay', sql.DateTime, new Date(denNgay))
      .input('GioiHanSuDung', sql.Int, gioiHanSuDung)
      .query(`
        INSERT INTO MaKhuyenMai (MaCuaHang, MaCode, LoaiGiamGia, GiaTriGiam, DonHangToiThieu, GiamToiDa, TuNgay, DenNgay, GioiHanSuDung, DaSuDung)
        OUTPUT INSERTED.MaKhuyenMai
        VALUES (@MaCuaHang, @MaCode, @LoaiGiamGia, @GiaTriGiam, @DonHangToiThieu, @GiamToiDa, @TuNgay, @DenNgay, @GioiHanSuDung, 0)
      `);
    res.status(201).json({ success: true, message: 'Tạo mã khuyến mãi thành công', data: { maKhuyenMai: result.recordset[0].MaKhuyenMai } });
  } catch (error) {
    console.error('Lỗi tạo voucher:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo mã khuyến mãi' });
  }
});

// PUT /api/sellers/vouchers/:id — Cập nhật (chủ yếu toggle hoặc sửa)
router.put('/vouchers/:id', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const { tuNgay, denNgay, gioiHanSuDung, donHangToiThieu, giamToiDa } = req.body;
    const pool = await getPool();

    const check = await pool.request()
      .input('MaKhuyenMai', sql.Int, id)
      .input('MaCuaHang', sql.Int, req.shop.MaCuaHang)
      .query('SELECT MaKhuyenMai FROM MaKhuyenMai WHERE MaKhuyenMai = @MaKhuyenMai AND MaCuaHang = @MaCuaHang');
    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
    }

    await pool.request()
      .input('MaKhuyenMai', sql.Int, id)
      .input('TuNgay', sql.DateTime, tuNgay ? new Date(tuNgay) : null)
      .input('DenNgay', sql.DateTime, denNgay ? new Date(denNgay) : null)
      .input('GioiHanSuDung', sql.Int, gioiHanSuDung || null)
      .input('DonHangToiThieu', sql.Decimal(15, 2), donHangToiThieu || null)
      .input('GiamToiDa', sql.Decimal(15, 2), giamToiDa || null)
      .query(`
        UPDATE MaKhuyenMai SET
          TuNgay = COALESCE(@TuNgay, TuNgay),
          DenNgay = COALESCE(@DenNgay, DenNgay),
          GioiHanSuDung = COALESCE(@GioiHanSuDung, GioiHanSuDung),
          DonHangToiThieu = COALESCE(@DonHangToiThieu, DonHangToiThieu),
          GiamToiDa = COALESCE(@GiamToiDa, GiamToiDa)
        WHERE MaKhuyenMai = @MaKhuyenMai
      `);
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật voucher:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật mã khuyến mãi' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCE — Quản lý tài chính
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/sellers/finance — Thông tin tài chính tổng quan
router.get('/finance', authenticateToken, requireSeller, async (req, res) => {
  try {
    const pool = await getPool();
    const shopId = req.shop.MaCuaHang;

    // Số dư ví
    const balanceResult = await pool.request()
      .input('MaCuaHang', sql.Int, shopId)
      .query('SELECT SoDuVi FROM CuaHang WHERE MaCuaHang = @MaCuaHang');
    const soDuVi = balanceResult.recordset[0]?.SoDuVi || 0;

    // Doanh thu đã giao
    const revenueResult = await pool.request()
      .input('MaCuaHang', sql.Int, shopId)
      .query("SELECT ISNULL(SUM(TienThanhToan), 0) as doanhThu FROM DonHang WHERE MaCuaHang = @MaCuaHang AND TrangThaiDonHang = N'DA_GIAO'");
    const doanhThu = revenueResult.recordset[0]?.doanhThu || 0;

    // Đang chờ xử lý (đơn đã xác nhận nhưng chưa giao)
    const pendingResult = await pool.request()
      .input('MaCuaHang', sql.Int, shopId)
      .query("SELECT ISNULL(SUM(TienThanhToan), 0) as pending FROM DonHang WHERE MaCuaHang = @MaCuaHang AND TrangThaiDonHang IN (N'CHO_XAC_NHAN', N'DA_XAC_NHAN', N'DANG_GIAO')");
    const dangCho = pendingResult.recordset[0]?.pending || 0;

    // Đã rút
    const withdrawnResult = await pool.request()
      .input('MaCuaHang', sql.Int, shopId)
      .query("SELECT ISNULL(SUM(SoTien), 0) as daRut FROM YeuCauRutTien WHERE MaCuaHang = @MaCuaHang AND TrangThai = N'DA_DUYET'");
    const daRut = withdrawnResult.recordset[0]?.daRut || 0;

    // Giao dịch gần đây (đơn hàng đã giao)
    const transactions = await pool.request()
      .input('MaCuaHang', sql.Int, shopId)
      .query(`
        SELECT MaDonHang, TienThanhToan, NgayTao, TrangThaiDonHang
        FROM DonHang
        WHERE MaCuaHang = @MaCuaHang AND TrangThaiDonHang = N'DA_GIAO'
        ORDER BY NgayTao DESC
      `);

    res.json({
      success: true,
      data: {
        soDuVi,
        doanhThu,
        dangCho,
        daRut,
        transactions: transactions.recordset
      }
    });
  } catch (error) {
    console.error('Lỗi lấy tài chính:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy thông tin tài chính' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// WITHDRAWAL — Rút tiền bán hàng
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/sellers/withdraw — Yêu cầu rút tiền
router.post('/withdraw', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { soTien, tenTaiKhoan, soTaiKhoan, tenNganHang } = req.body;
    if (!soTien || !tenTaiKhoan || !soTaiKhoan || !tenNganHang) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    }
    if (Number(soTien) <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
    }

    const pool = await getPool();
    const shopId = req.shop.MaCuaHang;

    // Kiểm tra số dư
    const balance = await pool.request()
      .input('MaCuaHang', sql.Int, shopId)
      .query('SELECT SoDuVi FROM CuaHang WHERE MaCuaHang = @MaCuaHang');
    const soDuVi = Number(balance.recordset[0]?.SoDuVi || 0);
    if (Number(soTien) > soDuVi) {
      return res.status(400).json({ success: false, message: 'Số dư ví không đủ' });
    }

    await pool.request()
      .input('MaCuaHang', sql.Int, shopId)
      .input('SoTien', sql.Decimal(15, 2), soTien)
      .input('TenTaiKhoanNganHang', sql.NVarChar, tenTaiKhoan)
      .input('SoTaiKhoan', sql.NVarChar, soTaiKhoan)
      .input('TenNganHang', sql.NVarChar, tenNganHang)
      .input('TrangThai', sql.NVarChar, 'CHO_DUYET')
      .query(`
        INSERT INTO YeuCauRutTien (MaCuaHang, SoTien, TenTaiKhoanNganHang, SoTaiKhoan, TenNganHang, TrangThai)
        VALUES (@MaCuaHang, @SoTien, @TenTaiKhoanNganHang, @SoTaiKhoan, @TenNganHang, @TrangThai)
      `);

    // Trừ số dư ví tạm thời
    await pool.request()
      .input('MaCuaHang', sql.Int, shopId)
      .input('SoTien', sql.Decimal(15, 2), soTien)
      .query('UPDATE CuaHang SET SoDuVi = SoDuVi - @SoTien WHERE MaCuaHang = @MaCuaHang');

    res.json({ success: true, message: 'Yêu cầu rút tiền đã được gửi, chờ Admin duyệt' });
  } catch (error) {
    console.error('Lỗi rút tiền:', error);
    res.status(500).json({ success: false, message: 'Lỗi xử lý rút tiền' });
  }
});

// GET /api/sellers/withdrawals — Lịch sử rút tiền
router.get('/withdrawals', authenticateToken, requireSeller, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('MaCuaHang', sql.Int, req.shop.MaCuaHang)
      .query(`
        SELECT * FROM YeuCauRutTien
        WHERE MaCuaHang = @MaCuaHang
        ORDER BY NgayTao DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy lịch sử rút tiền:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử rút tiền' });
  }
});

module.exports = router;
