const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireSeller } = require('../middleware/auth');
const { validateProduct, validateProductVariant } = require('../utils/validators');

// ─── Multer config: upload ảnh sản phẩm ──────────────────────────────────
const productImageDir = path.join(__dirname, '..', '..', 'uploads', 'products');
if (!fs.existsSync(productImageDir)) fs.mkdirSync(productImageDir, { recursive: true });

const productImageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, productImageDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`);
  }
});
const uploadProductImage = multer({
  storage: productImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(ext && mime ? null : new Error('Chỉ chấp nhận file ảnh (jpg/png/webp)'), ext && mime);
  }
});

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
            shop = '',
            category = '',
            minPrice = '',
            maxPrice = '',
            sortBy = 'NgayTao',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const pool = await getPool();

        // Whitelist sort columns to prevent SQL injection
        const allowedSortColumns = ['NgayTao', 'GiaGoc', 'DanhGiaTrungBinh', 'TenSanPham'];
        const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'NgayTao';
        const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

        let whereClause = "WHERE sp.TrangThai = N'HOAT_DONG'";
        
        if (search) {
            whereClause += ` AND sp.TenSanPham LIKE N'%' + @search + N'%'`;
        }

        if (shop) {
            // Support both shop ID and shop name
            whereClause += ` AND (ch.MaCuaHang = @shopId OR ch.TenCuaHang LIKE N'%' + @shopName + N'%')`;
        }
        
        if (category) {
            const catId = parseInt(category);
            if (!isNaN(catId)) {
                whereClause += ` AND (sp.MaDanhMuc = ${catId} OR sp.MaDanhMuc IN (SELECT MaDanhMuc FROM DanhMucSanPham WHERE MaDanhMucCha = ${catId}))`;
            }
        }

        if (minPrice !== '' && maxPrice !== '') {
            const pMin = parseFloat(minPrice);
            const pMax = parseFloat(maxPrice);
            if (pMin > 0 || pMax < 999999999) {
                whereClause += ` AND EXISTS (
                    SELECT 1 FROM PhienBanSanPham WHERE MaSanPham = sp.MaSanPham 
                    AND GiaBan >= ${pMin} AND GiaBan <= ${pMax}
                )`;
            }
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
                ISNULL(
                    (SELECT TOP 1 DuongDanAnh FROM HinhAnhSanPham WHERE MaSanPham = sp.MaSanPham AND LaAnhChinh = 1),
                    '/placeholder.svg?text=📦'
                ) as AnhChinh,
                (SELECT MIN(GiaBan) FROM PhienBanSanPham WHERE MaSanPham = sp.MaSanPham) as GiaThapNhat,
                (SELECT MAX(GiaBan) FROM PhienBanSanPham WHERE MaSanPham = sp.MaSanPham) as GiaCaoNhat,
                (SELECT SUM(SoLuongTonKho) FROM PhienBanSanPham WHERE MaSanPham = sp.MaSanPham) as TongTonKho
            FROM SanPham sp
            LEFT JOIN CuaHang ch ON sp.MaCuaHang = ch.MaCuaHang
            LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
            ${whereClause}
            ORDER BY sp.${safeSortBy} ${safeSortOrder}
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;

        const request = pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, parseInt(limit));
        
        if (search) request.input('search', sql.NVarChar, search);
        if (shop) {
            request.input('shopId', sql.Int, isNaN(parseInt(shop)) ? 0 : parseInt(shop));
            request.input('shopName', sql.NVarChar, shop);
        }
        if (category) request.input('category', sql.Int, parseInt(category));

        const result = await request.query(query);

        // Đếm tổng số sản phẩm
        const countRequest = pool.request();
        if (search) countRequest.input('search', sql.NVarChar, search);
        if (shop) {
            countRequest.input('shopId', sql.Int, isNaN(parseInt(shop)) ? 0 : parseInt(shop));
            countRequest.input('shopName', sql.NVarChar, shop);
        }

        const countQuery = `
            SELECT COUNT(*) as Total
            FROM SanPham sp
            LEFT JOIN CuaHang ch ON sp.MaCuaHang = ch.MaCuaHang
            ${whereClause}
        `;
        const countResult = await countRequest.query(countQuery);
        const total = countResult.recordset[0].Total;

        res.json({
            success: true,
            data: {
                products: result.recordset,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
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
 * /api/products/shops/{shopId}:
 *   get:
 *     tags: [Products]
 *     summary: Lấy thông tin cửa hàng
 *     security: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Thông tin cửa hàng
 *       404:
 *         description: Không tìm thấy cửa hàng
 */
router.get('/shops/:shopId', async (req, res) => {
    try {
        const { shopId } = req.params;
        const pool = await getPool();

        const result = await pool.request()
            .input('MaCuaHang', sql.Int, parseInt(shopId))
            .query(`
                SELECT 
                    MaCuaHang,
                    TenCuaHang,
                    MoTa,
                    Logo,
                    SoDuVi,
                    DiaChiCuaHang,
                    TrangThai,
                    NgayDangKy,
                    MaNguoiDung
                FROM CuaHang
                WHERE MaCuaHang = @MaCuaHang AND TrangThai = N'HOAT_DONG'
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy cửa hàng' });
        }

        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Get shop error:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy thông tin cửa hàng' });
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
// GET /api/products/categories/all - Lấy danh mục
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

// GET /api/products/seller - Lấy sản phẩm thuộc shop của seller
router.get('/seller', authenticateToken, requireSeller, async (req, res) => {
    try {
        const pool = await getPool();
        const maCuaHang = req.shop.MaCuaHang;

        const result = await pool.request()
            .input('MaCuaHang', sql.Int, maCuaHang)
            .query(`
                SELECT sp.MaSanPham, sp.TenSanPham, sp.DuongDan, sp.MoTa, sp.GiaGoc,
                       sp.DanhGiaTrungBinh, sp.NgayTao, sp.TrangThai,
                       ch.TenCuaHang, dm.TenDanhMuc, dm.MaDanhMuc,
                       ISNULL((SELECT TOP 1 DuongDanAnh FROM HinhAnhSanPham WHERE MaSanPham = sp.MaSanPham AND LaAnhChinh = 1), '') as AnhChinh
                FROM SanPham sp
                LEFT JOIN CuaHang ch ON sp.MaCuaHang = ch.MaCuaHang
                LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
                WHERE sp.MaCuaHang = @MaCuaHang
                ORDER BY sp.NgayTao DESC
            `);

        res.json({ success: true, data: { products: result.recordset } });
    } catch (error) {
        console.error('Lỗi lấy sản phẩm của seller:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy sản phẩm của seller' });
    }
});
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

        const maSanPham = result.recordset[0].MaSanPham;

        // Tự động tạo 1 phiên bản mặc định (để có thể bán được ngay)
        await pool.request()
            .input('MaSanPham', sql.Int, maSanPham)
            .input('GiaBan', sql.Decimal(15, 2), giaGoc)
            .input('SoLuongTonKho', sql.Int, 0)
            .query(`
                INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho)
                VALUES (@MaSanPham, NULL, NULL, @GiaBan, @SoLuongTonKho)
            `);

        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: {
                maSanPham: maSanPham
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

// DELETE /api/products/:id - Xóa sản phẩm (vĩnh viễn)
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

        // Xóa các bảng liên quan trước
        await pool.request()
            .input('MaSanPham', sql.Int, id)
            .query('DELETE FROM HinhAnhSanPham WHERE MaSanPham = @MaSanPham');

        await pool.request()
            .input('MaSanPham', sql.Int, id)
            .query('DELETE FROM PhienBanSanPham WHERE MaSanPham = @MaSanPham');

        await pool.request()
            .input('MaSanPham', sql.Int, id)
            .query('DELETE FROM DanhGiaSanPham WHERE MaSanPham = @MaSanPham');

        // Xóa sản phẩm
        await pool.request()
            .input('MaSanPham', sql.Int, id)
            .query('DELETE FROM SanPham WHERE MaSanPham = @MaSanPham');

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

// POST /api/products/:id/upload-image - Upload ảnh sản phẩm
/**
 * @swagger
 * /api/products/{id}/upload-image:
 *   post:
 *     tags: [Products]
 *     summary: Upload ảnh sản phẩm
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               laAnhChinh:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Upload ảnh thành công
 */
router.post('/:id/upload-image', authenticateToken, requireSeller, uploadProductImage.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { laAnhChinh } = req.body;
        const maCuaHang = req.shop.MaCuaHang;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn file ảnh'
            });
        }

        const pool = await getPool();

        // Kiểm tra quyền sở hữu
        const checkResult = await pool.request()
            .input('MaSanPham', sql.Int, id)
            .input('MaCuaHang', sql.Int, maCuaHang)
            .query('SELECT MaSanPham FROM SanPham WHERE MaSanPham = @MaSanPham AND MaCuaHang = @MaCuaHang');

        if (checkResult.recordset.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền upload ảnh cho sản phẩm này'
            });
        }

        const imageUrl = `/uploads/products/${req.file.filename}`;
        const isMainImage = laAnhChinh === 'true' || laAnhChinh === true;

        // Nếu là ảnh chính, set các ảnh khác không phải chính
        if (isMainImage) {
            await pool.request()
                .input('MaSanPham', sql.Int, id)
                .query('UPDATE HinhAnhSanPham SET LaAnhChinh = 0 WHERE MaSanPham = @MaSanPham');
        }

        // Thêm ảnh mới
        const result = await pool.request()
            .input('MaSanPham', sql.Int, id)
            .input('DuongDanAnh', sql.NVarChar, imageUrl)
            .input('LaAnhChinh', sql.Bit, isMainImage ? 1 : 0)
            .query(`
                INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh)
                OUTPUT INSERTED.MaHinhAnh
                VALUES (@MaSanPham, @DuongDanAnh, @LaAnhChinh)
            `);

        res.status(201).json({
            success: true,
            message: 'Upload ảnh thành công',
            data: {
                maHinhAnh: result.recordset[0].MaHinhAnh,
                urlAnh: imageUrl
            }
        });
    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi upload ảnh sản phẩm'
        });
    }
});

module.exports = router;