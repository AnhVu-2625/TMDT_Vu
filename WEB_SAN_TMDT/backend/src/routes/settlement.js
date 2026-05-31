/**
 * SETTLEMENT ROUTES
 * Quản lý đối soát & chia tiền
 */

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const sql = require('mssql');
const { getPool } = require('../config/database');

/**
 * @swagger
 * /api/settlements/eligible-orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng đủ điều kiện đối soát (Admin)
 *     tags: [Settlement]
 *     security:
 *       - bearerAuth: []
 */
router.get('/eligible-orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { tuNgay, denNgay, maCuaHang } = req.query;
        const pool = await getPool();

        // Lấy số ngày đổi trả từ cấu hình
        const configResult = await pool.request()
            .query(`SELECT GiaTri FROM CauHinhHeThong WHERE TenCauHinh = N'SO_NGAY_DOI_TRA'`);
        
        const soNgayDoiTra = parseInt(configResult.recordset[0]?.GiaTri || 7);

        let query = `
            SELECT 
                dh.MaDonHang,
                dh.MaCuaHang,
                ch.TenCuaHang,
                dh.TienThanhToan,
                dh.NgayCapNhat as NgayGiaoHang,
                dh.NgayHetHanDoiTra,
                dh.DaDoiSoat,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM YeuCauDoiTra 
                        WHERE MaDonHang = dh.MaDonHang 
                        AND TrangThai NOT IN (N'DA_GIAI_QUYET')
                    ) THEN 1 
                    ELSE 0 
                END as DangCoTrancChap
            FROM DonHang dh
            INNER JOIN CuaHang ch ON dh.MaCuaHang = ch.MaCuaHang
            WHERE dh.TrangThaiDonHang = N'DA_GIAO'
                AND dh.TrangThaiThanhToan = N'DA_THANH_TOAN'
                AND dh.DaDoiSoat = 0
                AND dh.NgayHetHanDoiTra < GETDATE()
                AND NOT EXISTS (
                    SELECT 1 FROM YeuCauDoiTra 
                    WHERE MaDonHang = dh.MaDonHang 
                    AND TrangThai NOT IN (N'DA_GIAI_QUYET')
                )
        `;

        if (tuNgay) {
            query += ` AND dh.NgayCapNhat >= @tuNgay`;
        }
        if (denNgay) {
            query += ` AND dh.NgayCapNhat <= @denNgay`;
        }
        if (maCuaHang) {
            query += ` AND dh.MaCuaHang = @maCuaHang`;
        }

        query += ` ORDER BY dh.NgayCapNhat DESC`;

        const request = pool.request();
        if (tuNgay) request.input('tuNgay', sql.DateTime, tuNgay);
        if (denNgay) request.input('denNgay', sql.DateTime, denNgay);
        if (maCuaHang) request.input('maCuaHang', sql.Int, maCuaHang);

        const result = await request.query(query);

        // Debug: Log dữ liệu trả về
        console.log('🔍 Eligible orders data:', JSON.stringify(result.recordset.slice(0, 2), null, 2));

        // Format ngày tháng cho frontend
        const formattedOrders = result.recordset.map(order => ({
            ...order,
            NgayGiaoHang: order.NgayGiaoHang ? order.NgayGiaoHang.toISOString() : null,
            NgayHetHanDoiTra: order.NgayHetHanDoiTra ? order.NgayHetHanDoiTra.toISOString() : null
        }));

        // Tính tổng
        const tongDonHang = formattedOrders.length;
        const tongDoanhThu = formattedOrders.reduce((sum, order) => sum + parseFloat(order.TienThanhToan), 0);

        // Lấy phí sàn
        const phiSanResult = await pool.request()
            .query(`SELECT GiaTri FROM CauHinhHeThong WHERE TenCauHinh = N'PHI_SAN_PHAN_TRAM'`);
        const phanTramPhiSan = parseFloat(phiSanResult.recordset[0]?.GiaTri || 5);

        const tongPhiSan = tongDoanhThu * (phanTramPhiSan / 100);
        const tongChiTra = tongDoanhThu - tongPhiSan;

        res.json({
            success: true,
            data: {
                orders: formattedOrders,
                summary: {
                    tongDonHang,
                    tongDoanhThu: tongDoanhThu.toFixed(2),
                    phanTramPhiSan,
                    tongPhiSan: tongPhiSan.toFixed(2),
                    tongChiTra: tongChiTra.toFixed(2)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching eligible orders:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * @swagger
 * /api/settlements:
 *   post:
 *     summary: Tạo phiên đối soát mới (Admin)
 *     tags: [Settlement]
 *     security:
 *       - bearerAuth: []
 */
router.post('/',
    authenticateToken,
    requireAdmin,
    [
        body('tenPhien').notEmpty().withMessage('Tên phiên là bắt buộc'),
        body('tuNgay').isISO8601().withMessage('Từ ngày không hợp lệ'),
        body('denNgay').isISO8601().withMessage('Đến ngày không hợp lệ'),
        body('ghiChu').optional()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const transaction = new sql.Transaction(await getPool());

        try {
            const { tenPhien, tuNgay, denNgay, ghiChu } = req.body;
            const adminId = req.user.userId;

            await transaction.begin();

            // Lấy phí sàn
            const phiSanResult = await transaction.request()
                .query(`SELECT GiaTri FROM CauHinhHeThong WHERE TenCauHinh = N'PHI_SAN_PHAN_TRAM'`);
            const phanTramPhiSan = parseFloat(phiSanResult.recordset[0]?.GiaTri || 5);

            // Lấy các đơn hàng đủ điều kiện
            const ordersResult = await transaction.request()
                .input('tuNgay', sql.DateTime, tuNgay)
                .input('denNgay', sql.DateTime, denNgay)
                .query(`
                    SELECT 
                        dh.MaDonHang,
                        dh.MaCuaHang,
                        dh.TienThanhToan
                    FROM DonHang dh
                    WHERE dh.TrangThaiDonHang = N'DA_GIAO'
                        AND dh.TrangThaiThanhToan = N'DA_THANH_TOAN'
                        AND dh.DaDoiSoat = 0
                        AND dh.NgayHetHanDoiTra < GETDATE()
                        AND dh.NgayCapNhat >= @tuNgay
                        AND dh.NgayCapNhat <= @denNgay
                        AND NOT EXISTS (
                            SELECT 1 FROM YeuCauDoiTra 
                            WHERE MaDonHang = dh.MaDonHang 
                            AND TrangThai NOT IN (N'DA_GIAI_QUYET')
                        )
                `);

            const orders = ordersResult.recordset;

            if (orders.length === 0) {
                await transaction.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: 'Không có đơn hàng nào đủ điều kiện đối soát trong khoảng thời gian này' 
                });
            }

            // Tính tổng
            const tongDonHang = orders.length;
            const tongDoanhThu = orders.reduce((sum, order) => sum + parseFloat(order.TienThanhToan), 0);
            const tongPhiSan = tongDoanhThu * (phanTramPhiSan / 100);
            const tongChiTra = tongDoanhThu - tongPhiSan;

            // Tạo phiên đối soát
            const phienResult = await transaction.request()
                .input('tenPhien', sql.NVarChar, tenPhien)
                .input('tuNgay', sql.DateTime, tuNgay)
                .input('denNgay', sql.DateTime, denNgay)
                .input('tongDonHang', sql.Int, tongDonHang)
                .input('tongDoanhThu', sql.Decimal(15, 2), tongDoanhThu)
                .input('tongPhiSan', sql.Decimal(15, 2), tongPhiSan)
                .input('tongChiTra', sql.Decimal(15, 2), tongChiTra)
                .input('nguoiThucHien', sql.Int, adminId)
                .input('ghiChu', sql.NVarChar, ghiChu || null)
                .query(`
                    INSERT INTO PhienDoiSoat (TenPhien, TuNgay, DenNgay, TongDonHang, TongDoanhThu, TongPhiSan, TongChiTraNguoiBan, NguoiThucHien, GhiChu)
                    OUTPUT INSERTED.MaPhienDoiSoat
                    VALUES (@tenPhien, @tuNgay, @denNgay, @tongDonHang, @tongDoanhThu, @tongPhiSan, @tongChiTra, @nguoiThucHien, @ghiChu)
                `);

            const maPhienDoiSoat = phienResult.recordset[0].MaPhienDoiSoat;

            // Tạo chi tiết đối soát cho từng đơn hàng
            for (const order of orders) {
                const doanhThu = parseFloat(order.TienThanhToan);
                const phiSan = doanhThu * (phanTramPhiSan / 100);
                const tienThucNhan = doanhThu - phiSan;

                await transaction.request()
                    .input('maPhienDoiSoat', sql.Int, maPhienDoiSoat)
                    .input('maCuaHang', sql.Int, order.MaCuaHang)
                    .input('maDonHang', sql.Int, order.MaDonHang)
                    .input('doanhThu', sql.Decimal(15, 2), doanhThu)
                    .input('phiSan', sql.Decimal(15, 2), phiSan)
                    .input('tienThucNhan', sql.Decimal(15, 2), tienThucNhan)
                    .query(`
                        INSERT INTO ChiTietDoiSoat (MaPhienDoiSoat, MaCuaHang, MaDonHang, DoanhThu, PhiSan, TienThucNhan)
                        VALUES (@maPhienDoiSoat, @maCuaHang, @maDonHang, @doanhThu, @phiSan, @tienThucNhan)
                    `);

                // Đánh dấu đơn hàng đã đối soát
                await transaction.request()
                    .input('maDonHang', sql.Int, order.MaDonHang)
                    .input('maPhienDoiSoat', sql.Int, maPhienDoiSoat)
                    .query(`
                        UPDATE DonHang
                        SET DaDoiSoat = 1, MaPhienDoiSoat = @maPhienDoiSoat
                        WHERE MaDonHang = @maDonHang
                    `);
            }

            await transaction.commit();

            res.json({
                success: true,
                message: 'Tạo phiên đối soát thành công',
                data: {
                    maPhienDoiSoat,
                    tongDonHang,
                    tongDoanhThu: tongDoanhThu.toFixed(2),
                    tongPhiSan: tongPhiSan.toFixed(2),
                    tongChiTra: tongChiTra.toFixed(2)
                }
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error creating settlement:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
);

/**
 * @swagger
 * /api/settlements:
 *   get:
 *     summary: Lấy danh sách phiên đối soát (Admin)
 *     tags: [Settlement]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { trangThai, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const pool = await getPool();

        let query = `
            SELECT 
                ps.*,
                nd.HoTen as TenNguoiThucHien
            FROM PhienDoiSoat ps
            LEFT JOIN NguoiDung nd ON ps.NguoiThucHien = nd.MaNguoiDung
            WHERE 1=1
        `;

        if (trangThai) {
            query += ` AND ps.TrangThai = @trangThai`;
        }

        query += ` ORDER BY ps.NgayTao DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

        const result = await pool.request()
            .input('trangThai', sql.NVarChar, trangThai)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(query);

        // Đếm tổng
        let countQuery = `SELECT COUNT(*) as total FROM PhienDoiSoat WHERE 1=1`;
        if (trangThai) {
            countQuery += ` AND TrangThai = @trangThai`;
        }

        const countResult = await pool.request()
            .input('trangThai', sql.NVarChar, trangThai)
            .query(countQuery);

        // Format ngày tháng cho frontend
        const formattedSessions = result.recordset.map(session => ({
            ...session,
            TuNgay: session.TuNgay ? session.TuNgay.toISOString() : null,
            DenNgay: session.DenNgay ? session.DenNgay.toISOString() : null,
            NgayTao: session.NgayTao ? session.NgayTao.toISOString() : null,
            NgayHoanThanh: session.NgayHoanThanh ? session.NgayHoanThanh.toISOString() : null
        }));

        res.json({
            success: true,
            data: formattedSessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.recordset[0].total
            }
        });

    } catch (error) {
        console.error('Error fetching settlements:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * @swagger
 * /api/settlements/{id}:
 *   get:
 *     summary: Xem chi tiết phiên đối soát (Admin)
 *     tags: [Settlement]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();

        // Lấy thông tin phiên
        const phienResult = await pool.request()
            .input('maPhienDoiSoat', sql.Int, id)
            .query(`
                SELECT 
                    ps.*,
                    nd.HoTen as TenNguoiThucHien
                FROM PhienDoiSoat ps
                LEFT JOIN NguoiDung nd ON ps.NguoiThucHien = nd.MaNguoiDung
                WHERE ps.MaPhienDoiSoat = @maPhienDoiSoat
            `);

        if (phienResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiên đối soát' });
        }

        // Lấy chi tiết theo cửa hàng
        const chiTietResult = await pool.request()
            .input('maPhienDoiSoat', sql.Int, id)
            .query(`
                SELECT 
                    ct.MaCuaHang,
                    ch.TenCuaHang,
                    COUNT(ct.MaDonHang) as SoDonHang,
                    SUM(ct.DoanhThu) as TongDoanhThu,
                    SUM(ct.PhiSan) as TongPhiSan,
                    SUM(ct.TienThucNhan) as TongTienThucNhan,
                    MAX(ct.TrangThai) as TrangThai
                FROM ChiTietDoiSoat ct
                INNER JOIN CuaHang ch ON ct.MaCuaHang = ch.MaCuaHang
                WHERE ct.MaPhienDoiSoat = @maPhienDoiSoat
                GROUP BY ct.MaCuaHang, ch.TenCuaHang
            `);

        res.json({
            success: true,
            data: {
                phien: phienResult.recordset[0],
                chiTiet: chiTietResult.recordset
            }
        });

    } catch (error) {
        console.error('Error fetching settlement detail:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * @swagger
 * /api/settlements/{id}/execute:
 *   post:
 *     summary: Thực hiện chi trả tiền cho người bán (Admin)
 *     tags: [Settlement]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/execute',
    authenticateToken,
    requireAdmin,
    [
        param('id').isInt()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const transaction = new sql.Transaction(await getPool());

        try {
            const { id } = req.params;

            await transaction.begin();

            // Kiểm tra phiên đối soát
            const phienResult = await transaction.request()
                .input('maPhienDoiSoat', sql.Int, id)
                .query(`
                    SELECT * FROM PhienDoiSoat
                    WHERE MaPhienDoiSoat = @maPhienDoiSoat
                `);

            if (phienResult.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Không tìm thấy phiên đối soát' });
            }

            const phien = phienResult.recordset[0];

            if (phien.TrangThai === 'HOAN_THANH') {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Phiên đối soát đã hoàn thành' });
            }

            if (phien.TrangThai === 'LOI') {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Phiên đối soát bị lỗi, không thể thực hiện' });
            }

            // Lấy chi tiết đối soát
            const chiTietResult = await transaction.request()
                .input('maPhienDoiSoat', sql.Int, id)
                .query(`
                    SELECT * FROM ChiTietDoiSoat
                    WHERE MaPhienDoiSoat = @maPhienDoiSoat
                    AND TrangThai = N'CHO_XU_LY'
                `);

            const chiTietList = chiTietResult.recordset;

            // Kiểm tra số liệu
            let hasError = false;
            for (const chiTiet of chiTietList) {
                if (chiTiet.TienThucNhan < 0) {
                    hasError = true;
                    break;
                }
            }

            if (hasError) {
                await transaction.request()
                    .input('maPhienDoiSoat', sql.Int, id)
                    .query(`
                        UPDATE PhienDoiSoat
                        SET TrangThai = N'LOI',
                            GhiChu = N'Phát hiện số liệu bị âm, cần kiểm tra thủ công'
                        WHERE MaPhienDoiSoat = @maPhienDoiSoat
                    `);

                await transaction.commit();
                return res.status(400).json({ 
                    success: false, 
                    message: 'Phát hiện số liệu tổng tiền bị âm, tính năng chia tiền bị chặn lại để chờ kiểm tra thủ công' 
                });
            }

            // Thực hiện chi trả cho từng cửa hàng
            for (const chiTiet of chiTietList) {
                // Cộng tiền vào ví cửa hàng
                // TODO: Uncomment khi stored procedure hoạt động
                /*
                await transaction.request()
                    .input('MaCuaHang', sql.Int, chiTiet.MaCuaHang)
                    .input('SoTien', sql.Decimal(15, 2), chiTiet.TienThucNhan)
                    .input('LoaiGiaoDich', sql.NVarChar, 'CONG_TIEN')
                    .input('MoTa', sql.NVarChar, `Đối soát phiên #${id} - Đơn hàng #${chiTiet.MaDonHang}`)
                    .input('MaThamChieu', sql.Int, id)
                    .input('LoaiThamChieu', sql.NVarChar, 'PHIEN_DOI_SOAT')
                    .execute('sp_CapNhatViCuaHang');
                */

                // Tạm thời ghi log trực tiếp
                await transaction.request()
                    .input('maCuaHang', sql.Int, chiTiet.MaCuaHang)
                    .input('loaiGiaoDich', sql.NVarChar, 'CONG_TIEN')
                    .input('soTien', sql.Decimal(15, 2), chiTiet.TienThucNhan)
                    .input('soDuTruoc', sql.Decimal(15, 2), 0)
                    .input('soDuSau', sql.Decimal(15, 2), 0)
                    .input('moTa', sql.NVarChar, `Đối soát phiên #${id} - Đơn hàng #${chiTiet.MaDonHang}`)
                    .input('maThamChieu', sql.Int, id)
                    .input('loaiThamChieu', sql.NVarChar, 'PHIEN_DOI_SOAT')
                    .query(`
                        INSERT INTO LichSuGiaoDichVi (MaCuaHang, LoaiGiaoDich, SoTien, SoDuTruoc, SoDuSau, MoTa, MaThamChieu, LoaiThamChieu)
                        VALUES (@maCuaHang, @loaiGiaoDich, @soTien, @soDuTruoc, @soDuSau, @moTa, @maThamChieu, @loaiThamChieu)
                    `);

                // Cập nhật trạng thái chi tiết
                await transaction.request()
                    .input('maChiTiet', sql.Int, chiTiet.MaChiTiet)
                    .query(`
                        UPDATE ChiTietDoiSoat
                        SET TrangThai = N'DA_CHI_TRA',
                            NgayChiTra = GETDATE()
                        WHERE MaChiTiet = @maChiTiet
                    `);
            }

            // Cập nhật trạng thái phiên
            await transaction.request()
                .input('maPhienDoiSoat', sql.Int, id)
                .query(`
                    UPDATE PhienDoiSoat
                    SET TrangThai = N'HOAN_THANH',
                        NgayHoanThanh = GETDATE()
                    WHERE MaPhienDoiSoat = @maPhienDoiSoat
                `);

            await transaction.commit();

            res.json({
                success: true,
                message: 'Thực hiện chi trả thành công',
                data: {
                    soLuongCuaHang: chiTietList.length,
                    tongTienChiTra: phien.TongChiTraNguoiBan
                }
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error executing settlement:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
);

/**
 * @swagger
 * /api/settlements/config:
 *   get:
 *     summary: Lấy cấu hình hệ thống (Admin)
 *     tags: [Settlement]
 *     security:
 *       - bearerAuth: []
 */
router.get('/config/system', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .query(`SELECT * FROM CauHinhHeThong ORDER BY TenCauHinh`);

        res.json({
            success: true,
            data: result.recordset
        });

    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * @swagger
 * /api/settlements/config:
 *   put:
 *     summary: Cập nhật cấu hình hệ thống (Admin)
 *     tags: [Settlement]
 *     security:
 *       - bearerAuth: []
 */
router.put('/config/system',
    authenticateToken,
    requireAdmin,
    [
        body('tenCauHinh').notEmpty(),
        body('giaTri').notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { tenCauHinh, giaTri } = req.body;
            const pool = await getPool();

            await pool.request()
                .input('tenCauHinh', sql.NVarChar, tenCauHinh)
                .input('giaTri', sql.NVarChar, giaTri)
                .query(`
                    UPDATE CauHinhHeThong
                    SET GiaTri = @giaTri,
                        NgayCapNhat = GETDATE()
                    WHERE TenCauHinh = @tenCauHinh
                `);

            res.json({
                success: true,
                message: 'Cập nhật cấu hình thành công'
            });

        } catch (error) {
            console.error('Error updating config:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
);

module.exports = router;
