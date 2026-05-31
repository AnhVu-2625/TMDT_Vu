const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Lấy danh sách người dùng (Admin)
 *     security:
 *       - bearerAuth: []
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
 *         name: vaiTro
 *         schema: { type: string, enum: [NGUOI_DUNG, QUAN_TRI_VIEN] }
 *       - in: query
 *         name: trangThai
 *         schema: { type: string, enum: [CHUA_KICH_HOAT, HOAT_DONG, BI_KHOA] }
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            vaiTro = '',
            trangThai = ''
        } = req.query;

        const offset = (page - 1) * limit;
        const pool = await getPool();

        let whereClause = 'WHERE 1=1';

        if (search) {
            whereClause += ` AND (nd.HoTen LIKE N'%${search}%' OR nd.Email LIKE N'%${search}%' OR nd.SoDienThoai LIKE N'%${search}%')`;
        }

        if (vaiTro) {
            whereClause += ` AND nd.VaiTro = N'${vaiTro}'`;
        }

        if (trangThai) {
            whereClause += ` AND nd.TrangThai = N'${trangThai}'`;
        }

        const query = `
            SELECT 
                nd.MaNguoiDung,
                nd.HoTen,
                nd.Email,
                nd.SoDienThoai,
                nd.AnhDaiDien,
                nd.NgaySinh,
                nd.GioiTinh,
                nd.VaiTro,
                nd.TrangThai,
                nd.DiemTichLuy,
                nd.NgayTao,
                nd.NgayCapNhat,
                hv.TenHang as HangThanhVien,
                ch.MaCuaHang,
                ch.TenCuaHang,
                ch.TrangThai as TrangThaiCuaHang
            FROM NguoiDung nd
            LEFT JOIN HangThanhVien hv ON nd.MaHang = hv.MaHang
            LEFT JOIN CuaHang ch ON nd.MaNguoiDung = ch.MaNguoiDung
            ${whereClause}
            ORDER BY nd.NgayTao DESC
            OFFSET ${offset} ROWS
            FETCH NEXT ${limit} ROWS ONLY
        `;

        const result = await pool.request().query(query);

        // Đếm tổng số
        const countQuery = `
            SELECT COUNT(*) as Total
            FROM NguoiDung nd
            ${whereClause}
        `;
        const countResult = await pool.request().query(countQuery);
        const total = countResult.recordset[0].Total;

        res.json({
            success: true,
            data: {
                users: result.recordset,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách người dùng'
        });
    }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Xem chi tiết người dùng (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Chi tiết người dùng
 */
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();

        // Thông tin người dùng
        const userResult = await pool.request()
            .input('userId', sql.Int, id)
            .query(`
                SELECT 
                    nd.*,
                    hv.TenHang as HangThanhVien,
                    hv.PhanTramGiamGia
                FROM NguoiDung nd
                LEFT JOIN HangThanhVien hv ON nd.MaHang = hv.MaHang
                WHERE nd.MaNguoiDung = @userId
            `);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        const user = userResult.recordset[0];

        // Thông tin cửa hàng (nếu có)
        const shopResult = await pool.request()
            .input('userId', sql.Int, id)
            .query('SELECT * FROM CuaHang WHERE MaNguoiDung = @userId');

        // Địa chỉ giao hàng
        const addressResult = await pool.request()
            .input('userId', sql.Int, id)
            .query('SELECT * FROM DiaChiGiaoHang WHERE MaNguoiDung = @userId ORDER BY LaMacDinh DESC');

        // Thống kê đơn hàng
        const orderStatsResult = await pool.request()
            .input('userId', sql.Int, id)
            .query(`
                SELECT 
                    COUNT(*) as TongDonHang,
                    SUM(CASE WHEN TrangThaiDonHang = N'DA_GIAO' THEN 1 ELSE 0 END) as DonHangThanhCong,
                    SUM(CASE WHEN TrangThaiDonHang = N'DA_HUY' THEN 1 ELSE 0 END) as DonHangHuy,
                    SUM(CASE WHEN TrangThaiDonHang = N'DA_GIAO' THEN TienThanhToan ELSE 0 END) as TongChiTieu
                FROM DonHang
                WHERE MaNguoiDung = @userId
            `);

        res.json({
            success: true,
            data: {
                user,
                shop: shopResult.recordset.length > 0 ? shopResult.recordset[0] : null,
                addresses: addressResult.recordset,
                orderStats: orderStatsResult.recordset[0]
            }
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy chi tiết người dùng'
        });
    }
});

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   put:
 *     tags: [Admin - Users]
 *     summary: Khóa tài khoản người dùng (Admin)
 *     security:
 *       - bearerAuth: []
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
 *               lyDo:
 *                 type: string
 *                 example: Vi phạm chính sách
 *     responses:
 *       200:
 *         description: Khóa tài khoản thành công
 */
router.put('/:id/block', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { lyDo } = req.body;
        const pool = await getPool();

        // Kiểm tra user tồn tại
        const checkUser = await pool.request()
            .input('userId', sql.Int, id)
            .query('SELECT MaNguoiDung, HoTen, Email, TrangThai FROM NguoiDung WHERE MaNguoiDung = @userId');

        if (checkUser.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        const user = checkUser.recordset[0];

        if (user.TrangThai === 'BI_KHOA') {
            return res.status(400).json({
                success: false,
                message: 'Tài khoản đã bị khóa'
            });
        }

        // Khóa tài khoản
        await pool.request()
            .input('userId', sql.Int, id)
            .query("UPDATE NguoiDung SET TrangThai = N'BI_KHOA', NgayCapNhat = GETDATE() WHERE MaNguoiDung = @userId");

        // Tạo thông báo cho user
        await pool.request()
            .input('userId', sql.Int, id)
            .input('tieuDe', sql.NVarChar, 'Tài khoản bị khóa')
            .input('noiDung', sql.NVarChar, `Tài khoản của bạn đã bị khóa. Lý do: ${lyDo || 'Vi phạm chính sách'}`)
            .query(`
                INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao)
                VALUES (@userId, @tieuDe, @noiDung, N'HE_THONG')
            `);

        res.json({
            success: true,
            message: 'Đã khóa tài khoản người dùng'
        });
    } catch (error) {
        console.error('Lỗi khóa tài khoản:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khóa tài khoản'
        });
    }
});

/**
 * @swagger
 * /api/admin/users/{id}/unblock:
 *   put:
 *     tags: [Admin - Users]
 *     summary: Mở khóa tài khoản người dùng (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mở khóa tài khoản thành công
 */
router.put('/:id/unblock', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();

        // Kiểm tra user tồn tại
        const checkUser = await pool.request()
            .input('userId', sql.Int, id)
            .query('SELECT MaNguoiDung, TrangThai FROM NguoiDung WHERE MaNguoiDung = @userId');

        if (checkUser.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        const user = checkUser.recordset[0];

        if (user.TrangThai !== 'BI_KHOA') {
            return res.status(400).json({
                success: false,
                message: 'Tài khoản không bị khóa'
            });
        }

        // Mở khóa tài khoản
        await pool.request()
            .input('userId', sql.Int, id)
            .query("UPDATE NguoiDung SET TrangThai = N'HOAT_DONG', NgayCapNhat = GETDATE() WHERE MaNguoiDung = @userId");

        // Tạo thông báo cho user
        await pool.request()
            .input('userId', sql.Int, id)
            .query(`
                INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao)
                VALUES (@userId, N'Tài khoản được mở khóa', N'Tài khoản của bạn đã được mở khóa. Bạn có thể tiếp tục sử dụng dịch vụ.', N'HE_THONG')
            `);

        res.json({
            success: true,
            message: 'Đã mở khóa tài khoản người dùng'
        });
    } catch (error) {
        console.error('Lỗi mở khóa tài khoản:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi mở khóa tài khoản'
        });
    }
});

/**
 * @swagger
 * /api/admin/users/stats:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Thống kê người dùng (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê người dùng
 */
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request().query(`
            SELECT 
                COUNT(*) as TongNguoiDung,
                SUM(CASE WHEN TrangThai = N'HOAT_DONG' THEN 1 ELSE 0 END) as DangHoatDong,
                SUM(CASE WHEN TrangThai = N'BI_KHOA' THEN 1 ELSE 0 END) as BiKhoa,
                SUM(CASE WHEN TrangThai = N'CHUA_KICH_HOAT' THEN 1 ELSE 0 END) as ChuaKichHoat,
                SUM(CASE WHEN VaiTro = N'QUAN_TRI_VIEN' THEN 1 ELSE 0 END) as Admin,
                SUM(CASE WHEN EXISTS(SELECT 1 FROM CuaHang WHERE CuaHang.MaNguoiDung = NguoiDung.MaNguoiDung) THEN 1 ELSE 0 END) as NguoiBan,
                SUM(CASE WHEN DATEDIFF(day, NgayTao, GETDATE()) <= 7 THEN 1 ELSE 0 END) as DangKyTuanNay,
                SUM(CASE WHEN DATEDIFF(day, NgayTao, GETDATE()) <= 30 THEN 1 ELSE 0 END) as DangKyThangNay
            FROM NguoiDung
        `);

        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Lỗi thống kê người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi thống kê người dùng'
        });
    }
});

module.exports = router;
