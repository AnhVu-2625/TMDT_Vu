const express = require('express');
const { getPool, sql } = require('../config/database');

const router = express.Router();

// GET /api/shops/:id - Thông tin shop + sản phẩm + thống kê
router.get('/:id', async (req, res) => {
  try {
    const shopId = parseInt(req.params.id, 10);
    if (isNaN(shopId)) {
      return res.status(400).json({ success: false, message: 'ID cửa hàng không hợp lệ' });
    }

    const {
      danhMuc = '',
      sortBy = 'newest',
      search = '',
      page = 1,
      limit = 100
    } = req.query;

    const pool = await getPool();

    // Thông tin shop
    const shopResult = await pool.request()
      .input('maCuaHang', sql.Int, shopId)
      .query(`
        SELECT 
          ch.MaCuaHang, ch.TenCuaHang, ch.MoTa, ch.Logo, ch.TrangThai, ch.NgayTao, ch.SoDuVi,
          nd.HoTen AS TenChuShop, nd.Email, nd.SoDienThoai
        FROM CuaHang ch
        LEFT JOIN NguoiDung nd ON ch.MaNguoiDung = nd.MaNguoiDung
        WHERE ch.MaCuaHang = @maCuaHang AND ch.TrangThai = N'HOAT_DONG'
      `);

    if (shopResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cửa hàng' });
    }

    const shop = shopResult.recordset[0];

    // Đếm sản phẩm
    const totalCount = await pool.request()
      .input('maCuaHang', sql.Int, shopId)
      .query(`SELECT COUNT(*) AS TongSP FROM SanPham WHERE MaCuaHang = @maCuaHang AND TrangThai = N'HOAT_DONG'`);
    const tongSP = totalCount.recordset[0].TongSP;

    // Đếm người theo dõi
    let tongFollow = 0;
    try {
      const followResult = await pool.request()
        .input('maCuaHang', sql.Int, shopId)
        .query(`SELECT COUNT(*) AS TongFollow FROM TheoDoiCuaHang WHERE MaCuaHang = @maCuaHang`);
      tongFollow = followResult.recordset[0].TongFollow;
    } catch (e) {}

    // Lấy danh mục sản phẩm của shop
    const categories = await pool.request()
      .input('maCuaHang', sql.Int, shopId)
      .query(`
        SELECT DISTINCT dm.MaDanhMuc, dm.TenDanhMuc, COUNT(sp.MaSanPham) AS SoSP
        FROM DanhMucSanPham dm
        JOIN SanPham sp ON sp.MaDanhMuc = dm.MaDanhMuc
        WHERE sp.MaCuaHang = @maCuaHang AND sp.TrangThai = N'HOAT_DONG'
        GROUP BY dm.MaDanhMuc, dm.TenDanhMuc
        ORDER BY dm.TenDanhMuc
      `);

    // Build product query with filters
    let whereClause = `sp.MaCuaHang = @maCuaHang AND sp.TrangThai = N'HOAT_DONG'`;
    if (danhMuc) {
      whereClause += ` AND sp.MaDanhMuc = @danhMuc`;
    }
    if (search) {
      whereClause += ` AND sp.TenSanPham LIKE N'%' + @search + N'%'`;
    }

    let orderClause;
    switch (sortBy) {
      case 'price-asc': orderClause = 'sp.GiaGoc ASC'; break;
      case 'price-desc': orderClause = 'sp.GiaGoc DESC'; break;
      case 'name': orderClause = 'sp.TenSanPham ASC'; break;
      case 'rating': orderClause = 'sp.DanhGiaTrungBinh DESC, sp.NgayTao DESC'; break;
      default: orderClause = 'sp.NgayTao DESC';
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Đếm tổng sản phẩm sau filter
    let countQuery = `
      SELECT COUNT(*) AS Total FROM SanPham sp WHERE ${whereClause}
    `;

    // Lấy sản phẩm
    let productQuery = `
      SELECT 
        sp.MaSanPham, sp.TenSanPham, sp.GiaGoc, sp.DanhGiaTrungBinh, sp.MoTa,
        (SELECT TOP 1 DuongDanAnh FROM HinhAnhSanPham WHERE MaSanPham = sp.MaSanPham AND LaAnhChinh = 1) AS AnhChinh,
        sp.NgayTao,
        (SELECT COUNT(*) FROM DanhGiaSanPham dg WHERE dg.MaSanPham = sp.MaSanPham) AS SoDanhGia
      FROM SanPham sp
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const countReq = pool.request().input('maCuaHang', sql.Int, shopId);
    const prodReq = pool.request().input('maCuaHang', sql.Int, shopId).input('offset', sql.Int, offset).input('limit', sql.Int, parseInt(limit));

    if (danhMuc) {
      countReq.input('danhMuc', sql.Int, parseInt(danhMuc));
      prodReq.input('danhMuc', sql.Int, parseInt(danhMuc));
    }
    if (search) {
      countReq.input('search', sql.NVarChar, search);
      prodReq.input('search', sql.NVarChar, search);
    }

    const [countResult, productsResult] = await Promise.all([
      countReq.query(countQuery),
      prodReq.query(productQuery)
    ]);

    const total = countResult.recordset[0].Total;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        shop,
        thongKe: { tongSP, tongFollow, totalSPFilter: total },
        danhMucs: categories.recordset,
        sanPhams: productsResult.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get shop page error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
