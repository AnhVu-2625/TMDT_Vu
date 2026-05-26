import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    matKhau: '',
    xacNhanMatKhau: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (formData.matKhau !== formData.xacNhanMatKhau) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.matKhau.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const { xacNhanMatKhau, ...registerData } = formData;
      await register(registerData);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Đăng ký</h1>
        <p className="text-gray-400">Tạo tài khoản mới để bắt đầu mua sắm</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Họ và tên
          </label>
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="hoTen"
              value={formData.hoTen}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              className="input-field pl-12"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              className="input-field pl-12"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Số điện thoại
          </label>
          <div className="relative">
            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="soDienThoai"
              value={formData.soDienThoai}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className="input-field pl-12"
              pattern="[0-9]{10,11}"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="matKhau"
              value={formData.matKhau}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className="input-field pl-12 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="xacNhanMatKhau"
              value={formData.xacNhanMatKhau}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              className="input-field pl-12 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            className="w-4 h-4 mt-1 bg-gray-900 border-gray-700 rounded text-red-600 
                     focus:ring-red-600 focus:ring-offset-0"
            required
          />
          <span className="text-sm text-gray-400">
            Tôi đồng ý với{' '}
            <Link to="/terms" className="text-red-500 hover:text-red-400">
              Điều khoản sử dụng
            </Link>{' '}
            và{' '}
            <Link to="/privacy" className="text-red-500 hover:text-red-400">
              Chính sách bảo mật
            </Link>
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="spinner w-5 h-5 border-2" />
              <span>Đang đăng ký...</span>
            </div>
          ) : (
            'Đăng ký'
          )}
        </button>

        {/* Login Link */}
        <p className="text-center text-gray-400">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-red-500 hover:text-red-400 font-semibold">
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default Register;
