const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');
const { validateRegister, validateLogin, validateOTP } = require('../utils/validators');
const nodemailer = require('nodemailer');

// Cấu hình email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Tạo mã OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Gửi email OTP
const sendOTPEmail = async (email, otp, hoTen) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Mã xác thực tài khoản',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Xác thực tài khoản</h2>
                <p>Xin chào <strong>${hoTen}</strong>,</p>
                <p>Mã OTP của bạn là:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc2626;">
                    ${otp}
                </div>
                <p>Mã này sẽ hết hạn sau 10 phút.</p>
                <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hoTen, email, soDienThoai, matKhau]
 *             properties:
 *               hoTen:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               email:
 *                 type: string
 *                 example: example@gmail.com
 *               soDienThoai:
 *                 type: string
 *                 example: "0901234567"
 *               matKhau:
 *                 type: string
 *                 example: "Password123"
 *               ngaySinh:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-01"
 *               gioiTinh:
 *                 type: string
 *                 enum: [NAM, NU, KHAC]
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Email hoặc SĐT đã tồn tại
 */
router.post('/register', validateRegister, async (req, res) => {
    try {
        const { hoTen, email, soDienThoai, matKhau, ngaySinh, gioiTinh } = req.body;
        const pool = await getPool();

        // Kiểm tra email đã tồn tại
        const checkEmail = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT MaNguoiDung FROM NguoiDung WHERE Email = @Email');

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Kiểm tra số điện thoại đã tồn tại
        const checkPhone = await pool.request()
            .input('SoDienThoai', sql.NVarChar, soDienThoai)
            .query('SELECT MaNguoiDung FROM NguoiDung WHERE SoDienThoai = @SoDienThoai');

        if (checkPhone.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại đã được sử dụng'
            });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(matKhau, 10);

        // Tạo tài khoản
        const result = await pool.request()
            .input('HoTen', sql.NVarChar, hoTen)
            .input('Email', sql.NVarChar, email)
            .input('SoDienThoai', sql.NVarChar, soDienThoai)
            .input('MatKhau', sql.NVarChar, hashedPassword)
            .input('NgaySinh', sql.Date, ngaySinh || null)
            .input('GioiTinh', sql.NVarChar, gioiTinh || null)
            .query(`
                INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, NgaySinh, GioiTinh)
                OUTPUT INSERTED.MaNguoiDung
                VALUES (@HoTen, @Email, @SoDienThoai, @MatKhau, @NgaySinh, @GioiTinh)
            `);

        const maNguoiDung = result.recordset[0].MaNguoiDung;

        // Tạo và gửi OTP
        const otp = generateOTP();
        const thoiGianHetHan = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

        await pool.request()
            .input('MaNguoiDung', sql.Int, maNguoiDung)
            .input('MaOTP', sql.NVarChar, otp)
            .input('ThoiGianHetHan', sql.DateTime, thoiGianHetHan)
            .query(`
                INSERT INTO XacThucNguoiDung (MaNguoiDung, MaOTP, ThoiGianHetHan)
                VALUES (@MaNguoiDung, @MaOTP, @ThoiGianHetHan)
            `);

        // Gửi email OTP
        try {
            await sendOTPEmail(email, otp, hoTen);
        } catch (emailError) {
            console.error('Lỗi gửi email:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
            data: {
                maNguoiDung,
                email
            }
        });
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi đăng ký tài khoản'
        });
    }
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Xác thực OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Xác thực thành công
 *       400:
 *         description: OTP sai hoặc hết hạn
 */
router.post('/verify-otp', validateOTP, async (req, res) => {
    try {
        const { email, otp } = req.body;
        const pool = await getPool();

        // Tìm người dùng
        const userResult = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT MaNguoiDung, HoTen FROM NguoiDung WHERE Email = @Email');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản'
            });
        }

        const maNguoiDung = userResult.recordset[0].MaNguoiDung;

        // Kiểm tra OTP
        const otpResult = await pool.request()
            .input('MaNguoiDung', sql.Int, maNguoiDung)
            .input('MaOTP', sql.NVarChar, otp)
            .query(`
                SELECT MaXacThuc, ThoiGianHetHan, DaSuDung
                FROM XacThucNguoiDung
                WHERE MaNguoiDung = @MaNguoiDung AND MaOTP = @MaOTP
                ORDER BY MaXacThuc DESC
            `);

        if (otpResult.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã OTP không đúng'
            });
        }

        const otpData = otpResult.recordset[0];

        if (otpData.DaSuDung) {
            return res.status(400).json({
                success: false,
                message: 'Mã OTP đã được sử dụng'
            });
        }

        if (new Date() > new Date(otpData.ThoiGianHetHan)) {
            return res.status(400).json({
                success: false,
                message: 'Mã OTP đã hết hạn'
            });
        }

        // Cập nhật trạng thái OTP và tài khoản
        await pool.request()
            .input('MaXacThuc', sql.Int, otpData.MaXacThuc)
            .query('UPDATE XacThucNguoiDung SET DaSuDung = 1 WHERE MaXacThuc = @MaXacThuc');

        await pool.request()
            .input('MaNguoiDung', sql.Int, maNguoiDung)
            .query("UPDATE NguoiDung SET TrangThai = N'HOAT_DONG' WHERE MaNguoiDung = @MaNguoiDung");

        res.json({
            success: true,
            message: 'Xác thực tài khoản thành công!'
        });
    } catch (error) {
        console.error('Lỗi xác thực OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xác thực OTP'
        });
    }
});

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Gửi lại OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@gmail.com
 *     responses:
 *       200:
 *         description: Đã gửi lại OTP
 */
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const pool = await getPool();

        const userResult = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT MaNguoiDung, HoTen, TrangThai FROM NguoiDung WHERE Email = @Email');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản'
            });
        }

        const user = userResult.recordset[0];

        if (user.TrangThai === 'HOAT_DONG') {
            return res.status(400).json({
                success: false,
                message: 'Tài khoản đã được kích hoạt'
            });
        }

        // Tạo OTP mới
        const otp = generateOTP();
        const thoiGianHetHan = new Date(Date.now() + 10 * 60 * 1000);

        await pool.request()
            .input('MaNguoiDung', sql.Int, user.MaNguoiDung)
            .input('MaOTP', sql.NVarChar, otp)
            .input('ThoiGianHetHan', sql.DateTime, thoiGianHetHan)
            .query(`
                INSERT INTO XacThucNguoiDung (MaNguoiDung, MaOTP, ThoiGianHetHan)
                VALUES (@MaNguoiDung, @MaOTP, @ThoiGianHetHan)
            `);

        await sendOTPEmail(email, otp, user.HoTen);

        res.json({
            success: true,
            message: 'Đã gửi lại mã OTP'
        });
    } catch (error) {
        console.error('Lỗi gửi lại OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi gửi lại OTP'
        });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emailOrPhone, matKhau]
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 example: example@gmail.com
 *               matKhau:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về JWT token
 *       401:
 *         description: Sai thông tin đăng nhập
 */
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { emailOrPhone, matKhau } = req.body;
        const pool = await getPool();

        // Tìm người dùng
        const result = await pool.request()
            .input('EmailOrPhone', sql.NVarChar, emailOrPhone)
            .query(`
                SELECT MaNguoiDung, HoTen, Email, MatKhau, VaiTro, TrangThai, AnhDaiDien, DiemTichLuy, MaHang
                FROM NguoiDung
                WHERE Email = @EmailOrPhone OR SoDienThoai = @EmailOrPhone
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email/Số điện thoại hoặc mật khẩu không đúng'
            });
        }

        const user = result.recordset[0];

        // Kiểm tra trạng thái tài khoản
        if (user.TrangThai === 'BI_KHOA') {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị khóa'
            });
        }

        if (user.TrangThai === 'CHUA_KICH_HOAT') {
            return res.status(403).json({
                success: false,
                message: 'Vui lòng kích hoạt tài khoản trước khi đăng nhập',
                requireOTP: true,
                email: user.Email
            });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(matKhau, user.MatKhau);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email/Số điện thoại hoặc mật khẩu không đúng'
            });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { userId: user.MaNguoiDung, vaiTro: user.VaiTro },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // Kiểm tra xem có cửa hàng không
        const shopResult = await pool.request()
            .input('MaNguoiDung', sql.Int, user.MaNguoiDung)
            .query('SELECT MaCuaHang, TenCuaHang, TrangThai FROM CuaHang WHERE MaNguoiDung = @MaNguoiDung');

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                token,
                user: {
                    maNguoiDung: user.MaNguoiDung,
                    hoTen: user.HoTen,
                    email: user.Email,
                    vaiTro: user.VaiTro,
                    anhDaiDien: user.AnhDaiDien,
                    diemTichLuy: user.DiemTichLuy,
                    maHang: user.MaHang,
                    shop: shopResult.recordset.length > 0 ? shopResult.recordset[0] : null
                }
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi đăng nhập'
        });
    }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Quên mật khẩu — gửi OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@gmail.com
 *     responses:
 *       200:
 *         description: Đã gửi OTP về email
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const pool = await getPool();

        const userResult = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT MaNguoiDung, HoTen FROM NguoiDung WHERE Email = @Email');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản'
            });
        }

        const user = userResult.recordset[0];
        const otp = generateOTP();
        const thoiGianHetHan = new Date(Date.now() + 10 * 60 * 1000);

        await pool.request()
            .input('MaNguoiDung', sql.Int, user.MaNguoiDung)
            .input('MaOTP', sql.NVarChar, otp)
            .input('ThoiGianHetHan', sql.DateTime, thoiGianHetHan)
            .query(`
                INSERT INTO XacThucNguoiDung (MaNguoiDung, MaOTP, ThoiGianHetHan)
                VALUES (@MaNguoiDung, @MaOTP, @ThoiGianHetHan)
            `);

        await sendOTPEmail(email, otp, user.HoTen);

        res.json({
            success: true,
            message: 'Mã OTP đã được gửi đến email của bạn'
        });
    } catch (error) {
        console.error('Lỗi quên mật khẩu:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xử lý quên mật khẩu'
        });
    }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Đặt lại mật khẩu
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, matKhauMoi]
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               matKhauMoi:
 *                 type: string
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, matKhauMoi } = req.body;
        const pool = await getPool();

        // Tìm người dùng
        const userResult = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT MaNguoiDung FROM NguoiDung WHERE Email = @Email');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản'
            });
        }

        const maNguoiDung = userResult.recordset[0].MaNguoiDung;

        // Kiểm tra OTP
        const otpResult = await pool.request()
            .input('MaNguoiDung', sql.Int, maNguoiDung)
            .input('MaOTP', sql.NVarChar, otp)
            .query(`
                SELECT MaXacThuc, ThoiGianHetHan, DaSuDung
                FROM XacThucNguoiDung
                WHERE MaNguoiDung = @MaNguoiDung AND MaOTP = @MaOTP
                ORDER BY MaXacThuc DESC
            `);

        if (otpResult.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã OTP không đúng'
            });
        }

        const otpData = otpResult.recordset[0];

        if (otpData.DaSuDung) {
            return res.status(400).json({
                success: false,
                message: 'Mã OTP đã được sử dụng'
            });
        }

        if (new Date() > new Date(otpData.ThoiGianHetHan)) {
            return res.status(400).json({
                success: false,
                message: 'Mã OTP đã hết hạn'
            });
        }

        // Cập nhật mật khẩu
        const hashedPassword = await bcrypt.hash(matKhauMoi, 10);

        await pool.request()
            .input('MaNguoiDung', sql.Int, maNguoiDung)
            .input('MatKhau', sql.NVarChar, hashedPassword)
            .query('UPDATE NguoiDung SET MatKhau = @MatKhau WHERE MaNguoiDung = @MaNguoiDung');

        await pool.request()
            .input('MaXacThuc', sql.Int, otpData.MaXacThuc)
            .query('UPDATE XacThucNguoiDung SET DaSuDung = 1 WHERE MaXacThuc = @MaXacThuc');

        res.json({
            success: true,
            message: 'Đặt lại mật khẩu thành công'
        });
    } catch (error) {
        console.error('Lỗi đặt lại mật khẩu:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi đặt lại mật khẩu'
        });
    }
});

module.exports = router;
