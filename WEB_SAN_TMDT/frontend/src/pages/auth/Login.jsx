import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
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
      navigate(result?.redirectPath || '/');
    } catch (error) {
      if (error.message.includes('kích hoạt')) {
        navigate('/verify-otp', { state: { email: formData.emailOrPhone } });
      } else {
        toast.error(error.message);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-red-600/5 rounded-full blur-3xl" />
        </div>

        {/* Card Container */}
        <motion.div
          variants={containerVariants}
          className="relative bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
        >
          {/* Header */}
          <motion.div variants={containerVariants} className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full mb-4 mx-auto shadow-lg"
            >
              <span className="text-2xl font-bold text-white">M</span>
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">MartHub</h1>
            <p className="text-lg text-gray-300 mb-1">Đăng nhập vào tài khoản</p>
            <p className="text-sm text-gray-500">Chào mừng bạn quay trở lại, khách VIP!</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Phone Field */}
            <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
              <label className="block text-sm font-semibold text-white mb-3">
                Email hoặc Số điện thoại
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300" />
                <div className="relative flex items-center">
                  <FiMail className="absolute left-4 text-gray-400 group-hover:text-red-400 transition duration-300" size={18} />
                  <input
                    type="text"
                    name="emailOrPhone"
                    value={formData.emailOrPhone}
                    onChange={handleChange}
                    placeholder="admin@marthub.vn"
                    className="w-full bg-slate-800/50 border border-slate-700 hover:border-slate-600 focus:border-red-500 focus:outline-none text-white placeholder-gray-500 pl-12 pr-4 py-3 rounded-xl transition duration-300 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
              <label className="block text-sm font-semibold text-white mb-3">
                Mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300" />
                <div className="relative flex items-center">
                  <FiLock className="absolute left-4 text-gray-400 group-hover:text-red-400 transition duration-300" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="matKhau"
                    value={formData.matKhau}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-slate-700 hover:border-slate-600 focus:border-red-500 focus:outline-none text-white placeholder-gray-500 pl-12 pr-12 py-3 rounded-xl transition duration-300 backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-gray-400 hover:text-red-400 transition duration-300"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Remember & Forgot Password */}
            <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible" className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 bg-slate-800 border border-slate-700 rounded-lg text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-0 cursor-pointer transition"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition">Ghi nhớ tôi</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-red-500 hover:text-red-400 transition font-medium">
                Quên mật khẩu?
              </Link>
            </motion.div>

            {/* Login Button */}
            <motion.button
              custom={3}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group shadow-lg shadow-red-600/30"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition duration-300" />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <motion.div custom={4} variants={inputVariants} initial="hidden" animate="visible" className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-gradient-to-br from-slate-900 to-black text-gray-500 text-sm font-medium">Hoặc tiếp tục với</span>
              </div>
            </motion.div>

            {/* Social Login */}
            <motion.div custom={5} variants={inputVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-slate-800/50 border border-slate-700 hover:border-red-500/50 text-white py-3 rounded-xl flex items-center justify-center space-x-2 transition duration-300 group"
              >
                <FaGoogle size={18} className="group-hover:text-red-400 transition" />
                <span className="text-sm font-semibold">Google</span>
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-slate-800/50 border border-slate-700 hover:border-red-500/50 text-white py-3 rounded-xl flex items-center justify-center space-x-2 transition duration-300 group"
              >
                <FaFacebook size={18} className="group-hover:text-red-400 transition" />
                <span className="text-sm font-semibold">Facebook</span>
              </motion.button>
            </motion.div>

            {/* Register Link */}
            <motion.p custom={6} variants={inputVariants} initial="hidden" animate="visible" className="text-center pt-4">
              <span className="text-gray-400">Chưa có tài khoản? </span>
              <Link to="/register" className="text-red-500 hover:text-red-400 font-bold transition duration-300 inline-flex items-center space-x-1 group">
                <span>Đăng ký ngay</span>
                <FiArrowRight className="group-hover:translate-x-1 transition duration-300" size={16} />
              </Link>
            </motion.p>
          </form>

          {/* Footer Note */}
          <motion.p
            custom={7}
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            className="text-center text-xs text-gray-600 mt-8 pt-8 border-t border-slate-800"
          >
            🔒 Dữ liệu của bạn được bảo mật tuyệt đối trên MartHub
          </motion.p>
        </motion.div>

        {/* Test Accounts Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm"
        >
          <p className="text-gray-400 text-sm">
            <span className="text-white font-semibold">👤 Test Account:</span><br />
            admin@marthub.vn / Admin@123
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
