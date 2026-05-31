const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

/**
 * Middleware xác thực JWT token.
 * Set cả req.user (object đầy đủ) và req.userId (shortcut) để tương thích.
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy token xác thực'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const pool = await getPool();
        const result = await pool.request()
            .input('MaNguoiDung', sql.Int, decoded.userId)
            .query(`
                SELECT MaNguoiDung, HoTen, Email, VaiTro, TrangThai, MaHang, DiemTichLuy
                FROM NguoiDung
                WHERE MaNguoiDung = @MaNguoiDung AND TrangThai != N'BI_KHOA'
            `);

        if (result.recordset.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản không tồn tại hoặc đã bị khóa'
            });
        }

        req.user = result.recordset[0];
        // Shortcut để tương thích với các route cũ dùng req.userId
        req.userId = result.recordset[0].MaNguoiDung;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token đã hết hạn'
            });
        }
        return res.status(403).json({
            success: false,
            message: 'Token không hợp lệ'
        });
    }
};

/**
 * Middleware yêu cầu vai trò Quản Trị Viên.
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.VaiTro !== 'QUAN_TRI_VIEN') {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập trang quản trị'
        });
    }
    next();
};

/**
 * Middleware yêu cầu người dùng đã có cửa hàng đang hoạt động.
 * Gắn thêm req.shop vào request.
 */
const requireSeller = async (req, res, next) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('MaNguoiDung', sql.Int, req.user.MaNguoiDung)
            .query(`
                SELECT MaCuaHang, TenCuaHang, TrangThai, SoDuVi, Logo, MoTa
                FROM CuaHang
                WHERE MaNguoiDung = @MaNguoiDung
            `);

        if (result.recordset.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Bạn chưa đăng ký làm người bán',
                requireShopRegister: true
            });
        }

        const shop = result.recordset[0];

        if (shop.TrangThai === 'BI_KHOA') {
            return res.status(403).json({
                success: false,
                message: 'Cửa hàng của bạn đã bị khóa'
            });
        }

        if (shop.TrangThai === 'CHO_DUYET') {
            return res.status(403).json({
                success: false,
                message: 'Cửa hàng đang chờ duyệt',
                shopStatus: 'CHO_DUYET'
            });
        }

        req.shop = shop;
        next();
    } catch (error) {
        console.error('requireSeller error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi kiểm tra quyền người bán'
        });
    }
};

/**
 * Middleware yêu cầu người dùng có cửa hàng (kể cả đang chờ duyệt).
 * Dùng cho các endpoint xem thông tin shop của chính mình.
 */
const requireShopOwner = async (req, res, next) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('MaNguoiDung', sql.Int, req.user.MaNguoiDung)
            .query(`
                SELECT MaCuaHang, TenCuaHang, TrangThai, SoDuVi, Logo, MoTa, NgayTao
                FROM CuaHang
                WHERE MaNguoiDung = @MaNguoiDung
            `);

        if (result.recordset.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Bạn chưa đăng ký cửa hàng',
                requireShopRegister: true
            });
        }

        req.shop = result.recordset[0];
        next();
    } catch (error) {
        console.error('requireShopOwner error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi kiểm tra quyền'
        });
    }
};

/**
 * Middleware kiểm tra tài khoản đã kích hoạt.
 */
const requireActivated = (req, res, next) => {
    if (req.user.TrangThai === 'CHUA_KICH_HOAT') {
        return res.status(403).json({
            success: false,
            message: 'Vui lòng kích hoạt tài khoản trước'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireSeller,
    requireShopOwner,
    requireActivated
};
