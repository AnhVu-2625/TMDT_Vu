const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper: create invoice
async function createInvoice(pool, userId, loaiHoaDon, maThamChieu, tongTien, tienGiamGia, phiVanChuyen, tienThanhToan, hinhThucThanhToan, ghiChu) {
  const result = await pool.request()
    .input('maNguoiDung', sql.Int, userId)
    .input('loaiHoaDon', sql.NVarChar, loaiHoaDon)
    .input('maThamChieu', sql.Int, maThamChieu)
    .input('tongTien', sql.Decimal(15,2), tongTien)
    .input('tienGiamGia', sql.Decimal(15,2), tienGiamGia || 0)
    .input('phiVanChuyen', sql.Decimal(15,2), phiVanChuyen || 0)
    .input('tienThanhToan', sql.Decimal(15,2), tienThanhToan)
    .input('hinhThucThanhToan', sql.NVarChar, hinhThucThanhToan || null)
    .input('ghiChu', sql.NVarChar(sql.MAX), ghiChu || null)
    .query(`
      INSERT INTO HoaDon (MaNguoiDung, LoaiHoaDon, MaThamChieu, TongTien, TienGiamGia, PhiVanChuyen, TienThanhToan, HinhThucThanhToan, GhiChu)
      OUTPUT INSERTED.MaHoaDon
      VALUES (@maNguoiDung, @loaiHoaDon, @maThamChieu, @tongTien, @tienGiamGia, @phiVanChuyen, @tienThanhToan, @hinhThucThanhToan, @ghiChu)
    `);
  return result.recordset[0].MaHoaDon;
}

// Helper: create notification
async function createNotification(pool, userId, tieuDe, noiDung, loaiThongBao, maThamChieu) {
  await pool.request()
    .input('maNguoiDung', sql.Int, userId)
    .input('tieuDe', sql.NVarChar, tieuDe)
    .input('noiDung', sql.NVarChar(sql.MAX), noiDung)
    .input('loaiThongBao', sql.NVarChar, loaiThongBao)
    .input('maThamChieu', sql.Int, maThamChieu || null)
    .query(`
      INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao, MaThamChieu)
      VALUES (@maNguoiDung, @tieuDe, @noiDung, @loaiThongBao, @maThamChieu)
    `);
}

// Get user invoices
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { loai, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM HoaDon WHERE MaNguoiDung = @userId`;
    if (loai) query += ` AND LoaiHoaDon = @loai`;
    query += ` ORDER BY NgayTao DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request()
      .input('userId', sql.Int, req.userId)
      .input('offset', sql.Int, parseInt(offset))
      .input('limit', sql.Int, parseInt(limit));
    if (loai) request.input('loai', sql.NVarChar, loai);

    const result = await request.query(query);

    const countReq = pool.request().input('userId', sql.Int, req.userId);
    if (loai) countReq.input('loai', sql.NVarChar, loai);
    let countQuery = 'SELECT COUNT(*) as total FROM HoaDon WHERE MaNguoiDung = @userId';
    if (loai) countQuery += ' AND LoaiHoaDon = @loai';
    const countResult = await countReq.query(countQuery);

    res.json({
      success: true,
      data: result.recordset,
      total: countResult.recordset[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single invoice
router.get('/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const pool = await getPool();

    const invoice = await pool.request()
      .input('invoiceId', sql.Int, invoiceId)
      .input('userId', sql.Int, req.userId)
      .query('SELECT * FROM HoaDon WHERE MaHoaDon = @invoiceId AND MaNguoiDung = @userId');

    if (invoice.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const data = invoice.recordset[0];

    // Fetch related details
    if (data.LoaiHoaDon === 'DON_HANG') {
      const orderDetail = await pool.request()
        .input('orderId', sql.Int, data.MaThamChieu)
        .query(`
          SELECT ctdh.*, sp.TenSanPham, pbsn.MauSac, pbsn.KichThuoc,
            (SELECT TOP 1 ha.AnhChinh FROM HinhAnhSanPham ha WHERE ha.MaSanPham = sp.MaSanPham) as AnhChinh
          FROM ChiTietDonHang ctdh
          JOIN PhienBanSanPham pbsn ON ctdh.MaPhienBan = pbsn.MaPhienBan
          JOIN SanPham sp ON pbsn.MaSanPham = sp.MaSanPham
          WHERE ctdh.MaDonHang = @orderId
        `);
      data.items = orderDetail.recordset;

      const orderInfo = await pool.request()
        .input('orderId', sql.Int, data.MaThamChieu)
        .query(`
          SELECT dh.*, ch.TenCuaHang, dcg.TenNguoiNhan, dcg.SdtNguoiNhan, dcg.DiaChiCuThe, dcg.PhuongXa, dcg.QuanHuyen, dcg.TinhThanh
          FROM DonHang dh
          JOIN CuaHang ch ON dh.MaCuaHang = ch.MaCuaHang
          LEFT JOIN DiaChiGiaoHang dcg ON dh.MaDiaChi = dcg.MaDiaChi
          WHERE dh.MaDonHang = @orderId
        `);
      data.orderInfo = orderInfo.recordset[0] || null;
    } else if (data.LoaiHoaDon === 'VIP') {
      const vipDetail = await pool.request()
        .input('maVIP', sql.Int, data.MaThamChieu)
        .query(`
          SELECT dv.*, gv.TenGoi, gv.MoTa, gv.ThoiGianDangKy
          FROM DichVuVIPNguoiDung dv
          JOIN GiaDichVuVIP gv ON dv.MaGiaDichVu = gv.MaGiaDichVu
          WHERE dv.MaVIP = @maVIP
        `);
      data.vipInfo = vipDetail.recordset[0] || null;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = { router, createInvoice, createNotification };