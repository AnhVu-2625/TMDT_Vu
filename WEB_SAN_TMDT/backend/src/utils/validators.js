const { body, param, query, validationResult } = require('express-validator');

// Middleware xử lý lỗi validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors.array()
        });
    }
    next();
};

// Validation cho đăng ký
const validateRegister = [
    body('hoTen')
        .trim()
        .notEmpty().withMessage('Họ tên không được để trống')
        .isLength({ min: 2, max: 100 }).withMessage('Họ tên phải từ 2-100 ký tự'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('soDienThoai')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
    body('matKhau')
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    handleValidationErrors
];

// Validation cho đăng nhập
const validateLogin = [
    body('emailOrPhone')
        .trim()
        .notEmpty().withMessage('Email hoặc số điện thoại không được để trống'),
    body('matKhau')
        .notEmpty().withMessage('Mật khẩu không được để trống'),
    handleValidationErrors
];

// Validation cho OTP
const validateOTP = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ'),
    body('otp')
        .trim()
        .notEmpty().withMessage('Mã OTP không được để trống')
        .isLength({ min: 6, max: 6 }).withMessage('Mã OTP phải có 6 ký tự'),
    handleValidationErrors
];

// Validation cho sản phẩm
const validateProduct = [
    body('tenSanPham')
        .trim()
        .notEmpty().withMessage('Tên sản phẩm không được để trống')
        .isLength({ min: 5, max: 255 }).withMessage('Tên sản phẩm phải từ 5-255 ký tự'),
    body('moTa')
        .trim()
        .notEmpty().withMessage('Mô tả không được để trống'),
    body('giaGoc')
        .notEmpty().withMessage('Giá gốc không được để trống')
        .isFloat({ min: 0 }).withMessage('Giá gốc phải là số dương'),
    body('maDanhMuc')
        .optional()
        .isInt().withMessage('Mã danh mục không hợp lệ'),
    handleValidationErrors
];

// Validation cho phiên bản sản phẩm
const validateProductVariant = [
    body('mauSac')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Màu sắc tối đa 50 ký tự'),
    body('kichThuoc')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Kích thước tối đa 50 ký tự'),
    body('giaBan')
        .notEmpty().withMessage('Giá bán không được để trống')
        .isFloat({ min: 0 }).withMessage('Giá bán phải là số dương'),
    body('soLuongTonKho')
        .notEmpty().withMessage('Số lượng tồn kho không được để trống')
        .isInt({ min: 0 }).withMessage('Số lượng tồn kho phải là số nguyên không âm'),
    handleValidationErrors
];

// Validation cho giỏ hàng
const validateCartItem = [
    body('maPhienBan')
        .notEmpty().withMessage('Mã phiên bản sản phẩm không được để trống')
        .isInt().withMessage('Mã phiên bản không hợp lệ'),
    body('soLuong')
        .notEmpty().withMessage('Số lượng không được để trống')
        .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
    handleValidationErrors
];

// Validation cho đơn hàng
const validateOrder = [
    body('maDiaChi')
        .notEmpty().withMessage('Địa chỉ giao hàng không được để trống')
        .isInt().withMessage('Mã địa chỉ không hợp lệ'),
    body('phuongThucThanhToan')
        .notEmpty().withMessage('Phương thức thanh toán không được để trống')
        .isIn(['TIEN_MAT', 'CHUYEN_KHOAN', 'VI_DIEN_TU', 'THE_TIN_DUNG'])
        .withMessage('Phương thức thanh toán không hợp lệ'),
    body('danhSachSanPham')
        .isArray({ min: 1 }).withMessage('Danh sách sản phẩm không được rỗng'),
    body('danhSachSanPham.*.maPhienBan')
        .isInt().withMessage('Mã phiên bản không hợp lệ'),
    body('danhSachSanPham.*.soLuong')
        .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
    handleValidationErrors
];

// Validation cho địa chỉ giao hàng
const validateAddress = [
    body('tenNguoiNhan')
        .trim()
        .notEmpty().withMessage('Tên người nhận không được để trống')
        .isLength({ min: 2, max: 100 }).withMessage('Tên người nhận phải từ 2-100 ký tự'),
    body('sdtNguoiNhan')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
    body('diaChiCuThe')
        .trim()
        .notEmpty().withMessage('Địa chỉ cụ thể không được để trống'),
    body('phuongXa')
        .trim()
        .notEmpty().withMessage('Phường/Xã không được để trống'),
    body('quanHuyen')
        .trim()
        .notEmpty().withMessage('Quận/Huyện không được để trống'),
    body('tinhThanh')
        .trim()
        .notEmpty().withMessage('Tỉnh/Thành phố không được để trống'),
    handleValidationErrors
];

// Validation cho đánh giá
const validateReview = [
    body('maSanPham')
        .notEmpty().withMessage('Mã sản phẩm không được để trống')
        .isInt().withMessage('Mã sản phẩm không hợp lệ'),
    body('maDonHang')
        .notEmpty().withMessage('Mã đơn hàng không được để trống')
        .isInt().withMessage('Mã đơn hàng không hợp lệ'),
    body('diemDanhGia')
        .notEmpty().withMessage('Điểm đánh giá không được để trống')
        .isInt({ min: 1, max: 5 }).withMessage('Điểm đánh giá phải từ 1-5'),
    body('binhLuan')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Bình luận tối đa 1000 ký tự'),
    handleValidationErrors
];

// Validation cho mã khuyến mãi
const validatePromoCode = [
    body('maCode')
        .trim()
        .notEmpty().withMessage('Mã code không được để trống')
        .isLength({ min: 3, max: 20 }).withMessage('Mã code phải từ 3-20 ký tự')
        .matches(/^[A-Z0-9]+$/).withMessage('Mã code chỉ chứa chữ in hoa và số'),
    body('loaiGiamGia')
        .notEmpty().withMessage('Loại giảm giá không được để trống')
        .isIn(['PHAN_TRAM', 'TIEN_MAT']).withMessage('Loại giảm giá không hợp lệ'),
    body('giaTriGiam')
        .notEmpty().withMessage('Giá trị giảm không được để trống')
        .isFloat({ min: 0 }).withMessage('Giá trị giảm phải là số dương'),
    body('tuNgay')
        .notEmpty().withMessage('Ngày bắt đầu không được để trống')
        .isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),
    body('denNgay')
        .notEmpty().withMessage('Ngày kết thúc không được để trống')
        .isISO8601().withMessage('Ngày kết thúc không hợp lệ'),
    body('gioiHanSuDung')
        .notEmpty().withMessage('Giới hạn sử dụng không được để trống')
        .isInt({ min: 1 }).withMessage('Giới hạn sử dụng phải là số nguyên dương'),
    handleValidationErrors
];

// Validation cho cửa hàng
const validateShop = [
    body('tenCuaHang')
        .trim()
        .notEmpty().withMessage('Tên cửa hàng không được để trống')
        .isLength({ min: 3, max: 100 }).withMessage('Tên cửa hàng phải từ 3-100 ký tự'),
    body('moTa')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Mô tả tối đa 1000 ký tự'),
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateOTP,
    validateProduct,
    validateProductVariant,
    validateCartItem,
    validateOrder,
    validateAddress,
    validateReview,
    validatePromoCode,
    validateShop,
    handleValidationErrors
};
