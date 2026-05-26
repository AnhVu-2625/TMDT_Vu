const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

// Xác thực token
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

// Kiểm tra vai trò admin
const requireAdmin = (req, res, next) => {
    if (req.user.VaiTro !== 'QUAN_TRI_VIEN') {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập'
        });
    }
    next();
};

// Kiểm tra người bán
const requireSeller = async (req, res, next) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('MaNguoiDung', sql.Int, req.user.MaNguoiDung)
            .query(`
                SELECT MaCuaHang, TenCuaHang, TrangThai
                FROM CuaHang
                WHERE MaNguoiDung = @MaNguoiDung
            `);

        if (result.recordset.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Bạn chưa đăng ký làm người bán'
            });
        }

        if (result.recordset[0].TrangThai === 'BI_KHOA') {
            return res.status(403).json({
                success: false,
                message: 'Cửa hàng của bạn đã bị khóa'
            });
        }

        req.shop = result.recordset[0];
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi kiểm tra quyền người bán'
        });
    }
};

// Kiểm tra tài khoản đã kích hoạt
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
    requireActivated
};
