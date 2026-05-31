const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireSeller } = require('../middleware/auth');
const { validateProduct, validateProductVariant } = require('../utils/validators');

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Lấy danh sách sản phẩm
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: integer }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: NgayTao }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [ASC, DESC], default: DESC }
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm có phân trang
 */
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            category = '',
            minPrice = 0,
            maxPrice = 999999999,
            sortBy = 'NgayTao',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const pool = await getPool();

        let whereClause = "WHERE sp.TrangThai = N'HOAT_DONG'";
        
        if (search) {
            whereClause += ` AND sp.TenSanPham LIKE N'%${search}%'`;
        }
        
        if (category) {
            whereClause += ` AND sp.MaDanhMuc = ${category}`;
        }

        const query = `
            SELECT 
                sp.MaSanPham,
                sp.TenSanPham,
                sp.DuongDan,
                sp.MoTa,
                sp.GiaGoc,
                sp.DanhGiaTrungBinh,
                sp.NgayTao,
                ch.TenCuaHang,
                ch.MaCuaHang,
                dm.TenDanhMuc,
                (SELECT TOP 1 DuongDanAnh FROM HinhAnhSanPham WHERE MaSanPham = sp.MaSanPham AND LaAnhChinh = 1) as AnhChinh,
                (SELECT MIN(GiaBan) FROM PhienBanSanPham WHERE MaSanPham = sp.MaSanPham) as GiaThapNhat,
                (SELECT MAX(GiaBan) FROM PhienBanSanPham WHERE MaSanPham = sp.MaSanPham) as GiaCaoNhat,
                (SELECT SUM(SoLuongTonKho) FROM PhienBanSanPham WHERE MaSanPham = sp.MaSanPham) as TongTonKho
            FROM SanPham sp
            LEFT JOIN CuaHang ch ON sp.MaCuaHang = ch.MaCuaHang
            LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
            ${whereClause}
            AND EXISTS (
                SELECT 1 FROM PhienBanSanPham WHERE MaSanPham = sp.MaSanPham 
                AND GiaBan >= ${minPrice} AND GiaBan <= ${maxPrice}
            )
            ORDER BY sp.${sortBy} ${sortOrder}
            OFFSET ${offset} ROWS
            FETCH NEXT ${limit} ROWS ONLY
        `;

        const result = await pool.request().query(query);

        // Đếm tổng số sản phẩm
        const countQuery = `
            SELECT COUNT(*) as Total
            FROM SanPham sp
            ${whereClause}
        `;
        const countResult = await pool.request().query(countQuery);
        const total = countResult.recordset[0].Total;

        res.json({
            success: true,
            data: {
                products: result.recordset,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách sản phẩm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách sản phẩm'
        });
    }
});

/**
 * @swagger
 * /api/products/categories/all:
 *   get:
 *     tags: [Products]
 *     summary: Lấy tất cả danh mục sản phẩm
 *     security: []
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 */
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Lấy chi tiết sản phẩm
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Mã sản phẩm
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm kèm hình ảnh, phiên bản, đánh giá
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();

        // Lấy thông tin sản phẩm
        const productResult = await pool.request()
            .input('MaSanPham', sql.Int, id)
            .query(`
                SELECT 
                    sp.*,
                    ch.TenCuaHang,
                    ch.MaCuaHang,
                    ch.Logo as LogoCuaHang,
                    dm.TenDanhMuc
                FROM SanPham sp
                LEFT JOIN CuaHang ch ON sp.MaCuaHang = ch.MaCuaHang
                LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
                WHERE sp.MaSanPham = @MaSanPham
            `);

        if (productResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const product = productResult.recordset[0];

        // Lấy hình ảnh
        const imagesResult = await pool.request()
            .input('MaSanPham', sql.Int, id)
            .query('SELECT * FROM HinhAnhSanPham WHERE MaSanPham = @MaSanPham ORDER BY LaAnhChinh DESC');

        // Lấy phiên bản
        const variantsResult = await pool.request()
            .input('MaSanPham', sql.Int, id)
            .query('SELECT * FROM PhienBanSanPham WHERE MaSanPham = @MaSanPham');

        // Lấy đánh giá
        const reviewsResult = await pool.request()
            .input('MaSanPham', sql.Int, id)
            .query(`
                SELECT 
                    dg.*,
                    nd.HoTen,
                    nd.AnhDaiDien
                FROM DanhGiaSanPham dg
                LEFT JOIN NguoiDung nd ON dg.MaNguoiDung = nd.MaNguoiDung
                WHERE dg.MaSanPham = @MaSanPham
                ORDER BY dg.NgayTao DESC
            `);

        res.json({
            success: true,
            data: {
                ...product,
                hinhAnh: imagesResult.recordset,
                phienBan: variantsResult.recordset,
                danhGia: reviewsResult.recordset
            }
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết sản phẩm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy chi tiết sản phẩm'
        });
    }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Tạo sản phẩm mới (Seller)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tenSanPham, giaGoc]
 *             properties:
 *               tenSanPham:
 *                 type: string
 *                 example: Áo thún nam
 *               moTa:
 *                 type: string
 *               giaGoc:
 *                 type: number
 *                 example: 299000
 *               maDanhMuc:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
 *       401:
 *         description: Chưa xác thực
 */
router.post('/', authenticateToken, requireSeller, validateProduct, async (req, res) => {
    try {
        const { tenSanPham, moTa, giaGoc, maDanhMuc } = req.body;
        const maCuaHang = req.shop.MaCuaHang;
        const pool = await getPool();

        // Tạo đường dẫn từ tên sản phẩm
        const duongDan = tenSanPham
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-' + Date.now();

        const result = await pool.request()
            .input('MaCuaHang', sql.Int, maCuaHang)
            .input('MaDanhMuc', sql.Int, maDanhMuc || null)
            .input('TenSanPham', sql.NVarChar, tenSanPham)
            .input('DuongDan', sql.NVarChar, duongDan)
            .input('MoTa', sql.NVarChar, moTa)
            .input('GiaGoc', sql.Decimal(15, 2), giaGoc)
            .query(`
                INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc)
                OUTPUT INSERTED.MaSanPham
                VALUES (@MaCuaHang, @MaDanhMuc, @TenSanPham, @DuongDan, @MoTa, @GiaGoc)
            `);

        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: {
                maSanPham: result.recordset[0].MaSanPham
            }
        });
    } catch (error) {
        console.error('Lỗi tạo sản phẩm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi tạo sản phẩm'
        });
    }
});

// PUT /api/products/:id - Cập nhật sản phẩm
router.put('/:id', authenticateToken, requireSeller, validateProduct, async (req, res) => {
    try {
        const { id } = req.params;
        const { tenSanPham, moTa, giaGoc, maDanhMuc, trangThai } = req.body;
        const maCuaHang = req.shop.MaCuaHang;
        const pool = await getPool();

        // Kiểm tra quyền sở hữu
        const checkResult = await pool.request()
            .input('MaSanPham', sql.Int, id)
            .input('MaCuaHang', sql.Int, maCuaHang)
            .query('SELECT MaSanPham FROM SanPham WHERE MaSanPham = @MaSanPham AND MaCuaHang = @MaCuaHang');

        if (checkResult.recordset.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền cập nhật sản phẩm này'
            });
        }

        await pool.request()
            .input('MaSanPham', sql.Int, id)
            .input('TenSanPham', sql.NVarChar, tenSanPham)
            .input('MoTa', sql.NVarChar, moTa)
            .input('GiaGoc', sql.Decimal(15, 2), giaGoc)
            .input('MaDanhMuc', sql.Int, maDanhMuc || null)
            .input('TrangThai', sql.NVarChar, trangThai || 'HOAT_DONG')
            .query(`
                UPDATE SanPham
                SET TenSanPham = @TenSanPham,
                    MoTa = @MoTa,
                    GiaGoc = @GiaGoc,
                    MaDanhMuc = @MaDanhMuc,
                    TrangThai = @TrangThai,
                    NgayCapNhat = GETDATE()
                WHERE MaSanPham = @MaSanPham
            `);

        res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công'
        });
    } catch (error) {
        console.error('Lỗi cập nhật sản phẩm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật sản phẩm'
        });
    }
});

// DELETE /api/products/:id - Xóa sản phẩm (ẩn)
router.delete('/:id', authenticateToken, requireSeller, async (req, res) => {
    try {
        const { id } = req.params;
        const maCuaHang = req.shop.MaCuaHang;
        const pool = await getPool();

        // Kiểm tra quyền sở hữu
        const checkResult = await pool.request()
            .input('MaSanPham', sql.Int, id)
            .input('MaCuaHang', sql.Int, maCuaHang)
            .query('SELECT MaSanPham FROM SanPham WHERE MaSanPham = @MaSanPham AND MaCuaHang = @MaCuaHang');

        if (checkResult.recordset.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa sản phẩm này'
            });
        }

        await pool.request()
            .input('MaSanPham', sql.Int, id)
            .query("UPDATE SanPham SET TrangThai = N'AN' WHERE MaSanPham = @MaSanPham");

        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error) {
        console.error('Lỗi xóa sản phẩm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa sản phẩm'
        });
    }
});

// POST /api/products/:id/variants - Thêm phiên bản sản phẩm
router.post('/:id/variants', authenticateToken, requireSeller, validateProductVariant, async (req, res) => {
    try {
        const { id } = req.params;
        const { mauSac, kichThuoc, giaBan, soLuongTonKho } = req.body;
        const maCuaHang = req.shop.MaCuaHang;
        const pool = await getPool();

        // Kiểm tra quyền sở hữu
        const checkResult = await pool.request()
            .input('MaSanPham', sql.Int, id)
            .input('MaCuaHang', sql.Int, maCuaHang)
            .query('SELECT MaSanPham FROM SanPham WHERE MaSanPham = @MaSanPham AND MaCuaHang = @MaCuaHang');

        if (checkResult.recordset.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thêm phiên bản cho sản phẩm này'
            });
        }

        const result = await pool.request()
            .input('MaSanPham', sql.Int, id)
            .input('MauSac', sql.NVarChar, mauSac || null)
            .input('KichThuoc', sql.NVarChar, kichThuoc || null)
            .input('GiaBan', sql.Decimal(15, 2), giaBan)
            .input('SoLuongTonKho', sql.Int, soLuongTonKho)
            .query(`
                INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho)
                OUTPUT INSERTED.MaPhienBan
                VALUES (@MaSanPham, @MauSac, @KichThuoc, @GiaBan, @SoLuongTonKho)
            `);

        res.status(201).json({
            success: true,
            message: 'Thêm phiên bản sản phẩm thành công',
            data: {
                maPhienBan: result.recordset[0].MaPhienBan
            }
        });
    } catch (error) {
        console.error('Lỗi thêm phiên bản:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi thêm phiên bản sản phẩm'
        });
    }
});

// GET /api/products/categories - Lấy danh mục
router.get('/categories/all', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT * FROM DanhMucSanPham
            ORDER BY TenDanhMuc
        `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Lỗi lấy danh mục:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh mục'
        });
    }
});

module.exports = router;
