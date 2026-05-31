const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/membership/levels:
 *   get:
 *     tags: [Membership]
 *     summary: Lấy danh sách các hạng thành viên
 *     responses:
 *       200:
 *         description: Danh sách hạng thành viên
 */
router.get('/levels', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT 
                MaHang,
                TenHang,
                DiemToiThieu,
                PhanTramGiamGia
            FROM HangThanhVien
            ORDER BY DiemToiThieu ASC
        `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách hạng thành viên:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách hạng thành viên'
        });
    }
});

/**
 * @swagger
 * /api/membership/my-level:
 *   get:
 *     tags: [Membership]
 *     summary: Lấy thông tin hạng thành viên của người dùng hiện tại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin hạng thành viên
 */
router.get('/my-level', authenticateToken, async (req, res) => {
    try {
        const pool = await getPool();

        // Lấy thông tin user và hạng hiện tại
        const userResult = await pool.request()
            .input('userId', sql.Int, req.user.userId)
            .query(`
                SELECT 
                    nd.MaNguoiDung,
                    nd.HoTen,
                    nd.DiemTichLuy,
                    nd.MaHang,
                    hv.TenHang,
                    hv.DiemToiThieu,
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

        // Lấy hạng tiếp theo
        const nextLevelResult = await pool.request()
            .input('currentPoints', sql.Int, user.DiemTichLuy)
            .query(`
                SELECT TOP 1
                    MaHang,
                    TenHang,
                    DiemToiThieu,
                    PhanTramGiamGia
                FROM HangThanhVien
                WHERE DiemToiThieu > @currentPoints
                ORDER BY DiemToiThieu ASC
            `);

        const nextLevel = nextLevelResult.recordset.length > 0 ? nextLevelResult.recordset[0] : null;

        // Tính điểm cần để lên hạng
        const pointsToNextLevel = nextLevel ? nextLevel.DiemToiThieu - user.DiemTichLuy : 0;

        res.json({
            success: true,
            data: {
                currentLevel: {
                    maHang: user.MaHang,
                    tenHang: user.TenHang,
                    diemToiThieu: user.DiemToiThieu,
                    phanTramGiamGia: user.PhanTramGiamGia
                },
                currentPoints: user.DiemTichLuy,
                nextLevel: nextLevel,
                pointsToNextLevel: pointsToNextLevel
            }
        });
    } catch (error) {
        console.error('Lỗi lấy thông tin hạng thành viên:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin hạng thành viên'
        });
    }
});

/**
 * @swagger
 * /api/membership/points-history:
 *   get:
 *     tags: [Membership]
 *     summary: Lấy lịch sử tích điểm
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Lịch sử tích điểm
 */
router.get('/points-history', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const pool = await getPool();

        // Lấy lịch sử từ đơn hàng đã giao
        const result = await pool.request()
            .input('userId', sql.Int, req.user.userId)
            .query(`
                SELECT 
                    dh.MaDonHang,
                    dh.TienThanhToan,
                    dh.DiemTichLuy as DiemNhan,
                    dh.NgayDatHang,
                    dh.TrangThaiDonHang,
                    N'Đơn hàng #' + CAST(dh.MaDonHang AS NVARCHAR) as MoTa
                FROM DonHang dh
                WHERE dh.MaNguoiDung = @userId 
                    AND dh.TrangThaiDonHang = N'DA_GIAO'
                    AND dh.DiemTichLuy > 0
                ORDER BY dh.NgayDatHang DESC
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY
            `);

        // Đếm tổng số
        const countResult = await pool.request()
            .input('userId', sql.Int, req.user.userId)
            .query(`
                SELECT COUNT(*) as Total
                FROM DonHang
                WHERE MaNguoiDung = @userId 
                    AND TrangThaiDonHang = N'DA_GIAO'
                    AND DiemTichLuy > 0
            `);

        const total = countResult.recordset[0].Total;

        res.json({
            success: true,
            data: {
                history: result.recordset,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Lỗi lấy lịch sử tích điểm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy lịch sử tích điểm'
        });
    }
});

/**
 * @swagger
 * /api/membership/calculate-points:
 *   post:
 *     tags: [Membership]
 *     summary: Tính điểm tích lũy cho đơn hàng
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderAmount
 *             properties:
 *               orderAmount:
 *                 type: number
 *                 example: 500000
 *     responses:
 *       200:
 *         description: Điểm tích lũy được tính
 */
router.post('/calculate-points', authenticateToken, async (req, res) => {
    try {
        const { orderAmount } = req.body;

        if (!orderAmount || orderAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền đơn hàng không hợp lệ'
            });
        }

        // Quy tắc: 1 điểm cho mỗi 10,000 VND
        const points = Math.floor(orderAmount / 10000);

        res.json({
            success: true,
            data: {
                orderAmount,
                pointsEarned: points,
                conversionRate: '1 điểm / 10,000 VND'
            }
        });
    } catch (error) {
        console.error('Lỗi tính điểm tích lũy:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi tính điểm tích lũy'
        });
    }
});

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

/**
 * @swagger
 * /api/membership/admin/levels:
 *   post:
 *     tags: [Admin - Membership]
 *     summary: Tạo hạng thành viên mới (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenHang
 *               - diemToiThieu
 *               - phanTramGiamGia
 *             properties:
 *               tenHang:
 *                 type: string
 *                 example: Vàng
 *               diemToiThieu:
 *                 type: integer
 *                 example: 1000
 *               phanTramGiamGia:
 *                 type: number
 *                 example: 5
 *     responses:
 *       201:
 *         description: Tạo hạng thành viên thành công
 */
router.post('/admin/levels', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { tenHang, diemToiThieu, phanTramGiamGia } = req.body;

        if (!tenHang || diemToiThieu === undefined || phanTramGiamGia === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        const pool = await getPool();

        // Kiểm tra trùng tên
        const checkName = await pool.request()
            .input('tenHang', sql.NVarChar, tenHang)
            .query('SELECT MaHang FROM HangThanhVien WHERE TenHang = @tenHang');

        if (checkName.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Tên hạng thành viên đã tồn tại'
            });
        }

        // Tạo hạng mới
        const result = await pool.request()
            .input('tenHang', sql.NVarChar, tenHang)
            .input('diemToiThieu', sql.Int, diemToiThieu)
            .input('phanTramGiamGia', sql.Decimal(5, 2), phanTramGiamGia)
            .query(`
                INSERT INTO HangThanhVien (TenHang, DiemToiThieu, PhanTramGiamGia)
                OUTPUT INSERTED.*
                VALUES (@tenHang, @diemToiThieu, @phanTramGiamGia)
            `);

        res.status(201).json({
            success: true,
            message: 'Tạo hạng thành viên thành công',
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Lỗi tạo hạng thành viên:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi tạo hạng thành viên'
        });
    }
});

/**
 * @swagger
 * /api/membership/admin/levels/{id}:
 *   put:
 *     tags: [Admin - Membership]
 *     summary: Cập nhật hạng thành viên (Admin)
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
 *               tenHang:
 *                 type: string
 *               diemToiThieu:
 *                 type: integer
 *               phanTramGiamGia:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/admin/levels/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { tenHang, diemToiThieu, phanTramGiamGia } = req.body;

        const pool = await getPool();

        // Kiểm tra hạng tồn tại
        const checkLevel = await pool.request()
            .input('maHang', sql.Int, id)
            .query('SELECT MaHang FROM HangThanhVien WHERE MaHang = @maHang');

        if (checkLevel.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hạng thành viên'
            });
        }

        // Cập nhật
        let updateQuery = 'UPDATE HangThanhVien SET ';
        const updates = [];
        const request = pool.request().input('maHang', sql.Int, id);

        if (tenHang !== undefined) {
            updates.push('TenHang = @tenHang');
            request.input('tenHang', sql.NVarChar, tenHang);
        }
        if (diemToiThieu !== undefined) {
            updates.push('DiemToiThieu = @diemToiThieu');
            request.input('diemToiThieu', sql.Int, diemToiThieu);
        }
        if (phanTramGiamGia !== undefined) {
            updates.push('PhanTramGiamGia = @phanTramGiamGia');
            request.input('phanTramGiamGia', sql.Decimal(5, 2), phanTramGiamGia);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có thông tin để cập nhật'
            });
        }

        updateQuery += updates.join(', ') + ' WHERE MaHang = @maHang';
        await request.query(updateQuery);

        res.json({
            success: true,
            message: 'Cập nhật hạng thành viên thành công'
        });
    } catch (error) {
        console.error('Lỗi cập nhật hạng thành viên:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật hạng thành viên'
        });
    }
});

/**
 * @swagger
 * /api/membership/admin/levels/{id}:
 *   delete:
 *     tags: [Admin - Membership]
 *     summary: Xóa hạng thành viên (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/admin/levels/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();

        // Kiểm tra có user nào đang dùng hạng này không
        const checkUsers = await pool.request()
            .input('maHang', sql.Int, id)
            .query('SELECT COUNT(*) as Total FROM NguoiDung WHERE MaHang = @maHang');

        if (checkUsers.recordset[0].Total > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa hạng thành viên đang có người dùng'
            });
        }

        // Xóa
        await pool.request()
            .input('maHang', sql.Int, id)
            .query('DELETE FROM HangThanhVien WHERE MaHang = @maHang');

        res.json({
            success: true,
            message: 'Xóa hạng thành viên thành công'
        });
    } catch (error) {
        console.error('Lỗi xóa hạng thành viên:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa hạng thành viên'
        });
    }
});

/**
 * Helper function: Tự động nâng hạng user dựa trên điểm tích lũy
 * Gọi hàm này sau khi cập nhật điểm cho user
 */
async function autoUpgradeMembership(userId) {
    try {
        const pool = await getPool();

        // Lấy điểm hiện tại của user
        const userResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT DiemTichLuy, MaHang FROM NguoiDung WHERE MaNguoiDung = @userId');

        if (userResult.recordset.length === 0) return;

        const user = userResult.recordset[0];

        // Tìm hạng phù hợp nhất với điểm hiện tại
        const levelResult = await pool.request()
            .input('points', sql.Int, user.DiemTichLuy)
            .query(`
                SELECT TOP 1 MaHang, TenHang
                FROM HangThanhVien
                WHERE DiemToiThieu <= @points
                ORDER BY DiemToiThieu DESC
            `);

        if (levelResult.recordset.length === 0) return;

        const newLevel = levelResult.recordset[0];

        // Nếu hạng mới khác hạng hiện tại, cập nhật
        if (newLevel.MaHang !== user.MaHang) {
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('maHang', sql.Int, newLevel.MaHang)
                .query('UPDATE NguoiDung SET MaHang = @maHang, NgayCapNhat = GETDATE() WHERE MaNguoiDung = @userId');

            // Tạo thông báo cho user
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('tieuDe', sql.NVarChar, 'Chúc mừng nâng hạng!')
                .input('noiDung', sql.NVarChar, `Bạn đã được nâng lên hạng ${newLevel.TenHang}. Hãy tận hưởng các ưu đãi đặc biệt!`)
                .query(`
                    INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao)
                    VALUES (@userId, @tieuDe, @noiDung, N'HE_THONG')
                `);

            console.log(`✨ User ${userId} upgraded to ${newLevel.TenHang}`);
        }
    } catch (error) {
        console.error('Lỗi tự động nâng hạng:', error);
    }
}

// Export helper function
router.autoUpgradeMembership = autoUpgradeMembership;

module.exports = router;
