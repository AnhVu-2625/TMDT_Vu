/**
 * DISPUTE RESOLUTION ROUTES
 * Quản lý giải quyết tranh chấp đổi trả
 */

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const sql = require('mssql');
const { getPool } = require('../config/database');

/**
 * @swagger
 * /api/disputes:
 *   get:
 *     summary: Lấy danh sách tranh chấp (Admin)
 *     tags: [Dispute]
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
                dt.MaDoiTra,
                dt.MaDonHang,
                dt.LyDo,
                dt.AnhBangChung,
                dt.VideoMoHang,
                dt.TrangThai,
                dt.QuyetDinhCuaAdmin,
                dt.QuyetDinhAdmin,
                dt.NgayQuyetDinh,
                dt.NgayTao,
                dh.TienThanhToan,
                dh.TrangThaiDonHang,
                nguoiMua.HoTen as TenNguoiMua,
                nguoiMua.Email as EmailNguoiMua,
                ch.TenCuaHang,
                nguoiBan.HoTen as TenNguoiBan,
                nguoiBan.Email as EmailNguoiBan,
                admin.HoTen as TenAdminXuLy
            FROM YeuCauDoiTra dt
            INNER JOIN DonHang dh ON dt.MaDonHang = dh.MaDonHang
            INNER JOIN NguoiDung nguoiMua ON dh.MaNguoiDung = nguoiMua.MaNguoiDung
            INNER JOIN CuaHang ch ON dh.MaCuaHang = ch.MaCuaHang
            INNER JOIN NguoiDung nguoiBan ON ch.MaNguoiDung = nguoiBan.MaNguoiDung
            LEFT JOIN NguoiDung admin ON dt.AdminXuLy = admin.MaNguoiDung
            WHERE 1=1
        `;

        if (trangThai) {
            query += ` AND dt.TrangThai = @trangThai`;
        }

        query += ` ORDER BY dt.NgayTao DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

        const result = await pool.request()
            .input('trangThai', sql.NVarChar, trangThai)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(query);

        // Đếm tổng số
        let countQuery = `SELECT COUNT(*) as total FROM YeuCauDoiTra WHERE 1=1`;
        if (trangThai) {
            countQuery += ` AND TrangThai = @trangThai`;
        }

        const countResult = await pool.request()
            .input('trangThai', sql.NVarChar, trangThai)
            .query(countQuery);

        res.json({
            success: true,
            data: result.recordset,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.recordset[0].total
            }
        });
    } catch (error) {
        console.error('Error fetching disputes:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * @swagger
 * /api/disputes/{id}:
 *   get:
 *     summary: Xem chi tiết tranh chấp (Admin)
 *     tags: [Dispute]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();

        // Lấy thông tin tranh chấp
        const disputeResult = await pool.request()
            .input('maDoiTra', sql.Int, id)
            .query(`
                SELECT 
                    dt.*,
                    dh.TienThanhToan,
                    dh.TrangThaiDonHang,
                    dh.TrangThaiThanhToan,
                    dh.VideoDongHang,
                    nguoiMua.HoTen as TenNguoiMua,
                    nguoiMua.Email as EmailNguoiMua,
                    nguoiMua.SoDienThoai as SDTNguoiMua,
                    ch.TenCuaHang,
                    ch.MaCuaHang,
                    nguoiBan.HoTen as TenNguoiBan,
                    nguoiBan.Email as EmailNguoiBan,
                    nguoiBan.SoDienThoai as SDTNguoiBan
                FROM YeuCauDoiTra dt
                INNER JOIN DonHang dh ON dt.MaDonHang = dh.MaDonHang
                INNER JOIN NguoiDung nguoiMua ON dh.MaNguoiDung = nguoiMua.MaNguoiDung
                INNER JOIN CuaHang ch ON dh.MaCuaHang = ch.MaCuaHang
                INNER JOIN NguoiDung nguoiBan ON ch.MaNguoiDung = nguoiBan.MaNguoiDung
                WHERE dt.MaDoiTra = @maDoiTra
            `);

        if (disputeResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tranh chấp' });
        }

        // Lấy lịch sử tranh chấp
        const historyResult = await pool.request()
            .input('maDoiTra', sql.Int, id)
            .query(`
                SELECT 
                    ls.*,
                    nd.HoTen as TenNguoiThucHien
                FROM LichSuTrancChap ls
                LEFT JOIN NguoiDung nd ON ls.NguoiThucHien = nd.MaNguoiDung
                WHERE ls.MaDoiTra = @maDoiTra
                ORDER BY ls.NgayThucHien DESC
            `);

        // Lấy video bằng chứng
        const videoResult = await pool.request()
            .input('maDonHang', sql.Int, disputeResult.recordset[0].MaDonHang)
            .query(`
                SELECT * FROM BangChungVideo
                WHERE MaDonHang = @maDonHang
                ORDER BY NgayTai DESC
            `);

        res.json({
            success: true,
            data: {
                dispute: disputeResult.recordset[0],
                history: historyResult.recordset,
                videos: videoResult.recordset
            }
        });
    } catch (error) {
        console.error('Error fetching dispute detail:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * @swagger
 * /api/disputes/{id}/resolve:
 *   post:
 *     summary: Admin giải quyết tranh chấp (phán quyết cuối cùng)
 *     tags: [Dispute]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/resolve',
    authenticateToken,
    requireAdmin,
    [
        param('id').isInt(),
        body('quyetDinh').isIn(['DONG_Y_HOAN_TIEN', 'TU_CHOI_HOAN_TIEN']),
        body('lyDo').notEmpty().withMessage('Lý do quyết định là bắt buộc')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const transaction = new sql.Transaction(await getPool());

        try {
            const { id } = req.params;
            const { quyetDinh, lyDo } = req.body;
            const adminId = req.user.userId;

            await transaction.begin();

            // Kiểm tra tranh chấp tồn tại
            const disputeResult = await transaction.request()
                .input('maDoiTra', sql.Int, id)
                .query(`
                    SELECT 
                        dt.MaDoiTra,
                        dt.MaDonHang,
                        dt.LyDo,
                        dt.TrangThai,
                        dh.TienThanhToan,
                        dh.MaCuaHang,
                        dh.MaNguoiDung
                    FROM YeuCauDoiTra dt
                    INNER JOIN DonHang dh ON dt.MaDonHang = dh.MaDonHang
                    WHERE dt.MaDoiTra = @maDoiTra
                `);

            if (disputeResult.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Không tìm thấy tranh chấp' });
            }

            const dispute = disputeResult.recordset[0];

            if (dispute.TrangThai === 'DA_GIAI_QUYET') {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Tranh chấp đã được giải quyết' });
            }

            // Cập nhật quyết định
            await transaction.request()
                .input('maDoiTra', sql.Int, id)
                .input('quyetDinh', sql.NVarChar, quyetDinh)
                .input('lyDo', sql.NVarChar, lyDo)
                .input('adminId', sql.Int, adminId)
                .query(`
                    UPDATE YeuCauDoiTra
                    SET TrangThai = N'DA_GIAI_QUYET',
                        QuyetDinhAdmin = @quyetDinh,
                        QuyetDinhCuaAdmin = @lyDo,
                        NgayQuyetDinh = GETDATE(),
                        AdminXuLy = @adminId
                    WHERE MaDoiTra = @maDoiTra
                `);

            // Xử lý tiền theo quyết định
            console.log('🔥 CODE MỚI - Đang xử lý quyết định:', quyetDinh, 'cho đơn hàng:', dispute.MaDonHang);
            if (quyetDinh === 'DONG_Y_HOAN_TIEN') {
                // Hoàn tiền cho người mua
                await transaction.request()
                    .input('maDonHang', sql.Int, dispute.MaDonHang)
                    .query(`
                        UPDATE DonHang
                        SET TrangThaiThanhToan = N'HOAN_TIEN',
                            TrangThaiDonHang = N'DA_TRA_HANG'
                        WHERE MaDonHang = @maDonHang
                    `);

                // Ghi log: Trừ tiền từ ví người bán (nếu đã được cộng)
                // TODO: Uncomment khi stored procedure hoạt động
                /*
                await transaction.request()
                    .input('MaCuaHang', sql.Int, dispute.MaCuaHang)
                    .input('SoTien', sql.Decimal(15, 2), dispute.TienThanhToan)
                    .input('LoaiGiaoDich', sql.NVarChar, 'HOAN_TIEN')
                    .input('MoTa', sql.NVarChar, `Hoàn tiền đơn hàng #${dispute.MaDonHang} do tranh chấp`)
                    .input('MaThamChieu', sql.Int, dispute.MaDonHang)
                    .input('LoaiThamChieu', sql.NVarChar, 'DON_HANG')
                    .execute('sp_CapNhatViCuaHang');
                */

                // Tạm thời ghi log trực tiếp vào bảng (không qua stored procedure)
                await transaction.request()
                    .input('maCuaHang', sql.Int, dispute.MaCuaHang)
                    .input('loaiGiaoDich', sql.NVarChar, 'HOAN_TIEN')
                    .input('soTien', sql.Decimal(15, 2), dispute.TienThanhToan)
                    .input('soDuTruoc', sql.Decimal(15, 2), 0)
                    .input('soDuSau', sql.Decimal(15, 2), 0)
                    .input('moTa', sql.NVarChar, `Hoàn tiền đơn hàng #${dispute.MaDonHang} do tranh chấp`)
                    .input('maThamChieu', sql.Int, dispute.MaDonHang)
                    .input('loaiThamChieu', sql.NVarChar, 'DON_HANG')
                    .query(`
                        INSERT INTO LichSuGiaoDichVi (MaCuaHang, LoaiGiaoDich, SoTien, SoDuTruoc, SoDuSau, MoTa, MaThamChieu, LoaiThamChieu)
                        VALUES (@maCuaHang, @loaiGiaoDich, @soTien, @soDuTruoc, @soDuSau, @moTa, @maThamChieu, @loaiThamChieu)
                    `);

            } else {
                // Từ chối hoàn tiền - tiền thuộc về người bán
                await transaction.request()
                    .input('maDonHang', sql.Int, dispute.MaDonHang)
                    .query(`
                        UPDATE DonHang
                        SET TrangThaiDonHang = N'DA_GIAO'
                        WHERE MaDonHang = @maDonHang
                    `);

                // Đảm bảo tiền được chuyển cho người bán
                // TODO: Uncomment khi stored procedure hoạt động
                /*
                await transaction.request()
                    .input('MaCuaHang', sql.Int, dispute.MaCuaHang)
                    .input('SoTien', sql.Decimal(15, 2), dispute.TienThanhToan)
                    .input('LoaiGiaoDich', sql.NVarChar, 'CONG_TIEN')
                    .input('MoTa', sql.NVarChar, `Xác nhận thanh toán đơn hàng #${dispute.MaDonHang} sau tranh chấp`)
                    .input('MaThamChieu', sql.Int, dispute.MaDonHang)
                    .input('LoaiThamChieu', sql.NVarChar, 'DON_HANG')
                    .execute('sp_CapNhatViCuaHang');
                */

                // Tạm thời ghi log trực tiếp vào bảng
                await transaction.request()
                    .input('maCuaHang', sql.Int, dispute.MaCuaHang)
                    .input('loaiGiaoDich', sql.NVarChar, 'CONG_TIEN')
                    .input('soTien', sql.Decimal(15, 2), dispute.TienThanhToan)
                    .input('soDuTruoc', sql.Decimal(15, 2), 0)
                    .input('soDuSau', sql.Decimal(15, 2), 0)
                    .input('moTa', sql.NVarChar, `Xác nhận thanh toán đơn hàng #${dispute.MaDonHang} sau tranh chấp`)
                    .input('maThamChieu', sql.Int, dispute.MaDonHang)
                    .input('loaiThamChieu', sql.NVarChar, 'DON_HANG')
                    .query(`
                        INSERT INTO LichSuGiaoDichVi (MaCuaHang, LoaiGiaoDich, SoTien, SoDuTruoc, SoDuSau, MoTa, MaThamChieu, LoaiThamChieu)
                        VALUES (@maCuaHang, @loaiGiaoDich, @soTien, @soDuTruoc, @soDuSau, @moTa, @maThamChieu, @loaiThamChieu)
                    `);
            }

            // Ghi lịch sử
            await transaction.request()
                .input('maDoiTra', sql.Int, id)
                .input('hanhDong', sql.NVarChar, `Admin phán quyết: ${quyetDinh === 'DONG_Y_HOAN_TIEN' ? 'Đồng ý hoàn tiền' : 'Từ chối hoàn tiền'}`)
                .input('nguoiThucHien', sql.Int, adminId)
                .input('ghiChu', sql.NVarChar, lyDo)
                .query(`
                    INSERT INTO LichSuTrancChap (MaDoiTra, HanhDong, NguoiThucHien, GhiChu)
                    VALUES (@maDoiTra, @hanhDong, @nguoiThucHien, @ghiChu)
                `);

            // Gửi thông báo cho người mua và người bán
            const thongBaoNguoiMua = quyetDinh === 'DONG_Y_HOAN_TIEN' 
                ? `Tranh chấp đơn hàng #${dispute.MaDonHang} đã được giải quyết. Bạn sẽ được hoàn tiền.`
                : `Tranh chấp đơn hàng #${dispute.MaDonHang} đã được giải quyết. Yêu cầu hoàn tiền bị từ chối.`;

            await transaction.request()
                .input('maNguoiDung', sql.Int, dispute.MaNguoiDung)
                .input('tieuDe', sql.NVarChar, 'Tranh chấp đã được giải quyết')
                .input('noiDung', sql.NVarChar, thongBaoNguoiMua)
                .input('maDonHang', sql.Int, dispute.MaDonHang)
                .query(`
                    INSERT INTO ThongBao (MaNguoiDung, TieuDe, NoiDung, LoaiThongBao, MaThamChieu)
                    VALUES (@maNguoiDung, @tieuDe, @noiDung, N'DON_HANG', @maDonHang)
                `);

            await transaction.commit();

            res.json({
                success: true,
                message: 'Giải quyết tranh chấp thành công',
                data: {
                    quyetDinh,
                    lyDo
                }
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error resolving dispute:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
);

/**
 * @swagger
 * /api/disputes/{id}/escalate:
 *   post:
 *     summary: Người mua khiếu nại lên Admin khi shop từ chối
 *     tags: [Dispute]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/escalate',
    authenticateToken,
    [
        param('id').isInt(),
        body('lyDoKhieuNai').notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { lyDoKhieuNai } = req.body;
            const userId = req.user.userId;

            const pool = await getPool();

            // Kiểm tra quyền
            const checkResult = await pool.request()
                .input('maDoiTra', sql.Int, id)
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT dt.*, dh.MaNguoiDung
                    FROM YeuCauDoiTra dt
                    INNER JOIN DonHang dh ON dt.MaDonHang = dh.MaDonHang
                    WHERE dt.MaDoiTra = @maDoiTra AND dh.MaNguoiDung = @userId
                `);

            if (checkResult.recordset.length === 0) {
                return res.status(403).json({ success: false, message: 'Không có quyền thực hiện' });
            }

            const dispute = checkResult.recordset[0];

            if (dispute.TrangThai !== 'SHOP_TU_CHOI') {
                return res.status(400).json({ success: false, message: 'Chỉ có thể khiếu nại khi shop từ chối' });
            }

            // Cập nhật trạng thái
            await pool.request()
                .input('maDoiTra', sql.Int, id)
                .input('lyDo', sql.NVarChar, lyDoKhieuNai)
                .query(`
                    UPDATE YeuCauDoiTra
                    SET TrangThai = N'KHIEU_NAI_ADMIN',
                        QuyetDinhCuaAdmin = @lyDo
                    WHERE MaDoiTra = @maDoiTra
                `);

            // Ghi lịch sử
            await pool.request()
                .input('maDoiTra', sql.Int, id)
                .input('hanhDong', sql.NVarChar, 'Người mua khiếu nại lên Admin')
                .input('nguoiThucHien', sql.Int, userId)
                .input('ghiChu', sql.NVarChar, lyDoKhieuNai)
                .query(`
                    INSERT INTO LichSuTrancChap (MaDoiTra, HanhDong, NguoiThucHien, GhiChu)
                    VALUES (@maDoiTra, @hanhDong, @nguoiThucHien, @ghiChu)
                `);

            res.json({
                success: true,
                message: 'Đã gửi khiếu nại lên Admin'
            });

        } catch (error) {
            console.error('Error escalating dispute:', error);
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
);

module.exports = router;
