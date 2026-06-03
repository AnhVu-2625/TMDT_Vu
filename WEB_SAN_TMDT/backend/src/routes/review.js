const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const reviewUploadDir = path.join(__dirname, '../../uploads/reviews');
if (!fs.existsSync(reviewUploadDir)) fs.mkdirSync(reviewUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, reviewUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'review_' + Date.now() + '_' + Math.round(Math.random() * 1e9) + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|mkv)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only images and videos allowed'));
  }
});

// POST /api/reviews – Viết đánh giá sản phẩm (hỗ trợ upload ảnh/video)
router.post('/', authenticateToken, upload.array('media', 5), async (req, res) => {
  try {
    const { maSanPham, maDonHang, diemDanhGia, binhLuan } = req.body;
    const files = req.files || [];
    const pool = await getPool();

    const check = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('maDonHang', sql.Int, maDonHang)
      .input('maSanPham', sql.Int, maSanPham)
      .query(`
        SELECT dh.MaDonHang FROM DonHang dh
        JOIN ChiTietDonHang ct ON dh.MaDonHang = ct.MaDonHang
        JOIN PhienBanSanPham pb ON ct.MaPhienBan = pb.MaPhienBan
        WHERE dh.MaDonHang = @maDonHang AND dh.MaNguoiDung = @userId
          AND pb.MaSanPham = @maSanPham AND dh.TrangThaiDonHang = N'DA_GIAO'
      `);

    if (check.recordset.length === 0) {
      // Clean up uploaded files
      files.forEach(f => fs.unlink(f.path, () => {}));
      return res.status(400).json({ success: false, message: 'B\u1EA1n ch\u1EC9 c\xF3 th\u1EC3 \u0111\xE1nh gi\xE1 s\u1EA3n ph\u1EA9m \u0111\xE3 mua v\xE0 \u0111\xE3 nh\u1EADn h\xE0ng' });
    }

    const existing = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('maSanPham', sql.Int, maSanPham)
      .input('maDonHang', sql.Int, maDonHang)
      .query('SELECT MaDanhGia FROM DanhGiaSanPham WHERE MaNguoiDung=@userId AND MaSanPham=@maSanPham AND MaDonHang=@maDonHang');

    if (existing.recordset.length > 0) {
      files.forEach(f => fs.unlink(f.path, () => {}));
      return res.status(400).json({ success: false, message: 'B\u1EA1n \u0111\xE3 \u0111\xE1nh gi\xE1 s\u1EA3n ph\u1EA9m n\xE0y r\u1ED3i' });
    }

    // Create review
    const insertResult = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('maSanPham', sql.Int, maSanPham)
      .input('maDonHang', sql.Int, maDonHang)
      .input('diem', sql.Int, diemDanhGia)
      .input('binhLuan', sql.NVarChar, binhLuan || '')
      .query(`INSERT INTO DanhGiaSanPham (MaNguoiDung, MaSanPham, MaDonHang, DiemDanhGia, BinhLuan) OUTPUT INSERTED.MaDanhGia VALUES (@userId, @maSanPham, @maDonHang, @diem, @binhLuan)`);

    const maDanhGia = insertResult.recordset[0].MaDanhGia;

    // Save media records
    for (const f of files) {
      const relativePath = '/uploads/reviews/' + f.filename;
      const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(path.extname(f.originalname));
      await pool.request()
        .input('maDanhGia', sql.Int, maDanhGia)
        .input('duongDan', sql.NVarChar, relativePath)
        .input('loai', sql.NVarChar, isVideo ? 'video' : 'image')
        .query('INSERT INTO HinhAnhDanhGia (MaDanhGia, DuongDan, Loai) VALUES (@maDanhGia, @duongDan, @loai)');
    }

    // Update average rating
    await pool.request()
      .input('maSanPham', sql.Int, maSanPham)
      .query(`UPDATE SanPham SET DanhGiaTrungBinh =
        (SELECT AVG(CAST(DiemDanhGia AS DECIMAL(3,2))) FROM DanhGiaSanPham WHERE MaSanPham=@maSanPham)
        WHERE MaSanPham = @maSanPham`);

    res.status(201).json({
      success: true,
      message: '\u0110\xE1nh gi\xE1 th\xE0nh c\xF4ng',
      data: { maDanhGia, mediaCount: files.length }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'L\u1ED7i server' });
  }
});

// PUT /api/reviews/:id/reply – Người bán phản hồi
router.put('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { phanHoi } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('phanHoi', sql.NVarChar, phanHoi)
      .query('UPDATE DanhGiaSanPham SET PhanHoiCuaHang=@phanHoi WHERE MaDanhGia=@id');
    res.json({ success: true, message: '\u0110\xE3 ph\u1EA3n h\u1ED3i \u0111\xE1nh gi\xE1' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'L\u1ED7i server' });
  }
});

// GET /api/reviews/check/:productId — Kiểm tra user đã đánh giá chưa
router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, req.userId)
      .input('maSanPham', sql.Int, req.params.productId)
      .query(`
        SELECT TOP 1 MaDanhGia, DiemDanhGia, BinhLuan, NgayTao
        FROM DanhGiaSanPham
        WHERE MaNguoiDung = @userId AND MaSanPham = @maSanPham
        ORDER BY NgayTao DESC
      `);
    res.json({
      success: true,
      data: result.recordset[0] || null,
      daDanhGia: result.recordset.length > 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/reviews/product/:id – Lấy đánh giá sản phẩm (kèm media)
router.get('/product/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`SELECT dg.*, nd.HoTen, nd.AnhDaiDien
              FROM DanhGiaSanPham dg
              JOIN NguoiDung nd ON dg.MaNguoiDung = nd.MaNguoiDung
              WHERE dg.MaSanPham = @id ORDER BY dg.NgayTao DESC`);

    const reviews = result.recordset;

    // Get media for each review
    for (const r of reviews) {
      const mediaResult = await pool.request()
        .input('maDanhGia', sql.Int, r.MaDanhGia)
        .query('SELECT MaHinhAnh, DuongDan, Loai FROM HinhAnhDanhGia WHERE MaDanhGia = @maDanhGia ORDER BY MaHinhAnh');
      r.media = mediaResult.recordset || [];
    }

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'L\u1ED7i server' });
  }
});

module.exports = router;
