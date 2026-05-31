import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    matKhau: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(formData.emailOrPhone, formData.matKhau);
      toast.success('Đăng nhập thành công!');
      // Điều hướng theo vai trò: Admin → /admin/dashboard, Seller → /seller/dashboard, User → /
      navigate(result?.redirectPath || '/');
    } catch (error) {
      if (error.message.includes('kích hoạt')) {
        navigate('/verify-otp', { state: { email: formData.emailOrPhone } });
      } else {
        toast.error(error.message);
      }
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Đăng nhập</h1>
        <p className="text-gray-400">Chào mừng bạn quay trở lại!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email/Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email hoặc Số điện thoại
          </label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              placeholder="Nhập email hoặc số điện thoại"
              className="input-field pl-12"
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

        {/* Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-red-600 
                       focus:ring-red-600 focus:ring-offset-0"
            />
            <span className="text-sm text-gray-400">Ghi nhớ đăng nhập</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-red-500 hover:text-red-400">
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="spinner w-5 h-5 border-2" />
              <span>Đang đăng nhập...</span>
            </div>
          ) : (
            'Đăng nhập'
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black text-gray-400">Hoặc</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="btn-secondary py-3 flex items-center justify-center space-x-2"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span>Google</span>
          </button>
          <button
            type="button"
            className="btn-secondary py-3 flex items-center justify-center space-x-2"
          >
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5" />
            <span>Facebook</span>
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-gray-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-red-500 hover:text-red-400 font-semibold">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default Login;
